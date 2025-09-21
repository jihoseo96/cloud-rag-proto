# app/services/search.py
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any

def search_chunks(
    db: Session,
    qvec: list[float],
    qtext: str,
    top_k: int = 6,
    w_vec: float = 0.7,
    w_lex: float = 0.3,
    diversity_penalty: float = 0.9,
    per_doc_limit: int = 3,
    document_id: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    하이브리드 스코어:
      vec_sim = 1/(1 + L2distance)
      base_score = w_vec*vec_sim + w_lex*similarity(text, qtext)

    다양성 페널티:
      rn = 각 document_id 내 순위
      final_score = base_score * pow(diversity_penalty, greatest(rn-1, 0))
    """
    sql = text("""
    WITH scored AS (
      SELECT
        c.document_id,
        c.page,
        c.text,
        d.title,
        1.0 / (1.0 + (c.embedding <-> :qvec))                       AS vec_sim,
        similarity(c.text, :qtext)                                   AS lex_sim,
        (:w_vec * (1.0 / (1.0 + (c.embedding <-> :qvec)))
         + :w_lex * similarity(c.text, :qtext))                      AS base_score
      FROM chunk c
      JOIN document d ON d.id = c.document_id
      WHERE (:doc_id IS NULL OR c.document_id = :doc_id::uuid)
      ORDER BY base_score DESC
      LIMIT :lim_ext
    ),
    ranked AS (
      SELECT *,
        ROW_NUMBER() OVER (PARTITION BY document_id ORDER BY base_score DESC) AS rn
      FROM scored
    ),
    limited AS (
      SELECT *,
        base_score * POWER(:div_penalty, GREATEST(rn-1, 0)) AS final_score
      FROM ranked
      WHERE rn <= :per_doc_limit
    )
    SELECT document_id, page, text, title, vec_sim, lex_sim, base_score, final_score
    FROM limited
    ORDER BY final_score DESC
    LIMIT :lim;
    """)
    rows = db.execute(sql, {
        "qvec": qvec, "qtext": qtext,
        "w_vec": w_vec, "w_lex": w_lex,
        "div_penalty": diversity_penalty,
        "per_doc_limit": per_doc_limit,
        "doc_id": document_id,
        "lim_ext": top_k * 10,   # 초기 후보군 많이 뽑아서 다양성 필터
        "lim": top_k
    }).mappings().all()

    return [dict(r) for r in rows]
