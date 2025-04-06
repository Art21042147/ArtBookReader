from PyPDF2 import PdfReader

def extract_pdf_metadata(file):
    try:
        reader = PdfReader(file)
        meta = reader.metadata
        toc = reader.outline
        has_outline = bool(toc)
        return {
            "title": meta.title.strip() if meta and meta.title else None,
            "toc": toc if has_outline else None,
        }
    except Exception as e:
        print(f"[extract_pdf_metadata] Error: {e}")
        return {"title": None, "toc": None}
