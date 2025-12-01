/**
 * AdminDashboardPage.tsx
 * Admin Dashboard - Command Center
 * Relocated from main dashboard to Admin section
 */

import { useState } from 'react';
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
  Zap,
  Shield,
  Eye
} from 'lucide-react';

interface ActionRequired {
  id: string;
  type: 'approval' | 'conflict' | 'risk';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  project: string;
  timestamp: Date;
}

interface SystemMetric {
  label: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down';
  icon: any;
  color: string;
}

function AdminDashboardPage() {
  const navigate = useNavigate();

  // Mock Data
  const actionsRequired: ActionRequired[] = [
    {
      id: '1',
      type: 'risk',
      priority: 'high',
      title: 'High Risk 답변 카드 검토 필요',
      description: '금지어 포함된 답변 카드 3건 발견',
      project: '2024 국방부 RFP',
      timestamp: new Date('2024-11-30T10:30:00')
    },
    {
      id: '2',
      type: 'conflict',
      priority: 'medium',
      title: '중복 답변 카드 발견',
      description: 'ISO 27001 인증 관련 답변 카드 2건 중복',
      project: '서울시 스마트시티',
      timestamp: new Date('2024-11-30T09:15:00')
    },
    {
      id: '3',
      type: 'approval',
      priority: 'medium',
      title: '신규 답변 승인 대기중',
      description: '5건의 AI 생성 답변이 승인 대기중',
      project: '금융권 클라우드',
      timestamp: new Date('2024-11-29T16:45:00')
    }
  ];

  const metrics: SystemMetric[] = [
    {
      label: '전체 프로젝트',
      value: 28,
      unit: '개',
      change: 12.5,
      trend: 'up',
      icon: FileText,
      color: '#0B57D0'
    },
    {
      label: '활성 사용자',
      value: 12,
      unit: '명',
      change: -2.1,
      trend: 'down',
      icon: Users,
      color: '#0E7A4E'
    },
    {
      label: '답변 카드',
      value: 456,
      unit: '개',
      change: 18.3,
      trend: 'up',
      icon: Database,
      color: '#EFB81A'
    },
    {
      label: '평균 적합도',
      value: 87,
      unit: '%',
      change: 5.2,
      trend: 'up',
      icon: Activity,
      color: '#0B57D0'
    }
  ];

  const recentActivity = [
    {
      id: '1',
      action: 'Project Created',
      user: 'john.doe@company.com',
      project: '2024 국방부 RFP',
      timestamp: new Date('2024-11-30T14:20:00')
    },
    {
      id: '2',
      action: 'Answer Card Approved',
      user: 'jane.smith@company.com',
      project: '서울시 스마트시티',
      timestamp: new Date('2024-11-30T13:45:00')
    },
    {
      id: '3',
      action: 'Conflict Resolved',
      user: 'alice.j@company.com',
      project: '금융권 클라우드',
      timestamp: new Date('2024-11-30T12:30:00')
    },
    {
      id: '4',
      action: 'Document Uploaded',
      user: 'bob.w@company.com',
      project: '헬스케어 통합',
      timestamp: new Date('2024-11-30T11:15:00')
    }
  ];

  const getActionIcon = (type: ActionRequired['type']) => {
    switch (type) {
      case 'risk':
        return <AlertTriangle className="h-5 w-5 text-[#D0362D]" />;
      case 'conflict':
        return <AlertCircle className="h-5 w-5 text-[#EFB81A]" />;
      case 'approval':
        return <Clock className="h-5 w-5 text-[#0B57D0]" />;
    }
  };

  const getPriorityBadge = (priority: ActionRequired['priority']) => {
    const configs = {
      high: { label: 'High', class: 'bg-[#D0362D]/10 text-[#D0362D] border-[#D0362D]/30' },
      medium: { label: 'Medium', class: 'bg-[#EFB81A]/10 text-[#EFB81A] border-[#EFB81A]/30' },
      low: { label: 'Low', class: 'bg-[#9AA0A6]/10 text-[#424242] border-[#E0E0E0]' }
    };
    const config = configs[priority];
    return <Badge variant="outline" className={`${config.class} text-[0.6875rem]`}>{config.label}</Badge>;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div className="h-full overflow-auto bg-white">
      <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[1.5rem] font-semibold text-[#1F1F1F]">통합 관제 센터</h1>
            <p className="text-[0.875rem] text-[#9AA0A6] mt-1">
              Enterprise RFP OS · 실시간 모니터링
            </p>
          </div>
          <Button onClick={() => navigate('/project/new')}>
            + New Project
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-4">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div
                key={idx}
                className="border border-[#E0E0E0] rounded-lg p-5 hover:shadow-minimal transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div 
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${metric.color}15` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: metric.color }} />
                  </div>
                  <div className={`flex items-center gap-1 text-[0.75rem] font-semibold ${
                    metric.trend === 'up' ? 'text-[#0E7A4E]' : 'text-[#D0362D]'
                  }`}>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {metric.change}%
                  </div>
                </div>
                <div className="text-[0.75rem] text-[#9AA0A6] uppercase tracking-wider mb-1">
                  {metric.label}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[1.75rem] font-semibold text-[#1F1F1F] mono">
                    {metric.value}
                  </span>
                  <span className="text-[0.875rem] text-[#9AA0A6]">
                    {metric.unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-4">
          
          {/* Actions Required - 2/3 width */}
          <div className="col-span-2 border border-[#E0E0E0] rounded-lg">
            <div className="p-5 border-b border-[#E0E0E0] flex items-center justify-between">
              <h2 className="text-[0.9375rem] font-semibold text-[#1F1F1F]">
                조치 필요 항목
              </h2>
              <Badge variant="outline" className="bg-[#D0362D]/10 text-[#D0362D] border-[#D0362D]/30">
                {actionsRequired.length}건
              </Badge>
            </div>
            <div className="divide-y divide-[#E0E0E0]">
              {actionsRequired.map((action) => (
                <div
                  key={action.id}
                  className="p-5 hover:bg-[#F7F7F8] transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getActionIcon(action.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-[0.875rem] font-semibold text-[#1F1F1F]">
                          {action.title}
                        </h3>
                        {getPriorityBadge(action.priority)}
                      </div>
                      <p className="text-[0.8125rem] text-[#424242] mb-2">
                        {action.description}
                      </p>
                      <div className="flex items-center gap-3 text-[0.75rem] text-[#9AA0A6]">
                        <span>{action.project}</span>
                        <span>·</span>
                        <span>{formatTimeAgo(action.timestamp)}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status - 1/3 width */}
          <div className="border border-[#E0E0E0] rounded-lg">
            <div className="p-5 border-b border-[#E0E0E0]">
              <h2 className="text-[0.9375rem] font-semibold text-[#1F1F1F]">
                시스템 상태
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#0E7A4E]" />
                  <span className="text-[0.8125rem] text-[#424242]">API Status</span>
                </div>
                <Badge className="bg-[#0E7A4E]/10 text-[#0E7A4E] border-[#0E7A4E]/30">
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#0E7A4E]" />
                  <span className="text-[0.8125rem] text-[#424242]">Database</span>
                </div>
                <Badge className="bg-[#0E7A4E]/10 text-[#0E7A4E] border-[#0E7A4E]/30">
                  Healthy
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#EFB81A]" />
                  <span className="text-[0.8125rem] text-[#424242]">AI Processing</span>
                </div>
                <Badge className="bg-[#EFB81A]/10 text-[#EFB81A] border-[#EFB81A]/30">
                  High Load
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#0E7A4E]" />
                  <span className="text-[0.8125rem] text-[#424242]">Storage</span>
                </div>
                <Badge className="bg-[#0E7A4E]/10 text-[#0E7A4E] border-[#0E7A4E]/30">
                  23% Used
                </Badge>
              </div>
              
              <div className="pt-4 border-t border-[#E0E0E0]">
                <div className="text-[0.75rem] text-[#9AA0A6] mb-2">평균 응답 시간</div>
                <div className="text-[1.5rem] font-semibold text-[#0B57D0] mono">
                  234ms
                </div>
              </div>

              <div className="pt-4 border-t border-[#E0E0E0]">
                <div className="text-[0.75rem] text-[#9AA0A6] mb-2">오늘 API 호출</div>
                <div className="text-[1.5rem] font-semibold text-[#1F1F1F] mono">
                  8,934
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="border border-[#E0E0E0] rounded-lg">
          <div className="p-5 border-b border-[#E0E0E0]">
            <h2 className="text-[0.9375rem] font-semibold text-[#1F1F1F]">
              최근 활동
            </h2>
          </div>
          <div className="divide-y divide-[#E0E0E0]">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="p-5 hover:bg-[#F7F7F8] transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-8 w-8 rounded-full bg-[#0B57D0]/10 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-[#0B57D0]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[0.875rem] font-medium text-[#1F1F1F]">
                        {activity.action}
                      </span>
                      <span className="text-[0.75rem] text-[#9AA0A6]">·</span>
                      <span className="text-[0.75rem] text-[#9AA0A6]">
                        {activity.project}
                      </span>
                    </div>
                    <div className="text-[0.75rem] text-[#9AA0A6]">
                      {activity.user}
                    </div>
                  </div>
                </div>
                <div className="text-[0.75rem] text-[#9AA0A6]">
                  {formatTimeAgo(activity.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
