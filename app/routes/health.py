# app/routes/health.py
from fastapi import APIRouter
from sqlalchemy import text
from app.models.db import engine, SessionLocal
from app.services.s3 import S3_BUCKET, REGION, s3
from app.services.embed import embed_texts
import os
import time

router = APIRouter()


def _check_db() -> dict:
    """
    DB 연결이 되는지 간단히 확인:
    - SELECT 1 실행
    """
    started = time.time()
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        elapsed = int((time.time() - started) * 1000)
        return {"ok": True, "detail": f"db ok ({elapsed} ms)"}
    except Exception as e:
        return {"ok": False, "detail": f"db error: {e}"}


def _check_s3() -> dict:
    """
    S3 연결 확인:
    1) S3_BUCKET이 설정되어 있는지
    2) head_bucket 으로 버킷 접근 가능한지
    3) presigned URL 생성 가능한지
    """
    if not S3_BUCKET:
        return {"ok": False, "detail": "S3_BUCKET env not set"}

    started = time.time()
    try:
        # 1) 버킷 접근 확인
        s3.head_bucket(Bucket=S3_BUCKET)

        # 2) presigned URL 생성 (객체가 실제로 존재할 필요는 없음)
        _ = s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": S3_BUCKET, "Key": "healthcheck/dummy"},
            ExpiresIn=60,
        )

        elapsed = int((time.time() - started) * 1000)
        return {"ok": True, "detail": f"s3 ok (bucket={S3_BUCKET}, {elapsed} ms)"}
    except Exception as e:
        return {"ok": False, "detail": f"s3 error: {e}"}


def _check_openai() -> dict:
    """
    OpenAI 임베딩 호출이 실제로 되는지:
    - embed_texts(["health check"]) 한 번 호출
    """
    started = time.time()
    try:
        vecs = embed_texts(["health check"])
        if not vecs or not vecs[0]:
            return {"ok": False, "detail": "embedding returned empty result"}
        dim = len(vecs[0])
        elapsed = int((time.time() - started) * 1000)
        return {"ok": True, "detail": f"openai ok (dim={dim}, {elapsed} ms)"}
    except Exception as e:
        return {"ok": False, "detail": f"openai error: {e}"}


@router.get("/health")
def health():
    """
    통합 헬스 체크:
    - DB
    - S3
    - OpenAI Embedding
    """
    db_result = _check_db()
    s3_result = _check_s3()
    openai_result = _check_openai()

    all_ok = db_result["ok"] and s3_result["ok"] and openai_result["ok"]
    status = "ok" if all_ok else "degraded"

    return {
        "status": status,
        "checks": {
            "db": db_result,
            "s3": s3_result,
            "openai": openai_result,
        },
        "meta": {
            "workspace": os.getenv("WORKSPACE", "personal"),
            "region": REGION,
            "env": os.getenv("ENV", "local"),
        },
    }
