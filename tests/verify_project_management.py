import requests
import uuid
import json

BASE_URL = "http://localhost:8000"

def test_project_management():
    print("=== Testing Project Management Features ===")
    
    # 1. Create a Project with Deadline and Description
    print("\n1. Creating Project...")
    project_data = {
        "name": "Management Test Project",
        "description": "Testing delete, status, and members",
        "deadline": "2024-12-31T23:59:59Z",
        "industry": "IT",
        "rfp_type": "general"
    }
    response = requests.post(f"{BASE_URL}/projects", json=project_data)
    if response.status_code != 200:
        print(f"Failed to create project: {response.text}")
        return
    
    project = response.json()
    project_id = project["id"]
    print(f"Project Created: {project_id}")
    print(f"Description: {project.get('description')}")
    print(f"Deadline: {project.get('deadline')}")
    
    assert project.get("description") == project_data["description"]
    assert project.get("deadline") is not None
    
    # 2. Add Member
    print("\n2. Adding Member...")
    member_data = {"email": "test@example.com"}
    response = requests.post(f"{BASE_URL}/projects/{project_id}/members", json=member_data)
    if response.status_code == 200:
        print("Member added successfully")
    else:
        print(f"Failed to add member: {response.text}")
        
    # 3. Update Status
    print("\n3. Updating Status...")
    status_data = {"status": "completed"}
    response = requests.patch(f"{BASE_URL}/projects/{project_id}/status", json=status_data)
    if response.status_code == 200:
        print("Status updated successfully")
        assert response.json()["new_status"] == "completed"
    else:
        print(f"Failed to update status: {response.text}")
        
    # 4. Verify Status Update
    response = requests.get(f"{BASE_URL}/projects/{project_id}")
    if response.status_code == 200:
        print(f"Current Status: {response.json()['status']}")
        assert response.json()["status"] == "completed"
        
    # 5. Delete Project
    print("\n5. Deleting Project...")
    response = requests.delete(f"{BASE_URL}/projects/{project_id}")
    if response.status_code == 200:
        print("Project deleted successfully")
    else:
        print(f"Failed to delete project: {response.text}")
        
    # 6. Verify Deletion
    response = requests.get(f"{BASE_URL}/projects/{project_id}")
    if response.status_code == 404:
        print("Project not found (Deletion confirmed)")
    else:
        print(f"Project still exists: {response.status_code}")

if __name__ == "__main__":
    test_project_management()
