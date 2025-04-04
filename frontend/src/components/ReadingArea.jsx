import React from 'react'

export default function ReadingArea({
  bookText,
  scrollRef,
  showPosition,
  pageInfo,
  book,
}) {
  const handleClick = (e) => {
    const target = e.target
    if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#n_')) {
      e.preventDefault()
      const noteId = target.getAttribute('href').slice(1)
      alert(`🔖 Note link clicked: ${noteId}`)
    }
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto flex flex-col items-center px-8 text-lg leading-relaxed text-center py-24"
      onClick={handleClick}
    >
      {bookText ? (
        /<\/?[a-z][\s\S]*>/i.test(bookText) ? (
          // HTML
          <div
            className="max-w-4xl text-left whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: bookText }}
          />
        ) : (
          // txt
          <div className="max-w-4xl whitespace-pre-line text-left">
            {bookText}
          </div>
        )
      ) : (
        // logo
        <h1 className="text-8xl font-bold opacity-50">ArtBookReader</h1>
      )}

      {showPosition && (
        <div className="fixed top-4 right-6 text-base text-gray-400 z-40">
          <p>
            Page {pageInfo.current} of {pageInfo.total} ({pageInfo.percent}%)
          </p>
        </div>
      )}
    </div>
  )
}
