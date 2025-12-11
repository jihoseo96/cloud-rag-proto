from typing import List, Dict, Any, Optional, Tuple
import uuid
import os
import datetime
from sqlalchemy.orm import Session
from app.models.document import Document
from app.utils.pdf_hwp_parser import parse_pdf, parse_hwp
from app.utils.semantic_hash import compute_sha256
from google.cloud import storage

# GCS Configuration
GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME", "cloud-rag-proto-bucket") # Default/Fallback
storage_client = storage.Client()

def upload_file_to_gcs(bucket_name: str, source_file_content: bytes, destination_blob_name: str):
    """Uploads a file to the bucket."""
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_string(source_file_content, content_type="application/octet-stream")
    print(f"File uploaded to {destination_blob_name}.")
    return f"gs://{bucket_name}/{destination_blob_name}"

def generate_signed_url(bucket_name: str, blob_name: str):
    """Generates a v4 signed URL for downloading a blob."""
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)

    url = blob.generate_signed_url(
        version="v4",
        expiration=datetime.timedelta(minutes=15),
        method="GET",
    )
    return url

def download_bytes_from_gcs(bucket_name: str, blob_name: str) -> bytes:
    """Downloads a blob into memory."""
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    return blob.download_as_bytes()

def detect_conflicts(db: Session, file_hash: str, filename: str, workspace: str, group_id: Optional[uuid.UUID] = None) -> Optional[Dict[str, Any]]:
    """
    Check for conflicts:
    1. Exact Duplicate: Same Hash + Same Name
    2. Content Conflict: Same Hash + Diff Name
    3. Version Conflict: Diff Hash + Same Name
    """
    # Base query
    query = db.query(Document).filter(Document.workspace == workspace)
    
    # If group_id is provided, scope to that group. 
    # If None (Source Docs), scope to None.
    if group_id:
        query = query.filter(Document.group_id == group_id)
    else:
        query = query.filter(Document.group_id.is_(None))

    # Check by Hash
    hash_match = query.filter(Document.sha256 == file_hash).first()

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
    name_match = query.filter(Document.title == filename).first()

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
        # ... (logic remains similar, but scoped)
        
        # Convert group_id to UUID for query
        gid = uuid.UUID(group_id) if group_id else None
        
        query = db.query(Document).filter(Document.workspace == workspace, Document.title == filename)
        if gid:
            query = query.filter(Document.group_id == gid)
        else:
            query = query.filter(Document.group_id.is_(None))
            
        existing = query.first()
        if existing:
            db.delete(existing) 
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

    # Convert group_id string to UUID early for detection
    gid = uuid.UUID(group_id) if group_id else None

    # 2. Detect Conflicts
    conflict = detect_conflicts(db, file_hash, filename, workspace, gid)
    if conflict:
        return {
            "status": "conflict",
            "sha256": file_hash,
            "conflict_detail": conflict
        }

    # 3. Parse Document
    parse_result = {}
    lower_filename = filename.lower()
    
    try:
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
    except Exception as e:
        print(f"Parsing failed for {filename}: {e}")
        parse_result = {"text": "", "error": f"Parsing failed: {str(e)}"}

    # 4. Save to DB AND GCS
    print(f"[ingest] Saving to DB & GCS: {filename}, group_id={group_id}")
    try:
        # Convert group_id string to UUID if present
        gid = uuid.UUID(group_id) if group_id else None

        # Upload to GCS
        doc_uuid = uuid.uuid4()
        blob_name = f"{workspace}/{doc_uuid}/{filename}"
        s3_key = upload_file_to_gcs(GCS_BUCKET_NAME, file_bytes, blob_name) # Returns gs://...

        new_doc = Document(
            id=doc_uuid,
            workspace=workspace,
            group_id=gid,
            title=filename,
            s3_key_raw=blob_name, # Store the blob name (key) for easier access
            sha256=file_hash,
            is_folder=False, # Explicitly set for files
            parent_id=None,
            vertex_sync_status="PENDING" if gid else "PENDING" 
        )
        if gid:
            new_doc.vertex_sync_status = "PENDING"
            
        db.add(new_doc)
        db.commit()
        db.refresh(new_doc)
        print(f"[ingest] DB commit successful: {new_doc.id}")

        # Trigger Vertex Indexing for Knowledge Hub (Group) Documents
        if gid:
            try:
                from app.services.indexer import index_file_to_vertex
                index_file_to_vertex(db, str(new_doc.id))
            except Exception as e:
                print(f"[ingest] Failed to trigger Vertex Indexing: {e}")

    except Exception as e:
        print(f"[ingest] DB/GCS Save Failed: {e}")
        db.rollback()
        raise e

    return {
        "status": "success",
        "document_id": str(new_doc.id),
        "sha256": file_hash,
        "parsed_text": parse_result.get("text", ""),
        "metadata": parse_result.get("metadata", {}),
        "pages": parse_result.get("pages", [])
    }
