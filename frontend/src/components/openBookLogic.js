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
    setBook(book)
    setBookText(text)
    setShowPosition(true)

    await markBookAsOpened(book.id)
    await fetchBookmarks(book.id, setBookmarks)

    const position = await getReadingPosition(book.id)
    if (position && scrollRef.current) {
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
