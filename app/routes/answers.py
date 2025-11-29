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
    db: Session = Depends(get_db),
):
    q = db.query(AnswerCard).filter(AnswerCard.workspace == WORKSPACE)
    if group_id:
        q = q.filter(AnswerCard.group_id == group_id)
    if status:
        q = q.filter(AnswerCard.status == status)

    cards = q.order_by(AnswerCard.created_at.desc()).limit(100).all()
    return [
        {
            "id": str(c.id),
            "question": c.question,
            "answer": c.answer,
            "status": c.status,
            "created_by": c.created_by,
            "reviewed_by": c.reviewed_by,
            "created_at": c.created_at,
            "variants": c.variants,
            "anchors": c.anchors,
            "facts": c.facts
        }
        for c in cards
    ]