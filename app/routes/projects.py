from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.orm import Session
from app.models.db import SessionLocal
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.rfp_requirement import RFPRequirement
from app.models.answer import AnswerCard
from app.models.document import Document
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

from datetime import datetime

# Response Models
class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None # Added
    deadline: Optional[str] = None # Added
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

class MemberInviteBody(BaseModel):
    email: str

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None # Added
    deadline: Optional[str] = None # Added (ISO format string)
    industry: Optional[str] = "IT"
    rfp_type: Optional[str] = "general"


from app.models.group import Group

@router.post("", response_model=ProjectResponse)
def create_project(body: ProjectCreate, db: Session = Depends(get_db)):
    # 1. Create a dedicated Group for this project's documents
    group_id = uuid.uuid4()
    new_group = Group(
        id=group_id,
        workspace=WORKSPACE,
        name=f"{body.name} Docs"
    )
    db.add(new_group)
    
    # 2. Create Project linked to the Group
    project_id = uuid.uuid4()
    
    deadline_dt = None
    if body.deadline:
        try:
            deadline_dt = datetime.fromisoformat(body.deadline.replace('Z', '+00:00'))
        except:
            pass

    new_project = Project(
        id=project_id,
        workspace=WORKSPACE,
        group_id=group_id,
        name=body.name,
        description=body.description,
        deadline=deadline_dt,
        industry=body.industry,
        rfp_type=body.rfp_type,
        owner_id=uuid.uuid4(), # Mock owner for now
        status="active"
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    return {
        "id": str(new_project.id),
        "name": new_project.name,
        "description": new_project.description,
        "deadline": new_project.deadline.isoformat() if new_project.deadline else None,
        "industry": new_project.industry,
        "rfp_type": new_project.rfp_type,
        "created_at": new_project.created_at.isoformat() if new_project.created_at else None,
        "status": new_project.status,
        "owner_id": new_project.owner_id,
        "progress": 0,
        "cardsGenerated": 0,
        "requirementsMapped": 0,
        "conflicts": 0,
        "lastActivity": "Just now"
    }

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
        try:
            cards_count = db.query(AnswerCard).filter(AnswerCard.project_id == p.id).count()
        except Exception:
            db.rollback()
            cards_count = 0
        
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
            "description": p.description,
            "deadline": p.deadline.isoformat() if p.deadline else None,
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
        "description": project.description,
        "deadline": project.deadline.isoformat() if project.deadline else None,
        "status": project.status
    }

@router.get("/{project_id}/requirements", response_model=List[RequirementResponse])
def get_project_requirements(project_id: str, db: Session = Depends(get_db)):
    try:
        p_uuid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID format")

    requirements = db.query(RFPRequirement).filter(RFPRequirement.project_id == p_uuid).all()
    
    # Pre-fetch all linked answer cards to get anchors
    linked_card_ids = []
    for req in requirements:
        if req.linked_answer_cards:
            linked_card_ids.extend([uuid.UUID(cid) for cid in req.linked_answer_cards])
            
    card_map = {}
    doc_ids = set()
    if linked_card_ids:
        cards = db.query(AnswerCard).filter(AnswerCard.id.in_(linked_card_ids)).all()
        for c in cards:
            card_map[str(c.id)] = c
            if c.anchors:
                anchors = c.anchors if isinstance(c.anchors, list) else []
                for a in anchors:
                    if "doc_id" in a:
                        try:
                            doc_ids.add(uuid.UUID(a["doc_id"]))
                        except:
                            pass

    # Pre-fetch documents
    doc_map = {}
    if doc_ids:
        docs = db.query(Document).filter(Document.id.in_(doc_ids)).all()
        for d in docs:
            doc_map[str(d.id)] = d.title

    response = []
    for req in requirements:
        # Fetch linked answer if any
        ai_suggestion = ""
        ai_suggestion_full = ""
        score = 0
        sources = []
        past_proposals = []
        
        if req.linked_answer_cards:
            # Just take the first one for now
            first_card_id = req.linked_answer_cards[0]
            card = card_map.get(first_card_id)
            
            if card:
                ai_suggestion = (card.answer[:100] + "...") if len(card.answer) > 100 else card.answer
                ai_suggestion_full = card.answer
                score = int((req.anchor_confidence or 0) * 100)
                
                # Populate sources from anchors
                if card.anchors:
                    anchors_data = card.anchors if isinstance(card.anchors, list) else []
                    for a in anchors_data:
                        doc_title = doc_map.get(a.get("doc_id"), "Unknown Document")
                        sources.append({
                            "text_snippet": doc_title, # Use title as snippet for now as per UI requirement "doc"
                            "page": a.get("page", 1),
                            "doc_id": a.get("doc_id")
                        })
                
                # Populate past proposals
                if card.past_proposals:
                    past_proposals = card.past_proposals if isinstance(card.past_proposals, list) else []

        response.append({
            "id": str(req.id),
            "requirement": (req.requirement_text[:50] + "...") if len(req.requirement_text) > 50 else req.requirement_text,
            "requirementFull": req.requirement_text,
            "status": req.status if req.status else "pending", # Default status
            "aiSuggestion": ai_suggestion,
            "aiSuggestionFull": ai_suggestion_full,
            "score": score,
            "sources": sources, 
            "pastProposals": past_proposals 
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

@router.delete("/{project_id}")
def delete_project(project_id: str, db: Session = Depends(get_db)):
    try:
        p_uuid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
        
    project = db.get(Project, p_uuid)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Delete project (Cascade should handle requirements, but let's be safe)
    # Note: AnswerCards are linked to Project but might be in Library. 
    # Current requirement: Delete project and related requirements.
    
    # 1. Delete Requirements
    db.query(RFPRequirement).filter(RFPRequirement.project_id == p_uuid).delete()
    
    # 2. Delete Project Members
    db.query(ProjectMember).filter(ProjectMember.project_id == p_uuid).delete()
    
    # 3. Delete Project
    db.delete(project)
    db.commit()
    
    return {"status": "deleted", "id": project_id}

@router.patch("/{project_id}/status")
def update_project_status(
    project_id: str, 
    body: StatusUpdateBody,
    db: Session = Depends(get_db)
):
    try:
        p_uuid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
        
    project = db.get(Project, p_uuid)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    project.status = body.status
    db.commit()
    
    return {"status": "success", "new_status": project.status}

@router.post("/{project_id}/members")
def add_project_member(
    project_id: str, 
    body: MemberInviteBody,
    db: Session = Depends(get_db)
):
    try:
        p_uuid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
        
    project = db.get(Project, p_uuid)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Mock implementation: Just return success
    # In real implementation, we would look up user by email and add to ProjectMember
    
    return {"status": "invited", "email": body.email}
