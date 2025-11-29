/**
 * 공통 타입 정의
 * 애플리케이션 전역에서 사용되는 타입들을 정의합니다.
 */

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
  teamId: string | null; // null means personal chat
  lastUpdated: number; // Unix timestamp for sorting
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
