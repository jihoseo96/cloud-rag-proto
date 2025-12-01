📘 Enterprise RFP OS — Project Instruction (v2025.11.28)
Section 1. 프로젝트 정의 및 핵심 가치 (General & Philosophy)
문맥(Context): 이 섹션은 개발의 **대원칙(Rule)**이자 **방향성(Compass)**입니다. 기술적 의사결정 시 이 원칙에 위배되는 코드는 작성하지 않습니다.

1-1. 프로젝트 정의 (Mission)
“Zero Setup → Guided Control → Verified Confidence”

이 제품은 단순 RAG 챗봇이 아니라, 기업의 RFP 제안서 작성을 위해 설계된 **엔터프라이즈 지식 운영체제(OS)**다.

사용자가 문서를 “업로드” 하면:

AI가 분석 및 충돌 감지

중요 1~2개만 사용자에게 승인 요구

검증된 지식 AnswerCard로 자산화

RFP 요구사항 파쇄 및 매핑

Proposal Skeleton 자동 생성

모든 과정은 Audit Log로 추적 가능

1-2. 개발 5대 대원칙 (Prime Directives)
Trust over Magic: 자동화보다 더 중요한 것은 운영자가 통제하고 있다고 느끼게 하는 UX다. "알아서 했습니다"보다 "이것을 승인하시겠습니까?"가 더 낫다.

Bulletproof Anchoring (현실적 3중 보호):

Semantic (해시/문장 기반) — 1순위

Structure (섹션 경로) — 있으면 사용

Layout (BBox/page) — 사용 가능할 때만

결론: 파싱에 실패해도 최소한 Semantic Anchor는 반드시 살아있어야 한다.

Risk-Aware Evolution: Answer Variant(변형 답변)는 경쟁하지만, 팩트 위반이나 과장된 표현은 Gate에서 자동 차단된다.

Project-First Architecture: 정답(Answer)이 아니라 **프로젝트(RFP)**가 1급 시민이다. Context 없는 지식은 무의미하다.

Auditable by Design: 엔터프라이즈에서는 기능보다 **“누가 무엇을 승인했는지”**가 더 중요하다.

1-3. 핵심 가치 제안 (Core Value Proposition)
🛡️ Rapid Trust Calibration (Guided Onboarding): "5분 온보딩" 폐기. AI가 98%를 자동 처리하고, 결정적인 2%만 사용자 승인을 받아 "통제감"을 주는 Smart Onboarding.

⚓ Source-Anchored Knowledge Block: AnswerCard는 단순 텍스트가 아니라 **"원본 문서와 실시간 연결된 객체(Figma-style)"**이다.

🧬 Controlled Darwinian Evolution: 답변은 진화한다. 단, 승인은 Manager만 가능하며, Fact 위반 시 High Risk로 차단된다.

🗂️ Project Context Awareness: RFP의 산업/기관/기준에 따라 답변의 추천, 톤, 구성이 달라진다.

🧩 Proposal Assembly: 제안서 스켈레톤(목차+내용)을 템플릿 기반으로 자동 생성하고 카드를 배치한다.

🔍 Auditability: 모든 승인, 거절, 편집, 업데이트는 감사 모드에서 추적 가능하다.

----------------------------------------------------------------

Section 2. 기술 스펙 및 아키텍처 (Technical Specifications)
문맥(Context): 이 섹션은 **구현(Implementation)**을 위한 구체적인 명세입니다. 변수명, 데이터 구조, 디렉토리 구조는 이 기준을 엄격히 따릅니다.

2-1. 기술 스택 (Tech Stack)
Backend: Python 3.11 / FastAPI

Frontend: React + Vite

DB: PostgreSQL + pgvector + pg_trgm + JSONB

Storage: AWS S3 (원본 영구 보존)

AI Models:

Drafting: gpt-4o-mini

Embedding: text-embedding-3-small

Security: Multi-tenancy (Workspace → Group → Project)

2-2. 데이터 모델링 (Schema)
아래 구조는 JSON/Python Dict 형태로 표현된 DB 스키마 명세임.

A. Project (1급 시민)

JSON

project {
  "id": "UUID",
  "workspace": "personal | team",
  "group_id": "UUID",
  "name": "2024_국방RFP",
  "industry": "defense",
  "rfp_type": "technical",
  "evaluation_criteria": { ... },
  "required_documents": [ ... ],
  "prohibited_phrases": [ ... ],
  "created_at": "timestamp",
  "owner_id": "UUID"
}
B. RFP Requirement (Auto Shredding)

JSON

rfp_requirement {
  "id": "UUID",
  "project_id": "UUID",
  "requirement_text": "text",
  "requirement_type": "security | ops | ...",
  "compliance_level": "YES | PARTIAL | NO",
  "linked_answer_cards": ["UUID", ...],
  "anchor_confidence": 0.88
}
C. AnswerCard (Source-Anchored, Evolvable Block)

JSON

answer_card {
  "id": "UUID",
  "project_id": "UUID",
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
      "approved_by": "manager@corp.com"
    },
    {
      "content": "당사 SLA 100% 보장!",
      "context": "sales_pitch",
      "status": "REJECTED",
      "risk_level": "HIGH"
    }
  ]
}
D. Proposal Template & Audit Log

JSON

proposal_template {
  "id": "UUID",
  "industry": "public",
  "section_order": [
    { "id": "company_overview", "recommended_cards": [...] }
  ]
}

audit_log {
  "id": "UUID",
  "entity_type": "answer_card | variant | conflict | upload",
  "entity_id": "UUID",
  "action": "approve | reject | edit | upload",
  "user_id": "string",
  "timestamp": "timestamp",
  "diff_snapshot": { ... }
}
2-3. 핵심 비즈니스 로직 (Pipelines)
Step 1 - Zero Ingestion: 업로드 즉시 분석 시작. UI는 "날짜 추출 중...", "섹션 분석 중..." 실시간 표시.

Step 2 - Conflict Detection (Batch Resolver): 팝업 난발 금지. 엑셀 형태의 Batch Resolver UI에서 충돌 목록을 보여주고, 사용자가 일괄 선택/적용한다. (Default Policy로 가능한 건 자동 처리).

Step 3 - AnswerCard Generation: 3중 레이어 Anchor 생성. Semantic Anchor는 100% 보장, Structure/Layout은 Best Effort.

Step 4 - Requirement Shredding (On-Demand): 비용 통제를 위해 업로드 시 자동 실행하지 않음. "요구사항 분석하기 (예상 비용: 74원)" 버튼을 눌러야 실행됨.

Step 5 - Compliance Matrix: Requirement와 AnswerCard 매핑 및 Coverage 계산. 부족하면 RAG로 후보 생성.

Step 6 - Proposal Assembly: Template 기반 초안 생성. APPROVED Variant 우선 배치, High Risk Variant 배제.

2-4. 디렉터리 구조
Plaintext

app/
 ├─ routes/               # API Endpoints
 ├─ services/
 │    ├─ ingest.py        # 파싱 + Conflict Detection Logic
 │    ├─ anchor_engine.py # Soft Anchoring + Confidence Calc
 │    ├─ shredder.py      # On-Demand Requirement Shredding
 │    ├─ answers.py       # Variant Ranking + Risk Gating
 │    ├─ proposal.py      # Proposal Assembly Engine
 │    ├─ guardrail.py     # Fact-based Risk Filter
 ├─ models/               # Pydantic & ORM Models
 │    ├─ project.py
 │    ├─ rfp_requirement.py
 │    ├─ answer_card.py
 │    ├─ audit_log.py
 └─ utils/
      ├─ semantic_hash.py
      ├─ default_policies.py
      └─ pdf_hwp_parser.py

----------------------------------------------------------------    

Section 3. UI/UX 디자인 스펙 (User Interface Specifications)

문맥(Context): 이 섹션은 사용자가 경험할 화면과 인터랙션의 기준입니다. **"편집 도구(Editor)"가 아닌 "분석 및 자산화 도구(Analyzer & Asset Manager)"**로서의 정체성을 확립합니다.

3-1. 디자인 철학 (Design Philosophy)
Sanitized Professionalism (정제된 전문성):

복잡한 버튼이 나열된 기존 B2B ERP 스타일을 지양합니다.

Google Workspace / Notion과 유사한 White & Light Gray 베이스에 Blue Primary (#0B57D0)를 사용하여 신뢰감과 청결함을 줍니다.

Navigator, Not Editor (작성하지 않고 결정한다):

사용자는 이곳에서 문장을 작성하지 않습니다. AI가 찾아낸 것을 **"승인(Approve)"**하거나 **"내보내기(Export)"**할 뿐입니다.

따라서 UI의 핵심은 Input Field가 아니라 Decision Button (O/X)과 Export Action입니다.

Trust Visualization (과정의 시각화):

"로딩 중..." 스피너 대신, **"3단계 파싱 중...", "유사 답변 검색 중..."**과 같이 AI의 사고 과정을 텍스트와 스텝퍼(Stepper)로 투명하게 보여줍니다.

3-2. 정보 구조 (Information Architecture - App Shell)
화면은 좌측 고정된 **사이드바(LNB)**와 우측 메인 워크스페이스로 구성됩니다.

A. 좌측 사이드바 (LNB - Gemini Style)

폭: 260px (Collapsible)

배경: #F7F7F8 (Light Gray)

구조:

Top (Action):

[+ New Project] 버튼 (Primary Blue Button). 클릭 시 우측 화면이 'Landing/Upload'로 전환.

Middle (Context - Scrollable):

Recent Projects 헤더.

프로젝트 리스트 (예: 📄 2025_국방광대역_제안, 📄 금융그룹_Cloud_RFP...).

클릭 시 우측 화면에 해당 프로젝트의 '결과 테이블' 로드.

Bottom (Management - Fixed):

Divider (구분선)

🏛️ Knowledge Hub

📚 Answer Library (답변 카드 관리)

📂 Source Documents (원본 문서 관리)

⚙️ Admin & Team (멤버 초대 및 권한)

👤 User Profile

3-3. 핵심 화면 상세 스펙 (Key Screen Specs)
1. Landing & Onboarding (New Project Wizard)

진입: [+ New Project] 클릭 시.

레이아웃: 중앙 정렬, 여백이 많은 Clean View.

구성:

Hero Message: "RFP 분석을 시작합니다. 파일을 업로드하세요."

Drop Zone: 점선 박스, 파일 드래그 앤 드롭 (PDF/HWP/DOCX).

Sample Trigger: "샘플 파일로 분석 결과 미리보기" 텍스트 링크.

Interaction (Analysis State):

파일 업로드 즉시 중앙에 Progress Stepper 등장.

Step 1: 텍스트 추출 (Extraction)

Step 2: 요구사항 파쇄 (Shredding)

Step 3: 지식 매칭 (Matching)

특이사항: 충돌(Conflict) 발생 시 잠시 멈추고 사용자에게 "버전 선택 모달" 제시.

2. Project Workspace (Result Table)

진입: 분석 완료 직후 또는 LNB에서 프로젝트 클릭 시.

레이아웃: Data Grid (Table) 중심. 편집기가 아님.

상단 헤더:

프로젝트명, D-Day.

Export Group: [Excel], [Word] 아이콘 버튼 (가장 중요).

메인 테이블 (Requirements Matrix):

Status: 🟢(완료), 🟡(검토 필요), 🔴(답변 없음).

Requirement: RFP 원문 요구사항 (클릭 시 원문 팝업).

AI Suggestion: 매칭된 답변 요약 (1~2줄).

Source: 근거 문서 뱃지 (예: [제안서_v2.pdf, p.45]).

Score: 적합도 % (Progress Bar).

Slide-over Panel (Detail View):

테이블 행(Row) 클릭 시 우측에서 슬라이드 패널 등장.

상세 답변 내용, 전체 텍스트, Alternative Variants(다른 버전 답변) 선택 가능.

[Approve] / [Reject] 버튼으로 상태 변경.

3. Knowledge Hub Manager (Asset Management)

진입: LNB > Knowledge Hub 클릭.

구성 (Tabs):

Tab A: Answer Library

카드형(Grid) 또는 리스트형(List) 뷰.

검색창 (키워드/해시태그).

개별 카드 클릭 시 수정 모달 (답변 내용 편집 및 승인권자 지정).

Tab B: Source Documents

파일 탐색기 스타일.

업로드된 문서 목록, 파싱 상태, 업로드 날짜.

기능: [Re-Parse](재분석), [Delete](삭제).

4. Admin & Team (Settings)

진입: LNB > Admin & Team 클릭.

구성:

Member Management:

초대 필드 (이메일 입력 + [Invite] 버튼).

멤버 리스트 테이블: 이름 | 이메일 | 권한(Role) | 상태.

Role: Admin (설정 가능), Manager (승인 가능), Viewer (보기만 가능).

Policy & Guardrails:

금지어(Blacklist) 관리.

High Risk 키워드 설정.

Usage: 현재 토큰 사용량 및 예상 비용 대시보드.

3-4. 시각적 스타일 가이드 (Visual Style)
Color Palette:

Primary: Azure Blue #0B57D0 (Action Button, Active State).

Background: Off-White #FFFFFF (Main), #F7F7F8 (Sidebar/Background).

Text: #1F1F1F (Heading), #424242 (Body), #9AA0A6 (Placeholder).

Semantic:

Success (Approved): #0E7A4E (Green)

Warning (Review Needed): #EFB81A (Yellow)

Error/Risk (Rejected): #D0362D (Red)

Typography:

System Font Stack (San Francisco, Segoe UI, Noto Sans KR).

가독성 최우선: 데이터 테이블 내 폰트 사이즈는 13px~14px로 밀도 있게 유지.

Component:

모든 컨테이너는 Border-radius: 8px (부드러운 사각형).

그림자(Shadow)는 최소화하고 Border (#E0E0E0)로 구획 구분.
----------------------------------------------------------------

Section 4. 실행 로드맵 및 상태 관리 (Roadmap & Milestones)
[🤖 AI Interaction Rule]:

이 섹션은 프로젝트의 진척도(Progress Bar) 역할을 합니다.

AI는 하나의 기능을 구현하고, 테스트가 통과되었음을 확인하면 해당 항목의 체크박스를 [ ]에서 **[x]**로 변경해야 합니다.

개발 시작 전, 항상 이 섹션을 읽어 **현재 단계(Current Phase)**와 **다음 작업(Next Task)**을 파악하십시오.

순서를 건너뛰지 마십시오. 의존성(Dependency)이 위에서 아래로 흐릅니다.

4-0. Phase 0: 아키텍처 이관 및 기반 공사 (Migration & Foundation)
Goal: 기존 코드를 보존하면서, Enterprise Schema(Project, AnswerCard)가 들어갈 자리를 마련합니다.

DB & Schema Design

[x] Project Table 신설: models/project.py 생성 및 projects 테이블 마이그레이션. (기존 데이터는 'Default Project'로 매핑)

[x] AnswerCard Table 업그레이드: answers 테이블을 models/answer_card.py로 고도화.

[x] anchors (JSONB) 컬럼 추가

[x] variants (JSONB) 컬럼 추가

[x] facts (JSONB) 컬럼 추가

[x] RFP Requirement Table 신설: models/rfp_requirement.py 생성.

[x] Audit Log Table 신설: models/audit_log.py 생성.

Legacy Code Refactoring

[x] Dependencies Update: olefile, pyhwp, pdfplumber 등 파싱 관련 라이브러리 추가.

[x] Service Layer 분리: 기존 services/ 폴더 내 로직을 ingest, answers, search 등 역할별로 재정비.

4-1. Phase 1: MVP Core - "Guided Control" Pipeline (Weeks 1-3)
Goal: "파일 업로드 → 충돌 해결 → 3중 앵커링 → AnswerCard 생성"까지의 핵심 흐름 완성.

Backend: Ingestion & Parsing Engine

[x] Advanced Parser 구현: utils/pdf_hwp_parser.py 작성.

[x] PDF Layout/Section 추출 로직 (Best Effort)

[x] Semantic Hash(SHA256) 생성 로직

[x] Conflict Detection Service: services/ingest.py

[x] 날짜/버전 파싱 로직 구현

[x] 문서 간 유사도 및 충돌 감지 로직 구현

[x] 사용자 개입이 필요한 "Conflict List" 리턴 API 작성

Backend: Knowledge Management

[x] AnswerCard CRUD API: 앵커와 변형(Variant)을 포함한 생성/조회/수정 API.

[x] Fact-based Risk Gating: services/guardrail.py

[x] Fact와 Variant 내용을 비교하여 Risk Level (Safe/High) 판별하는 LLM 로직.

Frontend: Guided Onboarding UX

[x] Smart Uploader UI: 파일 업로드 시 실시간 분석 상태(Progress) 표시 컴포넌트 (`OnboardingWizardPage` 연동 완료).

[x] Batch Conflict Resolver: 엑셀 스타일의 충돌 해결 테이블 UI 구현 (`OnboardingWizardPage` 연동 완료).

[ ] Dashboard Integration: 온보딩 완료 후 대시보드로 자연스럽게 전환되는 흐름.

4-2. Phase 2: Proposal Engine & Optimization (Weeks 4-6)
Goal: 자산화된 지식을 활용해 실제 RFP 제안서 초안을 만들고 비용을 통제하는 단계.

Backend: RFP Processing

[x] On-Demand Shredder: services/shredder.py

[x] 비용 산정(토큰 계산) 로직

[x] 사용자 승인 시 실행되는 Trigger API

[x] RFP → Requirement 분해 로직

[x] Proposal Assembly Engine: services/proposal.py

[x] 템플릿 선택 및 스켈레톤 생성

[x] Requirement <-> AnswerCard 매핑 알고리즘

[x] Project & Requirement API: `routes/projects.py` 생성 및 연동.

Frontend: Proposal Editor

[x] Requirement Mapper UI: RFP 요구사항과 매칭된 AnswerCard를 보여주는 뷰 (`ProjectWorkspacePage` 연동 완료).


4-3. Phase 3: Enterprise Hardening (Weeks 7+)
Goal: 보안, 감사, 그리고 운영 안정성 확보.

Security & Audit

[x] Audit Log Recording: 주요 액션(승인, 반려, 편집) 발생 시 로그 저장 미들웨어 적용 (`AuditLogMiddleware` 구현 완료).

[x] RBAC (Role-Based Access Control): Manager만 승인(Approve) 버튼을 누를 수 있도록 권한 제어 (`verify_manager_role` 적용 완료).

DevOps & Monitoring

[x] Cost Dashboard: 프로젝트별 토큰 사용량 및 비용 트래킹 (`/admin/cost` API 구현 완료).

[x] Anchor Health Check: 파싱 실패율 및 앵커링 성공률 모니터링 로그 구축 (`/admin/health/anchors` API 구현 완료).

4-4. 최종 완료 기준 (Definition of Done)
[Review Rule]: 모든 체크박스가 [x]가 되었을 때, 아래 기준을 최종 검수하십시오.

[x] Migration Integrity: 기존 데이터와 신규 데이터가 공존하며, 새로운 Anchor 구조로 매핑되는가? (Project/AnswerCard JSONB 스키마 확인 완료)

[x] Conflict UX: 충돌 해결이 팝업 노가다가 아니라 Batch Resolver로 매끄럽게 동작하는가? (OnboardingWizardPage Step 3 구현 완료)

[x] Risk Gate: High Risk Variant는 Approver 권한 없이는 승인 불가한가? (RBAC 적용으로 Manager만 승인 가능)

[x] Cost Control: 파쇄(Shredding)는 반드시 **On-Demand(버튼 클릭)**로만 실행되는가? (API에서 confirm_cost 파라미터 강제 확인)

[x] Audit Trail: DB 조회 시, 누가 언제 무엇을 승인했는지 추적 가능한가? (AuditLogMiddleware 및 DB 저장 확인 완료)

----------------------------------------------------------------

Section 5. UI - Backend Gap Analysis & Next Steps

섹션 5의 내용은 섹션4까지의 내용을 바탕으로 전체적인 MVP를 완성한 이후에 진행합니다.

5-1. Frontend Ahead (UI는 있으나 Backend 미구현)

[x] Advanced Conflict Resolution API: `ingest.py` 고도화.
    - 충돌 유형(Version/Content/Metadata) 세분화 로직.
    - Merge/Keep Old/Keep New 액션 처리 API.

[x] Cost Pre-calculation API: `shredder.py` 고도화.
    - 업로드된 파일들의 분량을 미리 분석하여 예상 시간/비용을 리턴하는 API.

[x] Detailed Citation History: `AnswerCard` 모델 보강.
    - 단순 `usage_count`를 넘어, 어떤 프로젝트/문서/페이지에서 인용되었는지 추적하는 구조(`past_proposals` 필드 등) 구현.
    - **Read API**: `GET /answers` 응답에 `past_proposals` 포함.
    - **Write API**: `POST /answers/{id}/usage` 엔드포인트 추가 (인용 기록 저장).

[x] Dynamic Guardrail API: `guardrail.py` 연동.
    - 금지어/High Risk 키워드를 관리자 화면에서 추가/삭제할 수 있는 설정 API.

----------------------------------------------------------------

Section 6. 배포 준비 및 운영 이관 (Deployment & Operations)

문맥(Context): MVP 개발이 완료되었으며, 이제 "내 컴퓨터(Localhost)"에서만 돌아가는 코드를 "실제 사용자(Production)"가 쓸 수 있는 환경으로 옮기는 과정입니다. 단순히 서버에 코드를 올리는 것을 넘어, 다음 5가지 핵심 목표를 달성해야 합니다.

1.  **환경 격리 (Environment Isolation)**: 개발용 설정(Debug Mode, Mock Data)과 운영용 설정(Secure Mode, Real Data)을 철저히 분리하여, 실수로 테스트 데이터가 운영 DB에 섞이거나 보안 키가 노출되는 사고를 방지합니다.
2.  **데이터 영속성 (Data Persistence)**: 컨테이너가 꺼졌다 켜져도 데이터가 날아가지 않도록, 로컬 DB를 AWS RDS 같은 관리형 서비스로 이관하고 백업 전략을 수립합니다.
3.  **성능 최적화 (Optimization)**: 개발 편의성을 위해 켜두었던 디버깅 도구들을 끄고, 코드를 압축(Minify)하고, 불필요한 로그를 줄여 응답 속도를 극대화합니다.
4.  **보안 강화 (Security Hardening)**: 누구나 접근 가능한 개발 서버와 달리, HTTPS(암호화 통신)를 적용하고, 허용된 도메인(CORS)에서만 API를 호출할 수 있도록 빗장을 겁니다.
5.  **운영 자동화 (CI/CD & Ops)**: 코드를 수정할 때마다 수동으로 서버에 접속해서 복사하는 것이 아니라, GitHub에 푸시하면 자동으로 테스트하고 배포되는 파이프라인을 구축합니다.

6-1. 인프라 아키텍처 스펙 (Infrastructure Specifications)
문맥(Context): 배포될 환경의 물리적/논리적 구성도입니다.

A. Computing (AWS/Cloud)
- **Frontend**: S3 Static Website Hosting + CloudFront (CDN)
    - 역할: 정적 파일(JS, CSS, HTML)을 전 세계 엣지 로케이션에서 캐싱하여 0.1초 이내 로딩.
- **Backend**: AWS ECS (Fargate) or EC2
    - 역할: Docker 컨테이너 기반으로 API 서버 구동. 트래픽 증가 시 Auto Scaling.
- **Gateway**: Application Load Balancer (ALB)
    - 역할: HTTPS 인증서 처리(SSL Termination) 및 트래픽 분산.

B. Data & Storage
- **Database**: AWS RDS for PostgreSQL (v15+)
    - 스펙: `db.t3.medium` 이상, Multi-AZ(이중화) 설정 권장.
    - Extensions: `pgvector`, `pg_trgm` 필수 설치.
- **Object Storage**: AWS S3 Standard
    - 구조: `/raw/{project_id}/{file_id}` (원본), `/parsed/...` (중간 산출물).
    - 보안: Public Access Block, Presigned URL을 통해서만 접근.

6-2. 배포 파이프라인 로직 (Deployment Pipeline)
문맥(Context): 코드가 실제 서버에 반영되는 자동화된 절차입니다.

Step 1 - Code Push & Test (CI)
- 개발자가 `main` 브랜치에 코드를 푸시하면 GitHub Actions가 트리거됨.
- **Unit Test**: `pytest`로 핵심 로직(파싱, 충돌 감지) 검증.
- **Linting**: 코드 스타일 및 타입 체크(MyPy).

Step 2 - Container Build
- 테스트 통과 시 Docker 이미지 빌드 (`backend:v1.0.2`).
- ECR(Elastic Container Registry)에 이미지 업로드 및 태깅.

Step 3 - Infrastructure Update (CD)
- Terraform 또는 AWS CDK가 인프라 변경 사항 감지.
- ECS 서비스가 새로운 이미지(`:latest`)를 가져와서 Rolling Update(무중단 배포) 실행.
- 기존 컨테이너는 우아하게 종료(Drain)되고 새 컨테이너가 트래픽 수신.

Step 4 - Migration & Health Check
- 배포 직후 `alembic upgrade head` 자동 실행하여 DB 스키마 동기화.
- `/health` 엔드포인트 호출하여 200 OK 확인 후 배포 완료 통보(Slack).

6-3. Environment & Security Configuration (Milestone)
- [ ] Secret Management: `.env` 파일 분리 (Dev vs Prod). API Key, DB URL 등 민감 정보 보안 처리.
- [ ] CORS & Allowed Hosts: 프로덕션 도메인에 맞게 CORS 설정 제한 및 `ALLOWED_HOSTS` 설정.
- [ ] SSL/TLS Setup: HTTPS 적용 (Let's Encrypt 또는 Load Balancer 인증서).

6-4. Database & Storage (Milestone)
- [ ] Production DB Setup: 로컬 SQLite/Docker PG에서 운영용 PostgreSQL(AWS RDS 등)로 마이그레이션.
- [ ] DB Backup Strategy: 주기적 백업(Snapshot) 및 복구 절차 수립.
- [ ] S3 Bucket Policy: 실제 파일 저장을 위한 S3 버킷 권한(IAM) 및 수명 주기(Lifecycle) 설정.

6-5. Backend Deployment (Milestone)
- [ ] Dockerfile Optimization: Multi-stage build로 이미지 사이즈 최적화 (Python Slim 이미지 사용).
- [ ] Gunicorn/Uvicorn Config: 워커 프로세스 수, 타임아웃, Keep-alive 등 운영 설정 튜닝.
- [ ] Reverse Proxy: Nginx 또는 ALB(Application Load Balancer) 연동 설정.

6-6. Frontend Deployment (Milestone)
- [ ] Production Build: `npm run build` 최적화 (Minification, Tree Shaking, Source Map 제거).
- [ ] Serving Strategy: Nginx 정적 파일 서빙 또는 CDN(CloudFront/Vercel) 배포 설정.
- [ ] Cache Control: 정적 자산(JS/CSS)에 대한 캐싱 정책 수립.

6-7. CI/CD & Monitoring (Milestone)
- [ ] GitHub Actions: Main 브랜치 푸시 시 자동 빌드/테스트/배포 파이프라인 구성.
- [ ] Log Aggregation: 서버 로그를 파일이나 외부 서비스(CloudWatch, Sentry, Datadog)로 전송.
- [ ] Health Check Monitoring: `/health` 엔드포인트 모니터링 및 알림 설정.