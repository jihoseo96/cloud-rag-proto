/**
 * KnowledgeHubPage.tsx
 * Screen 3: Knowledge Hub Manager (Asset Management)
 * Tabs: Answer Library + Source Documents
 */

import { useState } from 'react';
import { EnterpriseLayout } from '../components/EnterpriseLayout';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Search,
  Database,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  Trash2,
  RefreshCw,
  Filter
} from 'lucide-react';

type AnswerCard = {
  id: string;
  topic: string;
  summary: string;
  status: 'approved' | 'rejected' | 'candidate';
  approvedBy?: string;
  lastUsed?: Date;
  usageCount: number;
};

type SourceDocument = {
  id: string;
  fileName: string;
  uploadedAt: Date;
  parsingStatus: 'completed' | 'failed' | 'pending';
  fileSize: string;
};

function KnowledgeHubPage() {
  const [activeTab, setActiveTab] = useState<'answers' | 'documents'>('answers');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock Data - Answer Library
  const mockAnswers: AnswerCard[] = [
    {
      id: 'ans-1',
      topic: 'ISO 27001 인증 현황',
      summary: '당사는 ISO/IEC 27001:2022 인증을 보유하고 있으며, 2025년 12월 31일까지 유효합니다.',
      status: 'approved',
      approvedBy: 'john.doe@company.com',
      lastUsed: new Date('2024-11-28'),
      usageCount: 12
    },
    {
      id: 'ans-2',
      topic: '클라우드 운영 경험',
      summary: 'AWS 7년, Azure 5년의 운영 경험 보유. 주요 레퍼런스 포함.',
      status: 'approved',
      approvedBy: 'jane.smith@company.com',
      lastUsed: new Date('2024-11-25'),
      usageCount: 8
    },
    {
      id: 'ans-3',
      topic: 'AI/ML 자체 모델 개발',
      summary: '자체 LLM 개발 경험은 없으나, OpenAI GPT fine-tuning 프로젝트 수행 경험 있음.',
      status: 'candidate',
      usageCount: 0
    },
    {
      id: 'ans-4',
      topic: '데이터센터 Tier 인증',
      summary: '판교 자체 IDC는 Uptime Institute Tier 3+ 인증 보유.',
      status: 'approved',
      approvedBy: 'admin@company.com',
      lastUsed: new Date('2024-11-20'),
      usageCount: 15
    }
  ];

  // Mock Data - Source Documents
  const mockDocuments: SourceDocument[] = [
    {
      id: 'doc-1',
      fileName: '제안서_보안정책_v2.pdf',
      uploadedAt: new Date('2024-11-15'),
      parsingStatus: 'completed',
      fileSize: '2.3 MB'
    },
    {
      id: 'doc-2',
      fileName: '기술제안서_클라우드_v3.pdf',
      uploadedAt: new Date('2024-11-10'),
      parsingStatus: 'completed',
      fileSize: '5.1 MB'
    },
    {
      id: 'doc-3',
      fileName: '레퍼런스_사례.pdf',
      uploadedAt: new Date('2024-11-08'),
      parsingStatus: 'completed',
      fileSize: '1.8 MB'
    },
    {
      id: 'doc-4',
      fileName: '인증서_모음.pdf',
      uploadedAt: new Date('2024-11-01'),
      parsingStatus: 'pending',
      fileSize: '890 KB'
    }
  ];

  const [answers] = useState<AnswerCard[]>(mockAnswers);
  const [documents] = useState<SourceDocument[]>(mockDocuments);

  const getStatusBadge = (status: AnswerCard['status']) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-[#0E7A4E]/10 text-[#0E7A4E] border-[#0E7A4E]/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-[#D0362D]/10 text-[#D0362D] border-[#D0362D]/30">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'candidate':
        return (
          <Badge className="bg-[#9AA0A6]/10 text-[#424242] border-[#E0E0E0]">
            <Clock className="h-3 w-3 mr-1" />
            Candidate
          </Badge>
        );
    }
  };

  const getParsingStatusBadge = (status: SourceDocument['parsingStatus']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-[#0E7A4E]/10 text-[#0E7A4E] border-[#0E7A4E]/30">
            완료
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-[#D0362D]/10 text-[#D0362D] border-[#D0362D]/30">
            실패
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-[#EFB81A]/10 text-[#EFB81A] border-[#EFB81A]/30">
            대기중
          </Badge>
        );
    }
  };

  const filteredAnswers = answers.filter(ans => 
    ans.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ans.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDocuments = documents.filter(doc => 
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <EnterpriseLayout>
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="h-16 border-b border-[#E0E0E0] flex items-center justify-between px-6">
          <div>
            <h1 className="text-[1.125rem] font-semibold text-[#1F1F1F]">Knowledge Hub</h1>
            <p className="text-[0.75rem] text-[#9AA0A6] mt-0.5">
              답변 카드 및 원본 문서 관리
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="h-12 border-b border-[#E0E0E0] flex items-center px-6 gap-1">
          <button
            onClick={() => setActiveTab('answers')}
            className={`
              px-4 py-2 text-[0.875rem] font-medium rounded-lg transition-colors
              ${activeTab === 'answers'
                ? 'bg-[#D3E3FD] text-[#0B57D0]'
                : 'text-[#424242] hover:bg-[#F7F7F8]'
              }
            `}
          >
            <Database className="h-4 w-4 inline-block mr-2" />
            Answer Library
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`
              px-4 py-2 text-[0.875rem] font-medium rounded-lg transition-colors
              ${activeTab === 'documents'
                ? 'bg-[#D3E3FD] text-[#0B57D0]'
                : 'text-[#424242] hover:bg-[#F7F7F8]'
              }
            `}
          >
            <FileText className="h-4 w-4 inline-block mr-2" />
            Source Documents
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="h-16 border-b border-[#E0E0E0] flex items-center px-6 gap-3 bg-[#F7F7F8]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9AA0A6]" />
            <Input
              placeholder={activeTab === 'answers' ? '토픽, 키워드로 검색' : '파일명으로 검색'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-white"
            />
          </div>
          {activeTab === 'answers' && (
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
              필터
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'answers' ? (
            // Answer Library - Card Grid
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAnswers.map((answer) => (
                  <div
                    key={answer.id}
                    className="border border-[#E0E0E0] rounded-lg p-5 hover:shadow-minimal transition-all cursor-pointer"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-[0.9375rem] font-semibold text-[#1F1F1F]">
                        {answer.topic}
                      </h3>
                      {getStatusBadge(answer.status)}
                    </div>

                    {/* Summary */}
                    <p className="text-[0.8125rem] text-[#424242] leading-relaxed mb-4 line-clamp-2">
                      {answer.summary}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-[0.75rem] text-[#9AA0A6]">
                      <div className="flex items-center gap-4">
                        {answer.lastUsed && (
                          <span>최근 사용: {answer.lastUsed.toLocaleDateString('ko-KR')}</span>
                        )}
                        <span>사용: {answer.usageCount}회</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-1 hover:bg-[#F7F7F8] rounded">
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button className="p-1 hover:bg-[#F7F7F8] rounded">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Approved By */}
                    {answer.approvedBy && (
                      <div className="mt-3 pt-3 border-t border-[#E0E0E0] text-[0.75rem] text-[#9AA0A6]">
                        승인: {answer.approvedBy}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Source Documents - Table
            <div className="max-w-6xl mx-auto">
              <table className="w-full">
                <thead className="bg-[#F7F7F8] border-b border-[#E0E0E0]">
                  <tr className="text-[0.75rem] text-[#424242] uppercase tracking-wider">
                    <th className="text-left py-3 px-4 font-semibold">파일명</th>
                    <th className="text-left py-3 px-4 font-semibold">업로드 일자</th>
                    <th className="text-center py-3 px-4 font-semibold">파싱 상태</th>
                    <th className="text-right py-3 px-4 font-semibold">파일 크기</th>
                    <th className="text-center py-3 px-4 font-semibold">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr
                      key={doc.id}
                      className="border-b border-[#E0E0E0] hover:bg-[#F7F7F8] transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-[#9AA0A6]" />
                          <span className="text-[0.8125rem] text-[#1F1F1F] font-medium">
                            {doc.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-[0.8125rem] text-[#424242]">
                          {doc.uploadedAt.toLocaleDateString('ko-KR')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {getParsingStatusBadge(doc.parsingStatus)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-[0.8125rem] text-[#424242] mono">
                          {doc.fileSize}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7">
                            <RefreshCw className="h-3.5 w-3.5" />
                            Re-Parse
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-[#D0362D] hover:text-[#D0362D]">
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </EnterpriseLayout>
  );
}

export default KnowledgeHubPage;
