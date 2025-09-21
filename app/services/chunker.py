from typing import List
from textwrap import wrap

def chunk_pages(pages: List[str], max_chars=800, overlap=120) -> List[dict]:
    chunks=[]
    for page_idx, text in enumerate(pages, start=1):
        t = " ".join(text.split())
        if not t: 
            continue
        start=0
        while start < len(t):
            end = min(start+max_chars, len(t))
            chunk_text = t[start:end]
            chunks.append({"page":page_idx,"text":chunk_text})
            if end==len(t): break
            start = end - overlap
            if start < 0: start = 0
    return chunks
