import React, { useEffect, useRef } from 'react'

export default function DjvuViewer({ fileUrl }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const loadScriptOnce = (id, src) => {
      if (document.getElementById(id)) {
        return Promise.resolve()
      }

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

        if (window.djvuReader && typeof window.djvuReader.init === 'function') {
          window.djvuReader.init(containerRef.current, fileUrl)
        } else {
          console.warn('⚠️ djvuReader.init not found')
        }
      } catch (err) {
        console.error('❌ Failed to load djvu scripts:', err)
      }
    }

    loadDjvuScripts()
  }, [fileUrl])

  return (
    <div className="w-full h-[90vh] overflow-auto bg-base-100 border rounded-xl shadow p-2">
      <div ref={containerRef} id="djvu-container" />
    </div>
  )
}
