from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.models.db import SessionLocal
from app.models.audit_log import AuditLog
import json
import uuid
from datetime import datetime

class AuditLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Only audit state-changing methods on specific paths
        if request.method in ["POST", "PUT", "PATCH", "DELETE"] and \
           any(path in request.url.path for path in ["/proposal", "/ingest", "/projects", "/answers"]):
            
            # Clone request body to read it (stream is consumed otherwise)
            # Note: This is a simple implementation. For large files (ingest), be careful.
            # For /ingest/upload, we might skip body logging or handle it differently.
            body_bytes = await request.body()
            await self.set_body(request, body_bytes)
            
            response = await call_next(request)
            
            # Log only successful operations
            if 200 <= response.status_code < 300:
                self.log_action(request, body_bytes, response.status_code)
                
            return response
        else:
            return await call_next(request)

    async def set_body(self, request: Request, body: bytes):
        async def receive():
            return {"type": "http.request", "body": body}
        request._receive = receive

    def log_action(self, request: Request, body: bytes, status_code: int):
        db = SessionLocal()
        try:
            # Extract user_id from headers or token (mock for now)
            user_id = request.headers.get("X-User-ID", "anonymous")
            
            # Determine action and entity
            action = request.method
            entity_type = "unknown"
            entity_id = None
            
            path_parts = request.url.path.split("/")
            if "projects" in path_parts:
                entity_type = "project"
                # Try to find UUID in path
                for part in path_parts:
                    try:
                        uuid.UUID(part)
                        entity_id = part
                        break
                    except:
                        pass
            elif "ingest" in path_parts:
                entity_type = "upload"
            elif "proposal" in path_parts:
                entity_type = "proposal"
            
            # Parse body for details if JSON
            diff_snapshot = {}
            try:
                if request.headers.get("content-type") == "application/json":
                    diff_snapshot = json.loads(body)
            except:
                diff_snapshot = {"info": "Binary or non-JSON body"}

            audit_log = AuditLog(
                id=uuid.uuid4(),
                entity_type=entity_type,
                entity_id=uuid.UUID(entity_id) if entity_id else uuid.uuid4(), # Fallback if no ID found
                action=action,
                user_id=user_id,
                timestamp=datetime.utcnow(),
                diff_snapshot=diff_snapshot
            )
            db.add(audit_log)
            db.commit()
        except Exception as e:
            print(f"Audit Log Error: {e}")
        finally:
            db.close()
