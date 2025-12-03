import requests
import uuid
import json
import sys

BASE_URL = "http://localhost:8000"

def print_pass(msg):
    print(f"✅ PASS: {msg}")

def print_fail(msg):
    print(f"❌ FAIL: {msg}")
    sys.exit(1)

def print_info(msg):
    print(f"ℹ️  INFO: {msg}")

def test_source_documents_isolation():
    print("\n--- Testing Source Documents Isolation ---")
    # 1. List Global Documents (group_id=None)
    try:
        response = requests.get(f"{BASE_URL}/documents/list")
        if response.status_code != 200:
            print_fail(f"Failed to list global documents: {response.text}")
        
        docs = response.json()
        print_info(f"Global documents count: {len(docs)}")
        
        # Verify no group_id in results
        for doc in docs:
            if doc.get('group_id'):
                print_fail(f"Found document with group_id in global list: {doc['id']}")
        
        print_pass("Global documents list contains only global docs")
        
    except Exception as e:
        print_fail(f"Exception in test_source_documents_isolation: {e}")

def test_document_management():
    print("\n--- Testing Document Management ---")
    folder_id = None
    doc_id = None
    
    # 1. Create Folder
    try:
        folder_name = f"Test Folder {uuid.uuid4().hex[:8]}"
        response = requests.post(f"{BASE_URL}/documents/folders", json={"name": folder_name})
        if response.status_code != 200:
            print_fail(f"Failed to create folder: {response.text}")
        
        folder_data = response.json()
        folder_id = folder_data['id']
        print_pass(f"Created folder: {folder_name} ({folder_id})")
        
    except Exception as e:
        print_fail(f"Exception creating folder: {e}")

    # 2. Upload File (Mocking upload by creating a dummy file)
    try:
        files = {'file': ('test_doc.txt', b'This is a test document content for verification.')}
        data = {'title': 'test_doc.txt'}
        response = requests.post(f"{BASE_URL}/documents/upload", files=files, data=data)
        if response.status_code != 200:
            print_fail(f"Failed to upload file: {response.text}")
            
        doc_data = response.json()
        doc_id = doc_data['document_id']
        print_pass(f"Uploaded file: test_doc.txt ({doc_id})")
        
    except Exception as e:
        print_fail(f"Exception uploading file: {e}")

    # 3. Move File to Folder
    try:
        response = requests.put(f"{BASE_URL}/documents/{doc_id}", json={"parent_id": folder_id})
        if response.status_code != 200:
            print_fail(f"Failed to move file: {response.text}")
            
        print_pass(f"Moved file {doc_id} to folder {folder_id}")
        
    except Exception as e:
        print_fail(f"Exception moving file: {e}")

    # 4. Verify Tree Structure
    try:
        response = requests.get(f"{BASE_URL}/documents/tree")
        if response.status_code != 200:
            print_fail(f"Failed to get tree: {response.text}")
            
        tree = response.json()
        
        # Find folder
        target_folder = next((node for node in tree if node['id'] == folder_id), None)
        if not target_folder:
            print_fail("Created folder not found in tree")
            
        # Check if file is in folder's children
        child_file = next((child for child in target_folder['children'] if child['id'] == doc_id), None)
        if not child_file:
            print_fail("Moved file not found inside folder in tree")
            
        print_pass("Tree structure verified: File is inside Folder")
        
    except Exception as e:
        print_fail(f"Exception verifying tree: {e}")

    # 5. Delete Folder (and cascade)
    try:
        response = requests.delete(f"{BASE_URL}/documents/{folder_id}")
        if response.status_code != 200:
            print_fail(f"Failed to delete folder: {response.text}")
            
        print_pass(f"Deleted folder {folder_id}")
        
        # Verify file is also gone (or handled)
        # Check list
        response = requests.get(f"{BASE_URL}/documents/list")
        docs = response.json()
        if any(d['id'] == doc_id for d in docs):
             print_info("Note: File still exists in list (maybe intended if delete is not hard cascade in list view logic, but tree check is key)")
             # Actually, list view filters out folders, but files inside folders? 
             # The list view implementation filters `is_folder=False`. 
             # If we deleted the folder, did we delete the file? 
             # Let's check the code: `delete_document` does cascade delete children.
             print_fail("File should have been deleted via cascade")
        else:
             print_pass("Cascade delete verified: File is gone")

    except Exception as e:
        print_fail(f"Exception deleting folder: {e}")

def test_sidebar_integration():
    print("\n--- Testing Sidebar Integration (Projects List) ---")
    try:
        response = requests.get(f"{BASE_URL}/projects")
        if response.status_code != 200:
            print_fail(f"Failed to list projects: {response.text}")
            
        projects = response.json()
        print_info(f"Projects count: {len(projects)}")
        
        if isinstance(projects, list):
            print_pass("Projects endpoint returns a list")
            if len(projects) > 0:
                print_info(f"First project: {projects[0].get('name')}")
        else:
            print_fail("Projects endpoint did not return a list")
            
    except Exception as e:
        print_fail(f"Exception testing sidebar: {e}")

def test_project_creation_redirect():
    print("\n--- Testing Project Creation Redirect Data ---")
    try:
        project_name = f"Test Project {uuid.uuid4().hex[:8]}"
        payload = {
            "name": project_name,
            "industry": "IT",
            "rfp_type": "general"
        }
        response = requests.post(f"{BASE_URL}/projects", json=payload)
        if response.status_code != 200:
            print_fail(f"Failed to create project: {response.text}")
            
        project = response.json()
        
        # Verify ID and Name are present for redirect
        if not project.get('id'):
            print_fail("Project creation response missing 'id'")
        if not project.get('name'):
            print_fail("Project creation response missing 'name'")
            
        print_pass(f"Project created: {project['name']} ({project['id']})")
        print_pass("Response contains necessary data for frontend redirect")
        
    except Exception as e:
        print_fail(f"Exception testing project creation: {e}")

if __name__ == "__main__":
    print("Starting Verification Tests...")
    test_source_documents_isolation()
    test_document_management()
    test_sidebar_integration()
    test_project_creation_redirect()
    print("\n🎉 All Tests Passed!")
