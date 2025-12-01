# Enterprise RFP OS

**Version 2025.11.28**

엔터프라이즈 RFP(Request for Proposal) 제안서 작성을 위한 지식 운영체제입니다.

## 🎯 Core Philosophy

**"Zero Setup → Guided Control → Verified Confidence"**

단순한 RAG 챗봇이 아닌, RFP 제안서 작성을 위해 설계된 **엔터프라이즈 지식 운영체제(OS)**입니다.

### 5대 대원칙

1. **Trust over Magic** - 자동화보다 중요한 것은 운영자의 통제감
2. **Bulletproof Anchoring** - 3중 보호 (Semantic → Structure → Layout)
3. **Risk-Aware Evolution** - 답변은 진화하되, 팩트 위반은 자동 차단
4. **Project-First Architecture** - 프로젝트가 1급 시민, Context 없는 지식은 무의미
5. **Auditable by Design** - 모든 승인/거절/편집은 추적 가능

## 🚀 Key Features

### 1. **Rapid Trust Calibration (Guided Onboarding)**
- AI가 98% 자동 처리
- 결정적인 2%만 사용자 승인 요구
- "알아서 했습니다"보다 "승인하시겠습니까?"가 우선

### 2. **Source-Anchored Knowledge Block (AnswerCard)**
- 원본 문서와 실시간 연결된 Figma-style 객체
- 3중 Anchor 시스템:
  - **Semantic** (해시/문장 기반) - 1순위, 100% 보장
  - **Structure** (섹션 경로) - 있으면 사용
  - **Layout** (BBox/page) - 사용 가능할 때만

### 3. **Controlled Darwinian Evolution**
- 답변 Variant는 경쟁하며 진화
- Manager만 승인 가능
- Fact 위반 시 High Risk로 자동 차단

### 4. **Project Context Awareness**
- RFP의 산업/기관/기준에 따라 답변 맞춤화
- 국방, 공공, 금융 등 산업별 최적화

### 5. **Proposal Assembly**
- 템플릿 기반 제안서 스켈레톤 자동 생성
- APPROVED Variant 우선 배치
- High Risk Variant 자동 배제

### 6. **Auditability**
- 모든 승인, 거절, 편집 기록
- "누가 무엇을 승인했는지" 추적 가능

## 📁 Project Structure

```
/
├── pages/                      # 페이지 컴포넌트
│   ├── DashboardPage.tsx      # 프로젝트 대시보드
│   ├── ProjectDetailPage.tsx  # 프로젝트 상세
│   ├── UploadPage.tsx         # Zero Ingestion 업로드
│   ├── AnswerCardsPage.tsx    # Answer Card 관리
│   ├── ConflictsPage.tsx      # Batch Conflict Resolver
│   ├── RequirementsPage.tsx   # RFP 요구사항 분석
│   └── AuditPage.tsx          # 감사 로그
│
├── components/
│   ├── Navigation.tsx         # 메인 네비게이션
│   └── ui/                    # shadcn/ui 컴포넌트
│
├── contexts/
│   └── AppContext.tsx         # 전역 상태 관리
│
├── types/
│   └── index.ts               # TypeScript 타입 정의
│
└── routes/
    └── index.tsx              # 라우팅 설정
```

## 🗂️ Data Model

### Project (1급 시민)
```typescript
{
  id: string;
  name: string;
  industry: 'defense' | 'public' | 'finance' | ...;
  rfpType: 'technical' | 'consulting' | ...;
  complianceCoverage: number; // 0-100%
  status: 'draft' | 'active' | 'completed';
}
```

### AnswerCard (Source-Anchored Block)
```typescript
{
  id: string;
  topic: string;
  anchors: Anchor[];        // 3-layer anchoring
  facts: Record<string, unknown>;
  variants: AnswerVariant[]; // Evolutionary variants
  overallConfidence: number;
}
```

### RFPRequirement
```typescript
{
  id: string;
  requirementText: string;
  complianceLevel: 'YES' | 'PARTIAL' | 'NO' | 'UNKNOWN';
  linkedAnswerCards: string[];
  anchorConfidence: number;
}
```

## 🎨 UI Design

### Design System
- **Style**: Linear / Notion / Vercel 스타일 현대적 B2B SaaS
- **Colors**:
  - Base: Slate 50-900 (차분한 엔터프라이즈)
  - Primary: Sky 500 (#0EA5E9)
  - Secondary: Violet 500 (#8B5CF6)
  - Gradients: Sky → Violet
- **Typography**: Inter (시스템 기본)
- **Spacing**: 넓은 여백, 명확한 hierarchy
- **Components**: shadcn/ui 기반

### Key Patterns
- Card-based layout
- Badge for status/metadata
- Progress bars for compliance
- Collapsible sections for details
- Color-coded risk levels

## 🔄 Core Workflows

### 1. Zero Ingestion (98% 자동)
```
업로드 → 실시간 분석 표시
  ├─ 텍스트 추출
  ├─ 섹션 분석
  ├─ Conflict Detection (일괄 처리)
  └─ AnswerCard 생성 (2% 승인 요구)
```

### 2. Conflict Resolution (Batch)
```
충돌 감지 → 엑셀형 UI → 일괄 선택 → 적용
  ├─ Duplicates: Keep newest/highest confidence
  ├─ Contradictions: Manual review (HIGH risk)
  └─ Outdated: Archive old, promote new
```

### 3. Requirement Shredding (On-Demand)
```
비용 표시 → 사용자 확인 → RFP 분석
  ├─ 요구사항 추출
  ├─ 타입 분류 (security/ops/technical...)
  ├─ AnswerCard 매핑
  └─ Compliance 계산
```

### 4. Proposal Assembly
```
Template 선택 → Card 배치 → 검증 → 생성
  ├─ APPROVED Variant 우선
  ├─ Context 맞춤 (public/private/technical)
  └─ HIGH Risk 자동 배제
```

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Routing**: React Router v6
- **State**: Context API
- **UI**: shadcn/ui + Tailwind CSS v4
- **Icons**: Lucide React
- **Backend** (예정): Python 3.11 + FastAPI
- **Database** (예정): PostgreSQL + pgvector
- **Storage** (예정): AWS S3

## 🚦 Getting Started

1. **Project 생성**
   - Dashboard → "New Project"
   - 산업, RFP 타입 선택

2. **문서 업로드**
   - Upload → 파일 드래그 앤 드롭
   - 실시간 처리 상태 확인

3. **충돌 해결** (필요시)
   - Conflicts → 일괄 선택 → 적용

4. **요구사항 분석** (선택)
   - Requirements → "Analyze Requirements"
   - 비용 확인 후 실행

5. **Answer Cards 관리**
   - Cards → Variant 승인/거절
   - Facts 확인

6. **Compliance 확인**
   - Overview → Coverage 체크
   - 부족한 부분 식별

7. **제안서 생성**
   - Proposal → Template 선택 → 조립

## 📊 Metrics & Analytics

- **Compliance Coverage**: 요구사항 충족도 (%)
- **Answer Cards**: 지식 블록 수
- **Approved Variants**: 승인된 답변 수
- **Pending Conflicts**: 미해결 충돌 수

## 🔒 Security & Compliance

- **Audit Trail**: 모든 액션 로그
- **User Attribution**: 승인자 추적
- **Risk Gating**: HIGH risk 자동 차단
- **Fact Verification**: 과장 표현 감지

## 📈 Roadmap

### Phase 0: 전환 및 리팩토링 ✅
- 기존 코드 → 새 아키텍처
- Pages 단위 구조화
- Type 정의 완료

### Phase 1: Core Features (Current)
- Dashboard & Projects ✅
- Document Upload ✅
- Answer Cards ✅
- Conflict Resolver ✅
- Requirements ✅
- Audit Log ✅

### Phase 2: Advanced Features
- Compliance Matrix
- Proposal Builder
- Template Management
- RAG Integration

### Phase 3: Backend Integration
- FastAPI Backend
- PostgreSQL + pgvector
- AWS S3 Storage
- Real AI Processing

### Phase 4: Enterprise
- Multi-tenancy
- Team Collaboration
- Advanced Analytics
- Custom Workflows

## 📝 Notes

- 현재는 프론트엔드 프로토타입 (Mock Data)
- 실제 AI 처리는 Backend 구현 후 연동
- 모든 기능은 엔터프라이즈 실사용 시나리오 기반

## 🤝 Contributing

엔터프라이즈 RFP 운영 경험이 있다면 피드백 환영합니다!

---

**Enterprise RFP OS** - Built for trust, designed for control, optimized for compliance.
