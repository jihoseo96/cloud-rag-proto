UI/UX 디자인 스펙

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