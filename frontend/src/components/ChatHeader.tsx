/**
 * ChatHeader Component
 * 
 * 채팅 페이지 상단 헤더
 * - 사이드바 토글 버튼
 * - 채팅/팀 이름 표시
 * - 알림, 다크모드, 정보, 프로필 버튼
 */

import { Bell, Info, Moon, Users, PanelLeft } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  pendingAnswersCount?: number;
}

export function ChatHeader({ isSidebarOpen, onToggleSidebar, pendingAnswersCount = 0 }: ChatHeaderProps) {
  const { teams, chats, selectedChat, selectedTeam, userAvatar } = useApp();
  
  const selectedTeamData = selectedTeam ? teams.find(team => team.id === selectedTeam) : null;
  const selectedChatData = chats.find(chat => chat.id === selectedChat);
  const isPersonalChat = selectedChatData?.teamId === null;

  return (
    <div className="h-[56px] border-b border-[#E9EDF7] flex items-center justify-between px-8 bg-white flex-shrink-0">
      <div className="flex items-center gap-4">
        {/* 사이드바 열기/닫기 버튼 */}
        {!isSidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#f0f9ff] transition-colors group"
            title="사이드바 열기"
            aria-label="사이드바 열기"
          >
            <PanelLeft className="w-5 h-5 text-[#718096] group-hover:text-[#0EA5E9] transition-colors" />
          </button>
        )}
        <div className="flex items-center gap-2">
          {isPersonalChat ? (
            <>
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
        <button className="w-5 h-5 flex items-center justify-center text-[#718096] hover:text-[#1b2559] transition-colors relative">
          <Bell className="w-5 h-5" />
          {pendingAnswersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-[9px] text-white font-semibold">{pendingAnswersCount}</span>
            </span>
          )}
        </button>
        <button className="w-[18px] h-[18px] flex items-center justify-center text-[#718096] hover:text-[#1b2559] transition-colors">
          <Moon className="w-[18px] h-[18px]" />
        </button>
        <button className="w-5 h-5 flex items-center justify-center text-[#718096] hover:text-[#1b2559] transition-colors">
          <Info className="w-5 h-5" />
        </button>
        <div className="w-[36px] h-[36px] rounded-full overflow-hidden bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] ml-2">
          <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}
