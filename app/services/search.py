# app/services/search.py
from typing import List, Optional, Any, Dict, Union
from sqlalchemy.orm import Session
from uuid import UUID

from app.models.chunk import Chunk
from app.models.document import Document
from app.models.answer import AnswerChunk, AnswerCard
from app.services.vertex_client import VertexAIClient
from app.utils.debug_logger import log_error, log_info, log_debug

# Default weights (legacy parameters, kept for compatibility)
W_VEC_DEFAULT = 0.6
W_LEX_DEFAULT = 0.4
DIVERSITY_PENALTY_DEFAULT = 0.9

def search_chunks(
    db: Session,
    qvec: List[float],
    qtext: str,
    top_k: int = 6,
    w_vec: float = W_VEC_DEFAULT, # unused in this version
    w_lex: float = W_LEX_DEFAULT, # unused in this version
    diversity_penalty: float = DIVERSITY_PENALTY_DEFAULT, # unused
    per_doc_limit: int = 3, # unused
    document_id: Optional[str] = None,
    workspace: str = "personal",
    group_id: Optional[str] = None, # If None -> Knowledge Hub (Vertex), If Set -> Project (DB)
    prefer_team_answer: bool = False,
) -> List[Dict[str, Any]]:
    """
    Hybrid Search Engine:
    - If group_id is provided (Project Context) -> Use Local PGVector (Chunks & AnswerCards)
    - If group_id is None (Knowledge Hub Context) -> Use Vertex AI Search (Global Docs)
    """
    results = []

    # ---------------------------------------------------------
    # Case A: Knowledge Hub Search (Vertex AI Search)
    # ---------------------------------------------------------
    if not group_id:
        log_info(f"[Search] Context: Knowledge Hub (Global). Using Vertex AI Search for query: '{qtext}'")
        try:
            v_client = VertexAIClient()
            # Vertex Search handles semantic + keyword internally
            vertex_results = v_client.search_docs(qtext, top_k=top_k)
            
            for rank, r in enumerate(vertex_results):
                # Normalize Vertex Result to Unified Format
                results.append({
                    "source_type": "vertex_doc", # Indicates this came from Vertex KH
                    "document_id": r["id"],      # Vertex Doc ID (usually UUID string)
                    "answer_id": None,
                    "page": 0,                   # Deep link page info might be in metadata
                    "text": r["snippet"],        # Snippet from Vertex
                    "title": r["title"],
                    "uri": r.get("uri"),         # GCS Link
                    "final_score": 0.9 - (rank * 0.05), # Artificial decay as Vertex score is hidden
                    "metadata": {}
                })
            
            return results

        except Exception as e:
            log_error(f"[Search] Vertex AI Search failed: {e}")
            # In KH mode, if Vertex fails, we might return empty or fallback to local DB (if desired).
            # For now, return empty to indicate failure cleanly.
            return []

    # ---------------------------------------------------------
    # Case B: Project Context Search (Local PGVector)
    # ---------------------------------------------------------
    else:
        log_info(f"[Search] Context: Project {group_id}. Using Local PGVector.")
        
        # 1. Search Document Chunks (RFP Attachments, etc.)
        doc_results = []
        try:
            # Join with Document to filter by group_id
            doc_query = db.query(
                Chunk, 
                Chunk.embedding.cosine_distance(qvec).label("distance")
            ).join(Document, Chunk.document_id == Document.id).filter(
                Document.workspace == workspace,
                Document.group_id == UUID(group_id)
            ).order_by("distance").limit(top_k)

            for chunk, distance in doc_query.all():
                similarity = 1 - distance
                if similarity < 0.3: continue # Basic threshold

                doc_results.append({
                    "source_type": "document",
                    "document_id": str(chunk.document_id),
                    "answer_id": None,
                    "page": chunk.page,
                    "text": chunk.text,
                    "title": chunk.document.title,
                    "uri": None, # Local logic might need Signed URL generation if requested
                    "final_score": similarity,
                    "metadata": {}
                })
        except Exception as e:
            log_error(f"[Search] Local Doc Search failed: {e}")

        # 2. Search AnswerCard Chunks (Project's Approved Answers)
        ans_results = []
        try:
            from app.models.answer import AnswerChunk, AnswerCard
            ans_query = db.query(
                AnswerChunk, 
                AnswerChunk.embedding.cosine_distance(qvec).label("distance")
            ).join(AnswerCard, AnswerChunk.answer_id == AnswerCard.id).filter(
                AnswerCard.workspace == workspace,
                AnswerCard.group_id == UUID(group_id) # Scope to project
            ).order_by("distance").limit(top_k)

            for chunk, distance in ans_query.all():
                similarity = 1 - distance
                if similarity < 0.3: continue

                ans_results.append({
                    "source_type": "answer_card",
                    "document_id": None,
                    "answer_id": str(chunk.answer_id),
                    "page": 0,
                    "text": chunk.text,
                    "title": chunk.answer_card.question,
                    "uri": None,
                    "final_score": similarity, # Answers usually highly relevant
                    "metadata": {"status": chunk.answer_card.status}
                })
        except Exception as e:
            log_error(f"[Search] Local Answer Search failed: {e}")

        # 3. Merge & Sort
        all_results = doc_results + ans_results
        all_results.sort(key=lambda x: x["final_score"], reverse=True)

        return all_results[:top_k]

class SearchService:
    """Class wrapper for future expansion"""
    pass
