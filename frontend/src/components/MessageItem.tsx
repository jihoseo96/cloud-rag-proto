/**
 * MessageItem Component
 * 
 * 기능: 개별 메시지 표시 (사용자 메시지 / AI 응답)
 * 위치: 메시지 리스트 내부
 * 
 * 주요 기능:
 * - 사용자 메시지 표시 (우측 정렬, 그라데이션 배경)
 * - AI 응답 메시지 표시 (좌측 정렬, 회색 배경)
 * - AI 응답에 문서 출처(citation) 표시
 * - Stale 문서 경고 표시
 * - 팀 채팅에서 표준 답변 등록 버튼 표시
 * 
 * 데이터 구조:
 * - Message: { id, role, content, timestamp, citations[], isStale }
 * - Citation: { fileName, fileExtension, isStale }
 */

import { Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { FileIcon, getFileExtensionColor } from './FileIcon';
import { Badge } from './ui/badge';

interface Citation {
  fileName: string;
  fileExtension: string;
  isStale?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Citation[];
  isStale?: boolean;
}

interface MessageItemProps {
  /** 메시지 정보 */
  message: Message;
  /** 사용자 아바타 이미지 URL */
  userAvatar: string;
  /** 팀 채팅 여부 (표준 답변 등록 버튼 표시용) */
  isTeamChat: boolean;
  /** 마우스 호버 여부 */
  isHovered: boolean;
  /** 클릭 상태 (표준 답변 등록 버튼 표시용) */
  isClicked: boolean;
  /** 마우스 진입 시 호출되는 콜백 */
  onMouseEnter: () => void;
  /** 마우스 이탈 시 호출되는 콜백 */
  onMouseLeave: () => void;
  /** 클릭 시 호출되는 콜백 */
  onClick: () => void;
  /** 표준 답변 등록 버튼 클릭 시 호출되는 콜백 */
  onRequestStandardAnswer: () => void;
}

export function MessageItem({
  message,
  userAvatar,
  isTeamChat,
  isHovered,
  isClicked,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onRequestStandardAnswer
}: MessageItemProps) {
  return (
    <div
      className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {/* AI 메시지: 좌측에 AI 아바타 */}
      {message.role === 'assistant' && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
      )}

      <div className={`max-w-[70%] ${message.role === 'user' ? 'order-1' : ''} relative`}>
        {/* Stale 문서 경고 (AI 메시지에만 표시) */}
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
        
        {/* 메시지 본문 */}
        <div 
          className={`p-4 rounded-2xl relative cursor-pointer transition-all ${
            message.role === 'user' 
              ? 'bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] text-white ml-auto' 
              : `bg-[#F4F7FE] text-[#1b2559] ${
                  isTeamChat && isHovered 
                    ? 'ring-2 ring-[#0EA5E9]/30' 
                    : ''
                }`
          }`}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={onClick}
        >
          {/* 메시지 내용 */}
          <p className="text-[14px] leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
          
          {/* 문서 출처(Citation) 표시 - AI 메시지 우측 하단 */}
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
                  {/* 파일 아이콘 */}
                  <FileIcon 
                    extension={citation.fileExtension} 
                    className={`w-3 h-3 ${getFileExtensionColor(citation.fileExtension)}`} 
                  />
                  {/* 파일 이름 */}
                  <span className="text-[#718096] max-w-[100px] truncate">
                    {citation.fileName.length > 20 
                      ? citation.fileName.substring(0, 17) + '...' 
                      : citation.fileName}
                  </span>
                  {/* Stale 뱃지 */}
                  {citation.isStale && (
                    <Badge className="h-3 px-1 text-[8px] bg-amber-100 text-amber-700 border-none">
                      STALE
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* 표준 답변 등록 버튼 - 팀 채팅의 AI 응답에만 표시 */}
          {message.role === 'assistant' && isTeamChat && isClicked && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRequestStandardAnswer();
              }}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-[#E0F2FE] transition-colors border-2 border-[#0EA5E9] z-10"
              title="팀 표준 답변으로 등록"
            >
              <CheckCircle className="w-5 h-5 text-[#0EA5E9]" />
            </button>
          )}
        </div>

        {/* 메시지 타임스탬프 */}
        <p className={`text-[11px] text-[#718096] mt-2 ${message.role === 'user' ? 'text-right' : ''}`}>
          {message.timestamp}
        </p>
      </div>

      {/* 사용자 메시지: 우측에 사용자 아바타 */}
      {message.role === 'user' && (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] flex-shrink-0">
          <img 
            src={userAvatar} 
            alt="사용자 프로필" 
            className="w-full h-full object-cover" 
          />
        </div>
      )}
    </div>
  );
}
