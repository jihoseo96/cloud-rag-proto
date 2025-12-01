from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.models.db import SessionLocal
from app.models.project import Project
from app.models.rfp_requirement import RFPRequirement
from app.models.answer import AnswerCard
from app.services.auth import verify_manager_role
import uuid
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/projects", tags=["projects"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Response Models
class ProjectResponse(BaseModel):
    id: str
    name: str
    status: str
    # Add other fields as needed

class RequirementResponse(BaseModel):
    id: str
    requirement: str
    requirementFull: str
    status: str
    aiSuggestion: Optional[str] = None
    aiSuggestionFull: Optional[str] = None
    score: int = 0
    sources: List[dict] = []
    pastProposals: List[dict] = []

class StatusUpdateBody(BaseModel):
    status: str

class ResponseUpdateBody(BaseModel):
    response: str

@router.get("", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    return [
        {
            "id": str(p.id),
            "name": p.name,
            "status": p.status
        } for p in projects
    ]

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    try:
        p_uuid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
        
    project = db.get(Project, p_uuid)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {
        "id": str(project.id),
        "name": project.name,
        "status": project.status
    }

@router.get("/{project_id}/requirements", response_model=List[RequirementResponse])
def get_project_requirements(project_id: str, db: Session = Depends(get_db)):
    try:
        p_uuid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID format")

    requirements = db.query(RFPRequirement).filter(RFPRequirement.project_id == p_uuid).all()
    
    response = []
    for req in requirements:
        # Fetch linked answer if any
        ai_suggestion = ""
        ai_suggestion_full = ""
        score = 0
        
        if req.linked_answer_cards:
            # Just take the first one for now
            first_card_id = req.linked_answer_cards[0]
            try:
                card = db.get(AnswerCard, uuid.UUID(first_card_id))
                if card:
                    ai_suggestion = (card.answer[:100] + "...") if len(card.answer) > 100 else card.answer
                    ai_suggestion_full = card.answer
                    score = int((req.anchor_confidence or 0) * 100)
            except:
                pass

        response.append({
            "id": str(req.id),
            "requirement": (req.requirement_text[:50] + "...") if len(req.requirement_text) > 50 else req.requirement_text,
            "requirementFull": req.requirement_text,
            "status": "pending", # Default status
            "aiSuggestion": ai_suggestion,
            "aiSuggestionFull": ai_suggestion_full,
            "score": score,
            "sources": [], # Placeholder
            "pastProposals": [] # Placeholder
        })
        
    return response

@router.patch("/{project_id}/requirements/{req_id}/status")
def update_requirement_status(
    project_id: str, 
    req_id: str, 
    body: StatusUpdateBody,
    db: Session = Depends(get_db),
    role: str = Depends(verify_manager_role) # RBAC applied
):
    try:
        req_uuid = uuid.UUID(req_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    req = db.get(RFPRequirement, req_uuid)
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")
    
    # In a real app, we would update the status column
    # req.status = body.status
    # db.commit()
    
    return {"status": "success", "new_status": body.status}

@router.post("/{project_id}/requirements/{req_id}/response")
def update_requirement_response(
    project_id: str, 
    req_id: str, 
    body: ResponseUpdateBody,
    db: Session = Depends(get_db)
):
    # This endpoint allows editing response, maybe open to all roles or specific ones
    try:
        req_uuid = uuid.UUID(req_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    req = db.get(RFPRequirement, req_uuid)
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")
        
    # Logic to update response (e.g., create new AnswerCard variant or update existing)
    
    return {"status": "success"}
