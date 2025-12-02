from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.orm import Session
from app.models.db import SessionLocal
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.rfp_requirement import RFPRequirement
from app.models.answer import AnswerCard
from app.services.auth import verify_manager_role
import uuid
import os
from typing import List, Optional
from pydantic import BaseModel

WORKSPACE = os.getenv("WORKSPACE", "personal")

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
    industry: Optional[str] = None
    rfp_type: Optional[str] = None
    created_at: Optional[str] = None
    owner_id: Optional[str] = None
    progress: int = 0
    cardsGenerated: int = 0
    requirementsMapped: int = 0
    conflicts: int = 0
    lastActivity: Optional[str] = None

class RequirementResponse(BaseModel):
    id: str
    requirement: str
    requirementFull: str
    status: str
    aiSuggestion: str
    aiSuggestionFull: str
    score: int
    sources: List[dict] = []
    pastProposals: List[dict] = []

class StatusUpdateBody(BaseModel):
    status: str

class ResponseUpdateBody(BaseModel):
    response: str

@router.get("", response_model=List[ProjectResponse])
def list_projects(
    user_id: Optional[str] = Query(None), # Filter by user membership
    db: Session = Depends(get_db)
):
    # Base query: Projects in current workspace
    query = db.query(Project).filter(Project.workspace == WORKSPACE)
    
    # If user_id provided, filter by membership
    if user_id:
        try:
            u_uuid = uuid.UUID(user_id)
            # Join with ProjectMember
            query = query.join(ProjectMember).filter(ProjectMember.user_id == u_uuid)
        except ValueError:
            pass # Ignore invalid UUID
            
    projects = query.order_by(Project.created_at.desc()).all()
    
    response = []
    for p in projects:
        # Calculate stats
        # 1. Requirements Mapped
        reqs = db.query(RFPRequirement).filter(RFPRequirement.project_id == p.id).all()
        total_reqs = len(reqs)
        mapped_reqs = sum(1 for r in reqs if r.linked_answer_cards and len(r.linked_answer_cards) > 0)
        
        # 2. Cards Generated (Total AnswerCards for this project)
        cards_count = db.query(AnswerCard).filter(AnswerCard.project_id == p.id).count()
        
        # 3. Progress (Simple heuristic: mapped / total)
        progress = 0
        if total_reqs > 0:
            progress = int((mapped_reqs / total_reqs) * 100)
            
        # 4. Conflicts (Mock for now, or check Ingest logs if we had them linked to project)
        # For MVP, we don't have a direct link from Project to Conflicts easily queryable unless we check AuditLog
        conflicts = 0
        
        # 5. Last Activity (Mock or use updated_at)
        last_activity = "Recently"
        if p.created_at:
            # Simple string formatting
            last_activity = p.created_at.strftime("%Y-%m-%d %H:%M")

        response.append({
            "id": str(p.id),
            "name": p.name,
            "industry": p.industry,
            "rfp_type": p.rfp_type,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "status": p.status,
            "owner_id": p.owner_id,
            "progress": progress,
            "cardsGenerated": cards_count,
            "requirementsMapped": mapped_reqs,
            "conflicts": conflicts,
            "lastActivity": last_activity
        })
    
    return response

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
            "sources": [], 
            "pastProposals": [] 
        })
        
        if req.linked_answer_cards:
            first_card_id = req.linked_answer_cards[0]
            try:
                card = db.get(AnswerCard, uuid.UUID(first_card_id))
                if card:
                    # Populate sources from anchors
                    if card.anchors:
                        # Ensure anchors is a list of dicts
                        anchors_data = card.anchors if isinstance(card.anchors, list) else []
                        response[-1]["sources"] = anchors_data
                    
                    # Populate past proposals
                    if card.past_proposals:
                        proposals_data = card.past_proposals if isinstance(card.past_proposals, list) else []
                        response[-1]["pastProposals"] = proposals_data
            except:
                pass
        
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
    
    req.status = body.status
    db.commit()
    db.refresh(req)
    
    return {"status": "success", "new_status": req.status}

@router.get("/{project_id}/export")
def export_project(project_id: str, db: Session = Depends(get_db)):
    """
    Export project requirements and answers.
    For MVP, returns a JSON structure that could be converted to Excel/Word.
    """
    # Verify project exists
    try:
        p_uuid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
        
    project = db.get(Project, p_uuid)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Fetch requirements
    reqs = db.query(RFPRequirement).filter(RFPRequirement.project_id == p_uuid).all()
    
    # Collect all linked answer card IDs
    all_card_ids = []
    for r in reqs:
        if r.linked_answer_cards:
            # Assuming list of strings
            all_card_ids.extend([uuid.UUID(cid) for cid in r.linked_answer_cards])
            
    # Batch fetch answer cards
    answer_map = {}
    if all_card_ids:
        cards = db.query(AnswerCard).filter(AnswerCard.id.in_(all_card_ids)).all()
        for c in cards:
            answer_map[str(c.id)] = c.answer

    export_data = []
    for r in reqs:
        answer = ""
        if r.linked_answer_cards:
             first_card_id = r.linked_answer_cards[0]
             answer = answer_map.get(first_card_id, "")
        
        export_data.append({
            "req_id": str(r.id),
            "text": r.requirement_text,
            "status": r.status if hasattr(r, 'status') else 'pending', # Handle missing status column in model if any
            "answer": answer
        })
        
    return {"project_id": project_id, "data": export_data}

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
        
    # Logic: Create a new AnswerCard or update the existing linked one?
    # For MVP, we'll create a new AnswerCard if one doesn't exist, or update the first linked one.
    
    from app.models.answer import AnswerCard
    import uuid
    
    # Check if there is already a linked answer card
    linked_card_id = None
    if req.linked_answer_cards and len(req.linked_answer_cards) > 0:
        linked_card_id = req.linked_answer_cards[0]
        
    if linked_card_id:
        # Update existing
        card = db.get(AnswerCard, uuid.UUID(linked_card_id))
        if card:
            card.answer = body.response
            # card.updated_at = ... (auto)
            db.commit()
    else:
        # Create new AnswerCard
        new_card = AnswerCard(
            id=uuid.uuid4(),
            project_id=req.project_id,
            requirement_id=req.id,
            answer=body.response,
            source_documents=[], # Empty for manual edit
            confidence_score=1.0, # User edited, so high confidence
            status="approved" # User wrote it, so implicitly approved or pending? Let's say pending until explicit approval.
        )
        db.add(new_card)
        db.commit()
        db.refresh(new_card)
        
        # Link to requirement
        if not req.linked_answer_cards:
            req.linked_answer_cards = []
        req.linked_answer_cards = req.linked_answer_cards + [str(new_card.id)]
        db.commit()
    
    return {"status": "success"}
