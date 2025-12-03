import requests
import uuid
import os

BASE_URL = "http://127.0.0.1:8000"

def test_rfp_flow():
    with open("test_output.log", "w") as log:
        def log_print(msg):
            print(msg)
            log.write(msg + "\n")

        log_print("=== Starting End-to-End RFP Flow Test ===")

        # 1. Create Project
        log_print("\n[1] Creating Project...")
        project_data = {
            "name": f"Test Project {uuid.uuid4().hex[:8]}",
            "industry": "IT",
            "rfp_type": "System Integration"
        }
        resp = requests.post(f"{BASE_URL}/projects", json=project_data)
        if resp.status_code != 200:
            log_print(f"FAILED to create project: {resp.text}")
            return
        project = resp.json()
        project_id = project["id"]
        log_print(f"SUCCESS: Project created (ID: {project_id})")

        # 2. Upload RFP
        log_print("\n[2] Uploading RFP...")
        # Create a dummy PDF file
        dummy_pdf_content = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 44 >>\nstream\nBT /F1 24 Tf 100 700 Td (Test RFP Content for Shredding) Tj ET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000243 00000 n \n0000000331 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n425\n%%EOF"
        
        files = {
            "file": ("test_rfp.pdf", dummy_pdf_content, "application/pdf")
        }
        data = {
            "project_id": project_id, # Important: Link to project
            "title": "Test RFP Document"
        }
        
        # Note: The ingest endpoint expects 'project_id' in form data to resolve group_id
        resp = requests.post(f"{BASE_URL}/ingest/upload", files=files, data=data)
        if resp.status_code != 200:
            log_print(f"FAILED to upload RFP: {resp.text}")
            return
        
        upload_result = resp.json()
        log_print(f"SUCCESS: RFP Uploaded (Doc ID: {upload_result.get('document_id')})")
        log_print(f"Debug: Upload Result: {upload_result}")

        # 3. Trigger Shredding
        log_print("\n[3] Triggering Shredding...")
        trigger_data = {
            "project_id": project_id,
            "confirm_cost": True # Auto-confirm for test
        }
        resp = requests.post(f"{BASE_URL}/shredder/trigger", json=trigger_data)
        
        if resp.status_code != 200:
            log_print(f"FAILED to trigger shredding: {resp.status_code} - {resp.text}")
            return

        shred_result = resp.json()
        log_print(f"SUCCESS: Shredding Triggered")
        log_print(f"Result: {shred_result}")

    # 4. Verify Requirements (Optional for now)
    # ...

if __name__ == "__main__":
    test_rfp_flow()
