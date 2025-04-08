window.djvuReader = (function () {
  let documentInstance = null
  let canvas = null
  let ctx = null
  let currentPage = 0
  let totalPages = 0
  let fileKey = null

  function savePage() {
    if (fileKey) {
      localStorage.setItem('djvu_page_' + fileKey, currentPage)
    }
  }

  function loadSavedPage() {
    if (fileKey) {
      const saved = localStorage.getItem('djvu_page_' + fileKey)
      return saved ? parseInt(saved) : 0
    }
    return 0
  }

  async function renderPage(pageIndex) {
    if (!documentInstance || !canvas || !ctx) return
    if (pageIndex < 0 || pageIndex >= totalPages) return

    const page = await documentInstance.getPage(pageIndex + 1)
    const imageData = await page.getImageData()

    canvas.width = imageData.width
    canvas.height = imageData.height
    ctx.putImageData(imageData, 0, 0)

    currentPage = pageIndex
    savePage()
    console.log(`📄 Rendered page ${currentPage + 1}/${totalPages}`)
  }

  async function loadDjvu(buffer, container) {
    documentInstance = new DjVu.Document(buffer)
    totalPages = documentInstance.pages?.length || 0
    if (totalPages === 0) {
      console.warn('⚠️ No pages found in document.')
      return
    }

    container.innerHTML = ''
    canvas = document.createElement('canvas')
    canvas.className = 'mb-4 shadow border rounded'
    ctx = canvas.getContext('2d')
    container.appendChild(canvas)

    const savedPage = loadSavedPage()
    await renderPage(savedPage)
  }

  return {
    init: async function (container, fileUrl) {
      try {
        fileKey = btoa(fileUrl)
        const response = await fetch(fileUrl)
        if (!response.ok) throw new Error('Failed to load file')

        const buffer = await response.arrayBuffer()

        if (!window.DjVu || !window.DjVu.Document) {
          console.error('❌ DjVu.js not loaded properly')
          return
        }

        await loadDjvu(buffer, container)
      } catch (err) {
        console.error('❌ djvuReader.init failed:', err)
      }
    },

    nextPage: () => {
      if (currentPage + 1 < totalPages) {
        renderPage(currentPage + 1)
      }
    },

    prevPage: () => {
      if (currentPage > 0) {
        renderPage(currentPage - 1)
      }
    },

    goToPage: (n) => {
      if (n >= 0 && n < totalPages) {
        renderPage(n)
      }
    },

    getCurrentPage: () => currentPage,
    getTotalPages: () => totalPages,
  }
})()
