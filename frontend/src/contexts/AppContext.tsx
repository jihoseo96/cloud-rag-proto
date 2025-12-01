/**
 * AppContext - Enterprise RFP OS
 * 
 * Global state management for RFP knowledge operating system
 * v2025.11.28
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Project,
  AnswerCard,
  RFPRequirement,
  DocumentUpload,
  Conflict,
  ProposalTemplate,
  Proposal,
  AuditLog,
  ProjectAnalytics,
  DashboardMetrics,
  Workspace,
} from '../types';

interface AppContextType {
  // Projects
  projects: Project[];
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  createProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  
  // Answer Cards
  answerCards: AnswerCard[];
  getCardsByProject: (projectId: string) => AnswerCard[];
  createAnswerCard: (card: Omit<AnswerCard, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAnswerCard: (id: string, updates: Partial<AnswerCard>) => void;
  
  // Requirements
  requirements: RFPRequirement[];
  getRequirementsByProject: (projectId: string) => RFPRequirement[];
  
  // Documents
  documents: DocumentUpload[];
  uploadDocument: (doc: Omit<DocumentUpload, 'id' | 'uploadedAt'>) => void;
  
  // Conflicts
  conflicts: Conflict[];
  getConflictsByProject: (projectId: string) => Conflict[];
  resolveConflict: (id: string, resolution: string, userId: string) => void;
  
  // Proposals
  proposals: Proposal[];
  templates: ProposalTemplate[];
  
  // Analytics
  dashboardMetrics: DashboardMetrics;
  getProjectAnalytics: (projectId: string) => ProjectAnalytics | null;
  
  // Audit
  auditLogs: AuditLog[];
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  
  // Workspace
  currentWorkspace: Workspace;
  
  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ============================================
// Mock Data
// ============================================

const mockWorkspace: Workspace = {
  id: 'ws-1',
  name: 'Personal Workspace',
  type: 'personal',
  createdAt: new Date('2024-11-01'),
};

const mockProjects: Project[] = [
  {
    id: 'proj-1',
    workspace: 'personal',
    groupId: 'group-1',
    name: '2024 국방부 RFP - 보안시스템 구축',
    industry: 'defense',
    rfpType: 'technical',
    evaluationCriteria: {
      technical: 40,
      price: 30,
      management: 20,
      social: 10,
    },
    requiredDocuments: ['사업자등록증', '기술제안서', '견적서'],
    prohibitedPhrases: ['100% 보장', '절대', '최고'],
    createdAt: new Date('2024-11-15'),
    ownerId: 'user-1',
    status: 'active',
    dueDate: new Date('2024-12-31'),
    complianceCoverage: 72,
  },
  {
    id: 'proj-2',
    workspace: 'personal',
    groupId: 'group-1',
    name: '서울시 스마트시티 플랫폼 제안',
    industry: 'public',
    rfpType: 'technical',
    evaluationCriteria: {},
    requiredDocuments: [],
    prohibitedPhrases: [],
    createdAt: new Date('2024-11-20'),
    ownerId: 'user-1',
    status: 'active',
    complianceCoverage: 45,
  },
  {
    id: 'proj-3',
    workspace: 'personal',
    groupId: 'group-1',
    name: '금융권 클라우드 전환 컨설팅',
    industry: 'finance',
    rfpType: 'consulting',
    evaluationCriteria: {},
    requiredDocuments: [],
    prohibitedPhrases: [],
    createdAt: new Date('2024-11-10'),
    ownerId: 'user-1',
    status: 'completed',
    complianceCoverage: 98,
  },
];

const mockAnswerCards: AnswerCard[] = [
  {
    id: 'card-1',
    projectId: 'proj-1',
    topic: '보안 인증 현황',
    description: 'ISO27001, ISMS-P 인증 보유',
    anchors: [
      {
        contentHash: 'sha256-abc123',
        textSnippet: '당사는 ISO27001 및 ISMS-P 인증을 보유하고 있습니다.',
        anchorConfidence: 0.95,
        docId: 'doc-1',
        sectionPath: '3.1 보안 인증',
        page: 5,
        bbox: [100, 200, 500, 350],
        anchorType: 'semantic',
      },
    ],
    facts: {
      iso27001: true,
      ismsP: true,
      certDate: '2023-01-15',
      validUntil: '2026-01-14',
    },
    variants: [
      {
        id: 'var-1',
        content: '당사는 정보보호 관리체계 인증(ISMS-P)과 국제 정보보안 인증(ISO27001)을 보유하고 있으며, 정기적인 갱신을 통해 최신 보안 기준을 준수하고 있습니다.',
        context: 'public-sector',
        status: 'APPROVED',
        riskLevel: 'SAFE',
        usageCount: 15,
        approvedBy: 'manager@company.com',
        approvedAt: new Date('2024-11-16'),
        createdAt: new Date('2024-11-15'),
        createdBy: 'user-1',
      },
      {
        id: 'var-2',
        content: '우리 회사는 최고 수준의 보안 인증을 보유하고 있습니다!',
        context: 'sales-pitch',
        status: 'REJECTED',
        riskLevel: 'HIGH',
        usageCount: 0,
        rejectedBy: 'manager@company.com',
        rejectedAt: new Date('2024-11-16'),
        createdAt: new Date('2024-11-15'),
        createdBy: 'user-2',
      },
    ],
    tags: ['보안', '인증', 'ISO27001', 'ISMS-P'],
    category: 'security',
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-11-16'),
    overallConfidence: 0.95,
  },
  {
    id: 'card-2',
    projectId: 'proj-1',
    topic: 'SLA 및 운영 가용성',
    description: '99.9% 가용성 보장, 24/7 모니터링',
    anchors: [
      {
        contentHash: 'sha256-def456',
        textSnippet: '연간 99.9% 가용성을 제공하며...',
        anchorConfidence: 0.88,
        docId: 'doc-2',
        sectionPath: '4.2 SLA',
        page: 12,
        anchorType: 'semantic',
      },
    ],
    facts: {
      sla: 99.9,
      monitoring: '24/7',
      responseTime: '15min',
    },
    variants: [
      {
        id: 'var-3',
        content: '당사는 연간 99.9% 가용성을 보장하며, 24시간 365일 모니터링 체계를 통해 장애 발생 시 15분 이내 대응합니다.',
        context: 'public-sector',
        status: 'APPROVED',
        riskLevel: 'SAFE',
        usageCount: 8,
        approvedBy: 'manager@company.com',
        approvedAt: new Date('2024-11-17'),
        createdAt: new Date('2024-11-17'),
        createdBy: 'user-1',
      },
    ],
    tags: ['SLA', '가용성', '모니터링'],
    category: 'operations',
    createdAt: new Date('2024-11-17'),
    updatedAt: new Date('2024-11-17'),
    overallConfidence: 0.88,
  },
];

const mockRequirements: RFPRequirement[] = [
  {
    id: 'req-1',
    projectId: 'proj-1',
    requirementText: '정보보호 관리체계(ISMS-P) 인증 보유 필수',
    requirementType: 'security',
    complianceLevel: 'YES',
    linkedAnswerCards: ['card-1'],
    anchorConfidence: 0.95,
    priority: 'high',
    section: '가. 사업자 자격요건',
  },
  {
    id: 'req-2',
    projectId: 'proj-1',
    requirementText: '시스템 가용성 99.5% 이상 보장',
    requirementType: 'technical',
    complianceLevel: 'YES',
    linkedAnswerCards: ['card-2'],
    anchorConfidence: 0.88,
    priority: 'high',
    section: '나. 기술 요구사항',
  },
  {
    id: 'req-3',
    projectId: 'proj-1',
    requirementText: '24시간 장애 대응 체계 구축',
    requirementType: 'operations',
    complianceLevel: 'PARTIAL',
    linkedAnswerCards: ['card-2'],
    anchorConfidence: 0.7,
    priority: 'medium',
    section: '나. 기술 요구사항',
  },
  {
    id: 'req-4',
    projectId: 'proj-1',
    requirementText: '개인정보보호 관련 법령 준수',
    requirementType: 'compliance',
    complianceLevel: 'UNKNOWN',
    linkedAnswerCards: [],
    anchorConfidence: 0,
    priority: 'high',
    section: '다. 법적 요구사항',
  },
];

const mockDocuments: DocumentUpload[] = [
  {
    id: 'doc-1',
    projectId: 'proj-1',
    fileName: '회사소개서_2024.pdf',
    fileSize: 2458624,
    fileType: 'application/pdf',
    uploadedAt: new Date('2024-11-15T10:30:00'),
    uploadedBy: 'user-1',
    status: 'completed',
    processingSteps: [
      { step: '파일 업로드', status: 'completed', progress: 100, completedAt: new Date('2024-11-15T10:30:10') },
      { step: '텍스트 추출', status: 'completed', progress: 100, completedAt: new Date('2024-11-15T10:30:25') },
      { step: '섹션 분석', status: 'completed', progress: 100, completedAt: new Date('2024-11-15T10:30:40') },
      { step: 'AnswerCard 생성', status: 'completed', progress: 100, completedAt: new Date('2024-11-15T10:31:00') },
    ],
    s3Url: 'https://s3.amazonaws.com/bucket/doc-1.pdf',
    generatedCards: ['card-1'],
  },
  {
    id: 'doc-2',
    projectId: 'proj-1',
    fileName: 'SLA_운영계획서.hwp',
    fileSize: 1234567,
    fileType: 'application/x-hwp',
    uploadedAt: new Date('2024-11-17T14:20:00'),
    uploadedBy: 'user-1',
    status: 'completed',
    processingSteps: [
      { step: '파일 업로드', status: 'completed', progress: 100 },
      { step: '텍스트 추출', status: 'completed', progress: 100 },
      { step: '섹션 분석', status: 'completed', progress: 100 },
      { step: 'AnswerCard 생성', status: 'completed', progress: 100 },
    ],
    generatedCards: ['card-2'],
  },
];

const mockConflicts: Conflict[] = [
  {
    id: 'conflict-1',
    projectId: 'proj-1',
    type: 'duplicate',
    severity: 'medium',
    entities: [
      { type: 'answer-card', id: 'card-1', label: '보안 인증 현황 (회사소개서)', confidence: 0.95, date: new Date('2024-11-15') },
      { type: 'answer-card', id: 'card-x', label: '보안 인증 현황 (기술제안서)', confidence: 0.87, date: new Date('2024-11-18') },
    ],
    suggestedResolution: 'keep-newest',
    status: 'pending',
  },
];

const mockTemplates: ProposalTemplate[] = [
  {
    id: 'template-1',
    name: '공공기관 기술제안서 (국방)',
    industry: 'defense',
    rfpType: 'technical',
    sectionOrder: [
      { id: 's1', title: '1. 회사 개요', description: '회사 소개 및 연혁', recommendedCards: [], order: 1, isRequired: true },
      { id: 's2', title: '2. 보안 및 인증', description: '보안 인증 현황', recommendedCards: ['보안 인증'], order: 2, isRequired: true },
      { id: 's3', title: '3. 기술 역량', description: '기술 스택 및 경험', recommendedCards: [], order: 3, isRequired: true },
      { id: 's4', title: '4. 사업 수행 계획', description: 'SLA, 운영 계획', recommendedCards: ['SLA'], order: 4, isRequired: true },
      { id: 's5', title: '5. 유지보수 계획', description: '유지보수 및 지원', recommendedCards: [], order: 5, isRequired: false },
    ],
    createdAt: new Date('2024-01-01'),
    isDefault: true,
  },
];

const mockAuditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    entityType: 'variant',
    entityId: 'var-1',
    action: 'approve',
    userId: 'user-manager',
    userEmail: 'manager@company.com',
    timestamp: new Date('2024-11-16T09:30:00'),
    metadata: { cardId: 'card-1', topic: '보안 인증 현황' },
  },
  {
    id: 'audit-2',
    entityType: 'variant',
    entityId: 'var-2',
    action: 'reject',
    userId: 'user-manager',
    userEmail: 'manager@company.com',
    timestamp: new Date('2024-11-16T09:32:00'),
    metadata: { cardId: 'card-1', reason: 'High Risk - 과장된 표현' },
  },
  {
    id: 'audit-3',
    entityType: 'upload',
    entityId: 'doc-1',
    action: 'upload',
    userId: 'user-1',
    userEmail: 'user@company.com',
    timestamp: new Date('2024-11-15T10:30:00'),
    metadata: { fileName: '회사소개서_2024.pdf', fileSize: 2458624 },
  },
];

// ============================================
// Provider Component
// ============================================

export function AppProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(mockProjects[0]);
  const [answerCards, setAnswerCards] = useState<AnswerCard[]>(mockAnswerCards);
  const [requirements, setRequirements] = useState<RFPRequirement[]>(mockRequirements);
  const [documents, setDocuments] = useState<DocumentUpload[]>(mockDocuments);
  const [conflicts, setConflicts] = useState<Conflict[]>(mockConflicts);
  const [proposals] = useState<Proposal[]>([]);
  const [templates] = useState<ProposalTemplate[]>(mockTemplates);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const createProject = (project: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...project,
      id: `proj-${Date.now()}`,
      createdAt: new Date(),
    };
    setProjects(prev => [newProject, ...prev]);
    setSelectedProject(newProject);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    if (selectedProject?.id === id) {
      setSelectedProject(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const getCardsByProject = (projectId: string) => {
    return answerCards.filter(card => card.projectId === projectId);
  };

  const createAnswerCard = (card: Omit<AnswerCard, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCard: AnswerCard = {
      ...card,
      id: `card-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setAnswerCards(prev => [...prev, newCard]);
  };

  const updateAnswerCard = (id: string, updates: Partial<AnswerCard>) => {
    setAnswerCards(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
    ));
  };

  const getRequirementsByProject = (projectId: string) => {
    return requirements.filter(req => req.projectId === projectId);
  };

  const uploadDocument = (doc: Omit<DocumentUpload, 'id' | 'uploadedAt'>) => {
    const newDoc: DocumentUpload = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date(),
    };
    setDocuments(prev => [newDoc, ...prev]);
  };

  const getConflictsByProject = (projectId: string) => {
    return conflicts.filter(c => c.projectId === projectId);
  };

  const resolveConflict = (id: string, resolution: string, userId: string) => {
    setConflicts(prev => prev.map(c => 
      c.id === id 
        ? { ...c, status: 'resolved' as const, resolution, resolvedBy: userId, resolvedAt: new Date() }
        : c
    ));
  };

  const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...log,
      id: `audit-${Date.now()}`,
      timestamp: new Date(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const getProjectAnalytics = (projectId: string): ProjectAnalytics | null => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;

    const projectCards = getCardsByProject(projectId);
    const projectReqs = getRequirementsByProject(projectId);
    const projectDocs = documents.filter(d => d.projectId === projectId);
    const projectConflicts = getConflictsByProject(projectId);

    const allVariants = projectCards.flatMap(c => c.variants);
    
    return {
      projectId,
      totalDocuments: projectDocs.length,
      totalAnswerCards: projectCards.length,
      totalRequirements: projectReqs.length,
      complianceCoverage: project.complianceCoverage || 0,
      approvedVariants: allVariants.filter(v => v.status === 'APPROVED').length,
      pendingVariants: allVariants.filter(v => v.status === 'PENDING').length,
      rejectedVariants: allVariants.filter(v => v.status === 'REJECTED').length,
      unresolvedConflicts: projectConflicts.filter(c => c.status === 'pending').length,
      lastActivity: new Date(),
    };
  };

  const dashboardMetrics: DashboardMetrics = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalAnswerCards: answerCards.length,
    avgComplianceCoverage: projects.reduce((sum, p) => sum + (p.complianceCoverage || 0), 0) / projects.length,
    pendingConflicts: conflicts.filter(c => c.status === 'pending').length,
    recentActivity: auditLogs.slice(0, 10),
  };

  const value: AppContextType = {
    projects,
    selectedProject,
    setSelectedProject,
    createProject,
    updateProject,
    answerCards,
    getCardsByProject,
    createAnswerCard,
    updateAnswerCard,
    requirements,
    getRequirementsByProject,
    documents,
    uploadDocument,
    conflicts,
    getConflictsByProject,
    resolveConflict,
    proposals,
    templates,
    dashboardMetrics,
    getProjectAnalytics,
    auditLogs,
    addAuditLog,
    currentWorkspace: mockWorkspace,
    sidebarOpen,
    setSidebarOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
