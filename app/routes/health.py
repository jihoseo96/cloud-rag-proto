import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.db import SessionLocal

router = APIRouter()  # 모듈화된 라우터

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/health")
def health(db: Session = Depends(get_db)):
    # DB 연결 체크
    try:
        db.execute(text("select 1"))
        db_ok = True
        db_msg = "ok"
    except Exception as e:
        db_ok = False
        db_msg = f"error: {e}"

    return {
        "status": "ok" if db_ok else "degraded",
        "db": db_msg,
        "workspace": os.getenv("WORKSPACE", "personal"),
        "region": os.getenv("REGION", "ap-northeast-2"),
    }
