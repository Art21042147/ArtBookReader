import React from 'react'

/**
 * Main book body renderer fb2
 */
export function renderFb2(xmlString) {
  if (!xmlString) return <p>🛑 Пустой fb2-файл</p>

  try {
    const parser = new DOMParser()

    // Remove namespaces to avoid DOMException
    const cleanedXml = xmlString
      .replace(/xmlns(:\w+)?="[^"]*"/g, '')
      .replace(/<(\/*)l:/g, '<$1')
      .replace(/\s+l:/g, ' ')

    const doc = parser.parseFromString(cleanedXml, 'application/xml')
    const mainBody = [...doc.getElementsByTagName('body')].find(
      b => !b.getAttribute('name') || b.getAttribute('name') === 'main'
    )

    if (!mainBody) return <p>❌ The body of the book was not found.</p>

    const renderNode = (node, key) => {
      if (node.nodeType === 3) return node.textContent
      if (node.nodeType !== 1) return null

      const Tag = node.tagName.toLowerCase()
      const children = [...node.childNodes].map((child, i) => renderNode(child, i))

      switch (Tag) {
        case 'section':
          return <section key={key} className="my-6">{children}</section>

        case 'title':
        case 'subtitle':
          const heading = children.map((c) =>
            typeof c === 'string' ? c : c?.props?.children || ''
          ).join(' ').trim()
          const id = heading.toLowerCase().replace(/[^\wа-яё]+/gi, '-')
          return (
            <h2 key={key} id={id} className="text-xl font-semibold mt-6 mb-2">
              {children}
            </h2>
          )

        case 'p':
          return <p key={key} className="my-4">{children}</p>

        case 'a': {
          const href = node.getAttribute('href') || '#'
          const isNote = href.startsWith('#n_')
          const noteId = href.slice(1)

          return (
            <a
              key={key}
              href={href}
              className={isNote ? 'text-blue-400 hover:underline cursor-pointer' : undefined}
              onClick={isNote ? (e) => {
                e.preventDefault()
                const noteEvent = new CustomEvent('note-click', { detail: { id: noteId } })
                window.dispatchEvent(noteEvent)
              } : undefined}
            >
              {children.length > 0 ? children : (isNote ? `[${noteId.slice(2)}]` : '')}
            </a>
          )
        }

        default:
          return <div key={key}>{children}</div>
      }
    }

    const rendered = [...mainBody.childNodes].map((child, i) => renderNode(child, i))

    return (
      <div className="max-w-4xl text-left prose prose-invert">
        {rendered}
      </div>
    )
  } catch (err) {
    console.error('Parsing error fb2:', err)
    return <p>Parsing error fb2</p>
  }
}

/**
 * Extracts notes by tags <body name="notes">
 */
export function extractNotes(xmlText) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'text/xml')
  const noteBody = Array.from(doc.getElementsByTagName('body')).find(
    b => b.getAttribute('name') === 'notes'
  )

  if (!noteBody) return {}

  const notes = {}
  const sections = noteBody.getElementsByTagName('section')

  for (const section of sections) {
    const id = section.getAttribute('id')
    const paragraphs = section.getElementsByTagName('p')
    let text = ''
    for (const p of paragraphs) {
      text += `<p>${p.textContent}</p>`
    }
    notes[id] = text
  }

  return notes
}
