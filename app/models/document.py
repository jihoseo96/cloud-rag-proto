from sqlalchemy import Column, String, TIMESTAMP, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, String, Integer, TIMESTAMP, text, ForeignKey, Boolean
from .db import Base

class Document(Base):
    __tablename__ = "document"
    id = Column(UUID(as_uuid=True), primary_key=True)
    group_id = Column(UUID(as_uuid=True), ForeignKey("group.id"), nullable=True)
    workspace = Column(String, nullable=False)
    s3_key_raw = Column(String, nullable=True) # Nullable for folders
    title = Column(String, nullable=False)
    sha256 = Column(String, nullable=True, index=True)
    created_at = Column(TIMESTAMP, server_default=text("now()"))
    
    # Folder support
    parent_id = Column(UUID(as_uuid=True), ForeignKey("document.id"), nullable=True)
    is_folder = Column(Boolean, default=False, nullable=False)