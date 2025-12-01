/**
 * KnowledgeBasePage.tsx
 * Global Knowledge Base - Documents, Proposals, AnswerCards
 */

import { EnterpriseLayout } from '../components/EnterpriseLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  FileText,
  ExternalLink,
  ChevronDown,
  Upload,
  Sparkles,
  Shield,
  AlertCircle,
  File,
  Database,
  BookOpen,
  Plus,
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

type TabType = 'documents' | 'proposals' | 'answercards';

export default function KnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState<TabType>('documents');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - Documents
  const documents = [
    {
      id: 1,
      title: '회사 소개서 2024',
      type: 'PDF',
      size: '2.4 MB',
      uploadedBy: '김철수',
      uploadedAt: '2024-11-20',
      tags: ['회사소개', '기업정보'],
      usedInCards: 12,
      usedInProposals: 5
    },
    {
      id: 2,
      title: '기술 역량 개요서',
      type: 'DOCX',
      size: '1.8 MB',
      uploadedBy: '이영희',
      uploadedAt: '2024-11-18',
      tags: ['기술', '역량'],
      usedInCards: 28,
      usedInProposals: 8
    },
    {
      id: 3,
      title: '보안 인증서 2024',
      type: 'PDF',
      size: '3.2 MB',
      uploadedBy: '박민수',
      uploadedAt: '2024-11-15',
      tags: ['보안', '컴플라이언스', '인증'],
      usedInCards: 45,
      usedInProposals: 12
    },
    {
      id: 4,
      title: 'Case Study - 헬스케어 프로젝트',
      type: 'PDF',
      size: '1.5 MB',
      uploadedBy: '최지원',
      uploadedAt: '2024-11-12',
      tags: ['사례연구', '헬스케어'],
      usedInCards: 8,
      usedInProposals: 3
    },
  ];

  // Mock data - Proposals
  const proposals = [
    {
      id: 1,
      title: '정부 클라우드 RFP 2024',
      status: 'submitted',
      submittedAt: '2024-11-25',
      client: '디지털부',
      value: '25억원',
      cardsUsed: 34,
      confidence: 0.92
    },
    {
      id: 2,
      title: '의료 시스템 통합',
      status: 'in-progress',
      dueDate: '2024-12-05',
      client: '국민건강보험공단',
      value: '18억원',
      cardsUsed: 28,
      confidence: 0.85
    },
    {
      id: 3,
      title: '핀테크 플랫폼 현대화',
      status: 'draft',
      dueDate: '2024-12-15',
      client: '한국산업은행',
      value: '32억원',
      cardsUsed: 19,
      confidence: 0.78
    },
  ];

  // Mock data - AnswerCards
  const answerCards = [
    {
      id: 1,
      title: '클라우드 인프라 역량',
      content: '당사는 AWS, Azure, GCP에 걸친 멀티클라우드 인프라를 99.99% 가용성으로 운영하고 있습니다...',
      sourceDoc: '기술 역량 개요서',
      tags: ['인프라', 'Cloud', '기술'],
      confidence: 0.95,
      uses: 28,
      lastUsed: '2시간 전',
      risk: 'low'
    },
    {
      id: 2,
      title: '보안 인증 및 컴플라이언스',
      content: 'ISO 27001, SOC 2 Type II, FedRAMP High 인증을 보유하고 있으며 지속적인 모니터링을 수행합니다...',
      sourceDoc: '보안 인증서 2024',
      tags: ['보안', '컴플라이언스', '인증'],
      confidence: 0.98,
      uses: 45,
      lastUsed: '1일 전',
      risk: 'low'
    },
    {
      id: 3,
      title: '팀 구성 및 전문성',
      content: '평균 12년 경력의 50명 이상의 인증된 전문가로 구성된 수행팀을 보유하고 있습니다...',
      sourceDoc: '회사 소개서 2024',
      tags: ['팀', '인력', '경험'],
      confidence: 0.82,
      uses: 19,
      lastUsed: '3일 전',
      risk: 'medium'
    },
  ];

  const getRiskBadge = (risk: string) => {
    switch(risk) {
      case 'low':
        return <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-[0.6875rem]">낮음</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[0.6875rem]">보통</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-[0.6875rem]">높음</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'submitted':
        return <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-[0.6875rem]">제출완료</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[0.6875rem]">진행중</Badge>;
      case 'draft':
        return <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border text-[0.6875rem]">작성중</Badge>;
      default:
        return null;
    }
  };

  const tabConfig = [
    { id: 'documents' as TabType, label: '사내 문서', icon: File, count: documents.length },
    { id: 'proposals' as TabType, label: '제안서', icon: BookOpen, count: proposals.length },
    { id: 'answercards' as TabType, label: 'AnswerCard', icon: Database, count: answerCards.length },
  ];

  return (
    <EnterpriseLayout>
      <div className="h-full flex flex-col bg-background">
        {/* Header */}
        <div className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-[0.9375rem]">지식 베이스</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" className="h-8 bg-[#14b8a6] hover:bg-[#14b8a6]/90">
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              문서 업로드
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              카드 생성
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border bg-card">
          <div className="flex items-center px-6">
            {tabConfig.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 border-b-2 transition-colors text-[0.8125rem] font-medium
                    ${isActive 
                      ? 'border-[#14b8a6] text-[#14b8a6]' 
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  <Badge variant="outline" className="text-[0.6875rem] ml-1">
                    {tab.count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="border-b border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`${activeTab === 'documents' ? '문서' : activeTab === 'proposals' ? '제안서' : 'AnswerCard'} 검색...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 bg-background text-[0.8125rem]"
              />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Filter className="h-3.5 w-3.5" />
              필터
            </Button>
            {activeTab === 'documents' && (
              <Button variant="outline" size="sm" className="h-9 gap-2">
                파일 형식
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            )}
            {activeTab === 'answercards' && (
              <Button variant="outline" size="sm" className="h-9 gap-2">
                신뢰도
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-card border border-border rounded-lg p-5 hover:border-[#14b8a6] transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <File className="h-5 w-5 text-blue-400" />
                          <h3 className="font-semibold text-[0.9375rem] text-foreground">
                            {doc.title}
                          </h3>
                          <Badge variant="outline" className="text-[0.6875rem]">
                            {doc.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-[0.75rem]">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <span>{doc.size}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <span>{doc.uploadedBy}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{doc.uploadedAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-[0.75rem]">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Database className="h-3.5 w-3.5" />
                          <span>카드 {doc.usedInCards}개</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>제안서 {doc.usedInProposals}개</span>
                        </div>
                        <div className="flex gap-1.5">
                          {doc.tags.map((tag) => (
                            <Badge 
                              key={tag} 
                              variant="outline" 
                              className="text-[0.6875rem] bg-muted/50"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Proposals Tab */}
            {activeTab === 'proposals' && (
              <div className="space-y-3">
                {proposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="bg-card border border-border rounded-lg p-5 hover:border-[#14b8a6] transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <BookOpen className="h-5 w-5 text-[#14b8a6]" />
                          <h3 className="font-semibold text-[0.9375rem] text-foreground">
                            {proposal.title}
                          </h3>
                          {getStatusBadge(proposal.status)}
                        </div>
                        <p className="text-[0.8125rem] text-muted-foreground">
                          고객사: {proposal.client} • 금액: {proposal.value}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8">
                          보기
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-[0.75rem]">
                        {proposal.status === 'submitted' ? (
                          <div className="flex items-center gap-1.5 text-green-400">
                            <Clock className="h-3.5 w-3.5" />
                            <span>제출일 {proposal.submittedAt}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-yellow-400">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>마감일 {proposal.dueDate}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Database className="h-3.5 w-3.5" />
                          <span>카드 {proposal.cardsUsed}개 사용</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Shield className="h-3.5 w-3.5" />
                          <span className="font-mono">신뢰도 {(proposal.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* AnswerCards Tab */}
            {activeTab === 'answercards' && (
              <div className="space-y-3">
                {answerCards.map((card) => (
                  <Link
                    key={card.id}
                    to={`/card/${card.id}`}
                    className="block bg-card border border-border rounded-lg p-5 hover:border-[#14b8a6] transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Database className="h-5 w-5 text-[#14b8a6]" />
                          <h3 className="font-semibold text-[0.9375rem] text-foreground group-hover:text-[#14b8a6] transition-colors">
                            {card.title}
                          </h3>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[0.8125rem] text-muted-foreground line-clamp-2 mb-2">
                          {card.content}
                        </p>
                        <div className="flex items-center gap-1.5 text-[0.75rem] text-muted-foreground">
                          <File className="h-3.5 w-3.5" />
                          <span>출처: {card.sourceDoc}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-[0.75rem]">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Shield className="h-3.5 w-3.5" />
                          <span className="font-mono">신뢰도 {(card.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span>{card.uses}회 사용</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{card.lastUsed}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[0.6875rem] text-muted-foreground mr-1">위험도</span>
                        {getRiskBadge(card.risk)}
                        <div className="flex gap-1.5">
                          {card.tags.slice(0, 3).map((tag) => (
                            <Badge 
                              key={tag} 
                              variant="outline" 
                              className="text-[0.6875rem] bg-muted/50"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </EnterpriseLayout>
  );
}
