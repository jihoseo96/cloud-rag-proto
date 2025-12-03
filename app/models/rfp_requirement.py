import uuid
from sqlalchemy import Column, String, Text, TIMESTAMP, text, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
from .db import Base

class RFPRequirement(Base):
    __tablename__ = "rfp_requirement"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("project.id", ondelete="CASCADE"), nullable=False)
    requirement_text = Column(Text, nullable=False)
    requirement_type = Column(String, nullable=True)
    compliance_level = Column(String, nullable=True) # YES | PARTIAL | NO
    linked_answer_cards = Column(JSONB, nullable=True) # List of UUIDs
    anchor_confidence = Column(Float, nullable=True)
    status = Column(String, default="pending", nullable=False)
    created_at = Column(TIMESTAMP, server_default=text("now()"))
