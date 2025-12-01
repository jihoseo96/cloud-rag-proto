from fastapi import Header, HTTPException

async def verify_manager_role(x_user_role: str = Header(default="viewer")):
    """
    Simple RBAC dependency.
    In production, this would verify a JWT token claims.
    For MVP, we trust the header (internal service) or mock it.
    """
    if x_user_role != "manager" and x_user_role != "admin":
        raise HTTPException(status_code=403, detail="Manager role required for this action")
    return x_user_role
