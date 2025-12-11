import os
import sqlalchemy
import pg8000
import google.auth
from google.auth.transport.requests import Request as GoogleRequest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 환경 변수 로드
DATABASE_URL = os.getenv("DATABASE_URL")
DB_IAM_USER = os.getenv("DB_IAM_USER")
DB_NAME = os.getenv("DB_NAME")
CLOUD_SQL_CONNECTION_NAME = os.getenv("CLOUD_SQL_CONNECTION_NAME")

def get_engine():
    # ---------------------------------------------------------
    # 1. Cloud Run 환경 (Unix Socket + IAM Auth)
    # ---------------------------------------------------------
    if CLOUD_SQL_CONNECTION_NAME:
        print(f"🚀 Cloud Run Detected. Connecting to {CLOUD_SQL_CONNECTION_NAME} via Unix Socket...")
        
        def get_conn():
            # [핵심] 1. IAM 인증용 토큰 생성 (Scope 명시)
            # 이 부분이 없으면 권한 부족으로 로그인 실패(28P01)가 날 수 있습니다.
            scopes = ['https://www.googleapis.com/auth/sqlservice.login']
            credentials, _ = google.auth.default(scopes=scopes)
            credentials.refresh(GoogleRequest())
            token = credentials.token
            
            # 2. Unix Socket 경로 설정
            # Cloud Run은 자동으로 /cloudsql 폴더 아래에 소켓을 만듭니다.
            socket_path = f"/cloudsql/{CLOUD_SQL_CONNECTION_NAME}/.s.PGSQL.5432"
            
            # 3. pg8000으로 연결 (비밀번호 자리에 토큰 주입)
            conn = pg8000.connect(
                user=DB_IAM_USER,
                database=DB_NAME,
                unix_sock=socket_path,
                password=token
            )
            return conn

        # 엔진 생성 (creator 함수 이용)
        engine = create_engine(
            "postgresql+pg8000://",
            creator=get_conn,
            pool_pre_ping=True
        )
        return engine

    # ---------------------------------------------------------
    # 2. 로컬 환경 (일반 TCP 연결)
    # ---------------------------------------------------------
    else:
        print("💻 Local Environment Detected. Using DATABASE_URL...")
        if not DATABASE_URL:
            raise ValueError("DATABASE_URL environment variable is required for local development.")
            
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        return engine


# 엔진 생성
engine = get_engine()

# 세션 및 Base 설정
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)

Base = declarative_base()
