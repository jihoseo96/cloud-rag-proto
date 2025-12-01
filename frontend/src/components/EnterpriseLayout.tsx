/**
 * EnterpriseLayout.tsx
 * High-density professional layout for Enterprise RFP OS
 */

import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Upload, 
  Database, 
  AlertTriangle,
  FileText,
  Clock,
  Settings,
  Menu,
  Shield,
  Plus,
  Folder
} from 'lucide-react';
import { Button } from './ui/button';

interface EnterpriseLayoutProps {
  children: ReactNode;
  projectId?: string;
}

export function EnterpriseLayout({ children, projectId }: EnterpriseLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Mock projects list
  const projects = [
    { id: 'gov-cloud-rfp-2024', name: '정부 클라우드 RFP 2024' },
    { id: 'healthcare-system', name: '의료 시스템 통합' },
    { id: 'fintech-integration', name: '핀테크 플랫폼 현대화' },
    { id: 'smart-city-2024', name: '스마트시티 플랫폼' },
    { id: 'defense-security', name: '국방 보안 시스템' },
  ];
  
  const isActive = (path: string) => {
    // Special handling for /admin routes
    if (path === '/admin') {
      return location.pathname.startsWith('/admin');
    }
    if (path.startsWith('/project/')) {
      return location.pathname.startsWith(path);
    }
    return location.pathname === path;
  };
  
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Google Workspace Style */}
      <aside 
        className={`${
          sidebarCollapsed ? 'w-16' : 'w-[260px]'
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
          
          {/* Knowledge Hub - Top */}
          <Link
            to="/knowledge"
            className={`
              flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-[0.8125rem] font-medium
              ${isActive('/knowledge')
                ? 'bg-[#D3E3FD] text-[#0B57D0]' 
                : 'text-[#424242] hover:bg-[#E8EAED]'
              }
            `}
          >
            <Database className="h-4 w-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Knowledge Hub</span>}
          </Link>

          {/* Divider */}
          <div className="h-4" />

          {/* Projects Section Header */}
          <div className="space-y-1">
            {!sidebarCollapsed ? (
              <div className="px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-[#9AA0A6]" />
                  <span className="text-[0.6875rem] uppercase tracking-wider text-[#9AA0A6] font-semibold">
                    Projects
                  </span>
                </div>
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
          
          {/* Projects List - Scrollable */}
          <div className="space-y-1 max-h-[calc(100vh-400px)] overflow-y-auto">
            {projects.map((project) => {
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
            })}
          </div>

          {/* Spacer */}
          <div className="h-8" />

          {/* Admin Section - Bottom */}
          <div className="border-t border-border pt-3">
            {!sidebarCollapsed && (
              <div className="px-3 py-2 text-[0.6875rem] uppercase tracking-wider text-[#9AA0A6] font-semibold">
                Admin
              </div>
            )}
            <Link
              to="/admin"
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-[0.8125rem] font-medium
                ${isActive('/admin')
                  ? 'bg-[#D3E3FD] text-[#0B57D0]' 
                  : 'text-[#424242] hover:bg-[#E8EAED]'
                }
              `}
            >
              <Settings className="h-4 w-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>Admin & Team</span>}
            </Link>
          </div>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}