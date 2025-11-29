from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.models.db import SessionLocal
from app.services.proposal import map_requirements_to_answers, generate_skeleton
from pydantic import BaseModel

router = APIRouter(prefix="/proposal", tags=["proposal"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class MapBody(BaseModel):
    project_id: str

class GenerateBody(BaseModel):
    project_id: str
    template_id: str = "default"

@router.post("/map")
def map_requirements(body: MapBody, db: Session = Depends(get_db)):
    """
    Trigger mapping of requirements to answer cards.
    """
    try:
        result = map_requirements_to_answers(db, body.project_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate")
def generate_proposal(body: GenerateBody, db: Session = Depends(get_db)):
    """
    Generate proposal skeleton.
    """
    try:
        result = generate_skeleton(db, body.project_id, body.template_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
