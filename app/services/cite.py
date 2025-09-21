# app/services/cite.py
import re
from typing import List, Dict, Tuple
from rapidfuzz import fuzz

_SENT_SPLIT = re.compile(r'(?<=[\.\?\!])\s+')

def split_sentences(text: str) -> List[str]:
    s = text.strip()
    if not s:
        return []
    return [t.strip() for t in _SENT_SPLIT.split(s) if t.strip()]

def attach_citations(answer: str, passages: List[Dict]) -> Tuple[str, List[Dict]]:
    """
    passages: [{document_id, page, text, title, ...}]
    각 문장에 best passage를 매핑하여 [n]을 삽입.
    citations: 고유 (document_id, page) 순서대로 부여.
    """
    sentences = split_sentences(answer)
    # citation 번호 매핑
    key_to_num = {}
    citations = []
    def get_num(doc_id, page, title, snippet):
        key = (doc_id, page)
        if key not in key_to_num:
            key_to_num[key] = len(key_to_num) + 1
            citations.append({
                "num": key_to_num[key],
                "document_id": str(doc_id),
                "page": int(page),
                "title": title,
                "snippet": (snippet[:240] + "…") if len(snippet) > 240 else snippet
            })
        return key_to_num[key]

    # 간단한 lex 매칭으로 best passage 고르기
    best_idx = []
    for s in sentences:
        bscore, bidx = -1, -1
        for i, p in enumerate(passages):
            score = fuzz.partial_ratio(s, p["text"])
            if score > bscore:
                bscore, bidx = score, i
        best_idx.append(bidx)

    # 문장 뒤에 [n] 삽입
    out_parts = []
    for s, i in zip(sentences, best_idx):
        if i == -1:
            out_parts.append(s)
            continue
        p = passages[i]
        n = get_num(p["document_id"], p["page"], p.get("title",""), p.get("text",""))
        out_parts.append(f"{s} [{n}]")
    return (" ".join(out_parts), citations)
