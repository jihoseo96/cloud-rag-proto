# app/routes/answers.py
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from uuid import UUID
import os

from sqlalchemy.orm import Session
from app.models.db import SessionLocal
from app.models.answer import AnswerCard
from app.services.answers import create_answer_card, approve_answer_card, add_variant

router = APIRouter(prefix="/answers", tags=["answers"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

WORKSPACE = os.getenv("WORKSPACE", "personal")

class AnswerCitation(BaseModel):
    document_id: Optional[str] = None
    page: Optional[int] = None
    sha256: Optional[str] = None

class AnswerCreateBody(BaseModel):
    group_id: Optional[UUID] = None
    question: str
    answer: str
    citations: List[AnswerCitation] = []
    created_by: str
    anchors: List[Dict[str, Any]] = []
    facts: Dict[str, Any] = {}

class VariantCreateBody(BaseModel):
    content: str
    context: str = "default"
    created_by: str

@router.post("")
def create_answer(body: AnswerCreateBody, db: Session = Depends(get_db)):
    # group_id는 optional
    gid = body.group_id

    # 일단은 sha256 리스트는 옵션: 나중에 document.sha256 붙인 후 활용
    source_sha256_list = [c.sha256 for c in body.citations if c.sha256]

    card = create_answer_card(
        db=db,
        workspace=WORKSPACE,
        group_id=gid,
        question=body.question,
        answer=body.answer,
        created_by=body.created_by,
        source_sha256_list=source_sha256_list,
        anchors=body.anchors,
        facts=body.facts
    )
    return {"id": str(card.id), "status": card.status}

class ApproveBody(BaseModel):
    reviewed_by: str
    note: Optional[str] = None

@router.post("/{answer_id}/approve")
def approve_answer(answer_id: UUID, body: ApproveBody, db: Session = Depends(get_db)):
    try:
        card = approve_answer_card(db, answer_id, reviewer=body.reviewed_by, note=body.note)
    except ValueError:
        raise HTTPException(404, "answer_card not found")
    return {"id": str(card.id), "status": card.status}

@router.put("/{answer_id}/variant")
def add_answer_variant(answer_id: UUID, body: VariantCreateBody, db: Session = Depends(get_db)):
    card = add_variant(
        db=db,
        answer_id=answer_id,
        content=body.content,
        context=body.context,
        created_by=body.created_by
    )
    if not card:
        raise HTTPException(404, "answer_card not found")
    
    return {"id": str(card.id), "variants": card.variants}

@router.get("")
def list_answers(
    group_id: Optional[UUID] = Query(None),
    status: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(AnswerCard).filter(AnswerCard.workspace == WORKSPACE)
    if group_id:
        query = query.filter(AnswerCard.group_id == group_id)
    if status:
        query = query.filter(AnswerCard.status == status)
    if q:
        # Simple case-insensitive search
        search_term = f"%{q}%"
        query = query.filter(
            (AnswerCard.question.ilike(search_term)) | 
            (AnswerCard.answer.ilike(search_term))
        )

    cards = query.order_by(AnswerCard.created_at.desc()).limit(100).all()
    
    results = []
    for c in cards:
        # Calculate usage stats
        usage_count = len(c.past_proposals) if c.past_proposals else 0
        last_used = None
        if c.past_proposals:
            # Assuming past_proposals has 'date' field in ISO format
            dates = [p.get('date') for p in c.past_proposals if p.get('date')]
            if dates:
                last_used = max(dates)

        results.append({
            "id": str(c.id),
            "question": c.question,
            "answer": c.answer,
            "status": c.status,
            "created_by": c.created_by,
            "reviewed_by": c.reviewed_by,
            "created_at": c.created_at,
            "variants": c.variants,
            "anchors": c.anchors,
            "facts": c.facts,
            "past_proposals": c.past_proposals,
            
            # Frontend specific fields
            "topic": c.question, # Map question to topic
            "summary": c.answer[:100] + "..." if len(c.answer) > 100 else c.answer,
            "usageCount": usage_count,
            "lastUsed": last_used
        })
    
    return results

class AnswerUpdateBody(BaseModel):
    answer: Optional[str] = None
    question: Optional[str] = None
    status: Optional[str] = None

@router.patch("/{answer_id}")
def update_answer(answer_id: UUID, body: AnswerUpdateBody, db: Session = Depends(get_db)):
    card = db.get(AnswerCard, answer_id)
    if not card:
        raise HTTPException(404, "AnswerCard not found")
    
    if body.answer is not None:
        card.answer = body.answer
    if body.question is not None:
        card.question = body.question
    if body.status is not None:
        card.status = body.status
        
    db.commit()
    db.refresh(card)
    return {"id": str(card.id), "status": card.status}

class UsageBody(BaseModel):
    project_id: str
    doc_name: str
    page: int
    date: str # ISO format

@router.post("/{answer_id}/usage")
def record_usage(answer_id: UUID, body: UsageBody, db: Session = Depends(get_db)):
    """
    Record that an answer card was used in a proposal.
    """
    card = db.get(AnswerCard, answer_id)
    if not card:
        raise HTTPException(404, "AnswerCard not found")
    
    current_history = card.past_proposals or []
    # Append new usage
    new_record = {
        "project_id": body.project_id,
        "doc_name": body.doc_name,
        "page": body.page,
        "date": body.date
    }
    # In a real app, we might want to avoid duplicates or limit size
    current_history.append(new_record)
    
    # SQLAlchemy needs explicit flag for JSON mutation sometimes, or re-assignment
    card.past_proposals = list(current_history)
    db.commit()
    
    return {"status": "success", "usage_count": len(card.past_proposals)}