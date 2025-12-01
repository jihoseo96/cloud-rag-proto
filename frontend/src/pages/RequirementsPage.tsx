/**
 * RequirementsPage.tsx
 * RFP Requirements tracking and compliance mapping
 */

import { useState } from 'react';
import { EnterpriseLayout } from '../components/EnterpriseLayout';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  TrendingUp,
  Link as LinkIcon
} from 'lucide-react';
import { RFPRequirement } from '../types';

function RequirementsPage() {
  const { projectId } = useParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [complianceFilter, setComplianceFilter] = useState<'all' | 'YES' | 'PARTIAL' | 'NO' | 'UNKNOWN'>('all');

  // Mock data
  const mockRequirements: RFPRequirement[] = [
    {
      id: 'req-1',
      projectId: projectId || '',
      requirementText: 'The system must maintain ISO/IEC 27001:2022 certification for information security management.',
      requirementType: 'security',
      complianceLevel: 'YES',
      linkedAnswerCards: ['card-1'],
      anchorConfidence: 0.95,
      priority: 'high',
      section: '3.1 Security Requirements',
    },
    {
      id: 'req-2',
      projectId: projectId || '',
      requirementText: 'Guaranteed uptime SLA must be at least 99.5% for all critical services.',
      requirementType: 'technical',
      complianceLevel: 'YES',
      linkedAnswerCards: ['card-2'],
      anchorConfidence: 0.92,
      priority: 'high',
      section: '4.2 Service Level Requirements',
    },
    {
      id: 'req-3',
      projectId: projectId || '',
      requirementText: 'Data centers must be geographically distributed with real-time replication.',
      requirementType: 'technical',
      complianceLevel: 'PARTIAL',
      linkedAnswerCards: ['card-3'],
      anchorConfidence: 0.78,
      priority: 'medium',
      section: '4.1 Infrastructure Requirements',
    },
    {
      id: 'req-4',
      projectId: projectId || '',
      requirementText: '24/7 technical support must be available in Korean and English.',
      requirementType: 'operations',
      complianceLevel: 'UNKNOWN',
      linkedAnswerCards: [],
      anchorConfidence: 0.0,
      priority: 'medium',
      section: '5.3 Support Requirements',
    },
    {
      id: 'req-5',
      projectId: projectId || '',
      requirementText: 'All data must be encrypted at rest and in transit using industry-standard protocols.',
      requirementType: 'security',
      complianceLevel: 'NO',
      linkedAnswerCards: [],
      anchorConfidence: 0.0,
      priority: 'high',
      section: '3.2 Data Protection',
    },
  ];

  const [requirements] = useState<RFPRequirement[]>(mockRequirements);

  const getComplianceBadge = (level: string) => {
    switch (level) {
      case 'YES':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.6875rem] font-medium bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20">
            <CheckCircle2 className="h-3 w-3" />
            Compliant
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.6875rem] font-medium bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20">
            <AlertTriangle className="h-3 w-3" />
            Partial
          </span>
        );
      case 'NO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.6875rem] font-medium bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20">
            <XCircle className="h-3 w-3" />
            Non-Compliant
          </span>
        );
      case 'UNKNOWN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.6875rem] font-medium bg-muted text-muted-foreground border border-border">
            <HelpCircle className="h-3 w-3" />
            Unknown
          </span>
        );
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-[#ef4444]';
      case 'medium': return 'text-[#f97316]';
      case 'low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const filteredRequirements = requirements.filter(req => {
    if (searchQuery && !req.requirementText.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !req.section?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (complianceFilter !== 'all' && req.complianceLevel !== complianceFilter) {
      return false;
    }
    return true;
  });

  const stats = {
    total: requirements.length,
    compliant: requirements.filter(r => r.complianceLevel === 'YES').length,
    partial: requirements.filter(r => r.complianceLevel === 'PARTIAL').length,
    nonCompliant: requirements.filter(r => r.complianceLevel === 'NO').length,
    unknown: requirements.filter(r => r.complianceLevel === 'UNKNOWN').length,
  };

  const complianceRate = (stats.compliant / stats.total) * 100;

  return (
    <EnterpriseLayout projectId={projectId}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-6">
          <div>
            <h1 className="text-[0.9375rem] font-semibold tracking-tight">요구사항 추적</h1>
            <p className="text-[0.75rem] text-muted-foreground">
              RFP 충족도 매핑 및 커버리지 분석
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-[1.25rem] font-semibold mono ${
              complianceRate >= 90 ? 'text-[#10b981]' :
              complianceRate >= 70 ? 'text-[#f97316]' :
              'text-[#ef4444]'
            }`}>
              {complianceRate.toFixed(0)}%
            </div>
            <span className="text-[0.75rem] text-muted-foreground">충족률</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-5 gap-3">
                <div className="border border-border rounded-lg p-3 bg-card">
                  <div className="text-[0.6875rem] text-muted-foreground mb-1">전체</div>
                  <div className="text-[1.125rem] font-semibold mono">{stats.total}</div>
                </div>
                <div className="border border-border rounded-lg p-3 bg-card">
                  <div className="text-[0.6875rem] text-muted-foreground mb-1">충족</div>
                  <div className="text-[1.125rem] font-semibold mono text-[#10b981]">{stats.compliant}</div>
                </div>
                <div className="border border-border rounded-lg p-3 bg-card">
                  <div className="text-[0.6875rem] text-muted-foreground mb-1">부분충족</div>
                  <div className="text-[1.125rem] font-semibold mono text-[#f97316]">{stats.partial}</div>
                </div>
                <div className="border border-border rounded-lg p-3 bg-card">
                  <div className="text-[0.6875rem] text-muted-foreground mb-1">미충족</div>
                  <div className="text-[1.125rem] font-semibold mono text-[#ef4444]">{stats.nonCompliant}</div>
                </div>
                <div className="border border-border rounded-lg p-3 bg-card">
                  <div className="text-[0.6875rem] text-muted-foreground mb-1">미확인</div>
                  <div className="text-[1.125rem] font-semibold mono text-muted-foreground">{stats.unknown}</div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search requirements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-[0.8125rem]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={complianceFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setComplianceFilter('all')}
                    className="h-8 text-[0.75rem]"
                  >
                    All
                  </Button>
                  <Button
                    variant={complianceFilter === 'YES' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setComplianceFilter('YES')}
                    className="h-8 text-[0.75rem]"
                  >
                    Compliant
                  </Button>
                  <Button
                    variant={complianceFilter === 'PARTIAL' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setComplianceFilter('PARTIAL')}
                    className="h-8 text-[0.75rem]"
                  >
                    Partial
                  </Button>
                  <Button
                    variant={complianceFilter === 'NO' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setComplianceFilter('NO')}
                    className="h-8 text-[0.75rem]"
                  >
                    Non-Compliant
                  </Button>
                </div>
              </div>

              {/* Requirements Grid */}
              <div className="border border-border rounded-lg overflow-hidden">
                {/* Header */}
                <div className="bg-muted/50 border-b border-border grid grid-cols-12 gap-4 px-4 py-3 text-[0.6875rem] uppercase tracking-wider text-muted-foreground font-semibold">
                  <div className="col-span-1">Priority</div>
                  <div className="col-span-1">Section</div>
                  <div className="col-span-5">Requirement</div>
                  <div className="col-span-2">Compliance</div>
                  <div className="col-span-2">Linked Cards</div>
                  <div className="col-span-1">Confidence</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-border">
                  {filteredRequirements.map((req) => (
                    <div
                      key={req.id}
                      className="grid grid-cols-12 gap-4 px-4 py-4 items-start hover:bg-muted/30 transition-colors"
                    >
                      <div className="col-span-1">
                        <span className={`text-[0.75rem] font-medium uppercase ${getPriorityColor(req.priority)}`}>
                          {req.priority}
                        </span>
                      </div>
                      <div className="col-span-1">
                        <span className="text-[0.75rem] text-muted-foreground">
                          {req.section?.split(' ')[0]}
                        </span>
                      </div>
                      <div className="col-span-5">
                        <p className="text-[0.8125rem]">{req.requirementText}</p>
                        {req.section && (
                          <p className="text-[0.6875rem] text-muted-foreground mt-1">{req.section}</p>
                        )}
                      </div>
                      <div className="col-span-2">
                        {getComplianceBadge(req.complianceLevel)}
                      </div>
                      <div className="col-span-2">
                        {req.linkedAnswerCards.length > 0 ? (
                          <div className="flex items-center gap-1.5 text-[0.75rem] text-[#14b8a6]">
                            <LinkIcon className="h-3.5 w-3.5" />
                            {req.linkedAnswerCards.length} card(s)
                          </div>
                        ) : (
                          <span className="text-[0.75rem] text-muted-foreground">No links</span>
                        )}
                      </div>
                      <div className="col-span-1">
                        {req.anchorConfidence > 0 ? (
                          <div className="flex items-center gap-1 text-[0.75rem]">
                            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="mono">{(req.anchorConfidence * 100).toFixed(0)}%</span>
                          </div>
                        ) : (
                          <span className="text-[0.75rem] text-muted-foreground mono">-</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EnterpriseLayout>
  );
}

export default RequirementsPage;
