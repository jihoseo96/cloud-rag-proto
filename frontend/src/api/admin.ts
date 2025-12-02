import { apiClient } from './client';

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'member' | 'viewer';
    status: 'active' | 'pending' | 'inactive';
    joinedAt: string; // ISO date string
    lastActive?: string; // ISO date string
}

export interface SystemStatus {
    status: 'healthy' | 'degraded' | 'down';
    uptime: number; // seconds
    version: string;
    cpuUsage: number;
    memoryUsage: number;
}

export const adminApi = {
    listMembers: async (): Promise<TeamMember[]> => {
        const response = await apiClient.get<TeamMember[]>('/admin/members');
        return response.data;
    },

    inviteMember: async (email: string, role: string): Promise<TeamMember> => {
        const response = await apiClient.post<TeamMember>('/admin/invite', { email, role });
        return response.data;
    },

    updateMemberRole: async (memberId: string, role: string): Promise<void> => {
        await apiClient.patch(`/admin/members/${memberId}/role`, { role });
    },

    removeMember: async (memberId: string): Promise<void> => {
        await apiClient.delete(`/admin/members/${memberId}`);
    },

    getSystemStatus: async (): Promise<SystemStatus> => {
        const response = await apiClient.get<SystemStatus>('/admin/system/status');
        return response.data;
    },

    getGuardrails: async (): Promise<any> => {
        const response = await apiClient.get('/admin/guardrails');
        return response.data;
    },

    updateGuardrails: async (data: any): Promise<void> => {
        await apiClient.post('/admin/guardrails', data);
    },

    getCostDashboard: async (): Promise<any> => {
        const response = await apiClient.get('/admin/cost');
        return response.data;
    }
};
