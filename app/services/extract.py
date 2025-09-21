# app/services/extract.py
from pypdf import PdfReader
from pypdf.errors import PdfStreamError
from io import BytesIO
import os

def extract_text_pages(fp) -> list[str]:
    # 입력을 bytes로 정규화
    if isinstance(fp, (bytes, bytearray)):
        data = bytes(fp)
    elif hasattr(fp, "read"):  # file-like
        try:
            fp.seek(0)
        except Exception:
            pass
        data = fp.read()
    elif isinstance(fp, (str, os.PathLike)):
        with open(fp, "rb") as f:
            data = f.read()
    else:
        raise TypeError("Unsupported input type for extract_text_pages")

    # PDF 헤더 재확인 (방어)
    if len(data) < 8 or not data.lstrip().startswith(b"%PDF-"):
        raise ValueError("Input is not a PDF (missing %PDF- header)")

    # pypdf → 실패 시 pdfminer.six 폴백
    try:
        reader = PdfReader(BytesIO(data))
        return [(p.extract_text() or "").strip() for p in reader.pages]
    except PdfStreamError:
        from pdfminer.high_level import extract_text
        txt = extract_text(BytesIO(data))
        return [t.strip() for t in txt.split("\f") if t.strip()]
