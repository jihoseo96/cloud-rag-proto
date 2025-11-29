from typing import List, Dict, Any, Optional

def assess_risk(text: str, facts: Dict[str, Any]) -> Dict[str, Any]:
    """
    Assess the risk level of a text based on provided facts.
    Returns a dictionary with 'risk_level' (SAFE/HIGH) and 'reason'.
    
    For MVP, this is a placeholder or simple keyword check.
    In production, this would call an LLM.
    """
    # Simple keyword-based risk check for MVP
    risk_keywords = ["guarantee", "always", "never", "100%", "unlimited"]
    
    found_risks = [kw for kw in risk_keywords if kw in text.lower()]
    
    if found_risks:
        return {
            "risk_level": "HIGH",
            "reason": f"Contains risky keywords: {', '.join(found_risks)}"
        }
    
    return {
        "risk_level": "SAFE",
        "reason": "No obvious risk factors detected."
    }
