/**
 * Routes Configuration
 * 
 * 애플리케이션의 라우팅 구조 정의
 */

import { Routes, Route } from 'react-router-dom';
import WorkspacePage from '../pages/WorkspacePage';
import TeamManagementPage from '../pages/TeamManagementPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Main Workspace / Chat Page */}
      <Route path="/" element={<WorkspacePage />} />
      
      {/* Team Management Pages */}
      <Route path="/team/create" element={<TeamManagementPage />} />
      <Route path="/team/:teamId/management" element={<TeamManagementPage />} />
      
      {/* Fallback */}
      <Route path="*" element={<WorkspacePage />} />
    </Routes>
  );
}
