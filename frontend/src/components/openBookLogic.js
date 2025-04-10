import {
  getBookText,
  markBookAsOpened,
  getReadingPosition
} from '../axios'
import { fetchBookmarks } from './bookmarksLogic'

export const openBookLogic = async ({
  book,
  setBook,
  setBookText,
  setShowPosition,
  scrollRef,
  setBookmarks,
}) => {
  try {
    const text = await getBookText(book.id)
    const position = await getReadingPosition(book.id)

    const isDjvu = book.file.endsWith('.djvu')
    const isText = book.file.endsWith('.txt') || book.file.endsWith('.fb2')
    
    const enrichedBook = {
      ...book,
      last_position: isDjvu || isText ? position?.last_position || 1 : 1,
    }

    setBook(enrichedBook)
    setBookText(text)
    setShowPosition(true)

    await markBookAsOpened(book.id)
    await fetchBookmarks(book.id, setBookmarks)

    // For text formats only - scroll.
    if (position && scrollRef.current && !book.file.endsWith('.djvu')) {
      setTimeout(() => {
        const el = scrollRef.current
        const page = position.last_position
        const scrollTo = (page - 1) * el.clientHeight
        el.scrollTop = scrollTo
      }, 100)
    }
  } catch (err) {
    console.error('Failed to open book:', err)
  }
}
