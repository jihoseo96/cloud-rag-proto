/**
 * Routes Configuration - Enterprise RFP OS
 * 
 * Application routing structure
 * v2025.11.30 - Admin tab structure + Requirement Detail
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import ProjectWorkspacePage from '../pages/ProjectWorkspacePage';
import RequirementDetailPage from '../pages/RequirementDetailPage';
import DocumentsPage from '../pages/DocumentsPage';
import KnowledgeHubPage from '../pages/KnowledgeHubPage';
import ProjectsPage from '../pages/ProjectsPage';

// Admin Pages with Tab Navigation
import AdminPage from '../pages/AdminPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminGuardrailsPage from '../pages/AdminGuardrailsPage';
import AdminTeamPage from '../pages/AdminTeamPage';
import AdminUsagePage from '../pages/AdminUsagePage';

// Legacy pages (kept for backward compatibility)
import AnswerCardsPage from '../pages/AnswerCardsPage';
import ConflictsPage from '../pages/ConflictsPage';
import RequirementsPage from '../pages/RequirementsPage';
import AuditPage from '../pages/AuditPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Redirect root to admin dashboard */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      
      {/* Projects */}
      <Route path="/projects" element={<ProjectsPage />} />
      
      {/* New Project - Landing & Onboarding */}
      <Route path="/project/new" element={<LandingPage />} />
      
      {/* Project Workspace - Requirements Matrix */}
      <Route path="/project/:projectId/workspace" element={<ProjectWorkspacePage />} />
      
      {/* Requirement Detail Page */}
      <Route path="/project/:projectId/requirement/:requirementId" element={<RequirementDetailPage />} />
      
      {/* Documents (renamed from Upload) */}
      <Route path="/project/:projectId/documents" element={<DocumentsPage />} />
      
      {/* Knowledge Hub - Answer Library + Source Documents */}
      <Route path="/knowledge" element={<KnowledgeHubPage />} />
      
      {/* Admin Hub with Tab Navigation */}
      <Route path="/admin" element={<AdminPage />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="guardrails" element={<AdminGuardrailsPage />} />
        <Route path="team" element={<AdminTeamPage />} />
        <Route path="usage" element={<AdminUsagePage />} />
      </Route>
      
      {/* Legacy Project Routes (kept for backward compatibility) */}
      <Route path="/project/:projectId/cards" element={<AnswerCardsPage />} />
      <Route path="/project/:projectId/requirements" element={<RequirementsPage />} />
      <Route path="/project/:projectId/conflicts" element={<ConflictsPage />} />
      <Route path="/project/:projectId/audit" element={<AuditPage />} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}