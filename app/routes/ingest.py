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
    project_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload a file for ingestion.
    """
    # If project_id is provided, resolve group_id
    if project_id and not group_id:
        from app.models.project import Project
        import uuid
        try:
            proj = db.get(Project, uuid.UUID(project_id))
            if proj:
                group_id = str(proj.group_id)
        except:
            pass

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
from pydantic import BaseModel

class ResolveBody(BaseModel):
    resolution: str # keep_new, keep_old, merge
    filename: str
    group_id: Optional[str] = None
    # In a real app, we'd need the file content again or a temporary ID.
    # For MVP, we'll assume the client re-uploads the file with the resolution flag,
    # OR we store the pending upload in a cache.
    # To keep it stateless and simple for MVP: Client sends file + resolution in a new multipart request.

@router.post("/resolve")
async def resolve_conflict_upload(
    resolution: str = Form(...),
    file: UploadFile = File(...),
    group_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Resolve a conflict by re-uploading with a resolution strategy.
    """
    from app.services.ingest import resolve_conflict
    
    try:
        content = await file.read()
        result = resolve_conflict(
            db=db,
            resolution=resolution,
            file_bytes=content,
            filename=file.filename,
            workspace=WORKSPACE,
            group_id=group_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resolution failed: {str(e)}")
