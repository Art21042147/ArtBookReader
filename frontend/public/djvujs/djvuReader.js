window.djvuReader = (function () {
  let documentInstance = null
  let canvas = null
  let ctx = null
  let currentPage = 0
  let totalPages = 0
  let fileKey = null

  function savePage() {
    if (fileKey) {
      localStorage.setItem('djvu_pos_' + fileKey, currentPage)
    }
  }

  function loadSavedPage() {
    if (fileKey) {
      const saved = localStorage.getItem('djvu_pos_' + fileKey)
      return saved ? parseInt(saved) : 0
    }
    return 0
  }

  async function renderPage(pageIndex) {
    if (!documentInstance || !canvas || !ctx) return
    const page = await documentInstance.getPage(pageIndex + 1) // страницы с 1
    const imageData = await page.getImageData()
    canvas.width = imageData.width
    canvas.height = imageData.height
    ctx.putImageData(imageData, 0, 0)
    currentPage = pageIndex
    savePage()
  }

  async function loadDjvu(buffer, container) {
    const DjVu = window.DjVu
    documentInstance = new DjVu.Document(buffer)
    totalPages = documentInstance.pagesCount

    canvas = document.createElement('canvas')
    canvas.style.maxWidth = '100%'
    canvas.style.height = 'auto'
    ctx = canvas.getContext('2d')
    container.innerHTML = ''
    container.appendChild(canvas)

    const savedPage = loadSavedPage()
    renderPage(savedPage)
  }

  return {
    init: async function (container, fileUrl) {
      fileKey = btoa(fileUrl)
      const response = await fetch(fileUrl)
      const buffer = await response.arrayBuffer()

      if (!window.DjVu || !window.DjVu.Document) {
        console.error('DjVu.js not loaded properly')
        return
      }

      await loadDjvu(buffer, container)
    },

    nextPage: function () {
      if (currentPage + 1 < totalPages) {
        renderPage(currentPage + 1)
      }
    },

    prevPage: function () {
      if (currentPage > 0) {
        renderPage(currentPage - 1)
      }
    },

    goToPage: function (n) {
      if (n >= 0 && n < totalPages) {
        renderPage(n)
      }
    },

    getCurrentPage: () => currentPage,
    getTotalPages: () => totalPages,
  }
})()
