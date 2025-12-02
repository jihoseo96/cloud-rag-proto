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
    uploadFile: async (file: File, projectId?: string): Promise<IngestResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        if (projectId) {
            formData.append('project_id', projectId);
        }

        const response = await apiClient.post<IngestResponse>('/ingest/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    resolveConflict: async (file: File, resolution: 'keep_new' | 'keep_old' | 'merge', projectId?: string): Promise<IngestResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('resolution', resolution);
        if (projectId) {
            formData.append('project_id', projectId);
        }

        const response = await apiClient.post<IngestResponse>('/ingest/resolve', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
