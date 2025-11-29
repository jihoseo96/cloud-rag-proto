# app/models/chat.py
from sqlalchemy import Column, String, TIMESTAMP, text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from .db import Base

class Chat(Base):
    __tablename__ = "chat"

    id = Column(UUID(as_uuid=True), primary_key=True)
    user_id = Column(String, nullable=False)
    group_id = Column(UUID(as_uuid=True), ForeignKey("group.id"), nullable=False)
    title = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, server_default=text("now()"))
    last_updated = Column(TIMESTAMP, server_default=text("now()"))
