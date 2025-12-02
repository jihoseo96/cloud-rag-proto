from sqlalchemy import Column, String, ForeignKey, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from .db import Base

class ProjectMember(Base):
    __tablename__ = "project_member"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("project.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("app_user.id"), nullable=False, index=True)
    role = Column(String, default="editor") # owner, editor, viewer
    joined_at = Column(DateTime, server_default=text("now()"))

    # Relationships
    project = relationship("Project", backref="members")
    user = relationship("AppUser", backref="project_memberships")
