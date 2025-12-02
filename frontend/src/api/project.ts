import { apiClient } from './client';
import { Project, RFPRequirement, AnswerCard } from '../types';

export const projectApi = {
    // Projects
    getProjects: async (): Promise<Project[]> => {
        const response = await apiClient.get<Project[]>('/projects');
        return response.data;
    },

    getProject: async (projectId: string): Promise<Project> => {
        const response = await apiClient.get<Project>(`/projects/${projectId}`);
        return response.data;
    },

    createProject: async (data: Partial<Project>): Promise<Project> => {
        const response = await apiClient.post<Project>('/projects', data);
        return response.data;
    },

    // Requirements
    getRequirements: async (projectId: string): Promise<RFPRequirement[]> => {
        const response = await apiClient.get<RFPRequirement[]>(`/projects/${projectId}/requirements`);
        return response.data;
    },

    // Answers
    getAnswerCards: async (projectId: string): Promise<AnswerCard[]> => {
        const response = await apiClient.get<AnswerCard[]>(`/projects/${projectId}/answers`);
        return response.data;
    },

    updateRequirementStatus: async (reqId: string, status: string): Promise<void> => {
        await apiClient.patch(`/projects/any/requirements/${reqId}/status`, { status });
    },

    updateRequirementResponse: async (reqId: string, responseText: string): Promise<void> => {
        await apiClient.post(`/projects/any/requirements/${reqId}/response`, { response: responseText });
    }
};
