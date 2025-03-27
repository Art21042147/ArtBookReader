import { useState, useRef, useEffect } from 'react'
import api from '../axios'
import { uploadBook, getMyBooks } from '../axios'

export function useReaderLogic() {
  const [showPanel, setShowPanel] = useState(false)
  const [bookText, setBookText] = useState('')
  const [showPosition, setShowPosition] = useState(false)
  const [pageInfo, setPageInfo] = useState({ current: 1, total: 1, percent: 0 })
  const [user, setUser] = useState(null)
  const [book, setBook] = useState(null)
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

  useEffect(() => {
    api.get('/profile/')
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return
      const el = scrollRef.current
      const scrollTop = el.scrollTop
      const scrollHeight = el.scrollHeight - el.clientHeight
      const percent = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0
      const totalPages = Math.max(Math.ceil(scrollHeight / el.clientHeight), 1)
      const currentPage = Math.min(Math.max(Math.round(scrollTop / el.clientHeight) + 1, 1), totalPages)
      setPageInfo({ current: currentPage, total: totalPages, percent })
      localStorage.setItem('scrollPosition', scrollTop)
    }

    const el = scrollRef.current
    if (el) el.addEventListener('scroll', handleScroll)
    return () => {
      if (el) el.removeEventListener('scroll', handleScroll)
    }
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
    handleFileChange
  }
}
