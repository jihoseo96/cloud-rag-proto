from typing import List, Dict, Any, Optional, Tuple
import uuid
from sqlalchemy.orm import Session
from app.models.document import Document
from app.utils.pdf_hwp_parser import parse_pdf, parse_hwp
from app.utils.semantic_hash import compute_sha256

def detect_conflicts(db: Session, file_hash: str, workspace: str) -> Optional[Dict[str, Any]]:
    """
    Check if a document with the same SHA256 hash already exists in the workspace.
    Returns conflict details if found, otherwise None.
    """
    existing_doc = db.query(Document).filter(
        Document.workspace == workspace,
        Document.sha256 == file_hash
    ).first()

    if existing_doc:
        return {
            "conflict_type": "exact_duplicate",
            "document_id": str(existing_doc.id),
            "title": existing_doc.title,
            "created_at": existing_doc.created_at.isoformat() if existing_doc.created_at else None
        }
    return None

def ingest_document(
    db: Session,
    file_bytes: bytes,
    filename: str,
    workspace: str,
    group_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Process a document:
    1. Compute SHA256.
    2. Detect conflicts.
    3. Parse text (if no conflict).
    4. Save to DB.
    5. Return result.
    """
    # 1. Compute Hash
    file_hash = compute_sha256(file_bytes)

    # 2. Detect Conflicts
    conflict = detect_conflicts(db, file_hash, workspace)
    if conflict:
        return {
            "status": "conflict",
            "sha256": file_hash,
            "conflict_details": conflict
        }

    # 3. Parse Document
    parse_result = {}
    lower_filename = filename.lower()
    if lower_filename.endswith(".pdf"):
        parse_result = parse_pdf(file_bytes)
    elif lower_filename.endswith(".hwp"):
        parse_result = parse_hwp(file_bytes)
    else:
        # Fallback for text/md or unsupported
        try:
            text_content = file_bytes.decode("utf-8")
            parse_result = {"text": text_content, "pages": []}
        except UnicodeDecodeError:
             parse_result = {"text": "", "error": "Unsupported file format or decoding failed"}

    # 4. Save to DB
    # Convert group_id string to UUID if present
    gid = uuid.UUID(group_id) if group_id else None

    new_doc = Document(
        id=uuid.uuid4(),
        workspace=workspace,
        group_id=gid,
        title=filename,
        s3_key_raw=f"local/{filename}", # Placeholder for MVP
        sha256=file_hash
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    return {
        "status": "success",
        "document_id": str(new_doc.id),
        "sha256": file_hash,
        "parsed_text": parse_result.get("text", ""),
        "metadata": parse_result.get("metadata", {}),
        "pages": parse_result.get("pages", [])
    }
