import { apiClient } from './client';

export interface AnswerCard {
    id: string;
    question: string;
    answer: string;
    status: 'approved' | 'rejected' | 'candidate';
    created_by: string;
    reviewed_by?: string;
    created_at: string;
    variants?: any[];
    anchors?: any[];
    facts?: any;
    past_proposals?: any[];
    topic?: string; // Frontend helper
    summary?: string; // Frontend helper
    usageCount?: number; // Frontend helper
    lastUsed?: string | Date; // Frontend helper
}

export const answersApi = {
    listAnswers: async (groupId?: string, status?: string, query?: string): Promise<AnswerCard[]> => {
        const params: any = {};
        if (groupId) params.group_id = groupId;
        if (status) params.status = status;
        if (query) params.q = query;

        const response = await apiClient.get<AnswerCard[]>('/answers', { params });
        return response.data;
    },

    approveAnswer: async (answerId: string, reviewedBy: string, note?: string): Promise<void> => {
        await apiClient.post(`/answers/${answerId}/approve`, { reviewed_by: reviewedBy, note });
    },

    updateAnswer: async (answerId: string, data: Partial<AnswerCard>): Promise<void> => {
        await apiClient.patch(`/answers/${answerId}`, data);
    }
};
