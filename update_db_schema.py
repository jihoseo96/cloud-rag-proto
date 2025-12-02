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
    
    print("Database schema updated successfully.")
