import { useState, useRef } from 'react'

export default function Reader() {
  const [showPanel, setShowPanel] = useState(false)
  const [bookText, setBookText] = useState('')           // ← book text
  const fileInputRef = useRef()

  const togglePanel = () => setShowPanel(!showPanel)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = () => {
        setBookText(reader.result)
      }
      reader.readAsText(file, 'UTF-8')
    } else {
      alert('Please select .txt file')
    }
  }

  return (
    <div
      className="flex h-screen bg-black text-white relative overflow-hidden"
      onClick={togglePanel}
    >
      {/* Toolbar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-gray-900 text-white p-4 z-50 transform transition-transform duration-300 ${
          showPanel ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">👤 Username</h2>
        <div className="mb-4">
          <img
            src="/placeholder-book.jpg"
            alt="Cover"
            className="w-full h-auto rounded shadow"
          />
          <p className="mt-2 font-semibold">📖 Book Title</p>
        </div>
        <ul className="space-y-2">
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
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-lg leading-relaxed text-center">
        <div className="max-w-4xl whitespace-pre-line text-left">
          {bookText
            ? bookText
            : 'Upload .txt file'}
        </div>

        {/* Bottom navigation bar */}
        <div className="absolute bottom-4 text-sm text-gray-400">
          <p>Page 1 of 1 (0%)</p>
        </div>
      </div>
    </div>
  )
}
