Enterprise RFP OS — Implementation Roadmap & Backlog
[🤖 Project Management Rule] 이 문서는 프로젝트의 **전체 개발 로드맵이자 살아있는 백로그(Living Backlog)**입니다.서비스의 완성(Launch)과 고도화(Evolution)를 위한 모든 과업을 이곳에서 관리합니다.

상태 관리: 기능 구현이 완료되고 테스트가 통과되면 [ ]를 **[x]**로 변경합니다.

지속적 업데이트: 새로운 기능 요건이나 기술적 부채가 발생하면 이 문서에 Task를 추가합니다.

작업 우선순위: 개발 시작 전, 항상 이 문서를 확인하여 현재 진행 중인 작업과 남은 작업을 파악하고 진행합니다.

1. 데이터 및 기본 로직 (Data & Core Logic)
목표: 애플리케이션의 뼈대가 되는 DB 구조와 파일 처리 로직을 완성합니다.

[x] DB 스키마 초기화 (Schema Migration)

현재 Cloud SQL은 비어 있습니다.

로컬에서 Cloud SQL Auth Proxy를 켜고 alembic upgrade head를 실행하여 테이블(projects, documents, answer_cards 등)을 생성해야 합니다.

[x] GCS 업로드 핸들러 구현 (ingest.py)

google-cloud-storage 라이브러리를 사용하여 파일 업로드 로직을 구현합니다.

프론트엔드 업로더를 위한 Signed URL (V4) 생성 로직을 포함합니다.

[x] 문서 해싱 및 무결성 검증 (ingest.py)

파일 업로드 시 SHA256 해시를 계산하여 DB에 저장합니다.

동일 해시를 가진 문서의 중복 업로드를 감지하는 로직을 구현합니다.

2. AI 파이프라인 엔진 (AI Engine)
목표: Vertex AI와 Gemini, OpenAI를 유기적으로 연결하여 지능형 처리 로직을 구현합니다.

[x] Knowledge Hub 검색 엔진 (search.py)

VertexAIClient를 통해 사내 지식 문서를 검색하는 하이브리드(Keyword + Semantic) 검색을 구현합니다.

검색된 스니펫(Chunk)을 AnswerCard 후보 객체로 변환하는 로직을 작성합니다.

[ ] RFP Shredding 비동기 워커 (shredder.py)

Cloud Tasks에서 트리거할 엔드포인트(POST /worker/shred)를 구현합니다.

Gemini 3.0 Pro를 호출하여 PDF 내의 요구사항, 마감일, 요약 정보를 구조화된 JSON으로 추출합니다.

[ ] 제안서 조립 및 생성 엔진 (proposal.py)

rfp_requirement(요구사항)와 answer_card(답변)를 매핑하는 알고리즘을 구현합니다.

매핑된 정보를 바탕으로 OpenAI GPT-5.1을 호출하여 제안서 초안(Draft)을 생성합니다.

3. 프론트엔드 연동 및 UI (Frontend Integration)
목표: 백엔드 API와 UI 컴포넌트를 연결하여 실제 사용 가능한 기능을 완성합니다.

[ ] 파일 업로드 프로세스 연동 (OnboardingWizard)

UI의 업로드 버튼을 백엔드 POST /ingest/upload와 연결합니다.

업로드 진행률(Progress Bar) 및 성공/실패 에러 핸들링을 구현합니다.

[ ] 프로젝트 대시보드 및 요구사항 뷰

ProjectsPage: 실제 GET /projects API 데이터를 바인딩합니다.

RequirementsPage: 분석 완료된 요구사항 목록(GET /projects/{id}/requirements)을 테이블에 렌더링합니다.

[ ] AnswerCard 라이브러리 뷰

AnswerLibraryPage: GET /answers API를 연동하고 검색/필터 기능을 활성화합니다.

[ ] 충돌 해결 모달 (Conflict Resolver)

문서 중복 발생 시 백엔드 응답을 받아 사용자에게 "덮어쓰기/유지하기"를 선택하게 하는 UI 로직을 연결합니다.

4. 보안 및 엔터프라이즈 기능 (Enterprise Features)
목표: 기업 환경에서 필요한 보안, 감사, 통제 기능을 구현합니다.

[ ] 사용자 인증 체계 (Authentication)

하드코딩된 테스트 유저 로직을 제거합니다.

JWT 기반 인증 또는 Firebase Auth 토큰 검증 미들웨어를 백엔드 전역에 적용합니다.

[ ] Audit Log 시스템 (middleware.py)

주요 데이터 변경(승인, 편집) 및 AI 생성 호출 시, 자동으로 audit_log 테이블에 이력을 남기는 미들웨어를 구현합니다.

[ ] AI Guardrail (guardrail.py)

OpenAI를 이용하여 생성된 문장의 팩트 위반, 과장 광고, 금지어를 탐지하고 차단하는 필터를 적용합니다.

5. 운영 및 인프라 최적화 (Operations)
목표: 서비스의 안정적인 운영을 위한 모니터링 및 네트워크 설정을 마무리합니다.

[ ] 커스텀 도메인 연결 (DNS)

보유한 도메인(예: https://www.google.com/search?q=rfp-os.com)을 Firebase Hosting에 연결하고 DNS(A 레코드)를 설정합니다.

[ ] 모니터링 및 비용 대시보드

Cloud Logging을 통해 에러 로그가 정상 수집되는지 확인합니다.

(선택) 관리자 페이지에 토큰 사용량 기반의 간단한 비용 추적 대시보드를 추가합니다.