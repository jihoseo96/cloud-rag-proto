# app/services/search.py
from typing import List, Optional, Any, Dict
from sqlalchemy.orm import Session
from uuid import UUID
from app.models.chunk import Chunk
from app.models.document import Document
from app.models.answer import AnswerChunk, AnswerCard

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
    if not prefer_team_answer: # If prefer_team_answer is True, we might still want docs, but let's keep it simple
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
