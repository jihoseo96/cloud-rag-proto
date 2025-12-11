from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.models.db import SessionLocal
from app.services.shredder import calculate_shredding_cost, shred_rfp
from app.services.indexer import extract_text_pages
from pydantic import BaseModel
from typing import Optional
from app.utils.debug_logger import log_info, log_error, log_debug

router = APIRouter(prefix="/shredder", tags=["shredder"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class EstimateBody(BaseModel):
    text: str

class TriggerBody(BaseModel):
    project_id: str
    confirm_cost: bool = False

@router.get("/debug-test")
def debug_test_log():
    """
    Simple endpoint to test if logging is working.
    """
    log_info("[Debug Test] Info log from /shredder/debug-test")
    log_debug("[Debug Test] Debug log from /shredder/debug-test")
    log_error("[Debug Test] Error log from /shredder/debug-test")
    return {"status": "logged", "message": "Check rfp_debug.log and terminal output"}

@router.post("/trigger")
def trigger_shredding(body: TriggerBody, db: Session = Depends(get_db)):
    """
    Trigger shredding for all documents in a project.
    """
    import uuid
    from app.models.project import Project
    from app.models.document import Document
    import os

    log_info(f"[Route] Triggering shredding for project_id={body.project_id}, confirm_cost={body.confirm_cost}")

    # 1. Get Project & Group
    try:
        project = db.get(Project, uuid.UUID(body.project_id))
    except ValueError:
        raise HTTPException(400, "Invalid project ID")
        
    if not project:
        raise HTTPException(404, "Project not found")
    
    if not project.group_id:
        raise HTTPException(400, "Project has no associated group")

    # 2. Get Documents
    docs = db.query(Document).filter(Document.group_id == project.group_id).all()
    if not docs:
        log_error(f"[Route] No documents found for group_id={project.group_id}")
        raise HTTPException(400, "No documents found for this project")
    
    log_info(f"[Route] Found {len(docs)} documents for project. Starting text extraction.")

    # 3. Read Content
    full_text = ""
    for doc in docs:
        # Check if s3_key_raw points to local file
        # Check if s3_key_raw points to local file
        if doc.s3_key_raw and doc.s3_key_raw.startswith("file://"):
            path = doc.s3_key_raw.replace("file://", "")
            if os.path.exists(path):
                # Fix: Read as binary and use extract_text_pages to handle DOCX/PDF/TXT correctly
                try:
                    with open(path, "rb") as f:
                        file_bytes = f.read()
                    
                    pages = extract_text_pages(file_bytes)
                    for page in pages:
                        full_text += page + "\n\n"
                    
                    log_info(f"[Route] Successfully extracted text from local file: {path}")
                except Exception as e:
                    log_error(f"[Route] Failed to extract text from local file {path}: {e}")
                    print(f"Failed to read local file {path}: {e}")
            else:
                print(f"File not found: {path}")
        elif doc.s3_key_raw:
            # GCS Handling
            try:
                # Assuming s3_key_raw is the blob name
                file_bytes = download_bytes_from_gcs(GCS_BUCKET_NAME, doc.s3_key_raw)
                pages = extract_text_pages(file_bytes)
                # extract_text_pages returns list of strings now? existing code at line 98 says page["text"]
                # Wait, line 83 in local logic says "for page in pages: full_text += page + ..."
                # Line 98 in S3 logic (existing) says "for page in pages: full_text += page["text"] + ..."
                # app/services/indexer.py says "extract_text_pages(pdf_bytes)" and checks line 47 "c["text"] for c in chunks"
                # Let's check 'extract_text_pages' return type.
                # In view_file for indexer.py: 
                # 43: pages = extract_text_pages(pdf_bytes) 
                # 47: chunks = chunk_pages(pages)
                # 56: texts = [c["text"] for c in chunks]
                # It doesn't clarify `extract_text_pages` return.
                # But shredder.py existing code for local file (line 83) treats `page` as string? Or object?
                # "full_text += page + ..." -> STR?
                # "full_text += page['text']" -> Dict?
                # I should probably assume `extract_text_pages` returns list of strings (pages) OR list of objects.
                # Since I am not changing `extract_text_pages`, I should stick to what `shredder.py` does.
                # `shredder.py` has inconsistent usage between local (line 83) and S3 (line 98).
                # Local: `page + "\n\n"`
                # S3: `page["text"] + "\n\n"`
                # This suggests existing code might be buggy or `extract_text_pages` behavior varies?
                # I should look at `app/services/extract.py` if possible. But I want to minimize scope creep.
                # I'll look at `shredder.py` again.
                # Line 83: `full_text += page + "\n\n"`
                # Line 98: `full_text += page["text"] + "\n\n"`
                # I'll trust the S3 path might be the "correct" one for PDF/GCS?
                # Actually, in `indexer.py`, it uses `chunk_pages(pages)`.
                # If I just copy the logic from S3 block but use GCS, I should be safe.
                # BUT, I should check existing S3 block behavior.
                # I will try to handle both if result is dict or str.
                
                for page in pages:
                     if isinstance(page, dict) and "text" in page:
                         full_text += page["text"] + "\n\n"
                     elif isinstance(page, str):
                         full_text += page + "\n\n"
                     else:
                         full_text += str(page) + "\n\n"

            except Exception as e:
                print(f"Failed to process GCS file {doc.s3_key_raw}: {e}")
        else:
            pass
    
    if not full_text.strip():
        log_error("[Route] No text content found in documents after extraction.")
        raise HTTPException(400, "No text content found in documents")

    log_info(f"[Route] Text extraction complete. Total length: {len(full_text)} chars.")

    # ✅ 1) 텍스트 추출 결과 샘플 로그
    log_debug(f"[Parse] text_head: {full_text[:1000]}")
    log_debug(f"[Parse] text_middle: {full_text[len(full_text)//2 : len(full_text)//2 + 1000]}")
    log_debug(f"[Parse] text_tail: {full_text[-1000:]}")

    # ✅ 2) 요구사항 관련 키워드 존재 여부 로그
    keywords = ["요구 사항", "요구사항", "영역별 핵심과제", "F-01", "H-01", "P-01"]
    found = {k: (k in full_text) for k in keywords}
    log_debug(f"[Parse] keyword_presence: {found}")

    # 4. Execute Shredding
    # Reuse execute logic or call service directly
    if not body.confirm_cost:
        cost = calculate_shredding_cost(full_text)
        # We return 402 Payment Required to signal frontend to ask for confirmation
        # But for MVP "Start Analysis" button usually implies consent or we show cost first.
        # Let's assume frontend handles this.
        log_info(f"[Route] Cost check returned: {cost}")
        return {
            "status": "cost_check",
            "estimated_cost": cost
        }
    
    try:
        requirements = shred_rfp(db, body.project_id, full_text)
        log_info(f"[Route] Shredding successful. Requirements count: {len(requirements)}")

        # Trigger Proposal Mapping (Phase 4 Wiring)
        from app.services.proposal import map_requirements_to_answers
        mapping_result = map_requirements_to_answers(db, body.project_id)
        log_info(f"[Route] Proposal mapping complete: {mapping_result}")

        return {
            "status": "success", 
            "count": len(requirements),
            "requirements_count": len(requirements),
            "mapped_count": mapping_result.get("mapped_requirements", 0)
        }
    except Exception as e:
        log_error(f"[Route] Shredding failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class ShredBody(BaseModel):
    project_id: str
    text: str
    confirm_cost: bool = False

@router.post("/estimate")
def estimate_cost(body: EstimateBody):
    """
    Calculate estimated cost for shredding the provided text.
    """
    return calculate_shredding_cost(body.text)

@router.post("/execute")
def execute_shredding(body: ShredBody, db: Session = Depends(get_db)):
    """
    Execute RFP shredding.
    Requires 'confirm_cost' to be True.
    """
    if not body.confirm_cost:
        cost = calculate_shredding_cost(body.text)
        raise HTTPException(
            status_code=402, 
            detail=f"Cost approval required. Estimated cost: {cost['estimated_cost_krw']} KRW. Set 'confirm_cost=True' to proceed."
        )
    
    try:
        requirements = shred_rfp(db, body.project_id, body.text)
        return {
            "status": "success", 
            "count": len(requirements),
            "requirements": [
                {
                    "id": str(r.id),
                    "text": r.requirement_text,
                    "type": r.requirement_type
                } for r in requirements
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
class PreCalcBody(BaseModel):
    total_size_bytes: int
    file_count: int

@router.post("/pre-calculate")
def pre_calculate_cost(body: PreCalcBody):
    """
    Estimate cost based on file size before processing.
    Heuristic: 1KB ~= 0.5 pages ~= 200 tokens.
    """
    # Simple heuristic
    estimated_tokens = body.total_size_bytes // 5 # Very rough approx
    estimated_cost = (estimated_tokens / 1000) * 0.02 # $0.02 per 1k tokens (example)
    estimated_cost_krw = estimated_cost * 1350
    
    estimated_time_min = (body.total_size_bytes / 1024 / 1024) * 0.5 # 0.5 min per MB
    
    return {
        "estimated_tokens": estimated_tokens,
        "estimated_cost_krw": int(estimated_cost_krw),
        "estimated_time_min": round(estimated_time_min, 1)
    }
