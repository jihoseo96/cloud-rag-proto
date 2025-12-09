📘 Enterprise RFP OS — Project Instruction
Section 1. 프로젝트 정의 및 핵심 가치 (General & Philosophy)

문맥(Context)
이 섹션은 개발의 **대원칙(Rule)**이자 **방향성(Compass)**입니다.
기술적 의사결정 시 이 원칙에 위배되는 코드는 작성하지 않습니다.

1-1. 프로젝트 정의 (Mission)

“Zero Setup → Guided Control → Verified Confidence”

이 제품은 단순 RAG 챗봇이 아니라,
기업의 RFP 제안서 작성을 위해 설계된 **엔터프라이즈 지식 운영체제(OS)**다.

여기서 말하는 “문서 업로드”는 세 가지 루트로 나뉜다:

Knowledge Hub 문서 업로드 (사내 지식 저장소)

사내 표준 제안서, 백서, 인증서, 보안 정책, 기술 설명서 등
여러 프로젝트에서 반복 재사용될 수 있는 레퍼런스 문서

Google Vertex AI Search Advanced로 인덱싱

재사용 가치가 높은 문단/표를 기반으로 AnswerCard 후보 자동 생성(Lazy Mining)

RFP 마스터 업로드 (Project RFP 생성)

실제 입찰 공고문, 과업지시서, 제안요청서 등
이번 프로젝트의 기준이 되는 문서(“마스터 RFP”)

**Google Gemini 3.0 Pro (Vision/Pro)**를 이용해
단일 문서 Deep Parsing(Shredding) → rfp_requirement / project 메타데이터 구조화

이 RFP 마스터는 Vertex 인덱스에 올리지 않는다. (프로젝트 수명과 함께 사라지는 일회성 문서)

프로젝트 첨부 문서 업로드 (Project Attachments)

해당 프로젝트에만 사용하는 추가 문서
(질의응답서, 고객 제공 양식, 추가 요구사항 문서 등)

Project-local 문서로 저장 (document.group_id = project_id)

필요 시 RAG/Anchor 보조 근거로만 사용

따라서 기존의 애매한 문장인

“사용자가 문서를 업로드하면 AI가 분석 및 충돌 감지한다”

는 아래와 같이 재정의한다:

“사용자가 문서를 업로드하면, 문서의 용도(사내 지식 / RFP 마스터 / 프로젝트 첨부)에 따라 각기 다른 파이프라인으로 라우팅되고, 해시 기반 중복·버전 충돌을 감지한 뒤, 적절한 AI 엔진(Vertex/Gemini/OpenAI)을 호출한다.”

최종 목표:

사내 문서는 Vertex AI Search + AnswerCard를 통해
“다시 사용할 수 있는 표준 지식 블록”으로 자산화되고,

RFP 마스터 문서는 Gemini 3.0 Pro를 통해
“정밀하게 파쇄된 요구사항/평가기준/요약 정보”로 변환되며,

실제 제안서는 AnswerCard + OpenAI GPT-5.1를 기반으로
“검증된 표준 답변 세트 + 프로젝트 컨텍스트” 위에서 작성된다.

1-2. 개발 5대 대원칙 (Prime Directives)
1) Trust over Magic

자동화보다 더 중요한 것은 운영자가 통제하고 있다고 느끼게 하는 UX다.
“알아서 했습니다”보다 **“이것을 승인하시겠습니까?”**가 더 낫다.

사용자는 **“AI에게 맡겼다”**가 아니라
**“AI가 찾아준 것 중 핵심만 내가 골라 승인한다”**는 감각을 가져야 한다.

모든 주요 변경(팩트 변경, 고위험 표현 승인 등)은 명시적 승인 플로우를 가져야 한다.

2) Bulletproof Anchoring (현실적 3중 보호)

Anchoring은 항상 3중 레이어로 설계한다.

Semantic (해시/문장 기반) — 1순위, 필수

답변의 근거가 되는 텍스트 스니펫 + SHA256 해시

Structure (섹션 경로) — 있으면 사용

"3.1 보안요구사항 > 네트워크 구간" 같은 논리적 경로

Layout (BBox/page, URI) — 사용 가능할 때만

페이지 번호, Bounding Box, 원본 PDF 위치(S3/GCS URI)

결론:

Vertex/Gemini는 어디까지나 **“탐색기(Explorer)”**이다.

최종 Anchoring은 **PostgreSQL(AnswerCard + Document)**에
Frozen Snapshot(박제) 형태로 저장되어야 한다.

인덱스가 재구성되거나 모델이 바뀌어도,
한 번 승인된 AnswerCard는 원본 파일 위치 + 해시를 통해
항상 동일하게 재현 가능해야 한다.

3) Risk-Aware Evolution

AnswerCard는 다음 두 경로로 자동 생성·진화할 수 있다.

사내 문서 마이닝 (origin = "MINED")

실제 RFP 프로젝트 답변 승격 (origin = "PROJECT")

그러나 “팩트(facts)”가 바뀌는 순간에는 반드시 Manager 승인을 거친다.

SLA 수치, 인증 보유 여부, 서비스 범위 등

Guardrail는 다음을 자동 차단/경고한다:

팩트 위반 (facts와 모순되는 표현)

과장 표현 (“100% 보장”, “무제한”, “영구적” 등)

금지어(Blacklist)에 해당하는 표현

4) Project-First Architecture

정답(Answer) 자체가 아니라, **프로젝트(RFP)**가 1급 시민(First-Class)이다.

동일한 “보안 인증” 정보라도
국방/공공/금융/민간 SaaS 프로젝트마다
요구사항, 강조 포인트, 제안 구조가 다르다.

AnswerCard는 **“표준 블록(Standard Block)”**이며,
실제 어떤 표현을 쓸지는
항상 현재 Project Context 위에서 결정한다.

5) Auditable by Design

엔터프라이즈에서는 기능보다
**“누가, 언제, 무엇을 승인했는지”**가 더 중요하다.

AnswerCard, Variant, Requirement 상태 변경은 모두 AuditLog에 남긴다.

Vertex/Gemini/OpenAI 호출의 입력·출력도
필요 시 debug_payload로 스냅샷을 남겨
“왜 이 답변이 나왔는지”를 사후 분석할 수 있어야 한다.

완전한 알고리즘 재현은 불가능하더라도,
**“당시 AI가 어떤 내용을 근거로 어떤 결과를 제시했는지”**는 증명 가능해야 한다.

1-3. 핵심 가치 제안 (Core Value Proposition)

🛡️ Rapid Trust Calibration (Guided Onboarding)

초기 설정/튜닝 대신, AI가 98%를 자동 처리하고 **결정적인 2%**만 사용자 승인을 받는다.

사용자는 “모든 걸 입력하는 사람”이 아니라
**“핵심 결정을 내려주는 Reviewer”**로 느끼게 된다.

⚓ Source-Anchored Knowledge Block: AnswerCard

AnswerCard는 단순 텍스트 블록이 아니다.

원본 문서(Document) + Anchors(해시, 섹션, 레이아웃) + Facts + Variants가 묶인
**“Figma-style 연결 객체”**다.

Vertex/Gemini는 바뀔 수 있지만,
한 번 승인된 AnswerCard는 항상 동일한 근거를 참조한다.

🧬 Controlled Darwinian Evolution

제안서를 여러 번 쓰다 보면:

잘 먹히는 표현/구조가 자연스럽게 쌓이고,

특정 산업/기관에서 자주 쓰인 답변 패턴이 나타난다.

이 패턴은 AnswerCard에 Variant로 축적된다.

단, Facts 변경은 항상 Manager 승인 아래에서만 일어난다.

🗂️ Project Context Awareness

RFP의 산업/기관/입찰 유형에 따라:

추천 AnswerCard

제안서 목차(Proposal Template)

톤 & 스타일
이 달라져야 한다.

같은 AnswerCard라도:

국방 RFP에서는 방산/보안 강조,

금융 RFP에서는 안정성/규제준수 강조
와 같이 컨텍스트에 따라 사용 방식이 달라진다.

🧩 Proposal Assembly

RFP Requirement → AnswerCard 매핑 결과를 바탕으로:

제안서 스켈레톤(목차 + 섹션 구조) 자동 생성

각 섹션에 APPROVED Variant를 우선 배치

사용자는 “한 줄 한 줄 문장을 쓰기”보다
“카드와 섹션을 선택하고 조정하는 Navigator” 역할에 집중한다.

🔍 Auditability

모든 승인, 거절, 편집, 업데이트는 AuditLog에 기록된다.

나중에 “이 문장은 어디서 왔나?”라고 질문하면:

어떤 AnswerCard

어떤 원본 문서

어떤 RFP 프로젝트/Requirement
에서 파생됐는지 역추적할 수 있어야 한다.

Section 2. 기술 스펙 및 아키텍처 (Technical Specifications)

문맥(Context)
이 섹션은 **구현(Implementation)**을 위한 구체적인 명세입니다.
변수명, 데이터 구조, 디렉토리 구조는 이 기준을 엄격히 따릅니다.

2-1. 기술 스택 (Tech Stack)

Backend

Python 3.11 / FastAPI

컨테이너 기반, AWS App Runner에 배포

필요 시 AWS ECS Fargate로 이전 가능

Frontend

React + Vite

Database (Meta & Logic)

PostgreSQL

Extensions: pgvector, pg_trgm, JSONB

Storage (Files)

AWS S3 (원본 영구 보존)

/raw/{project_id}/{file_id}: 원본 파일

/parsed/...: 필요 시 중간 산출물

AI Models & External Services

Document Understanding & RFP Shredding (단일 문서 심층 해독)

Google Vertex AI – Gemini 3.0 Pro (Vision/Pro)

HWP/PPT 등 비정형 포맷을 고해상도 PDF로 변환한 뒤 Vision 입력

복잡한 표, 머리말/꼬리말, 다단 레이아웃까지 포함한 문서 전체 구조 인식

RFP 마스터에서:

요구사항 리스트(rfp_requirement)

프로젝트 요약(Project.description)

마감일(Project.deadline)

평가 기준, 제출 서류 등 추가 메타데이터 추출

용도: RFP 마스터(공고문/과업지시서) 전용.
사내 지식 문서에는 사용하지 않고, Project 생성 시 1회성 Deep Parsing에 집중.

Knowledge Hub Retrieval & Advanced Indexing (사내 지식 검색)

Google Vertex AI Search (Advanced 모드)

사내 표준 제안서, 백서, 정책, 인증서 등
재사용 가치가 높은 문서를 Advanced 모드로 인덱싱

OCR + 표 + 이미지 + 레이아웃까지 포함한 고품질 RAG

AnswerCard 후보 마이닝 및 “빈 구역” 보강용 RAG로 활용

용도: Knowledge Hub(사내 문서) 전용 RAG 엔진.

Drafting & Guardrails (제안 문장 생성 및 검증)

OpenAI GPT-5.1

Requirement + AnswerCard + (필요 시 Vertex 근거)를 입력으로
실제 제안 문장 생성 (Drafting)

Guardrail 로직과 결합하여:

Facts와 비교

과장/금지어 탐지

Risk Level 판정

OpenAI text-embedding-3-small

AnswerCard / Requirement / Project-level 유사도 계산용 임베딩

PostgreSQL pgvector와 연계

Security & Multi-Tenancy

Multi-tenancy (Workspace → Group → Project)

Role-Based Access Control (RBAC):

Admin / Manager / Viewer

Manager만:

Fact Change Proposal 승인

High Risk Variant 승인 가능

2-2. 데이터 모델링 (Schema)

아래 구조는 JSON/Python Dict 형태로 표현된 DB 스키마 명세임.

A. Project (1급 시민)
project {
  "id": "UUID",
  "workspace": "personal | team",
  "group_id": "UUID",
  "name": "2024_국방RFP",
  "industry": "defense",
  "rfp_type": "technical",
  "evaluation_criteria": { },
  "required_documents": [ ],
  "prohibited_phrases": [ ],
  "created_at": "timestamp",
  "owner_id": "UUID",
  "status": "active | archived | completed",
  "deadline": "timestamp (ISO 8601)",
  "description": "text (Project Summary extracted from RFP)"
}

B. RFP Requirement (Auto Shredding)
rfp_requirement {
  "id": "UUID",
  "project_id": "UUID",
  "requirement_text": "text",
  "requirement_type": "security | ops | ...",
  "compliance_level": "YES | PARTIAL | NO",
  "linked_answer_cards": ["UUID", ...],
  "anchor_confidence": 0.88,         // 0.0 if generated by AI (No source match)
  "status": "pending | approved | rejected"
}

C. AnswerCard (Source-Anchored, Evolvable Block)
answer_card {
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
      "bbox": [100, 200, 500, 350],
      "gcs_uri": "gs://bucket/path/file.pdf",
      "fail_reasons": ["layout_parse_failed"]
    }
  ],
  "facts": {
    "sla": 99.5,
    "cert": "ISO27001"
  },
  "variants": [
    {
      "content": "우리는 ISO27001 인증을 보유하고 있습니다.",
      "context": "public-sector",
      "status": "APPROVED",
      "risk_level": "SAFE",
      "usage_count": 50,
      "approved_by": "manager@corp.com",
      "created_from": "MINED"
    },
    {
      "content": "해당 프로젝트에서 고객의 보안 요구를 충족하기 위해 ISO27001 인증 기반의 운영 프로세스를 제공합니다.",
      "context": "defense-rfp",
      "status": "APPROVED",
      "risk_level": "SAFE",
      "usage_count": 5,
      "approved_by": "manager@corp.com",
      "created_from": "PROJECT_RESPONSE"
    },
    {
      "content": "당사 SLA 100% 보장!",
      "context": "sales_pitch",
      "status": "REJECTED",
      "risk_level": "HIGH"
    }
  ],
  "past_proposals": [
    {
      "project_id": "UUID",
      "requirement_id": "UUID",
      "used_at": "timestamp"
    }
  ]
}


AnswerCard 생성·진화 요약

origin = "MINED": Vertex AI Search 기반 사내 문서 마이닝

origin = "PROJECT": 실제 RFP 프로젝트에서 승인된 답변 승격

일반 사용자는 AnswerCard를 직접 만들기보다,
Project Workspace에서 답변을 승인/수정하는 경험만 한다.
(Answer Library는 Manager/Admin용 검수 뷰)

D. Proposal Template & Audit Log
proposal_template {
  "id": "UUID",
  "industry": "public",
  "section_order": [
    {
      "id": "company_overview",
      "recommended_cards": [ ]
    }
  ]
}

audit_log {
  "id": "UUID",
  "entity_type": "answer_card | variant | conflict | upload | requirement | project | llm_call",
  "entity_id": "UUID",
  "action": "approve | reject | edit | upload | auto_generate | search | shred | suggest_answer | assemble_proposal",
  "user_id": "string",
  "timestamp": "timestamp",
  "diff_snapshot": { },
  "debug_payload": { }
}

E. Document (Source File & Folder)
document {
  "id": "UUID",
  "workspace": "personal | team",
  "group_id": "UUID",           // NULL: Knowledge Hub / Project ID: Project-local
  "title": "filename.pdf or FolderName",
  "s3_key_raw": "string (nullable for folders)",
  "sha256": "string",
  "created_at": "timestamp",
  "parent_id": "UUID (nullable, self-reference)",
  "is_folder": "boolean (default false)",
  "vertex_sync_status": "PENDING | SYNCED | ERROR",
  "last_vertex_sync_at": "timestamp (nullable)",
  "last_sync_error": "text (nullable)"
}


[NOTE] Unified Document Table

Physical Storage

모든 문서(Source Docs & Project RFPs & Attachments)를 하나의 document 테이블에 저장

파싱/추출/권한 제어 로직 재사용

Logical Separation

Source Documents (Knowledge Hub)

group_id IS NULL 또는 별도 Library ID

폴더(is_folder = true) 구조 허용

Vertex AI Search Advanced 인덱싱 대상

Project RFPs & Attachments (Project Workspace)

group_id = project_id

RFP 마스터: Gemini Shredding 대상 (Vertex 인덱싱 X)

첨부 문서: Project-local RAG/Anchor 용도

Duplicate Policy

동일한 sha256이 같은 workspace 내에 존재할 수 있음
(같은 파일을 여러 프로젝트에서 재사용할 수 있도록)

앱 레벨(ingest.py)에서 프로젝트 단위/Knowledge Hub 단위 중복 제어

2-3. 핵심 비즈니스 로직 (Pipelines)

핵심 파이프라인은 세 축으로 나뉜다:

Knowledge Hub 파이프라인

사내 문서 → Vertex AI Search → AnswerCard 후보 (Lazy Mining)

RFP Shredding 파이프라인

RFP 마스터 → Gemini 3.0 Pro → rfp_requirement + Project 메타데이터

Compliance & Proposal 파이프라인

Requirement ↔ AnswerCard ↔ Vertex ↔ GPT-5.1

2-3-A. Knowledge Hub Pipeline

(Source Docs → Vertex → AnswerCard 후보, + Vertex Sync Policy 포함)

Step KH-1 – Zero Ingestion (업로드 & 중복·충돌 감지)

사내 문서 업로드 시:

document 레코드 생성

SHA256 해시 계산

동일 해시 및 파일명/경로 기반 충돌 감지

엑셀 스타일 Batch Conflict Resolver에서:

Keep Old / Keep New / Merge 등 사용자 선택

vertex_sync_status = "PENDING" 으로 마킹

Step KH-2 – Vertex AI Search Advanced 인덱싱

필요 시 HWP/PPT → PDF 변환

Vertex AI Search Advanced에 문서 등록

structData 메타데이터 예:

doc_id, workspace, group_id, industry, doc_type,
status, version, is_latest

인덱싱 성공:

vertex_sync_status = "SYNCED", last_vertex_sync_at = now()

인덱싱 실패:

vertex_sync_status = "ERROR", last_sync_error에 메시지 기록

Step KH-2-B – Vertex Sync Policy (정합성 유지 정책)

실시간 업데이트

문서 생성/수정/삭제 시 Vertex 인덱스에 즉시 반영 시도

실패 시 vertex_sync_status="ERROR"로 남기고,
재시도는 배치 Job이 처리

야간 Reconciliation Batch (예: 매일 00:00)

DB 기준과 Vertex 인덱스 상태를 정렬:

DB에 status="ACTIVE"인데 Vertex에 없는 문서 → 재등록

DB에 status="DELETED"인데 Vertex에 남아 있는 문서 → 삭제

vertex_sync_status="ERROR"인 문서 → 재시도

목표:
장기적으로 “DB가 Truth, Vertex는 그 캐시” 상태를 유지

Step KH-3 – AnswerCard 후보 Lazy Mining (비용 통제)

전수 스캔(Full Scan)으로 모든 문단을 카드화하지 않는다.
Lazy Mining 원칙:

금지:

업로드 시 전체 본문을 GPT-5.1에 보내
“이 문서에서 중요한 문단을 모두 AnswerCard로 만들어줘”
같은 호출은 비용 폭탄이므로 하지 않는다.

다음 경우에만 GPT-5.1 호출:

사용자 주도 카드화

사용자가 특정 문단/표를 드래그 & 선택
→ “표준 답변 카드로 저장하기(Create AnswerCard)” 클릭

백엔드에서 Vertex를 통해 주변 문맥/레이아웃을 보강한 뒤
GPT-5.1에 전달 → topic, facts, variants[0] 초안 생성

사용 패턴 기반 자동 후보화

특정 문단/표가 여러 RFP 프로젝트에서 반복적으로 인용되거나
검색/선택 빈도가 Threshold 이상이면
비동기 Job이 해당 영역을 GPT-5.1에 보내
“표준 카드 후보”로 요약 요청

생성된 후보는 answer_card로 저장:

origin = "MINED"

anchors: doc_id, page, text_snippet, content_hash 등

facts: SLA, 인증, 모듈 구성 등 구조화 정보 (가능한 범위)

variants: 기본 설명 문장 (초기 상태는 APPROVED 또는 CANDIDATE 정책에 따름)

Step KH-4 – Manager Curation (선택적 고도화)

Manager/Admin은 Answer Library에서:

잘못된 카드/Variant를 DEPRECATED / REJECTED로 처리

Fact 변경이 필요한 경우 Fact Change Proposal 생성 및 승인

일반 사용자는 이 화면을 자주 쓸 필요 없다.
→ “AI가 내부 문서를 잘 이해하고 있는지”를 가끔 검수하는 레벨

2-3-B. RFP Shredding Pipeline

(RFP Master → Universal PDF Service → Gemini 3.0 Pro → rfp_requirement)

Step RFP-1 – Project 생성 & RFP 업로드

[+ New Project] 클릭 → 공고문/과업지시서 업로드

project 레코드 생성

document에 RFP 마스터 등록 (group_id = project_id)

이 문서는 Vertex 인덱싱 대상이 아니다. (Project 전용)

Step RFP-2 – Universal PDF Service (SPOF 방지)

**Universal PDF Service (전용 변환 컨테이너)**에서
HWP/PPT/DOCX → 고해상도 PDF로 변환

한글/HWP 전용 폰트 포함 Docker 이미지

/health로 상태 모니터링

변환된 PDF는 S3에 저장 (Gemini 입력용)

변환 품질/실패 Fallback 정책

레이아웃 보존 실패 감지 (표 깨짐 등):

로그에 플래그 기록

Shredding 시 “텍스트 기반 분석 모드”로 강등

UI에 “고품질 파싱 실패, 일부 구조 손실 가능” 경고 표시

변환 완전 실패:

업로드 Step에서 에러 반환

원본 파일은 S3에 보존 (사후 수동 처리 가능)

Step RFP-2-B – Context Caching (비용 최적화)

변환된 RFP PDF는 Gemini 3.0 Pro 호출 전
Context Cache에 업로드 (TTL 예: 1~2시간)

하나의 RFP에 대해:

Shredding, Summary, Deadline 추출 등 여러 LLM 호출 필요

Cache ID를 재사용하여 토큰 비용 절감

Step RFP-3 – Gemini 3.0 Pro Vision/Pro Shredding

모델: Gemini 3.0 Pro (Vision/Pro, Thinking Mode ON)

입력:

변환된 PDF 또는 Cache Reference

“이 문서는 한국 공공/민간 제안요청서(RFP)다”라는 도메인 설명

RFP 구조 JSON Schema (rfp_requirement, evaluation_criteria, deadline, summary, …)

출력(JSON):

rfp_requirement[] 리스트

Project-level summary (project.description)

Project deadline

기타 평가 기준, 제출 서류 리스트 등 (필요 시 확장)

Step RFP-4 – DB 저장 및 Anchoring

rfp_requirement 테이블에 요구사항 저장

project 레코드에 summary, deadline 반영

각 Requirement별로 Anchor 정보 저장:

source_doc_id (document.id)

page, section_path (Best Effort)

source_snippet (원문 문장/문단)

content_hash (SHA256)

이후 Compliance/Proposal 단계에서는
Gemini를 재호출하지 않고 DB 기반으로만 동작

Step RFP-5 – 실패 시 Degradation

Shredding 완전 실패:

RFP를 “수동 모드 프로젝트”로 전환

UI: “자동 요구사항 추출 실패 – 수동 등록 모드로 전환합니다”

부분 실패:

Summary/Deadline 등 성공한 필드만 Project에 반영

Requirements는 수동 입력 또는 후속 재시도

2-3-C. Compliance & Proposal Pipeline

(Requirement ↔ AnswerCard ↔ Vertex ↔ GPT-5.1)

Step C-1 – Compliance Matrix (Requirement ↔ AnswerCard 매핑)

AnswerCard 기반 매핑 (Primary)

rfp_requirement.requirement_text를 OpenAI Embedding으로 임베딩

answer_card 벡터와 pgvector 유사도 검색

산업/기관/입찰 유형 등 메타 필터 적용

적절한 카드가 존재하면:

linked_answer_cards에 UUID 추가

anchor_confidence 계산 및 저장

Vertex RAG 기반 보강 (Secondary)

AnswerCard로 커버하지 못하는 요구사항 → “빈 영역”

Vertex AI Search Advanced에서 근거 검색

찾은 스니펫/표/이미지 캡션을 GPT-5.1에 함께 전달해 Draft 보완

Step C-2 – OpenAI GPT-5.1 Drafting & Guardrail

입력:

Requirement 텍스트

연결된 AnswerCard facts + APPROVED variants

(필요 시) Vertex 스니펫

Project 컨텍스트 (industry, rfp_type, prohibited_phrases, …)

출력:

제안 답변 Draft 텍스트

Guardrail (guardrail.py):

Draft vs AnswerCard.facts 비교

금지어/과장 표현 탐지

Risk Level (SAFE / WARN / HIGH) 판별

Step C-3 – 사용자 승인 & AnswerCard 진화

사용자는 Project Workspace에서:

[Approve as-is]

[Edit & Approve]

[Reject] 버튼으로 Draft를 처리

승인 시:

유사 AnswerCard 존재:

기존 카드에 Variant 추가 (created_from = "PROJECT_RESPONSE")

유사 AnswerCard 없음:

새 AnswerCard 생성 (origin = "PROJECT")

모든 승인 시:

past_proposals에 사용 이력 추가

AI가 기존 facts와 다른 수치를 사용했다면:

Fact Change Proposal 생성

Manager가 승인해야만 AnswerCard.facts 업데이트

2-3-D. Compliance & Audit (LLM 호출 스냅샷 정책)

RFP OS는 단순히 “지금 좋은 답”이 아니라,
**“그때 AI가 무엇을 근거로 그런 답을 했는지”**를 설명할 수 있어야 한다.

D-1. LLM 호출 기록 범위

다음 범위의 호출은 Audit 대상이다:

Vertex AI Search 검색 호출

Gemini 3.0 Pro RFP Shredding 호출

GPT-5.1 기반 Answer Suggestion / Proposal Draft 생성 호출

각 호출에 대해 최소한 다음 정보를 audit_log에 남긴다:

entity_type: "llm_call"

action: "search" | "shred" | "suggest_answer" | "assemble_proposal"

user_id 또는 시스템 계정

timestamp

model_name (예: vertex-search, gemini-3.0-pro, gpt-5.1)

input_summary: 전체 프롬프트는 아니어도 요약 또는 해시

debug_payload (JSONB):

Vertex Search:

상위 N개 검색 결과의

doc_id, page, structData, text_snippet, score

Gemini Shredding:

추출된 요구사항/요약의 원본 source_snippet

GPT-5.1 Suggestion:

실제로 참고한 AnswerCard/Anchor 목록

D-2. “재현”이 아닌 “당시 상태 스냅샷” 원칙

Vertex/Gemini/OpenAI의 내부 알고리즘은 시간이 지나며 변경된다.

동일 입력으로 동일 결과를 재현하는 것은 현실적으로 불가능하다.

따라서 목표는:

**“당시 AI가 어떤 내용을 근거로 어떤 결과를 제시했는지”**를 증명하는 것.

구체적으로:

Vertex Search 결과에 대해서는:

해당 시점 사용자에게 노출된 text_snippet을 그대로 AuditLog에 저장.

Gemini/GPT-5.1이 참고한 근거에 대해서는:

최종 Prompt에 포함된 Anchor/문서 스니펫을 별도 필드로 기록.

2-4. 디렉터리 구조
app/
 ├─ routes/               # API Endpoints
 ├─ services/
 │    ├─ ingest.py        # 문서 업로드, 해시, 중복/버전 충돌 감지, 라우팅
 │    ├─ extract.py       # 기본 텍스트 추출 및 포맷 감지
 │    ├─ preprocess.py    # Text Cleaning & Structure Reconstruction
 │    ├─ indexer.py       # Vertex AI Search 인덱싱 & 메타데이터 동기화 (Sync Batch 포함)
 │    ├─ search.py        # Semantic Search Engine (Vertex + pgvector 래핑)
 │    ├─ shredder.py      # Gemini 3.0 Pro 기반 RFP Shredding (단일 문서)
 │    ├─ answers.py       # AnswerCard Management (생성/변경/Fact Proposal)
 │    ├─ proposal.py      # Proposal Assembly Engine
 │    ├─ guardrail.py     # OpenAI 기반 Risk Filtering & Policy
 │    ├─ chunker.py       # (필요 시) 내부 Chunking Logic
 │    ├─ embed.py         # OpenAI Embedding 호출 (pgvector용)
 │    ├─ vertex_client.py # Vertex Search/Gemini 클라이언트 + Search Gateway + Audit
 │    ├─ openai_client.py # OpenAI GPT-5.1 & Embedding 클라이언트
 ├─ models/               # ORM Models
 │    ├─ project.py
 │    ├─ rfp_requirement.py
 │    ├─ answer.py        # AnswerCard Model
 │    ├─ audit_log.py
 │    ├─ document.py
 │    ├─ guardrail_policy.py
 │    ├─ project_member.py
 │    ├─ app_user.py
 ├─ secrets/              # GCP Credentials (GitIgnored)
 └─ utils/
      ├─ semantic_hash.py
      ├─ debug_logger.py
      └─ pdf_hwp_parser.py   # HWP/PPT → PDF 변환 및 기본 파싱

Section 3. UI/UX 디자인 스펙 (User Interface Specifications)

문맥(Context)
이 섹션은 사용자가 경험할 화면과 인터랙션의 기준입니다.
**"편집 도구(Editor)"가 아닌 "분석 및 자산화 도구(Analyzer & Asset Manager)"**로서의 정체성을 확립합니다.

3-1. 디자인 철학 (Design Philosophy)

Sanitized Professionalism (정제된 전문성)

복잡한 버튼이 나열된 기존 B2B ERP 스타일을 지양

Google Workspace / Notion과 유사한
White & Light Gray 베이스에 Blue Primary (#0B57D0)를 사용하여
신뢰감과 청결함 제공

Navigator, Not Editor (작성하지 않고 결정한다)

사용자는 이곳에서 문장을 “작성”하지 않는다.

AI가 찾아낸 것·조합한 것을
**"승인(Approve)", "수정 후 승인(Edit & Approve)", "거절(Reject)"**할 뿐이다.

따라서 UI의 핵심은 Input Field가 아니라
Decision Button (O/X)과 Export Action이다.

Trust Visualization (과정의 시각화)

단순 "로딩 중..." 스피너 대신:

"RFP 구조 분석 중...(Gemini)"

"사내 지식 매칭 중...(Vertex)"

"표준 답변 조합 중...(GPT-5.1)"
과 같이 AI의 사고 과정을 텍스트와 Stepper로 투명하게 보여준다.

3-2. 정보 구조 (Information Architecture - App Shell)

화면은 좌측 고정된 **사이드바(LNB)**와
우측 메인 워크스페이스로 구성된다.

A. 좌측 사이드바 (LNB - Gemini Style)

폭: 260px (Collapsible)

배경: #F7F7F8 (Light Gray)

구조

Top (Action)

[+ New Project] 버튼 (Primary Blue)

클릭 시 우측 화면이 “RFP 업로드 & Shredding 온보딩 화면”으로 전환

Middle (Context - Scrollable)

Recent Projects 헤더

프로젝트 리스트 (예:
📄 2025_국방광대역_제안,
📄 금융그룹_Cloud_RFP …)

클릭 시 우측에 해당 프로젝트의 ‘Requirements Matrix’ 로드

Bottom (Management - Fixed)

Divider

🏛️ Knowledge Hub

📚 Answer Library (답변 카드 관리 – Manager/Admin 중심)

📂 Source Documents (원본 문서 관리 – Vertex 인덱싱 상태 포함)

⚙️ Admin & Team (멤버 초대 및 권한, Guardrails, Usage)

👤 User Profile

3-3. 핵심 화면 상세 스펙 (Key Screen Specs)
1) Landing & Onboarding (New Project Wizard)

진입: [+ New Project] 클릭 시

레이아웃: 중앙 정렬, 여백이 많은 Clean View

구성

Hero Message:

"새로운 RFP 프로젝트를 시작합니다. 공고문 또는 과업지시서를 업로드하세요."

Drop Zone:

점선 박스, 파일 드래그 앤 드롭 (PDF/HWP/PPT/DOCX)

Sample Trigger:

"샘플 RFP로 분석 결과 미리보기" 텍스트 링크

Interaction (Analysis State)

업로드 즉시 중앙에 Progress Stepper:

RFP 구조 분석 (Gemini Shredding)

요구사항 파쇄 (Requirement 추출)

사내 지식 매칭 (AnswerCard & Vertex 기반 매칭)

특이사항

동일 해시의 RFP가 기존 프로젝트에 존재할 경우:

“기존 프로젝트 RFP와 동일한 파일입니다” 알림

선택지:

기존 프로젝트 재활용

새 프로젝트로 진행

2) Project Workspace (Result Table)

진입: 분석 완료 직후 또는 LNB에서 프로젝트 클릭 시

레이아웃: Data Grid (Table) 중심 – 편집기가 아님

상단 헤더

프로젝트명, 산업/기관, 마감일(D-Day)

Export Group:

[Excel], [Word] 아이콘 버튼 (가장 중요한 Call-to-Action)

Status Summary:

🟢 완료 n건 / 🟡 검토 필요 m건 / 🔴 답변 없음 k건

메인 테이블 (Requirements Matrix)

Status: 🟢 완료 / 🟡 검토 필요 / 🔴 답변 없음

Requirement:

RFP 원문 요구사항 (클릭 시 우측 패널 + 원문 팝업)

AI Suggestion:

AnswerCard + Vertex + GPT-5.1 기반 요약 답변 (1~2줄)

Source:

근거 문서 뱃지 (예:
[표준제안서_v2.pdf, p.45], [ISO27001_인증서.pdf])

Score:

적합도 % (Progress Bar)

Risk:

SAFE / WARN / HIGH (Guardrail 결과)

Slide-over Panel (Detail View)

Row 클릭 시 우측에서 슬라이드 패널:

상단

Requirement 원문 전체

RFP 내 위치 정보(섹션 경로, 페이지 등)

중단

AI Generated Draft (Full Text)

High Risk 플래그/사유 (있는 경우)

하단

Alternative Variants (AnswerCard의 기존 표현들)

관련 AnswerCard 리스트

액션 버튼

[Approve as-is]

[Edit & Approve]

[Reject]

3) Knowledge Hub Manager (Asset Management)

진입: LNB > Knowledge Hub

Tab A: Answer Library

카드형(Grid) 또는 리스트형(List)

컬럼:

Topic, 주요 Facts, 사용된 프로젝트 수, 최근 사용일 등

검색/필터:

키워드, 태그, 산업, origin(MINED/PROJECT), status(ACTIVE/DEPRECATED)

카드 클릭 시:

Facts 확인/편집 (Fact Change Proposal 생성)

Variants 상태 변경 (APPROVED / REJECTED)

Anchors 및 past_proposals(사용 이력) 조회

Tab B: Source Documents

파일 탐색기 스타일

컬럼:

문서명, 업로드일, 파일 크기, 파싱 상태, Vertex 인덱싱 상태

기능:

[Re-Parse] (파싱/변환 재실행)

[Re-Index] (Vertex 재인덱싱)

[Delete]

4) Admin & Team (Settings)

진입: LNB > Admin & Team

구성

Member Management

초대 필드 (이메일 + [Invite])

멤버 리스트:

이름 | 이메일 | 권한(Role) | 상태

Roles:

Admin: 설정, Guardrails, 인프라/요금 관련

Manager: 답변/Fact 승인

Viewer: 읽기 전용

Policy & Guardrails

금지어(Blacklist) 관리

High Risk 키워드 설정

GuardrailPolicy DB와 연동

Usage

프로젝트별 토큰 사용량 및 비용 추정

Vertex/Gemini/OpenAI 호출 통계 대시보드

3-4. 시각적 스타일 가이드 (Visual Style)

Color Palette

Primary: Azure Blue #0B57D0 (Action Button, Active State)

Background:

Main: #FFFFFF

Sidebar/Background: #F7F7F8

Text:

Heading: #1F1F1F

Body: #424242

Placeholder: #9AA0A6

Semantic Colors

Success (Approved): #0E7A4E

Warning (Review Needed): #EFB81A

Error/Risk (Rejected/High Risk): #D0362D

Typography

System Font Stack (San Francisco, Segoe UI, Noto Sans KR)

데이터 테이블 내 폰트: 13px~14px (밀도 있게)

Component

모든 컨테이너 border-radius: 8px

Shadow는 최소화, border: #E0E0E0로 구획 구분

Section 4. 실행 로드맵 및 상태 관리 (Roadmap & Milestones)

[🤖 AI Interaction Rule]
이 섹션은 프로젝트의 진척도(Progress Bar) 역할을 한다.
AI는 하나의 기능을 구현하고, 테스트가 통과되었음을 확인하면
해당 항목의 체크박스를 [ ]에서 **[x]**로 변경해야 한다.

개발 시작 전, 항상 이 섹션을 읽어
**현재 단계(Current Phase)**와 **다음 작업(Next Task)**을 파악한다.
순서를 건너뛰지 말 것. 의존성(Dependency)은 위에서 아래로 흐른다.

4-0. Phase 0: Foundation & Service Accounts (GCP Ready)
Goal: GCP/OpenAI 연동을 위한 클라이언트 및 데이터 모델 준비.

[x] Update requirements.txt: google-cloud-aiplatform, discoveryengine, google-auth 추가.

[x] Create VertexAIClient: app/services/vertex_client.py (Gemini 3.0 Pro & Search 연동).

[x] Create OpenAIClient: app/services/openai_client.py (GPT-5.1 & Embedding 연동).

[x] Update Models:
    - Document: vertex_sync_status, group_id 추가.
    - AnswerCard: origin, status 추가.

DB & Schema Design

 Project Table 신설: models/project.py 생성 및 projects 테이블 마이그레이션

 AnswerCard Table 업그레이드: answers → models/answer.py

 anchors (JSONB) 컬럼 추가

 variants (JSONB) 컬럼 추가

 facts (JSONB) 컬럼 추가

 project_id (UUID) 컬럼 추가 (Origin Tracking)

 RFP Requirement Table 신설: models/rfp_requirement.py

 Audit Log Table 신설: models/audit_log.py

Legacy Code Refactoring

 Dependencies Update: olefile, pyhwp, pdfplumber 등 파싱 관련 라이브러리 추가

 Service Layer 분리: 기존 services/ 폴더 로직을
ingest, answers, search 등 역할별로 재정비

4-1. Phase 1: Knowledge Hub Pipeline (Vertex AI) (Weeks 1-3)

Goal
"파일 업로드 → 충돌 해결 → Vertex Indexing → AnswerCard Mining"까지의 흐름 완성.

Backend: Knowledge Hub Pipeline

[x] Update indexer.py: Vertex AI Search 인덱싱 및 동기화 로직 구현.

[x] Update ingest.py: Knowledge Hub 업로드와 Project 업로드 분기 처리.

[x] Update search.py: Vertex AI Search + pgvector 하이브리드 검색 구현.

Backend: Ingestion & Parsing Engine

 Advanced Parser 구현: utils/pdf_hwp_parser.py

 PDF Layout/Section 추출 로직 (Best Effort)

 Semantic Hash(SHA256) 생성 로직

 Conflict Detection Service: services/ingest.py

날짜/버전 파싱

문서 간 유사도 및 충돌 감지

사용자 개입이 필요한 "Conflict List" 리턴 API

Backend: Knowledge Management

 AnswerCard CRUD API: 앵커와 Variants를 포함한 생성/조회/수정 API

 Fact-based Risk Gating: services/guardrail.py

Facts와 Variant 내용을 비교하여
Risk Level (Safe/High) 판별하는 OpenAI 기반 LLM 로직

Frontend: Guided Onboarding UX

 Smart Uploader UI: 파일 업로드 시 실시간 분석 상태 표시

 Batch Conflict Resolver: 엑셀 스타일의 충돌 해결 테이블 UI

 Dashboard Integration: 온보딩 완료 후 대시보드로 자연스럽게 전환

4-2. Phase 2: Proposal Engine & Optimization (Weeks 4-6)

Goal
자산화된 지식을 활용해 실제 RFP 제안서 초안을 만들고, 비용을 통제하는 단계.

Backend: RFP Processing

 [x] On-Demand Shredder: services/shredder.py

 Gemini 3.0 Pro 기반 RFP Shredding 로직 구현 (VertexAIClient 활용)

 비용 산정(토큰 계산) 로직 (Heuristic)

 [x] Proposal Assembly Engine: services/proposal.py

 OpenAIClient (GPT-5.1) 기반 Wiring 완료

 Requirement ↔ AnswerCard 매핑 알고리즘

 Project & Requirement API: routes/projects.py 생성 및 연동 (기존 구현 유지)

Frontend: Proposal Editor

 [x] Requirement Mapper UI

RFP 요구사항과 매칭된 AnswerCard를 보여주는 뷰

ProjectWorkspacePage와 연동 완료

4-3. Phase 3: Enterprise Hardening (Weeks 7+)

Goal
보안, 감사, 그리고 운영 안정성 확보.

Security & Audit

 Audit Log Recording:

승인, 반려, 편집 등 주요 액션 발생 시 로그 저장 미들웨어 적용

AuditLogMiddleware 구현 완료

 RBAC (Role-Based Access Control):

Manager만 승인(Approve) 버튼을 누를 수 있도록 권한 제어

verify_manager_role 적용 완료

DevOps & Monitoring

 Cost Dashboard:

프로젝트별 토큰 사용량 및 비용 트래킹

/admin/cost API 구현 완료 (현재는 단순 추정 로직)

 Anchor Health Check:

파싱 실패율 및 앵커링 성공률 모니터링

/admin/health/anchors API 구현 완료

4-4. 최종 완료 기준 (Definition of Done)

모든 체크박스가 [x]가 되었을 때, 아래 기준을 최종 검수한다.

 Migration Integrity

기존 데이터와 신규 데이터가 공존하며,
새로운 Anchor 구조로 매핑되는가?

(Project/AnswerCard JSONB 스키마 확인 완료)

 Conflict UX

충돌 해결이 팝업 노가다가 아니라
Batch Resolver로 매끄럽게 동작하는가?

 Risk Gate

High Risk Variant는 Approver 권한 없이는 승인 불가한가?

(RBAC 적용으로 Manager만 승인 가능)

 Cost Control

Shredding는 반드시 **On-Demand(버튼 클릭)**로만 실행되는가?

(API에서 confirm_cost 파라미터 강제 확인)

 Audit Trail

DB 조회 시, 누가 언제 무엇을 승인했는지 추적 가능한가?

(AuditLogMiddleware 및 DB 저장 확인 완료)

4-5. Phase 4: Wiring & Integration (The Missing Link)

Goal
"UI Shell"과 "Backend Logic"을 연결하여 실제 동작하는 애플리케이션 완성.

A. Project & Onboarding (시작하기)

 [x] Create Project: LandingPage → POST /projects

 [x] Upload File: OnboardingWizardPage → POST /ingest/upload

 [x] Check Conflict: POST /ingest/check

 [x] Resolve Conflict: POST /ingest/resolve

 [x] Estimate Cost: POST /shredder/estimate

 [x] Trigger Analysis: POST /shredder/trigger

B. Workspace & Requirements (작업 공간)

 [x] List Requirements: GET /projects/{id}/requirements

 [x] View Detail: GET /requirements/{id}

 [x] Approve/Reject: PATCH /requirements/{id}/status

 [x] Edit Response: POST /requirements/{id}/response

 [x] Export: GET /projects/{id}/export

 [x] Delete Project: DELETE /projects/{id}

 Complete Project: PATCH /projects/{id}/status

 Add Member: POST /projects/{id}/members

C. Knowledge Hub (지식 관리)

 [x] List Answer Cards: GET /answers

 [x] Search Answer Cards: GET /answers/search

 [x] Update Answer Card: PATCH /answers/{id}

 [x] List Documents: GET /documents

 [x] Re-Parse Document: POST /documents/{id}/reindex

 [x] Delete Document: DELETE /documents/{id}

D. Admin & Settings (관리자)

 Invite Member: POST /admin/invite

 List Members: GET /admin/members

 Update Role: PATCH /admin/members/{id}/role

 System Status: GET /admin/system/status

 Update Guardrails: POST /admin/guardrails

 Cost Dashboard: GET /admin/cost

4-6. Backend Implementation Gaps & Mock Audit (Current Status)

현재 Backend는 Frontend와의 연동(Wiring)을 최우선으로 구현되었으며,
다음 기능들은 Mock 또는 단순화된 로직으로 구현되어 있다.
실제 운영 환경 배포 전 반드시 구현이 필요하다.

A. Admin & Settings (관리자)

Guardrails (가드레일)

Status: Implemented

Note: GuardrailPolicy 테이블 및 DB 연동 완료

Cost Dashboard (비용 통계)

Status: Partial / Mock

Gap: GET /admin/cost는 AuditLog의 행 개수에
단순 단가(100원)를 곱해 계산

실제 토큰 사용량(tokens_used) 기록 및 집계 로직 없음

System Status (시스템 상태)

Status: Mock

Gap: GET /admin/system/status는 하드코딩 상태 반환

실제 인프라 모니터링 연동 없음

Member Management (멤버 관리)

Status: Implemented (Full)

Note: AppUser, ProjectMember 기반 멤버십 관리 및 접근 제어 구현 완료

B. Projects & Requirements (프로젝트)

AI Suggestion (AI 제안)

Status: Implemented

Note: map_requirements_to_answers에서
RAG(AnswerCard + Vertex) 및 OpenAI LLM 로직 구현

Sources & Past Proposals

Status: Implemented

Note: AnswerCard anchors, past_proposals UI 연동 완료

C. Shredder & Ingest (분석 및 수집)

Cost Estimation (비용 예측)

Status: Heuristic

Gap: calculate_shredding_cost는
텍스트 길이/파일 크기 기반 단순 추정

실제 LLM 토크나이저 기반 정확 계산 아님

Conflict Resolution (충돌 해결)

Status: Simplified

Gap: 충돌 해결 시 클라이언트가 파일을 다시 업로드하는
Stateless 방식을 가정

서버 측 임시 저장소/캐시를 활용한 최적화 여지 있음

D. Authentication & Groups (인증 및 그룹)

User Authentication (사용자 인증)

Status: Hardcoded

Gap: 일부 모듈에서 user_email, user_id 하드코딩 사용

실제 JWT/Session 기반 인증 미적용

Section 5. UI - Backend Gap Analysis & Next Steps

섹션 5는 섹션 4까지의 내용을 바탕으로
전체적인 MVP를 완성한 이후에 진행한다.

5-1. Frontend Ahead (UI는 있으나 Backend 미구현)

 Advanced Conflict Resolution API: ingest.py 고도화

충돌 유형(Version/Content/Metadata) 세분화

Merge/Keep Old/Keep New 액션 처리 API

 Cost Pre-calculation API: shredder.py 고도화

업로드 파일 분량을 미리 분석해 예상 시간/비용 리턴

 Detailed Citation History: AnswerCard 모델 보강

단순 usage_count를 넘어,
어떤 프로젝트/문서/페이지에서 인용되었는지 추적

Read: GET /answers 응답에 past_proposals 포함

Write: POST /answers/{id}/usage 엔드포인트 추가

 Dynamic Guardrail API: guardrail.py 연동

금지어/High Risk 키워드 설정 API

 Workspace Member Management: admin.py & user.py

AppUser 모델에 workspace, role, status 등 필드 추가

초대/조회/권한 변경 API 구현 및 UI 연동

 Knowledge Hub Wiring: answers.py & documents.py

GET /answers 응답 포맷 확장 (topic, summary, usageCount 등)

GET /documents/list 응답 포맷 확장 (parsingStatus, fileSize 등)

 Project Visibility & Membership

ProjectMember 테이블 신설

생성 시 작성자 자동 멤버 추가

프로젝트 목록 조회 시 멤버십 기반 필터링

5-2. Backend Requirements (Completed)

Folder Management API (Completed)

 POST /folders: 새 폴더 생성

 DELETE /folders/:id: 폴더 삭제 (자식 문서 cascade 삭제)

 Document 모델에 parent_id, is_folder 필드 반영

Tree View API (Completed)

 GET /documents/tree: 계층 구조 문서 트리 반환

 POST /upload가 folder_id를 받아 해당 폴더 아래 문서 저장

5-3. Frontend-Backend Integration (Fixes)

문맥(Context)
로컬 테스트 중 사용되던 Mock Data 영역을 실제 API 연동으로 교체한다.

 Answer Library Integration: AnswerLibraryPage.tsx

mockAnswers 제거, GET /answers 연동

 Source Documents Integration: SourceDocumentsPage.tsx

mockDocuments 제거, GET /documents 연동

Re-Parse, Delete 연동

 Projects List Integration: ProjectsPage.tsx

Mock 제거, GET /projects 연동

진행률, 카드 수 등 통계 매핑

 RFP Upload Flow Fix: OnboardingWizardPage.tsx

프로젝트 생성 전 파일 업로드 시 project_id 누락 문제 해결

project_id = None일 경우 Default Workspace("personal") 처리 확인

 Admin & Guardrails Verification

GET /admin/guardrails / GET /admin/members 연동

 Sidebar Project List: EnterpriseLayout.tsx

Mock 제거, GET /projects 연동

Active/Completed 상태 필터링

 Project Creation Flow: LandingPage.tsx

생성 후 /project/{id}/workspace로 리다이렉트

GET /projects/{id}로 실제 정보 표시

 Document Management UI: SourceDocumentsPage.tsx

폴더 생성/이동/삭제 연동

폴더 우선, 최신순 정렬 및 다중 선택 UI

Global Knowledge Hub 문서(group_id IS NULL)만 표시

 Project Management Features

삭제, 완료 처리, 멤버 추가 기능 구현

마감일/설명 표시

AI 생성 답변 Trust Score 기본값 0.0 설정

 Feedback Fixes (Round 2)

RFP Extraction: shredder.py가 Deadline/Summary를 Project에 저장

Knowledge Hub Filtering: get_document_tree가 Global 문서만 반환

Sidebar UI: 프로젝트 삭제/완료 Dropdown Menu 추가

File Handling Rule: 로컬 파일은 항상 Binary Mode(rb)로 읽고
extract_text_pages로 전달해 포맷 자동 감지

Section 6. 배포 준비 및 운영 이관 (Deployment & Operations)

문맥(Context)
MVP 개발이 완료되었으며, 이제 “내 컴퓨터(Localhost)”에서만 돌아가는 코드를
“실제 사용자(Production)”가 쓸 수 있는 환경으로 옮기는 과정이다.

단순히 서버에 코드를 올리는 것을 넘어, 다음 5가지 핵심 목표를 달성한다.

환경 격리 (Environment Isolation)

데이터 영속성 (Data Persistence)

성능 최적화 (Optimization)

보안 강화 (Security Hardening)

운영 자동화 (CI/CD & Ops)

6-1. 인프라 아키텍처 스펙 (Infrastructure Specifications)

Compute: AWS App Runner (기본값)
같은 AWS 계정/VPC 내에서 ECS Fargate로 이전 가능한 구조 유지.

A. Computing (AWS/Cloud)

Frontend: S3 Static Website Hosting + CloudFront (CDN)

Backend: AWS App Runner (FastAPI 컨테이너)

ECR 이미지 기반 배포

자동 스케일링, 헬스체크, 롤링 배포

Gateway / Endpoint: App Runner Custom Domain (+ AWS ACM)

Route 53 도메인 → App Runner 서비스 매핑

필요 시 CloudFront 또는 ALB + WAF 추가

B. Data & Storage

Database: AWS RDS for PostgreSQL (v15+)

스펙: db.t3.medium 이상, Multi-AZ 권장

Extensions: pgvector, pg_trgm

Private Subnet, App Runner VPC Connector로 접근

Object Storage: AWS S3 Standard

/raw/{project_id}/{file_id}, /parsed/... 구조

Public Access Block 활성화

Presigned URL을 통해서만 접근

VPC & 네트워크

RDS/내부 리소스: Private Subnet

App Runner: VPC Connector로 내부 리소스 접근

인바운드: App Runner HTTPS (또는 CloudFront/ALB)로만 허용

6-2. 배포 파이프라인 로직 (Deployment Pipeline)

Step 1 – Code Push & Test (CI)

main 브랜치 푸시 → GitHub Actions 트리거

pytest로 핵심 로직 테스트

MyPy/Ruff 등 Linting

실패 시 배포 중단

Step 2 – Container Build

Docker 이미지 빌드:

backend:{git_sha}, backend:latest 태그

AWS ECR에 Push

Step 3 – App Runner Service Update (CD)

Terraform/CDK로 인프라 상태 관리

App Runner가 새로운 ECR 태그를 참조하도록 업데이트

헬스체크 실패 시 자동/수동 롤백

Step 4 – Migration & Health Check

배포 직후:

alembic upgrade head 자동 실행

/health 엔드포인트 200 OK 확인

성공 시:

Slack/Teams Webhook “배포 완료” 알림

실패 시:

직전 이미지로 롤백

6-3. Environment & Security Configuration (Milestone)

A. Secret Management

.env는 Dev/Prod 분리.

Prod에서는 .env 대신:

AWS SSM Parameter Store / Secrets Manager 사용

DB URL, OpenAI API Key, JWT Secret, GCP 관련 설정 등 모두 Secret으로 관리

App Runner에는 Secrets 연동 기능으로 ENV 주입

컨테이너 이미지 내부에 .env를 굽지 않는다.

B. Cross-Cloud Auth: AWS ↔ GCP (Keyless 원칙)

운영/스테이징 환경에서:

GCP Service Account JSON Key 파일을 이미지/코드/.env에 저장 금지

대신:

AWS IAM Role ↔ GCP Service Account 간
Workload Identity Federation 구성

App Runner가 부여받은 AWS 자격을 통해
Vertex/Gemini API를 호출 (Keyless 인증)

로컬 개발 환경:

gcloud 로그인 또는 단기 테스트용 키 사용 가능

단, 해당 키는 Git/Docker/공유 스토리지에 커밋/업로드 금지

C. CORS & Allowed Origins

프론트엔드 도메인(예: https://app.rfp-os.com)만 허용

OPTIONS Preflight에 대해 FastAPI에서 명시적 허용

스테이징 도메인도 필요 시 추가하되, * 와일드카드는 지양

D. SSL/TLS Setup

Route 53에서 도메인 관리

AWS Certificate Manager(ACM)으로 TLS 인증서 발급

App Runner Custom Domain 또는 CloudFront/ALB에 인증서 연결

모든 외부 트래픽을 HTTPS로 강제

6-4. Database & Storage (Milestone)

Production DB Setup

로컬/테스트 DB → AWS RDS(PostgreSQL)로 마이그레이션

project, answer_card, rfp_requirement, audit_log 테이블 및
인덱스/확장(pgvector, pg_trgm) 설정 확인

DB Backup Strategy

RDS 자동 백업(일/주 단위) 및 보존 기간 설정

중대 변경 전 수동 스냅샷 정책

분기/반기마다 “복구 리허설” 수행

S3 Bucket Policy

운영용 / 개발/스테이징용 버킷 분리

Public Access Block + 최소 권한 IAM Role(rfp-backend-s3-role)

Lifecycle 정책:

중간 산출물은 N일 후 Glacier 또는 삭제

원본 RFP 문서는 장기 보관

6-5. Backend Deployment (Milestone)

Dockerfile Optimization

Multi-stage build로 이미지 경량화

빌드 도구/테스트 의존성은 최종 이미지에서 제거

/health는 경량 로직 유지

Gunicorn/Uvicorn Config

워커 수, 타임아웃, Keep-alive 등 적정 설정

FastAPI + Uvicorn/Gunicorn 조합 기준

App Runner Service Config

초기에는 소형 리소스로 시작 후 모니터링 기반 증설

Auto Scaling:

최소/최대 동시 요청 수 및 인스턴스 수 설정

Health Check:

경로: /health

허용 응답 시간/실패 허용 횟수 정의

(옵션) Reverse Proxy / WAF 연동

초기 MVP: App Runner 엔드포인트 직접 사용

향후:

CloudFront 또는 ALB + WAF를 앞단에 두어
IP 제한, Rate Limiting, Geo Blocking 등 적용

6-6. Frontend Deployment (Milestone)

Production Build

npm run build 시 Minification, Tree Shaking

Source Map은 Prod에서 비활성 또는 보호된 경로에만 보관

Serving Strategy

빌드 산출물을 S3 버킷(정적 호스팅 전용)에 업로드

CloudFront로 전 세계 엣지에서 캐싱/서빙

CloudFront Origin은 해당 S3 버킷

Cache Control

JS/CSS 등 정적 자산:

파일명에 해시 포함, 장기 캐싱(max-age) 허용

HTML:

짧은 캐시 또는 no-cache 정책 유지

6-7. CI/CD & Monitoring (Milestone)

GitHub Actions

main 브랜치 푸시 시:

백엔드: 테스트 → Docker Build → ECR Push → App Runner Update

프론트엔드: 테스트 → npm run build → S3 Sync → CloudFront Invalidation

Log Aggregation

App Runner 로그를 CloudWatch Logs로 수집

에러율, 응답 시간, 요청 수 지표 대시보드화

필요 시 Sentry/Datadog 등과 연동

Health Check Monitoring

/health에 대한 주기적 모니터링 (CloudWatch Synthetics 등)

실패 시 Slack/Teams/Webhook 알림

App Runner, RDS, S3, 비용 지표에 대한 알람 세트 구성

예: RDS CPU 80% 이상 지속, 5xx 증가, 월간 비용 급증 등