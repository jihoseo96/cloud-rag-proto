from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes.health import router as health_router
from app.routes.documents import router as doc_router
from app.routes.query import router as query_router
import boto3
from botocore.exceptions import ProfileNotFound, NoCredentialsError, ClientError
from dotenv import load_dotenv
import os
from sqlalchemy import text
from app.db import engine

load_dotenv()
# 환경변수
WORKSPACE = os.getenv("WORKSPACE", "personal")
REGION = os.getenv("REGION", "ap-northeast-2")
from app.db import engine
app = FastAPI(title="RAG Prototype", version="0.2.0")

# 개발용 CORS (배포 시 도메인 제한 권장)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: 배포 시 ["https://내도메인"] 으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# 정적 파일 서빙 (static 디렉토리 전체)
app.mount("/static", StaticFiles(directory="static"), name="static")

# 라우터 등록
app.include_router(health_router)
app.include_router(doc_router)
app.include_router(query_router)

@app.get("/health")
def health_check():
     # DB 핑: 실패 시 500 에러로 바로 드러나게
    try:
        with engine.begin() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB connection failed: {type(e).__name__}: {e}")

    return {"status":"ok", "workspace": WORKSPACE, "region": REGION}

@app.get("/s3/ping")
def s3_ping():
    # 프로파일 기반 세션 (로컬 개발용)
    session = boto3.Session(profile_name="personal")  # 배포시에는 역할/환경변수 권장
    s3 = session.client("s3", region_name="ap-northeast-2")

    bucket = "cloud-rag-proto-jihoprototest-apne2"
    prefix = "personal/test/"

    resp = s3.list_objects_v2(Bucket=bucket, Prefix=prefix, MaxKeys=10)
    keys = [item["Key"] for item in resp.get("Contents", [])]
    return {"bucket": bucket, "prefix": prefix, "objects": keys}