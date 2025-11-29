/**
 * GroupInstructionsDialog Component
 * 
 * 기능: 팀별 전문 프롬프트 선택 다이얼로그
 * 위치: 팀 채팅 시 AI 모델 선택기 옆에 버튼으로 표시
 * 
 * 주요 기능:
 * - 팀에 등록된 전문 프롬프트(Group Instructions) 목록 표시
 * - 프롬프트 선택 (마케팅 전문가, 코드 리뷰 전문가 등)
 * - 선택된 프롬프트 미리보기
 * - 프롬프트 선택 해제
 * 
 * 데이터 구조:
 * - GroupInstruction: { id, title, content, teamId, description }
 * 
 * 데이터 출처: 각 팀별로 등록된 프롬프트 목록
 */

import { FileText, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';

interface GroupInstruction {
  id: string;
  title: string;
  content: string;
  teamId: string;
  description?: string;
}

interface GroupInstructionsDialogProps {
  /** 다이얼로그 열림 상태 */
  open: boolean;
  /** 다이얼로그 열림 상태 변경 함수 */
  onOpenChange: (open: boolean) => void;
  /** 현재 선택된 팀 ID */
  selectedTeam: string | null;
  /** 전체 팀 목록 */
  teams: { id: string; name: string; memberCount: number; workspaceId: string }[];
  /** 해당 팀의 프롬프트 목록 */
  prompts: GroupInstruction[];
  /** 현재 선택된 프롬프트 */
  selectedPrompt: GroupInstruction | null;
  /** 프롬프트 선택 시 호출되는 콜백 */
  onPromptSelect: (prompt: GroupInstruction) => void;
}

export function GroupInstructionsDialog({
  open,
  onOpenChange,
  selectedTeam,
  teams,
  prompts,
  selectedPrompt,
  onPromptSelect
}: GroupInstructionsDialogProps) {
  const teamName = teams.find(t => t.id === selectedTeam)?.name || '';
  const teamPrompts = prompts.filter(p => p.teamId === selectedTeam);
  
  const handleClearSelection = () => {
    onPromptSelect(null as any);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        {/* 다이얼로그 헤더 */}
        <DialogHeader>
          <DialogTitle>프롬프트 선택</DialogTitle>
          <DialogDescription>
            {teamName}의 등록된 프롬프트를 선택하세요
          </DialogDescription>
        </DialogHeader>
        
        {/* 프롬프트 목록 */}
        <ScrollArea className="max-h-[500px] pr-4">
          <div className="space-y-3">
            {teamPrompts.length > 0 ? (
              teamPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  onClick={() => {
                    onPromptSelect(prompt);
                    onOpenChange(false);
                  }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-[#0EA5E9] hover:bg-[#f0f9ff] ${
                    selectedPrompt?.id === prompt.id
                      ? 'border-[#0EA5E9] bg-gradient-to-r from-[#E0F2FE] to-[#FAE8FF]'
                      : 'border-[#E9EDF7]'
                  }`}
                >
                  {/* 프롬프트 헤더 (제목 + 체크 아이콘) */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#0EA5E9]" />
                      <h3 className="font-semibold text-[14px] text-[#1b2559]">
                        {prompt.title}
                      </h3>
                    </div>
                    {/* 선택된 프롬프트 표시 */}
                    {selectedPrompt?.id === prompt.id && (
                      <Check className="w-4 h-4 text-[#0EA5E9]" />
                    )}
                  </div>

                  {/* 프롬프트 설명 */}
                  {prompt.description && (
                    <p className="text-[12px] text-[#718096] mb-2">
                      {prompt.description}
                    </p>
                  )}

                  {/* 프롬프트 내용 미리보기 */}
                  <p className="text-[12px] text-[#718096] line-clamp-2 bg-white/50 p-2 rounded">
                    {prompt.content}
                  </p>
                </div>
              ))
            ) : (
              /* 프롬프트가 없을 때 */
              <div className="text-center py-8 text-[#718096]">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>이 팀에 등록된 프롬프트가 없습니다.</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* 다이얼로그 푸터 (선택 해제 + 닫기 버튼) */}
        <div className="flex justify-between items-center pt-4 border-t border-[#E9EDF7]">
          {/* 선택 해제 버튼 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSelection}
            className="text-[12px] text-[#718096]"
          >
            선택 해제
          </Button>

          {/* 닫기 버튼 */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-[12px]"
          >
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}