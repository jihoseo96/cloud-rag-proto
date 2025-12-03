from sqlalchemy import create_engine, inspect
import os

DATABASE_URL = "postgresql+psycopg://rag:ragpw@localhost:5432/ragdb"
engine = create_engine(DATABASE_URL)
inspector = inspect(engine)

print("Constraints on 'document' table:")
for constraint in inspector.get_unique_constraints("document"):
    print(constraint)

print("\nIndexes on 'document' table:")
for index in inspector.get_indexes("document"):
    print(index)
