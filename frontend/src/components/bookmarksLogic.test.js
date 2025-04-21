import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as bookmarks from './bookmarksLogic'
import api from '../axios'

vi.mock('../axios')

describe('bookmarksLogic', () => {
  const mockSetBookmarks = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetchBookmarks filters and sets bookmarks', async () => {
    api.get.mockResolvedValue({
      data: [
        { id: 1, book: 1 },
        { id: 2, book: 2 },
        { id: 3, book: 1 },
      ],
    })

    await bookmarks.fetchBookmarks(1, mockSetBookmarks)

    expect(api.get).toHaveBeenCalledWith('/bookmarks/')
    expect(mockSetBookmarks).toHaveBeenCalledWith([
      { id: 1, book: 1 },
      { id: 3, book: 1 },
    ])
  })

  it('addBookmark posts and appends new bookmark', async () => {
    const newBookmark = { id: 10, book: 1, note: 'Note', page: 5 }

    api.post.mockResolvedValue({ data: newBookmark })

    const prev = [{ id: 1, book: 1 }]
    const setMock = vi.fn(fn => fn(prev))

    await bookmarks.addBookmark(1, 'Note', 5, setMock)

    expect(api.post).toHaveBeenCalledWith('/bookmarks/', {
      book: 1,
      note: 'Note',
      page: 5,
    })

    expect(setMock).toHaveBeenCalled()
    expect(setMock.mock.calls[0][0](prev)).toEqual([...prev, newBookmark])
  })

  it('deleteBookmark deletes and filters bookmark', async () => {
    api.delete.mockResolvedValue({})

    const prev = [
      { id: 1, book: 1 },
      { id: 2, book: 1 },
    ]
    const setMock = vi.fn(fn => fn(prev))

    await bookmarks.deleteBookmark(1, setMock)

    expect(api.delete).toHaveBeenCalledWith('/bookmarks/1/')
    expect(setMock).toHaveBeenCalled()
    expect(setMock.mock.calls[0][0](prev)).toEqual([
      { id: 2, book: 1 },
    ])
  })
})
