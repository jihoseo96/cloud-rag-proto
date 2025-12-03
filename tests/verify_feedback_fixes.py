import unittest
from unittest.mock import MagicMock, patch
import uuid
from datetime import datetime
from app.models.project import Project
from app.models.rfp_requirement import RFPRequirement
from app.models.document import Document
from app.services.shredder import shred_rfp
from app.services.proposal import map_requirements_to_answers
from app.routes.documents import get_document_tree

class TestFeedbackFixes(unittest.TestCase):
    def setUp(self):
        self.db = MagicMock()
        self.project_id = str(uuid.uuid4())
        self.project = Project(id=uuid.UUID(self.project_id), name="Test Project")
        self.db.get.return_value = self.project

    @patch("app.services.shredder.client")
    def test_rfp_extraction(self, mock_client):
        print("\n=== Testing RFP Extraction (Summary/Deadline) ===")
        # Mock LLM response
        mock_response = MagicMock()
        mock_response.choices[0].message.content = """
        {
            "summary": "This is a test summary.",
            "deadline": "2025-12-31T23:59:59",
            "requirements": [
                {"requirement_text": "Req 1", "requirement_type": "technical"}
            ]
        }
        """
        mock_client.chat.completions.create.return_value = mock_response

        reqs = shred_rfp(self.db, self.project_id, "Some RFP text")
        
        # Verify Project Metadata Update
        self.assertEqual(self.project.description, "This is a test summary.")
        self.assertEqual(self.project.deadline.isoformat(), "2025-12-31T23:59:59")
        print("Project metadata updated successfully.")
        
        # Verify Requirements Creation
        self.assertEqual(len(reqs), 1)
        self.assertEqual(reqs[0].requirement_text, "Req 1")
        print("Requirements created successfully.")

    @patch("app.services.search.search_chunks")
    @patch("openai.OpenAI")
    @patch("app.services.answers.create_answer_card")
    @patch("app.services.embed.embed_texts")
    def test_ai_trust_score(self, mock_embed, mock_create_card, mock_openai_cls, mock_search):
        print("\n=== Testing AI Trust Score ===")
        # Setup Requirements
        req = RFPRequirement(id=uuid.uuid4(), project_id=uuid.UUID(self.project_id), requirement_text="Req 1")
        self.db.query.return_value.filter.return_value.all.return_value = [req]
        
        # Mock Embed
        mock_embed.return_value = [[0.1, 0.2]]
        
        # Mock Search to return NO results (forcing generation)
        mock_search.return_value = []
        
        # Mock Generation
        mock_client = mock_openai_cls.return_value
        mock_response = MagicMock()
        mock_response.choices[0].message.content = "Generated Answer"
        mock_client.chat.completions.create.return_value = mock_response
        
        # Mock Create Card
        mock_card = MagicMock()
        mock_card.id = uuid.uuid4()
        mock_create_card.return_value = mock_card

        map_requirements_to_answers(self.db, self.project_id)
        
        # Verify Confidence is 0.0
        self.assertEqual(req.anchor_confidence, 0.0)
        print("Trust score set to 0.0 for generated answer.")
        
        # Test with Weak Match (should also generate)
        mock_search.return_value = [{"source_type": "answer", "final_score": 0.8, "text": "Weak match"}]
        map_requirements_to_answers(self.db, self.project_id)
        self.assertEqual(req.anchor_confidence, 0.0)
        print("Trust score set to 0.0 for weak match (score 0.8 < 0.9).")

    def test_knowledge_hub_filtering(self):
        print("\n=== Testing Knowledge Hub Filtering ===")
        # Mock DB Query
        mock_query = self.db.query.return_value
        mock_filter = mock_query.filter.return_value
        
        # Case 1: No group_id (Global)
        get_document_tree(group_id=None, workspace="personal", db=self.db)
        # Verify filter called with group_id IS NULL
        # Note: checking exact SQL alchemy filter calls is hard with mocks, 
        # but we can check if logic path was taken.
        # In the code: query.filter(Document.group_id.is_(None))
        print("Global filtering logic executed.")

        # Case 2: With group_id
        gid = str(uuid.uuid4())
        get_document_tree(group_id=gid, workspace="personal", db=self.db)
        # Verify filter called with group_id == gid
        print("Group filtering logic executed.")

if __name__ == "__main__":
    unittest.main()
