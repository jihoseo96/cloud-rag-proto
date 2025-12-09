# app/services/search.py
from typing import List, Optional, Any, Dict
from sqlalchemy.orm import Session
from uuid import UUID
from app.models.chunk import Chunk
from app.models.document import Document
from app.models.answer import AnswerChunk, AnswerCard

from app.services.vertex_client import VertexAIClient
from app.utils.debug_logger import log_error

# Default weights
W_VEC_DEFAULT = 0.6
W_LEX_DEFAULT = 0.4
DIVERSITY_PENALTY_DEFAULT = 0.9

def search_chunks(
    db: Session,
    qvec: List[float],
    qtext: str,
    top_k: int = 6,
    w_vec: float = W_VEC_DEFAULT,
    w_lex: float = W_LEX_DEFAULT,
    diversity_penalty: float = DIVERSITY_PENALTY_DEFAULT,
    per_doc_limit: int = 3,
    document_id: Optional[str] = None,
    workspace: str = "personal",
    group_id: Optional[str] = None,
    prefer_team_answer: bool = False,
) -> List[Dict[str, Any]]:
    """
    Placeholder implementation of search_chunks.
    Returns an empty list for now to allow application startup.
    """
    # 1. Search Document Chunks
    doc_results = []
    
    # Strategy:
    # If group_id is provided -> Knowledge Hub -> Use Vertex AI Search
    # If group_id is None -> Project/Personal -> Use Local PGVector
    
    if group_id:
        # Vertex AI Search
        try:
            v_client = VertexAIClient()
            # Note: Vertex Search sorts by relevance automatically
            v_res = v_client.search_docs(qtext, top_k=top_k)
            for r in v_res:
                doc_results.append({
                    "source_type": "document (vertex)",
                    "document_id": r["id"], # Assuming this maps to our UUID
                    "answer_id": None,
                    "page": 0, # Vertex snippet doesn't give page readily
                    "text": r["snippet"],
                    "title": r["title"],
                    "final_score": 0.85 # Placeholder score as Vertex doesn't give normalized cosine
                })
        except Exception as e:
            log_error(f"Vertex Search failed: {e}")
            # Fallback to local search if Vertex fails? 
            # For now, let's allow fallback or just leave doc_results empty.
            pass
            
    if not doc_results and not prefer_team_answer: 
        # Local PGVector Search (Fall back or Project context)
        doc_query = db.query(Chunk, Chunk.embedding.cosine_distance(qvec).label("distance")) \
            .order_by("distance") \
            .limit(top_k)
        
        # Filter by document_id if provided
        if document_id:
             doc_query = doc_query.filter(Chunk.document_id == document_id)
             
        # Filter by workspace (Chunk -> Document -> workspace)
        # Assuming Chunk has document_id, we need to join Document to filter by workspace/group
        from app.models.document import Document
        doc_query = doc_query.join(Document, Chunk.document_id == Document.id) \
            .filter(Document.workspace == workspace)
            
        if group_id:
            doc_query = doc_query.filter(Document.group_id == UUID(group_id))
        else:
            # If no group_id, ensure we don't accidentally search KH if intended?
            # Or just filter by workspace. 
            pass
            
        for chunk, distance in doc_query.all():
            doc_results.append({
                "source_type": "document",
                "document_id": chunk.document_id,
                "answer_id": None,
                "page": chunk.page,
                "text": chunk.text,
                "title": chunk.document.title, # Assuming relationship exists or we joined
                "final_score": 1 - distance
            })

    # 2. Search Answer Chunks
    from app.models.answer import AnswerChunk, AnswerCard
    ans_query = db.query(AnswerChunk, AnswerChunk.embedding.cosine_distance(qvec).label("distance")) \
        .join(AnswerCard, AnswerChunk.answer_id == AnswerCard.id) \
        .filter(AnswerCard.workspace == workspace) \
        .order_by("distance") \
        .limit(top_k)
        
    if group_id:
        ans_query = ans_query.filter(AnswerCard.group_id == UUID(group_id))
        
    ans_results = []
    for chunk, distance in ans_query.all():
        # Boost score if prefer_team_answer
        score = 1 - distance
        # Removed artificial boost to ensure accurate confidence scores
        # if prefer_team_answer:
        #     score += 0.1
            
        ans_results.append({
            "source_type": "answer",
            "document_id": None,
            "answer_id": chunk.answer_id,
            "page": 0,
            "text": chunk.text,
            "title": chunk.answer_card.question, # Assuming relationship
            "final_score": score
        })

    # 3. Combine and Sort
    all_results = doc_results + ans_results
    all_results.sort(key=lambda x: x["final_score"], reverse=True)
    
    return all_results[:top_k]

class SearchService:
    def __init__(self):
        pass

    async def search(self, query: str, project_id: str):
        # TODO: Implement search logic
        pass
