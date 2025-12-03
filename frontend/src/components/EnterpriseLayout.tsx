/**
 * EnterpriseLayout.tsx
 * High-density professional layout for Enterprise RFP OS
 */

import { ReactNode, useState, useEffect } from 'react';
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
  FileStack,
  MoreHorizontal,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { projectApi } from '../api/project';
import { Project } from '../types';

interface EnterpriseLayoutProps {
  children: ReactNode;
  projectId?: string;
}

export function EnterpriseLayout({ children, projectId }: EnterpriseLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectApi.getProjects();
        setProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects", error);
      }
    };
    fetchProjects();
  }, []);

  const activeProjects = projects.filter(p => p.status === 'active' || !p.status);
  const completedProjects = projects.filter(p => p.status === 'completed');

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname.startsWith('/admin');
    }
    if (path.startsWith('/project/')) {
      return location.pathname.startsWith(path);
    }
    return location.pathname === path;
  };

  // 프로젝트 삭제 핸들러
  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      await projectApi.deleteProject(selectedProject.id);

      // 로컬 State에서 제거
      setProjects(projects.filter(p => p.id !== selectedProject.id));
      setDeleteDialogOpen(false);
      setSelectedProject(null);

      // 삭제된 프로젝트 페이지에 있었다면 홈으로 이동
      if (location.pathname.includes(selectedProject.id)) {
        navigate('/knowledge/answers');
      }
    } catch (error) {
      console.error("Failed to delete project", error);
    }
  };

  // 프로젝트 완료 핸들러
  const handleCompleteProject = async () => {
    if (!selectedProject) return;

    try {
      await projectApi.updateProjectStatus(selectedProject.id, 'completed');

      // 상태를 completed로 변경
      setProjects(projects.map(p =>
        p.id === selectedProject.id
          ? { ...p, status: 'completed' as const }
          : p
      ));
      setCompleteDialogOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error("Failed to complete project", error);
    }
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
                <div
                  key={project.id}
                  className="group relative"
                >
                  <Link
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
                        <span className="truncate flex-1">{project.name}</span>
                      </>
                    )}
                  </Link>

                  {/* Context Menu Button - visible on hover */}
                  {!sidebarCollapsed && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-[#E8EAED]"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <MoreHorizontal className="h-4 w-4 text-[#424242]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedProject(project);
                              setCompleteDialogOpen(true);
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2 text-[#0E7A4E]" />
                            프로젝트 완료
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-[#D0362D]"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedProject(project);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            프로젝트 삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
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

      {/* Delete Project Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-[#D0362D]" />
              프로젝트 삭제
            </DialogTitle>
            <DialogDescription>
              이 작업은 되돌릴 수 없습니다. 프로젝트와 관련된 모든 데이터가 영구적으로 삭제됩니다.
            </DialogDescription>
          </DialogHeader>

          {selectedProject && (
            <div className="py-4">
              <div className="bg-[#FCE8E6] border border-[#D0362D]/30 rounded-lg p-3">
                <div className="text-[0.75rem] text-[#D0362D] mb-2 font-semibold">
                  삭제할 프로젝트
                </div>
                <div className="text-[0.875rem] text-[#1F1F1F] font-medium">
                  {selectedProject.name}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
            >
              영구 삭제
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete Project Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#0E7A4E]" />
              프로젝트 완료
            </DialogTitle>
            <DialogDescription>
              프로젝트를 완료 처리하시겠습니까? 완료된 프로젝트는 "완료된 프로젝트" 폴더로 이동됩니다.
            </DialogDescription>
          </DialogHeader>

          {selectedProject && (
            <div className="py-4">
              <div className="bg-[#F7F7F8] rounded-lg p-3">
                <div className="text-[0.75rem] text-[#9AA0A6] mb-2">
                  프로젝트 정보
                </div>
                <div className="text-[0.875rem] text-[#1F1F1F] font-medium">
                  {selectedProject.name}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setCompleteDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              onClick={handleCompleteProject}
            >
              완료 처리
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}