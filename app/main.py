# app/main.py
import os
import time
import uuid
import json
import logging
from typing import List, Dict, Tuple

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import boto3
from botocore.exceptions import ProfileNotFound, NoCredentialsError, ClientError
from dotenv import load_dotenv
from sqlalchemy import text

# .env 로드
load_dotenv()

from app.routes.health import router as health_router
from app.routes.documents import router as doc_router
from app.routes.query import router as query_router
from app.routes.groups import router as groups_router
from app.routes.answers import router as answers_router
from app.routes.chats import router as chats_router
from app.db import engine
from app.models.db import Base
# Import all models to ensure they are registered with Base.metadata
from app.models.project import Project
from app.models.rfp_requirement import RFPRequirement
from app.models.audit_log import AuditLog
from app.models.answer import AnswerCard
from app.models.guardrail import GuardrailPolicy
from app.models.user import AppUser
from app.models.project_member import ProjectMember

# ---------------------------------------------------------
# 로거 설정
# ---------------------------------------------------------
logger = logging.getLogger("rag_proto")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO)

# ---------------------------------------------------------
# 환경변수
# ---------------------------------------------------------
WORKSPACE = os.getenv("WORKSPACE", "personal")
REGION = os.getenv("REGION", "ap-northeast-2")
RATE_LIMIT_PER_MIN = int(os.getenv("RATE_LIMIT_PER_MIN", "30"))

# ---------------------------------------------------------
# CORS ORIGINS 설정 (A-5)
# ---------------------------------------------------------
def _get_cors_origins() -> List[str]:
    raw = os.getenv("CORS_ORIGINS")
    if raw:
        origins = [o.strip() for o in raw.split(",") if o.strip()]
        if origins:
            return origins

    return [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

app = FastAPI(title="RAG Prototype", version="0.2.0")

CORS_ALLOWED_ORIGINS = _get_cors_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# Safe Migration Logic
# ---------------------------------------------------------
def run_safe_migration():
    """
    Check for missing columns in existing tables and add them if necessary.
    Specifically for 'answer_card' table adding 'anchors', 'variants', 'facts'.
    """
    try:
        with engine.connect() as conn:
            # Check if answer_card table exists
            result = conn.execute(text("SELECT to_regclass('public.answer_card')"))
            if result.scalar() is None:
                return # Table doesn't exist, create_all will handle it

            # Check for 'anchors' column
            result = conn.execute(text(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_name='answer_card' AND column_name='anchors'"
            ))
            if result.fetchone() is None:
                logger.info("Migration: Adding 'anchors' column to answer_card")
                conn.execute(text("ALTER TABLE answer_card ADD COLUMN anchors JSONB"))

            # Check for 'variants' column
            result = conn.execute(text(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_name='answer_card' AND column_name='variants'"
            ))
            if result.fetchone() is None:
                logger.info("Migration: Adding 'variants' column to answer_card")
                conn.execute(text("ALTER TABLE answer_card ADD COLUMN variants JSONB"))

            # Check for 'facts' column
            result = conn.execute(text(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_name='answer_card' AND column_name='facts'"
            ))
            if result.fetchone() is None:
                logger.info("Migration: Adding 'facts' column to answer_card")
                conn.execute(text("ALTER TABLE answer_card ADD COLUMN facts JSONB"))
            
            conn.commit()
    except Exception as e:
        logger.error(f"Migration failed: {e}")

# Run safe migration
run_safe_migration()

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)


# ---------------------------------------------------------
# A-6 RATE LIMIT (IP 기반 고정 윈도우)
# ---------------------------------------------------------
_rate_limit_store: Dict[Tuple[str, int], int] = {}

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    path = request.url.path
    if path != "/query":
        return await call_next(request)

    client_ip = request.client.host or "unknown"
    now = int(time.time())
    window = now // 60
    key = (client_ip, window)
    count = _rate_limit_store.get(key, 0)

    if count >= RATE_LIMIT_PER_MIN:
        raise HTTPException(
            status_code=429,
            detail=f"Too Many Requests: {RATE_LIMIT_PER_MIN} per minute limit exceeded.",
        )

    _rate_limit_store[key] = count + 1
    response = await call_next(request)
    remaining = max(RATE_LIMIT_PER_MIN - _rate_limit_store[key], 0)
    response.headers["X-RateLimit-Limit"] = str(RATE_LIMIT_PER_MIN)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    return response

# ---------------------------------------------------------
# A-7 공통 Request 로깅 미들웨어
# ---------------------------------------------------------
@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id

    start = time.time()
    client_ip = request.client.host or "unknown"
    path = request.url.path
    method = request.method

    try:
        response = await call_next(request)
        status_code = response.status_code
    except Exception as e:
        status_code = 500
        duration_ms = int((time.time() - start) * 1000)
        log_data = {
            "ts": int(time.time() * 1000),
            "level": "ERROR",
            "request_id": request_id,
            "method": method,
            "path": path,
            "status": status_code,
            "latency_ms": duration_ms,
            "ip": client_ip,
            "workspace": WORKSPACE,
            "error_type": type(e).__name__,
        }
        logger.error(json.dumps(log_data, ensure_ascii=False))
        raise

    duration_ms = int((time.time() - start) * 1000)
    log_data = {
        "ts": int(time.time() * 1000),
        "level": "INFO",
        "request_id": request_id,
        "method": method,
        "path": path,
        "status": status_code,
        "latency_ms": duration_ms,
        "ip": client_ip,
        "workspace": WORKSPACE,
    }
    logger.info(json.dumps(log_data, ensure_ascii=False))
    response.headers["X-Request-ID"] = request_id
    return response

# ---------------------------------------------------------
# 정적 파일 서빙
# ---------------------------------------------------------
app.mount("/static", StaticFiles(directory="static"), name="static")

# ---------------------------------------------------------
# 라우터 등록
# ---------------------------------------------------------
from app.middleware.audit import AuditLogMiddleware

app.add_middleware(AuditLogMiddleware)
app.include_router(doc_router)
app.include_router(query_router)
from app.routes.admin import router as admin_router

app.include_router(admin_router)
app.include_router(groups_router)
app.include_router(answers_router)
app.include_router(chats_router)
from app.routes.ingest import router as ingest_router
app.include_router(ingest_router)
from app.routes.shredder import router as shredder_router
app.include_router(shredder_router)
from app.routes.proposal import router as proposal_router
app.include_router(proposal_router)
from app.routes.projects import router as projects_router
app.include_router(projects_router)

# ---------------------------------------------------------
# 헬스체크
# ---------------------------------------------------------
@app.get("/health")
def health_check():
    try:
        with engine.begin() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"DB connection failed: {type(e).__name__}: {e}",
        )
    return {"status": "ok", "workspace": WORKSPACE, "region": REGION}

# ---------------------------------------------------------
# S3 PING 테스트
# ---------------------------------------------------------
@app.get("/s3/ping")
def s3_ping():
    bucket = "cloud-rag-proto-jihoprototest-apne2"
    prefix = "personal/test/"
    try:
        session = boto3.Session(profile_name="personal")
        s3 = session.client("s3", region_name=REGION)
        resp = s3.list_objects_v2(Bucket=bucket, Prefix=prefix, MaxKeys=10)
        keys = [item["Key"] for item in resp.get("Contents", [])]
        return {"bucket": bucket, "prefix": prefix, "objects": keys}
    except ProfileNotFound as e:
        raise HTTPException(status_code=500, detail=f"AWS profile not found: {e}")
    except NoCredentialsError as e:
        raise HTTPException(status_code=500, detail=f"AWS credentials error: {e}")
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"S3 client error: {e}")
