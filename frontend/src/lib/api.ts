// src/lib/api.ts
export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

// --- 타입 정의 (백엔드 응답 구조에 맞춤) ---

export interface UploadResponse {
    status: "ok" | "already_indexed";
    document_id: string;
    s3_key?: string;
    group_id?: string | null;
    duplicate?: boolean;
}

export interface Citation {
    num: number;
    document_id: string;
    page: number;
    title: string;
    snippet: string;
}

export interface QueryDebug {
    weights: { vec: number; lex: number };
    diversity_penalty: number;
    per_doc_limit: number;
    used_k: number;
    workspace: string;
    group_id: string | null;
    prefer_team_answer: boolean;
}

export interface QueryResponse {
    answer: string;         // [n] 인용이 이미 붙어있는 텍스트
    citations: Citation[];  // 출처 목록
    debug: QueryDebug;
}

// --- API 함수 ---

export async function uploadDocument(
    file: File,
    opts: { title?: string; groupId?: string | null } = {}
): Promise<UploadResponse> {
    const form = new FormData();
    form.append("file", file);
    form.append("title", opts.title ?? file.name.replace(/\.[^.]+$/, ""));
    if (opts.groupId) {
        form.append("group_id", opts.groupId);
    }

    const res = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: "POST",
        body: form,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Upload failed: ${res.status} ${text}`);
    }

    return res.json();
}

export async function queryRag(params: {
    q: string;
    groupId?: string | null;
    documentId?: string | null;
    preferTeamAnswer?: boolean;
}): Promise<QueryResponse> {
    const query = new URLSearchParams();
    query.set("q", params.q);
    if (params.groupId) query.set("group_id", params.groupId);
    if (params.documentId) query.set("document_id", params.documentId);
    if (params.preferTeamAnswer != null) {
        query.set("prefer_team_answer", String(params.preferTeamAnswer));
    }
    // w_vec / w_lex / diversity_penalty / per_doc_limit 은 백엔드 기본값 사용

    const res = await fetch(`${API_BASE_URL}/query?` + query.toString(), {
        method: "GET",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Query failed: ${res.status} ${text}`);
    }

    return res.json();
}
