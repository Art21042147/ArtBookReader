import React, { useEffect, useRef } from 'react'

// React component NoteModal that displays a modal window with a note. 
export default function NoteModal({ noteText, noteId, onClose }) {
  const modalRef = useRef(null)

  // Close the modal hook.
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose()
    }
  }

  if (!noteText) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center"
      onClick={handleClickOutside}
    >
      <div
        ref={modalRef}
        className="bg-sky-950 text-white p-6 rounded-xl max-w-xl shadow-xl relative"
      >
        <h2 className="text-lg font-bold mb-4">📌 Note </h2>
        <div
          className="prose prose-sm max-w-none text-white mb-6"
          dangerouslySetInnerHTML={{ __html: noteText }}
        />
        <button
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded shadow"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  )
}
