import { renderHook, act } from '@testing-library/react'
import { useReaderLogic } from './useReaderLogic'

// Mocking external dependencies
vi.mock('../axios', () => ({
  uploadBook: vi.fn(),
  getLastOpenedBook: vi.fn(),
  saveReadingPosition: vi.fn(() => Promise.resolve()),
  getAllBooks: vi.fn(() => Promise.resolve([])),
}))

vi.mock('./openBookLogic', () => ({
  openBookLogic: vi.fn(),
}))

vi.mock('./bookmarksLogic', () => ({
  fetchBookmarks: vi.fn(),
  addBookmark: vi.fn(),
  deleteBookmark: vi.fn(),
}))

describe('useReaderLogic', () => {
  test('initial state is correct', () => {
    const { result } = renderHook(() => useReaderLogic())

    expect(result.current.user).toBe(null)
    expect(result.current.book).toBe(null)
    expect(result.current.bookText).toBe('')
    expect(result.current.pageInfo).toEqual({ current: 1, total: 1, percent: 0 })
    expect(result.current.showPanel).toBe(false)
    expect(result.current.showPosition).toBe(false)
    expect(typeof result.current.togglePanel).toBe('function')
  })

  test('togglePanel toggles showPanel', () => {
    const { result } = renderHook(() => useReaderLogic())

    act(() => {
      result.current.togglePanel()
    })
    expect(result.current.showPanel).toBe(true)

    act(() => {
      result.current.togglePanel()
    })
    expect(result.current.showPanel).toBe(false)
  })
})

test('goToPage sets scrollTop correctly for non-djvu', () => {
  const { result } = renderHook(() => useReaderLogic())

  // Mocking the scrollRef
  const mockEl = {
    clientHeight: 500,
    scrollTop: 0,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }

  act(() => {
    result.current.scrollRef.current = mockEl
    result.current.setBook({ file: 'book.txt' })
    result.current.goToPage(3)
  })

  expect(mockEl.scrollTop).toBe(1000)
})

test('goToHeading scrolls to the correct heading', () => {
  const { result } = renderHook(() => useReaderLogic())

  const mockHeading1 = {
    textContent: 'Introduction',
    scrollIntoView: vi.fn(),
  }
  const mockHeading2 = {
    textContent: 'Chapter 1',
    scrollIntoView: vi.fn(),
  }

  const mockEl = {
    querySelectorAll: () => [mockHeading1, mockHeading2],
  }

  act(() => {
    result.current.scrollRef.current = mockEl
    result.current.goToHeading('Chapter 1')
  })

  expect(mockHeading2.scrollIntoView).toHaveBeenCalled()
  expect(mockHeading1.scrollIntoView).not.toHaveBeenCalled()
})

test('scroll updates pageInfo and calls saveReadingPosition', async () => {
  const { result } = renderHook(() => useReaderLogic())

  const mockEl = {
    scrollTop: 1000,
    clientHeight: 500,
    scrollHeight: 2500,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }

  act(() => {
    result.current.scrollRef.current = mockEl
    result.current.setBook({ id: 999, file: 'book.txt' })
  })

  // Extracting the signed scroll handler
  const scrollHandler = mockEl.addEventListener.mock.calls.find(
    ([event]) => event === 'scroll'
  )?.[1]

  act(() => {
    scrollHandler()
  })

  expect(result.current.pageInfo).toEqual({
    current: 3, // (1000 / 500) + 1
    total: 4,   // (2500 - 500) / 500 + 1
    percent: 50,
  })

  const { saveReadingPosition } = await import('../axios')
  expect(saveReadingPosition).toHaveBeenCalledWith(999, 3)
})
