import { useState, useRef, useEffect } from 'react'
import { uploadBook, getLastOpenedBook, saveReadingPosition, getAllBooks } from '../axios'
import { openBookLogic } from './openBookLogic'
import {
  fetchBookmarks as fetchBookmarksLogic,
  addBookmark as addBookmarkLogic,
  deleteBookmark as deleteBookmarkLogic
} from './bookmarksLogic'

export function useReaderLogic() {
  const [showPanel, setShowPanel] = useState(false)
  const [bookText, setBookText] = useState('')
  const [showPosition, setShowPosition] = useState(false)
  const [pageInfo, setPageInfo] = useState({ current: 1, total: 1, percent: 0 })
  const [user, setUser] = useState(null)
  const [book, setBook] = useState(null)
  const [library, setLibrary] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const fileInputRef = useRef()
  const scrollRef = useRef()

  const togglePanel = () => setShowPanel(!showPanel)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'text/plain') {
      try {
        const reader = new FileReader()
        reader.onload = async () => {
          const bookText = reader.result
          setBookText(bookText)
          setShowPosition(true)

          const response = await uploadBook(file)
          setBook(response.data)
          await openBook(response.data)
          setTimeout(() => {
            const saved = localStorage.getItem('scrollPosition')
            if (saved && scrollRef.current) {
              scrollRef.current.scrollTop = parseInt(saved, 10)
            }
          }, 100)
        }
        reader.readAsText(file, 'UTF-8')
      } catch (err) {
        alert('Upload failed')
      }
    } else {
      alert('Please select a .txt file')
    }
  }

  const openBook = async (b) => {
    await openBookLogic({
      book: b,
      setBook,
      setBookText,
      setShowPosition,
      scrollRef,
      setBookmarks,
    })
  }

  const addBookmark = async (note, page) => {
    await addBookmarkLogic(book.id, note, page, setBookmarks)
  }

  const deleteBookmark = async (id) => {
    await deleteBookmarkLogic(id, setBookmarks)
  }

  const goToPage = (page) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (page - 1) * scrollRef.current.clientHeight
    }
  }

  useEffect(() => {
    fetch('/api/profile/')
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(() => setUser(null))
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current || !book) return
      const el = scrollRef.current
      const scrollTop = el.scrollTop
      const scrollHeight = el.scrollHeight - el.clientHeight
      const percent = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0
      const totalPages = Math.max(Math.ceil(scrollHeight / el.clientHeight), 1)
      const currentPage = Math.min(Math.max(Math.round(scrollTop / el.clientHeight) + 1, 1), totalPages)
      setPageInfo({ current: currentPage, total: totalPages, percent })

      saveReadingPosition(book.id, currentPage).catch(err =>
        console.error('Error saving reading position:', err)
      )
    }

    const el = scrollRef.current
    if (el) el.addEventListener('scroll', handleScroll)
    return () => {
      if (el) el.removeEventListener('scroll', handleScroll)
    }
  }, [book])

  useEffect(() => {
    const fetchLastBook = async () => {
      try {
        const lastBook = await getLastOpenedBook()
        openBook(lastBook)
      } catch (err) {
        console.error('Error loading last book:', err)
      }
    }

    fetchLastBook()
  }, [])

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const books = await getAllBooks()
        setLibrary(books)
      } catch (err) {
        console.error('Failed to fetch library:', err)
      }
    }

    fetchLibrary()
  }, [])

  return {
    user,
    book,
    bookText,
    pageInfo,
    showPanel,
    showPosition,
    scrollRef,
    fileInputRef,
    togglePanel,
    setUser,
    setBook,
    setBookText,
    handleFileChange,
    library,
    openBook,
    bookmarks,
    addBookmark,
    deleteBookmark,
    goToPage,
  }
}
