from typing import List, Dict, Any, Optional
import uuid
import json
import os
from sqlalchemy.orm import Session
from app.models.rfp_requirement import RFPRequirement
from app.models.project import Project
from openai import OpenAI

# Initialize OpenAI Client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
CHAT_MODEL = os.getenv("CHAT_MODEL", "gpt-4o-mini")

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
    Saves requirements to the database.
    """
    project = db.get(Project, uuid.UUID(project_id))
    if not project:
        raise ValueError(f"Project {project_id} not found")

    prompt = f"""
    You are an expert RFP analyst. Your task is to decompose the following RFP text into individual, atomic requirements.
    
    RFP Text:
    {rfp_text[:10000]} ... (truncated if too long)
    
    Output Format (JSON List):
    [
        {{
            "requirement_text": "The system must support 2FA.",
            "requirement_type": "security",
            "compliance_level": "YES" (default)
        }},
        ...
    ]
    
    Extract as many specific requirements as possible.
    """

    try:
        response = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful assistant that extracts requirements from RFP documents."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        result_json = json.loads(content)
        requirements_data = result_json.get("requirements", [])
        
        # If the LLM returns a direct list instead of {"requirements": [...]}, handle it
        if isinstance(result_json, list):
            requirements_data = result_json

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
        return created_requirements

    except Exception as e:
        print(f"Error during shredding: {e}")
        raise e
