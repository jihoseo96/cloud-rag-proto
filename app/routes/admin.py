from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
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

from app.models.user import AppUser
import uuid

@router.get("/members")
def list_members(db: Session = Depends(get_db)):
    members = db.query(AppUser).filter(AppUser.workspace == WORKSPACE).all()
    return [
        {
            "id": str(m.id),
            "name": m.name,
            "email": m.email,
            "role": m.role,
            "status": m.status,
            "joinedAt": m.joined_at,
            "lastActive": m.last_active,
            "avatar": m.avatar
        }
        for m in members
    ]

class InviteBody(BaseModel):
    email: str
    role: str

@router.post("/invite")
def invite_member(body: InviteBody, db: Session = Depends(get_db)):
    # Check if already exists
    existing = db.query(AppUser).filter(AppUser.email == body.email, AppUser.workspace == WORKSPACE).first()
    if existing:
        return {"status": "already_exists", "id": str(existing.id)}
    
    new_member = AppUser(
        email=body.email,
        name=body.email.split("@")[0], # Default name from email
        workspace=WORKSPACE,
        role=body.role,
        status="pending"
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    
    return {
        "id": str(new_member.id),
        "name": new_member.name,
        "email": new_member.email,
        "role": new_member.role,
        "status": new_member.status,
        "joinedAt": new_member.joined_at
    }

class RoleUpdateBody(BaseModel):
    role: str

@router.patch("/members/{member_id}/role")
def update_member_role(member_id: str, body: RoleUpdateBody, db: Session = Depends(get_db)):
    try:
        m_uuid = uuid.UUID(member_id)
    except:
        raise HTTPException(400, "Invalid ID")
        
    member = db.get(AppUser, m_uuid)
    if not member:
        raise HTTPException(404, "Member not found")
        
    member.role = body.role
    db.commit()
    return {"status": "success", "role": member.role}

@router.delete("/members/{member_id}")
def remove_member(member_id: str, db: Session = Depends(get_db)):
    try:
        m_uuid = uuid.UUID(member_id)
    except:
        raise HTTPException(400, "Invalid ID")
        
    member = db.get(AppUser, m_uuid)
    if not member:
        raise HTTPException(404, "Member not found")
        
    db.delete(member)
    db.commit()
    return {"status": "deleted"}

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
        "status": "healthy",
        "uptime": 3600 * 24 * 10, # 10 days
        "version": "1.0.0",
        "cpuUsage": 45,
        "memoryUsage": 60
    }

@router.get("/system/status")
def get_system_status(db: Session = Depends(get_db)):
    """
    Mock system status for dashboard.
    """
    return {
        "status": "healthy",
        "uptime": 3600 * 24 * 10,
        "version": "1.0.0",
        "cpuUsage": 45,
        "memoryUsage": 60
    }

class GuardrailsBody(BaseModel):
    prohibited_words: List[dict]
    risk_policy: dict

from app.models.guardrail import GuardrailPolicy
import os

WORKSPACE = os.getenv("WORKSPACE", "personal")

@router.get("/guardrails")
def get_guardrails(db: Session = Depends(get_db)):
    policy = db.query(GuardrailPolicy).filter(GuardrailPolicy.workspace == WORKSPACE).first()
    if not policy:
        return {
            "prohibited_words": [],
            "risk_policy": {
                "autoRejectFactMismatch": True,
                "requireApprovalHighRisk": True,
                "confidenceThreshold": [70],
                "minSourceCount": [2]
            }
        }
    return {
        "prohibited_words": policy.prohibited_words,
        "risk_policy": policy.risk_policy
    }

@router.post("/guardrails")
def update_guardrails(body: GuardrailsBody, db: Session = Depends(get_db)):
    policy = db.query(GuardrailPolicy).filter(GuardrailPolicy.workspace == WORKSPACE).first()
    if not policy:
        policy = GuardrailPolicy(
            workspace=WORKSPACE,
            prohibited_words=body.prohibited_words,
            risk_policy=body.risk_policy
        )
        db.add(policy)
    else:
        policy.prohibited_words = body.prohibited_words
        policy.risk_policy = body.risk_policy
    
    db.commit()
    db.refresh(policy)
    return {"status": "success", "updated_at": policy.updated_at.isoformat()}
