/**
 * TeamItem Component
 * 
 * 기능: 개별 팀 아이템 표시 및 팀 관리
 * 위치: 사이드바 팀 섹션 내부
 * 
 * 주요 기능:
 * - 팀 이름 및 멤버 수 표시
 * - 팀 클릭 시 확장/축소 (팀 채팅 목록 표시)
 * - 팀 관리 메뉴 (팀 관리, 새 채팅, 팀 나가기)
 * - 팀 채팅 목록 표시 (확장 시)
 * 
 * 데이터 구조:
 * - Team: { id, name, memberCount, workspaceId }
 * - Chat: { id, title, preview, timestamp, teamId }
 */

import { Users, ChevronDown, ChevronRight, MessageSquare, MoreHorizontal, Settings, LogOut } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';

interface Team {
  id: string;
  name: string;
  memberCount: number;
  workspaceId: string;
}

interface Chat {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  teamId: string | null;
  lastUpdated: number;
}

interface TeamItemProps {
  /** 팀 정보 */
  team: Team;
  /** 해당 팀의 채팅 목록 */
  teamChats: Chat[];
  /** 팀 확장 여부 */
  isExpanded: boolean;
  /** 팀 선택 여부 */
  isSelected: boolean;
  /** 현재 선택된 채팅 ID */
  selectedChatId: string | null;
  /** 팀 클릭 시 호출되는 콜백 */
  onTeamClick: (teamId: string) => void;
  /** 채팅 클릭 시 호출되는 콜백 */
  onChatClick: (chatId: string, teamId: string) => void;
  /** 팀 관리 버튼 클릭 시 호출되는 콜백 */
  onManageTeam: (teamId: string) => void;
  /** 새 채팅 생성 시 호출되는 콜백 */
  onCreateChat: (teamId: string) => void;
  /** 팀 나가기 시 호출되는 콜백 */
  onLeaveTeam: (teamId: string) => void;
}

export function TeamItem({
  team,
  teamChats,
  isExpanded,
  isSelected,
  selectedChatId,
  onTeamClick,
  onChatClick,
  onManageTeam,
  onCreateChat,
  onLeaveTeam
}: TeamItemProps) {
  return (
    <div>
      {/* 팀 헤더 영역 */}
      <div className="flex items-center gap-1">
        {/* 팀 메인 버튼 */}
        <button
          onClick={() => onTeamClick(team.id)}
          className={`flex-1 text-left p-2 rounded-xl transition-all ${
            isSelected 
              ? 'bg-gradient-to-r from-[#E0F2FE] to-[#FAE8FF] border-l-4 border-[#0EA5E9]' 
              : 'hover:bg-[#f0f9ff]'
          }`}
          aria-label={`${team.name} 팀 선택`}
        >
          <div className="flex items-start gap-2">
            <div className="flex items-center gap-1">
              {/* 확장/축소 아이콘 */}
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-[#718096]" />
              ) : (
                <ChevronRight className="w-3 h-3 text-[#718096]" />
              )}
              {/* 팀 아이콘 */}
              <Users className={`w-4 h-4 ${isSelected ? 'text-[#0EA5E9]' : 'text-[#718096]'}`} />
            </div>
            <div className="flex-1 min-w-0">
              {/* 팀 이름 */}
              <h3 className="text-[13px] font-semibold mb-0.5 truncate text-[#1b2559]">
                {team.name}
              </h3>
              {/* 멤버 수 */}
              <p className="text-[11px] text-[#718096]">
                {team.memberCount}명의 멤버
              </p>
            </div>
          </div>
        </button>

        {/* 팀 관리 메뉴 드롭다운 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="h-8 w-8 rounded-md text-[#718096] hover:text-[#0EA5E9] hover:bg-[#f0f9ff] flex-shrink-0 inline-flex items-center justify-center transition-colors"
              onClick={(e) => e.stopPropagation()}
              aria-label="팀 관리 메뉴"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {/* 팀 관리 (문서, 설정 등) */}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onManageTeam(team.id);
              }}
              className="cursor-pointer"
            >
              <Settings className="w-4 h-4 mr-2" />
              팀 관리
            </DropdownMenuItem>

            {/* 새 채팅 생성 */}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onCreateChat(team.id);
              }}
              className="cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              새로운 채팅
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* 팀 나가기 */}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onLeaveTeam(team.id);
              }}
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              팀 나가기
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* 팀 채팅 목록 (확장 시에만 표시) */}
      {isExpanded && teamChats.length > 0 && (
        <div className="ml-6 mt-1 space-y-1">
          {teamChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onChatClick(chat.id, team.id)}
              className={`w-full text-left p-2 rounded-lg transition-all ${
                selectedChatId === chat.id 
                  ? 'bg-gradient-to-r from-[#E0F2FE] to-[#FAE8FF] border-l-4 border-[#0EA5E9]' 
                  : 'hover:bg-[#f0f9ff]'
              }`}
              aria-label={`${chat.title} 채팅 선택`}
            >
              <div className="flex items-start gap-2">
                {/* 채팅 아이콘 */}
                <MessageSquare className={`w-3.5 h-3.5 mt-0.5 ${
                  selectedChatId === chat.id ? 'text-[#0EA5E9]' : 'text-[#718096]'
                }`} />
                <div className="flex-1 min-w-0">
                  {/* 채팅 제목 */}
                  <h3 className="text-[12px] font-semibold mb-0.5 truncate text-[#1b2559]">
                    {chat.title}
                  </h3>
                  {/* 채팅 미리보기 */}
                  <p className="text-[10px] text-[#718096] truncate">
                    {chat.preview}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
