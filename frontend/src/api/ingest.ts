import { apiClient } from './client';

export interface IngestResponse {
    filename: string;
    content_hash: string;
    status: 'success' | 'conflict' | 'error';
    conflict_detail?: {
        type: 'duplicate' | 'version' | 'content';
        existing_doc_id: string;
        similarity: number;
    };
    doc_id?: string;
}

export const ingestApi = {
    uploadFile: async (file: File, groupId?: string): Promise<IngestResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        if (groupId) {
            formData.append('group_id', groupId);
        }

        const response = await apiClient.post<IngestResponse>('/ingest/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};
