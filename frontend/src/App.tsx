import { useState, useRef } from 'react';
import { MessageSquare, Plus, Send, Menu, Bell, Info, Moon, User, Sparkles, Users, ChevronDown, ChevronRight, Paperclip, Check, MoreHorizontal, Settings, LogOut, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { ScrollArea } from './components/ui/scroll-area';
import { Button } from './components/ui/button';
import { Textarea } from './components/ui/textarea';
import { Badge } from './components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
import TeamManagement from './components/TeamManagement';
import { FileIcon, getFileExtensionColor } from './components/FileIcon';
import imgElipse6 from "figma:asset/b940caf9f3a52bcc9317c793ebc094db911b237b.png";

interface Team {
  id: string;
  name: string;
  memberCount: number;
  workspaceId: string;
}

interface Workspace {
  id: string;
  name: string;
  type: 'personal' | 'organization';
  createdAt: Date;
}

interface Chat {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  teamId: string | null; // null means personal chat
  lastUpdated: number; // Unix timestamp for sorting
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: {
    fileName: string;
    fileExtension: string;
    isStale?: boolean;
  }[];
  isStale?: boolean;
}

interface GroupInstruction {
  id: string;
  title: string;
  content: string;
  teamId: string;
  description?: string;
}

interface StandardAnswer {
  id: string;
  teamId: string;
  question: string;
  answer: string;
  requestedBy: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  chatId: string;
  messageId: string;
  citations?: {
    fileName: string;
    fileExtension: string;
    isStale?: boolean;
  }[];
  isStale?: boolean;
}

const initialTeams: Team[] = [
  { id: '1', name: '마케팅팀', memberCount: 5, workspaceId: '1' },
  { id: '2', name: '개발팀', memberCount: 8, workspaceId: '1' },
  { id: '3', name: '디자인팀', memberCount: 4, workspaceId: '1' },
];

const initialWorkspaces: Workspace[] = [
  { id: '1', name: 'My Organization', type: 'organization', createdAt: new Date() },
  { id: '2', name: 'Personal Workspace', type: 'personal', createdAt: new Date() },
];

const initialChats: Chat[] = [
  // Personal chats (teamId: null)
  { id: '1', title: '채팅 인터페이스 디자인', preview: 'AI 챗봇 페이지를 만들어줘...', timestamp: '방금 전', teamId: null, lastUpdated: Date.now() },
  { id: '2', title: 'React 컴포넌트 질문', preview: 'useState와 useEffect의 차이점은...', timestamp: '2시간 전', teamId: null, lastUpdated: Date.now() - 7200000 },
  { id: '3', title: 'TypeScript 타입 정의', preview: '제네릭 타입을 어떻게 사용하나요...', timestamp: '어제', teamId: null, lastUpdated: Date.now() - 86400000 },
  
  // Marketing team chats (teamId: '1')
  { id: '4', title: '마케팅 캠페인 기획', preview: 'Q1 마케팅 전략에 대해서...', timestamp: '1시간 전', teamId: '1', lastUpdated: Date.now() - 3600000 },
  { id: '5', title: 'SNS 콘텐츠 아이디어', preview: '인스타그램 콘텐츠...', timestamp: '3시간 전', teamId: '1', lastUpdated: Date.now() - 10800000 },
  
  // Development team chats (teamId: '2')
  { id: '6', title: 'API 설계 논의', preview: 'REST API 구조에 대해...', timestamp: '30분 전', teamId: '2', lastUpdated: Date.now() - 1800000 },
  { id: '7', title: '버그 수정 방법', preview: '로그인 버그 해결...', timestamp: '5시간 전', teamId: '2', lastUpdated: Date.now() - 18000000 },
  { id: '8', title: '코드 리뷰 요청', preview: '새로운 기능 구현 검토...', timestamp: '1일 전', teamId: '2', lastUpdated: Date.now() - 86400000 },
  
  // Design team chats (teamId: '3')
  { id: '9', title: 'UI 컴포넌트 디자인', preview: '버튼 디자인 시스템...', timestamp: '2시간 전', teamId: '3', lastUpdated: Date.now() - 7200000 },
  { id: '10', title: '컬러 팔레트 제안', preview: '새로운 브랜드 컬러...', timestamp: '6시간 전', teamId: '3', lastUpdated: Date.now() - 21600000 },
];

const mockMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: '안녕하세요! AI 챗봇 인터페이스를 만들고 싶어요.',
    timestamp: '오후 2:30'
  },
  {
    id: '2',
    role: 'assistant',
    content: '안녕하세요! AI 챗봇 인터페이스를 만드는 것을 도와드리겠습니다. 어떤 스타일의 인터페이스를 원하시나요? 예를 들어, ChatGPT 스타일이나 커스텀 디자인 중 어떤 것을 선호하시나요?',
    timestamp: '오후 2:30'
  },
  {
    id: '3',
    role: 'user',
    content: '좌측에는 채팅 대화 목록이 있고, 우측에는 메인 채팅 창이 있는 레이아웃이 좋을 것 같아요.',
    timestamp: '오후 2:31'
  },
  {
    id: '4',
    role: 'assistant',
    content: '좋은 선택이세요! 그런 레이아웃은 사용자가 여러 대화를 쉽게 관리할 수 있게 해줍니다. 다음과 같은 기능들을 포함하면 좋습니다:\n\n1. **좌측 사이드바**: 대화 목록, 새 대화 시작 버튼, 검색 기능\n2. **우측 메인 영역**: 메시지 히스토리, 입력 창, 전송 버튼\n3. **추가 기능**: 다크 모드, 사용자 프로필, 설정\n\n이러한 요소들을 포함하여 직관적이고 사용하기 쉬운 인터페이스를 만들 수 있습니다.',
    timestamp: '오후 2:31'
  },
];

const aiModels = ['ChatGPT-5', 'Sonar', 'Gemini', 'Claude Sonnet', 'Claude Opus'];

const initialPrompts: GroupInstruction[] = [
  // Marketing team prompts
  {
    id: 'p1',
    title: '마케팅 캠페인 기획 도우미',
    content: '당신은 마케팅 전문가입니다. 효과적인 마케팅 캠페인을 기획하고 실행 계획을 수립하는 것을 도와주세요.',
    teamId: '1',
    description: 'SNS, 콘텐츠 마케팅 등 다양한 채널의 캠페인 기획'
  },
  {
    id: 'p2',
    title: 'SNS 콘텐츠 작성 전문가',
    content: '당신은 SNS 콘텐츠 작성 전문가입니다. 인스타그램, 페이스북, 트위터 등 각 플랫폼에 맞는 매력적인 콘텐츠를 작성해주세요.',
    teamId: '1',
    description: '플랫폼별 맞춤 콘텐츠 작성'
  },
  {
    id: 'p3',
    title: '시장 분석 리포트 작성',
    content: '당신은 시장 분석 전문가입니다. 데이터를 분석하고 인사이트를 도출하여 전략적인 리포트를 작성해주세요.',
    teamId: '1',
    description: '경쟁사 분석, 트렌드 분석 등'
  },
  
  // Development team prompts
  {
    id: 'p4',
    title: 'React 개발 전문가',
    content: '당신은 React 개발 전문가입니다. 최신 React 베스트 프랙티스를 따르며, 성능 최적화와 클린 코드 작성을 도와주세요.',
    teamId: '2',
    description: 'React 컴포넌트 설계 및 최적화'
  },
  {
    id: 'p5',
    title: '코드 리뷰 어시스턴트',
    content: '당신은 코드 리뷰 전문가입니다. 코드의 품질, 성능, 보안, 가독성을 검토하고 개선 제안을 해주세요.',
    teamId: '2',
    description: '코드 품질 향상을 위한 리뷰'
  },
  {
    id: 'p6',
    title: 'API 설계 도우미',
    content: '당신은 백엔드 API 설계 전문가입니다. RESTful API 또는 GraphQL API를 설계하고 문서화하는 것을 도와주세요.',
    teamId: '2',
    description: 'API 엔드포인트 설계 및 문서화'
  },
  
  // Design team prompts
  {
    id: 'p7',
    title: 'UI/UX 디자인 컨설턴트',
    content: '당신은 UI/UX 디자인 전문가입니다. 사용자 경험을 최우선으로 하는 직관적이고 아름다운 인터페이스 디자인을 제안해주세요.',
    teamId: '3',
    description: '사용자 중심의 디자인 제안'
  },
  {
    id: 'p8',
    title: '디자인 시스템 구축 가이드',
    content: '당신은 디자인 시스템 전문가입니다. 일관성 있는 디자인 시스템을 구축하고 관리하는 방법을 안내해주세요.',
    teamId: '3',
    description: '컴포넌트 라이브러리, 디자인 토큰 등'
  },
  {
    id: 'p9',
    title: '접근성 개선 전문가',
    content: '당신은 웹 접근성 전문가입니다. WCAG 가드라인을 따르며 모든 사용자가 접근 가능한 디자인을 만들도록 도와주세요.',
    teamId: '3',
    description: 'ARIA, 키보드 내비게이션 등'
  },
];

const welcomeMessages: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: '안녕하세요! 👋\n\nTeam AI Agent입니다. 무엇을 도와드릴까요?\n\n다음과 같은 도움을 드릴 수 있습니다:\n• 질문에 대한 답변\n• 문서 작성 및 편집\n• 코드 작성 및 디버깅\n• 아이디어 브레인스토밍\n\n편하게 질문해주세요!',
    timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }
];

export default function App() {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [prompts] = useState<GroupInstruction[]>(initialPrompts);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [clickedMessageId, setClickedMessageId] = useState<string | null>(null);
  const [standardAnswerDialogOpen, setStandardAnswerDialogOpen] = useState(false);
  const [selectedAnswerForStandard, setSelectedAnswerForStandard] = useState<Message | null>(null);
  const [standardAnswers, setStandardAnswers] = useState<StandardAnswer[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<string>('1');
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>({ '1': mockMessages });
  const [inputValue, setInputValue] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTeamsOpen, setIsTeamsOpen] = useState(true);
  const [isChatsOpen, setIsChatsOpen] = useState(true);
  const [expandedTeams, setExpandedTeams] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('ChatGPT-5');
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<GroupInstruction | null>(null);
  const [isPromptSelectorOpen, setIsPromptSelectorOpen] = useState(false);
  const [showTeamManagement, setShowTeamManagement] = useState(false);
  const [teamManagementOptions, setTeamManagementOptions] = useState({
    selectedTeam: null as string | null,
    sidebarCollapsed: false,
    showCreateDialog: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const selectedTeamData = selectedTeam ? teams.find(team => team.id === selectedTeam) : null;
  const selectedChatData = chats.find(chat => chat.id === selectedChat);
  const messages = chatMessages[selectedChat] || [];
  const isPersonalChat = selectedChatData?.teamId === null;
  
  // Generate chat title from first user message
  const generateChatTitle = (content: string): string => {
    // Simple summarization: take first 30 characters
    const summary = content.slice(0, 30).trim();
    return summary.length < content.length ? summary + '...' : summary;
  };
  
  // Create new chat
  const createNewChat = () => {
    const now = Date.now();
    const newChatId = now.toString();
    const newChat: Chat = {
      id: newChatId,
      title: '새 대화',
      preview: '새로운 대화를 시작하세요',
      timestamp: '방금 전',
      teamId: null,
      lastUpdated: now
    };
    
    setChats(prev => [newChat, ...prev]);
    setChatMessages(prev => ({ ...prev, [newChatId]: welcomeMessages }));
    setSelectedChat(newChatId);
    setSelectedTeam(null);
  };
  
  // Handle team creation
  const handleCreateTeam = (name: string) => {
    const newTeam: Team = {
      id: Date.now().toString(),
      name,
      memberCount: 1,
      workspaceId: '1' // Default to the first workspace
    };
    setTeams(prev => [...prev, newTeam]);
  };
  
  // Handle team deletion
  const handleDeleteTeam = (teamId: string) => {
    setTeams(prev => prev.filter(t => t.id !== teamId));
    setChats(prev => prev.filter(c => c.teamId !== teamId));
    if (selectedTeam === teamId) {
      setSelectedTeam(null);
      setSelectedChat(chats.find(c => c.teamId === null)?.id || '1');
    }
  };

  // Handle creating a new chat in a specific team
  const handleCreateTeamChat = (teamId: string) => {
    const now = Date.now();
    const newChatId = now.toString();
    const newChat: Chat = {
      id: newChatId,
      title: '새 대화',
      preview: '새로운 대화를 시작하세요',
      timestamp: '방금',
      teamId: teamId,
      lastUpdated: now
    };
    setChats(prev => [newChat, ...prev]);
    setChatMessages(prev => ({ ...prev, [newChatId]: welcomeMessages }));
    setSelectedChat(newChatId);
    setSelectedTeam(teamId);
    
    // Expand the team if not already expanded
    if (!expandedTeams.includes(teamId)) {
      setExpandedTeams(prev => [...prev, teamId]);
    }
  };
  
  const toggleTeamExpand = (teamId: string) => {
    setExpandedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };
  
  const handleTeamClick = (teamId: string) => {
    setSelectedTeam(teamId);
    toggleTeamExpand(teamId);
    // 팀의 첫 번째 채팅 선택
    const teamChats = chats.filter(chat => chat.teamId === teamId);
    if (teamChats.length > 0) {
      setSelectedChat(teamChats[0].id);
    }
  };
  
  const handleChatClick = (chatId: string, teamId: string | null) => {
    setSelectedChat(chatId);
    if (teamId === null) {
      // 일반 채팅 선택 시 팀 선택 해제
      setSelectedTeam(null);
    } else {
      // 팀 채팅 선택 시 해당 팀 선택
      setSelectedTeam(teamId);
      if (!expandedTeams.includes(teamId)) {
        setExpandedTeams(prev => [...prev, teamId]);
      }
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const now = Date.now();
    const newMessage: Message = {
      id: now.toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, newMessage];
    setChatMessages(prev => ({ ...prev, [selectedChat]: updatedMessages }));
    
    // Update chat title if it's the first user message and title is "새 대화"
    const currentChat = chats.find(c => c.id === selectedChat);
    if (currentChat?.title === '새 대화') {
      const newTitle = generateChatTitle(inputValue);
      setChats(prev => prev.map(c => 
        c.id === selectedChat 
          ? { ...c, title: newTitle, preview: inputValue.slice(0, 50) + '...', lastUpdated: now }
          : c
      ));
    } else {
      // Update lastUpdated timestamp to move chat to top
      setChats(prev => prev.map(c => 
        c.id === selectedChat 
          ? { ...c, lastUpdated: now }
          : c
      ));
    }
    
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '답변을 생성하고 있습니다...',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => ({ 
        ...prev, 
        [selectedChat]: [...(prev[selectedChat] || []), aiResponse] 
      }));
    }, 1000);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log('Selected files:', files);
      // Handle file upload logic here
    }
  };

  const handleRequestStandardAnswer = () => {
    if (!selectedAnswerForStandard || !selectedChat || !selectedTeam) return;

    const newStandardAnswer: StandardAnswer = {
      id: `sa-${Date.now()}`,
      teamId: selectedTeam,
      question: messages[messages.findIndex(m => m.id === selectedAnswerForStandard.id) - 1]?.content || '',
      answer: selectedAnswerForStandard.content,
      requestedBy: 'Adela Parkson',
      requestedAt: new Date(),
      status: 'pending',
      chatId: selectedChat,
      messageId: selectedAnswerForStandard.id
    };

    setStandardAnswers(prev => [...prev, newStandardAnswer]);
    setStandardAnswerDialogOpen(false);
    setSelectedAnswerForStandard(null);
  };

  const pendingAnswersCount = standardAnswers.filter(sa => sa.status === 'pending').length;

  if (showTeamManagement) {
    return (
      <TeamManagement
        onBack={() => {
          setShowTeamManagement(false);
          setTeamManagementOptions({
            selectedTeam: null,
            sidebarCollapsed: false,
            showCreateDialog: false
          });
        }}
        teams={teams}
        onCreateTeam={handleCreateTeam}
        onDeleteTeam={handleDeleteTeam}
        initialSelectedTeam={teamManagementOptions.selectedTeam}
        initialSidebarCollapsed={teamManagementOptions.sidebarCollapsed}
        initialShowCreateDialog={teamManagementOptions.showCreateDialog}
        standardAnswers={standardAnswers}
        onUpdateStandardAnswer={(id, status) => {
          setStandardAnswers(prev => prev.map(sa => 
            sa.id === id ? { ...sa, status, approvedBy: status === 'approved' ? 'Adela Parkson' : undefined, approvedAt: status === 'approved' ? new Date() : undefined } : sa
          ));
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Left Sidebar */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 flex-shrink-0 border-r border-[#E9EDF7] bg-white overflow-hidden`}>
        <div className="flex flex-col h-full">
          {/* Workspace Selector */}
          <div className="px-4 pt-4 pb-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#f0f9ff] transition-colors group">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-semibold text-[#1b2559]">Personal</p>
                      <p className="text-[10px] text-[#718096]">Workspace</p>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#718096] group-hover:text-[#0EA5E9] transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <div className="px-2 py-1.5">
                  <p className="text-[11px] font-semibold text-[#718096] uppercase px-2 mb-1">My Workspaces</p>
                </div>
                <DropdownMenuItem className="cursor-pointer">
                  <div className="flex items-center gap-2 w-full">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-[#1b2559]">Personal</p>
                      <p className="text-[10px] text-[#718096]">개인 워크스페이스</p>
                    </div>
                    <Check className="w-4 h-4 text-[#0EA5E9]" />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="text-[12px]">새 워크스페이스 생성</span>
                  <Badge className="ml-auto text-[9px] h-4 bg-[#E9EDF7] text-[#718096]">준비중</Badge>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <ScrollArea className="flex-1">
            {/* Teams Section */}
            <Collapsible open={isTeamsOpen} onOpenChange={setIsTeamsOpen} className="px-4 pt-6">
              <div className="flex items-center justify-between mb-3">
                <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                  {isTeamsOpen ? (
                    <ChevronDown className="w-4 h-4 text-[#718096]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#718096]" />
                  )}
                  <h2 className="text-[12px] font-semibold text-[#718096] uppercase">팀</h2>
                </CollapsibleTrigger>
                <Button 
                  size="sm"
                  className="h-7 px-3 bg-transparent hover:bg-[#f0f9ff] text-[#0EA5E9] shadow-none text-[11px]"
                  onClick={() => {
                    setTeamManagementOptions({
                      selectedTeam: null,
                      sidebarCollapsed: false,
                      showCreateDialog: true
                    });
                    setShowTeamManagement(true);
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  팀 생성
                </Button>
              </div>
              <CollapsibleContent>
                <div className="space-y-2 mb-6">
                  {teams.map((team) => {
                    const teamChats = chats
                      .filter(chat => chat.teamId === team.id)
                      .sort((a, b) => b.lastUpdated - a.lastUpdated);
                    const isExpanded = expandedTeams.includes(team.id);
                    
                    return (
                      <div key={team.id}>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleTeamClick(team.id)}
                            className={`flex-1 text-left p-2 rounded-xl transition-all ${
                              selectedTeam === team.id 
                                ? 'bg-gradient-to-r from-[#E0F2FE] to-[#FAE8FF] border-l-4 border-[#0EA5E9]' 
                                : 'hover:bg-[#f0f9ff]'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex items-center gap-1">
                                {isExpanded ? (
                                  <ChevronDown className="w-3 h-3 text-[#718096]" />
                                ) : (
                                  <ChevronRight className="w-3 h-3 text-[#718096]" />
                                )}
                                <Users className={`w-4 h-4 ${selectedTeam === team.id ? 'text-[#0EA5E9]' : 'text-[#718096]'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-[13px] font-semibold mb-0.5 truncate text-[#1b2559]">
                                  {team.name}
                                </h3>
                                <p className="text-[11px] text-[#718096]">{team.memberCount}명의 멤버</p>
                              </div>
                            </div>
                          </button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="h-8 w-8 rounded-md text-[#718096] hover:text-[#0EA5E9] hover:bg-[#f0f9ff] flex-shrink-0 inline-flex items-center justify-center transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTeamManagementOptions({
                                    selectedTeam: team.id,
                                    sidebarCollapsed: true,
                                    showCreateDialog: false
                                  });
                                  setShowTeamManagement(true);
                                }}
                                className="cursor-pointer"
                              >
                                <Settings className="w-4 h-4 mr-2" />
                                팀 관리
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCreateTeamChat(team.id);
                                }}
                                className="cursor-pointer"
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                새로운 채팅
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTeam(team.id);
                                }}
                                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                              >
                                <LogOut className="w-4 h-4 mr-2" />
                                팀 나가기
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {/* Team Chats */}
                        {isExpanded && teamChats.length > 0 && (
                          <div className="ml-6 mt-1 space-y-1">
                            {teamChats.map((chat) => (
                              <button
                                key={chat.id}
                                onClick={() => handleChatClick(chat.id, chat.teamId)}
                                className={`w-full text-left p-2 rounded-lg transition-all ${
                                  selectedChat === chat.id 
                                    ? 'bg-gradient-to-r from-[#E0F2FE] to-[#FAE8FF] border-l-4 border-[#0EA5E9]' 
                                    : 'hover:bg-[#f0f9ff]'
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <MessageSquare className={`w-3.5 h-3.5 mt-0.5 ${selectedChat === chat.id ? 'text-[#0EA5E9]' : 'text-[#718096]'}`} />
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-[12px] font-semibold mb-0.5 truncate text-[#1b2559]">
                                      {chat.title}
                                    </h3>
                                    <p className="text-[10px] text-[#718096] truncate">{chat.preview}</p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Chats Section */}
            <Collapsible open={isChatsOpen} onOpenChange={setIsChatsOpen} className="px-4 pb-4">
              <div className="flex items-center justify-between mb-3">
                <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                  {isChatsOpen ? (
                    <ChevronDown className="w-4 h-4 text-[#718096]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#718096]" />
                  )}
                  <h2 className="text-[12px] font-semibold text-[#718096] uppercase">채팅</h2>
                </CollapsibleTrigger>
                <Button 
                  size="sm"
                  className="h-7 px-3 bg-transparent hover:bg-[#f0f9ff] text-[#0EA5E9] shadow-none text-[11px]"
                  onClick={createNewChat}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  새 대화 시작
                </Button>
              </div>
              <CollapsibleContent>
                <div className="space-y-1">
                  {chats
                    .filter(chat => chat.teamId === null)
                    .sort((a, b) => b.lastUpdated - a.lastUpdated)
                    .map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => handleChatClick(chat.id, chat.teamId)}
                        className={`w-full text-left p-2 rounded-xl transition-all ${
                          selectedChat === chat.id 
                            ? 'bg-gradient-to-r from-[#E0F2FE] to-[#FAE8FF] border-l-4 border-[#0EA5E9]' 
                            : 'hover:bg-[#f0f9ff]'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <MessageSquare className={`w-4 h-4 mt-0.5 ${selectedChat === chat.id ? 'text-[#0EA5E9]' : 'text-[#718096]'}`} />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-[13px] font-semibold mb-0.5 truncate text-[#1b2559]">
                              {chat.title}
                            </h3>
                            <p className="text-[11px] text-[#718096] truncate">{chat.preview}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </ScrollArea>

          {/* User Profile */}
          <div className="p-4 border-t border-[#E9EDF7]">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white shadow-[14px_17px_40px_4px_rgba(112,144,176,0.08)]">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6]">
                <img src={imgElipse6} alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-[#1b2559]">Adela Parkson</p>
              </div>
              <button className="w-9 h-9 rounded-full border border-[#E0E5F2] flex items-center justify-center hover:bg-[#f0f9ff] transition-colors">
                <User className="w-4 h-4 text-[#1B2559]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Top Header */}
        <div className="h-[56px] border-b border-[#E9EDF7] flex items-center justify-between px-8 bg-white">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-[#718096] hover:bg-[#f0f9ff]"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              {isPersonalChat ? (
                <>
                  <MessageSquare className="w-5 h-5 text-[#0EA5E9]" />
                  <h2 className="text-[18px] font-semibold text-[#1b2559]">나의 채팅</h2>
                </>
              ) : selectedTeamData ? (
                <>
                  <Users className="w-5 h-5 text-[#0EA5E9]" />
                  <h2 className="text-[18px] font-semibold text-[#1b2559]">{selectedTeamData.name}</h2>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-5 h-5 flex items-center justify-center text-[#718096] hover:text-[#1b2559] transition-colors">
              <Bell className="w-5 h-5" />
              {pendingAnswersCount > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            <button className="w-[18px] h-[18px] flex items-center justify-center text-[#718096] hover:text-[#1b2559] transition-colors">
              <Moon className="w-[18px] h-[18px]" />
            </button>
            <button className="w-5 h-5 flex items-center justify-center text-[#718096] hover:text-[#1b2559] transition-colors">
              <Info className="w-5 h-5" />
            </button>
            <div className="w-[36px] h-[36px] rounded-full overflow-hidden bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] ml-2">
              <img src={imgElipse6} alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-8">
          <div className="max-w-4xl mx-auto py-8">
            <div className="space-y-6">
                {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[70%] ${message.role === 'user' ? 'order-1' : ''} relative`}>
                    {/* Stale Warning - appears above AI message */}
                    {message.role === 'assistant' && message.isStale && message.citations && (
                      <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] text-amber-800">
                            ⚠ 이 답변은 최신 문서가 아닌, 오래된 정보를 포함하고 있을 수 있습니다.
                          </p>
                          <p className="text-[10px] text-amber-600 mt-0.5">
                            (사용된 출처 중 {message.citations.filter(c => c.isStale).length}개가 stale 상태입니다.)
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div 
                      className={`p-4 rounded-2xl relative cursor-pointer transition-all ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] text-white ml-auto' 
                          : `bg-[#F4F7FE] text-[#1b2559] ${
                              selectedTeam && hoveredMessageId === message.id 
                                ? 'ring-2 ring-[#0EA5E9]/30' 
                                : ''
                            }`
                      }`}
                      onMouseEnter={() => message.role === 'assistant' && selectedTeam && setHoveredMessageId(message.id)}
                      onMouseLeave={() => setHoveredMessageId(null)}
                      onClick={() => {
                        if (message.role === 'assistant' && selectedTeam) {
                          setClickedMessageId(clickedMessageId === message.id ? null : message.id);
                        }
                      }}
                    >
                      <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      
                      {/* Citations - appears at bottom right of AI message */}
                      {message.role === 'assistant' && message.citations && message.citations.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3 justify-end">
                          {message.citations.map((citation, idx) => (
                            <div 
                              key={idx}
                              className={`flex items-center gap-1 px-2 py-1 bg-white/80 rounded text-[10px] ${
                                citation.isStale ? 'border border-amber-300' : 'border border-[#E9EDF7]'
                              }`}
                              title={citation.fileName}
                            >
                              <FileIcon 
                                extension={citation.fileExtension} 
                                className={`w-3 h-3 ${getFileExtensionColor(citation.fileExtension)}`} 
                              />
                              <span className="text-[#718096] max-w-[100px] truncate">
                                {citation.fileName.length > 20 
                                  ? citation.fileName.substring(0, 17) + '...' 
                                  : citation.fileName}
                              </span>
                              {citation.isStale && (
                                <Badge className="h-3 px-1 text-[8px] bg-amber-100 text-amber-700 border-none">
                                  STALE
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Standard Answer Button - appears on click */}
                      {message.role === 'assistant' && selectedTeam && clickedMessageId === message.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAnswerForStandard(message);
                            setStandardAnswerDialogOpen(true);
                            setClickedMessageId(null);
                          }}
                          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-[#E0F2FE] transition-colors border-2 border-[#0EA5E9] z-10"
                          title="팀 표준 답변으로 등록"
                        >
                          <CheckCircle className="w-5 h-5 text-[#0EA5E9]" />
                        </button>
                      )}
                    </div>
                    <p className={`text-[11px] text-[#718096] mt-2 ${message.role === 'user' ? 'text-right' : ''}`}>
                      {message.timestamp}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] flex-shrink-0">
                      <img src={imgElipse6} alt="User" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* AI Model Selector & Prompt Selector */}
        <div className="px-8 py-2 border-t border-[#E9EDF7]">
          <div className="max-w-4xl mx-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
              className="text-[12px] h-7 border-[#E9EDF7] text-[#718096] hover:text-[#0EA5E9] hover:border-[#0EA5E9]"
            >
              {selectedModel}
            </Button>
            
            {isModelSelectorOpen && (
              <div className="flex items-center gap-2 animate-in slide-in-from-left">
                {aiModels.map((model) => (
                  <Button
                    key={model}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedModel(model);
                      setIsModelSelectorOpen(false);
                    }}
                    className={`text-[12px] h-7 ${
                      selectedModel === model 
                        ? 'bg-gradient-to-r from-[#E0F2FE] to-[#FAE8FF] text-[#0EA5E9]' 
                        : 'text-[#718096] hover:text-[#0EA5E9]'
                    }`}
                  >
                    {selectedModel === model && <Check className="w-3 h-3 mr-1" />}
                    {model}
                  </Button>
                ))}
              </div>
            )}

            {/* Group Instructions Selector - Only show when in a team chat */}
            {selectedTeam && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPromptSelectorOpen(true)}
                className="text-[12px] h-7 border-[#E9EDF7] text-[#718096] hover:text-[#0EA5E9] hover:border-[#0EA5E9]"
              >
                <FileText className="w-3 h-3 mr-1" />
                {selectedPrompt ? selectedPrompt.title.split(' ')[0].slice(0, 8) + '...' : 'Group Instructions'}
              </Button>
            )}
          </div>
        </div>

        {/* Prompt Selector Dialog */}
        <Dialog open={isPromptSelectorOpen} onOpenChange={setIsPromptSelectorOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>프롬프트 선택</DialogTitle>
              <DialogDescription>
                {selectedTeam && teams.find(t => t.id === selectedTeam)?.name}의 등록된 프롬프트를 선택하세요
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[500px] pr-4">
              <div className="space-y-3">
                {selectedTeam && prompts
                  .filter(p => p.teamId === selectedTeam)
                  .map((prompt) => (
                    <div
                      key={prompt.id}
                      onClick={() => {
                        setSelectedPrompt(prompt);
                        setIsPromptSelectorOpen(false);
                      }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-[#0EA5E9] hover:bg-[#f0f9ff] ${
                        selectedPrompt?.id === prompt.id
                          ? 'border-[#0EA5E9] bg-gradient-to-r from-[#E0F2FE] to-[#FAE8FF]'
                          : 'border-[#E9EDF7]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#0EA5E9]" />
                          <h3 className="font-semibold text-[14px] text-[#1b2559]">
                            {prompt.title}
                          </h3>
                        </div>
                        {selectedPrompt?.id === prompt.id && (
                          <Check className="w-4 h-4 text-[#0EA5E9]" />
                        )}
                      </div>
                      {prompt.description && (
                        <p className="text-[12px] text-[#718096] mb-2">
                          {prompt.description}
                        </p>
                      )}
                      <p className="text-[12px] text-[#718096] line-clamp-2 bg-white/50 p-2 rounded">
                        {prompt.content}
                      </p>
                    </div>
                  ))}
                
                {selectedTeam && prompts.filter(p => p.teamId === selectedTeam).length === 0 && (
                  <div className="text-center py-8 text-[#718096]">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>이 팀에 등록된 프롬프트가 없습니다.</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex justify-between items-center pt-4 border-t border-[#E9EDF7]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPrompt(null)}
                className="text-[12px] text-[#718096]"
              >
                선택 해제
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPromptSelectorOpen(false)}
                className="text-[12px]"
              >
                닫기
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Standard Answer Request Dialog */}
        <Dialog open={standardAnswerDialogOpen} onOpenChange={setStandardAnswerDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>팀 표준 답변 등록</DialogTitle>
              <DialogDescription>
                이 답변을 {selectedTeamData?.name}의 표준 답변으로 등록 요청하시겠습니까?
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <p className="text-[14px] text-[#718096] mb-2">답변 내용:</p>
              <div className="p-3 bg-[#F4F7FE] rounded-lg max-h-[200px] overflow-y-auto">
                <p className="text-[13px] text-[#1b2559] whitespace-pre-wrap">
                  {selectedAnswerForStandard?.content}
                </p>
              </div>
              <p className="text-[12px] text-[#718096] mt-3">
                * 관리자 승인 후 팀 표준 답변으로 등록됩니다.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStandardAnswerDialogOpen(false);
                  setSelectedAnswerForStandard(null);
                }}
              >
                아니오
              </Button>
              <Button
                className="bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] hover:opacity-90 text-white"
                onClick={handleRequestStandardAnswer}
              >
                예
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Input Area */}
        <div className="p-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4 items-end">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleFileUpload}
                className="h-[54px] w-[54px] border-[#E9EDF7] text-[#718096] hover:text-[#0EA5E9] hover:border-[#0EA5E9] rounded-full flex-shrink-0"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              <div className="flex-1 relative">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="메시지를 입력하세요..."
                  className="resize-none border-[#E9EDF7] rounded-[24px] px-6 py-4 min-h-[54px] max-h-[200px] text-[14px]"
                  rows={1}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="h-[54px] px-8 bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] hover:opacity-90 text-white rounded-full shadow-[0px_21px_27px_-10px_rgba(14,165,233,0.48)] disabled:opacity-30"
              >
                <Send className="w-4 h-4 mr-2" />
                전송
              </Button>
            </div>
            <p className="text-[12px] text-[#718096] text-center mt-4">
              AI가 부정확한 정보를 생성할 수 있습니다. 중요한 정보는 확인하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}