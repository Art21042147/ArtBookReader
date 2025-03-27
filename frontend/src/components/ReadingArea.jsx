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
      className="flex-1 flex flex-col items-center justify-center px-8 text-lg leading-relaxed text-center overflow-y-scroll"
    >
      <div className="max-w-4xl whitespace-pre-line text-left">
        {bookText ? bookText : (
          <h1 className="text-8xl font-bold opacity-50">ArtBookReader</h1>
        )}
      </div>

      {showPosition && (
        <div className="absolute bottom-4 text-base text-gray-400">
          <p>
            Page {pageInfo.current} of {pageInfo.total} ({pageInfo.percent}%)
          </p>
        </div>
      )}
    </div>
  )
}
