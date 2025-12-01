from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.db import SessionLocal
from app.models.audit_log import AuditLog
from app.models.answer import AnswerCard
from app.services.auth import verify_manager_role
from datetime import datetime, timedelta

router = APIRouter(prefix="/admin", tags=["admin"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/cost")
def get_cost_dashboard(db: Session = Depends(get_db)):
    """
    Calculate estimated cost based on usage.
    For MVP, we'll aggregate from AuditLogs or just mock based on project count.
    """
    # Mock calculation: 100 KRW per Action
    total_actions = db.query(AuditLog).count()
    estimated_cost = total_actions * 100
    
    return {
        "period": "current_month",
        "total_tokens": total_actions * 500, # Mock 500 tokens per action
        "estimated_cost_krw": estimated_cost,
        "currency": "KRW"
    }

@router.get("/health/anchors")
def get_anchor_health(db: Session = Depends(get_db)):
    """
    Check health of AnswerCard anchors.
    """
    total_cards = db.query(AnswerCard).count()
    # Mock health stats
    return {
        "total_answer_cards": total_cards,
        "parsing_success_rate": 98.5,
        "average_confidence": 0.92,
        "failed_anchors": 0
    }
