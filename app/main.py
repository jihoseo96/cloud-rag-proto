# app/main.py
import os
import time
import uuid
import json
import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import boto3
from botocore.exceptions import ProfileNotFound, NoCredentialsError, ClientError

from dotenv import load_dotenv
from sqlalchemy import text

from app.routes.health import router as health_router
from app.routes.documents import router as doc_router
from app.routes.query import router as query_router
from app.routes.groups import router as groups_router
from app.routes.answers import router as answers_router
from app.db import engine

# .env 로드
load_dotenv()

# ---------------------------------------------------------
# 로거 설정
# - 실제 운영에서는 구조화 로그(JSON)를 수집/분석 도구(CloudWatch, ELK 등)에 붙이는 용도
# ---------------------------------------------------------
logger = logging.getLogger("rag_proto")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO)


# ---------------------------------------------------------
# 환경변수
# ---------------------------------------------------------
WORKSPACE = os.getenv("WORKSPACE", "personal")
REGION = os.getenv("REGION", "ap-northeast-2")

# Rate Limit 환경변수 (기본값: 분당 30회)
RATE_LIMIT_PER_MIN = int(os.getenv("RATE_LIMIT_PER_MIN", "30"))


# ---------------------------------------------------------
# CORS ORIGINS 설정 (A-5)
# ---------------------------------------------------------
def _get_cors_origins() -> list[str]:
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
# A-6 RATE LIMIT (IP 기반 고정 윈도우)
#
# 현재는 로컬 개발 및 단일 인스턴스 환경을 고려하여
# "서버 메모리(dict)" 기반으로 구현한다.
#
# ⚠️ 주의:
#   - 이 방식은 서버 재시작 시 카운트가 초기화되며
#   - 서버를 여러 대로 확장하면 인스턴스별로 별도 카운트가 생성되므로
#     실제 Rate Limit로 작동하지 않는다.
#
# 👉 실제 운영 배포 전에 반드시 Redis 또는 DB 기반으로
#    Rate Limit 상태를 공유/영속화하는 방식으로 교체해야 한다.
# ---------------------------------------------------------

_rate_limit_store: dict[tuple[str, int], int] = {}  # {(ip, window_start_minute): count}


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """
    /query 엔드포인트에 대해 IP당 분당 RATE_LIMIT_PER_MIN 회 제한.
    """
    path = request.url.path
    if path != "/query":  # 필요하면 다른 엔드포인트에도 확장 가능
        return await call_next(request)

    client_ip = request.client.host or "unknown"

    now = int(time.time())
    window = now // 60  # 1분 단위 fixed-window

    key = (client_ip, window)

    count = _rate_limit_store.get(key, 0)

    if count >= RATE_LIMIT_PER_MIN:
        # Rate Limit 초과 → 429 반환
        raise HTTPException(
            status_code=429,
            detail=f"Too Many Requests: {RATE_LIMIT_PER_MIN} per minute limit exceeded.",
        )

    # 카운트 증가
    _rate_limit_store[key] = count + 1

    response = await call_next(request)

    # 남은 요청 수 헤더 추가 (선택)
    remaining = max(RATE_LIMIT_PER_MIN - _rate_limit_store[key], 0)
    response.headers["X-RateLimit-Limit"] = str(RATE_LIMIT_PER_MIN)
    response.headers["X-RateLimit-Remaining"] = str(remaining)

    return response


# ---------------------------------------------------------
# A-7 공통 Request 로깅 미들웨어
#
# - 모든 요청에 대해:
#   - request_id 부여
#   - method / path / status / latency_ms / ip / workspace 로깅
# - stdout(JSON)로 찍어두고, 나중에 CloudWatch/ELK/Grafana 등으로 수집하기 좋게 설계
# ---------------------------------------------------------
@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id  # 라우터에서 접근 가능

    start = time.time()
    client_ip = request.client.host or "unknown"
    path = request.url.path
    method = request.method

    try:
        response = await call_next(request)
        status_code = response.status_code
    except Exception as e:
        # 예외가 발생한 경우에도 로그를 남긴다.
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

    # 요청-응답 추적을 위해 헤더에 request_id 노출
    response.headers["X-Request-ID"] = request_id

    return response


# ---------------------------------------------------------
# 정적 파일 서빙
# ---------------------------------------------------------
app.mount("/static", StaticFiles(directory="static"), name="static")

# ---------------------------------------------------------
# 라우터 등록
# ---------------------------------------------------------
app.include_router(health_router)
app.include_router(doc_router)
app.include_router(query_router)
app.include_router(groups_router)
app.include_router(answers_router)


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
