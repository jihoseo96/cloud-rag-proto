import requests
import json
import hashlib

BASE_URL = "http://localhost:8000"

def test_ingest():
    print("\n--- Testing Ingestion ---")
    # Create a dummy PDF file
    file_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Resources <<\n/Font <<\n/F1 4 0 R\n>>\n>>\n/Contents 5 0 R\n>>\nendobj\n4 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\n5 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Hello World) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000117 00000 n\n0000000240 00000 n\n0000000327 00000 n\ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n421\n%%EOF"
    
    files = {'file': ('test.pdf', file_content, 'application/pdf')}
    response = requests.post(f"{BASE_URL}/ingest/upload", files=files)
    
    if response.status_code == 200:
        print("✅ Ingest Success:", response.json())
    else:
        print("❌ Ingest Failed:", response.text)

    # Test Conflict
    response = requests.post(f"{BASE_URL}/ingest/upload", files=files)
    if response.status_code == 200:
        res_json = response.json()
        if res_json.get("status") == "conflict":
             print("✅ Conflict Detection Success:", res_json)
        else:
             print("❌ Conflict Detection Failed (Expected conflict):", res_json)
    else:
        print("❌ Ingest Failed on retry:", response.text)

def test_answers():
    print("\n--- Testing Answer Cards ---")
    # Create Answer
    payload = {
        "question": "What is the SLA?",
        "answer": "99.9% uptime",
        "created_by": "tester",
        "facts": {"sla": 99.9},
        "anchors": [{"text_snippet": "SLA is 99.9%", "page": 1}]
    }
    response = requests.post(f"{BASE_URL}/answers", json=payload)
    if response.status_code == 200:
        card_id = response.json()["id"]
        print(f"✅ Created AnswerCard: {card_id}")
        
        # Add Variant
        variant_payload = {
            "content": "We guarantee 100% uptime (Risky)",
            "context": "sales",
            "created_by": "sales_rep"
        }
        res_var = requests.put(f"{BASE_URL}/answers/{card_id}/variant", json=variant_payload)
        if res_var.status_code == 200:
            variants = res_var.json()["variants"]
            print(f"✅ Added Variant. Total variants: {len(variants)}")
            # Check risk
            risky_variant = variants[-1]
            if risky_variant.get("risk_level") == "HIGH":
                print("✅ Risk Detection Success (HIGH RISK detected)")
            else:
                print(f"❌ Risk Detection Failed: {risky_variant}")
        else:
            print("❌ Add Variant Failed:", res_var.text)

    else:
        print("❌ Create Answer Failed:", response.text)

if __name__ == "__main__":
    try:
        test_ingest()
        test_answers()
    except Exception as e:
        print(f"Test failed: {e}")
