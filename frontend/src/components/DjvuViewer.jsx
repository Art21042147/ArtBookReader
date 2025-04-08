import React, { useEffect, useRef, useState } from 'react'

export default function DjvuViewer({ fileUrl }) {
  const containerRef = useRef(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const loadScriptOnce = (id, src) => {
      if (document.getElementById(id)) return Promise.resolve()
      return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = src
        script.async = true
        script.id = id
        script.onload = resolve
        script.onerror = reject
        document.body.appendChild(script)
      })
    }

    const loadDjvuScripts = async () => {
      try {
        await loadScriptOnce('djvu-lib', '/static/djvujs/djvu.js')
        console.log('✅ djvu.js loaded')
        await loadScriptOnce('djvu-reader', '/static/djvujs/djvuReader.js')
        console.log('✅ djvuReader.js loaded')

        if (window.djvuReader?.init) {
          await window.djvuReader.init(containerRef.current, fileUrl)

          const updateUI = () => {
            setCurrentPage(window.djvuReader.getCurrentPage() + 1)
            setTotalPages(window.djvuReader.getTotalPages())
          }

          updateUI()

          const origNext = window.djvuReader.nextPage
          const origPrev = window.djvuReader.prevPage
          const origGoTo = window.djvuReader.goToPage

          window.djvuReader.nextPage = () => {
            origNext()
            setTimeout(updateUI, 100)
          }
          window.djvuReader.prevPage = () => {
            origPrev()
            setTimeout(updateUI, 100)
          }
          window.djvuReader.goToPage = (n) => {
            origGoTo(n)
            setTimeout(updateUI, 100)
          }

          // Инициализация масштаба при загрузке
          window.djvuReader.setScale(zoom)
        } else {
          console.warn('⚠️ djvuReader.init not found')
        }
      } catch (err) {
        console.error('❌ Failed to load djvu scripts:', err)
      }
    }

    loadDjvuScripts()
  }, [fileUrl])

  const increaseZoom = () => {
    const newZoom = Math.min(zoom + 0.1, 5)
    setZoom(newZoom)
    window.djvuReader?.setScale(newZoom)
  }

  const decreaseZoom = () => {
    const newZoom = Math.max(zoom - 0.1, 0.1)
    setZoom(newZoom)
    window.djvuReader?.setScale(newZoom)
  }

  return (
    <div className="w-full h-[90vh] overflow-auto bg-base-200 p-4 border rounded-xl shadow flex flex-col items-center gap-4">
      <div ref={containerRef} className="w-full flex justify-center" />
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          className="btn btn-sm btn-outline"
          onClick={() => window.djvuReader?.prevPage()}
        >
          ◀️ Назад
        </button>
        <span className="text-sm font-medium">
          Страница {currentPage} из {totalPages}
        </span>
        <button
          className="btn btn-sm btn-outline"
          onClick={() => window.djvuReader?.nextPage()}
        >
          Вперёд ▶️
        </button>
        <button className="btn btn-sm" onClick={decreaseZoom}>
          ➖ Zoom
        </button>
        <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
        <button className="btn btn-sm" onClick={increaseZoom}>
          ➕ Zoom
        </button>
      </div>
    </div>
  )
}
