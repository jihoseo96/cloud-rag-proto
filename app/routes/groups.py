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
        
@router.get("")
def list_my_groups(db: Session = Depends(get_db)):
    """
    현재 로그인한(이라고 가정한) 유저가 속한 그룹 목록을 반환.
    MVP에서는 이메일을 하드코딩해서 사용.
    """
    user_email = "jihoseo852@gmail.com"

    groups = (
        db.query(Group)
        .join(GroupMember, GroupMember.group_id == Group.id)
        .filter(GroupMember.user_email == user_email)
        .all()
    )

    # 프론트에서 쓰기 좋은 형태로 가볍게 변환
    return [
        {
            "id": str(g.id),
            "workspace": g.workspace,
            "name": g.name,
            "created_at": g.created_at.isoformat() if g.created_at else None,
        }
        for g in groups
    ]

class InstructionBody(BaseModel):
    instruction: str

def _assert_member(db: Session, group_id: UUID, user_email: str, need_admin: bool=False):
    m = db.query(GroupMember).filter(
        GroupMember.group_id==group_id,
        GroupMember.user_email==user_email
    ).first()
    if not m:
        raise HTTPException(403, "not a member of this group")
    if admin_only and m.role != "admin":
        raise HTTPException(403, "admin role required")

@router.get("/{group_id}/instruction")
def get_instructions(group_id: UUID, db: Session = Depends(get_db)):
    instructions = db.query(GroupInstruction).filter(GroupInstruction.group_id == group_id).all()
    return [
        {
            "id": str(i.id),
            "title": i.title,
            "instruction": i.instruction,
            "updated_at": i.updated_at
        }
        for i in instructions
    ]

@router.post("/{group_id}/instruction")
def create_instruction(
    group_id: UUID,
    body: InstructionBody,
    db: Session = Depends(get_db),
    current_user: str = "jihoseo852@gmail.com"  # MVP hardcoded
):
    _assert_member(db, group_id, current_user, admin_only=True)
    
    new_instruction = GroupInstruction(
        id=uuid.uuid4(),
        group_id=group_id,
        title=body.title,
        instruction=body.instruction
    )
    db.add(new_instruction)
    db.commit()
    db.refresh(new_instruction)
    return {"status": "created", "id": str(new_instruction.id)}

@router.put("/{group_id}/instruction/{instruction_id}")
def update_instruction(
    group_id: UUID,
    instruction_id: UUID,
    body: InstructionBody,
    db: Session = Depends(get_db),
    current_user: str = "jihoseo852@gmail.com"
):
    _assert_member(db, group_id, current_user, admin_only=True)
    
    instruction = db.query(GroupInstruction).filter(
        GroupInstruction.group_id == group_id,
        GroupInstruction.id == instruction_id
    ).first()
    
    if not instruction:
        raise HTTPException(404, "Instruction not found")
        
    instruction.title = body.title
    instruction.instruction = body.instruction
    db.commit()
    return {"status": "updated"}

@router.delete("/{group_id}/instruction/{instruction_id}")
def delete_instruction(
    group_id: UUID,
    instruction_id: UUID,
    db: Session = Depends(get_db),
    current_user: str = "jihoseo852@gmail.com"
):
    _assert_member(db, group_id, current_user, admin_only=True)
    
    instruction = db.query(GroupInstruction).filter(
        GroupInstruction.group_id == group_id,
        GroupInstruction.id == instruction_id
    ).first()
    
    if not instruction:
        raise HTTPException(404, "Instruction not found")
        
    db.delete(instruction)
    db.commit()
    return {"status": "deleted"}
