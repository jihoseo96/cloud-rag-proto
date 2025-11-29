// frontEnd/src/lib/api.ts

// Vite 환경변수에서 API 베이스 URL 읽기
export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

// 공통 request 래퍼
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const isFormData = options.body instanceof FormData;

    const res = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            ...(options.headers || {}),
        },
        ...options,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with status ${res.status}`);
    }

    // 204 같은 경우 처리
    if (res.status === 204) {
        return undefined as T;
    }

    return res.json() as Promise<T>;
}

/* =========================================================
 * /query
 * =======================================================*/

export interface QueryRequest {
    q: string;
    groupId?: string | null;
    topK?: number;
    preferTeamAnswer?: boolean;
}

export interface QueryCitation {
    n: number;
    document_id?: string | null;
    page?: number | null;
    sha256?: string | null;
    title?: string | null;
    text?: string | null;
}

export interface QueryDebug {
    used_k?: number;
    weights?: { vec: number; lex: number };
    [key: string]: unknown;
}

export interface QueryResponse {
    answer: string;
    citations?: QueryCitation[];
    debug?: QueryDebug;
}

export async function query(req: QueryRequest): Promise<QueryResponse> {
    const params = new URLSearchParams();
    params.set('q', req.q);

    if (req.topK != null) params.set('k', String(req.topK));
    if (req.groupId) params.set('group_id', req.groupId);
    if (req.preferTeamAnswer) params.set('prefer_team_answer', 'true');

    return request<QueryResponse>(`/query?${params.toString()}`, {
        method: 'GET',
    });
}

/* =========================================================
 * /answers (AnswerCard)
 * =======================================================*/

export interface AnswerCitationInput {
    document_id?: string | null;
    page?: number | null;
    sha256?: string | null;
}

export interface CreateAnswerCardRequest {
    groupId?: string | null;
    question: string;
    answer: string;
    citations?: AnswerCitationInput[];
    createdBy: string;
}

export async function createAnswerCard(
    body: CreateAnswerCardRequest
): Promise<void> {
    const payload = {
        group_id: body.groupId ?? null,
        question: body.question,
        answer: body.answer,
        citations: body.citations ?? [],
        created_by: body.createdBy,
    };

    await request('/answers', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export interface ApproveAnswerCardRequest {
    reviewedBy: string;
    note?: string;
}

export async function approveAnswerCard(
    id: string,
    body: ApproveAnswerCardRequest
): Promise<void> {
    const payload = {
        reviewed_by: body.reviewedBy,
        note: body.note ?? null,
    };

    await request(`/answers/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

// (선행 작업용) 목록 조회 – 아직 매핑은 안 쓰고, 다음 스텝에서 쓸 예정
export interface BackendAnswerCard {
    id: string;
    group_id: string | null;
    question: string;
    answer: string;
    status: 'draft' | 'pending' | 'approved' | 'archived';
    created_by?: string;
    created_at?: string;
    reviewed_by?: string | null;
    updated_at?: string;
    source_sha256_list?: string[] | null;
}

export async function listAnswers(params?: {
    groupId?: string;
    status?: string;
}): Promise<BackendAnswerCard[]> {
    const sp = new URLSearchParams();
    if (params?.groupId) sp.set('group_id', params.groupId);
    if (params?.status) sp.set('status', params.status);
    const qs = sp.toString();

    return request<BackendAnswerCard[]>(`/answers${qs ? `?${qs}` : ''}`, {
        method: 'GET',
    });
}

/* =========================================================
 * /documents (업로드 & 리스트)
 *  → 백엔드 엔드포인트는 다음 스텝에서 구현
 * =======================================================*/

export interface UploadDocumentResponse {
    document_id: string;
    title: string;
    sha256: string;
}

export async function uploadDocument(
    formData: FormData
): Promise<UploadDocumentResponse> {
    const res = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Upload failed with status ${res.status}`);
    }

    return res.json();
}

export interface DocumentSummary {
    id: string;
    title: string;
    s3_key_raw: string;
    sha256: string;
    created_at: string;
    group_id?: string | null;
}

export async function listDocuments(params?: {
    groupId?: string;
}): Promise<DocumentSummary[]> {
    const sp = new URLSearchParams();
    if (params?.groupId) sp.set('group_id', params.groupId);
    const qs = sp.toString();

    return request<DocumentSummary[]>(`/documents/list${qs ? `?${qs}` : ''}`, {
        method: 'GET',
    });
}

/* =========================================================
 * /groups/{id}/instruction (Group Instruction)
 *  → 실제 사용 연결은 다음 스텝에서 해도 됨
 * =======================================================*/

export interface GroupInstructionDto {
    id: string;
    title: string;
    instruction: string;
    updated_at: string;
}

export async function getGroupInstructions(groupId: string): Promise<GroupInstructionDto[]> {
    return request<GroupInstructionDto[]>(`/groups/${groupId}/instruction`, { method: 'GET' });
}

export async function createGroupInstruction(groupId: string, title: string, instruction: string): Promise<{ status: string, id: string }> {
    return request<{ status: string, id: string }>(`/groups/${groupId}/instruction`, {
        method: 'POST',
        body: JSON.stringify({ title, instruction }),
    });
}

export async function updateGroupInstruction(groupId: string, instructionId: string, title: string, instruction: string): Promise<void> {
    return request<void>(`/groups/${groupId}/instruction/${instructionId}`, {
        method: 'PUT',
        body: JSON.stringify({ title, instruction }),
    });
}

export async function deleteGroupInstruction(groupId: string, instructionId: string): Promise<void> {
    return request<void>(`/groups/${groupId}/instruction/${instructionId}`, {
        method: 'DELETE',
    });
}

/* =========================================================
 * Groups / Chats (새로 추가하는 부분)
 * =======================================================*/

export interface Group {
    id: string;
    name: string;
    workspace: string;
    created_at?: string | null;
}

export interface Chat {
    id: string;
    group_id: string | null;
    title: string;
    created_at?: string | null;
    last_updated?: string | null;
}

export async function listGroups(): Promise<Group[]> {
    return request<Group[]>('/groups', { method: 'GET' });
}

export async function listChats(): Promise<Chat[]> {
    return request<Chat[]>('/chats', { method: 'GET' });
}

export async function createChatApi(body: {
    group_id: string;
    title?: string;
}): Promise<Chat> {
    return request<Chat>('/chats', {
        method: 'POST',
        body: JSON.stringify(body),
    });
}
