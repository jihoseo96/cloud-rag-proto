from typing import List, Optional, Dict, Any
from uuid import UUID
import uuid
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from app.models.answer import AnswerCard
from app.services.guardrail import assess_risk

def create_answer_card(
    db: Session,
    workspace: str,
    group_id: Optional[UUID],
    question: str,
    answer: str,
    created_by: str,
    source_sha256_list: List[str],
    anchors: Optional[List[Dict[str, Any]]] = None,
    facts: Optional[Dict[str, Any]] = None,
    status: str = "pending"
) -> AnswerCard:
    """
    Create a new AnswerCard.
    - Initial answer is added as the first 'variant' (APPROVED by default if created by admin, else PENDING).
    - For MVP, we assume initial creation is 'pending' or 'approved' based on logic. 
    - Let's keep status as 'pending' for review.
    """
    # Create initial variant from the answer text
    initial_variant = {
        "content": answer,
        "context": "default",
        "status": status.upper(), # Initial creation requires review
        "risk_level": assess_risk(answer, facts or {}).get("risk_level", "SAFE"),
        "usage_count": 0,
        "created_by": created_by
    }

    card = AnswerCard(
        id=uuid.uuid4(),
        workspace=workspace,
        group_id=group_id,
        question=question,
        answer=answer, # Main display answer (usually the approved one)
        created_by=created_by,
        source_sha256_list=source_sha256_list,
        status=status,
        anchors=anchors or [],
        facts=facts or {},
        variants=[initial_variant]
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card

def add_variant(
    db: Session,
    answer_id: UUID,
    content: str,
    context: str,
    created_by: str
) -> Optional[AnswerCard]:
    """
    Add a new variant to an existing AnswerCard.
    Risk assessment is performed automatically.
    """
    card = db.get(AnswerCard, answer_id)
    if not card:
        return None

    risk_info = assess_risk(content, card.facts or {})
    
    new_variant = {
        "content": content,
        "context": context,
        "status": "PENDING",
        "risk_level": risk_info.get("risk_level", "SAFE"),
        "risk_reason": risk_info.get("reason", ""),
        "usage_count": 0,
        "created_by": created_by
    }

    # Append to variants list
    # SQLAlchemy requires re-assignment or flag_modified for JSONB mutation detection
    current_variants = list(card.variants) if card.variants else []
    current_variants.append(new_variant)
    card.variants = current_variants
    
    db.commit()
    db.refresh(card)
    return card

def approve_answer_card(
    db: Session,
    answer_id: UUID,
    reviewer: str,
    note: Optional[str] = None
) -> AnswerCard:
    """
    Approve an existing AnswerCard.
    Also marks the latest PENDING variant as APPROVED.
    """
    card = db.get(AnswerCard, answer_id)
    if not card:
        raise ValueError(f"AnswerCard {answer_id} not found")
    
    card.status = "approved"
    card.reviewed_by = reviewer
    
    # Approve the latest pending variant if any
    if card.variants:
        variants = list(card.variants)
        for v in reversed(variants):
            if v.get("status") == "PENDING":
                v["status"] = "APPROVED"
                v["approved_by"] = reviewer
                # Update main answer text to this approved variant
                card.answer = v["content"]
                break
        card.variants = variants

    db.commit()
    db.refresh(card)
    return card