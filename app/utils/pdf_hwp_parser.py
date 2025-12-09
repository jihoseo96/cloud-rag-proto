import os
import io
import json
import logging
from typing import List, Dict, Any, Optional, Tuple
import pdfplumber
import olefile
import zlib
import urllib.request
import urllib.parse

from app.utils.debug_logger import log_info, log_error

def parse_pdf(file_bytes: bytes) -> Dict[str, Any]:
    """
    Parse PDF bytes and extract text with layout information.
    Returns a dictionary containing full text and page-wise details.
    """
    full_text = []
    pages_data = []

    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            full_text.append(text)
            
            # Extract words with bounding boxes for layout analysis
            words = page.extract_words()
            
            pages_data.append({
                "page_number": i + 1,
                "text": text,
                "width": page.width,
                "height": page.height,
                "words": words  # List of dicts: {text, x0, top, x1, bottom}
            })

    return {
        "text": "\n".join(full_text),
        "pages": pages_data,
        "metadata": pdf.metadata if pdf.metadata else {}
    }

def parse_pdf_via_service(file_bytes: bytes, service_url: str) -> Dict[str, Any]:
    """
    Send PDF bytes to Universal PDF Service.
    """
    try:
        # Simple multipart upload or raw bytes post?
        # Assuming the service accepts raw bytes or multipart. 
        # Standard implementation: POST /parse/pdf (multipart)
        
        # Using urllib for zero-dep sync request
        boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
        lines = []
        lines.append(f'--{boundary}')
        lines.append('Content-Disposition: form-data; name="file"; filename="document.pdf"')
        lines.append('Content-Type: application/pdf')
        lines.append('')
        lines.append('') # Value comes next, handled by write
        
        body_start = '\r\n'.join(lines).encode('utf-8')
        body_end = f'\r\n--{boundary}--\r\n'.encode('utf-8')
        
        # Construct full body
        data = body_start + file_bytes + body_end
        
        req = urllib.request.Request(f"{service_url}/parse/pdf", data=data, method="POST")
        req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result
            
    except Exception as e:
        log_error(f"PDF Service Failed: {e}")
        # Fallback to local
        return parse_pdf(file_bytes)

def parse_pdf(file_bytes: bytes) -> Dict[str, Any]:
    """
    Parse PDF bytes.
    Tries Universal PDF Service if configured, else fallback to local pdfplumber.
    """
    service_url = os.getenv("PDF_SERVICE_URL")
    if service_url:
        log_info(f"Using Universal PDF Service at {service_url}")
        return parse_pdf_via_service(file_bytes, service_url)

    # Local Fallback
    log_info("Using local pdfplumber fallback.")
    full_text = []
    pages_data = []

    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            full_text.append(text)
            
            # Extract words with bounding boxes for layout analysis
            words = page.extract_words()
            
            pages_data.append({
                "page_number": i + 1,
                "text": text,
                "width": page.width,
                "height": page.height,
                "words": words  # List of dicts: {text, x0, top, x1, bottom}
            })

    return {
        "text": "\n".join(full_text),
        "pages": pages_data,
        "metadata": pdf.metadata if pdf.metadata else {}
    }

def parse_hwp(file_bytes: bytes) -> Dict[str, Any]:
    """
    Parse HWP (Hangul) file bytes.
    This is a simplified implementation focusing on extracting text from the body stream.
    For production, consider using a dedicated library like pyhwp or an external conversion service.
    """
    try:
        f = io.BytesIO(file_bytes)
        ole = olefile.OleFileIO(f)
        
        # HWP 5.0 structure usually has 'BodyText/SectionX' streams
        dirs = ole.listdir()
        body_sections = [d for d in dirs if d[0] == "BodyText"]
        
        full_text = []
        
        if not body_sections:
            # Fallback or older HWP format handling could go here
            return {"text": "", "pages": [], "error": "No BodyText sections found"}

        # Sort sections to maintain order
        body_sections.sort(key=lambda x: x[1]) # Sort by section number if possible

        for section in body_sections:
            stream = ole.openstream(section)
            data = stream.read()
            
            # HWP text is often zlib compressed
            try:
                decompressed = zlib.decompress(data, -15)
                # Extracting raw text from HWP binary structure is complex.
                # This is a placeholder for the actual text extraction logic.
                # In a real implementation, we would parse the HWP record structure here.
                # For now, we'll return a placeholder indicating HWP parsing is experimental.
                full_text.append("[HWP Parsing is experimental - Raw text extraction required]")
            except Exception:
                 full_text.append("[HWP Decompression Failed]")

        return {
            "text": "\n".join(full_text),
            "pages": [], # HWP page extraction is non-trivial without rendering
            "metadata": {}
        }
    except Exception as e:
        return {"text": "", "pages": [], "error": str(e)}

def extract_metadata(text: str) -> Dict[str, Any]:
    """
    Extract metadata like dates, potential titles from text.
    """
    # Placeholder for regex-based extraction
    return {
        "dates": [],
        "potential_titles": []
    }
