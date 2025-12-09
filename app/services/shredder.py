from typing import List, Dict, Any, Optional
import uuid
import json
import os
from sqlalchemy.orm import Session
from app.models.rfp_requirement import RFPRequirement
from app.models.project import Project
from app.models.project import Project
from app.services.vertex_client import VertexAIClient
from app.utils.debug_logger import log_info, log_debug, log_error, save_debug_artifact

# Initialize Vertex AI Client (Gemini)
vertex_client = VertexAIClient()

from app.services.preprocess import preprocess_structure, flatten_sections, fix_chunk_boundaries, fix_tables

def calculate_shredding_cost(text: str) -> Dict[str, Any]:
    """
    Estimate the cost of shredding the RFP text.
    Uses a simple token estimation (1 token ~= 4 chars).
    Pricing based on gpt-4o-mini (approximate).
    """
    char_count = len(text)
    estimated_tokens = char_count / 4
    
    # Pricing: $0.15 / 1M input tokens, $0.60 / 1M output tokens
    # Assume output is roughly 1/2 of input size for structured requirements
    input_cost = (estimated_tokens / 1_000_000) * 0.15
    output_cost = ((estimated_tokens * 0.5) / 1_000_000) * 0.60
    total_cost_usd = input_cost + output_cost
    
    # Exchange rate assumption: 1 USD = 1400 KRW
    total_cost_krw = total_cost_usd * 1400

    return {
        "char_count": char_count,
        "estimated_tokens": int(estimated_tokens),
        "estimated_cost_usd": round(total_cost_usd, 6),
        "estimated_cost_krw": round(total_cost_krw, 2)
    }

def shred_rfp(db: Session, project_id: str, rfp_text: str) -> List[RFPRequirement]:
    """
    Decompose RFP text into individual requirements using LLM.
    Also extracts Project Summary and Deadline.
    Saves requirements to the database and updates Project metadata.
    """
    project = db.get(Project, uuid.UUID(project_id))
    if not project:
        raise ValueError(f"Project {project_id} not found")

    log_info(f"[Service] Starting shred_rfp for project {project_id}. Text length: {len(rfp_text)}")

    # --- Preprocessing Pipeline Start ---
    log_info("[Shredder] Starting Preprocessing Pipeline (GPT-5.1)")
    
    # Step A: Structure Reconstruction
    structured = preprocess_structure(rfp_text)
    save_debug_artifact("preprocess_structure.json", structured)
    
    # Fallback if structure is empty
    if not structured.get("sections"):
        log_info("[Shredder] Structure reconstruction returned empty. Falling back to raw text.")
        normalized_text = rfp_text
    else:
        # Optional Step B: Chunk Boundary Fix (Example usage, though we don't strictly split chunks here yet)
        # chunks = fix_chunk_boundaries(structured) 
        
        # Optional Step C: Table Fix (if needed, can be called on raw text or parts)
        # tables = fix_tables(rfp_text)

        # Flatten back to string
        normalized_text = flatten_sections(structured)
        save_debug_artifact("preprocess_normalized.md", normalized_text)
        log_info(f"[Shredder] Preprocessing complete. Normalized text length: {len(normalized_text)}")
    # --- Preprocessing Pipeline End ---

    prompt = f"""
    You are an expert RFP analyst. Your task is to analyze the following RFP text and extract key information.
    
    IMPORTANT: 
    1. Detect the language of the 'RFP Text' below.
    2. If the RFP is in Korean, generate the 'summary' and 'requirement_text' in Korean.
    3. If the RFP is in English, generate the 'summary' and 'requirement_text' in English.
    4. Maintain the original terminology as much as possible.

    RFP Text:
    {normalized_text[:15000]} ... (truncated if too long)
    
    Output Format (JSON):
    {{
        "summary": "A brief 1-2 sentence summary of what this project is about (in the same language as RFP).",
        "deadline": "YYYY-MM-DDTHH:MM:SS" (ISO 8601 format if found, else null),
        "requirements": [
            {{
                "requirement_text": "The system must support 2FA (in the same language as RFP).",
                "requirement_type": "security",
                "compliance_level": "YES"
            }},
            ...
        ]
    }}
    
    Extract as many specific requirements as possible.
    """
    
    # ✅ 3) LLM에 전달되는 Prompt 앞부분(프리뷰) 로그
    log_debug(f"[LLM] prompt_preview: {prompt[:1000]}")
    
    # ✅ 5) LLM 입력 텍스트(head/tail) 로그 (normalized_text)
    log_debug(f"[LLM] input_text_head: {normalized_text[:1000]}")
    log_debug(f"[LLM] input_text_tail: {normalized_text[-1000:]}")

    # ✅ 4) LLM 호출 파라미터 로그
    log_debug(
        f"[LLM] call_params: model={vertex_client.gemini_model_name}, max_tokens=8192, temperature=0.2"
    )

    try:
        # Use Vertex AI (Gemini)
        content = vertex_client.generate_text(prompt)
        
        # ✅ 6) LLM Raw Response 로그(앞부분)
        log_debug(f"[LLM] raw_response_preview: {content[:1000]}")
        
        result_json = json.loads(content)
        save_debug_artifact("shredder_result.json", result_json)
        
        # ✅ 7) Requirements 추출 전/후 카운트 및 샘플 로그
        log_debug(f"[Shred] parsed_json_keys: {result_json.keys()}")
        requirements_list = result_json.get("requirements", [])
        log_debug(f"[Shred] requirements_extracted_count: {len(requirements_list)}")

        if requirements_list:
            log_debug(f"[Shred] requirement_sample: {requirements_list[:3]}")
        
        # 1. Update Project Metadata
        if "summary" in result_json:
            project.description = result_json["summary"]
        if "deadline" in result_json and result_json["deadline"]:
            try:
                from dateutil import parser
                project.deadline = parser.parse(result_json["deadline"])
            except:
                print(f"Failed to parse deadline: {result_json['deadline']}")
                pass
        
        # 2. Save Requirements
        requirements_data = result_json.get("requirements", [])
        
        created_requirements = []
        for req in requirements_data:
            new_req = RFPRequirement(
                id=uuid.uuid4(),
                project_id=project.id,
                requirement_text=req.get("requirement_text", ""),
                requirement_type=req.get("requirement_type", "general"),
                compliance_level=req.get("compliance_level", "YES"),
                linked_answer_cards=[],
                anchor_confidence=0.0
            )
            db.add(new_req)
            created_requirements.append(new_req)
        
        db.commit()
        
        # 3. Trigger Answer Mapping (Auto-generate answers)
        log_info(f"[Shredder] Triggering auto-mapping for project {project.id}")
        try:
            from app.services.proposal import map_requirements_to_answers
            map_result = map_requirements_to_answers(db, str(project.id))
            log_info(f"[Shredder] Auto-mapping complete: {map_result}")
        except Exception as e:
            log_error(f"[Shredder] Auto-mapping failed: {e}")
            # Don't fail the whole shredding process if mapping fails, just log it.
            
        return created_requirements
            
        return created_requirements

    except Exception as e:
        log_error(f"[Service] Error during shredding: {e}")
        print(f"Error during shredding: {e}")
        raise e
