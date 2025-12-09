/**
 * ProjectWorkspacePage.tsx
 * Screen 2: Project Workspace (Requirements Matrix)
 * 테이블 헤더 + 카드형 행 (스크린샷 스타일)
 */

import { useState, useEffect } from 'react';
import { EnterpriseLayout } from '../components/EnterpriseLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  FileDown,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Clock,
  CheckCheck,
  FileText,
  Sparkles,
  Copy,
  X,
  Layers,
  UserPlus,
  Archive,
  Trash2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { projectApi } from '../api/project';
import { Project } from '../types';

type RequirementStatus = 'approved' | 'pending' | 'none';

type Requirement = {
  id: string;
  status: RequirementStatus;
  requirement: string;
  requirementFull: string;
  aiSuggestion: string;
  aiSuggestionFull: string;
  sources: Array<{ doc: string; page: number }>;
  score: number;
  pastProposals: Array<{ doc: string; location: string; fileType: string }>;
  userResponse?: string;
  answerCardBased?: boolean; // AnswerCard 기반 답변 여부
};

function ProjectWorkspacePage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showUnapprovedWarning, setShowUnapprovedWarning] = useState(false);
  const [showKnowledgeHubDialog, setShowKnowledgeHubDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [showCloseProjectDialog, setShowCloseProjectDialog] = useState(false);
  const [showDeleteProjectDialog, setShowDeleteProjectDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userResponse, setUserResponse] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    if (!projectId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const p = await projectApi.getProject(projectId);
        setProject(p);

        const reqs = await projectApi.getRequirements(projectId);
        // Map API response to UI Requirement type
        const mappedReqs: Requirement[] = reqs.map(r => ({
          id: r.id,
          status: (r.status || 'pending') as RequirementStatus,
          requirement: r.requirement,
          requirementFull: r.requirementFull,
          aiSuggestion: r.aiSuggestion,
          aiSuggestionFull: r.aiSuggestionFull,
          sources: r.sources.map((s: any) => ({
            doc: s.text_snippet || "Source",
            page: s.page || 1
          })),
          score: r.score,
          pastProposals: r.pastProposals.map((p: any) => ({
            doc: p.doc_id || "Past Proposal",
            location: "p.1",
            fileType: "pdf"
          })),
          answerCardBased: r.score > 0 // Heuristic
        }));
        setRequirements(mappedReqs);
      } catch (e) {
        console.error("Failed to fetch project data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const approvedCount = requirements.filter(r => r.status === 'approved').length;
  const totalCount = requirements.length;
  const allApproved = totalCount > 0 && approvedCount === totalCount;

  const handleApproveAll = async () => {
    // Optimistic update
    const previousReqs = [...requirements];
    setRequirements(prev => prev.map(req => ({
      ...req,
      status: req.status === 'none' ? 'none' : 'approved' as RequirementStatus
    })));

    try {
      // In real app, batch update API needed. For now, loop (inefficient but works for MVP)
      // Or just assume success for UI demo
      // await Promise.all(requirements.map(r => projectApi.updateRequirementStatus(r.id, 'approved')));
      setShowExportDialog(true);
    } catch (e) {
      console.error(e);
      setRequirements(previousReqs); // Revert on error
    }
  };

  const handleExport = (format: 'word' | 'excel') => {
    const unapprovedReqs = requirements.filter(r => r.status !== 'approved' && r.aiSuggestion);

    if (unapprovedReqs.length > 0) {
      setShowUnapprovedWarning(true);
    } else {
      window.open(`http://localhost:8000/projects/${projectId}/export?format=${format}`, '_blank');
      setShowExportDialog(false);
    }
  };

  const handleExportAnyway = (format: 'word' | 'excel') => {
    window.open(`http://localhost:8000/projects/${projectId}/export?format=${format}`, '_blank');
    setShowUnapprovedWarning(false);
    setShowExportDialog(false);
  };

  const handleSelectRequirement = (req: Requirement) => {
    setSelectedRequirement(req);
    setUserResponse(req.userResponse || '');
    setIsEditing(false);
  };

  const handleCopyAIResponse = () => {
    if (selectedRequirement) {
      setUserResponse(selectedRequirement.aiSuggestionFull);
      setIsEditing(true);
    }
  };

  const handleSaveUserResponse = async () => {
    if (selectedRequirement) {
      const hasChanges = userResponse !== selectedRequirement.aiSuggestionFull;

      try {
        await projectApi.updateRequirementResponse(selectedRequirement.id, userResponse);

        setRequirements(prev => prev.map(req =>
          req.id === selectedRequirement.id
            ? { ...req, userResponse: userResponse }
            : req
        ));
        setSelectedRequirement(prev => prev ? { ...prev, userResponse: userResponse } : null);
        setIsEditing(false);

        // Show Knowledge Hub dialog if changes were made
        if (hasChanges) {
          setShowKnowledgeHubDialog(true);
        }
      } catch (e) {
        console.error("Failed to save response", e);
      }
    }
  };

  const handleApproveRequirement = async (reqId: string) => {
    const req = requirements.find(r => r.id === reqId);
    if (!req) return;

    const newStatus = req.status === 'approved' ? 'pending' : 'approved';

    try {
      await projectApi.updateRequirementStatus(reqId, newStatus);

      setRequirements(prev => prev.map(r => {
        if (r.id === reqId) {
          return { ...r, status: newStatus as RequirementStatus };
        }
        return r;
      }));

      if (selectedRequirement?.id === reqId) {
        setSelectedRequirement(prev => prev ? {
          ...prev,
          status: newStatus as RequirementStatus
        } : null);
      }
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const handleAddMember = async () => {
    if (!projectId || !inviteEmail) return;
    try {
      await projectApi.addProjectMember(projectId, inviteEmail);
      setShowAddMemberDialog(false);
      setInviteEmail('');
      alert(`Invited ${inviteEmail}`);
    } catch (e) {
      console.error("Failed to invite member", e);
    }
  };

  const handleCloseProject = async () => {
    if (!projectId) return;
    try {
      await projectApi.updateProjectStatus(projectId, 'completed');
      setShowCloseProjectDialog(false);
      navigate('/');
    } catch (e) {
      console.error("Failed to close project", e);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectId) return;
    try {
      await projectApi.deleteProject(projectId);
      setShowDeleteProjectDialog(false);
      // Force reload to update sidebar or navigate to home
      window.location.href = '/';
    } catch (e) {
      console.error("Failed to delete project", e);
    }
  };

  const getStatusBadge = (status: RequirementStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-[#0E7A4E]/10 text-[#0E7A4E] border-[#0E7A4E]/30 text-[0.6875rem]">승인됨</Badge>;
      case 'pending':
        return <Badge className="bg-[#EFB81A]/10 text-[#EFB81A] border-[#EFB81A]/30 text-[0.6875rem]">검토중</Badge>;
      case 'none':
        return <Badge variant="outline" className="bg-[#9AA0A6]/10 text-[#424242] border-[#E0E0E0] text-[0.6875rem]">미답변</Badge>;
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'pdf') {
      return <FileText className="h-3.5 w-3.5 text-[#D0362D]" />;
    } else if (fileType === 'docx' || fileType === 'doc') {
      return <FileText className="h-3.5 w-3.5 text-[#0B57D0]" />;
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      return <FileSpreadsheet className="h-3.5 w-3.5 text-[#0E7A4E]" />;
    }
    return <FileText className="h-3.5 w-3.5 text-[#9AA0A6]" />;
  };

  const hasChanges = selectedRequirement && selectedRequirement.userResponse &&
    selectedRequirement.userResponse !== selectedRequirement.aiSuggestionFull;

  if (loading) {
    return (
      <EnterpriseLayout projectId={projectId}>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B57D0] mx-auto mb-4"></div>
            <p className="text-[#9AA0A6]">프로젝트 데이터를 불러오는 중...</p>
          </div>
        </div>
      </EnterpriseLayout>
    );
  }

  return (
    <EnterpriseLayout projectId={projectId}>
      <div className="h-full flex bg-white">

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Project Header */}
          <div className="border-b border-[#E0E0E0] bg-white">
            <div className="max-w-full p-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-[1.5rem] font-semibold text-[#1F1F1F]">
                  {project?.name || 'Loading...'}
                </h1>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[#D0362D] hover:text-[#D0362D] hover:bg-[#D0362D]/10 border-[#D0362D]/20"
                    onClick={() => setShowDeleteProjectDialog(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    프로젝트 삭제
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddMemberDialog(true)}
                  >
                    <UserPlus className="h-4 w-4" />
                    멤버 추가
                  </Button>
                  {project?.status !== 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCloseProjectDialog(true)}
                    >
                      <Archive className="h-4 w-4" />
                      프로젝트 완료
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 text-[0.8125rem] mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#9AA0A6]" />
                  <span className="text-[#9AA0A6]">제출 마감:</span>
                  <span className="font-medium text-[#1F1F1F]">
                    {project?.deadline ? new Date(project.deadline).toLocaleDateString() : '미정'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#9AA0A6]" />
                  <span className="text-[#9AA0A6]">
                    {project?.deadline ? `D-${Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}` : '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#0E7A4E]" />
                  <span className="text-[#9AA0A6]">진행률:</span>
                  <span className="font-semibold text-[#0E7A4E]">{approvedCount}/{totalCount} 승인</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[0.875rem] font-semibold text-[#0B57D0] mono min-w-[48px]">
                  {totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0}%
                </span>
                <div className="flex-1">
                  <Progress value={totalCount > 0 ? (approvedCount / totalCount) * 100 : 0} className="h-2" />
                </div>
              </div>
            </div>

            {/* RFP Summary Section */}
            <div className="border-t border-[#E0E0E0] bg-[#F7F7F8] p-6">
              <div className="text-[0.75rem] text-[#9AA0A6] uppercase tracking-wider mb-2 font-semibold">
                제안 요약
              </div>
              <p className="text-[0.875rem] text-[#424242] leading-relaxed">
                {project?.description || '요약 정보가 없습니다.'}
              </p>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="border-b border-[#E0E0E0] bg-[#F7F7F8] px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="text-[0.875rem] text-[#424242]">
                {totalCount}개 요구사항 · {approvedCount}개 승인됨
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleApproveAll}
                  disabled={allApproved}
                >
                  <CheckCheck className="h-4 w-4" />
                  전체 승인
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('excel')}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleExport('word')}
                >
                  <FileDown className="h-4 w-4" />
                  Word
                </Button>
              </div>
            </div>
          </div>

          {/* Table Header + Card Rows */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-full">

              {/* Table Header */}
              <div className="grid grid-cols-[2fr_2.5fr_1fr_1.5fr_1.5fr_0.8fr] gap-4 px-4 py-3 bg-[#F7F7F8] border border-[#E0E0E0] rounded-t-lg text-[0.75rem] text-[#424242] uppercase tracking-wider font-semibold">
                <div>Requirement</div>
                <div>Response</div>
                <div>Trust</div>
                <div>Sources</div>
                <div>Past Uses</div>
                <div className="text-center">Actions</div>
              </div>

              {/* Card Rows */}
              <div className="space-y-3 mt-3">
                {requirements.map((req) => (
                  <div
                    key={req.id}
                    className={`
                      border rounded-lg p-4 transition-all cursor-pointer
                      ${req.status === 'approved'
                        ? 'bg-[#0E7A4E]/5 border-[#0E7A4E]/30'
                        : 'bg-white border-[#E0E0E0] hover:border-[#0B57D0] hover:shadow-sm'
                      }
                    `}
                    onClick={() => handleSelectRequirement(req)}
                  >
                    <div className="grid grid-cols-[2fr_2.5fr_1fr_1.5fr_1.5fr_0.8fr] gap-4 items-start">

                      {/* Requirement */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusBadge(req.status)}
                        </div>
                        <div className="text-[0.8125rem] font-medium text-[#1F1F1F] mb-1">
                          {req.requirement}
                        </div>
                        <p className="text-[0.75rem] text-[#9AA0A6] line-clamp-2">
                          {req.requirementFull}
                        </p>
                      </div>

                      {/* Response */}
                      <div>
                        {req.aiSuggestion ? (
                          <div className="text-[0.8125rem] text-[#424242] line-clamp-3">
                            {req.userResponse || req.aiSuggestionFull}
                          </div>
                        ) : (
                          <div className="text-[0.8125rem] text-[#9AA0A6] italic">
                            답변 없음
                          </div>
                        )}
                      </div>

                      {/* Trust */}
                      <div>
                        {req.score > 0 && (
                          <div className="flex items-center gap-2">
                            <div
                              className={`
                                h-10 w-10 rounded-full flex items-center justify-center font-semibold text-[0.875rem]
                                ${req.score >= 90
                                  ? 'bg-[#0E7A4E]/10 text-[#0E7A4E]'
                                  : req.score >= 70
                                    ? 'bg-[#0B57D0]/10 text-[#0B57D0]'
                                    : 'bg-[#EFB81A]/10 text-[#EFB81A]'
                                }
                              `}
                            >
                              {req.answerCardBased ? (
                                <Layers className="h-4 w-4" />
                              ) : (
                                <span>{req.score}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Sources */}
                      <div>
                        {req.sources.length > 0 ? (
                          <div className="space-y-1">
                            {req.sources.map((source, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[0.75rem]">
                                <FileText className="h-3 w-3 text-[#0B57D0] flex-shrink-0" />
                                <span className="text-[#1F1F1F] truncate" title={source.doc}>
                                  {source.doc.length > 20 ? source.doc.substring(0, 20) + '...' : source.doc}
                                </span>
                                <span className="text-[#9AA0A6] flex-shrink-0">p.{source.page}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[0.75rem] text-[#9AA0A6]">-</span>
                        )}
                      </div>

                      {/* Past Uses */}
                      <div>
                        {req.pastProposals.length > 0 ? (
                          <div className="space-y-1">
                            {req.pastProposals.map((proposal, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[0.75rem]">
                                {getFileIcon(proposal.fileType)}
                                <span className="text-[#1F1F1F] truncate" title={proposal.doc}>
                                  {proposal.doc.length > 18 ? proposal.doc.substring(0, 18) + '...' : proposal.doc}
                                </span>
                                <span className="text-[#9AA0A6] flex-shrink-0">{proposal.location}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[0.75rem] text-[#9AA0A6]">-</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex justify-center">
                        <Button
                          variant={req.status === 'approved' ? 'default' : 'outline'}
                          size="sm"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleApproveRequirement(req.id);
                          }}
                          disabled={!req.aiSuggestion}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Panel - Requirement Detail */}
        {selectedRequirement && (
          <div className="w-[480px] border-l border-[#E0E0E0] bg-white flex flex-col">

            {/* Panel Header */}
            <div className="border-b border-[#E0E0E0] p-4 flex items-center justify-between">
              <h3 className="text-[0.9375rem] font-semibold text-[#1F1F1F]">
                Requirement Detail
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedRequirement(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-auto p-4 space-y-4">

              {/* Requirement */}
              <div>
                <div className="text-[0.75rem] text-[#9AA0A6] uppercase tracking-wider mb-2">
                  Requirement
                </div>
                <div className="text-[0.875rem] font-medium text-[#1F1F1F] mb-2">
                  {selectedRequirement.requirement}
                </div>
                <p className="text-[0.8125rem] text-[#424242] leading-relaxed">
                  {selectedRequirement.requirementFull}
                </p>
              </div>

              {/* AI Response */}
              {selectedRequirement.aiSuggestion && (
                <div className="border border-[#E0E0E0] rounded-lg overflow-hidden">
                  <div className="bg-[#F7F7F8] px-3 py-2 border-b border-[#E0E0E0] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-[#0B57D0]" />
                      <span className="text-[0.75rem] font-semibold text-[#1F1F1F]">
                        AI Response
                      </span>
                      <Badge className="bg-[#0E7A4E]/10 text-[#0E7A4E] border-[#0E7A4E]/30 text-[0.6875rem]">
                        {selectedRequirement.score}%
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyAIResponse}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="p-3">
                    <p className="text-[0.8125rem] text-[#1F1F1F] leading-relaxed">
                      {selectedRequirement.aiSuggestionFull}
                    </p>
                  </div>
                </div>
              )}

              {/* User Response */}
              <div className="border border-[#E0E0E0] rounded-lg overflow-hidden">
                <div className="bg-[#F7F7F8] px-3 py-2 border-b border-[#E0E0E0]">
                  <span className="text-[0.75rem] font-semibold text-[#1F1F1F]">
                    Your Response
                  </span>
                </div>
                <div className="p-3">
                  {isEditing ? (
                    <>
                      <Textarea
                        value={userResponse}
                        onChange={(e) => setUserResponse(e.target.value)}
                        className="min-h-[120px] text-[0.8125rem] mb-2"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(false)}
                        >
                          취소
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveUserResponse}
                        >
                          저장
                        </Button>
                      </div>
                    </>
                  ) : userResponse ? (
                    <>
                      <p className="text-[0.8125rem] text-[#1F1F1F] leading-relaxed mb-2">
                        {userResponse}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        수정
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-[0.8125rem] text-[#9AA0A6] mb-3">
                        답변이 없습니다
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyAIResponse}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        AI 답변 복사
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Changes List (if modified) */}
              {hasChanges && (
                <div className="border-t border-[#E0E0E0] pt-4">
                  <div className="text-[0.75rem] text-[#9AA0A6] uppercase tracking-wider mb-2">
                    변경 내역
                  </div>
                  <div className="bg-[#F7F7F8] rounded-lg p-3">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="h-5 w-5 rounded-full bg-[#0B57D0]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[0.6875rem] font-semibold text-[#0B57D0]">1</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-[0.75rem] font-medium text-[#1F1F1F] mb-1">
                          답변 수정
                        </div>
                        <div className="text-[0.75rem] text-[#424242]">
                          AI 생성 답변을 사용자가 수정함
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div className="border-t border-[#E0E0E0] p-4">
              <Button
                className="w-full"
                onClick={() => handleApproveRequirement(selectedRequirement.id)}
              >
                {selectedRequirement.status === 'approved' ? '승인 해제' : '승인하기'}
              </Button>
            </div>
          </div>
        )}

        {/* Export Dialog - All Approved */}
        {allApproved && !selectedRequirement && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white border border-[#0E7A4E] rounded-lg shadow-lg p-4 flex items-center gap-4">
              <CheckCircle2 className="h-6 w-6 text-[#0E7A4E]" />
              <div>
                <div className="text-[0.875rem] font-semibold text-[#1F1F1F]">
                  모든 요구사항이 승인되었습니다!
                </div>
                <div className="text-[0.75rem] text-[#9AA0A6]">
                  제안서를 내보낼 준비가 완료되었습니다
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('excel')}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleExport('word')}
                >
                  <FileDown className="h-4 w-4" />
                  Word
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Unapproved Warning Dialog */}
        <Dialog open={showUnapprovedWarning} onOpenChange={setShowUnapprovedWarning}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>승인되지 않은 답변이 있습니다</DialogTitle>
              <DialogDescription>
                {requirements.filter(r => r.status !== 'approved' && r.aiSuggestion).length}개의 요구사항이 아직 승인되지 않았습니다.
                그대로 내보내시겠습니까?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowUnapprovedWarning(false)}>
                취소
              </Button>
              <Button onClick={() => handleExportAnyway('word')}>
                그대로 내보내기
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Knowledge Hub Contribution Dialog */}
        <Dialog open={showKnowledgeHubDialog} onOpenChange={setShowKnowledgeHubDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#0B57D0]" />
                Knowledge Hub에 추가하시겠습니까?
              </DialogTitle>
              <DialogDescription>
                수정한 답변이 Knowledge Hub에 AnswerCard로 저장되어 향후 유사 요구사항에 활용됩니다.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-[#F7F7F8] rounded-lg p-3 mb-4">
                <div className="text-[0.75rem] text-[#9AA0A6] uppercase tracking-wider mb-1">변경 내역</div>
                <div className="text-[0.8125rem] text-[#1F1F1F]">
                  • AI 생성 답변을 사용자가 수정함
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowKnowledgeHubDialog(false)}>
                건너뛰기
              </Button>
              <Button onClick={() => {
                console.log('Adding to Knowledge Hub');
                setShowKnowledgeHubDialog(false);
              }}>
                Knowledge Hub에 추가
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Member Dialog */}
        <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-[#0B57D0]" />
                프로젝트 멤버 추가
              </DialogTitle>
              <DialogDescription>
                이 프로젝트에 협업할 팀원을 초대하세요.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <input
                type="email"
                placeholder="이메일 주소 입력"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-[#0B57D0]"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddMemberDialog(false)}>
                취소
              </Button>
              <Button onClick={handleAddMember}>
                초대하기
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Close Project Dialog */}
        <Dialog open={showCloseProjectDialog} onOpenChange={setShowCloseProjectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-[#9AA0A6]" />
                프로젝트 완료 처리
              </DialogTitle>
              <DialogDescription>
                이 프로젝트를 완료 처리하시겠습니까? 완료된 프로젝트는 좌측 사이드바의 "완료된 프로젝트" 폴더로 이동됩니다.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-[#F7F7F8] rounded-lg p-3">
                <div className="text-[0.75rem] text-[#9AA0A6] mb-2">현재 진행 상황</div>
                <div className="text-[0.8125rem] text-[#1F1F1F]">
                  • 승인된 요구사항: {approvedCount}/{totalCount}<br />
                  • 진행률: {totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0}%
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCloseProjectDialog(false)}>
                취소
              </Button>
              <Button onClick={handleCloseProject}>
                프로젝트 완료
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Project Dialog */}
        <Dialog open={showDeleteProjectDialog} onOpenChange={setShowDeleteProjectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-[#D0362D]" />
                프로젝트 삭제
              </DialogTitle>
              <DialogDescription>
                이 작업은 되돌릴 수 없습니다. 프로젝트와 관련된 모든 데이터가 영구적으로 삭제됩니다.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="bg-[#FCE8E6] border border-[#D0362D]/30 rounded-lg p-3">
                <div className="text-[0.75rem] text-[#D0362D] mb-2 font-semibold">
                  삭제할 프로젝트
                </div>
                <div className="text-[0.875rem] text-[#1F1F1F] font-medium">
                  {project?.name}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteProjectDialog(false)}
              >
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteProject}
              >
                영구 삭제
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </EnterpriseLayout>
  );
}

export default ProjectWorkspacePage;