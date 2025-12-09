import os
import json
from typing import Dict, Any, List, Optional
from openai import OpenAI
from app.utils.debug_logger import log_info, log_debug, log_error

# Initialize OpenAI Client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
# Use gpt-5.1 as requested for preprocessing
PREPROCESS_MODEL = "gpt-5.1"

def preprocess_structure(text: str) -> Dict[str, Any]:
    """
    Reconstruct the structure of the RFP text using GPT-5.1.
    Detects sections, subsections, tables, and normalizes content.
    """
    log_info(f"[Preprocess] Starting structure reconstruction. Text length: {len(text)}")

    prompt = f"""
    You are an expert in analyzing RFP documents.

    Goal: Reconstruct the structure of the RFP text.

    Tasks:
    1. Detect sections and subsections (I, II, III / 1,2,3 / 가,나,다)
    2. Rebuild section hierarchy
    3. Reconstruct broken tables (convert into JSON tables)
    4. Normalize list items & indent levels
    5. Identify requirement-related blocks
    6. Remove noise/unrelated text

    Output Format (JSON ONLY):
    {{
      "sections": [
        {{
          "title": "Section Title",
          "content": "Main text content of this section",
          "tables": [
            {{
              "columns": ["col1", "col2"],
              "rows": [
                ["value1", "value2"]
              ]
            }}
          ],
          "subsections": [...]
        }}
      ]
    }}

    RFP Text:
    {text[:25000]} ... (truncated if too long)
    """

    try:
        response = client.chat.completions.create(
            model=PREPROCESS_MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful assistant that structures RFP documents."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
            max_completion_tokens=8000
        )
        
        content = response.choices[0].message.content
        log_debug(f"[Preprocess] Raw response preview: {content[:500]}")
        return json.loads(content)

    except Exception as e:
        log_error(f"[Preprocess] Error in structure reconstruction: {e}")
        return {}

def fix_chunk_boundaries(sections_json: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Optional Step B: Suggest optimal chunk boundaries based on structure.
    """
    log_info("[Preprocess] Starting chunk boundary fix.")
    
    prompt = f"""
    Analyze the following structured RFP sections and suggest optimal chunk boundaries.
    Goal: Prevent requirements or tables from being split across chunks.

    Input JSON:
    {json.dumps(sections_json, ensure_ascii=False)[:20000]}

    Output Format (JSON ONLY):
    {{
      "chunks": [
        {{"start_section": 0, "end_section": 1}},
        {{"start_section": 2, "end_section": 4}}
      ]
    }}
    """

    try:
        response = client.chat.completions.create(
            model=PREPROCESS_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert in text chunking."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        content = response.choices[0].message.content
        return json.loads(content).get("chunks", [])
    except Exception as e:
        log_error(f"[Preprocess] Error in chunk boundary fix: {e}")
        return []

def fix_tables(text: str) -> Dict[str, Any]:
    """
    Optional Step C: Reconstruct broken tables from text.
    """
    log_info("[Preprocess] Starting table fix.")
    
    prompt = f"""
    Identify and reconstruct any broken tables in the following text into clean JSON format.

    Text:
    {text[:10000]}

    Output Format (JSON ONLY):
    {{
        "tables": [
            {{
                "columns": ["..."],
                "rows": [["..."]]
            }}
        ]
    }}
    """

    try:
        response = client.chat.completions.create(
            model=PREPROCESS_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert in table reconstruction."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        log_error(f"[Preprocess] Error in table fix: {e}")
        return {}

def flatten_sections(sections_json: Dict[str, Any]) -> str:
    """
    Convert structured JSON back to a single string for the shredder.
    """
    parts = []
    
    def process_section(section):
        title = section.get("title", "")
        if title:
            parts.append(f"## {title}")
        
        content = section.get("content", "")
        if content:
            parts.append(content)
            
        for tbl in section.get("tables", []):
            columns = tbl.get("columns", [])
            if columns:
                parts.append(" | ".join(columns))
                parts.append("|".join(["---"] * len(columns)))
            for row in tbl.get("rows", []):
                parts.append(" | ".join(row))
        
        for sub in section.get("subsections", []):
            process_section(sub)

    for sec in sections_json.get("sections", []):
        process_section(sec)
        
    return "\n\n".join(parts)
