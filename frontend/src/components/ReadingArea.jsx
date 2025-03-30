import React from 'react'

export default function ReadingArea({
  bookText,
  scrollRef,
  showPosition,
  pageInfo,
}) {
  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto flex flex-col items-center px-8 text-lg leading-relaxed text-center py-24"
    >
      <div className="max-w-4xl whitespace-pre-line text-left">
        {bookText ? bookText : (
          <h1 className="text-8xl font-bold opacity-50">ArtBookReader</h1>
        )}
      </div>

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
