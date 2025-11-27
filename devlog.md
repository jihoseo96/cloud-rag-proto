📘 프로젝트 인스트럭션 (최신본 — 2025.11.26)
0) 목적

//모든 코드 및 답변은 당장의 에러 해결이나 단기 요구 해결이 아닌,
시스템 전체의 architecture·수명·확장성을 고려하여 작성한다.//

5분 온보딩 Cloud SaaS 협업형 RAG MVP

PDF/DOCX/PPTX/TXT/MD 업로드
→ 추출 → 청크화 → 임베딩 → Postgres(pgvector) 저장
→ 벡터 + trigram 하이브리드 검색
→ 출처[n] 인용 생성 (Attribution-by-Design)

핵심 개념:

원본 파일 S3 보존

Workspace/Group 기반 멀티테넌시

Answer Card(팀 표준 정답) = Document와 동급(1급 시민)

클라우드(App Runner/S3/RDS) 확장 가능 구조

1) 핵심 가치

⏱ 5분 온보딩 단일 페이지

📚 출처 기반 답변

🗂 원본(S3) 보존

🏗 로컬 → Docker → 클라우드 무마이그레이션

🧑‍🤝‍🧑 Workspace / Group 멀티테넌시

🧠 AnswerCard 생성 / 검수 / 승인 / 재사용

2) 전제 (Assumptions)

Region: ap-northeast-2

기본 Workspace: personal

S3 Key: personal/{document_id}/raw.pdf

DB: Postgres + pgvector + pg_trgm

Python 3.11 (.venv)

Embedding: text-embedding-3-small

Chat: gpt-4o-mini

3) 전체 아키텍처 요약
3-1) Frontend (SPA)

React + Vite

AppContext 기반 전역 상태 관리

초기 로딩 시 백엔드에서:

/groups → 내가 속한 팀 목록

/chats → 내가 가진 채팅 목록

호출 API:

/documents/upload

/documents/list

/query

/answers

/answers/{id}/approve

/groups

/groups/{id}/instruction

/chats

/chats/{chat_id}/messages (차후)

3-2) Backend (FastAPI)

routes/: HTTP 엔드포인트

services/: 추출/청크/임베딩/검색

models/: Document/Chunk/Answer/Group/Chat ORM

utils/: cite, common

main.py: API 라우터 등록

3-3) S3

업로드 원본 파일 영구 보존

재인덱싱 시 S3 원본 재사용

3-4) 데이터 처리 Pipeline

업로드

포맷 판별

텍스트 추출

페이지/슬라이드 기준 청크화

임베딩

pgvector + trigram 인덱싱 저장

검색 시 vector + lexical 스코어 융합

4) 디렉터리 구조
Backend
app/
 ├─ main.py
 ├─ routes/
 │   ├─ health.py
 │   ├─ documents.py
 │   ├─ query.py
 │   ├─ answers.py
 │   ├─ groups.py
 │   └─ chats.py          ← (2025.11.26 신규)
 ├─ services/
 │   ├─ extract.py
 │   ├─ chunker.py
 │   ├─ embed.py
 │   ├─ indexer.py
 │   ├─ search.py
 │   └─ answers.py
 ├─ models/
 │   ├─ db.py
 │   ├─ document.py
 │   ├─ chunk.py
 │   ├─ answer.py
 │   ├─ group.py
 │   ├─ chat.py           ← (2025.11.26 신규)
 │   └─ user.py (optional)
 └─ utils/
     ├─ cite.py
     └─ common.py

Frontend
frontEnd/
 ├─ index.html
 ├─ src/
 │   ├─ contexts/
 │   │   └─ AppContext.tsx   ← /groups, /chats 연동됨 (2025.11.26)
 │   ├─ lib/
 │   │   └─ api.ts           ← listGroups, listChats, createChatApi 추가
 │   ├─ components/
 │   ├─ pages/
 │   └─ styles/

5) 환경 변수 (.env)
OPENAI_API_KEY=...
DATABASE_URL=postgresql+psycopg://rag:ragpw@localhost:5432/ragdb
S3_BUCKET=...
REGION=ap-northeast-2
WORKSPACE=personal
CHAT_MODEL=gpt-4o-mini

SEARCH_W_VEC=0.6
SEARCH_W_LEX=0.4
SEARCH_DIVERSITY_PENALTY=0.9

CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
RATE_LIMIT_PER_MIN=30

6) 데이터 모델 / DDL 요약 (2025.11.26 기준 최신)
document

id uuid PK

workspace text

group_id uuid FK

title text

s3_key_raw text

sha256 text

created_at timestamptz

chunk

id uuid PK

document_id uuid FK

page int

text text

embedding vector(1536)

인덱스: ivfflat(embedding), GIN(text gin_trgm_ops)

answer_card

id uuid PK

workspace

group_id

question

answer

status: draft | pending | approved | archived

source_sha256_list text[]

created_by, reviewed_by

created_at, updated_at

Chat (2025.11.26 신규)

id uuid PK

user_id text

group_id uuid FK

title text

created_at timestamptz

last_updated timestamptz

group_member (확장됨: 2025.11.26)

id uuid PK

group_id uuid FK

user_id text

user_email text

role text

created_at timestamptz

chat_message (optional)

id uuid PK

chat_id uuid FK

role text

content text

created_at timestamptz

7) HTTP API 엔드포인트
✔ 시스템 상태

GET /health

✔ 문서 업로드

POST /documents/upload

GET /documents/list

✔ 검색

GET /query

vector + trigram hybrid

AnswerCard boost

group instruction 반영

citations[n] 자동 생성

✔ AnswerCard

POST /answers

POST /answers/{id}/approve

GET /answers?group_id=&status=

✔ Group Instruction

GET /groups/{id}/instruction

PUT /groups/{id}/instruction

✔ 그룹 목록 (2025.11.26 추가)

GET /groups

현재 사용자(user_email) 소속 그룹 목록

✔ 채팅 (2025.11.26 추가)

GET /chats

현재 사용자(user_id)의 채팅 목록

POST /chats

새 채팅 생성

8) 현재까지 완료된 기능 (2025.11.26 최신)
🔵 핵심 기능 — 100% 완료

파일 포맷 자동 판별 + 텍스트 추출

청크 생성

임베딩 저장

하이브리드 검색

Group instruction 반영

AnswerCard draft → approve → 검색 반영

AnswerCard 청크 인덱싱

stale 판단(sha256 비교)

/health 강화

🔵 운영 안정화(A-1~A-7) — 100% 완료

S3 구조 정비

SHA-256 멱등성

pgvector probes 튜닝 훅

검색 가중치 ENV override

CORS whitelist

Rate limit (IP 기반)

표준 로그(request_id, ms, used_k 등)

🔵 UI 적용 (2025.11.26 업데이트)

AppContext 초기 로딩 시 /groups, /chats API로 실제 팀/채팅 로드

새 채팅 생성 시 /chats POST 연동

팀 기준 채팅 필터링 UI 작동

채팅별 메시지 관리 AppContext 구조 유지

9) 남은 작업 (UI 중심 재정렬)

💛 2단계 — UI (현재 우선순위 1)

파일 업로드 UI

문서 리스트 UI

질문 입력 & 답변 UI

citation 펼침 UI

Group instruction 편집 UI

AnswerCard 생성/승인 UI

Answer Library UI

workspace/group 전환 UI

검색 latency/token usage 표시

💛 백엔드 확장:

/documents/list

/answers/list

/documents/{id}

/answers/{id}/edit

10) 3단계 — 운영 안정화 (UI 이후)

E2E 테스트 기반 검색 품질 확정

reindex 정책

pgvector 리스트/프로브 튜닝

stale 문서/AnswerCard 처리

workspace usage 카운팅

CloudWatch/Grafana 대시보드

workspace/유저 기반 통계

11) 4단계 — 클라우드 배포

Dockerfile

AWS App Runner

RDS (pgvector)

S3

HTTPS (ACM)

CloudWatch Logs / Metrics

옵션: Grafana / ELK

12) 최종 목표 (Definition of Done)

5분 온보딩 단일 페이지

PDF/DOCX/PPTX 자동 인덱싱

하이브리드 검색 + citation

AnswerCard 생성·승인

stale 배지

Workspace/Group 멀티테넌시 UI

클라우드 데모 URL

13) 운영 팁

SELECT COUNT(*) FROM chunk WHERE document_id='...'

citations snippet 정합성 검사

S3 객체 존재 여부 확인

AnswerCard 재사용률 모니터링

/query 표준 로그 확인 (used_k, tokens, latency)

14) 성능/튜닝

ivfflat lists=100, probes=10

w_vec/w_lex = 0.6/0.4

diversity_penalty = 0.9

per_doc_limit = 3

Answer 부스트 = 1.15 / 1.3

15) 확장성

indexer 비동기화 (Celery)

App Runner + RDS 확장

Cognito/Auth0 기반 RBAC

schema-per-tenant 가능

workspace별 usage 대시보드

16) 필수 모니터링

/health

인덱싱 건수

Answer stale 비율

pgvector latency

S3 latency

/query usage:

요청 수

오류율

평균/95% latency

tokens

workspace별 사용량
