📘 Enterprise RFP OS — Project Instruction
Section 1. 프로젝트 정의 및 핵심 가치 (General & Philosophy)
문맥(Context)
이 섹션은 개발의 **대원칙(Rule)**이자 **방향성(Compass)**입니다. 기술적 의사결정 시 이 원칙에 위배되는 코드는 작성하지 않습니다.

1-1. 프로젝트 정의 (Mission)
“Zero Setup → Guided Control → Verified Confidence”

이 제품은 단순 RAG 챗봇이 아니라, 기업의 RFP 제안서 작성을 위해 설계된 **엔터프라이즈 지식 운영체제(OS)**다.

여기서 말하는 “문서 업로드”는 세 가지 루트로 나뉜다:

Knowledge Hub 문서 업로드 (사내 지식 저장소)

사내 표준 제안서, 백서, 인증서, 보안 정책, 기술 설명서 등 여러 프로젝트에서 반복 재사용될 수 있는 레퍼런스 문서

**Google Vertex AI Agent Builder (Search)**로 인덱싱 (Data Store 연결)

Google Cloud Storage (GCS) 버킷에 저장 시 자동 동기화

재사용 가치가 높은 문단/표를 기반으로 AnswerCard 후보 자동 생성(Lazy Mining)

RFP 마스터 업로드 (Project RFP 생성)

실제 입찰 공고문, 과업지시서, 제안요청서 등 이번 프로젝트의 기준이 되는 문서(“마스터 RFP”)

**Google Gemini 3.0 Pro (Vision/Pro)**를 이용해 단일 문서 Deep Parsing(Shredding) → rfp_requirement / project 메타데이터 구조화

이 RFP 마스터는 Vertex Search 인덱스에 올리지 않는다. (프로젝트 수명과 함께 사라지는 일회성 문서)

프로젝트 첨부 문서 업로드 (Project Attachments)

해당 프로젝트에만 사용하는 추가 문서 (질의응답서, 고객 제공 양식, 추가 요구사항 문서 등)

**Google Cloud Storage (GCS)**에 Project-local 문서로 저장 (document.group_id = project_id)

필요 시 RAG/Anchor 보조 근거로만 사용

따라서 기존의 애매한 문장인 “사용자가 문서를 업로드하면 AI가 분석 및 충돌 감지한다”는 아래와 같이 재정의한다:

“사용자가 문서를 업로드하면, 문서의 용도(사내 지식 / RFP 마스터 / 프로젝트 첨부)에 따라 각기 다른 파이프라인으로 라우팅되고, 해시 기반 중복·버전 충돌을 감지한 뒤, 적절한 AI 엔진(Vertex Agent Builder/Gemini/OpenAI)을 호출한다.”

최종 목표:

사내 문서는 Vertex AI Search + AnswerCard를 통해 “다시 사용할 수 있는 표준 지식 블록”으로 자산화되고,

RFP 마스터 문서는 Gemini 3.0 Pro를 통해 “정밀하게 파쇄된 요구사항/평가기준/요약 정보”로 변환되며,

실제 제안서는 AnswerCard + OpenAI GPT-5.1를 기반으로 “검증된 표준 답변 세트 + 프로젝트 컨텍스트” 위에서 작성된다.

1-2. 개발 5대 대원칙 (Prime Directives)
1) Trust over Magic

자동화보다 더 중요한 것은 운영자가 통제하고 있다고 느끼게 하는 UX다.

“알아서 했습니다”보다 **“이것을 승인하시겠습니까?”**가 더 낫다.

사용자는 “AI에게 맡겼다”가 아니라 **“AI가 찾아준 것 중 핵심만 내가 골라 승인한다”**는 감각을 가져야 한다.

모든 주요 변경(팩트 변경, 고위험 표현 승인 등)은 명시적 승인 플로우를 가져야 한다.

2) Bulletproof Anchoring (현실적 3중 보호)

Anchoring은 항상 3중 레이어로 설계한다.

Semantic (해시/문장 기반) — 1순위, 필수 (답변의 근거가 되는 텍스트 스니펫 + SHA256 해시)

Structure (섹션 경로) — 있으면 사용 ("3.1 보안요구사항 > 네트워크 구간" 같은 논리적 경로)

Layout (BBox/page, URI) — 사용 가능할 때만 (페이지 번호, Bounding Box, 원본 GCS URI)

결론: Vertex/Gemini는 어디까지나 **“탐색기(Explorer)”**이다. 최종 Anchoring은 **Cloud SQL(PostgreSQL)**에 Frozen Snapshot(박제) 형태로 저장되어야 한다.

3) Risk-Aware Evolution

AnswerCard는 다음 두 경로로 자동 생성·진화할 수 있다.

사내 문서 마이닝 (origin = "MINED")

실제 RFP 프로젝트 답변 승격 (origin = "PROJECT")

그러나 “팩트(facts)”가 바뀌는 순간에는 반드시 Manager 승인을 거친다.

Guardrail는 팩트 위반, 과장 표현, 금지어를 자동 차단/경고한다.

4) Project-First Architecture

정답(Answer) 자체가 아니라, **프로젝트(RFP)**가 1급 시민(First-Class)이다.

AnswerCard는 **“표준 블록(Standard Block)”**이며, 실제 어떤 표현을 쓸지는 항상 현재 Project Context 위에서 결정한다.

5) Auditable by Design

엔터프라이즈에서는 기능보다 **“누가, 언제, 무엇을 승인했는지”**가 더 중요하다.

AnswerCard, Variant, Requirement 상태 변경은 모두 AuditLog에 남긴다.

Vertex/Gemini/OpenAI 호출의 입력·출력도 필요 시 debug_payload로 스냅샷을 남겨 “왜 이 답변이 나왔는지”를 사후 분석할 수 있어야 한다.

1-3. 핵심 가치 제안 (Core Value Proposition)
🛡️ Rapid Trust Calibration: 초기 설정 없이 AI가 98% 처리, 사용자는 결정적 2%만 승인.

⚓ Source-Anchored Knowledge Block: AnswerCard는 원본 문서(GCS) + Anchors + Facts가 묶인 연결 객체.

🧬 Controlled Darwinian Evolution: 프로젝트 수행을 통해 답변 패턴이 축적되나, Facts 변경은 승인 하에 관리됨.

🗂️ Project Context Awareness: 산업/기관/유형에 따라 추천 답변과 목차가 달라짐.

🧩 Proposal Assembly: 사용자는 문장을 쓰는 것이 아니라, 카드와 섹션을 조립하는 Navigator가 됨.

🔍 Auditability: 모든 변경과 AI 생성 근거는 역추적 가능함.

Section 2. 기술 스펙 및 아키텍처 (Technical Specifications)
문맥(Context)
이 섹션은 **구현(Implementation)**을 위한 구체적인 명세입니다. 변수명, 데이터 구조, 디렉토리 구조는 이 기준을 엄격히 따릅니다.

2-1. 기술 스택 (Tech Stack)
Backend

Python 3.12 / FastAPI

Google Cloud Run (2nd Gen): Serverless Container, Auto-scaling

Cloud Tasks: RFP Shredding 등 비동기 Long-running 작업 처리

Frontend

React + Vite

Firebase Hosting: 글로벌 CDN 배포, Cloud Run Rewrite 연동

Database (Meta & Logic)

Google Cloud SQL for PostgreSQL (Ver 15+)

Extensions: pgvector, pg_trgm, JSONB

Connection: IAM Authentication (Keyless), Public IP (Secure Access via Auth Proxy or IAM)

Storage (Files)

Google Cloud Storage (GCS) (원본 영구 보존)

Path: gs://rfp-dev-480708-storage/raw/{project_id}/{file_id} (원본 파일)

Path: gs://rfp-dev-480708-storage/parsed/... (중간 산출물)

Access: Uniform Bucket-Level Access, Signed URL V4

AI Models & External Services

Document Understanding & RFP Shredding:

Google Vertex AI – Gemini 3.0 Pro (Vision/Pro)

HWP/PPT 등 비정형 포맷을 고해상도 PDF로 변환한 뒤 Vision 입력

용도: RFP 마스터(공고문/과업지시서) Deep Parsing

Knowledge Hub Retrieval:

Google Vertex AI Agent Builder (Search)

GCS 버킷(rfp-dev-480708-storage)과 연동된 Unstructured Data Store

용도: 사내 지식 문서 전용 RAG 엔진

Drafting & Guardrails:

OpenAI GPT-5.1: 제안 문장 생성 (Drafting)

OpenAI text-embedding-3-small: 유사도 계산용 임베딩 (pgvector 연동)

Security & Ops

Secret Manager: API Key(OPENAI_API_KEY) 안전 보관

Cloud Logging: 구조화된 로그 수집

Artifact Registry: 도커 이미지 저장소

2-2. 데이터 모델링 (Schema)
아래 구조는 JSON/Python Dict 형태로 표현된 DB 스키마 명세임.

A. Project (1급 시민)

JSON

{
  "id": "UUID",
  "workspace": "personal | team",
  "group_id": "UUID",
  "name": "2025_국방RFP",
  "industry": "defense",
  "rfp_type": "technical",
  "evaluation_criteria": { },
  "required_documents": [ ],
  "prohibited_phrases": [ ],
  "created_at": "timestamp",
  "owner_id": "UUID (IAM Email)",
  "status": "active | archived | completed",
  "deadline": "timestamp (ISO 8601)",
  "description": "text (Project Summary extracted via Gemini)"
}
B. RFP Requirement (Auto Shredding)

JSON

{
  "id": "UUID",
  "project_id": "UUID",
  "requirement_text": "text",
  "requirement_type": "security | ops | ...",
  "compliance_level": "YES | PARTIAL | NO",
  "linked_answer_cards": ["UUID", ...],
  "anchor_confidence": 0.88,
  "status": "pending | approved | rejected"
}
C. AnswerCard (Source-Anchored, Evolvable Block)

JSON

{
  "id": "UUID",
  "project_id": "UUID (nullable, origin tracking)",
  "origin": "MINED | PROJECT",
  "status": "ACTIVE | DEPRECATED",
  "topic": "보안 인증",
  "anchors": [
    {
      "content_hash": "SHA256...",
      "text_snippet": "ISO27001",
      "anchor_confidence": 0.93,
      "doc_id": "uuid",
      "section_path": "3.1 보안",
      "page": 5,
      "gcs_uri": "gs://rfp-dev-480708-storage/raw/...",
      "fail_reasons": []
    }
  ],
  "facts": { "sla": 99.5, "cert": "ISO27001" },
  "variants": [
    {
      "content": "ISO27001 인증을 보유하고 있습니다.",
      "context": "public-sector",
      "status": "APPROVED",
      "created_from": "MINED"
    }
  ]
}
D. Document (Source File & Folder)

JSON

{
  "id": "UUID",
  "workspace": "personal | team",
  "group_id": "UUID",           // NULL: Knowledge Hub / Project ID: Project-local
  "title": "filename.pdf or FolderName",
  "storage_uri": "gs://rfp-dev-480708-storage/raw/{project_id}/{file_id}",
  "sha256": "string",
  "created_at": "timestamp",
  "parent_id": "UUID (nullable)",
  "is_folder": "boolean",
  "vertex_sync_status": "PENDING | SYNCED | ERROR",
  "last_vertex_sync_at": "timestamp",
  "last_sync_error": "text (nullable)"
}
[NOTE] Unified Document Table 전략

Physical Storage: 모든 문서는 하나의 document 테이블 및 단일 GCS 버킷에 저장.

Logical Separation:

Knowledge Hub: group_id IS NULL, Vertex AI Search 인덱싱 대상.

Project Docs: group_id = project_id, Vertex 인덱싱 제외 (Gemini 직접 분석).

2-3. 핵심 비즈니스 로직 (Pipelines)
2-3-A. Knowledge Hub Pipeline (GCS → Vertex AI → AnswerCard)
Step KH-1 – Zero Ingestion (업로드 & 중복·충돌 감지)

문서 업로드 시 GCS에 저장 (gs://...).

SHA256 해시 계산 후 DB document 레코드 생성.

중복/충돌 감지 후 vertex_sync_status = "PENDING" 마킹.

Step KH-2 – Vertex AI Search Indexing

Vertex AI Agent Builder의 Data Store가 GCS 버킷을 주기적(또는 이벤트 기반)으로 스캔.

인덱싱 완료 확인 후 vertex_sync_status = "SYNCED" 업데이트.

Step KH-3 – AnswerCard Lazy Mining

전수 스캔 대신 사용자 요청 또는 빈도 높은 영역에 대해 GPT-5.1 호출.

생성된 카드는 origin = "MINED"로 저장되며, 원본 근거는 GCS URI와 Vertex 검색 결과를 참조.

2-3-B. RFP Shredding Pipeline (RFP Master → Cloud Tasks → Gemini)
Step RFP-1 – Project 생성 & RFP 업로드

RFP 파일 GCS 업로드.

Cloud Tasks 큐(rfp-heavy-jobs)에 분석 작업 등록 (사용자 대기 시간 최소화).

Step RFP-2 – Universal PDF Service

HWP/PPT 등을 PDF로 변환하여 GCS의 /parsed 경로에 저장.

실패 시 원본 텍스트 추출 모드로 Fallback.

Step RFP-3 – Gemini 3.0 Pro Shredding

Cloud Run Worker가 Cloud Tasks로부터 트리거됨.

Gemini 3.0 Pro(Vision)에게 **GCS URI(PDF)**를 입력으로 전달.

JSON Schema에 맞춰 rfp_requirement, summary, deadline 추출.

Step RFP-4 – DB 저장 & Anchoring

추출된 데이터를 rfp_requirement 테이블에 저장.

각 요구사항별 Anchor(페이지, 원문)를 DB에 보존.

2-3-C. Compliance & Proposal Pipeline
Step C-1 – Mapping

pgvector를 사용하여 rfp_requirement와 answer_card 간 임베딩 유사도 검색.

매칭되지 않는 요구사항은 Vertex AI Search를 통해 "빈 영역" 보강 검색.

Step C-2 – Drafting & Guardrail

GPT-5.1에게 [Requirement + AnswerCard Facts + Vertex Snippet] 전달.

Guardrail 로직으로 팩트 검증 및 Risk 판별.

Step C-3 – Approval & Evolution

사용자가 Draft 승인 시, origin = "PROJECT"인 새로운 Variant 또는 AnswerCard 생성.

Facts 변경 시 Manager 승인 프로세스 트리거.

2-3-D. Compliance & Audit (LLM 호출 스냅샷 정책)
Vertex AI Search, Gemini 3.0 Pro, GPT-5.1 호출 내역을 audit_log에 기록.

"재현"이 아닌 "당시 상태 스냅샷" 원칙 준수 (당시 검색된 스니펫을 저장).

2-4. 디렉터리 구조
(기존 구조 복원 및 GCP 최적화 - Secret 폴더 제외)

Plaintext

app/
 ├─ routes/               # API Endpoints
 ├─ services/
 │    ├─ ingest.py        # GCS Upload, Hash, Conflict Check, Routing
 │    ├─ extract.py       # (Legacy/Fallback) Basic Text Extraction
 │    ├─ preprocess.py    # Text Cleaning & Structure Reconstruction
 │    ├─ indexer.py       # Vertex AI Search Indexing Logic & Sync
 │    ├─ search.py        # Vertex Search Client + pgvector Wrapper
 │    ├─ shredder.py      # Gemini 3.0 Pro Client (Cloud Tasks Worker)
 │    ├─ answers.py       # AnswerCard Management Logic
 │    ├─ proposal.py      # Proposal Assembly Engine
 │    ├─ guardrail.py     # OpenAI based Risk Filtering
 │    ├─ chunker.py       # (Helper) Internal Chunking Logic
 │    ├─ embed.py         # OpenAI Embedding Call (for pgvector)
 │    ├─ vertex_client.py # Vertex AI Search & Gemini Wrapper
 │    ├─ storage_client.py# GCS Client & Signed URL Generator
 │    └─ openai_client.py # GPT-5.1 Wrapper
 ├─ core/
 │    ├─ config.py        # Env Vars (Project ID, Region, Secret Manager)
 │    └─ database.py      # Cloud SQL Connector (IAM Auth)
 ├─ models/               # SQLAlchemy Models
 │    ├─ project.py
 │    ├─ rfp_requirement.py
 │    ├─ answer.py
 │    ├─ audit_log.py
 │    ├─ document.py
 │    ├─ guardrail_policy.py
 │    ├─ project_member.py
 │    ├─ app_user.py
 ├─ utils/
      ├─ semantic_hash.py
      ├─ debug_logger.py
      └─ pdf_converter.py # HWP/PPT to PDF Conversion Logic
2-5. 배포 및 운영 (DevOps)
CI/CD: GitHub Actions

Backend: cloud-rag-proto 루트 → Artifact Registry (rfp-backend) → Cloud Run Deploy (rfp-backend)

Frontend: frontEnd 폴더 → Firebase Hosting Deploy

Authentication:

Service-to-Service: Google IAM Service Account (rfp-backend-svc)

CI/CD: github-deployer SA (Workload Identity or Key)

Observability:

Cloud Logging: 모든 LLM 호출 및 애플리케이션 로그 수집.

Audit: audit_log 테이블에 상세 페이로드 기록.