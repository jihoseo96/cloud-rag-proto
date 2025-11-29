/**
 * ModelSelector Component
 * 
 * 기능: AI 모델 선택기
 * 위치: 메시지 입력창 상단
 * 
 * 주요 기능:
 * - 현재 선택된 AI 모델 표시
 * - 클릭 시 사용 가능한 AI 모델 목록 표시
 * - AI 모델 선택 (ChatGPT-5, Sonar, Gemini, Claude 등)
 * 
 * 데이터 출처: 시스템에서 지원하는 AI 모델 목록
 */

import { Check } from 'lucide-react';
import { Button } from './ui/button';

interface ModelSelectorProps {
  /** 현재 선택된 AI 모델 */
  selectedModel: string;
  /** 모델 선택 시 호출되는 콜백 */
  onModelSelect: (model: string) => void;
  /** 모델 선택기 열림 상태 */
  isModelSelectorOpen: boolean;
  /** 모델 선택기 토글 함수 */
  onModelSelectorToggle: () => void;
}

const availableModels = ['ChatGPT-5', 'Sonar', 'Gemini', 'Claude Sonnet', 'Claude Opus'];

export function ModelSelector({
  selectedModel,
  onModelSelect,
  isModelSelectorOpen,
  onModelSelectorToggle
}: ModelSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      {/* 선택된 모델 표시 버튼 */}
      <Button
        variant="outline"
        size="sm"
        onClick={onModelSelectorToggle}
        className="text-[12px] h-7 border-[#E9EDF7] text-[#718096] hover:text-[#0EA5E9] hover:border-[#0EA5E9]"
        aria-label="AI 모델 선택"
      >
        {selectedModel}
      </Button>
      
      {/* AI 모델 목록 (열림 상태일 때만 표시) */}
      {isModelSelectorOpen && (
        <div className="flex items-center gap-2 animate-in slide-in-from-left">
          {availableModels.map((model) => (
            <Button
              key={model}
              variant="ghost"
              size="sm"
              onClick={() => {
                onModelSelect(model);
              }}
              className={`text-[12px] h-7 ${
                selectedModel === model 
                  ? 'bg-gradient-to-r from-[#E0F2FE] to-[#FAE8FF] text-[#0EA5E9]' 
                  : 'text-[#718096] hover:text-[#0EA5E9]'
              }`}
              aria-label={`${model} 선택`}
            >
              {/* 선택된 모델에 체크 아이콘 표시 */}
              {selectedModel === model && <Check className="w-3 h-3 mr-1" />}
              {model}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}