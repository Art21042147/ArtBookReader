from unittest.mock import MagicMock, patch

from backend.core.utils import extractors


def test_get_extension():
    assert extractors.get_extension("book.pdf") == "pdf"
    assert extractors.get_extension("book.TXT") == "txt"
    assert extractors.get_extension("archive.djvu") == "djvu"
    assert extractors.get_extension("README") == ""


def test_calculate_sha256():
    mock_file = MagicMock()
    mock_file.chunks.return_value = [b"hello", b"world"]
    hash_result = extractors.calculate_sha256(mock_file)
    # sha256(b"helloworld") = verified
    assert hash_result == "936a185caaa266bb9cbe981e9e05cb78cd732b0b3280eb944412bb6f8f8f07af"


@patch("backend.core.utils.extractors.extract_fb2_metadata")
def test_extract_title_fb2(mock_extract):
    mock_extract.return_value = {"title": "Title from FB2"}
    mock_file = MagicMock()
    mock_file.name = "book.fb2"
    assert extractors.extract_title(mock_file) == "Title from FB2"


@patch("backend.core.utils.extractors.extract_pdf_metadata")
def test_extract_title_pdf(mock_extract):
    mock_extract.return_value = {"title": "PDF Title"}
    mock_file = MagicMock()
    mock_file.name = "book.pdf"
    assert extractors.extract_title(mock_file) == "PDF Title"


def test_extract_title_txt_utf8():
    mock_file = MagicMock()
    mock_file.name = "notes.txt"
    mock_file.read.return_value = b"First line of text\nSecond line"
    assert extractors.extract_title(mock_file) == "First line of text"


def test_extract_title_txt_invalid_encoding():
    mock_file = MagicMock()
    mock_file.name = "broken.txt"
    mock_file.read.return_value = b"\xff\xfe\xfa"
    assert extractors.extract_title(mock_file) == "broken"


def test_extract_title_djvu():
    mock_file = MagicMock()
    mock_file.name = "scan.djvu"
    assert extractors.extract_title(mock_file) == "scan"


def test_extract_title_error_fallback():
    bad_file = MagicMock()
    bad_file.name = "unknown.xyz"
    assert extractors.extract_title(bad_file) == "unknown"
