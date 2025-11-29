/**
 * AppContext
 * 
 * 애플리케이션의 전역 상태를 관리하는 Context
 * - Workspace, Team, Chat, Message 상태
 * - Group Instructions, Standard Answers
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  Team,
  Workspace,
  Chat,
  Message,
  GroupInstruction,
  StandardAnswer,
} from '../types';
import imgElipse6 from 'figma:asset/b940caf9f3a52bcc9317c793ebc094db911b237b.png';
import {
  listGroups,
  listChats,
  createChatApi,
  Group as ApiGroup,
  Chat as ApiChat,
  query,
} from '../lib/api';

interface ChatMessages {
  [chatId: string]: Message[];
}

/**
 * 초기 데이터 정의
 * 실제 서비스에서는 API 호출을 통해 데이터를 가져오게 됩니다.
 */

// 초기 Workspaces
const initialWorkspaces: Workspace[] = [
  {
    id: '1',
    name: 'Personal Workspace',
    type: 'personal',
  },
  {
    id: '2',
    name: 'Team Workspace',
    type: 'organization',
  },
];

// 초기 Teams
const initialTeams: Team[] = [
  {
    id: '1',
    name: 'Personal',
    memberCount: 1,
    workspaceId: '1',
  },
  {
    id: '2',
    name: 'Team Adela',
    memberCount: 4,
    workspaceId: '2',
  },
];

// 초기 Chats
const initialChats: Chat[] = [
  {
    id: '1',
    title: '첫 번째 대화',
    preview: '안녕하세요, 무엇을 도와드릴까요?',
    timestamp: '방금 전',
    teamId: null,
    lastUpdated: Date.now(),
  },
  {
    id: '2',
    title: 'React 학습 관련 질문',
    preview: 'useState와 useEffect의 차이점은...',
    timestamp: '2시간 전',
    teamId: null,
    lastUpdated: Date.now() - 7200000,
  },
  {
    id: '3',
    title: 'TypeScript 타입 정의',
    preview: '제네릭 타입을 어떻게 사용하나요...',
    timestamp: '어제',
    teamId: null,
    lastUpdated: Date.now() - 86400000,
  },

  // 팀 채팅 예시
  {
    id: '4',
    title: '마케팅 캠페인 기획',
    preview: 'Q1 마케팅 전략에 대해서...',
    timestamp: '1시간 전',
    teamId: '2',
    lastUpdated: Date.now() - 3600000,
  },
  {
    id: '5',
    title: 'SNS 콘텐츠 아이디어',
    preview: '인스타그램 콘텐츠...',
    timestamp: '3시간 전',
    teamId: '2',
    lastUpdated: Date.now() - 10800000,
  },
];

// 초기 Prompts (Group Instructions)
const initialPrompts: GroupInstruction[] = [
  {
    id: '1',
    teamId: '1',
    title: '기본 응답 스타일',
    content:
      '모든 답변은 친절하고 명확하게, 단계별로 설명해 주세요.\n가능하다면 예시도 함께 제공해 주세요.',
  },
  {
    id: '2',
    teamId: '2',
    title: '마케팅 팀용 프롬프트',
    content:
      '디지털 마케팅 전략, 캠페인 기획, 콘텐츠 아이디어에 특화된 답변을 제공합니다.',
  },
];

// 초기 Chat Messages
const mockMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: '안녕하세요! 오늘의 작업을 정리해 주세요.',
    timestamp: '오전 10:00',
  },
  {
    id: '2',
    role: 'assistant',
    content:
      '안녕하세요! 오늘의 작업은 다음과 같습니다:\n1. UI 컴포넌트 구조 정리\n2. AppContext 상태 관리 개선\n3. API 연동 작업\n\n각 작업에 대해 무엇을 먼저 도와드릴까요?',
    timestamp: '오전 10:01',
  },
  {
    id: '3',
    role: 'user',
    content: 'AppContext 구조를 이해하고 싶어요.',
    timestamp: '오전 10:02',
  },
  {
    id: '4',
    role: 'assistant',
    content:
      'AppContext는 애플리케이션 전역 상태를 관리하는 역할을 합니다. 주요 상태는 다음과 같습니다:\n- Workspace & Team 정보\n- Chat & Message 상태\n- Group Instructions & Standard Answers\n\n이 중 어떤 부분이 가장 궁금하신가요?',
    timestamp: '오전 10:03',
  },
];

const welcomeMessages: Message[] = [
  {
    id: Date.now().toString(),
    role: 'assistant',
    content: '새로운 대화입니다. 무엇을 도와드릴까요?',
    timestamp: new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  },
];

/**
 * AppContext 타입 정의
 */

interface AppContextType {
  // Workspace & Team
  workspaces: Workspace[];
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;

  // Chat & Messages
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  chatMessages: ChatMessages;
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessages>>;
  selectedChat: string;
  setSelectedChat: React.Dispatch<React.SetStateAction<string>>;
  selectedTeam: string | null;
  setSelectedTeam: React.Dispatch<React.SetStateAction<string | null>>;

  // Group Instructions & Standard Answers
  prompts: GroupInstruction[];
  standardAnswers: StandardAnswer[];
  setStandardAnswers: React.Dispatch<React.SetStateAction<StandardAnswer[]>>;

  // UI State
  selectedModel: string;
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;

  // Helper Functions
  createNewChat: () => void;
  handleCreateTeamChat: (teamId: string) => void;
  handleCreateTeam: (name: string) => void;
  handleDeleteTeam: (teamId: string) => void;
  handleChatClick: (chatId: string, teamId: string | null) => void;
  handleSendMessage: (inputValue: string) => Promise<void>;

  // User info
  userAvatar: string;
}

/**
 * Context 생성
 */

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * AppProvider 컴포넌트
 */

export function AppProvider({ children }: { children: ReactNode }) {
  const [workspaces] = useState<Workspace[]>(initialWorkspaces);
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [prompts] = useState<GroupInstruction[]>(initialPrompts);
  const [chatMessages, setChatMessages] = useState<ChatMessages>({
    '1': mockMessages,
  });
  const [selectedChat, setSelectedChat] = useState<string>('1');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [standardAnswers, setStandardAnswers] = useState<StandardAnswer[]>([]);
  const [selectedModel, setSelectedModel] = useState('ChatGPT-5');

  /**
   * 🔄 초기 로딩 시 백엔드에서 실제 팀/채팅 불러오기
   *  - /groups → 팀 목록
   *  - /chats  → 채팅 목록
   */
  useEffect(() => {
    async function loadInitial() {
      try {
        const [groupsRes, chatsRes] = await Promise.all([
          listGroups(),
          listChats(),
        ]);

        const mappedTeams: Team[] = groupsRes.map((g: ApiGroup) => ({
          id: g.id,
          name: g.name,
          memberCount: 1, // TODO: 백엔드에서 인원수 내려주면 교체
          workspaceId: g.workspace ?? 'personal',
        }));

        setTeams(mappedTeams);

        const mappedChats: Chat[] = chatsRes.map((c: ApiChat) => ({
          id: c.id,
          title: c.title || '새 대화',
          preview: '',
          timestamp: '',
          teamId: c.group_id,
          lastUpdated: c.last_updated
            ? new Date(c.last_updated).getTime()
            : Date.now(),
        }));

        setChats(mappedChats);
      } catch (e) {
        console.error('초기 팀/채팅 로딩 실패', e);
        // 실패하면 mock 데이터를 유지
      }
    }

    loadInitial();
  }, []);

  // Generate chat title from first user message
  const generateChatTitle = (content: string): string => {
    const summary = content.slice(0, 30).trim();
    return summary.length < content.length ? `${summary}...` : summary;
  };

  // Handle chat click
  const handleChatClick = (chatId: string, teamId: string | null) => {
    setSelectedChat(chatId);
    setSelectedTeam(teamId);
  };

  // 🔥 새 개인 채팅 생성 → /chats POST 연동
  const createNewChat = () => {
    const targetTeamId = selectedTeam || (teams[0]?.id ?? null);

    if (!targetTeamId) {
      console.warn('팀이 없어 새 채팅을 만들 수 없습니다.');
      return;
    }

    createChatApi({
      group_id: targetTeamId,
      title: '새 대화',
    })
      .then((created) => {
        const newChat: Chat = {
          id: created.id,
          title: created.title || '새 대화',
          preview: '새로운 대화를 시작하세요',
          timestamp: '방금 전',
          teamId: created.group_id,
          lastUpdated: created.last_updated
            ? new Date(created.last_updated).getTime()
            : Date.now(),
        };

        setChats((prev) => [newChat, ...prev]);
        setChatMessages((prev) => ({
          ...prev,
          [newChat.id]: welcomeMessages,
        }));
        setSelectedChat(newChat.id);
        setSelectedTeam(targetTeamId);
      })
      .catch((e) => {
        console.error('채팅 생성 실패', e);
      });
  };

  // 팀 특정 채팅 생성 (현재는 로컬 상태만 / API 연동은 나중에 확장)
  const handleCreateTeamChat = (teamId: string) => {
    const now = Date.now();
    const newChatId = now.toString();
    const newChat: Chat = {
      id: newChatId,
      title: '새 대화',
      preview: '새로운 대화를 시작하세요',
      timestamp: '방금',
      teamId: teamId,
      lastUpdated: now,
    };
    setChats((prev) => [newChat, ...prev]);
    setChatMessages((prev) => ({ ...prev, [newChatId]: welcomeMessages }));
    setSelectedChat(newChatId);
    setSelectedTeam(teamId);
  };

  // 팀 생성 (MVP에서는 로컬 상태)
  const handleCreateTeam = (name: string) => {
    const newTeam: Team = {
      id: Date.now().toString(),
      name,
      memberCount: 1,
      workspaceId: '1',
    };
    setTeams((prev) => [...prev, newTeam]);
  };

  // 팀 삭제 (MVP에서는 로컬 상태)
  const handleDeleteTeam = (teamId: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    setChats((prev) => prev.filter((c) => c.teamId !== teamId));
    if (selectedTeam === teamId) {
      setSelectedTeam(null);
      setSelectedChat(chats.find((c) => c.teamId === null)?.id || '1');
    }
  };

  // 메시지 전송 처리 → /query 실제 호출
  const handleSendMessage = async (inputValue: string) => {
    if (!inputValue.trim()) return;
    if (!selectedChat) return;

    const now = new Date();
    const timestamp = now.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // 1) 유저 메시지 추가
    const userMessage: Message = {
      id: now.getTime().toString(),
      role: 'user',
      content: inputValue,
      timestamp,
    };

    setChatMessages((prev) => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), userMessage],
    }));

    // 2) 채팅 메타 정보 업데이트 (프리뷰/제목/시간)
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === selectedChat
          ? {
            ...chat,
            preview: inputValue.slice(0, 30) + '...',
            title:
              chat.title === '첫 번째 대화'
                ? generateChatTitle(inputValue)
                : chat.title,
            timestamp: '방금 전',
            lastUpdated: now.getTime(),
          }
          : chat,
      ),
    );

    // 3) 백엔드 /query 호출
    try {
      const res = await query({
        q: inputValue,
        groupId: selectedTeam ?? undefined,
        preferTeamAnswer: true,
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.answer,
        timestamp: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setChatMessages((prev) => ({
        ...prev,
        [selectedChat]: [...(prev[selectedChat] || []), aiMessage],
      }));
    } catch (error) {
      console.error('Failed to query backend', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          '죄송합니다. 서버와 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        timestamp: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setChatMessages((prev) => ({
        ...prev,
        [selectedChat]: [...(prev[selectedChat] || []), errorMessage],
      }));
    }
  };


  const value: AppContextType = {
    workspaces,
    teams,
    setTeams,
    chats,
    setChats,
    chatMessages,
    setChatMessages,
    selectedChat,
    setSelectedChat,
    selectedTeam,
    setSelectedTeam,
    prompts,
    standardAnswers,
    setStandardAnswers,
    selectedModel,
    setSelectedModel,
    createNewChat,
    handleCreateTeamChat,
    handleCreateTeam,
    handleDeleteTeam,
    handleChatClick,
    handleSendMessage,
    userAvatar: imgElipse6,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
