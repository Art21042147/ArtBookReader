import api from '../axios'

export const fetchBookmarks = async (bookId, setBookmarks) => {
  try {
    const res = await api.get('/bookmarks/')
    const filtered = res.data.filter((b) => b.book === bookId)
    setBookmarks(filtered)
  } catch (err) {
    console.error('Error loading bookmarks:', err)
  }
}

export const addBookmark = async (bookId, note, page, setBookmarks) => {
  try {
    const res = await api.post('/bookmarks/', {
      book: bookId,
      note,
      page,
    })
    setBookmarks((prev) => [...prev, res.data])
  } catch (err) {
    alert('Failed to add bookmark')
  }
}

export const deleteBookmark = async (id, setBookmarks) => {
  try {
    await api.delete(`/bookmarks/${id}/`)
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
  } catch (err) {
    alert('Failed to delete bookmark')
  }
}
