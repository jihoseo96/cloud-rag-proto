import os
from typing import List, Dict, Any, Optional
from openai import OpenAI
from app.utils.debug_logger import log_debug, log_error

class OpenAIClient:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            log_error("[OpenAI] Missing OPENAI_API_KEY")
        
        self.client = OpenAI(api_key=self.api_key)
        self.embed_model = "text-embedding-3-small"
        self.chat_model = "gpt-5.1" # Fallback logic can be added here or in caller

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of texts.
        """
        try:
            # Replace newlines with spaces for better embedding results
            texts = [text.replace("\n", " ") for text in texts]
            response = self.client.embeddings.create(
                input=texts,
                model=self.embed_model
            )
            return [data.embedding for data in response.data]
        except Exception as e:
            log_error(f"[OpenAI] Embedding failed: {e}")
            raise e

    def generate_chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        response_format: Optional[Dict[str, str]] = None
    ) -> str:
        """
        Generate a chat completion.
        """
        target_model = model or self.chat_model
        try:
            kwargs = {
                "model": target_model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            }
            if response_format:
                kwargs["response_format"] = response_format
                
            response = self.client.chat.completions.create(**kwargs)
            return response.choices[0].message.content
        except Exception as e:
            log_error(f"[OpenAI] Chat completion failed: {e}")
            raise e
