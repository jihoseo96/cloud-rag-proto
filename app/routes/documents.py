# app/routes/documents.py
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.models.db import SessionLocal
from app.models.document import Document
from app.services.s3 import put_pdf  # TODO: 멀티포맷 반영해서 나중에 put_document로 이름 변경 고려
from app.services.indexer import index_document
import os, uuid

router = APIRouter(prefix="/documents", tags=["documents"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


WORKSPACE = os.getenv("WORKSPACE", "personal")


@router.post("/upload")
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    title: str = Form(...),
    db: Session = Depends(get_db),
    group_id: str | None = Form(None),
):
    """
    파일 업로드 엔드포인트.
    - PDF / DOCX / PPTX / TXT / MD 등 바이너리라면 무엇이든 수용
    - S3에는 원본 바이트 그대로 저장
    - 인덱싱 단계에서 extract_text_pages가 포맷을 자동 판별
    """
    content = await file.read()

    # 너무 작은 파일 방어 로직 (포맷 제한 X)
    if len(content) < 8:
        dbg_path = f"/tmp/orig-{uuid.uuid4()}-{file.filename}"
        with open(dbg_path, "wb") as f:
            f.write(content)
        raise HTTPException(
            status_code=400,
            detail=f"File too small: size={len(content)}, saved={dbg_path}",
        )

    print(
        f"[upload] len(content)={len(content)}, "
        f"filename={file.filename!r}, ct={request.headers.get('content-type')}"
    )

    # S3 업로드(원본 바이트 그대로)
    # 현재 함수명이 put_pdf이지만, 실제로는 멀티포맷 바이너리를 저장하는 용도.
    # TODO: 나중에 s3.py까지 포함해서 put_document(...) 등으로 네이밍 정리 가능.
    doc_id, key = put_pdf(content, title)
    if isinstance(doc_id, str):
        doc_id = uuid.UUID(doc_id)

    # group_id 파싱 (optional)
    gid = None
    if group_id:
        try:
            gid = uuid.UUID(group_id)
        except Exception:
            raise HTTPException(status_code=422, detail="invalid group_id (must be UUID)")

    # document 메타 저장
    db.add(
        Document(
            id=doc_id,
            workspace=WORKSPACE,
            s3_key_raw=key,
            title=title,
            group_id=gid,
        )
    )
    db.commit()

    # 인덱싱에 **원본 바이트 그대로 전달** → S3 왕복 제거
    # index_document 내부에서 extract_text_pages(...)를 호출하고,
    # 그 함수가 PDF / DOCX / PPTX / TXT / MD를 자동 판별해서 텍스트를 뽑는다.
    #
    # 현재 인자 이름이 pdf_bytes지만, 의미상 "file_bytes" 역할을 한다는 점을 기억.
    # TODO: 추후 indexer.py 수정 시 pdf_bytes → file_bytes 등으로 이름을 정리해도 됨.
    index_document(db, doc_id, key, title, pdf_bytes=content)

    # FastAPI가 UUID를 자동 직렬화하지만, 확실히 하려면 str(...)로 반환
    return {
        "status": "indexed",
        "document_id": str(doc_id),
        "s3_key": key,
        "group_id": str(gid) if gid else None,
    }
