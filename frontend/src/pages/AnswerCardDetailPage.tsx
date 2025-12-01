/**
 * Screen 4: AnswerCard Detail (Evolution View)
 * Git-style version history and variant management
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  ArrowLeft,
  CheckCircle2,
  X,
  AlertTriangle,
  TrendingUp,
  GitBranch,
  Lock,
  Clock,
  User,
  FileText,
  Link2,
  Copy,
  Edit,
  MoreHorizontal
} from 'lucide-react';

interface FactItem {
  key: string;
  value: string;
  verified: boolean;
  lastUpdated: Date;
}

interface VariantVersion {
  id: string;
  version: string;
  tag: 'APPROVED' | 'REJECTED' | 'DRAFT' | 'DEPRECATED';
  content: string;
  createdAt: Date;
  createdBy: string;
  usageCount: number;
  confidence: number;
  riskLevel: 'safe' | 'medium' | 'high';
  riskReason?: string;
  diffFromBase?: string;
}

interface ProjectUsage {
  projectId: string;
  projectName: string;
  usageCount: number;
  lastUsed: Date;
  status: 'active' | 'completed';
}

function AnswerCardDetailPage() {
  const { cardId } = useParams();
  const navigate = useNavigate();

  // Mock Data
  const cardTitle = 'ISO 27001 Certification';
  const cardCategory = 'Security & Compliance';
  const createdDate = new Date('2023-06-15');
  const lastUpdated = new Date('2024-11-20');

  const [facts] = useState<FactItem[]>([
    {
      key: 'Certificate Number',
      value: 'ISO-27001-2024-KR-12345',
      verified: true,
      lastUpdated: new Date('2024-06-10')
    },
    {
      key: 'Certification Date',
      value: 'June 10, 2023',
      verified: true,
      lastUpdated: new Date('2023-06-10')
    },
    {
      key: 'Expiry Date',
      value: 'June 10, 2026',
      verified: true,
      lastUpdated: new Date('2023-06-10')
    },
    {
      key: 'Certification Body',
      value: 'Korean Accreditation Board (KAB)',
      verified: true,
      lastUpdated: new Date('2023-06-10')
    },
    {
      key: 'Scope',
      value: 'Information Security Management for Cloud Services',
      verified: true,
      lastUpdated: new Date('2023-06-10')
    },
    {
      key: 'Latest Audit Date',
      value: 'May 15, 2024',
      verified: true,
      lastUpdated: new Date('2024-05-15')
    }
  ]);

  const [variants] = useState<VariantVersion[]>([
    {
      id: 'var-1',
      version: 'v3.0',
      tag: 'APPROVED',
      content: 'Our organization achieved ISO 27001:2013 certification in June 2023, demonstrating our comprehensive approach to information security management. The certification covers our cloud service operations and is renewed annually through surveillance audits conducted by the Korean Accreditation Board.',
      createdAt: new Date('2024-11-20'),
      createdBy: 'Kim Min-soo',
      usageCount: 15,
      confidence: 98,
      riskLevel: 'safe'
    },
    {
      id: 'var-2',
      version: 'v2.1',
      tag: 'APPROVED',
      content: 'We maintain ISO 27001:2013 certification (Certificate #ISO-27001-2024-KR-12345), valid until June 2026. Our information security management system covers all cloud service operations.',
      createdAt: new Date('2024-08-15'),
      createdBy: 'Park Ji-won',
      usageCount: 8,
      confidence: 95,
      riskLevel: 'safe',
      diffFromBase: 'Added certificate number details'
    },
    {
      id: 'var-3',
      version: 'v2.0-sales',
      tag: 'REJECTED',
      content: 'We are proud to be ISO 27001 certified! This best-in-class certification guarantees that your data is 100% secure with our enterprise-grade security solutions.',
      createdAt: new Date('2024-07-10'),
      createdBy: 'Sales Team',
      usageCount: 0,
      confidence: 65,
      riskLevel: 'high',
      riskReason: 'Fact Mismatch: Contains marketing language ("best-in-class", "guarantees", "100% secure") which is prohibited in RFP responses.'
    },
    {
      id: 'var-4',
      version: 'v1.0',
      tag: 'DEPRECATED',
      content: 'ISO 27001 certification obtained in 2023.',
      createdAt: new Date('2023-06-15'),
      createdBy: 'System',
      usageCount: 3,
      confidence: 72,
      riskLevel: 'medium',
      diffFromBase: 'Initial version - lacks detail'
    }
  ]);

  const [usedInProjects] = useState<ProjectUsage[]>([
    {
      projectId: 'proj-1',
      projectName: 'Government Defense RFP 2024-Q4',
      usageCount: 3,
      lastUsed: new Date('2024-11-25'),
      status: 'active'
    },
    {
      projectId: 'proj-2',
      projectName: 'Finance Compliance RFP',
      usageCount: 5,
      lastUsed: new Date('2024-11-22'),
      status: 'active'
    },
    {
      projectId: 'proj-3',
      projectName: 'Healthcare Integration Proposal',
      usageCount: 2,
      lastUsed: new Date('2024-11-20'),
      status: 'active'
    },
    {
      projectId: 'proj-4',
      projectName: 'Banking Security RFP 2024',
      usageCount: 4,
      lastUsed: new Date('2024-10-15'),
      status: 'completed'
    }
  ]);

  const getTagColor = (tag: VariantVersion['tag']) => {
    switch (tag) {
      case 'APPROVED':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'REJECTED':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'DRAFT':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'DEPRECATED':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getRiskColor = (level: VariantVersion['riskLevel']) => {
    switch (level) {
      case 'safe':
        return 'text-green-400';
      case 'medium':
        return 'text-orange-400';
      case 'high':
        return 'text-red-400';
    }
  };

  const totalUsage = variants.reduce((sum, v) => sum + v.usageCount, 0);

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="min-h-screen">
        
        {/* Header */}
        <div className="border-b border-border bg-card sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">{cardTitle}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">
                      {cardCategory}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Created {createdDate.toLocaleDateString('ko-KR')}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      Updated {lastUpdated.toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  사실 편집
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  복제
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Fact Sheet */}
              <div className="bg-card border border-border rounded-lg">
                <div className="p-5 border-b border-border">
                  <h2 className="font-semibold text-foreground">Fact Sheet</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Verified information anchored to source documents
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {facts.map((fact, idx) => (
                    <div key={idx} className="p-4 flex items-start justify-between hover:bg-muted/20 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-muted-foreground">{fact.key}</span>
                          {fact.verified && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                          )}
                        </div>
                        <p className="text-sm text-foreground font-medium">{fact.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last verified: {fact.lastUpdated.toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Variant Table (Git-style) */}
              <div className="bg-card border border-border rounded-lg">
                <div className="p-5 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                        <h2 className="font-semibold text-foreground">버전 히스토리</h2>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {variants.length}개 버전 · 총 {totalUsage}회 사용
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      <GitBranch className="h-4 w-4 mr-2" />
                      Create Variant
                    </Button>
                  </div>
                </div>
                
                <div className="divide-y divide-border">
                  {variants.map((variant) => (
                    <div key={variant.id} className="p-4">
                      {/* Variant Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-semibold text-foreground">
                            {variant.version}
                          </span>
                          <Badge variant="outline" className={`text-xs ${getTagColor(variant.tag)}`}>
                            {variant.tag}
                          </Badge>
                          {variant.riskLevel === 'high' && (
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>사용: {variant.usageCount}회</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`font-semibold ${getRiskColor(variant.riskLevel)}`}>
                              Confidence: {variant.confidence}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="bg-muted/20 rounded-lg p-3 mb-3 border border-border">
                        <p className="text-sm text-foreground">{variant.content}</p>
                      </div>

                      {/* Risk Warning */}
                      {variant.riskReason && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-3">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs font-semibold text-red-400 mb-1">Risk Identified</div>
                              <p className="text-xs text-foreground/90">{variant.riskReason}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{variant.createdBy}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{variant.createdAt.toLocaleDateString('ko-KR')}</span>
                        </div>
                        {variant.diffFromBase && (
                          <>
                            <span>•</span>
                            <span className="text-blue-400">{variant.diffFromBase}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Usage Stats */}
              <div className="bg-card border border-border rounded-lg p-5">
                <h3 className="font-semibold text-sm text-foreground mb-4">사용 통계</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">총 사용 횟수</div>
                    <div className="text-2xl font-semibold text-foreground">{totalUsage}회</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Active Projects</div>
                    <div className="text-2xl font-semibold text-foreground">
                      {usedInProjects.filter(p => p.status === 'active').length}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Latest Version</div>
                    <div className="text-lg font-mono font-semibold text-teal-400">
                      {variants[0].version}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lock-in View: Used in Projects */}
              <div className="bg-card border border-border rounded-lg">
                <div className="p-5 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm text-foreground">Used in Projects</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Changes affect these projects
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {usedInProjects.map((project) => (
                    <button
                      key={project.projectId}
                      onClick={() => navigate(`/project/${project.projectId}`)}
                      className="w-full p-4 hover:bg-muted/20 transition-colors text-left"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            {project.projectName}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                project.status === 'active'
                                  ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                                  : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                              }`}
                            >
                              {project.status.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {project.usageCount}회 사용
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last used: {project.lastUsed.toLocaleDateString('ko-KR')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnswerCardDetailPage;
