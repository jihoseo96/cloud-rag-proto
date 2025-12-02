/**
 * AdminPage.tsx
 * Admin Hub with Tab Navigation
 * Modern Notion/Linear style
 */

import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { EnterpriseLayout } from '../components/EnterpriseLayout';
import {
  LayoutDashboard,
  Shield,
  Users,
  BarChart3,
  Settings,
  ChevronRight
} from 'lucide-react';

function AdminPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to dashboard if on /admin
  useEffect(() => {
    if (location.pathname === '/admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
      description: '통합 관제 센터'
    },
    {
      id: 'guardrails',
      label: 'Guardrails',
      icon: Shield,
      path: '/admin/guardrails',
      description: '보안 및 정책 관리'
    },
    {
      id: 'workspace',
      label: 'Workspace',
      icon: Users,
      path: '/admin/workspace',
      description: '워크스페이스 및 권한 관리'
    },
    {
      id: 'usage',
      label: 'Usage',
      icon: BarChart3,
      path: '/admin/usage',
      description: '사용량 통계'
    }
  ];

  const activeTab = tabs.find(tab => location.pathname.startsWith(tab.path));

  return (
    <EnterpriseLayout>
      <div className="h-full flex flex-col bg-white">
        {/* Admin Header with Breadcrumb */}
        <div className="h-14 border-b border-[#E0E0E0] flex items-center px-6">
          <div className="flex items-center gap-2 text-[0.875rem]">
            <Settings className="h-4 w-4 text-[#9AA0A6]" />
            <span className="text-[#9AA0A6]">Admin</span>
            {activeTab && (
              <>
                <ChevronRight className="h-4 w-4 text-[#9AA0A6]" />
                <span className="text-[#1F1F1F] font-medium">{activeTab.label}</span>
              </>
            )}
          </div>
        </div>

        {/* Tab Navigation - Modern Horizontal */}
        <div className="h-12 border-b border-[#E0E0E0] bg-white">
          <div className="h-full flex items-center px-6 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname.startsWith(tab.path);

              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={`
                    relative h-full px-4 flex items-center gap-2 text-[0.875rem] font-medium transition-colors
                    ${isActive
                      ? 'text-[#0B57D0]'
                      : 'text-[#424242] hover:text-[#1F1F1F]'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0B57D0]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </EnterpriseLayout>
  );
}

export default AdminPage;