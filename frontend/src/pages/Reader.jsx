import { useState, useRef, useEffect } from 'react'
import api from '../axios'

export default function Reader() {
  const [showPanel, setShowPanel] = useState(false)
  const [bookText, setBookText] = useState('')
  const [showPosition, setShowPosition] = useState(false)
  const [pageInfo, setPageInfo] = useState({ current: 1, total: 1, percent: 0 })
  const [user, setUser] = useState(null)
  const fileInputRef = useRef()
  const scrollRef = useRef()

  const togglePanel = () => setShowPanel(!showPanel)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = () => {
        setBookText(reader.result)
        setShowPosition(true)
        setTimeout(() => {
          const saved = localStorage.getItem('scrollPosition')
          if (saved && scrollRef.current) {
            scrollRef.current.scrollTop = parseInt(saved, 10)
          }
        }, 100)
      }
      reader.readAsText(file, 'UTF-8')
    } else {
      alert('Please select .txt file')
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

  return (
    <div
      className="flex h-screen bg-gray-950 text-white relative overflow-hidden"
      onClick={togglePanel}
    >
      {/* Toolbar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-indigo-950 text-white p-6 text-lg z-50 transform transition-transform duration-300 ${
          showPanel ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6">
          👤 {user?.username || '...'}
        </h2>
        <div className="mb-6">
          <img
            src="/placeholder-book.jpg"
            alt="Cover"
            className="w-full h-auto rounded shadow"
          />
          <p className="mt-4 font-semibold text-lg">📖 Book Title</p>
        </div>
        <ul className="space-y-4">
          <li className="hover:text-blue-400 cursor-pointer">📑 Content</li>
          <li className="hover:text-blue-400 cursor-pointer">🔍 Find</li>
          <li className="hover:text-blue-400 cursor-pointer">📌 Bookmarks</li>
          <li className="hover:text-blue-400 cursor-pointer">📚 Library</li>
          <li
            className="hover:text-blue-400 cursor-pointer"
            onClick={() => fileInputRef.current.click()}
          >
            ➕ Add Book
          </li>
        </ul>

        {/* Log Out bottom */}
        <button
          onClick={async () => {
            await api.post('logout/')
            setUser(null)
            window.location.href = '/'
          }}
          className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
        >
          Log Out
        </button>

        {/* Hidden input for file selection */}
        <div style={{ display: 'none' }}>
          <input
            type="file"
            ref={fileInputRef}
            accept=".txt"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Main reading area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto flex flex-col items-center px-8 text-lg leading-relaxed text-center py-24"
      >
        {bookText ? (
          <>
            <div className="fixed top-4 right-6 text-base text-gray-400 z-40">
              <p>Page {pageInfo.current} of {pageInfo.total} ({pageInfo.percent}%)</p>
            </div>
            <div className="whitespace-pre-line max-w-5xl text-left">
              {bookText}
            </div>
          </>
        ) : (
          <h1 className="text-8xl font-bold opacity-50">ArtBookReader</h1>
        )}
      </div>
    </div>
  )
}
