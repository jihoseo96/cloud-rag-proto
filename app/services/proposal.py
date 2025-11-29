from typing import List, Dict, Any, Optional
import uuid
import json
from sqlalchemy.orm import Session
from app.models.project import Project
from app.models.rfp_requirement import RFPRequirement
from app.models.answer import AnswerCard
from app.services.search import search_chunks # Placeholder for now, or implement vector search here

def map_requirements_to_answers(db: Session, project_id: str) -> Dict[str, Any]:
    """
    Map each requirement in the project to the best matching AnswerCards.
    Updates the 'linked_answer_cards' field in RFPRequirement.
    """
    project_uuid = uuid.UUID(project_id)
    requirements = db.query(RFPRequirement).filter(RFPRequirement.project_id == project_uuid).all()
    
    mapped_count = 0
    
    for req in requirements:
        # 1. Search for relevant AnswerCards
        # For MVP, we'll use a simple keyword match or placeholder.
        # In production, this would use vector search (pgvector).
        
        # Placeholder logic: Find answers that share words with the requirement
        # This is very basic. Real implementation needs embeddings.
        keywords = req.requirement_text.split()[:3] # Take first 3 words
        query = db.query(AnswerCard).filter(AnswerCard.workspace == "personal") # Assuming personal workspace for now
        
        matched_cards = []
        for card in query.limit(50).all():
             if any(k.lower() in card.question.lower() or k.lower() in card.answer.lower() for k in keywords):
                 matched_cards.append(str(card.id))
                 if len(matched_cards) >= 3: # Top 3 matches
                     break
        
        if matched_cards:
            req.linked_answer_cards = matched_cards
            req.anchor_confidence = 0.85 # Dummy confidence
            mapped_count += 1
    
    db.commit()
    return {
        "total_requirements": len(requirements),
        "mapped_requirements": mapped_count
    }

def generate_skeleton(db: Session, project_id: str, template_id: str = "default") -> Dict[str, Any]:
    """
    Generate a proposal skeleton based on a template and mapped requirements.
    """
    project = db.get(Project, uuid.UUID(project_id))
    if not project:
        raise ValueError("Project not found")

    # Hardcoded template for MVP
    template_structure = [
        {"section": "1. Executive Summary", "content": "To be filled..."},
        {"section": "2. Company Overview", "content": "To be filled..."},
        {"section": "3. Proposed Solution", "requirements_match": "technical"},
        {"section": "4. Security & Compliance", "requirements_match": "security"},
        {"section": "5. Pricing", "content": "To be filled..."}
    ]

    # Fetch requirements
    requirements = db.query(RFPRequirement).filter(RFPRequirement.project_id == project.id).all()
    
    skeleton = []
    
    for section in template_structure:
        section_data = {"title": section["section"], "content": []}
        
        req_type = section.get("requirements_match")
        if req_type:
            # Find requirements of this type
            relevant_reqs = [r for r in requirements if r.requirement_type == req_type]
            
            for r in relevant_reqs:
                # Get linked answers
                answers = []
                if r.linked_answer_cards:
                    for ans_id in r.linked_answer_cards:
                        card = db.get(AnswerCard, uuid.UUID(ans_id))
                        if card:
                            answers.append({"question": card.question, "answer": card.answer})
                
                section_data["content"].append({
                    "requirement": r.requirement_text,
                    "proposed_answer": answers[0]["answer"] if answers else "No answer found."
                })
        else:
            section_data["content"] = section.get("content", "")
            
        skeleton.append(section_data)

    return {
        "project_name": project.name,
        "skeleton": skeleton
    }
