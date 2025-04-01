import React from 'react'
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
}) {
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
        <img
          src="/placeholder-book.jpg"
          alt="Cover"
          className="w-full h-auto rounded shadow"
        />
        <p className="mt-4 font-semibold text-lg">📖 {book?.title || 'No book'}</p>
      </div>
      <ul className="space-y-4">
        <li className="hover:text-blue-400 cursor-pointer">📑 Content</li>
        <li className="hover:text-blue-400 cursor-pointer">🔍 Find</li>
        <li className="hover:text-blue-400 cursor-pointer">📌 Bookmarks</li>
        <li className="hover:text-blue-400 cursor-pointer">📚 Library</li>
        <ul className="pl-4 space-y-2 max-h-40 overflow-y-auto text-sm">
          {library.map((b) => (
            <li
              key={b.id}
              className="cursor-pointer hover:text-emerald-400 truncate"
              onClick={async () => {
                const text = await api.get(`/books/${b.id}/read/`).then(res => res.data.text)
                setBook(b)
                document.querySelector('[data-scrollable]').scrollTop = 0
                document.querySelector('[data-scrollable]').innerText = text
              }}
            >
              📘 {b.title}
            </li>
          ))}
        </ul>
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
          document.cookie = 'sessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
          document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
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
          accept=".txt"
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}
