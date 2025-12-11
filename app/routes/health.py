# app/routes/health.py
from fastapi import APIRouter
from sqlalchemy import text
from app.models.db import engine, SessionLocal
from app.services.ingest import storage_client, GCS_BUCKET_NAME
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


def _check_gcs() -> dict:
    """
    GCS 연결 확인:
    1) GCS_BUCKET_NAME이 설정되어 있는지
    2) 버킷 접근 가능한지
    """
    if not GCS_BUCKET_NAME:
        return {"ok": False, "detail": "GCS_BUCKET_NAME env not set"}

    started = time.time()
    try:
        # 1) 버킷 접근 확인
        bucket = storage_client.bucket(GCS_BUCKET_NAME)
        if not bucket.exists():
             return {"ok": False, "detail": f"GCS bucket not found: {GCS_BUCKET_NAME}"}

        elapsed = int((time.time() - started) * 1000)
        return {"ok": True, "detail": f"gcs ok (bucket={GCS_BUCKET_NAME}, {elapsed} ms)"}
    except Exception as e:
        return {"ok": False, "detail": f"gcs error: {e}"}


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
    gcs_result = _check_gcs()
    openai_result = _check_openai()

    all_ok = db_result["ok"] and gcs_result["ok"] and openai_result["ok"]
    status = "ok" if all_ok else "degraded"

    return {
        "status": status,
        "checks": {
            "db": db_result,
            "gcs": gcs_result,
            "openai": openai_result,
        },
        "meta": {
            "workspace": os.getenv("WORKSPACE", "personal"),
            "region": REGION,
            "env": os.getenv("ENV", "local"),
        },
    }
