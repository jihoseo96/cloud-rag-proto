# app/services/search.py
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any


def search_chunks(
    db: Session,
    qvec: List[float],
    qtext: str,
    top_k: int = 6,
    w_vec: float = 0.7,
    w_lex: float = 0.3,
    diversity_penalty: float = 0.9,
    per_doc_limit: int = 3,
    document_id: Optional[str] = None,
    workspace: str = "personal",
    group_id: Optional[str] = None,
    prefer_team_answer: bool = False,
) -> List[Dict[str, Any]]:
    """
    문서 chunk + AnswerCard chunk 퓨전 검색.

    반환 요소:
    {
        "id": UUID,
        "source_type": "doc" | "answer",
        "document_id": UUID | None,
        "answer_id": UUID | None,
        "title": str,
        "page": int,
        "text": str,
        "sim_vec": float,
        "sim_lex": float,
        "raw_score": float,
        "final_score": float,
    }
    """

    # AnswerCard 부스트 계수
    answer_boost = 1.3 if prefer_team_answer else 1.15

    sql = text(
        """
WITH q AS (
    SELECT CAST(:qvec AS vector) AS qvec, :qtext AS qtext
),
-- 문서 chunk 후보
doc_candidates AS (
    SELECT
        c.id                           AS id,
        'doc'                          AS source_type,
        c.document_id                  AS document_id,
        NULL::uuid                     AS answer_id,
        d.title                        AS source_title,
        c.page                         AS page,
        c.text                         AS text,
        d.workspace                    AS workspace,
        d.group_id                     AS group_id,
        1.0 / (1.0 + (c.embedding <-> (SELECT qvec FROM q)))         AS sim_vec,
        similarity(c.text, (SELECT qtext FROM q))                    AS sim_lex
    FROM chunk c
    JOIN document d ON d.id = c.document_id
    WHERE d.workspace = :workspace
      AND (CAST(:group_id AS uuid) IS NULL OR d.group_id = CAST(:group_id AS uuid))
      AND (CAST(:document_id AS uuid) IS NULL OR d.id = CAST(:document_id AS uuid))
),
-- AnswerCard chunk 후보 (approved만)
answer_candidates AS (
    SELECT
        ac.id                          AS id,
        'answer'                       AS source_type,
        NULL::uuid                     AS document_id,
        a.id                           AS answer_id,
        ('Answer: ' || a.question)     AS source_title,
        ac.page                        AS page,
        ac.text                        AS text,
        a.workspace                    AS workspace,
        a.group_id                     AS group_id,
        1.0 / (1.0 + (ac.embedding <-> (SELECT qvec FROM q)))        AS sim_vec,
        similarity(ac.text, (SELECT qtext FROM q))                   AS sim_lex
    FROM answer_chunk ac
    JOIN answer_card a ON a.id = ac.answer_id
    WHERE a.workspace = :workspace
      AND a.status = 'approved'
      AND (CAST(:group_id AS uuid) IS NULL OR a.group_id = CAST(:group_id AS uuid))
),
all_candidates AS (
    SELECT * FROM doc_candidates
    UNION ALL
    SELECT * FROM answer_candidates
),
scored AS (
    SELECT
        id,
        source_type,
        document_id,
        answer_id,
        source_title,
        page,
        text,
        workspace,
        group_id,
        sim_vec,
        sim_lex,
        (:w_vec * sim_vec + :w_lex * sim_lex)
          * CASE WHEN source_type = 'answer' THEN :answer_boost ELSE 1.0 END
          AS raw_score
    FROM all_candidates
),
ranked_per_source AS (
    SELECT
        s.*,
        ROW_NUMBER() OVER (
            PARTITION BY COALESCE(document_id, answer_id)
            ORDER BY raw_score DESC
        ) AS rn_per_source
    FROM scored s
),
filtered AS (
    SELECT *
    FROM ranked_per_source
    WHERE rn_per_source <= :per_doc_limit
),
diversified AS (
    SELECT
        f.*,
        ROW_NUMBER() OVER (ORDER BY raw_score DESC) AS global_rank,
        raw_score * EXP(-(:div_penalty * (ROW_NUMBER() OVER (ORDER BY raw_score DESC) - 1))) AS final_score
    FROM filtered f
),
limited AS (
    SELECT *
    FROM diversified
    ORDER BY final_score DESC
    LIMIT :lim
)
SELECT
    id,
    source_type,
    document_id,
    answer_id,
    source_title AS title,
    page,
    text,
    sim_vec,
    sim_lex,
    raw_score,
    final_score
FROM limited
ORDER BY final_score DESC;
        """
    )

    rows = db.execute(
        sql,
        {
            "qvec": qvec,
            "qtext": qtext,
            "w_vec": w_vec,
            "w_lex": w_lex,
            "div_penalty": diversity_penalty,
            "per_doc_limit": per_doc_limit,
            "document_id": document_id,
            "workspace": workspace,
            "group_id": group_id,
            "answer_boost": answer_boost,
            "lim": top_k,
        },
    ).mappings().all()

    return [dict(r) for r in rows]
