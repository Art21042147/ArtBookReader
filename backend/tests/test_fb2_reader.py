from backend.core.utils.fb2_reader import extract_fb2_metadata
from io import BytesIO


def make_file(xml: str) -> BytesIO:
    f = BytesIO(xml.encode("utf-8"))
    f.name = "sample.fb2"
    return f


def test_extracts_full_metadata():
    xml = """
    <FictionBook>
      <description>
        <title-info>
          <book-title>Test Book</book-title>
          <author>
            <first-name>John</first-name>
            <last-name>Doe</last-name>
          </author>
        </title-info>
      </description>
      <body>
        <section>
          <title><p>Chapter 1</p></title>
        </section>
        <section>
          <title><p>Chapter 2</p></title>
        </section>
      </body>
    </FictionBook>
    """
    file = make_file(xml)
    result = extract_fb2_metadata(file)
    assert result["title"] == "Test Book"
    assert result["author"] == "John Doe"
    assert result["chapters"] == [{"title": "Chapter 1"}, {"title": "Chapter 2"}]


def test_missing_author_returns_empty_string():
    xml = """
    <FictionBook>
      <description>
        <title-info>
          <book-title>Book Without Author</book-title>
        </title-info>
      </description>
      <body>
        <section>
          <title><p>Intro</p></title>
        </section>
      </body>
    </FictionBook>
    """
    file = make_file(xml)
    result = extract_fb2_metadata(file)
    assert result["title"] == "Book Without Author"
    assert result["author"] is None or result["author"] == ""
    assert result["chapters"] == [{"title": "Intro"}]


def test_returns_empty_on_malformed_file(capfd):
    file = make_file("<notxml><broken")
    result = extract_fb2_metadata(file)
    assert result == {"title": None, "author": None, "chapters": []}
    out, _ = capfd.readouterr()
    assert "Error parsing metadata" in out
