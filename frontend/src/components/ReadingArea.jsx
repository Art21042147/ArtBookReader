import React, { useEffect, useState } from 'react'
import { renderFb2, extractNotes } from './fb2Renderer'
import PdfCanvasViewer from './PdfCanvasViewer'
import NoteModal from './NoteModal'

export default function ReadingArea({ bookText, scrollRef, showPosition, pageInfo, book }) {
  const [notes, setNotes] = useState({})
  const [activeNote, setActiveNote] = useState(null)
  const [noteId, setNoteId] = useState(null)

  const isFb2 = book?.file?.endsWith('.fb2') || book?.title?.toLowerCase().endsWith('.fb2')
  const isPdf = book?.file?.endsWith('.pdf') || book?.title?.toLowerCase().endsWith('.pdf')

  useEffect(() => {
    if (isFb2 && bookText) {
      const parsedNotes = extractNotes(bookText)
      setNotes(parsedNotes)
    }
  }, [bookText])

  useEffect(() => {
    // If there is content - open in a new tab
    if (isPdf) {
      const hasContent = book?.content && book.content.chapters && book.content.chapters.length > 0
      if (hasContent) {
        window.open(book.file.startsWith('http') ? book.file : `/${book.file}`, '_blank')
      }
    }
  }, [isPdf, book])

  const handleClick = (e) => {
    const link = e.target.closest('a')
    if (link && link.getAttribute('href')?.startsWith('#n_')) {
      e.preventDefault()
      const id = link.getAttribute('href').slice(1)
      const text = notes[id]
      setActiveNote(text || 'Note not found')
      setNoteId(id)
    }
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto flex flex-col items-center px-8 text-lg leading-relaxed text-center py-24"
      onClick={handleClick}
    >
      {isPdf && book?.title === 'Untitled' && !book?.content ? (
        <PdfCanvasViewer fileUrl={`/media/${book.file}`} />
      ) : isPdf && (!book?.content?.chapters?.length) ? (
        <iframe
          src={book.file.startsWith('/') ? book.file : `/${book.file}`}
          className="w-full h-[90vh] border-none rounded shadow-lg"
          title="PDF Viewer"
        />
      ) : bookText ? (
        isFb2 ? (
          renderFb2(bookText)
        ) : (
          <div className="max-w-4xl whitespace-pre-line text-left">{bookText}</div>
        )
      ) : (
        <h1 className="text-8xl font-bold opacity-50">ArtBookReader</h1>
      )}

      {showPosition && !isPdf && (
        <div className="fixed top-4 right-6 text-base text-gray-400 z-40">
          <p>
            Page {pageInfo.current} of {pageInfo.total} ({pageInfo.percent}%)
          </p>
        </div>
      )}

      <NoteModal
        noteText={activeNote}
        noteId={noteId}
        onClose={() => {
          setActiveNote(null)
          setNoteId(null)
        }}
      />
    </div>
  )
}
