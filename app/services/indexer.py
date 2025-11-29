# app/services/indexer.py
import uuid
from typing import Optional
from sqlalchemy.orm import Session
from app.services.s3 import get_pdf_bytes
from .extract import extract_text_pages
from .chunker import chunk_pages
from .embed import embed_texts
from app.models.chunk import Chunk

def index_document(
    db: Session,
    doc_id,            # uuid.UUID 권장
    s3_key: str,
    title: str,
    pdf_bytes: Optional[bytes] = None,
) -> int:
    """
    주어진 document에 대해 인덱싱(또는 재인덱싱)을 수행한다.

    - pdf_bytes가 주어지면 그 바이트를 사용하고,
      없으면 s3_key 기준으로 S3에서 파일을 읽어온다.
    - 항상 기존 Chunk를 싹 지운 뒤 새로 생성하므로,
      여러 번 호출해도 중복 청크가 생기지 않는다.
    - 리턴값: 생성된 chunk 개수
    """

    # 1) 원본 파일 바이트 확보 (업로드에서 넘겨주면 S3 왕복을 줄일 수 있음)
    if pdf_bytes is None:
        pdf_bytes = get_pdf_bytes(s3_key)

    if not pdf_bytes or len(pdf_bytes) == 0:
        # 상황에 따라 log만 찍고 넘길지, 에러를 던질지 정책 결정 가능
        raise ValueError(f"index_document: empty file for doc_id={doc_id}")

    # 2) 페이지 단위 텍스트 추출 (PDF / DOCX / PPTX / TXT / MD 자동 판별)
    pages = extract_text_pages(pdf_bytes)

    # 3) 페이지 → 청크 목록으로 변환
    #    chunk_pages는 [{"page": int, "text": "..."} ...] 형태를 반환한다고 가정
    chunks = chunk_pages(pages)

    if not chunks:
        # 빈 문서면 청크만 삭제하고 0 반환
        db.query(Chunk).filter(Chunk.document_id == doc_id).delete()
        db.commit()
        return 0

    # 4) 청크 텍스트 임베딩
    texts = [c["text"] for c in chunks]
    embs  = embed_texts(texts)

    # 5) 🔥 기존 청크 전부 삭제 → 재인덱스 시에도 중복 NO
    db.query(Chunk).filter(Chunk.document_id == doc_id).delete()

    # 6) 새 청크 + 임베딩 저장
    for c, e in zip(chunks, embs):
        db.add(
            Chunk(
                id=uuid.uuid4(),
                document_id=doc_id,
                page=c["page"],
                text=c["text"],
                embedding=e,
            )
        )

    db.commit()

    return len(chunks)
