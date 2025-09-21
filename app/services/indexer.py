# app/services/indexer.py
import uuid
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
    pdf_bytes: bytes | None = None,
):
    # 1) 업로드에서 전달된 원본 바이트가 있으면 그걸 사용
    if pdf_bytes is None:
        # 2) 없을 때만 S3에서 바로 바이트로 읽기 (boto3)
        pdf_bytes = get_pdf_bytes(s3_key)

    print(f"[indexer] pdf_bytes len={len(pdf_bytes)}")  # 디버그

    # extract는 bytes를 받아도 OK(내부에서 BytesIO로 감쌈)
    pages = extract_text_pages(pdf_bytes)
    chunks = chunk_pages(pages)

    texts = [c["text"] for c in chunks]
    embs  = embed_texts(texts)

    for c, e in zip(chunks, embs):
        db.add(Chunk(
            id=uuid.uuid4(),
            document_id=doc_id,
            page=c["page"],
            text=c["text"],
            embedding=e
        ))
    db.commit()
