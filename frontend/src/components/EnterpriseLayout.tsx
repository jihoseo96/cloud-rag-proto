/**
 * EnterpriseLayout.tsx
 * High-density professional layout for Enterprise RFP OS
 */

import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Database,
  Settings,
  Menu,
  Shield,
  Plus,
  Folder,
  ChevronDown,
  ChevronRight,
  Archive,
  BookOpen,
  FileStack
} from 'lucide-react';
import { Button } from './ui/button';

interface EnterpriseLayoutProps {
  children: ReactNode;
  projectId?: string;
}

type Project = {
  id: string;
  name: string;
  status: 'active' | 'completed';
};

export function EnterpriseLayout({ children, projectId }: EnterpriseLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [completedExpanded, setCompletedExpanded] = useState(false);

  // Mock projects list with status
  const allProjects: Project[] = [
    { id: 'gov-cloud-rfp-2024', name: '정부 클라우드 RFP 2024', status: 'active' },
    { id: 'healthcare-system', name: '의료 시스템 통합', status: 'active' },
    { id: 'fintech-integration', name: '핀테크 플랫폼 현대화', status: 'active' },
    { id: 'smart-city-2024', name: '스마트시티 플랫폼', status: 'completed' },
    { id: 'defense-security', name: '국방 보안 시스템', status: 'completed' },
    { id: 'blockchain-2023', name: '블록체인 금융 플랫폼', status: 'completed' },
  ];

  const activeProjects = allProjects.filter(p => p.status === 'active');
  const completedProjects = allProjects.filter(p => p.status === 'completed');

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname.startsWith('/admin');
    }
    if (path.startsWith('/project/')) {
      return location.pathname.startsWith(path);
    }
    return location.pathname === path;
  };

  const renderProject = (project: Project) => {
    const active = isActive(`/project/${project.id}`);
    const firstLetter = project.name.charAt(0).toUpperCase();

    return (
      <Link
        key={project.id}
        to={`/project/${project.id}/workspace`}
        className={`
          flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-[0.8125rem] font-medium
          ${active
            ? 'bg-[#D3E3FD] text-[#0B57D0]'
            : 'text-[#424242] hover:bg-[#E8EAED]'
          }
        `}
        title={project.name}
      >
        {sidebarCollapsed ? (
          <div className={`
            h-7 w-7 rounded-full flex items-center justify-center text-[0.75rem] font-semibold flex-shrink-0
            ${active
              ? 'bg-[#0B57D0] text-white'
              : 'bg-[#E8EAED] text-[#424242]'
            }
          `}>
            {firstLetter}
          </div>
        ) : (
          <span className="truncate">{project.name}</span>
        )}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Google Workspace Style */}
      <aside
        className={`${sidebarCollapsed ? 'w-16' : 'w-[260px]'
          } bg-[#F7F7F8] border-r border-border flex flex-col transition-all duration-200`}
      >
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4 flex-shrink-0">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#0B57D0]" />
              <span className="font-semibold text-[0.9375rem] tracking-tight text-[#1F1F1F]">RFP OS</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">

          {/* Knowledge Hub Section */}
          {!sidebarCollapsed ? (
            <div className="px-3 py-2 text-[0.6875rem] uppercase tracking-wider text-[#9AA0A6] font-semibold">
              Knowledge Hub
            </div>
          ) : (
            <div className="w-full flex items-center justify-center p-2">
              <Database className="h-4 w-4 text-[#9AA0A6]" />
            </div>
          )}

          {/* Knowledge Hub Sub-items with indent */}
          <div className="space-y-1">
            <Link
              to="/knowledge/answers"
              className={`
                flex items-center gap-3 py-2 rounded-lg transition-colors text-[0.8125rem]
                ${sidebarCollapsed ? 'px-3 justify-center' : 'px-3 ml-2'}
                ${isActive('/knowledge/answers')
                  ? 'bg-[#D3E3FD] text-[#0B57D0] font-medium'
                  : 'text-[#424242] hover:bg-[#E8EAED]'
                }
              `}
            >
              <BookOpen className="h-4 w-4 flex-shrink-0" />
              {!sidebarCollapsed && <span className="truncate">Answer Library</span>}
            </Link>

            <Link
              to="/knowledge/documents"
              className={`
                flex items-center gap-3 py-2 rounded-lg transition-colors text-[0.8125rem]
                ${sidebarCollapsed ? 'px-3 justify-center' : 'px-3 ml-2'}
                ${isActive('/knowledge/documents')
                  ? 'bg-[#D3E3FD] text-[#0B57D0] font-medium'
                  : 'text-[#424242] hover:bg-[#E8EAED]'
                }
              `}
            >
              <FileStack className="h-4 w-4 flex-shrink-0" />
              {!sidebarCollapsed && <span className="truncate">Source Documents</span>}
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-border my-3" />

          {/* Projects Section Header */}
          <div className="space-y-1">
            {!sidebarCollapsed ? (
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-[0.6875rem] uppercase tracking-wider text-[#9AA0A6] font-semibold">
                  Projects
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:bg-[#E8EAED] rounded"
                  onClick={() => navigate('/project/new')}
                >
                  <Plus className="h-3.5 w-3.5 text-[#424242]" />
                </Button>
              </div>
            ) : (
              <button
                className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-[#E8EAED] transition-colors"
                onClick={() => navigate('/project/new')}
              >
                <Folder className="h-4 w-4 text-[#9AA0A6]" />
              </button>
            )}
          </div>

          {/* Active Projects - Scrollable with indent */}
          <div className="space-y-1 max-h-[calc(100vh-500px)] overflow-y-auto">
            {activeProjects.map((project) => {
              const active = isActive(`/project/${project.id}`);
              const firstLetter = project.name.charAt(0).toUpperCase();

              return (
                <Link
                  key={project.id}
                  to={`/project/${project.id}/workspace`}
                  className={`
                    flex items-center gap-3 py-2 rounded-lg transition-colors text-[0.8125rem]
                    ${sidebarCollapsed ? 'px-3' : 'px-3 ml-2'}
                    ${active
                      ? 'bg-[#D3E3FD] text-[#0B57D0] font-medium'
                      : 'text-[#424242] hover:bg-[#E8EAED]'
                    }
                  `}
                  title={project.name}
                >
                  {sidebarCollapsed ? (
                    <div className={`
                      h-7 w-7 rounded-full flex items-center justify-center text-[0.75rem] font-semibold flex-shrink-0
                      ${active
                        ? 'bg-[#0B57D0] text-white'
                        : 'bg-[#E8EAED] text-[#424242]'
                      }
                    `}>
                      {firstLetter}
                    </div>
                  ) : (
                    <>
                      <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${active ? 'bg-[#0B57D0]' : 'bg-[#9AA0A6]'}`} />
                      <span className="truncate">{project.name}</span>
                    </>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Completed Projects Folder with indent */}
          {!sidebarCollapsed && completedProjects.length > 0 && (
            <div className="pt-2 ml-2">
              <button
                onClick={() => setCompletedExpanded(!completedExpanded)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#E8EAED] transition-colors text-[0.8125rem] text-[#424242]"
              >
                {completedExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-[#9AA0A6]" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-[#9AA0A6]" />
                )}
                <Archive className="h-3.5 w-3.5 text-[#9AA0A6]" />
                <span className="flex-1 text-left">완료된 프로젝트</span>
                <span className="text-[0.75rem] text-[#9AA0A6]">{completedProjects.length}</span>
              </button>

              {completedExpanded && (
                <div className="mt-1 space-y-1 ml-4">
                  {completedProjects.map((project) => {
                    const active = isActive(`/project/${project.id}`);

                    return (
                      <Link
                        key={project.id}
                        to={`/project/${project.id}/workspace`}
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-[0.8125rem]
                          ${active
                            ? 'bg-[#D3E3FD] text-[#0B57D0] font-medium'
                            : 'text-[#424242] hover:bg-[#E8EAED]'
                          }
                        `}
                        title={project.name}
                      >
                        <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${active ? 'bg-[#0B57D0]' : 'bg-[#9AA0A6]'}`} />
                        <span className="truncate">{project.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Collapsed view - show archive icon */}
          {sidebarCollapsed && completedProjects.length > 0 && (
            <button
              onClick={() => setCompletedExpanded(!completedExpanded)}
              className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-[#E8EAED] transition-colors relative"
            >
              <Archive className="h-4 w-4 text-[#9AA0A6]" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-[#0B57D0] text-white text-[0.625rem] rounded-full flex items-center justify-center">
                {completedProjects.length}
              </span>
            </button>
          )}

          {/* Spacer */}
          <div className="h-8" />

          {/* Admin Section */}
          {!sidebarCollapsed ? (
            <div className="px-3 py-2 text-[0.6875rem] uppercase tracking-wider text-[#9AA0A6] font-semibold">
              Admin
            </div>
          ) : (
            <div className="w-full flex items-center justify-center p-2">
              <Settings className="h-4 w-4 text-[#9AA0A6]" />
            </div>
          )}

          <Link
            to="/admin"
            className={`
              flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-[0.8125rem]
              ${sidebarCollapsed ? 'justify-center' : 'ml-2'}
              ${isActive('/admin')
                ? 'bg-[#D3E3FD] text-[#0B57D0] font-medium'
                : 'text-[#424242] hover:bg-[#E8EAED]'
              }
            `}
          >
            <Settings className="h-4 w-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="truncate">Admin & Workspace</span>}
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}