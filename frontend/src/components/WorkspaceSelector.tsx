/**
 * WorkspaceSelector Component
 * 
 * 기능: 사용자의 Workspace 선택 및 전환
 * 위치: 좌측 사이드바 최상단
 * 
 * 주요 기능:
 * - 현재 선택된 Workspace 표시 (Personal)
 * - Workspace 드롭다운 메뉴 (향후 멀티 워크스페이스 지원)
 * - 새 워크스페이스 생성 버튼 (준비중)
 * - 사이드바 토글 버튼 (선택적)
 * 
 * 데이터 구조:
 * - Workspace: { id, name, type: 'personal' | 'organization' }
 */

import { ChevronDown, Sparkles, Check, Plus, PanelLeftClose } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Badge } from './ui/badge';

interface Workspace {
  id: string;
  name: string;
  type: 'personal' | 'organization';
  createdAt: Date;
}

interface WorkspaceSelectorProps {
  /** 현재 선택된 Workspace */
  currentWorkspace: Workspace;
  /** 사용 가능한 전체 Workspace 목록 */
  workspaces: Workspace[];
  /** Workspace 선택 시 호출되는 콜백 */
  onWorkspaceChange: (workspaceId: string) => void;
  /** 사이드바 토글 버튼 표시 여부 */
  showToggle?: boolean;
  /** 사이드바 토글 콜백 */
  onToggleSidebar?: () => void;
}

export function WorkspaceSelector({ 
  currentWorkspace, 
  workspaces, 
  onWorkspaceChange,
  showToggle = true,
  onToggleSidebar
}: WorkspaceSelectorProps) {
  return (
    <div className="px-3 pt-3 pb-2">
      {/* Workspace 선택 드롭다운 버튼 */}
      <div className="flex items-center justify-between gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg hover:bg-[#f0f9ff] transition-colors group"
              aria-label="Workspace 선택"
            >
              {/* Workspace 로고 아이콘 */}
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              {/* Workspace 이름 표시 */}
              <p className="text-[12px] font-semibold text-[#1b2559]">
                {currentWorkspace.type === 'personal' ? 'Personal' : currentWorkspace.name}
              </p>
              {/* 드롭다운 화살표 아이콘 */}
              <ChevronDown className="w-3.5 h-3.5 text-[#718096] group-hover:text-[#0EA5E9] transition-colors" />
            </button>
          </DropdownMenuTrigger>

          {/* Workspace 선택 드롭다운 메뉴 */}
          <DropdownMenuContent align="start" className="w-64">
            {/* 섹션 헤더 */}
            <div className="px-2 py-1.5">
              <p className="text-[11px] font-semibold text-[#718096] uppercase px-2 mb-1">
                My Workspaces
              </p>
            </div>

            {/* 현재 Workspace 항목 (Personal) */}
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => onWorkspaceChange(currentWorkspace.id)}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-[#1b2559]">Personal</p>
                  <p className="text-[10px] text-[#718096]">개인 워크스페이스</p>
                </div>
                {/* 선택 상태 체크 아이콘 */}
                <Check className="w-4 h-4 text-[#0EA5E9]" />
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* 새 워크스페이스 생성 버튼 (준비중) */}
            <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
              <Plus className="w-4 h-4 mr-2" />
              <span className="text-[12px]">새 워크스페이스 생성</span>
              {/* 준비중 뱃지 */}
              <Badge className="ml-auto text-[9px] h-4 bg-[#E9EDF7] text-[#718096]">
                준비중
              </Badge>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 사이드바 토글 버튼 */}
        {showToggle && onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-md hover:bg-[#f0f9ff] transition-colors group"
            title="사이드바 닫기"
            aria-label="사이드바 닫기"
          >
            <PanelLeftClose className="w-4 h-4 text-[#718096] group-hover:text-[#0EA5E9] transition-colors" />
          </button>
        )}
      </div>
    </div>
  );
}