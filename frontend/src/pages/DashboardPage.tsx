/**
 * Screen 0: Global Command Center
 * Main Dashboard - High-Density Professional
 * "Bloomberg x Linear x Government"
 */

import { useState } from 'react';
import { EnterpriseLayout } from '../components/EnterpriseLayout';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Activity,
  Database,
  FileText,
  Users,
  AlertCircle,
  ArrowRight,
  Zap
} from 'lucide-react';

interface ActionRequired {
  id: string;
  type: 'approval' | 'conflict' | 'risk';
  priority: 'high' | 'medium' | 'low';
  title: string;
  project: string;
  count?: number;
  deadline?: Date;
}

interface ActiveProject {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'review';
  dueDate: Date;
  progress: number;
  complianceCoverage: number;
  riskLevel: 'high' | 'medium' | 'low';
  pendingActions: number;
}

interface AIUsageData {
  currentMonth: {
    tokensUsed: number;
    tokenLimit: number;
    costKRW: number;
    budgetKRW: number;
  };
  trend: Array<{ month: string; tokens: number; cost: number }>;
}

function DashboardPage() {
  const navigate = useNavigate();

  // Mock Data - Action Required
  const [actionsRequired] = useState<ActionRequired[]>([
    {
      id: 'act-1',
      type: 'approval',
      priority: 'high',
      title: '승인 대기중인 답변',
      project: '정부 국방 RFP 2024-Q4',
      count: 3,
      deadline: new Date('2024-12-05')
    },
    {
      id: 'act-2',
      type: 'risk',
      priority: 'high',
      title: '높은 위험도 알림',
      project: '금융 컴플라이언스 RFP',
      count: 2,
      deadline: new Date('2024-12-03')
    },
    {
      id: 'act-3',
      type: 'conflict',
      priority: 'medium',
      title: '미해결 충돌',
      project: '의료 통합 제안서',
      count: 1
    }
  ]);

  // Mock Data - Active Projects
  const [projects] = useState<ActiveProject[]>([
    {
      id: 'proj-1',
      name: '정부 국방 RFP 2024-Q4',
      status: 'active',
      dueDate: new Date('2024-12-15'),
      progress: 67,
      complianceCoverage: 87,
      riskLevel: 'medium',
      pendingActions: 3
    },
    {
      id: 'proj-2',
      name: '금융 컴플라이언스 RFP',
      status: 'review',
      dueDate: new Date('2024-12-08'),
      progress: 89,
      complianceCoverage: 94,
      riskLevel: 'high',
      pendingActions: 2
    },
    {
      id: 'proj-3',
      name: '의료 통합 제안서',
      status: 'active',
      dueDate: new Date('2024-12-20'),
      progress: 45,
      complianceCoverage: 72,
      riskLevel: 'low',
      pendingActions: 1
    },
    {
      id: 'proj-4',
      name: '스마트시티 인프라 RFP',
      status: 'paused',
      dueDate: new Date('2025-01-15'),
      progress: 23,
      complianceCoverage: 58,
      riskLevel: 'low',
      pendingActions: 0
    }
  ]);

  // Mock Data - AI Usage
  const [aiUsage] = useState<AIUsageData>({
    currentMonth: {
      tokensUsed: 8450000,
      tokenLimit: 10000000,
      costKRW: 127500,
      budgetKRW: 150000
    },
    trend: [
      { month: '08', tokens: 6200000, cost: 93000 },
      { month: '09', tokens: 7100000, cost: 106500 },
      { month: '10', tokens: 7800000, cost: 117000 },
      { month: '11', tokens: 8450000, cost: 127500 }
    ]
  });

  const getDaysUntil = (date: Date) => {
    const diff = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getActionIcon = (type: ActionRequired['type']) => {
    switch (type) {
      case 'approval':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'risk':
        return <AlertTriangle className="h-4 w-4" />;
      case 'conflict':
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: ActionRequired['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'medium':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'low':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    }
  };

  const getRiskColor = (level: ActiveProject['riskLevel']) => {
    switch (level) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-orange-400';
      case 'low':
        return 'text-green-400';
    }
  };

  const getRiskLabel = (level: ActiveProject['riskLevel']) => {
    switch (level) {
      case 'high':
        return '높음';
      case 'medium':
        return '보통';
      case 'low':
        return '낮음';
    }
  };

  const getStatusBadge = (status: ActiveProject['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-[#0E7A4E]/10 text-[#0E7A4E] border-[#0E7A4E]/30">진행중</Badge>;
      case 'review':
        return <Badge variant="default" className="bg-[#0B57D0]/10 text-[#0B57D0] border-[#0B57D0]/30">검토중</Badge>;
      case 'paused':
        return <Badge variant="default" className="bg-[#9AA0A6]/10 text-[#424242] border-[#E0E0E0]">일시중지</Badge>;
    }
  };

  const usagePercentage = (aiUsage.currentMonth.tokensUsed / aiUsage.currentMonth.tokenLimit) * 100;
  const costPercentage = (aiUsage.currentMonth.costKRW / aiUsage.currentMonth.budgetKRW) * 100;

  return (
    <EnterpriseLayout>
      <div className="h-full overflow-auto bg-white">
        <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#1F1F1F]">통합 관제 센터</h1>
              <p className="text-sm text-[#9AA0A6] mt-1">
                Enterprise RFP OS · 검증된 신뢰도
              </p>
            </div>
            <Button
              variant="default"
              onClick={() => navigate('/project/new')}
            >
              + New Project
            </Button>
          </div>

          {/* Action Required Section */}
          <div className="bg-white border border-[#E0E0E0] rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[#EFB81A]" />
                <h2 className="font-semibold text-[#1F1F1F]">조치 필요</h2>
                <Badge variant="destructive" className="ml-2 bg-[#D0362D] text-white">
                  {actionsRequired.reduce((sum, a) => sum + (a.count || 1), 0)}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              {actionsRequired.map((action) => (
                <button
                  key={action.id}
                  onClick={() => navigate(`/project/${action.project}`)}
                  className="w-full flex items-center justify-between p-3 rounded border border-border hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-1.5 rounded border ${getPriorityColor(action.priority)}`}>
                      {getActionIcon(action.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">{action.title}</span>
                        {action.count && (
                          <Badge variant="outline" className="text-xs">
                            {action.count}건
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{action.project}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {action.deadline && (
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">마감</div>
                        <div className="text-sm font-mono font-semibold text-foreground">
                          D-{getDaysUntil(action.deadline)}
                        </div>
                      </div>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Active Projects Table */}
            <div className="lg:col-span-2 bg-card border border-border rounded-lg">
              <div className="p-5 border-b border-border">
                <h2 className="font-semibold text-foreground">진행중인 Project</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {projects.filter(p => p.status === 'active').length}개 진행중 · 총 {projects.length}개
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr className="text-xs text-muted-foreground uppercase tracking-wider">
                      <th className="text-left py-3 px-4 font-semibold">Project</th>
                      <th className="text-center py-3 px-4 font-semibold">상태</th>
                      <th className="text-center py-3 px-4 font-semibold">D-Day</th>
                      <th className="text-center py-3 px-4 font-semibold">진행률</th>
                      <th className="text-center py-3 px-4 font-semibold">충족률</th>
                      <th className="text-center py-3 px-4 font-semibold">위험도</th>
                      <th className="text-center py-3 px-4 font-semibold">조치</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => {
                      const daysUntil = getDaysUntil(project.dueDate);
                      return (
                        <tr
                          key={project.id}
                          onClick={() => navigate(`/project/${project.id}`)}
                          className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-4">
                            <div className="font-medium text-sm text-foreground">{project.name}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {getStatusBadge(project.status)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`font-mono text-sm font-semibold ${
                              daysUntil <= 5 ? 'text-red-400' : daysUntil <= 10 ? 'text-orange-400' : 'text-foreground'
                            }`}>
                              D-{daysUntil}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-teal-500 transition-all"
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-mono font-semibold text-foreground w-10 text-right">
                                {project.progress}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`text-sm font-mono font-semibold ${
                              project.complianceCoverage >= 90 ? 'text-green-400' :
                              project.complianceCoverage >= 75 ? 'text-orange-400' : 'text-red-400'
                            }`}>
                              {project.complianceCoverage}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`text-sm font-semibold ${getRiskColor(project.riskLevel)}`}>
                              {getRiskLabel(project.riskLevel)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {project.pendingActions > 0 ? (
                              <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                                {project.pendingActions}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Usage Widget */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-blue-500" />
                  <h2 className="font-semibold text-foreground">AI 사용량</h2>
                </div>

                {/* Token Usage */}
                <div className="mb-4">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xs text-muted-foreground">토큰 (11월)</span>
                    <span className="text-sm font-mono font-semibold text-foreground">
                      {(aiUsage.currentMonth.tokensUsed / 1000000).toFixed(1)}M / {(aiUsage.currentMonth.tokenLimit / 1000000)}M
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        usagePercentage >= 90 ? 'bg-red-500' :
                        usagePercentage >= 75 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {usagePercentage.toFixed(1)}% 사용중
                  </div>
                </div>

                {/* Cost */}
                <div className="mb-4">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xs text-muted-foreground">비용 (원)</span>
                    <span className="text-sm font-mono font-semibold text-foreground">
                      ₩{aiUsage.currentMonth.costKRW.toLocaleString()} / ₩{aiUsage.currentMonth.budgetKRW.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        costPercentage >= 90 ? 'bg-red-500' :
                        costPercentage >= 75 ? 'bg-orange-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${costPercentage}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    예산의 {costPercentage.toFixed(1)}%
                  </div>
                </div>

                {/* Trend */}
                <div className="pt-4 border-t border-border">
                  <div className="text-xs text-muted-foreground mb-2">4개월 추세</div>
                  <div className="flex items-end justify-between h-16 gap-1">
                    {aiUsage.trend.map((month, idx) => {
                      const height = (month.tokens / aiUsage.currentMonth.tokenLimit) * 100;
                      return (
                        <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full bg-muted rounded-t overflow-hidden flex items-end" style={{ height: '48px' }}>
                            <div
                              className="w-full bg-blue-500/50 transition-all"
                              style={{ height: `${height}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{month.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-4 w-4 text-teal-500" />
                    <span className="text-xs text-muted-foreground">Knowledge Base</span>
                  </div>
                  <div className="text-2xl font-semibold text-foreground">1,247</div>
                  <div className="text-xs text-muted-foreground mt-1">AnswerCards</div>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-muted-foreground">Documents</span>
                  </div>
                  <div className="text-2xl font-semibold text-foreground">389</div>
                  <div className="text-xs text-muted-foreground mt-1">Analyzed</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </EnterpriseLayout>
  );
}

export default DashboardPage;