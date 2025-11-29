/**
 * ChatInput Component
 * 
 * 메시지 입력 영역
 * - AI 모델 선택
 * - Group Instructions 선택 (팀 채팅인 경우)
 * - 파일 업로드
 * - 메시지 입력 및 전송
 */

import { useState, useRef } from 'react';
import { Paperclip, Send, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ModelSelector } from './ModelSelector';
import { GroupInstructionsDialog } from './GroupInstructionsDialog';
import { useApp } from '../contexts/AppContext';
import { GroupInstruction } from '../types';

export function ChatInput() {
  const {
    teams,
    prompts,
    selectedTeam,
    selectedModel,
    setSelectedModel,
    handleSendMessage,
  } = useApp();

  const [inputValue, setInputValue] = useState('');
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<GroupInstruction | null>(null);
  const [isPromptSelectorOpen, setIsPromptSelectorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const onSendMessage = () => {
    if (!inputValue.trim()) return;
    handleSendMessage(inputValue);
    setInputValue('');
  };

  return (
    <>
      {/* AI Model Selector & Prompt Selector */}
      <div className="px-8 py-2 border-t border-[#E9EDF7]">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <ModelSelector
            selectedModel={selectedModel}
            onModelSelect={setSelectedModel}
            isModelSelectorOpen={isModelSelectorOpen}
            onModelSelectorToggle={setIsModelSelectorOpen}
          />
          
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
      <GroupInstructionsDialog
        open={isPromptSelectorOpen}
        onOpenChange={setIsPromptSelectorOpen}
        selectedTeam={selectedTeam}
        teams={teams}
        prompts={prompts}
        selectedPrompt={selectedPrompt}
        onPromptSelect={setSelectedPrompt}
      />

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
                    onSendMessage();
                  }
                }}
                placeholder="메시지를 입력하세요..."
                className="resize-none border-[#E9EDF7] rounded-[24px] px-6 py-4 min-h-[54px] max-h-[200px] text-[14px]"
                rows={1}
              />
            </div>
            <Button
              onClick={onSendMessage}
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
    </>
  );
}
