import requests
import json
import uuid

BASE_URL = "http://localhost:8000"
PROJECT_ID = "41c66a12-fc4a-4718-9536-834e84cb0529"

def test_shredder():
    print("\n--- Testing Shredder ---")
    text = "The system must support 2FA. The system must be deployed on AWS. The solution shall provide 99.9% uptime."
    
    # 1. Estimate Cost
    res = requests.post(f"{BASE_URL}/shredder/estimate", json={"text": text})
    if res.status_code == 200:
        print("✅ Cost Estimation Success:", res.json())
    else:
        print("❌ Cost Estimation Failed:", res.text)

    # 2. Execute Shredding
    payload = {
        "project_id": PROJECT_ID,
        "text": text,
        "confirm_cost": True
    }
    res = requests.post(f"{BASE_URL}/shredder/execute", json=payload)
    if res.status_code == 200:
        print("✅ Shredding Success:", json.dumps(res.json(), indent=2))
    else:
        print("❌ Shredding Failed:", res.text)

def test_proposal():
    print("\n--- Testing Proposal ---")
    
    # 1. Map Requirements
    res = requests.post(f"{BASE_URL}/proposal/map", json={"project_id": PROJECT_ID})
    if res.status_code == 200:
        print("✅ Mapping Success:", res.json())
    else:
        print("❌ Mapping Failed:", res.text)

    # 2. Generate Proposal
    res = requests.post(f"{BASE_URL}/proposal/generate", json={"project_id": PROJECT_ID, "template_id": "default"})
    if res.status_code == 200:
        print("✅ Proposal Generation Success:", json.dumps(res.json(), indent=2))
    else:
        print("❌ Proposal Generation Failed:", res.text)

if __name__ == "__main__":
    test_shredder()
    test_proposal()
