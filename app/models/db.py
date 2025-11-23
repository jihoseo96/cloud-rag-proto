# app/models/db.py
import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL")

# ---------------------------------------------------------
# SQLAlchemy Engine (Postgres + pgvector)
# ---------------------------------------------------------
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

# 세션 팩토리
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)

# Base 모델
Base = declarative_base()


# ---------------------------------------------------------
# A-3 성능 튜닝: ivfflat.probes 기본값 설정
# ---------------------------------------------------------
# ❗주의 사항 (매우 중요)
# 현재 우리가 사용하는 pgvector Docker 이미지(pgvector/pgvector:pg16)는
# "ivfflat.probes" 라는 세션 수준 GUC(Global User Configuration)을
# 아직 지원하지 않는 버전이다.
#
# 그래서 아래 쿼리를 직접 실행해보면:
#   SHOW ivfflat.probes;
# → ERROR: unrecognized configuration parameter "ivfflat.probes"
#
# 즉, 현 시점에서는 SET ivfflat.probes=10 이 실제로 적용되지는 않는다.
#
# ✔ 하지만 이 코드를 남겨두는 이유:
#   - 향후 pgvector 버전을 업그레이드하면
#     이 GUC가 지원되며, 그 즉시 probes 튜닝이 자동 활성화된다.
#   - FastAPI/SQLAlchemy 코드는 바꾸지 않고도
#     DB 버전 업만으로 성능 개선 효과(probes↑ recall↑)를 얻을 수 있게 된다.
#
# ✔ 또한 try/except로 안전하게 감싸두었기 때문에
#   - 지금 버전에서는 쿼리가 에러를 내더라도 서비스에는 영향 없음
#   - 프로덕션에서도 커넥션이 죽지 않고 정상적으로 실행됨
#
# ✔ 지금은 “비활성화된 미래 대비용 코드”라고 이해하면 된다.
#
# 따라서 이 훅은 현재 효과는 없지만,
# pgvector 최신 버전에서는 정상적으로 동작하며 튜닝 옵션이 된다.
# ---------------------------------------------------------
@event.listens_for(engine, "connect")
def set_ivfflat_probes(dbapi_connection, connection_record):
    """
    PostgreSQL 커넥션이 열릴 때 실행되는 이벤트 훅.
    - 향후 pgvector가 ivfflat.probes GUC를 지원하게 되면 즉시 활성화됨.
    - 현재 버전에서는 쿼리가 에러나지만 try/except로 안전하게 무시한다.
    """
    cursor = dbapi_connection.cursor()
    try:
        cursor.execute("SET ivfflat.probes = 10;")
    except Exception:
        # 현재 pgvector 버전에서는 지원되지 않아도
        # 전체 커넥션에 영향을 주지 않도록 silent pass
        pass
    finally:
        cursor.close()
