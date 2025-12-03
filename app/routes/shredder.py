from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.models.db import SessionLocal
from app.services.shredder import calculate_shredding_cost, shred_rfp
from app.services.s3 import get_pdf_bytes
from app.services.indexer import extract_text_pages
from pydantic import BaseModel
from typing import Optional

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

@router.post("/trigger")
def trigger_shredding(body: TriggerBody, db: Session = Depends(get_db)):
    """
    Trigger shredding for all documents in a project.
    """
    import uuid
    from app.models.project import Project
    from app.models.document import Document
    import os

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
        raise HTTPException(400, "No documents found for this project")

    # 3. Read Content
    full_text = ""
    for doc in docs:
        # Check if s3_key_raw points to local file
        # Check if s3_key_raw points to local file
        if doc.s3_key_raw and doc.s3_key_raw.startswith("file://"):
            path = doc.s3_key_raw.replace("file://", "")
            if os.path.exists(path):
                with open(path, "r", encoding="utf-8", errors="ignore") as f:
                    full_text += f.read() + "\n\n"
            else:
                print(f"File not found: {path}")
        elif doc.s3_key_raw:
            # S3 Handling
            try:
                pdf_bytes = get_pdf_bytes(doc.s3_key_raw)
                pages = extract_text_pages(pdf_bytes)
                for page in pages:
                    full_text += page["text"] + "\n\n"
            except Exception as e:
                print(f"Failed to process S3 file {doc.s3_key_raw}: {e}")
        else:
            pass
    
    if not full_text.strip():
        raise HTTPException(400, "No text content found in documents")

    # 4. Execute Shredding
    # Reuse execute logic or call service directly
    if not body.confirm_cost:
        cost = calculate_shredding_cost(full_text)
        # We return 402 Payment Required to signal frontend to ask for confirmation
        # But for MVP "Start Analysis" button usually implies consent or we show cost first.
        # Let's assume frontend handles this.
        return {
            "status": "cost_check",
            "estimated_cost": cost
        }
    
    try:
        requirements = shred_rfp(db, body.project_id, full_text)
        return {
            "status": "success", 
            "count": len(requirements),
            "requirements_count": len(requirements)
        }
    except Exception as e:
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
