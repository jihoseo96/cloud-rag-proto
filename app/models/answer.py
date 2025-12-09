# app/models/answer.py
import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, text, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from .db import Base

class AnswerCard(Base):
    __tablename__ = "answer_card"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace = Column(String, nullable=False)
    project_id = Column(UUID(as_uuid=True), nullable=True) # Added project_id
    group_id = Column(UUID(as_uuid=True), ForeignKey("group.id", ondelete="CASCADE"), nullable=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    answer_plain = Column(Text, nullable=True)
    status = Column(String, nullable=False, server_default=text("'draft'"))
    created_by = Column(String, nullable=False)
    reviewed_by = Column(String, nullable=True)
    source_sha256_list = Column(ARRAY(String), nullable=False, server_default=text("ARRAY[]::text[]"))
    anchors = Column(JSONB, nullable=True)
    variants = Column(JSONB, nullable=True)
    facts = Column(JSONB, nullable=True)
    origin = Column(String, server_default=text("'PROJECT'"), nullable=False, default="PROJECT") # 'MINED' | 'PROJECT'
    past_proposals = Column(JSONB, nullable=True, server_default=text("'[]'::jsonb"))
    created_at = Column(TIMESTAMP, server_default=text("now()"))
    updated_at = Column(TIMESTAMP, server_default=text("now()"))

class AnswerChunk(Base):
    __tablename__ = "answer_chunk"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    answer_id = Column(UUID(as_uuid=True), ForeignKey("answer_card.id", ondelete="CASCADE"), nullable=False)
    page = Column(Integer, nullable=False, default=0)
    text = Column(Text, nullable=False)
    embedding = Column(Vector(1536), nullable=False)
    
    answer_card = relationship("AnswerCard", backref="chunks")

class AnswerCardLog(Base):
    __tablename__ = "answer_card_log"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    answer_id = Column(UUID(as_uuid=True), ForeignKey("answer_card.id", ondelete="CASCADE"), nullable=False)
    action = Column(String, nullable=False)      # 'created' | 'updated' | 'approved' | 'archived' | ...
    actor = Column(String, nullable=False)
    note = Column(Text, nullable=True)
    at = Column(TIMESTAMP, server_default=text("now()"))
