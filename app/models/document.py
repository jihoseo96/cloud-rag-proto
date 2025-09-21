from sqlalchemy import Column, String, TIMESTAMP, text
from sqlalchemy.dialects.postgresql import UUID
from .db import Base

class Document(Base):
    __tablename__ = "document"
    id = Column(UUID(as_uuid=True), primary_key=True)
    workspace = Column(String, nullable=False)
    s3_key_raw = Column(String, nullable=False)
    title = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, server_default=text("now()"))