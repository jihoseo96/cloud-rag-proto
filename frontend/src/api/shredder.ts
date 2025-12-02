import { apiClient } from './client';

export interface ShredderResponse {
    status: 'success' | 'cost_check' | 'error';
    estimated_cost?: {
        estimated_tokens: number;
        estimated_cost_krw: number;
        estimated_time_min: number;
    };
    count?: number;
    requirements_count?: number;
}

export const shredderApi = {
    trigger: async (projectId: string, confirmCost: boolean = false): Promise<ShredderResponse> => {
        const response = await apiClient.post<ShredderResponse>('/shredder/trigger', {
            project_id: projectId,
            confirm_cost: confirmCost
        });
        return response.data;
    },

    estimate: async (text: string): Promise<any> => {
        const response = await apiClient.post('/shredder/estimate', { text });
        return response.data;
    }
};
