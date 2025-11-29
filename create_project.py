from dotenv import load_dotenv
load_dotenv() # Must be first

import uuid
from sqlalchemy.orm import Session
from app.models.db import SessionLocal
from app.models.project import Project
from app.models.group import Group # Needed for FK resolution

def create_dummy_project():
    db = SessionLocal()
    try:
        project_id = uuid.uuid4()
        project = Project(
            id=project_id,
            workspace="personal",
            name="Test Project for Phase 2",
            industry="IT",
            rfp_type="general",
            owner_id=uuid.uuid4() # Dummy owner
        )
        db.add(project)
        db.commit()
        print(f"Created Project: {project_id}")
        return str(project_id)
    except Exception as e:
        print(f"Error creating project: {e}")
        return None
    finally:
        db.close()

if __name__ == "__main__":
    create_dummy_project()
