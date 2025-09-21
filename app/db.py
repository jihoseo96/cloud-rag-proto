import os
from sqlalchemy import create_engine

DATABASE_URL = os.getenv("DATABASE_URL")
# pool_pre_ping=True 로 연결 상태 자동 점검
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
