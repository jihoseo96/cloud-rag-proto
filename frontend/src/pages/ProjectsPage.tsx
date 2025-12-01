/**
 * ProjectsPage.tsx
 * Projects List & Empty State with Onboarding
 */

import { EnterpriseLayout } from '../components/EnterpriseLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  FolderOpen,
  Plus,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  FileText,
  Upload,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProjectsPage() {
  // Change this to false to see empty state
  const hasProjects = true;

  // Mock data
  const projects = [
    {
      id: 'gov-cloud-rfp-2024',
      name: '정부 클라우드 RFP 2024',
      client: '디지털부',
      status: 'active',
      dueDate: '2024-12-15',
      progress: 75,
      cardsGenerated: 34,
      requirementsMapped: 28,
      conflicts: 2,
      lastActivity: '2시간 전'
    },
    {
      id: 'healthcare-system',
      name: '의료 시스템 통합',
      client: '국민건강보험공단',
      status: 'active',
      dueDate: '2024-12-20',
      progress: 45,
      cardsGenerated: 19,
      requirementsMapped: 15,
      conflicts: 5,
      lastActivity: '1일 전'
    },
    {
      id: 'fintech-integration',
      name: '핀테크 플랫폼 현대화',
      client: '한국산업은행',
      status: 'draft',
      dueDate: '2025-01-10',
      progress: 12,
      cardsGenerated: 8,
      requirementsMapped: 3,
      conflicts: 0,
      lastActivity: '3일 전'
    },
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge variant="outline" className="bg-[#0E7A4E]/10 text-[#0E7A4E] border-[#0E7A4E]/30 text-[0.6875rem]">진행중</Badge>;
      case 'draft':
        return <Badge variant="outline" className="bg-[#9AA0A6]/10 text-[#424242] border-[#E0E0E0] text-[0.6875rem]">작성중</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-[#0B57D0]/10 text-[#0B57D0] border-[#0B57D0]/30 text-[0.6875rem]">완료</Badge>;
      default:
        return null;
    }
  };

  // Empty state
  if (!hasProjects) {
    return (
      <EnterpriseLayout>
        <div className="h-full flex flex-col bg-white">
          {/* Header */}
          <div className="h-14 border-b border-[#E0E0E0] bg-white flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <h1 className="font-semibold text-[0.9375rem] text-[#1F1F1F]">Projects</h1>
            </div>
          </div>

          {/* Empty State with Onboarding */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-2xl text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0B57D0]/10 mb-6">
                <FolderOpen className="h-8 w-8 text-[#0B57D0]" />
              </div>
              
              <h2 className="text-[1.5rem] font-semibold mb-3 text-[#1F1F1F]">
                RFP 제안서 작성을 시작하세요
              </h2>
              
              <p className="text-[0.9375rem] text-muted-foreground mb-8 max-w-lg mx-auto">
                Enterprise RFP OS는 AI 기반으로 제안서 작성을 자동화합니다.
                <br />
                문서를 업로드하면 자동으로 AnswerCard를 생성하고 요구사항과 매핑합니다.
              </p>

              {/* Quick Start Steps */}
              <div className="grid grid-cols-3 gap-4 mb-8 text-left">
                <div className="bg-card border border-border rounded-lg p-5">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#14b8a6]/10 mb-4">
                    <span className="text-[#14b8a6] font-semibold">1</span>
                  </div>
                  <h3 className="font-semibold text-[0.9375rem] mb-2">Project 생성</h3>
                  <p className="text-[0.8125rem] text-muted-foreground">
                    RFP 정보를 입력하고 프로젝트를 생성합니다
                  </p>
                </div>

                <div className="bg-card border border-border rounded-lg p-5">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#14b8a6]/10 mb-4">
                    <span className="text-[#14b8a6] font-semibold">2</span>
                  </div>
                  <h3 className="font-semibold text-[0.9375rem] mb-2">문서 업로드</h3>
                  <p className="text-[0.8125rem] text-muted-foreground">
                    사내 문서를 업로드하면 AI가 분석합니다
                  </p>
                </div>

                <div className="bg-card border border-border rounded-lg p-5">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#14b8a6]/10 mb-4">
                    <span className="text-[#14b8a6] font-semibold">3</span>
                  </div>
                  <h3 className="font-semibold text-[0.9375rem] mb-2">제안서 생성</h3>
                  <p className="text-[0.8125rem] text-muted-foreground">
                    자동 생성된 Skeleton을 편집합니다
                  </p>
                </div>
              </div>

              {/* CTA */}
              <Link to="/project/new">
                <Button size="lg" className="bg-[#14b8a6] hover:bg-[#14b8a6]/90 h-11">
                  <Plus className="h-4 w-4 mr-2" />
                  첫 Project 만들기
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>

              {/* Additional Resources */}
              <div className="mt-8 pt-8 border-t border-border">
                <p className="text-[0.8125rem] text-muted-foreground mb-4">
                  먼저 지식 베이스를 구축하시겠습니까?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link to="/knowledge">
                    <Button variant="outline" size="sm" className="h-9">
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      문서 업로드
                    </Button>
                  </Link>
                  <Link to="/admin/guardrails">
                    <Button variant="outline" size="sm" className="h-9">
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                      Guardrails 설정
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </EnterpriseLayout>
    );
  }

  // Projects list view
  return (
    <EnterpriseLayout>
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="h-14 border-b border-[#E0E0E0] bg-white flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-[0.9375rem] text-[#1F1F1F]">Projects</h1>
            <Badge variant="outline" className="text-[0.6875rem] bg-[#0B57D0]/10 text-[#0B57D0] border-[#0B57D0]/30">{projects.length}개 진행중</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/project/new">
              <Button size="sm" className="h-8">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                새 Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/project/${project.id}/workspace`}
                className="block bg-white border border-[#E0E0E0] rounded-lg p-5 hover:border-[#0B57D0] hover:shadow-minimal transition-all group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FolderOpen className="h-5 w-5 text-[#0B57D0]" />
                      <h3 className="font-semibold text-[0.9375rem] text-[#1F1F1F] group-hover:text-[#0B57D0] transition-colors">
                        {project.name}
                      </h3>
                      {getStatusBadge(project.status)}
                    </div>
                    <p className="text-[0.8125rem] text-[#9AA0A6]">
                      {project.client}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[0.75rem] text-[#9AA0A6] mb-1">마감일</div>
                    <div className="text-[0.8125rem] font-semibold text-[#1F1F1F] mono">
                      {project.dueDate}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[0.75rem] text-[#9AA0A6]">진행률</span>
                    <span className="text-[0.75rem] font-semibold text-[#0B57D0] mono">{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-[#F7F7F8] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#0B57D0] transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#0B57D0]" />
                    <div>
                      <div className="text-[0.6875rem] text-[#9AA0A6]">카드</div>
                      <div className="text-[0.8125rem] font-semibold text-[#1F1F1F]">{project.cardsGenerated}개</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#0E7A4E]" />
                    <div>
                      <div className="text-[0.6875rem] text-[#9AA0A6]">매핑완료</div>
                      <div className="text-[0.8125rem] font-semibold text-[#1F1F1F]">{project.requirementsMapped}개</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className={`h-4 w-4 ${project.conflicts > 0 ? 'text-[#EFB81A]' : 'text-[#9AA0A6]'}`} />
                    <div>
                      <div className="text-[0.6875rem] text-[#9AA0A6]">충돌</div>
                      <div className={`text-[0.8125rem] font-semibold ${project.conflicts > 0 ? 'text-[#EFB81A]' : 'text-[#1F1F1F]'}`}>{project.conflicts}건</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#9AA0A6]" />
                    <div>
                      <div className="text-[0.6875rem] text-[#9AA0A6]">마지막 활동</div>
                      <div className="text-[0.8125rem] font-semibold text-[#1F1F1F]">{project.lastActivity}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </EnterpriseLayout>
  );
}