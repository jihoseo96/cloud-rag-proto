from typing import List, Dict, Any, Optional

# In-memory storage for MVP. In production, use DB.
RISK_KEYWORDS = ["guarantee", "always", "never", "100%", "unlimited"]

def get_risk_keywords() -> List[str]:
    return RISK_KEYWORDS

def add_risk_keyword(keyword: str):
    if keyword not in RISK_KEYWORDS:
        RISK_KEYWORDS.append(keyword)

def remove_risk_keyword(keyword: str):
    if keyword in RISK_KEYWORDS:
        RISK_KEYWORDS.remove(keyword)

def assess_risk(text: str, facts: Dict[str, Any]) -> Dict[str, Any]:
    """
    Assess the risk level of a text based on provided facts.
    """
    found_risks = [kw for kw in RISK_KEYWORDS if kw in text.lower()]
    
    if found_risks:
        return {
            "risk_level": "HIGH",
            "reason": f"Contains risky keywords: {', '.join(found_risks)}"
        }
    
    return {
        "risk_level": "SAFE",
        "reason": "No obvious risk factors detected."
    }
