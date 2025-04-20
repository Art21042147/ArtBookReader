import { render, screen } from '@testing-library/react'
import ReadingArea from './ReadingArea'
import { vi } from 'vitest'

// Mocking child components
vi.mock('./DjvuViewer', () => ({
  default: () => <div>DjvuViewer Mock</div>
}))

vi.mock('./NoteModal', () => ({
  default: ({ noteText }) => <div>{noteText}</div>
}))

vi.mock('./fb2Renderer', () => ({
  renderFb2: vi.fn(() => (
    <div>
      <p>Some FB2 text before</p>
      <a href="#n_1">See note</a>
      <p>Some FB2 text after</p>
    </div>
  )),
  extractNotes: vi.fn(() => ({ n_1: 'Hello note!' })),
}))

describe('ReadingArea', () => {
  test('renders logo if no bookText provided', () => {
    render(<ReadingArea book={{}} bookText={''} scrollRef={{ current: null }} showPosition={false} pageInfo={{}} />)

    expect(screen.getByText(/ArtBookReader/i)).toBeInTheDocument()
    expect(screen.getByAltText(/Logo/i)).toBeInTheDocument()
  })
})

test('renders fb2 using renderFb2', () => {
  render(
    <ReadingArea
      book={{ file: 'book.fb2' }}
      bookText={'<FictionBook>...</FictionBook>'}
      scrollRef={{ current: null }}
      showPosition={false}
      pageInfo={{}}
    />
  )

  expect(screen.getByText('Some FB2 text before')).toBeInTheDocument()
})

test('renders PDF inside iframe', () => {
  render(
    <ReadingArea
      book={{ file: '/media/books/book.pdf' }}
      bookText={'irrelevant'}
      scrollRef={{ current: null }}
      showPosition={false}
      pageInfo={{}}
    />
  )

  const iframe = screen.getByTitle('PDF Viewer')
  expect(iframe).toBeInTheDocument()
  expect(iframe).toHaveAttribute('src', '/media/books/book.pdf')
})

test('renders DjvuViewer when book is djvu', () => {
  render(
    <ReadingArea
      book={{ file: 'book.djvu', id: 42, last_position: 5 }}
      bookText={'ignored'}
      scrollRef={{ current: null }}
      showPosition={false}
      pageInfo={{}}
      setPageInfo={() => {}}
    />
  )

  expect(screen.getByText('DjvuViewer Mock')).toBeInTheDocument()
})

test('handleClick opens NoteModal with the correct note text', async () => {
  const { findByText } = render(
    <ReadingArea
      book={{ file: 'book.fb2' }}
      bookText={'<FictionBook>...</FictionBook>'}
      scrollRef={{ current: document.createElement('div') }}
      showPosition={false}
      pageInfo={{}}
    />
  )

  const link = await findByText(/See note/i)
  link.click()

  expect(await findByText('Hello note!')).toBeInTheDocument()
})

test('shows reading position if showPosition is true and not PDF', () => {
  render(
    <ReadingArea
      book={{ file: 'book.txt' }}
      bookText={'Some text content'}
      scrollRef={{ current: null }}
      showPosition={true}
      pageInfo={{ current: 3, total: 10, percent: 30 }}
    />
  )

  expect(screen.getByText(/Page 3 of 10 \(30%\)/i)).toBeInTheDocument()
})
