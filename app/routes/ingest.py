from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Request
from sqlalchemy.orm import Session
from app.models.db import SessionLocal
from app.services.ingest import ingest_document
import os
from typing import Optional

router = APIRouter(prefix="/ingest", tags=["ingest"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

WORKSPACE = os.getenv("WORKSPACE", "personal")

@router.post("/upload")
async def upload_and_ingest(
    file: UploadFile = File(...),
    group_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload a file for ingestion.
    - Parses the file (PDF/HWP/Text)
    - Computes SHA256 hash
    - Checks for conflicts (duplicate files)
    - Returns parsing result or conflict details
    """
    try:
        content = await file.read()
        result = ingest_document(
            db=db,
            file_bytes=content,
            filename=file.filename,
            workspace=WORKSPACE,
            group_id=group_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")
