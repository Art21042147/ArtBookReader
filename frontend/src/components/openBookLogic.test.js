import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { openBookLogic } from './openBookLogic'
import * as axiosModule from '../axios'
import * as bookmarksModule from './bookmarksLogic'

describe('openBookLogic', () => {
  const mockSetBook = vi.fn()
  const mockSetBookText = vi.fn()
  const mockSetShowPosition = vi.fn()
  const mockSetBookmarks = vi.fn()
  const mockScrollRef = { current: { clientHeight: 500, scrollTop: 0 } }

  const sampleBook = {
    id: 1,
    file: 'example.txt',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads book, position, scrolls and fetches bookmarks', async () => {
    const fakeText = 'Text from book'
    const fakePosition = { last_position: 2 }

    vi.spyOn(axiosModule, 'getBookText').mockResolvedValue(fakeText)
    vi.spyOn(axiosModule, 'getReadingPosition').mockResolvedValue(fakePosition)
    vi.spyOn(axiosModule, 'markBookAsOpened').mockResolvedValue()
    vi.spyOn(bookmarksModule, 'fetchBookmarks').mockResolvedValue()

    await openBookLogic({
      book: sampleBook,
      setBook: mockSetBook,
      setBookText: mockSetBookText,
      setShowPosition: mockSetShowPosition,
      scrollRef: mockScrollRef,
      setBookmarks: mockSetBookmarks,
    })

    expect(axiosModule.getBookText).toHaveBeenCalledWith(1)
    expect(axiosModule.getReadingPosition).toHaveBeenCalledWith(1)
    expect(mockSetBook).toHaveBeenCalledWith({
      ...sampleBook,
      last_position: 2,
    })
    expect(mockSetBookText).toHaveBeenCalledWith(fakeText)
    expect(mockSetShowPosition).toHaveBeenCalledWith(true)
    expect(axiosModule.markBookAsOpened).toHaveBeenCalledWith(1)
    expect(bookmarksModule.fetchBookmarks).toHaveBeenCalledWith(1, mockSetBookmarks)
  })

  it('defaults to page 1 for djvu files', async () => {
    const djvuBook = { id: 2, file: 'book.djvu' }

    vi.spyOn(axiosModule, 'getBookText').mockResolvedValue('djvu')
    vi.spyOn(axiosModule, 'getReadingPosition').mockResolvedValue(null)
    vi.spyOn(axiosModule, 'markBookAsOpened').mockResolvedValue()
    vi.spyOn(bookmarksModule, 'fetchBookmarks').mockResolvedValue()

    await openBookLogic({
      book: djvuBook,
      setBook: mockSetBook,
      setBookText: mockSetBookText,
      setShowPosition: mockSetShowPosition,
      scrollRef: mockScrollRef,
      setBookmarks: mockSetBookmarks,
    })

    expect(mockSetBook).toHaveBeenCalledWith({
      ...djvuBook,
      last_position: 1,
    })
  })

  it('logs error if fetching fails', async () => {
    const error = new Error('fail')
    vi.spyOn(axiosModule, 'getBookText').mockRejectedValue(error)

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await openBookLogic({
      book: sampleBook,
      setBook: mockSetBook,
      setBookText: mockSetBookText,
      setShowPosition: mockSetShowPosition,
      scrollRef: mockScrollRef,
      setBookmarks: mockSetBookmarks,
    })

    expect(consoleSpy).toHaveBeenCalledWith('Failed to open book:', error)

    consoleSpy.mockRestore()
  })
})
