from sqlalchemy import Column, String, TIMESTAMP, text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .db import Base

class Group(Base):
    __tablename__ = "group"
    id = Column(UUID(as_uuid=True), primary_key=True)
    workspace = Column(String, nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, server_default=text("now()"))

class GroupMember(Base):
    __tablename__ = "group_member"
    id = Column(UUID(as_uuid=True), primary_key=True)
    group_id = Column(UUID(as_uuid=True), ForeignKey("group.id", ondelete="CASCADE"), nullable=False)
    user_email = Column(String, nullable=False)
    role = Column(String, nullable=False)  # 'admin' or 'member'
    created_at = Column(TIMESTAMP, server_default=text("now()"))

class GroupInstruction(Base):
    __tablename__ = "group_instruction"
    id = Column(UUID(as_uuid=True), primary_key=True)
    group_id = Column(UUID(as_uuid=True), ForeignKey("group.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    instruction = Column(String, nullable=False)
    updated_at = Column(TIMESTAMP, server_default=text("now()"))
