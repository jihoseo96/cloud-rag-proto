/**
 * MessageList Component
 * 
 * 메시지 목록을 표시하는 컴포넌트
 * - 사용자 메시지와 AI 응답 표시
 * - 출처(Citations) 표시
 * - Stale 경고 표시
 * - 표준 답변 등록 버튼
 */

import { useState, useRef, useEffect } from 'react';
import { Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { FileIcon, getFileExtensionColor } from './FileIcon';
import { Message } from '../types';
import { useApp } from '../contexts/AppContext';

interface MessageListProps {
  messages: Message[];
  onRequestStandardAnswer?: (message: Message) => void;
}

export function MessageList({ messages, onRequestStandardAnswer }: MessageListProps) {
  const { selectedTeam, userAvatar } = useApp();
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [clickedMessageId, setClickedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="max-w-4xl mx-auto py-8 px-8">
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
                    {message.role === 'assistant' && selectedTeam && clickedMessageId === message.id && onRequestStandardAnswer && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestStandardAnswer(message);
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
                    <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
