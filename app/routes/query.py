# app/routes/query.py
from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text as sqltext, bindparam
from pgvector.sqlalchemy import Vector

from app.models.db import SessionLocal
from app.services.embed import embed_texts

from openai import OpenAI
from typing import Optional, List, Dict, Any
import uuid
import re

router = APIRouter(prefix="/query", tags=["query"])
client = OpenAI()  # OPENAI_API_KEY는 .env/환경변수로 주입

# -------------------- DB 세션 --------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------- 유틸: 문장 분리/인용 부착 --------------------
_SENT_SPLIT = re.compile(r'(?<=[\.\?\!])\s+')

def _split_sentences(text: str) -> List[str]:
    s = text.strip()
    return [t.strip() for t in _SENT_SPLIT.split(s) if t.strip()] if s else []

def _attach_citations(answer: str, passages: List[Dict[str, Any]]):
    """
    passages: [{document_id, page, text, title, ...}]
    각 문장과 가장 유사한 passage를 간단 매칭해 [n] 삽입.
    rapidfuzz가 없으면 인용 부착을 생략.
    """
    try:
        from rapidfuzz import fuzz
    except Exception:
        # 인용 없이 그대로 반환
        return answer, []

    sents = _split_sentences(answer)
    key_to_num: Dict[tuple, int] = {}
    citations: List[Dict[str, Any]] = []

    def _num_for(doc_id, page, title, snippet):
        key = (str(doc_id), int(page))
        if key not in key_to_num:
            key_to_num[key] = len(key_to_num) + 1
            citations.append({
                "num": key_to_num[key],
                "document_id": str(doc_id),
                "page": int(page),
                "title": title or "",
                "snippet": (snippet[:240] + "…") if len(snippet) > 240 else snippet
            })
        return key_to_num[key]

    out_parts: List[str] = []
    for s in sents:
        best_i, best_score = -1, -1
        for i, p in enumerate(passages):
            score = fuzz.partial_ratio(s, p.get("text", ""))
            if score > best_score:
                best_score, best_i = score, i
        if best_i >= 0:
            p = passages[best_i]
            n = _num_for(p["document_id"], p["page"], p.get("title",""), p.get("text",""))
            out_parts.append(f"{s} [{n}]")
        else:
            out_parts.append(s)
    return " ".join(out_parts), citations

# -------------------- /query --------------------
@router.get("")
def query(
    q: str = Query(..., min_length=2, description="사용자 질문"),
    k: int = Query(6, ge=1, le=20, description="최종 반환 개수"),
    w_vec: float = Query(0.7, ge=0.0, le=1.0, description="벡터 가중치"),
    w_lex: float = Query(0.3, ge=0.0, le=1.0, description="문자열 가중치"),
    diversity_penalty: float = Query(0.9, ge=0.5, le=1.0, description="동일 문서 다양성 페널티 계수"),
    per_doc_limit: int = Query(3, ge=1, le=10, description="문서당 최대 청크"),
    document_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    if not q.strip():
        raise HTTPException(400, "empty query")

    # 1) 쿼리 임베딩 (1536-dim)
    qvec = embed_texts([q])[0]

    # 2) document_id가 있을 때만 필터 추가 (없으면 조건 자체를 빼서 타입 모호성 제거)
    doc_uuid = None
    if document_id:
        try:
            doc_uuid = uuid.UUID(document_id)
        except ValueError:
            raise HTTPException(400, "document_id는 UUID 형식이어야 합니다.")

    sql_base = """
    WITH vec(qv) AS (SELECT CAST(:qvec AS vector(1536))),
    scored AS (
      SELECT
        c.document_id,
        d.title,
        c.page,
        c.text,
        1.0 / (1.0 + (c.embedding <-> (SELECT qv FROM vec)))               AS vec_sim,
        similarity(c.text, :q)                                              AS lex_sim,
        (:w_vec * (1.0 / (1.0 + (c.embedding <-> (SELECT qv FROM vec))))
         + :w_lex * similarity(c.text, :q))                                 AS base_score
      FROM chunk c
      JOIN document d ON d.id = c.document_id
      WHERE 1=1
    """
    if doc_uuid is not None:
        sql_base += "      AND c.document_id = :doc_id\n"  # ✅ 있을 때만 바인딩/조건 추가

    sql_tail = """
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
    SELECT document_id, title, page, text, vec_sim, lex_sim, base_score, final_score
    FROM limited
    ORDER BY final_score DESC
    LIMIT :lim;
    """

    stmt = sqltext(sql_base + sql_tail).bindparams(
        bindparam("qvec", type_=Vector(1536)),  # ✅ 벡터 타입으로 바인딩
    )

    params = {
        "qvec": qvec,
        "q": q,
        "w_vec": w_vec,
        "w_lex": w_lex,
        "lim_ext": k * 10,
        "div_penalty": diversity_penalty,
        "per_doc_limit": per_doc_limit,
        "lim": k,
    }
    if doc_uuid is not None:
        params["doc_id"] = doc_uuid  # ✅ 있을 때만 전달

    rows = db.execute(stmt, params).mappings().all()
    if not rows:
        return {"answer": "검색 결과가 없습니다.", "citations": [], "debug": {"used_k": 0}}

    # 3) LLM 컨텍스트 구성 (인용 표기는 나중에 우리가 붙임)
    context = "\n\n".join(
        f"[{i+1}] (doc={r['document_id']}, p={r['page']})\n{r['text'][:1200]}"
        for i, r in enumerate(rows)
    )
    sys = (
        "You are a RAG assistant. Answer strictly from the provided context. "
        "If evidence is insufficient, say '근거 부족'. "
        "Do NOT add citation markers yourself; they will be attached later."
    )
    user = f"질문: {q}\n\n컨텍스트:\n{context}\n\n한국어로 간결히 답하세요."

    comp = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.0,
        messages=[{"role":"system","content":sys},{"role":"user","content":user}],
    )
    draft = (comp.choices[0].message.content or "").strip()

    # 4) 문장별 인용 자동 부착
    passages = [dict(r) for r in rows]
    answered, citations = _attach_citations(draft, passages)

    return {
        "answer": answered or draft,
        "citations": citations,
        "debug": {
            "weights": {"vec": w_vec, "lex": w_lex},
            "diversity_penalty": diversity_penalty,
            "per_doc_limit": per_doc_limit,
            "used_k": len(rows),
        },
    }
