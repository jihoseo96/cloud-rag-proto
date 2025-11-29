from sqlalchemy import Column, String
from .db import Base

class AppUser(Base):
    __tablename__ = "app_user"

    id = Column(String, primary_key=True)
    name = Column(String)
