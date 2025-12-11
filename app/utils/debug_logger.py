import logging
import os
from datetime import datetime

# Define log file path - Use /tmp for Cloud Run compatibility
LOG_FILE_PATH = os.getenv("LOG_FILE_PATH", "/tmp/rfp_debug.log")

print(f"[DebugLogger] Initializing logger. Log file: {LOG_FILE_PATH}")

# Configure logger
logger = logging.getLogger("rfp_debug")
logger.setLevel(logging.DEBUG)
logger.propagate = False # Prevent propagation to root logger

# Clear existing handlers to avoid duplicates on reload
if logger.handlers:
    logger.handlers.clear()

# File handler
try:
    file_handler = logging.FileHandler(LOG_FILE_PATH, mode='a', encoding='utf-8')
    file_handler.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    print(f"[DebugLogger] File handler added successfully.")
except Exception as e:
    print(f"[DebugLogger] Failed to add file handler: {e}")

# Stream handler (Console)
stream_handler = logging.StreamHandler()
stream_handler.setLevel(logging.DEBUG)
stream_formatter = logging.Formatter('[DEBUG_LOG] %(message)s')
stream_handler.setFormatter(stream_formatter)
logger.addHandler(stream_handler)

def log_info(message: str):
    """Log info message to rfp_debug.log"""
    logger.info(message)
    # print(f"[INFO] {message}") # Optional: force print

def log_debug(message: str):
    """Log debug message to rfp_debug.log"""
    logger.debug(message)
    # Force print to console to ensure visibility if logging fails
    print(f"[DEBUG_PRINT] {message}") 

def log_error(message: str):
    """Log error message to rfp_debug.log"""
    logger.error(message)
    print(f"[ERROR_PRINT] {message}")

def save_debug_artifact(name: str, content: object):
    """
    Save debug artifact (JSON or text) to debug_artifacts directory.
    Filename format: YYYYMMDD_HHMMSS_{name}
    """
    try:
        import json
        
        # Create directory if not exists
        artifact_dir = os.path.join(os.path.dirname(LOG_FILE_PATH), "debug_artifacts")
        os.makedirs(artifact_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{name}"
        filepath = os.path.join(artifact_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            if isinstance(content, (dict, list)):
                json.dump(content, f, indent=2, ensure_ascii=False)
            else:
                f.write(str(content))
                
        log_debug(f"[DebugArtifact] Saved: {filepath}")
        
    except Exception as e:
        log_error(f"[DebugArtifact] Failed to save artifact {name}: {e}")

# NOTE: This file is for debugging purposes only and should be deleted after testing.
