from sqlalchemy import Column, String, Integer, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector
from .db import Base

class Chunk(Base):
    __tablename__ = "chunk"
    id = Column(UUID(as_uuid=True), primary_key=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("document.id"), nullable=False)
    page = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    embedding = Column(Vector(1536), nullable=False)