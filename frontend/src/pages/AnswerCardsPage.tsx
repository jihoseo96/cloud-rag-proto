/**
 * AnswerCardsPage.tsx
 * Screen 3: The Project Main View (The Knowledge Base)
 * Dense, organized view of AnswerCards with filtering and source anchors
 */

import { useState } from 'react';
import { EnterpriseLayout } from '../components/EnterpriseLayout';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Database,
  Search,
  Filter,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  TrendingUp,
  Tag,
  Calendar,
  Eye
} from 'lucide-react';
import { AnswerCard, AnswerVariant } from '../types';

function AnswerCardsPage() {
  const { projectId } = useParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'high-risk'>('all');
  const [selectedCard, setSelectedCard] = useState<AnswerCard | null>(null);

  // Mock data
  const mockCards: AnswerCard[] = [
    {
      id: 'card-1',
      projectId: projectId || '',
      topic: 'ISO 27001 Certification Status',
      description: 'Current information security certification status',
      anchors: [
        {
          contentHash: 'hash-1',
          textSnippet: 'Our organization maintains ISO/IEC 27001:2022 certification...',
          anchorConfidence: 0.95,
          docId: 'doc-security-2024',
          sectionPath: '3.1 Security Certifications',
          page: 5,
          anchorType: 'semantic',
        },
      ],
      facts: {
        certification: 'ISO/IEC 27001:2022',
        validUntil: '2025-12-31',
        certifyingBody: 'BSI Group',
      },
      variants: [
        {
          id: 'var-1',
          content: 'We are certified to ISO/IEC 27001:2022 standard by BSI Group, valid through December 2025.',
          context: 'public-sector',
          status: 'APPROVED',
          riskLevel: 'SAFE',
          usageCount: 12,
          approvedBy: 'john.doe@company.com',
          approvedAt: new Date('2024-11-15'),
          createdAt: new Date('2024-11-10'),
          createdBy: 'system',
        },
      ],
      tags: ['security', 'compliance', 'certification'],
      category: 'Security & Compliance',
      createdAt: new Date('2024-11-10'),
      updatedAt: new Date('2024-11-15'),
      overallConfidence: 0.95,
    },
    {
      id: 'card-2',
      projectId: projectId || '',
      topic: 'Service Level Agreement (SLA)',
      description: 'Guaranteed uptime and service availability',
      anchors: [
        {
          contentHash: 'hash-2',
          textSnippet: 'We guarantee 99.9% uptime for all critical services...',
          anchorConfidence: 0.92,
          docId: 'doc-sla-2024',
          sectionPath: '2.3 Service Commitments',
          page: 12,
          anchorType: 'semantic',
        },
      ],
      facts: {
        uptime: '99.9%',
        responseTime: '< 2 hours',
        compensationPolicy: 'Yes',
      },
      variants: [
        {
          id: 'var-2',
          content: 'Our SLA guarantees 99.9% uptime with response times under 2 hours for critical issues.',
          context: 'technical',
          status: 'APPROVED',
          riskLevel: 'SAFE',
          usageCount: 8,
          approvedBy: 'jane.smith@company.com',
          approvedAt: new Date('2024-11-12'),
          createdAt: new Date('2024-11-10'),
          createdBy: 'system',
        },
      ],
      tags: ['sla', 'uptime', 'service'],
      category: 'Service Operations',
      createdAt: new Date('2024-11-10'),
      updatedAt: new Date('2024-11-12'),
      overallConfidence: 0.92,
    },
    {
      id: 'card-3',
      projectId: projectId || '',
      topic: 'Data Center Location & Redundancy',
      description: 'Geographic distribution and disaster recovery',
      anchors: [
        {
          contentHash: 'hash-3',
          textSnippet: 'Primary data center in Seoul, backup facility in Busan...',
          anchorConfidence: 0.88,
          docId: 'doc-infrastructure-2024',
          sectionPath: '4.2 Infrastructure',
          page: 23,
          anchorType: 'semantic',
        },
        {
          contentHash: 'hash-4',
          textSnippet: 'Real-time replication between facilities ensures business continuity...',
          anchorConfidence: 0.85,
          docId: 'doc-dr-plan-2023',
          sectionPath: '1.1 Overview',
          page: 2,
          failReasons: ['Document version may be outdated'],
          anchorType: 'semantic',
        },
      ],
      facts: {
        primaryLocation: 'Seoul',
        backupLocation: 'Busan',
        replication: 'Real-time',
      },
      variants: [
        {
          id: 'var-3',
          content: 'We operate primary infrastructure in Seoul with real-time replication to our Busan facility.',
          context: 'public-sector',
          status: 'PENDING',
          riskLevel: 'MEDIUM',
          usageCount: 0,
          createdAt: new Date('2024-11-18'),
          createdBy: 'system',
        },
      ],
      tags: ['infrastructure', 'disaster-recovery', 'datacenter'],
      category: 'Technical Infrastructure',
      createdAt: new Date('2024-11-18'),
      updatedAt: new Date('2024-11-18'),
      overallConfidence: 0.87,
    },
    {
      id: 'card-4',
      projectId: projectId || '',
      topic: 'Customer Support Coverage',
      description: 'Support hours and language availability',
      anchors: [
        {
          contentHash: 'hash-5',
          textSnippet: '24/7 support in Korean and English via phone, email, and chat...',
          anchorConfidence: 0.78,
          docId: 'doc-support-policy',
          sectionPath: '5.1 Support Channels',
          page: 8,
          failReasons: ['Multiple conflicting sources found'],
          anchorType: 'structure',
        },
      ],
      facts: {
        availability: '24/7',
        languages: ['Korean', 'English'],
        channels: ['Phone', 'Email', 'Chat'],
      },
      variants: [
        {
          id: 'var-4',
          content: 'We provide 24/7 multilingual support through phone, email, and live chat.',
          context: 'generic',
          status: 'PENDING',
          riskLevel: 'HIGH',
          usageCount: 0,
          createdAt: new Date('2024-11-20'),
          createdBy: 'system',
        },
      ],
      tags: ['support', 'customer-service'],
      category: 'Customer Support',
      createdAt: new Date('2024-11-20'),
      updatedAt: new Date('2024-11-20'),
      overallConfidence: 0.78,
    },
  ];

  const [cards] = useState<AnswerCard[]>(mockCards);

  const getStatusBadge = (variant: AnswerVariant) => {
    switch (variant.status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.6875rem] font-medium bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20">
            <CheckCircle2 className="h-3 w-3" />
            승인됨
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.6875rem] font-medium bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">
            <AlertTriangle className="h-3 w-3" />
            대기중
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.6875rem] font-medium bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20">
            거부됨
          </span>
        );
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'SAFE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.6875rem] font-medium bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20">
            <Shield className="h-3 w-3" />
            안전
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.6875rem] font-medium bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20">
            <Shield className="h-3 w-3" />
            보통 위험
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.6875rem] font-medium bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20">
            <Shield className="h-3 w-3" />
            높은 위험
          </span>
        );
    }
  };

  const filteredCards = cards.filter(card => {
    if (searchQuery && !card.topic.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !card.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (statusFilter !== 'all') {
      const primaryVariant = card.variants[0];
      if (!primaryVariant) return false;
      
      if (statusFilter === 'approved' && primaryVariant.status !== 'APPROVED') return false;
      if (statusFilter === 'pending' && primaryVariant.status !== 'PENDING') return false;
      if (statusFilter === 'high-risk' && primaryVariant.riskLevel !== 'HIGH') return false;
    }
    
    return true;
  });

  return (
    <EnterpriseLayout projectId={projectId}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-6">
          <div>
            <h1 className="text-[0.9375rem] font-semibold tracking-tight">Knowledge Base</h1>
            <p className="text-[0.75rem] text-muted-foreground">
              {filteredCards.length} AnswerCard{filteredCards.length !== 1 ? 's' : ''} • Source-anchored knowledge blocks
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[0.75rem]">
              <span className="text-muted-foreground">필터:</span>
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
                className="h-7 text-[0.75rem]"
              >
                전체
              </Button>
              <Button
                variant={statusFilter === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('approved')}
                className="h-7 text-[0.75rem]"
              >
                승인됨
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
                className="h-7 text-[0.75rem]"
              >
                대기중
              </Button>
              <Button
                variant={statusFilter === 'high-risk' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('high-risk')}
                className="h-7 text-[0.75rem]"
              >
                높은 위험
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Cards List */}
          <div className={`${selectedCard ? 'w-1/2' : 'w-full'} flex flex-col border-r border-border transition-all`}>
            {/* Search */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search knowledge base..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-[0.8125rem]"
                />
              </div>
            </div>

            {/* Cards Grid */}
            <div className="flex-1 overflow-auto p-4">
              <div className="grid grid-cols-1 gap-3">
                {filteredCards.map((card) => {
                  const primaryVariant = card.variants[0];
                  const isSelected = selectedCard?.id === card.id;
                  
                  return (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCard(card)}
                      className={`
                        border border-border rounded-lg p-4 cursor-pointer transition-all
                        hover:border-[#14b8a6]/50 hover:bg-muted/30
                        ${isSelected ? 'border-[#14b8a6] bg-muted/50' : ''}
                      `}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[0.875rem] font-semibold mb-1 truncate">
                            {card.topic}
                          </h3>
                          {card.description && (
                            <p className="text-[0.75rem] text-muted-foreground line-clamp-2">
                              {card.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-[0.75rem] font-semibold mono">
                            {(card.overallConfidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      {/* Status & Risk */}
                      <div className="flex items-center gap-2 mb-3">
                        {primaryVariant && (
                          <>
                            {getStatusBadge(primaryVariant)}
                            {getRiskBadge(primaryVariant.riskLevel)}
                          </>
                        )}
                        {card.category && (
                          <span className="text-[0.6875rem] text-muted-foreground">
                            {card.category}
                          </span>
                        )}
                      </div>

                      {/* Source Anchors */}
                      <div className="space-y-1.5">
                        {card.anchors.map((anchor, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-[0.6875rem] p-2 bg-card/50 border border-border/50 rounded"
                          >
                            <FileText className="h-3 w-3 text-[#14b8a6] mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-medium text-[#14b8a6]">
                                  📄 Source: {anchor.docId}
                                </span>
                                {anchor.page && (
                                  <span className="text-muted-foreground">p.{anchor.page}</span>
                                )}
                                <span className="text-muted-foreground">
                                  {(anchor.anchorConfidence * 100).toFixed(0)}% confidence
                                </span>
                              </div>
                              <p className="text-muted-foreground line-clamp-1">
                                {anchor.textSnippet}
                              </p>
                              {anchor.failReasons && anchor.failReasons.length > 0 && (
                                <div className="mt-1 flex items-center gap-1 text-[#f97316]">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span>{anchor.failReasons[0]}</span>
                                </div>
                              )}
                            </div>
                            <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          </div>
                        ))}
                      </div>

                      {/* Tags */}
                      {card.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border">
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          {card.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[0.6875rem] px-1.5 py-0.5 bg-muted rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detail Panel */}
          {selectedCard && (
            <div className="w-1/2 flex flex-col">
              <div className="h-14 border-b border-border flex items-center justify-between px-6">
                <h2 className="text-[0.875rem] font-semibold">AnswerCard Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCard(null)}
                >
                  Close
                </Button>
              </div>

              <div className="flex-1 overflow-auto p-6">
                <div className="space-y-6">
                  {/* Topic */}
                  <div>
                    <h3 className="text-[0.9375rem] font-semibold mb-2">{selectedCard.topic}</h3>
                    {selectedCard.description && (
                      <p className="text-[0.8125rem] text-muted-foreground">{selectedCard.description}</p>
                    )}
                  </div>

                  {/* Facts */}
                  <div>
                    <h4 className="text-[0.75rem] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                      Extracted Facts
                    </h4>
                    <div className="bg-card border border-border rounded-lg p-3 mono text-[0.75rem]">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(selectedCard.facts, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Variants */}
                  <div>
                    <h4 className="text-[0.75rem] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                      Content Variants ({selectedCard.variants.length})
                    </h4>
                    <div className="space-y-3">
                      {selectedCard.variants.map((variant) => (
                        <div key={variant.id} className="bg-card border border-border rounded-lg p-4">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(variant)}
                              {getRiskBadge(variant.riskLevel)}
                            </div>
                            <span className="text-[0.6875rem] text-muted-foreground">
                              Used {variant.usageCount}x
                            </span>
                          </div>
                          <p className="text-[0.8125rem] mb-3">{variant.content}</p>
                          <div className="text-[0.6875rem] text-muted-foreground space-y-1">
                            <div>Context: {variant.context}</div>
                            {variant.approvedBy && (
                              <div>Approved by {variant.approvedBy} on {variant.approvedAt?.toLocaleDateString()}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div>
                    <h4 className="text-[0.75rem] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                      Metadata
                    </h4>
                    <div className="text-[0.75rem] space-y-1 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        Created: {selectedCard.createdAt.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        Updated: {selectedCard.updatedAt.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Overall Confidence: {(selectedCard.overallConfidence * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </EnterpriseLayout>
  );
}

export default AnswerCardsPage;
