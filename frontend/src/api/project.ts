import { apiClient } from './client';
import { Project, RFPRequirement, AnswerCard } from '../types';

export const projectApi = {
    // Projects
    getProjects: async (): Promise<Project[]> => {
        // TODO: Implement backend endpoint for listing projects
        // For now, returning empty array or mock if backend not ready
        // const response = await apiClient.get<Project[]>('/projects');
        // return response.data;
        return [];
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
        // TODO: Implement backend endpoint
        // await apiClient.patch(`/requirements/${reqId}`, { status });
        console.log(`Updating status for ${reqId} to ${status}`);
    },

    updateRequirementResponse: async (reqId: string, responseText: string): Promise<void> => {
        // TODO: Implement backend endpoint (likely creating/updating an AnswerCard)
        // await apiClient.post(`/requirements/${reqId}/response`, { response: responseText });
        console.log(`Updating response for ${reqId}`);
    }
};
