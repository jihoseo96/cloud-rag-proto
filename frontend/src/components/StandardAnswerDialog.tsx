/**
 * StandardAnswerDialog Component
 * 
 * 기능: 팀 표준 답변 등록 요청 다이얼로그
 * 위치: AI 메시지의 체크 버튼 클릭 시 표시
 * 
 * 주요 기능:
 * - 선택된 AI 답변 미리보기
 * - 표준 답변 등록 요청 확인
 * - 관리자 승인 안내 메시지
 * 
 * 데이터 흐름:
 * - AI 답변 → 표준 답변 요청 → 관리자 승인 대기
 * 
 * 관련 기능:
 * - TeamManagement의 Answer Card 관리에서 승인/거부
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface StandardAnswerDialogProps {
  /** 다이얼로그 열림 상태 */
  open: boolean;
  /** 다이얼로그 열림 상태 변경 함수 */
  onOpenChange: (open: boolean) => void;
  /** 선택된 AI 답변 메시지 */
  selectedAnswerForStandard: Message | null;
  /** 현재 팀 데이터 */
  selectedTeamData: { id: string; name: string; memberCount: number; workspaceId: string } | null;
  /** 등록 확인 시 호출되는 콜백 */
  onStandardAnswerRequest: () => void;
  /** 취소 시 호출되는 콜백 */
  onCancel: () => void;
}

export function StandardAnswerDialog({
  open,
  onOpenChange,
  selectedAnswerForStandard,
  selectedTeamData,
  onStandardAnswerRequest,
  onCancel
}: StandardAnswerDialogProps) {
  // 취소 핸들러
  const handleCancel = () => {
    onCancel();
  };

  // 확인 핸들러
  const handleConfirm = () => {
    onStandardAnswerRequest();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {/* 다이얼로그 헤더 */}
        <DialogHeader>
          <DialogTitle>팀 표준 답변 등록</DialogTitle>
          <DialogDescription>
            이 답변을 {selectedTeamData?.name || '팀'}의 표준 답변으로 등록 요청하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        
        {/* 답변 미리보기 */}
        <div className="py-4">
          <p className="text-[14px] text-[#718096] mb-2">답변 내용:</p>
          <div className="p-3 bg-[#F4F7FE] rounded-lg max-h-[200px] overflow-y-auto">
            <p className="text-[13px] text-[#1b2559] whitespace-pre-wrap">
              {selectedAnswerForStandard?.content}
            </p>
          </div>

          {/* 승인 안내 메시지 */}
          <p className="text-[12px] text-[#718096] mt-3">
            * 관리자 승인 후 팀 표준 답변으로 등록됩니다.
          </p>
        </div>

        {/* 다이얼로그 액션 버튼 */}
        <div className="flex justify-end gap-2">
          {/* 취소 버튼 */}
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            아니오
          </Button>

          {/* 확인 버튼 */}
          <Button
            className="bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] hover:opacity-90 text-white"
            onClick={handleConfirm}
          >
            예
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}