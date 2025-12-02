from sqlalchemy import Column, String, JSON, DateTime
from app.models.db import Base
import uuid
from datetime import datetime

class GuardrailPolicy(Base):
    __tablename__ = "guardrail_policies"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace = Column(String, index=True, nullable=False)
    
    # JSON fields for flexibility
    risk_policy = Column(JSON, default={})
    prohibited_words = Column(JSON, default=[])
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
