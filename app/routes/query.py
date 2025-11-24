# app/routes/query.py
import os
import json
import time
import logging
from uuid import UUID
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, Query, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from openai import OpenAI

from app.models.db import SessionLocal
from app.models.group import GroupInstruction
from app.services.embed import embed_texts
from app.services.search import (
    search_chunks,
    W_VEC_DEFAULT,
    W_LEX_DEFAULT,
    DIVERSITY_PENALTY_DEFAULT,
)
from app.services.cite import attach_citations

router = APIRouter(prefix="/query", tags=["query"])

# 로거 (main.py에서 설정한 것 재사용)
logger = logging.getLogger("rag_proto")

# OPENAI_API_KEY는 .env/환경변수로 주입
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
CHAT_MODEL = os.getenv("CHAT_MODEL", "gpt-4o-mini")
WORKSPACE = os.getenv("WORKSPACE", "personal")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _get_group_instruction(db: Session, group_id: Optional[UUID]) -> str:
    if not group_id:
        return ""
    gi = db.get(GroupInstruction, group_id)
    return gi.instruction if gi and gi.instruction else ""


def _build_system_prompt(group_instruction: str) -> str:
    base = (
        "너는 팀 내부 문서와 승인된 팀 정답(Answer Card)을 사용하는 지식 어시스턴트이다. "
        "다음 규칙을 따라라:\n"
        "1) 반드시 제공된 context(문서 발췌 + Answer Card) 안에서만 답변할 것.\n"
        "2) 같은 내용에 대해 여러 출처가 있어도, 승인된 팀 정답(Answer Card)이 있으면 그 내용을 우선 사용한다.\n"
        "3) 문서의 표현을 적절히 요약·정리하되, 의미를 바꾸지 않는다.\n"
        "4) 출처 표시는 시스템이 자동으로 [n] 형식으로 붙인다. 너는 [1], [2] 같은 표시는 직접 쓰지 않는다.\n"
    )
    if group_instruction:
        base += f"5) 아래 그룹 지침을 항상 따를 것:\n{group_instruction}\n"
    return base


@router.get("")
def query(
    request: Request,
    q: str = Query(..., description="질문"),
    k: int = Query(6, description="최종 상위 passage 개수"),
    # A-4: 기본값을 search.py와 통일 + ENV override 지원
    w_vec: float = Query(
        W_VEC_DEFAULT,
        description="벡터 유사도 가중치 (기본: SEARCH_W_VEC 또는 0.6)",
    ),
    w_lex: float = Query(
        W_LEX_DEFAULT,
        description="lexical(trigram) 유사도 가중치 (기본: SEARCH_W_LEX 또는 0.4)",
    ),
    diversity_penalty: float = Query(
        DIVERSITY_PENALTY_DEFAULT,
        description="다양성 페널티 계수 (기본: SEARCH_DIVERSITY_PENALTY 또는 0.9)",
    ),
    per_doc_limit: int = Query(3, description="문서/정답 카드당 최대 passage 수"),
    document_id: Optional[str] = Query(None, description="특정 document_id로 제한"),
    group_id: Optional[str] = Query(None, description="그룹 UUID (optional)"),
    prefer_team_answer: bool = Query(
        False,
        description="승인된 팀 AnswerCard를 더 강하게 부스트할지 여부",
    ),
    db: Session = Depends(get_db),
):
    # group_id 파싱
    gid: Optional[UUID] = None
    if group_id:
        try:
            gid = UUID(group_id)
        except ValueError:
            raise HTTPException(
                status_code=422,
                detail="group_id는 UUID 형식이어야 합니다.",
            )

    # 질문 임베딩
    try:
        qvec_list = embed_texts([q])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"embedding 실패: {e}")
    if not qvec_list:
        raise HTTPException(status_code=500, detail="embedding 결과가 비어 있습니다.")
    qvec = qvec_list[0]

    # 검색 (문서 chunk + AnswerCard chunk)
    rows = search_chunks(
        db=db,
        qvec=qvec,
        qtext=q,
        top_k=k,
        w_vec=w_vec,
        w_lex=w_lex,
        diversity_penalty=diversity_penalty,
        per_doc_limit=per_doc_limit,
        document_id=document_id,
        workspace=WORKSPACE,
        group_id=str(gid) if gid else None,
        prefer_team_answer=prefer_team_answer,
    )

    used_k = len(rows)

    if not rows:
        # 빈 결과도 최소한의 로그는 남겨 두는 것이 좋다.
        req_id = getattr(request.state, "request_id", None)
        log_data = {
            "ts": int(time.time() * 1000),
            "level": "INFO",
            "request_id": req_id,
            "route": "query",
            "workspace": WORKSPACE,
            "group_id": str(gid) if gid else None,
            "used_k": 0,
            "model": CHAT_MODEL,
            "w_vec": w_vec,
            "w_lex": w_lex,
            "diversity_penalty": diversity_penalty,
            "prefer_team_answer": prefer_team_answer,
            "tokens": None,
            "note": "no_results",
        }
        logger.info(json.dumps(log_data, ensure_ascii=False))

        return {
            "answer": "관련된 문서나 팀 정답을 찾지 못했습니다.",
            "citations": [],
            "debug": {
                "weights": {"vec": w_vec, "lex": w_lex},
                "diversity_penalty": diversity_penalty,
                "per_doc_limit": per_doc_limit,
                "used_k": 0,
                "workspace": WORKSPACE,
                "group_id": str(gid) if gid else None,
                "prefer_team_answer": prefer_team_answer,
            },
        }

    # GPT에 줄 context 구성
    context_parts: List[str] = []
    passages: List[Dict[str, Any]] = []

    for r in rows:
        src_type = r["source_type"]
        doc_id = r["document_id"]
        answer_id = r["answer_id"]
        title = r["title"]
        page = r["page"]
        text = r["text"]

        # context 텍스트
        if src_type == "answer":
            header = f"[팀 정답 카드] {title}"
        else:
            header = f"[문서] {title} (page {page})"

        context_parts.append(f"{header}\n{text}\n")

        # cite용 passage
        pseudo_doc_id = str(doc_id or answer_id) if (doc_id or answer_id) else None
        passages.append(
            {
                "document_id": pseudo_doc_id,
                "page": page,
                "text": text,
                "title": title,
                "source_type": src_type,
                "raw_document_id": str(doc_id) if doc_id else None,
                "answer_id": str(answer_id) if answer_id else None,
                "score": float(r["final_score"]),
            }
        )

    context = "\n".join(context_parts)

    # 시스템 프롬프트
    group_instruction = _get_group_instruction(db, gid)
    system_prompt = _build_system_prompt(group_instruction)

    # GPT 호출
    try:
        completion = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": (
                        f"질문: {q}\n\n"
                        "아래는 관련 문서와 팀 정답 카드에서 추출한 발췌문이다. "
                        "이 정보만을 근거로 질문에 답변해라.\n\n"
                        f"{context}"
                    ),
                },
            ],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI 호출 실패: {e}")

    draft = completion.choices[0].message.content.strip()

    # 인용 [n] 붙이기
    answered, citations = attach_citations(draft, passages)

    # -----------------------------------------------------
    # A-7: /query 전용 사용량 로그 (토큰/used_k/가중치 등)
    # -----------------------------------------------------
    usage = getattr(completion, "usage", None)
    tokens = None
    if usage is not None:
        # openai>=1.x 기준 usage 객체: prompt_tokens, completion_tokens, total_tokens
        tokens = {
            "prompt": getattr(usage, "prompt_tokens", None),
            "completion": getattr(usage, "completion_tokens", None),
            "total": getattr(usage, "total_tokens", None),
        }

    req_id = getattr(request.state, "request_id", None)

    log_data = {
        "ts": int(time.time() * 1000),
        "level": "INFO",
        "request_id": req_id,
        "route": "query",
        "workspace": WORKSPACE,
        "group_id": str(gid) if gid else None,
        "used_k": used_k,
        "model": CHAT_MODEL,
        "w_vec": w_vec,
        "w_lex": w_lex,
        "diversity_penalty": diversity_penalty,
        "prefer_team_answer": prefer_team_answer,
        "tokens": tokens,
    }
    logger.info(json.dumps(log_data, ensure_ascii=False))

    return {
        "answer": answered or draft,
        "citations": citations,
        "debug": {
            "weights": {"vec": w_vec, "lex": w_lex},
            "diversity_penalty": diversity_penalty,
            "per_doc_limit": per_doc_limit,
            "used_k": used_k,
            "workspace": WORKSPACE,
            "group_id": str(gid) if gid else None,
            "prefer_team_answer": prefer_team_answer,
        },
    }
