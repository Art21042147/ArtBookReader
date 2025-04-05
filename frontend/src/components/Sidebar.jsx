import React, { useState } from 'react'
import api from '../axios'

export default function Sidebar({
  user,
  book,
  showPanel,
  togglePanel,
  fileInputRef,
  handleFileChange,
  library,
  setBook,
  openBook,
  addBookmark,
  deleteBookmark,
  bookmarks,
  pageInfo,
  goToPage,
  goToHeading,
}) {
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [noteInput, setNoteInput] = useState('')

  return (
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
        <p className="mt-4 font-semibold text-lg">📖 {book?.title || 'No book'}</p>
        {book?.author && (
          <p className="text-sm text-gray-400 italic mt-1">
            ✍️ {book.author}
          </p>
        )}
      </div>

      <ul className="space-y-4">
        <li
          className="hover:text-blue-400 cursor-pointer"
          onClick={() => setShowContent(!showContent)}
        >
          📑 Content
        </li>

        {showContent && book?.content?.chapters?.length > 0 && (
          <ul className="pl-4 text-sm space-y-1 max-h-48 overflow-y-auto">
            {book.content.chapters.map((item, index) => (
              <li
                key={index}
                className="cursor-pointer hover:text-emerald-400 truncate"
                onClick={() => goToHeading(item.title)}
              >
                📄 {item.title}
              </li>
            ))}
          </ul>
        )}

        <li
          className="hover:text-blue-400 cursor-pointer"
          onClick={() => setShowBookmarks(!showBookmarks)}
        >
          📌 Bookmarks
        </li>

        {showBookmarks && (
          <div className="pl-4 text-sm space-y-2 max-h-60 overflow-y-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value.slice(0, 24))}
                placeholder="Note (max 24 chars)"
                className="w-full px-2 py-1 rounded text-black"
              />
              <button
                className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
                onClick={() => {
                  addBookmark(noteInput, pageInfo.current)
                  setNoteInput('')
                }}
              >
                Add
              </button>
            </div>
            {bookmarks.map((bm) => (
              <div key={bm.id} className="flex justify-between items-center">
                <span
                  onClick={() => goToPage(bm.page)}
                  className="cursor-pointer hover:text-emerald-400 truncate"
                >
                  📎 {bm.note || `Page ${bm.page}`}
                </span>
                <span
                  onClick={() => deleteBookmark(bm.id)}
                  className="cursor-pointer hover:text-red-400 ml-2"
                >
                  ❌
                </span>
              </div>
            ))}
          </div>
        )}

        <li
          className="hover:text-blue-400 cursor-pointer"
          onClick={() => setShowLibrary(!showLibrary)}
        >
          📚 Library
        </li>

        {showLibrary && (
          <ul className="pl-4 space-y-2 max-h-40 overflow-y-auto text-sm">
            {library.map((b) => (
              <li
                key={b.id}
                className="cursor-pointer hover:text-emerald-400 truncate"
                onClick={() => openBook(b)}
              >
                📘 {b.title}
              </li>
            ))}
          </ul>
        )}

        <li
          className="hover:text-blue-400 cursor-pointer"
          onClick={() => fileInputRef.current.click()}
        >
          ➕ Add Book
        </li>
      </ul>

      <button
        onClick={async () => {
          await api.post('logout/')
          window.location.href = '/'
        }}
        className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
      >
        Log Out
      </button>

      <div style={{ display: 'none' }}>
        <input
          type="file"
          ref={fileInputRef}
          accept=".txt, .doc, .docx, .fb2, .epub, .pdf, .djvu"
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}
