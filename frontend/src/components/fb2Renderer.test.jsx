import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { renderFb2, extractNotes } from './fb2Renderer'

describe('renderFb2', () => {
  it('returns fallback for empty string', () => {
    const { getByText } = render(renderFb2(''))
    expect(getByText('🛑 Empty fb2')).toBeDefined()
  })

  it('returns fallback for malformed XML (throws)', () => {
    const brokenXml = `<FictionBook><body><section><p>Broken`
    const { getByText } = render(renderFb2(brokenXml))
    expect(getByText('Parsing error fb2')).toBeDefined()
  })

  it('renders valid fb2 content with <p> and <title>', () => {
    const xml = `
      <FictionBook>
        <body>
          <section>
            <title><p>Chapter 1</p></title>
            <p>Hello world</p>
          </section>
        </body>
      </FictionBook>
    `
    const { getByText } = render(renderFb2(xml))
    expect(getByText('Chapter 1')).toBeDefined()
    expect(getByText('Hello world')).toBeDefined()
  })

  it('renders note link and dispatches event on click', () => {
    const xml = `
      <FictionBook>
        <body>
          <section>
            <p>See note <a href="#n_1">[1]</a></p>
          </section>
        </body>
      </FictionBook>
    `
    const mockHandler = vi.fn()
    window.addEventListener('note-click', mockHandler)

    const { getByText } = render(renderFb2(xml))
    getByText('[1]').click()

    expect(mockHandler).toHaveBeenCalledWith(expect.objectContaining({
      detail: { id: 'n_1' }
    }))
  })

  it('catches and returns parsing error', () => {
    const brokenXml = `<FictionBook><body><section><p>Broken`
    const { getByText } = render(renderFb2(brokenXml))
    expect(getByText('Parsing error fb2')).toBeDefined()
  })
})

describe('extractNotes', () => {
  it('returns object with extracted notes', () => {
    const xml = `
      <FictionBook>
        <body name="notes">
          <section id="n_1"><p>First note</p></section>
          <section id="n_2"><p>Second note</p></section>
        </body>
      </FictionBook>
    `
    const notes = extractNotes(xml)
    expect(notes).toEqual({
      n_1: '<p>First note</p>',
      n_2: '<p>Second note</p>',
    })
  })

  it('returns empty object if no notes body found', () => {
    const xml = `<FictionBook><body><p>No notes here</p></body></FictionBook>`
    expect(extractNotes(xml)).toEqual({})
  })
})
