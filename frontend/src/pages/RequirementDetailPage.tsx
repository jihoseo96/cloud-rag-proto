/**
 * RequirementDetailPage.tsx
 * Requirement 상세 페이지 - AI 답변 수정 및 Knowledge Hub 기여
 */

import { useState } from 'react';
import { EnterpriseLayout } from '../components/EnterpriseLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { 
  ArrowLeft,
  Copy,
  Save,
  CheckCircle2,
  FileText,
  ExternalLink,
  Sparkles,
  Edit3,
  Plus
} from 'lucide-react';

function RequirementDetailPage() {
  const { projectId, requirementId } = useParams();
  const navigate = useNavigate();

  // Mock Data
  const requirement = {
    id: requirementId,
    title: '보안 인증: ISO 27001 인증 보유 여부',
    full: '제안사는 정보보안 관련 국제 표준 인증인 ISO/IEC 27001을 보유하고 있어야 하며, 유효기간 내의 인증서를 제출해야 합니다.',
    aiResponse: '당사는 ISO/IEC 27001:2022 인증을 보유하고 있으며, 2025년 12월 31일까지 유효합니다. BSI Group으로부터 인증받았으며, 매년 갱신 심사를 통과하고 있습니다.',
    sources: [
      { doc: '제안서_보안정책_v2.pdf', page: 45 },
      { doc: '인증서_ISO27001.pdf', page: 1 }
    ],
    pastProposals: [
      { doc: '2023_국방RFP.pdf', location: 'p.12', fileType: 'pdf' },
      { doc: '2024_금융공공_제안서.docx', location: 'p.8', fileType: 'docx' }
    ]
  };

  const [isEditing, setIsEditing] = useState(false);
  const [userResponse, setUserResponse] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [showContributeSuccess, setShowContributeSuccess] = useState(false);

  const handleCopyAIResponse = () => {
    setUserResponse(requirement.aiResponse);
    setIsEditing(true);
  };

  const handleSave = () => {
    setHasChanges(true);
    setIsEditing(false);
  };

  const handleContributeToKnowledgeHub = () => {
    // Logic to add to Knowledge Hub
    setShowContributeSuccess(true);
    setTimeout(() => {
      setShowContributeSuccess(false);
    }, 3000);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'pdf') {
      return <FileText className="h-4 w-4 text-[#D0362D]" />;
    } else if (fileType === 'docx' || fileType === 'doc') {
      return <FileText className="h-4 w-4 text-[#0B57D0]" />;
    }
    return <FileText className="h-4 w-4 text-[#9AA0A6]" />;
  };

  return (
    <EnterpriseLayout projectId={projectId}>
      <div className="h-full flex flex-col bg-white">
        
        {/* Header */}
        <div className="border-b border-[#E0E0E0] bg-white px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/project/${projectId}/workspace`)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              요구사항 목록으로
            </Button>
            <h1 className="text-[1.25rem] font-semibold text-[#1F1F1F] mb-2">
              {requirement.title}
            </h1>
            <p className="text-[0.875rem] text-[#424242] leading-relaxed">
              {requirement.full}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* AI Response Section */}
            <div className="border border-[#E0E0E0] rounded-lg overflow-hidden">
              <div className="bg-[#F7F7F8] px-5 py-3 border-b border-[#E0E0E0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#0B57D0]" />
                  <span className="text-[0.875rem] font-semibold text-[#1F1F1F]">
                    AI Generated Response
                  </span>
                  <Badge className="bg-[#0E7A4E]/10 text-[#0E7A4E] border-[#0E7A4E]/30 text-[0.6875rem]">
                    95% Match
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAIResponse}
                >
                  <Copy className="h-4 w-4" />
                  복사하여 수정
                </Button>
              </div>
              <div className="p-5">
                <p className="text-[0.875rem] text-[#1F1F1F] leading-relaxed whitespace-pre-wrap">
                  {requirement.aiResponse}
                </p>
              </div>
            </div>

            {/* User Edit Section */}
            <div className="border border-[#E0E0E0] rounded-lg overflow-hidden">
              <div className="bg-[#F7F7F8] px-5 py-3 border-b border-[#E0E0E0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-[#0B57D0]" />
                  <span className="text-[0.875rem] font-semibold text-[#1F1F1F]">
                    Your Response
                  </span>
                  {hasChanges && (
                    <Badge className="bg-[#EFB81A]/10 text-[#EFB81A] border-[#EFB81A]/30 text-[0.6875rem]">
                      Modified
                    </Badge>
                  )}
                </div>
                {!isEditing && !userResponse && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Plus className="h-4 w-4" />
                    작성하기
                  </Button>
                )}
              </div>
              <div className="p-5">
                {isEditing ? (
                  <>
                    <Textarea
                      value={userResponse}
                      onChange={(e) => setUserResponse(e.target.value)}
                      placeholder="AI 답변을 복사하여 수정하거나, 직접 작성하세요..."
                      className="min-h-[200px] text-[0.875rem] mb-3"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false);
                          if (!hasChanges) setUserResponse('');
                        }}
                      >
                        취소
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={!userResponse.trim()}
                      >
                        <Save className="h-4 w-4" />
                        저장
                      </Button>
                    </div>
                  </>
                ) : userResponse ? (
                  <>
                    <p className="text-[0.875rem] text-[#1F1F1F] leading-relaxed whitespace-pre-wrap mb-3">
                      {userResponse}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="h-4 w-4" />
                      수정
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[0.875rem] text-[#9AA0A6] mb-4">
                      아직 작성된 답변이 없습니다
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyAIResponse}
                    >
                      <Copy className="h-4 w-4" />
                      AI 답변 복사하여 시작
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Sources */}
            <div className="border border-[#E0E0E0] rounded-lg overflow-hidden">
              <div className="bg-[#F7F7F8] px-5 py-3 border-b border-[#E0E0E0]">
                <span className="text-[0.875rem] font-semibold text-[#1F1F1F]">
                  Source Documents
                </span>
              </div>
              <div className="p-5 space-y-2">
                {requirement.sources.map((source, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border border-[#E0E0E0] rounded-lg hover:bg-[#F7F7F8] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-[#0B57D0]" />
                      <div>
                        <div className="text-[0.8125rem] font-medium text-[#1F1F1F]">
                          {source.doc}
                        </div>
                        <div className="text-[0.75rem] text-[#9AA0A6]">
                          Page {source.page}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Proposals */}
            {requirement.pastProposals.length > 0 && (
              <div className="border border-[#E0E0E0] rounded-lg overflow-hidden">
                <div className="bg-[#F7F7F8] px-5 py-3 border-b border-[#E0E0E0]">
                  <span className="text-[0.875rem] font-semibold text-[#1F1F1F]">
                    Past Proposals
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  {requirement.pastProposals.map((proposal, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border border-[#E0E0E0] rounded-lg hover:bg-[#F7F7F8] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {getFileIcon(proposal.fileType)}
                        <div>
                          <div className="text-[0.8125rem] font-medium text-[#1F1F1F]">
                            {proposal.doc}
                          </div>
                          <div className="text-[0.75rem] text-[#9AA0A6]">
                            {proposal.location}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contribute to Knowledge Hub */}
            {hasChanges && (
              <div className="border-2 border-dashed border-[#0B57D0] rounded-lg p-5 bg-[#0B57D0]/5">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-[#0B57D0]/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-[#0B57D0]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[0.9375rem] font-semibold text-[#1F1F1F] mb-2">
                      변경사항을 Knowledge Hub에 추가하시겠습니까?
                    </h3>
                    <p className="text-[0.8125rem] text-[#424242] mb-4">
                      수정한 답변을 Knowledge Hub에 추가하면, 향후 유사한 요구사항에 자동으로 활용됩니다.
                      시스템이 지속적으로 학습하고 진화합니다.
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={handleContributeToKnowledgeHub}
                      >
                        <Plus className="h-4 w-4" />
                        Knowledge Hub에 추가
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        나중에
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {showContributeSuccess && (
              <div className="border border-[#0E7A4E] rounded-lg p-4 bg-[#0E7A4E]/5 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#0E7A4E]" />
                <div>
                  <div className="text-[0.875rem] font-semibold text-[#0E7A4E]">
                    Knowledge Hub에 추가되었습니다!
                  </div>
                  <div className="text-[0.75rem] text-[#424242]">
                    향후 프로젝트에서 자동으로 활용됩니다.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </EnterpriseLayout>
  );
}

export default RequirementDetailPage;
