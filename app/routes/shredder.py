from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.models.db import SessionLocal
from app.services.shredder import calculate_shredding_cost, shred_rfp
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/shredder", tags=["shredder"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class EstimateBody(BaseModel):
    text: str

class ShredBody(BaseModel):
    project_id: str
    text: str
    confirm_cost: bool = False

@router.post("/estimate")
def estimate_cost(body: EstimateBody):
    """
    Calculate estimated cost for shredding the provided text.
    """
    return calculate_shredding_cost(body.text)

@router.post("/execute")
def execute_shredding(body: ShredBody, db: Session = Depends(get_db)):
    """
    Execute RFP shredding.
    Requires 'confirm_cost' to be True.
    """
    if not body.confirm_cost:
        cost = calculate_shredding_cost(body.text)
        raise HTTPException(
            status_code=402, 
            detail=f"Cost approval required. Estimated cost: {cost['estimated_cost_krw']} KRW. Set 'confirm_cost=True' to proceed."
        )
    
    try:
        requirements = shred_rfp(db, body.project_id, body.text)
        return {
            "status": "success", 
            "count": len(requirements),
            "requirements": [
                {
                    "id": str(r.id),
                    "text": r.requirement_text,
                    "type": r.requirement_type
                } for r in requirements
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
