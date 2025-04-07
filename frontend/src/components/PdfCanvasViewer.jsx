import { useEffect, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker?worker'

pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker()

export default function PdfCanvasViewer({ fileUrl }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const renderPdf = async () => {
      console.log('📥 renderPdf started with fileUrl:', fileUrl)
      const loadingTask = pdfjsLib.getDocument(fileUrl)
      const pdf = await loadingTask.promise

      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 1.5 })

      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      canvas.height = viewport.height
      canvas.width = viewport.width

      await page.render({ canvasContext: context, viewport }).promise
      console.log("📄 Loading PDF from:", fileUrl)
    }

    renderPdf()
  }, [fileUrl])

  return (
    <div className="flex justify-center py-6">
      <canvas ref={canvasRef} className="border shadow-md rounded" />
    </div>
  )
}
