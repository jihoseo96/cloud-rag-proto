/**
 * Enterprise RFP OS - Type Definitions
 * v2025.11.28
 */

// ============================================
// Core Entities
// ============================================

export interface Project {
  id: string;
  workspace: 'personal' | 'team';
  groupId: string;
  name: string;
  industry: 'defense' | 'public' | 'finance' | 'healthcare' | 'technology' | 'other';
  rfpType: 'technical' | 'consulting' | 'construction' | 'other';
  evaluationCriteria: Record<string, unknown>;
  requiredDocuments: string[];
  prohibitedPhrases: string[];
  createdAt: Date;
  ownerId: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  dueDate?: Date;
  complianceCoverage?: number; // 0-100%
  // Dashboard Stats
  progress?: number;
  cardsGenerated?: number;
  requirementsMapped?: number;
  conflicts?: number;
  lastActivity?: string;
}

export interface RFPRequirement {
  id: string;
  projectId: string;
  requirementText: string;
  requirementType: 'security' | 'operations' | 'technical' | 'compliance' | 'other';
  complianceLevel: 'YES' | 'PARTIAL' | 'NO' | 'UNKNOWN';
  linkedAnswerCards: string[];
  anchorConfidence: number; // 0-1
  priority: 'high' | 'medium' | 'low';
  section?: string;
}

export interface Anchor {
  contentHash: string; // SHA256
  textSnippet: string;
  anchorConfidence: number; // 0-1
  docId: string;
  sectionPath?: string; // e.g., "3.1 보안"
  page?: number;
  bbox?: [number, number, number, number]; // [x, y, width, height]
  failReasons?: string[];
  anchorType: 'semantic' | 'structure' | 'layout';
}

export interface AnswerVariant {
  id: string;
  content: string;
  context: 'public-sector' | 'private-sector' | 'technical' | 'sales-pitch' | 'generic';
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  riskLevel: 'SAFE' | 'MEDIUM' | 'HIGH';
  usageCount: number;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  createdAt: Date;
  createdBy: string;
}

export interface AnswerCard {
  id: string;
  projectId: string;
  topic: string;
  description?: string;
  anchors: Anchor[];
  facts: Record<string, unknown>; // e.g., { sla: 99.5, cert: "ISO27001" }
  variants: AnswerVariant[];
  tags: string[];
  category?: string;
  createdAt: Date;
  updatedAt: Date;
  overallConfidence: number; // 0-1, computed from anchors
}

export interface DocumentUpload {
  id: string;
  projectId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
  uploadedBy: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  processingSteps: ProcessingStep[];
  s3Url?: string;
  extractedMetadata?: Record<string, unknown>;
  generatedCards?: string[]; // AnswerCard IDs
}

export interface ProcessingStep {
  step: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number; // 0-100
  message?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface Conflict {
  id: string;
  projectId: string;
  type: 'duplicate' | 'contradiction' | 'outdated' | 'overlap';
  severity: 'high' | 'medium' | 'low';
  entities: ConflictEntity[];
  suggestedResolution: 'keep-newest' | 'keep-highest-confidence' | 'merge' | 'manual';
  status: 'pending' | 'resolved' | 'ignored';
  resolvedBy?: string;
  resolvedAt?: Date;
  resolution?: string;
}

export interface ConflictEntity {
  type: 'answer-card' | 'variant' | 'document';
  id: string;
  label: string;
  confidence?: number;
  date?: Date;
}

export interface ProposalTemplate {
  id: string;
  name: string;
  industry: string;
  rfpType: string;
  sectionOrder: ProposalSection[];
  createdAt: Date;
  isDefault: boolean;
}

export interface ProposalSection {
  id: string;
  title: string;
  description?: string;
  recommendedCards: string[]; // AnswerCard IDs or topics
  order: number;
  isRequired: boolean;
}

export interface Proposal {
  id: string;
  projectId: string;
  templateId: string;
  title: string;
  sections: AssembledSection[];
  status: 'draft' | 'review' | 'approved' | 'submitted';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

export interface AssembledSection {
  sectionId: string;
  title: string;
  cards: string[]; // AnswerCard IDs
  customContent?: string;
  order: number;
}

export interface AuditLog {
  id: string;
  entityType: 'answer-card' | 'variant' | 'conflict' | 'upload' | 'requirement' | 'proposal';
  entityId: string;
  action: 'create' | 'approve' | 'reject' | 'edit' | 'delete' | 'upload' | 'resolve';
  userId: string;
  userEmail: string;
  timestamp: Date;
  diffSnapshot?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// ============================================
// UI State & Analytics
// ============================================

export interface ProjectAnalytics {
  projectId: string;
  totalDocuments: number;
  totalAnswerCards: number;
  totalRequirements: number;
  complianceCoverage: number; // 0-100
  approvedVariants: number;
  pendingVariants: number;
  rejectedVariants: number;
  unresolvedConflicts: number;
  lastActivity: Date;
}

export interface DashboardMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalAnswerCards: number;
  avgComplianceCoverage: number;
  pendingConflicts: number;
  recentActivity: AuditLog[];
}

// ============================================
// Legacy Types (for compatibility)
// ============================================

export interface Team {
  id: string;
  name: string;
  memberCount: number;
  workspaceId: string;
}

export interface Workspace {
  id: string;
  name: string;
  type: 'personal' | 'organization';
  createdAt: Date;
}

export interface Chat {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  teamId: string | null;
  lastUpdated: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: {
    fileName: string;
    fileExtension: string;
    isStale?: boolean;
  }[];
  isStale?: boolean;
}

export interface GroupInstruction {
  id: string;
  title: string;
  content: string;
  teamId: string;
  description?: string;
}

export interface StandardAnswer {
  id: string;
  teamId: string;
  question: string;
  answer: string;
  requestedBy: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  chatId: string;
  messageId: string;
  citations?: {
    fileName: string;
    fileExtension: string;
    isStale?: boolean;
  }[];
  isStale?: boolean;
}
