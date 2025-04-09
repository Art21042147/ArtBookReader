import React, { useEffect, useRef, useState } from 'react'
import { saveReadingPosition } from '../axios'

export default function DjvuViewer({ fileUrl, setPageInfo, initialPage = 1, bookId }) {
  const containerRef = useRef(null)
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
        await loadScriptOnce('djvu-reader', '/static/djvujs/djvuReader.js')

        if (window.djvuReader?.init) {
          await window.djvuReader.init(containerRef.current, fileUrl)

          // Сначала подключаем обработчики
          window.djvuReader.setOnPageChange(setPageInfo)

          // Подключаем сохранение позиции
          if (bookId) {
            window.saveDjvuReadingPosition = (page) => {
              saveReadingPosition(bookId, page).catch(err =>
                console.error('Ошибка сохранения позиции DJVU:', err)
              )
            }
          }

          // Потом устанавливаем масштаб и открываем нужную страницу
          window.djvuReader.setScale(0.5)
          setZoom(0.5)
          window.djvuReader.goToPage((initialPage || 1) - 1)
        }
      } catch (err) {
        console.error('❌ Failed to load djvu scripts:', err)
      }
    }

    loadDjvuScripts()

    return () => {
      delete window.saveDjvuReadingPosition
    }
  }, [fileUrl, setPageInfo, initialPage, bookId])

  useEffect(() => {
    const handleWheel = (e) => {
      if ((e.ctrlKey || e.metaKey) && containerRef.current?.contains(e.target)) {
        e.preventDefault()
        const delta = e.deltaY
        const newZoom = Math.max(0.2, Math.min(zoom + (delta < 0 ? 0.1 : -0.1), 2))
        setZoom(newZoom)
        window.djvuReader?.setScale(newZoom)
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [zoom])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleDoubleClick = (e) => {
      if (container.contains(e.target)) {
        setZoom(1)
        window.djvuReader?.setScale(1)
      }
    }

    container.addEventListener('dblclick', handleDoubleClick)
    return () => container.removeEventListener('dblclick', handleDoubleClick)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        window.djvuReader?.prevPage()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        window.djvuReader?.nextPage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-[90vh] overflow-auto bg-base-200 p-4 border rounded-xl shadow flex justify-center"
    />
  )
}
