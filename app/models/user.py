from sqlalchemy import Column, String, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
import uuid
from .db import Base

class AppUser(Base):
    __tablename__ = "app_user"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    workspace = Column(String, nullable=False, index=True)
    role = Column(String, nullable=False, default="member") # admin, manager, member, viewer
    status = Column(String, nullable=False, default="pending") # active, pending, inactive
    joined_at = Column(DateTime, server_default=text("now()"))
    last_active = Column(DateTime, nullable=True)
    avatar = Column(String, nullable=True)
