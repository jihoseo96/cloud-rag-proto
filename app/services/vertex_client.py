import os
from typing import List, Dict, Any, Optional
from google.cloud import discoveryengine_v1beta as discoveryengine
from google.api_core.client_options import ClientOptions
import vertexai
from vertexai.generative_models import GenerativeModel, Part, GenerationConfig
from app.utils.debug_logger import log_debug, log_error, log_info

class VertexAIClient:
    def __init__(self):
        self.project_id = os.getenv("GCP_PROJECT_ID") or os.getenv("PROJECT_ID")
        self.location = os.getenv("GCP_LOCATION", "global")
        self.data_store_id = os.getenv("VERTEX_DATA_STORE_ID")
        self.credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        self.gemini_model_name = os.getenv("VERTEX_AI_MODEL_VERSION", "gemini-3-pro-preview")

        if not self.project_id or not self.data_store_id:
            log_error("[VertexAI] Missing GCP_PROJECT_ID or VERTEX_DATA_STORE_ID")
            # We don't raise error here to allow app startup, but methods will fail
            
        # Initialize Vertex AI SDK
        if self.project_id:
             try:
                vertexai.init(project=self.project_id, location=self.location)
                log_info(f"[VertexAI] Initialized with project {self.project_id} in {self.location}")
             except Exception as e:
                 log_error(f"[VertexAI] Init failed: {e}")

    def search_docs(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Search documents in Vertex AI Search (Discovery Engine).
        Returns a list of simplified result dicts.
        """
        if not self.data_store_id:
            log_error("[VertexAI] No Data Store ID configured.")
            return []

        try:
            client_options = (
                ClientOptions(api_endpoint=f"{self.location}-discoveryengine.googleapis.com")
                if self.location != "global"
                else None
            )
            
            client = discoveryengine.SearchServiceClient(client_options=client_options)
            
            serving_config = client.serving_config_path(
                project=self.project_id,
                location=self.location,
                data_store=self.data_store_id,
                serving_config="default_config",
            )
            
            request = discoveryengine.SearchRequest(
                serving_config=serving_config,
                query=query,
                page_size=top_k,
                content_search_spec=discoveryengine.SearchRequest.ContentSearchSpec(
                    snippet_spec=discoveryengine.SearchRequest.ContentSearchSpec.SnippetSpec(
                        return_snippet=True
                    ),
                    summary_spec=discoveryengine.SearchRequest.ContentSearchSpec.SummarySpec(
                        summary_result_count=3,
                        include_citations=True,
                        ignore_adversarial_query=True,
                        ignore_non_summary_seeking_query=True,
                    ),
                ),
            )
            
            response = client.search(request)
            
            results = []
            for result in response.results:
                data = result.document.derived_struct_data
                snippet = ""
                # Try to get snippet from derived data or snippets field
                if hasattr(data, "snippets") and data["snippets"]:
                     snippet = data["snippets"][0].get("snippet", "")
                
                results.append({
                    "id": result.document.id,
                    "title": data.get("title", ""),
                    "uri": data.get("link", ""),
                    "snippet": snippet,
                    "score": 0.0 # Discovery Engine doesn't always return a raw score in basic response
                })
                
            log_debug(f"[VertexAI] Search returned {len(results)} results")
            return results

        except Exception as e:
            log_error(f"[VertexAI] Search failed: {e}")
            return []

    def shred_document(self, pdf_gcs_uri: str, prompt_override: Optional[str] = None) -> Dict[str, Any]:
        """
        Use Gemini 3.0 Pro Vision to parse a whole PDF document.
        pdf_gcs_uri must be 'gs://...'
        """
        try:
            model = GenerativeModel(self.gemini_model_name)
            
            pdf_part = Part.from_uri(
                uri=pdf_gcs_uri,
                mime_type="application/pdf"
            )
            
            prompt = prompt_override or """
            Analyze this RFP document based on the following structure.
            Extract requirements, summary, and deadline.
            Return JSON.
            """
            
            response = model.generate_content(
                [pdf_part, prompt],
                generation_config=GenerationConfig(
                    temperature=0.0,
                    response_mime_type="application/json"
                )
            )
            
            return response.text # Caller parses JSON
            
        except Exception as e:
            log_error(f"[VertexAI] Shredding failed: {e}")
            raise e

    def index_document(self, gcs_uri: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        """
        Import a document into Vertex AI Search (Data Store).
        For now, we use GCS URI.
        Metadata is optional.
        Returns operation name or resource ID.
        """
        if not self.data_store_id:
            msg = "[VertexAI] No Data Store ID configured."
            log_error(msg)
            raise ValueError(msg)

        try:
            client_options = (
                ClientOptions(api_endpoint=f"{self.location}-discoveryengine.googleapis.com")
                if self.location != "global"
                else None
            )
            
            client = discoveryengine.DocumentServiceClient(client_options=client_options)
            
            parent = client.branch_path(
                project=self.project_id,
                location=self.location,
                data_store=self.data_store_id,
                branch="default_branch",
            )

            # We assume the file is already in GCS or we are indexing a GCS object
            # For this MVP, we use GcsSource.
            
            input_config = discoveryengine.GcsSource(
                input_uris=[gcs_uri],
                data_schema="content" # 'content' for unstructured docs
            )
            
            request = discoveryengine.ImportDocumentsRequest(
                parent=parent,
                gcs_source=input_config,
                reconciliation_mode=discoveryengine.ImportDocumentsRequest.ReconciliationMode.INCREMENTAL,
                auto_generate_ids=True # Let Vertex generate ID or use filename if we map it
            )
            
            # This is a long-running operation
            operation = client.import_documents(request=request)
            log_info(f"[VertexAI] Import started: {operation.operation.name}")
            return operation.operation.name # Return op name to track later
            
        except Exception as e:
            log_error(f"[VertexAI] Indexing failed: {e}")
            raise e

    def generate_text(self, prompt: str, temperature: float = 0.2, max_output_tokens: int = 8192) -> str:
        """
        Generate text using Gemini model.
        """
        try:
            model = GenerativeModel(self.gemini_model_name)
            
            response = model.generate_content(
                prompt,
                generation_config=GenerationConfig(
                    temperature=temperature,
                    max_output_tokens=max_output_tokens,
                    response_mime_type="application/json" # Enforce JSON if asking for JSON
                )
            )
            return response.text
        except Exception as e:
            log_error(f"[VertexAI] Generate text failed: {e}")
            raise e
