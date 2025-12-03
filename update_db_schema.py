from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/dbname")
engine = create_engine(DATABASE_URL)

def add_column_if_not_exists(engine, table_name, column_name, column_type):
    with engine.connect() as conn:
        # Check if column exists
        result = conn.execute(text(f"""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='{table_name}' AND column_name='{column_name}';
        """))
        if result.fetchone():
            print(f"Column {column_name} already exists in {table_name}.")
        else:
            print(f"Adding column {column_name} to {table_name}...")
            conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type};"))
            conn.commit()
            print(f"Column {column_name} added.")

def make_column_nullable(engine, table_name, column_name):
    with engine.connect() as conn:
        print(f"Making {column_name} in {table_name} nullable...")
        conn.execute(text(f"ALTER TABLE {table_name} ALTER COLUMN {column_name} DROP NOT NULL;"))
        conn.commit()
        print(f"Column {column_name} is now nullable.")

if __name__ == "__main__":
    print("Updating database schema...")
    
    # Add parent_id
    add_column_if_not_exists(engine, "document", "parent_id", "UUID")
    
    # Add is_folder
    add_column_if_not_exists(engine, "document", "is_folder", "BOOLEAN DEFAULT FALSE NOT NULL")
    
    # Make s3_key_raw nullable
    make_column_nullable(engine, "document", "s3_key_raw")

    # Add status to project
    add_column_if_not_exists(engine, "project", "status", "TEXT DEFAULT 'active' NOT NULL")
    
    # Add deadline and description to project
    add_column_if_not_exists(engine, "project", "deadline", "TIMESTAMP")
    add_column_if_not_exists(engine, "project", "description", "TEXT")

    # Add status to rfp_requirement
    add_column_if_not_exists(engine, "rfp_requirement", "status", "TEXT DEFAULT 'pending' NOT NULL")

    # Add project_id to answer_card
    add_column_if_not_exists(engine, "answer_card", "project_id", "UUID")

    # Drop unique constraint on document (workspace, sha256) if exists
    # We do this using raw SQL since SQLAlchemy reflection can be tricky with constraints
    try:
        with engine.connect() as conn:
            # Try dropping as constraint
            conn.execute(text("ALTER TABLE document DROP CONSTRAINT IF EXISTS uq_document_workspace_sha256"))
            # Try dropping as index
            conn.execute(text("DROP INDEX IF EXISTS uq_document_workspace_sha256"))
            conn.commit()
            print("Dropped constraint/index uq_document_workspace_sha256")
    except Exception as e:
        print(f"Warning: Could not drop constraint/index: {e}")
    
    print("Database schema updated successfully.")
