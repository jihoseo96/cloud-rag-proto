# app/routes/documents.py
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.models.db import SessionLocal
from app.models.document import Document
from app.services.s3 import put_pdf
from app.services.indexer import index_document
import os, uuid, hashlib

router = APIRouter(prefix="/documents", tags=["documents"])


# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


WORKSPACE = os.getenv("WORKSPACE", "personal")


# ---------------------------------------------------------
# 1) 업로드 (멱등 처리 + SHA-256 기반 중복 체크)
# ---------------------------------------------------------
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
    - SHA-256 해시로 멱등 처리
    - 기존 파일과 동일하면 S3/인덱싱 스킵
    - extract_text_pages가 포맷 자동 판별
    """
    # 파일 바이트 읽기
    content = await file.read()

    # 너무 작은 파일 방어
    if len(content) < 8:
        dbg_path = f"/tmp/orig-{uuid.uuid4()}-{file.filename}"
        with open(dbg_path, "wb") as f:
            f.write(content)
        raise HTTPException(
            status_code=400,
            detail=f"File too small: size={len(content)}, saved={dbg_path}",
        )

    # SHA-256 계산
    file_hash = hashlib.sha256(content).hexdigest()

    # 이미 같은 파일이 업로드된 적이 있으면 재사용
    existing = (
        db.query(Document)
        .filter(
            Document.workspace == WORKSPACE,
            Document.sha256 == file_hash,
        )
        .first()
    )

    if existing:
        return {
            "status": "already_indexed",
            "document_id": str(existing.id),
            "s3_key": existing.s3_key_raw,
            "group_id": str(existing.group_id) if existing.group_id else None,
            "duplicate": True,
        }

    print(
        f"[upload] len(content)={len(content)}, "
        f"filename={file.filename!r}, ct={request.headers.get('content-type')}"
    )

    # S3에 원본 바이트 업로드
    doc_id, key = put_pdf(content, title)
    if isinstance(doc_id, str):
        doc_id = uuid.UUID(doc_id)

    # group_id 파싱
    gid = None
    if group_id:
        try:
            gid = uuid.UUID(group_id)
        except Exception:
            raise HTTPException(status_code=422, detail="invalid group_id (must be UUID)")

    # 문서 메타데이터 저장
    db.add(
        Document(
            id=doc_id,
            workspace=WORKSPACE,
            s3_key_raw=key,
            title=title,
            group_id=gid,
            sha256=file_hash,  # 🔥 A-1 핵심
        )
    )
    db.commit()

    # 원본 바이트 그대로 전달 (S3 왕복 제거)
    index_document(db, doc_id, key, title, pdf_bytes=content)

    return {
        "status": "indexed",
        "document_id": str(doc_id),
        "s3_key": key,
        "group_id": str(gid) if gid else None,
        "duplicate": False,
    }


# ---------------------------------------------------------
# 2) 재인덱스 API (A-2 Step2)
# ---------------------------------------------------------
@router.post("/{document_id}/reindex")
def reindex_document(
    document_id: str,
    db: Session = Depends(get_db),
):
    """
    특정 document_id에 대해 재인덱스를 수행한다.
    - 기존 청크 싹 삭제
    - S3 원본 기준으로 새로 extract→chunk→embed→저장
    """
    # UUID 파싱
    try:
        doc_uuid = uuid.UUID(document_id)
    except Exception:
        raise HTTPException(status_code=422, detail="invalid document_id (must be UUID)")

    # 문서 조회
    doc = (
        db.query(Document)
        .filter(
            Document.id == doc_uuid,
            Document.workspace == WORKSPACE,
        )
        .first()
    )

    if not doc:
        raise HTTPException(status_code=404, detail="document not found")

    # 재인덱스 실행 (S3에서 원본 읽어옴)
    try:
        created_chunks = index_document(
            db=db,
            doc_id=doc.id,
            s3_key=doc.s3_key_raw,
            title=doc.title,
            pdf_bytes=None,  # 재인덱스는 굳이 바이트 전달할 필요 없음
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"reindex failed: {type(e).__name__}: {e}",
        )

    return {
        "status": "reindexed",
        "document_id": document_id,
        "workspace": doc.workspace,
        "group_id": str(doc.group_id) if doc.group_id else None,
        "chunks": created_chunks,
    }
