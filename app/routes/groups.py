from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.db import SessionLocal
from app.models.group import Group, GroupInstruction, GroupMember

router = APIRouter(prefix="/groups", tags=["groups"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class InstructionBody(BaseModel):
    instruction: str

def _assert_member(db: Session, group_id: UUID, user_email: str, need_admin: bool=False):
    m = db.query(GroupMember).filter(
        GroupMember.group_id==group_id,
        GroupMember.user_email==user_email
    ).first()
    if not m:
        raise HTTPException(403, "not a member of this group")
    if need_admin and m.role != "admin":
        raise HTTPException(403, "admin role required")

@router.get("/{group_id}/instruction")
def get_instruction(group_id: UUID, db: Session = Depends(get_db)):
    gi = db.get(GroupInstruction, group_id)
    return {"group_id": str(group_id), "instruction": gi.instruction if gi else ""}

@router.put("/{group_id}/instruction")
def put_instruction(group_id: UUID, body: InstructionBody, db: Session = Depends(get_db)):
    # 임시: 인증 없으므로 쿼리파라미터/헤더에서 가져왔다고 가정
    user_email = "jihoseo852@gmail.com"
    _assert_member(db, group_id, user_email, need_admin=True)

    gi = db.get(GroupInstruction, group_id)
    if gi:
        gi.instruction = body.instruction
    else:
        gi = GroupInstruction(group_id=group_id, instruction=body.instruction)
        db.add(gi)
    db.commit()
    return {"ok": True}
