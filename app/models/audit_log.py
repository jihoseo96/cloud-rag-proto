import uuid
from sqlalchemy import Column, String, Text, TIMESTAMP, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from .db import Base

class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity_type = Column(String, nullable=False) # answer_card | variant | conflict | upload
    entity_id = Column(UUID(as_uuid=True), nullable=False)
    action = Column(String, nullable=False) # approve | reject | edit | upload
    user_id = Column(String, nullable=False)
    timestamp = Column(TIMESTAMP, server_default=text("now()"))
    diff_snapshot = Column(JSONB, nullable=True)
