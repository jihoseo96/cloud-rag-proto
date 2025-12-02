import { apiClient } from './client';

export interface SourceDocument {
    id: string;
    fileName: string;
    uploadedAt: string;
    parsingStatus: 'pending' | 'processing' | 'completed' | 'failed';
    fileSize: string;
}

export interface TreeNode {
    id: string;
    name: string;
    type: 'folder' | 'file';
    uploadedAt?: string;
    parsingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
    fileSize?: string;
    children?: TreeNode[];
    expanded?: boolean;
}

export const documentsApi = {
    listDocuments: async (): Promise<SourceDocument[]> => {
        const response = await apiClient.get('/documents/list');
        return response.data;
    },

    getTree: async (): Promise<TreeNode[]> => {
        const response = await apiClient.get('/documents/tree');
        return response.data;
    },

    createFolder: async (name: string, parentId?: string): Promise<TreeNode> => {
        const response = await apiClient.post('/documents/folders', { name, parent_id: parentId });
        return response.data;
    },

    deleteDocument: async (id: string): Promise<void> => {
        await apiClient.delete(`/documents/${id}`);
    },

    reindexDocument: async (id: string): Promise<void> => {
        await apiClient.post(`/documents/${id}/reindex`);
    }
};
