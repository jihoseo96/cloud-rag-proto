# Team AI Agent - Component Structure

이 문서는 Team AI Agent 애플리케이션의 전체 컴포넌트 구조와 각 컴포넌트의 기능을 설명합니다.

## 📁 파일 구조

```
/
├── App.tsx                                   # 메인 애플리케이션 (Chat Page)
├── components/
│   ├── WorkspaceSelector.tsx                 # Workspace 선택기
│   ├── UserProfile.tsx                        # 사용자 프로필
│   ├── TeamItem.tsx                           # 개별 팀 아이템
│   ├── ChatItem.tsx                           # 개별 채팅 아이템
│   ├── ChatHeader.tsx                         # 채팅 헤더
│   ├── MessageItem.tsx                        # 개별 메시지
│   ├── ChatInput.tsx                          # 메시지 입력창
│   ├── ModelSelector.tsx                      # AI 모델 선택기
│   ├── GroupInstructionsDialog.tsx            # Group Instructions 다이얼로그
│   ├── StandardAnswerDialog.tsx               # 표준 답변 등록 다이얼로그
│   ├── TeamManagement.tsx                     # 팀 관리 페이지
│   └── FileIcon.tsx                           # 파일 아이콘 (기존)
```

## 🎨 컴포넌트 상세

### 1. WorkspaceSelector
**위치:** 좌측 사이드바 최상단  
**기능:**
- 현재 선택된 Workspace 표시 (Personal/Organization)
- Workspace 드롭다운 메뉴
- 새 워크스페이스 생성 버튼 (준비중)

**데이터 구조:**
```typescript
Workspace: {
  id: string
  name: string
  type: 'personal' | 'organization'
  createdAt: Date
}
```

**Props:**
- `currentWorkspace`: Workspace - 현재 선택된 workspace
- `workspaces`: Workspace[] - 전체 workspace 목록
- `onWorkspaceChange`: (id: string) => void - Workspace 변경 콜백

---

### 2. UserProfile
**위치:** 좌측 사이드바 최하단  
**기능:**
- 사용자 아바타 표시
- 사용자 이름 표시
- 프로필 설정 버튼

**Props:**
- `userName`: string - 사용자 이름
- `userAvatar`: string - 아바타 이미지 URL
- `onProfileClick?`: () => void - 프로필 버튼 클릭 콜백

---

### 3. TeamItem
**위치:** 사이드바 팀 섹션  
**기능:**
- 팀 이름 및 멤버 수 표시
- 팀 확장/축소 (팀 채팅 목록)
- 팀 관리 메뉴 (팀 관리, 새 채팅, 팀 나가기)

**데이터 구조:**
```typescript
Team: {
  id: string
  name: string
  memberCount: number
  workspaceId: string
}
```

**Props:**
- `team`: Team - 팀 정보
- `teamChats`: Chat[] - 해당 팀의 채팅 목록
- `isExpanded`: boolean - 확장 여부
- `isSelected`: boolean - 선택 여부
- `selectedChatId`: string | null - 현재 선택된 채팅 ID
- `onTeamClick`: (teamId: string) => void
- `onChatClick`: (chatId: string, teamId: string) => void
- `onManageTeam`: (teamId: string) => void
- `onCreateChat`: (teamId: string) => void
- `onLeaveTeam`: (teamId: string) => void

---

### 4. ChatItem
**위치:** 사이드바 채팅 섹션  
**기능:**
- 채팅 제목 및 미리보기 표시
- 채팅 선택

**데이터 구조:**
```typescript
Chat: {
  id: string
  title: string
  preview: string
  timestamp: string
  teamId: string | null
  lastUpdated: number
}
```

**Props:**
- `chat`: Chat - 채팅 정보
- `isSelected`: boolean - 선택 여부
- `onClick`: (chatId: string, teamId: string | null) => void

---

### 5. ChatHeader
**위치:** 메인 채팅 영역 최상단  
**기능:**
- 사이드바 토글 버튼
- 현재 채팅/팀 이름 표시
- 알림 버튼 (표준 답변 요청)
- 다크 모드 버튼 (준비중)
- 정보 버튼
- 사용자 아바타

**Props:**
- `isSidebarOpen`: boolean
- `onSidebarToggle`: () => void
- `isPersonalChat`: boolean
- `teamName?`: string
- `userAvatar`: string
- `notificationCount?`: number

---

### 6. MessageItem
**위치:** 메시지 리스트  
**기능:**
- 사용자/AI 메시지 표시
- 문서 출처(Citation) 표시
- Stale 문서 경고
- 표준 답변 등록 버튼 (팀 채팅의 AI 응답)

**데이터 구조:**
```typescript
Message: {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  citations?: Citation[]
  isStale?: boolean
}

Citation: {
  fileName: string
  fileExtension: string
  isStale?: boolean
}
```

**Props:**
- `message`: Message
- `userAvatar`: string
- `isTeamChat`: boolean
- `isHovered`: boolean
- `isClicked`: boolean
- `onMouseEnter`: () => void
- `onMouseLeave`: () => void
- `onClick`: () => void
- `onRequestStandardAnswer`: () => void

---

### 7. ChatInput
**위치:** 메인 채팅 영역 최하단  
**기능:**
- 텍스트 입력창 (멀티라인, 자동 높이)
- 파일 첨부 버튼
- 메시지 전송 버튼
- Enter 전송, Shift+Enter 줄바꿈

**Props:**
- `value`: string
- `onChange`: (value: string) => void
- `onSend`: () => void
- `onFileUpload`: (files: FileList) => void
- `disabled?`: boolean

---

### 8. ModelSelector
**위치:** 메시지 입력창 상단  
**기능:**
- 현재 선택된 AI 모델 표시
- AI 모델 목록 토글
- AI 모델 선택 (ChatGPT-5, Sonar, Gemini, Claude 등)

**Props:**
- `selectedModel`: string
- `availableModels`: string[]
- `isOpen`: boolean
- `onToggle`: () => void
- `onModelSelect`: (model: string) => void

---

### 9. GroupInstructionsDialog
**위치:** 팀 채팅 시 모달  
**기능:**
- 팀별 전문 프롬프트 목록 표시
- 프롬프트 선택
- 프롬프트 미리보기
- 선택 해제

**데이터 구조:**
```typescript
GroupInstruction: {
  id: string
  title: string
  content: string
  teamId: string
  description?: string
}
```

**Props:**
- `open`: boolean
- `onOpenChange`: (open: boolean) => void
- `teamName`: string
- `prompts`: GroupInstruction[]
- `selectedPrompt`: GroupInstruction | null
- `onSelectPrompt`: (prompt: GroupInstruction) => void
- `onClearSelection`: () => void

---

### 10. StandardAnswerDialog
**위치:** AI 메시지 체크 버튼 클릭 시 모달  
**기능:**
- 선택된 AI 답변 미리보기
- 표준 답변 등록 요청 확인
- 관리자 승인 안내

**Props:**
- `open`: boolean
- `onOpenChange`: (open: boolean) => void
- `selectedMessage`: Message | null
- `teamName`: string
- `onConfirm`: () => void

---

## 🔄 데이터 흐름

### Workspace 선택
```
WorkspaceSelector → onWorkspaceChange → App.tsx → 상태 업데이트
```

### 팀 관리
```
TeamItem → onTeamClick → App.tsx → 팀 선택 상태 변경
TeamItem → onManageTeam → App.tsx → TeamManagement 페이지로 이동
```

### 채팅 선택
```
ChatItem → onClick → App.tsx → 채팅 선택 상태 변경 → MessageList 업데이트
```

### 메시지 전송
```
ChatInput → onSend → App.tsx → chatMessages 업데이트 → MessageList 리렌더링
```

### 표준 답변 등록
```
MessageItem → onRequestStandardAnswer → StandardAnswerDialog → onConfirm → App.tsx → standardAnswers 업데이트
```

### AI 모델 선택
```
ModelSelector → onModelSelect → App.tsx → selectedModel 업데이트
```

### Group Instructions 선택
```
GroupInstructionsDialog → onSelectPrompt → App.tsx → selectedPrompt 업데이트
```

---

## 🎯 향후 확장 고려사항

1. **Workspace 관리**
   - 멀티 워크스페이스 지원
   - 워크스페이스 생성/삭제/전환

2. **메시지 기능 확장**
   - 메시지 편집/삭제
   - 메시지 검색
   - 파일 첨부 기능 완성

3. **채팅 관리**
   - 채팅 이름 변경
   - 채팅 삭제
   - 채팅 즐겨찾기

4. **협업 기능**
   - 실시간 협업
   - 멤버 초대
   - 권한 관리

---

## 📝 주석 작성 규칙

모든 컴포넌트 파일은 다음 구조를 따릅니다:

```typescript
/**
 * ComponentName Component
 * 
 * 기능: 컴포넌트의 주요 기능 설명
 * 위치: UI상의 위치
 * 
 * 주요 기능:
 * - 기능 1
 * - 기능 2
 * - 기능 3
 * 
 * 데이터 구조: (필요 시)
 * - DataType: { field1, field2, ... }
 * 
 * 데이터 출처: (필요 시)
 * - 데이터의 출처 또는 관리 위치
 */
```

Props 인터페이스에는 JSDoc 주석으로 각 prop의 용도를 명시합니다:

```typescript
interface ComponentProps {
  /** 설명 */
  propName: Type;
}
```
