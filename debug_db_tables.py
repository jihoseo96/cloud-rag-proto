from sqlalchemy import inspect
from dotenv import load_dotenv
load_dotenv()
from app.db import get_engine

def list_tables():
    engine = get_engine()
    inspector = inspect(engine)
    print("Tables in DB:", inspector.get_table_names())

if __name__ == "__main__":
    list_tables()
