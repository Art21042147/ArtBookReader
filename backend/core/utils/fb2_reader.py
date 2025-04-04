from lxml import etree


def extract_fb2_metadata(file):
    metadata = {
        "title": None,
        "author": None,
        "chapters": []
    }

    try:
        content = file.read()
        root = etree.fromstring(content)

        # Title
        title_nodes = root.xpath("//*[local-name()='book-title']")
        if title_nodes:
            metadata["title"] = title_nodes[0].text.strip()

        # Author
        first_nodes = root.xpath("//*[local-name()='first-name']")
        last_nodes = root.xpath("//*[local-name()='last-name']")
        first = first_nodes[0].text.strip() if first_nodes and first_nodes[0].text else ""
        last = last_nodes[0].text.strip() if last_nodes and last_nodes[0].text else ""
        if first or last:
            metadata["author"] = f"{first} {last}".strip()

        # Chapters
        chapter_sections = root.xpath("//*[local-name()='body' and not(@name)]/*[local-name()='section']")
        for sec in chapter_sections:
            title_p = sec.xpath("./*[local-name()='title']/*[local-name()='p']")
            if title_p and title_p[0].text:
                metadata["chapters"].append({
                    "title": title_p[0].text.strip()
                })

    except Exception as e:
        print("[fb2] Error parsing metadata:", e)

    file.seek(0)
    return metadata


def extract_fb2_text(file_path):
    try:
        with open(file_path, 'rb') as f:
            content = f.read()
            root = etree.fromstring(content)

            sections = root.xpath("//*[local-name()='body' and not(@name)]/*[local-name()='section']")
            html_blocks = []

            for sec in sections:
                paragraphs = sec.xpath("./*[local-name()='p']")
                for elem in paragraphs:
                    html = etree.tostring(elem, method='html', encoding='unicode')
                    html_blocks.append(html.strip())

            return '\n\n'.join(html_blocks)

    except Exception as e:
        print(f"[extract_fb2_text] Error: {e}")
        return ""
