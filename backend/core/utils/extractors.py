from pathlib import Path
import chardet
import hashlib

from .fb2_reader import extract_fb2_metadata
from .pdf_reader import extract_pdf_metadata


# Return string is the file extension in a standardized format.
def get_extension(file_name):
    return Path(file_name).suffix.lower().lstrip('.')


# Calculates SHA256 checksum of a file for check the originality.
def calculate_sha256(file_obj):
    hasher = hashlib.sha256()
    for chunk in file_obj.chunks():
        hasher.update(chunk)
    return hasher.hexdigest()


def extract_title(file):
    """
    Extracts the title from a file based on its extension 
    and returns the title if available, otherwise it returns the filename.
    """
    filename = Path(file.name).stem
    ext = get_extension(file.name)

    try:
        if ext == "fb2":
            meta = extract_fb2_metadata(file)
            return meta.get("title") or filename

        elif ext == "pdf":
            meta = extract_pdf_metadata(file)
            return meta.get("title") or filename

        elif ext == "txt":
            raw = file.read()
            result = chardet.detect(raw)
            encoding = result["encoding"] or "utf-8"

            try:
                content = raw.decode(encoding)
                first_line = content.strip().split('\n')[0]
                return first_line if first_line else filename
            except Exception:
                return filename

        elif ext == "djvu":
            return filename

    except Exception as e:
        print(f"[extract_title] Error processing {ext}: {e}")

    file.seek(0)
    return filename
