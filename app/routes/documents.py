# app/routes/documents.py
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.models.db import SessionLocal
from app.models.document import Document
from app.services.s3 import put_pdf
from app.services.indexer import index_document
import os, uuid

router = APIRouter(prefix="/documents", tags=["documents"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

WORKSPACE = os.getenv("WORKSPACE","personal")

@router.post("/upload")
async def upload_pdf(
    request: Request,
    file: UploadFile = File(...),        # ← 명시
    title: str = Form(...),
    db: Session = Depends(get_db),
    group_id: str | None = Form(None),
):
    content = await file.read()

    # PDF 시그니처/크기 검증: 여기서 400으로 컷 (pypdf/pdfminer까지 가지 않음)
    head = content[:8].lstrip()
    if len(content) < 8 or not head.startswith(b"%PDF-"):
        # 디버그 저장
        dbg_path = f"/tmp/orig-{uuid.uuid4()}-{file.filename}"
        with open(dbg_path, "wb") as f:
            f.write(content)
        raise HTTPException(
            status_code=400,
            detail=f"Not a valid PDF: size={len(content)}, head={content[:32]!r}, saved={dbg_path}",
        )

    print(f"[upload] len(content)={len(content)}, head={content[:8]!r}, ct={request.headers.get('content-type')}")

    # S3 업로드(원본 바이트 그대로)
    doc_id, key = put_pdf(content, title)
    if isinstance(doc_id, str):
        doc_id = uuid.UUID(doc_id)
        
    gid = None
    if group_id:
        try:
            gid = uuid.UUID(group_id)
        except Exception:
            raise HTTPException(status_code=422, detail="invalid group_id (must be UUID)")

    db.add(Document(id=doc_id, workspace=WORKSPACE, s3_key_raw=key, title=title,group_id=gid,))
    db.commit()

    # 인덱싱에 **원본 바이트 그대로 전달** → S3 왕복 제거
    index_document(db, doc_id, key, title, pdf_bytes=content)

    # FastAPI가 UUID를 자동 직렬화하지만, 확실히 하려면 str(...)로 반환
    return {"status": "indexed", "document_id": str(doc_id), "s3_key": key,"group_id": str(gid) if gid else None}
