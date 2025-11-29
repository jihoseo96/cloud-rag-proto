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
문맥(Context): 이 섹션은 사용자가 경험할 화면과 인터랙션의 기준입니다. Figma/프론트엔드 작업 시 이 기준을 따릅니다.

3-1. 디자인 철학 (Design Philosophy)
High-Density Professionalism: 여백이 많은 B2C 스타일을 지양합니다. 엑셀이나 IDE처럼 정보 밀도가 높고(Dense) 구조화된 B2B 엔터프라이즈 룩을 지향합니다.

Transparent Control: "로딩 중..." 대신 "문서 3/5 파싱 중...", "충돌 2건 감지됨" 등 시스템의 상태를 투명하게 표시하여 신뢰를 얻습니다.

Localized for Korea: HWP/PDF의 복잡한 표와 한글(CJK) 폰트의 가독성을 최우선으로 고려한 레이아웃을 사용합니다.

3-2. 정보 구조 (Information Architecture - LNB)
좌측 네비게이션 바(LNB)는 4가지 핵심 영역으로 구성됩니다.

A. 🏠 Global Command Center (메인 대시보드)

역할: "오늘 당장 처리해야 할 업무"를 보여주는 상황판.

핵심 컴포넌트:

Action Required: 승인 대기 중인 답변, 해결되지 않은 충돌, High Risk 알림.

Project Status: 진행 중인 프로젝트의 D-Day 및 진척률 테이블.

Usage Widget: 이번 달 토큰/비용 사용량 그래프.

B. 📂 Projects (제안 작업 공간)

역할: RFP 대응을 위한 휘발성 프로젝트 공간.

진입 플로우: New Project 클릭 시 Onboarding Wizard(전면 모달) 실행.

내부 탭 구조:

Overview: 프로젝트 개요 및 할 일.

Reference Docs: 업로드된 파일 관리 및 재분석 트리거.

Requirements: 파쇄된 요구사항 매트릭스 (O/X 체크).

Write Proposal: 3단 분할 에디터 (Workbench).

C. 🏛️ Knowledge Hub (전사 지식 자산)

역할: 프로젝트와 무관한 영구적 지식 저장소.

하위 메뉴:

Answer Library: 승인된 표준 AnswerCard 목록 (검색/필터).

Source Documents: S3 원본 파일 관리 (버전 관리).

D. ⚙️ Admin & Guardrails (관리 및 정책)

역할: 보안 정책 및 사용자 권한 제어.

핵심 기능: Risk Policy 설정(팩트 허용 오차 등), 금지어 관리, Audit Log 조회.

3-3. 핵심 화면 상세 스펙 (Key Screen Specs)
1. Project Onboarding Wizard (Guided Control)

형태: Full-screen Stepper Modal.

Step 1: 기본 정보 입력.

Step 2: 파일 업로드 (Drag & Drop).

Step 3 (핵심): Batch Conflict Resolver.

엑셀 형태의 그리드 뷰.

충돌하는 문서(구버전 vs 신버전)를 나열하고 **"Keep Old / Keep New / Merge"**를 라디오 버튼으로 일괄 선택.

Step 4: Cost Approval.

"요구사항 150개 추출 예상, 비용 약 120원. 진행하시겠습니까?" (승인 버튼).

2. Triple-Split Workbench (Write Proposal Tab)

레이아웃: 화면을 세로 3분할 (Resizable).

Left (20%): Requirements Checklist. RFP 요구사항 목록. 클릭 시 해당 섹션으로 스크롤 이동.

Center (50%): Editor. 실제 제안서 작성 공간. 인용된 문장에는 [📄 p.5] 형태의 Source Badge 삽입.

Right (30%): Context Assistant.

Top: 커서 위치 기반 추천 AnswerCard 리스트.

Bottom: 추천 답변의 Confidence Score(신뢰도 %) 및 Risk Level 표시.

3. AnswerCard Detail (Evolution View)

컨셉: GitHub의 Commit History와 유사한 타임라인 뷰.

헤더: 주제(Topic) 및 핵심 팩트(Fact Sheet).

바디: Variant List Table.

컬럼: Content Preview | Context | Status | Risk | Usage | Action

Status: APPROVED(초록), REJECTED(빨강), CANDIDATE(노랑).

Risk: HIGH인 경우 붉은색 경고 아이콘 표시.

푸터: "Used in Projects" (이 답변이 사용된 프로젝트 목록).

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

[ ] Smart Uploader UI: 파일 업로드 시 실시간 분석 상태(Progress) 표시 컴포넌트.

[ ] Batch Conflict Resolver: 엑셀 스타일의 충돌 해결 테이블 UI 구현 (일괄 적용 기능 포함).

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

Frontend: Proposal Editor

[ ] Requirement Mapper UI: RFP 요구사항과 매칭된 AnswerCard를 보여주는 뷰.

[ ] Live Source Inspector: 답변 옆 [Source] 배지 클릭 시 원본 PDF 뷰어 연동.

[ ] Variant Selector: 에디터 내에서 답변의 다른 버전(Variant)으로 교체하는 드롭다운.

4-3. Phase 3: Enterprise Hardening (Weeks 7+)
Goal: 보안, 감사, 그리고 운영 안정성 확보.

Security & Audit

[ ] Audit Log Recording: 주요 액션(승인, 반려, 편집) 발생 시 로그 저장 미들웨어 적용.

[ ] RBAC (Role-Based Access Control): Manager만 승인(Approve) 버튼을 누를 수 있도록 권한 제어.

DevOps & Monitoring

[ ] Cost Dashboard: 프로젝트별 토큰 사용량 및 비용 트래킹.

[ ] Anchor Health Check: 파싱 실패율 및 앵커링 성공률 모니터링 로그 구축.

4-4. 최종 완료 기준 (Definition of Done)
[Review Rule]: 모든 체크박스가 [x]가 되었을 때, 아래 기준을 최종 검수하십시오.

[ ] Migration Integrity: 기존 데이터와 신규 데이터가 공존하며, 새로운 Anchor 구조로 매핑되는가?

[ ] Conflict UX: 충돌 해결이 팝업 노가다가 아니라 Batch Resolver로 매끄럽게 동작하는가?

[ ] Risk Gate: High Risk Variant는 Approver 권한 없이는 승인 불가한가?

[ ] Cost Control: 파쇄(Shredding)는 반드시 **On-Demand(버튼 클릭)**로만 실행되는가?

[ ] Audit Trail: DB 조회 시, 누가 언제 무엇을 승인했는지 추적 가능한가?