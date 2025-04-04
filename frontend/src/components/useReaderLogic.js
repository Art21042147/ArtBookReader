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
    if (!file) return
  
    const ext = file.name.split('.').pop().toLowerCase()
    const supported = ['txt', 'fb2']
  
    if (supported.includes(ext)) {
      try {
        const response = await uploadBook(file)
        setBook(response.data)
        await openBook(response.data)
      } catch (err) {
        alert('Upload failed')
        console.error(err)
      }
    } else {
      alert('Please select a supported file (.txt, .fb2)')
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

  const goToHeading = (title) => {
    if (!scrollRef.current || !bookText) return

    const el = scrollRef.current
    const target = bookText.indexOf(title)

    if (target !== -1) {
      const preview = bookText.slice(0, target)
      const lines = preview.split('\n').length
      const approxLineHeight = 2.5
      const scrollTo = lines * approxLineHeight * 10

      el.scrollTo({
        top: scrollTo,
        behavior: 'smooth'
      })
    } else {
      console.warn('Heading not found in text:', title)
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
    goToHeading,
  }
}
