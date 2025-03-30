from pathlib import Path
from PyPDF2 import PdfReader
from ebooklib import epub
from lxml import etree
from docx import Document


def extract_title(file):
    filename = Path(file.name).stem
    ext = Path(file.name).suffix.lower()

    try:
        if ext == ".pdf":
            pdf = PdfReader(file)
            meta = pdf.metadata
            return meta.title.strip() if meta and meta.title else filename

        elif ext == ".epub":
            book = epub.read_epub(file)
            title_items = book.get_metadata('DC', 'title')
            return title_items[0][0].strip() if title_items else filename

        elif ext == ".fb2":
            content = file.read()
            root = etree.fromstring(content)
            title_info = root.find(".//title-info/book-title")
            return title_info.text.strip() if title_info is not None else filename

        elif ext == ".txt":
            first_line = file.readline().decode("utf-8").strip()
            return first_line if first_line else filename

        elif ext == ".docx":
            document = Document(file)
            paragraphs = [p.text.strip() for p in document.paragraphs if p.text.strip()]
            return paragraphs[0] if paragraphs else filename

        elif ext == ".djvu":
            return filename

    except Exception as e:
        print(f"[extract_title] Error processing {ext}: {e}")

    file.seek(0)
    return filename
