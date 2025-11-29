import uuid
from sqlalchemy import Column, String, Text, TIMESTAMP, text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from .db import Base

class Project(Base):
    __tablename__ = "project"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace = Column(String, nullable=False)
    group_id = Column(UUID(as_uuid=True), ForeignKey("group.id", ondelete="CASCADE"), nullable=True)
    name = Column(String, nullable=False)
    industry = Column(String, nullable=True)
    rfp_type = Column(String, nullable=True)
    evaluation_criteria = Column(JSONB, nullable=True)
    required_documents = Column(JSONB, nullable=True)
    prohibited_phrases = Column(JSONB, nullable=True)
    created_at = Column(TIMESTAMP, server_default=text("now()"))
    owner_id = Column(String, nullable=True)
