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
    project = db.get(Project, project_uuid)
    if not project:
        raise ValueError(f"Project {project_id} not found")
        
    requirements = db.query(RFPRequirement).filter(RFPRequirement.project_id == project_uuid).all()
    
    from app.services.embed import embed_texts
    from app.services.search import search_chunks
    from app.services.answers import create_answer_card
    from openai import OpenAI
    import os
    
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    mapped_count = 0
    
    for req in requirements:
        # 1. Embed requirement
        try:
            qvec = embed_texts([req.requirement_text])[0]
        except:
            continue
            
        # 2. Search for existing answers
        results = search_chunks(
            db=db,
            qvec=qvec,
            qtext=req.requirement_text,
            top_k=3,
            prefer_team_answer=True,
            workspace="personal" # MVP hardcoded
        )
        
        best_match = None
        if results:
            top_result = results[0]
            # Increased threshold to 0.9 to avoid weak matches
            if top_result["source_type"] == "answer" and top_result["final_score"] > 0.9:
                best_match = top_result["answer_id"]
                print(f"[Proposal] Matched existing answer: {best_match} (Score: {top_result['final_score']})")
            else:
                print(f"[Proposal] Top result score {top_result['final_score']} below threshold 0.9 or not an answer.")
        else:
            print("[Proposal] No search results found.")
        
        if best_match:
            req.linked_answer_cards = [str(best_match)]
            req.anchor_confidence = results[0]["final_score"]
            mapped_count += 1
        else:
            # 3. Generate new answer if no good match
            print(f"[Proposal] Generating answer for requirement: {req.requirement_text[:30]}...")
            context_text = "\n".join([r["text"] for r in results]) if results else "No context available."
            
            prompt = f"""
            Requirement: {req.requirement_text}
            
            Context:
            {context_text}
            
            Based on the context, draft a response to the requirement. 
            If the context doesn't contain enough info, say "Requires manual input".
            """
            
            try:
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}]
                )
                generated_answer = response.choices[0].message.content
                
                # Create draft card
                new_card = create_answer_card(
                    db=db,
                    workspace="personal",
                    question=req.requirement_text,
                    answer=generated_answer,
                    created_by="AI_Generator",
                    status="draft",
                    anchors=[{"text": r["text"], "score": r["final_score"]} for r in results] if results else [],
                    group_id=project.group_id # Link to project's group if any
                )
                
                req.linked_answer_cards = [str(new_card.id)]
                req.anchor_confidence = 0.0 # Zero confidence for generated (User Request)
                mapped_count += 1
                print(f"[Proposal] Generated answer created: {new_card.id}")
            except Exception as e:
                print(f"Generation failed: {e}")
    
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
