# app/routes/chats.py
from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.db import SessionLocal
from app.models.chat import Chat

router = APIRouter(prefix="/chats", tags=["chats"])

# DB 세션 의존성
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 임시 로그인 유저 (MVP에서는 하드코딩)
def get_current_user_id():
    return "demo-user"

class ChatCreateBody(BaseModel):
    group_id: UUID
    title: Optional[str] = None

@router.get("")
def list_my_chats(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    현재 유저가 가진 채팅 목록을 반환.
    """
    chats = (
        db.query(Chat)
        .filter(Chat.user_id == user_id)
        .order_by(Chat.last_updated.desc())
        .all()
    )
    # 그대로 리턴해도 FastAPI가 직렬화해주지만, 명시적으로 정리
    return [
        {
            "id": str(c.id),
            "group_id": str(c.group_id) if c.group_id else None,
            "title": c.title,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "last_updated": c.last_updated.isoformat() if c.last_updated else None,
        }
        for c in chats
    ]

@router.post("")
def create_chat(
    body: ChatCreateBody,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    새 채팅 생성
    """
    chat = Chat(
        user_id=user_id,
        group_id=body.group_id,
        title=body.title or "새 대화",
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)

    return {
        "id": str(chat.id),
        "group_id": str(chat.group_id) if chat.group_id else None,
        "title": chat.title,
        "created_at": chat.created_at.isoformat() if chat.created_at else None,
        "last_updated": chat.last_updated.isoformat() if chat.last_updated else None,
    }
