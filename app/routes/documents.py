# app/routes/documents.py
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models.db import SessionLocal
from app.models.document import Document
from app.models.chunk import Chunk
from app.services.indexer import index_document
from app.services.s3 import put_pdf, presign
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
    group_id: Optional[str] = Form(None),
    folder_id: Optional[str] = Form(None), # Added folder_id
):
    """
    파일 업로드 엔드포인트.
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

    # folder_id 파싱
    fid = None
    if folder_id:
        try:
            fid = uuid.UUID(folder_id)
        except Exception:
             # Ignore invalid folder_id or raise error? Let's ignore for robustness or raise.
             pass

    # 문서 메타데이터 저장
    db.add(
        Document(
            id=doc_id,
            workspace=WORKSPACE,
            s3_key_raw=key,
            title=title,
            group_id=gid,
            sha256=file_hash,
            parent_id=fid, # Set parent folder
            is_folder=False
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


# ---------------------------------------------------------
# 3) 문서 목록 조회 (A-2 Step1)
# ---------------------------------------------------------
@router.get("/list")
def list_documents(
    group_id: Optional[str] = None,
    workspace: str = WORKSPACE,
    db: Session = Depends(get_db),
):
    """
    문서 목록 조회.
    Source Documents (Knowledge Hub) only shows docs where group_id is NULL.
    """
    query = db.query(Document).filter(Document.workspace == workspace, Document.is_folder == False) # Only files

    if group_id:
        try:
            gid = uuid.UUID(group_id)
            query = query.filter(Document.group_id == gid)
        except ValueError:
            return []
    else:
        # If no group_id provided, assume Source Documents (Global) -> group_id IS NULL
        query = query.filter(Document.group_id.is_(None))
    
    # 최신순 정렬
    docs = query.order_by(Document.created_at.desc()).all()

    return [
        {
            "id": str(d.id),
            "title": d.title,
            "s3_key_raw": d.s3_key_raw,
            "sha256": d.sha256,
            "created_at": d.created_at.isoformat() if d.created_at else None,
            "group_id": str(d.group_id) if d.group_id else None,
            "workspace": d.workspace,
            
            # Frontend specific fields
            "fileName": d.title,
            "uploadedAt": d.created_at.isoformat() if d.created_at else None,
            "parsingStatus": "completed", # Mock for now
            "fileSize": "1.2 MB" # Mock for now
        }
        for d in docs
    ]

class DocumentUpdate(BaseModel):
    parent_id: Optional[str] = None

@router.put("/{document_id}")
def update_document(document_id: str, body: DocumentUpdate, db: Session = Depends(get_db)):
    try:
        doc_uuid = uuid.UUID(document_id)
    except:
        raise HTTPException(400, "Invalid ID")
        
    doc = db.get(Document, doc_uuid)
    if not doc:
        raise HTTPException(404, "Document not found")
        
    # Update parent_id (Move)
    if body.parent_id:
        try:
            doc.parent_id = uuid.UUID(body.parent_id)
        except:
            doc.parent_id = None # Root
    else:
        doc.parent_id = None # Move to root
        
    db.commit()
    return {"status": "updated", "id": document_id, "parent_id": str(doc.parent_id) if doc.parent_id else None}

@router.delete("/{document_id}")
def delete_document(document_id: str, db: Session = Depends(get_db)):
    try:
        doc_uuid = uuid.UUID(document_id)
    except:
        raise HTTPException(400, "Invalid ID")
        
    doc = db.get(Document, doc_uuid)
    if not doc:
        raise HTTPException(404, "Document not found")
        
    # If folder, delete children (simple cascade for now)
    if doc.is_folder:
        children = db.query(Document).filter(Document.parent_id == doc.id).all()
        for child in children:
            db.delete(child)
            
    db.delete(doc)
    db.commit()
    return {"status": "deleted", "id": document_id}

# ---------------------------------------------------------
# 4) Folder Management & Tree View
# ---------------------------------------------------------

class FolderCreate(BaseModel):
    name: str
    parent_id: Optional[str] = None

@router.post("/folders")
def create_folder(body: FolderCreate, db: Session = Depends(get_db)):
    parent_uuid = None
    if body.parent_id:
        try:
            parent_uuid = uuid.UUID(body.parent_id)
        except:
            pass
            
    new_folder = Document(
        id=uuid.uuid4(),
        workspace=WORKSPACE,
        title=body.name,
        is_folder=True,
        parent_id=parent_uuid,
        s3_key_raw=None # No S3 key for folders
    )
    db.add(new_folder)
    db.commit()
    db.refresh(new_folder)
    
    return {
        "id": str(new_folder.id),
        "name": new_folder.title,
        "type": "folder",
        "children": []
    }

@router.get("/tree")
def get_document_tree(
    group_id: Optional[str] = None,
    workspace: str = WORKSPACE, 
    db: Session = Depends(get_db)
):
    """
    Fetch all documents and folders, construct a tree structure.
    If group_id is None, fetches only global documents (group_id IS NULL).
    """
    query = db.query(Document).filter(Document.workspace == workspace)
    
    if group_id:
        try:
            gid = uuid.UUID(group_id)
            query = query.filter(Document.group_id == gid)
        except:
            return []
    else:
        # Default: Global Knowledge Hub -> group_id IS NULL
        query = query.filter(Document.group_id.is_(None))
        
    all_docs = query.all()
    
    # Build map
    doc_map = {}
    roots = []
    
    # First pass: create nodes
    for doc in all_docs:
        node = {
            "id": str(doc.id),
            "name": doc.title,
            "type": "folder" if doc.is_folder else "file",
            "uploadedAt": doc.created_at.isoformat() if doc.created_at else None,
            "parsingStatus": "completed", # Mock
            "fileSize": "1.2 MB" if not doc.is_folder else None,
            "children": [],
            "expanded": True # Default expanded
        }
        doc_map[doc.id] = node
        
    # Second pass: link children
    for doc in all_docs:
        node = doc_map[doc.id]
        if doc.parent_id and doc.parent_id in doc_map:
            parent = doc_map[doc.parent_id]
            parent["children"].append(node)
        else:
            roots.append(node)
            
    return roots
