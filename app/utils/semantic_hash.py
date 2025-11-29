import hashlib
import re
from typing import Tuple

def compute_sha256(content: bytes) -> str:
    """
    Compute standard SHA256 hash of bytes.
    """
    return hashlib.sha256(content).hexdigest()

def normalize_text(text: str) -> str:
    """
    Normalize text for semantic hashing:
    - Lowercase
    - Remove all whitespace
    - Remove punctuation
    """
    # Remove non-alphanumeric characters (keep Hangul)
    # This regex keeps English, Numbers, and Hangul (Korean)
    # \w matches [a-zA-Z0-9_] and unicode characters depending on flags.
    # For stricter control:
    text = text.lower()
    # Remove whitespace
    text = re.sub(r'\s+', '', text)
    # Remove punctuation/symbols (keep only alphanumeric and Hangul)
    # Simple approach: keep only known good chars
    # Or remove known bad chars.
    # Let's use a regex that matches anything NOT (word char)
    text = re.sub(r'[^\w]', '', text)
    return text

def compute_semantic_hash(text: str) -> str:
    """
    Compute a 'semantic' hash that is robust to whitespace/formatting changes.
    """
    normalized = normalize_text(text)
    return hashlib.sha256(normalized.encode('utf-8')).hexdigest()
