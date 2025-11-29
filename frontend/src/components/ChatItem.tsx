/**
 * ChatItem Component
 * 
 * 기능: 개별 채팅 아이템 표시
 * 위치: 사이드바 채팅 섹션 내부
 * 
 * 주요 기능:
 * - 채팅 제목 및 미리보기 텍스트 표시
 * - 채팅 클릭 시 해당 채팅으로 이동
 * - 선택된 채팅 강조 표시
 * 
 * 데이터 구조:
 * - Chat: { id, title, preview, timestamp, teamId, lastUpdated }
 */

import { MessageSquare } from 'lucide-react';

interface Chat {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  teamId: string | null;
  lastUpdated: number;
}

interface ChatItemProps {
  /** 채팅 정보 */
  chat: Chat;
  /** 선택 여부 */
  isSelected: boolean;
  /** 채팅 클릭 시 호출되는 콜백 */
  onClick: (chatId: string, teamId: string | null) => void;
}

export function ChatItem({ 
  chat, 
  isSelected, 
  onClick 
}: ChatItemProps) {
  return (
    <button
      onClick={() => onClick(chat.id, chat.teamId)}
      className={`w-full text-left p-2 rounded-xl transition-all ${
        isSelected 
          ? 'bg-gradient-to-r from-[#E0F2FE] to-[#FAE8FF] border-l-4 border-[#0EA5E9]' 
          : 'hover:bg-[#f0f9ff]'
      }`}
      aria-label={`${chat.title} 채팅 선택`}
    >
      <div className="flex items-start gap-2">
        {/* 채팅 아이콘 */}
        <MessageSquare className={`w-4 h-4 mt-0.5 ${
          isSelected ? 'text-[#0EA5E9]' : 'text-[#718096]'
        }`} />
        
        <div className="flex-1 min-w-0">
          {/* 채팅 제목 */}
          <h3 className="text-[13px] font-semibold mb-0.5 truncate text-[#1b2559]">
            {chat.title}
          </h3>
          {/* 채팅 미리보기 */}
          <p className="text-[11px] text-[#718096] truncate">
            {chat.preview}
          </p>
        </div>
      </div>
    </button>
  );
}
