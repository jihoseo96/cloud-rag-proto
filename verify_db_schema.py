import os
from sqlalchemy import create_engine, inspect, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found")
    exit(1)

engine = create_engine(DATABASE_URL)
inspector = inspect(engine)

def verify_schema():
    print("Verifying Database Schema...")
    
    # Check tables
    tables = inspector.get_table_names()
    print(f"Tables found: {tables}")
    
    expected_tables = ["project", "rfp_requirement", "audit_log", "answer_card"]
    for table in expected_tables:
        if table in tables:
            print(f"✅ Table '{table}' exists.")
        else:
            print(f"❌ Table '{table}' MISSING.")

    # Check columns in answer_card
    if "answer_card" in tables:
        columns = [c["name"] for c in inspector.get_columns("answer_card")]
        print(f"Columns in 'answer_card': {columns}")
        
        expected_columns = ["anchors", "variants", "facts"]
        for col in expected_columns:
            if col in columns:
                print(f"✅ Column '{col}' exists in 'answer_card'.")
            else:
                print(f"❌ Column '{col}' MISSING in 'answer_card'.")
    
    # Check columns in project
    if "project" in tables:
        columns = [c["name"] for c in inspector.get_columns("project")]
        print(f"Columns in 'project': {columns}")

if __name__ == "__main__":
    verify_schema()
