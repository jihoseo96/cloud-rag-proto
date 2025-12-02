from typing import List, Dict, Any, Optional, Tuple
import uuid
from sqlalchemy.orm import Session
from app.models.document import Document
from app.utils.pdf_hwp_parser import parse_pdf, parse_hwp
from app.utils.semantic_hash import compute_sha256

def detect_conflicts(db: Session, file_hash: str, filename: str, workspace: str) -> Optional[Dict[str, Any]]:
    """
    Check for conflicts:
    1. Exact Duplicate: Same Hash + Same Name
    2. Content Conflict: Same Hash + Diff Name
    3. Version Conflict: Diff Hash + Same Name
    """
    # Check by Hash
    hash_match = db.query(Document).filter(
        Document.workspace == workspace,
        Document.sha256 == file_hash
    ).first()

    if hash_match:
        if hash_match.title == filename:
            return {
                "conflict_type": "exact_duplicate",
                "document_id": str(hash_match.id),
                "title": hash_match.title,
                "created_at": hash_match.created_at.isoformat() if hash_match.created_at else None
            }
        else:
            return {
                "conflict_type": "content", # Same content, different name
                "document_id": str(hash_match.id),
                "existing_name": hash_match.title,
                "new_name": filename
            }

    # Check by Name (only if hash didn't match)
    name_match = db.query(Document).filter(
        Document.workspace == workspace,
        Document.title == filename
    ).first()

    if name_match:
        return {
            "conflict_type": "version", # Same name, different content
            "document_id": str(name_match.id),
            "title": name_match.title,
            "existing_hash": name_match.sha256,
            "new_hash": file_hash
        }

    return None

def resolve_conflict(
    db: Session,
    resolution: str, # keep_new, keep_old, merge
    file_bytes: bytes,
    filename: str,
    workspace: str,
    group_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Handle conflict resolution.
    """
    if resolution == "keep_old":
        return {"status": "ignored", "message": "User selected to keep existing file."}
    
    elif resolution == "keep_new":
        # Overwrite or Version Up? 
        # For MVP, we'll "Version Up" by appending timestamp or v2 to the OLD file, 
        # OR just add the NEW file as the "latest" (if we had version control).
        # Since we don't have real version control, we will Rename the NEW file to avoid DB constraint if any,
        # OR if we assume unique(workspace, title), we must rename/delete the old one.
        # Let's assume we want to Replace the content. But Document model is append-only usually.
        # Strategy: Delete old doc (or archive) and insert new one.
        
        existing = db.query(Document).filter(Document.workspace == workspace, Document.title == filename).first()
        if existing:
            db.delete(existing) # Simple replacement for MVP
            db.commit()
            
        return ingest_document(db, file_bytes, filename, workspace, group_id)

    elif resolution == "merge":
        # Keep both. Rename new file.
        new_filename = f"Copy_{filename}"
        return ingest_document(db, file_bytes, new_filename, workspace, group_id)
    
    else:
        raise ValueError(f"Unknown resolution: {resolution}")

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
    conflict = detect_conflicts(db, file_hash, filename, workspace)
    if conflict:
        return {
            "status": "conflict",
            "sha256": file_hash,
            "conflict_detail": conflict
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

    # Save file locally for MVP (Shredder needs it)
    import os
    upload_dir = "uploads"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    
    local_path = os.path.join(upload_dir, filename)
    with open(local_path, "wb") as f:
        f.write(file_bytes)

    new_doc = Document(
        id=uuid.uuid4(),
        workspace=workspace,
        group_id=gid,
        title=filename,
        s3_key_raw=f"file://{os.path.abspath(local_path)}", # Point to local file
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
