# app/services/answers.py
import uuid
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.models.answer import AnswerCard, AnswerChunk, AnswerCardLog
from app.services.embed import embed_texts
from app.services.chunker import chunk_pages

def create_answer_card(
    db: Session,
    workspace: str,
    group_id,
    question: str,
    answer: str,
    created_by: str,
    source_sha256_list: Optional[list[str]] = None,
) -> AnswerCard:
    card = AnswerCard(
        id=uuid.uuid4(),
        workspace=workspace,
        group_id=group_id,
        question=question,
        answer=answer,
        answer_plain=answer,  # 일단은 그대로 저장, 추후 [n] 제거 로직 넣어도 됨
        status="draft",
        created_by=created_by,
        source_sha256_list=source_sha256_list or [],
    )
    db.add(card)
    db.flush()  # card.id 확보

    _index_answer_card(db, card)

    db.add(AnswerCardLog(
        id=uuid.uuid4(),
        answer_id=card.id,
        action="created",
        actor=created_by,
        note=None,
    ))
    db.commit()
    db.refresh(card)
    return card

def _index_answer_card(db: Session, card: AnswerCard):
    """
    answer 전체를 한 페이지로 보고 chunk_pages 재사용해서 쪼갠 뒤 임베딩 저장.
    """
    # chunk_pages는 List[str] → [{page,text}] 구조니까 리스트로 감싸줌
    chunks = chunk_pages([card.answer])  # page=1로 돌아오지만 어차피 가상이라 상관 없음

    texts = [c["text"] for c in chunks]
    embs = embed_texts(texts)

    for c, emb in zip(chunks, embs):
        db.add(AnswerChunk(
            id=uuid.uuid4(),
            answer_id=card.id,
            page=0,               # 정답 카드는 가상 페이지 0으로 통일
            text=c["text"],
            embedding=emb,
        ))

def approve_answer_card(
    db: Session,
    answer_id,
    reviewer: str,
    note: Optional[str] = None,
) -> AnswerCard:
    card = db.get(AnswerCard, answer_id)
    if not card:
        raise ValueError("answer_card not found")

    card.status = "approved"
    card.reviewed_by = reviewer

    db.add(AnswerCardLog(
        id=uuid.uuid4(),
        answer_id=card.id,
        action="approved",
        actor=reviewer,
        note=note,
    ))
    db.commit()
    db.refresh(card)
    return card