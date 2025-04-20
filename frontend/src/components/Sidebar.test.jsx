import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import api from '../axios'
import Sidebar from './Sidebar'

// Mock props
const mockProps = {
  user: { username: 'John' },
  book: {
    title: 'Roads of Destiny',
    author: 'O. Henry',
    content: {
      chapters: [
        { title: 'Chapter 1: Roads of Destiny' },
        { title: 'Chapter 2: The Guardian of the Accolade' },
      ],
    },
  },
  showPanel: true,
  togglePanel: () => {},
  fileInputRef: { current: { click: vi.fn() } },
  handleFileChange: () => {},
  library: [
    { id: 101, title: 'Book One' },
    { id: 202, title: 'Book Two' },
  ],
  setLibrary: vi.fn(),
  setBook: vi.fn(),
  openBook: vi.fn(),
  addBookmark: vi.fn(),
  deleteBookmark: vi.fn(),
  bookmarks: [
    { id: 1, page: 42, note: 'Important part' },
    { id: 2, page: 88, note: '' },
  ],
  pageInfo: { current: 1, total: 300 },
  goToPage: vi.fn(),
  goToHeading: () => {},
}

describe('Sidebar component', () => {
  test('renders username and book title', () => {
    render(<Sidebar {...mockProps} />)

    expect(screen.getByText(/John/i)).toBeInTheDocument()
    expect(screen.getByText(/Roads of Destiny/i)).toBeInTheDocument()
    expect(screen.getByText(/O. Henry/i)).toBeInTheDocument()
  })
})

test('displays content chapters when 📑 Content is clicked', async () => {
  render(<Sidebar {...mockProps} />)

  const contentToggle = screen.getByText(/📑 Content/i)
  contentToggle.click()

  expect(await screen.findByText(/Chapter 1: Roads of Destiny/)).toBeInTheDocument()
  expect(screen.getByText(/Chapter 2: The Guardian of the Accolade/)).toBeInTheDocument()
})

test('displays and interacts with bookmarks (excluding page jump)', async () => {
  render(<Sidebar {...mockProps} />)

  const bookmarksToggle = screen.getByText(/📌 Bookmarks/i)
  await userEvent.click(bookmarksToggle)

  // Checking the display of bookmarks
  const noteBookmark = screen.getAllByText((_, el) =>
    el.textContent.includes('Important part')
  )[0]
  expect(noteBookmark).toBeInTheDocument()

  const pageBookmark = screen.getAllByText((_, el) =>
    el.textContent.includes('Page 88')
  )[0]
  expect(pageBookmark).toBeInTheDocument()

  // Checking delete
  const deleteIcons = screen.getAllByText(/❌/)
  await userEvent.click(deleteIcons[0])
  expect(mockProps.deleteBookmark).toHaveBeenCalledWith(1)

  // Adding a new bookmark
  const input = screen.getByPlaceholderText(/Note/i)
  await userEvent.type(input, 'New Note')
  await userEvent.click(screen.getByText('Add'))
  expect(mockProps.addBookmark).toHaveBeenCalledWith('New Note', 1)
})

test('displays library and interacts with books', async () => {
  render(<Sidebar {...mockProps} />)

  // Open the 📚 Library section
  const libraryToggle = screen.getByText(/📚 Library/i)
  await userEvent.click(libraryToggle)

  // Checking the display of books
  expect(screen.getByText(/📘 Book One/i)).toBeInTheDocument()
  expect(screen.getByText(/📘 Book Two/i)).toBeInTheDocument()

  // Click on the book
  await userEvent.click(screen.getByText(/📘 Book One/i))
  expect(mockProps.openBook).toHaveBeenCalledWith({ id: 101, title: 'Book One' })
})

test('goes to specified page number when Go is clicked', async () => {
  render(<Sidebar {...mockProps} />)

  const input = screen.getByRole('spinbutton') // <input type="number" />
  const goButton = screen.getByText('Go')

  await userEvent.clear(input)
  await userEvent.type(input, '42')
  await userEvent.click(goButton)

  expect(mockProps.goToPage).toHaveBeenCalledWith(42)
})

test('logs out when Log Out button is clicked', async () => {
  // Mock for api.post
  const postMock = vi.spyOn(api, 'post').mockResolvedValue({})

  // mock for window.location
  delete window.location
  window.location = { href: '' }

  render(<Sidebar {...mockProps} />)

  const logoutButton = screen.getByText(/Log Out/i)
  await userEvent.click(logoutButton)

  expect(postMock).toHaveBeenCalledWith('logout/')
  expect(window.location.href).toBe('/')
})
