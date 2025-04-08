window.djvuReader = (function () {
  let documentInstance = null
  let canvas = null
  let ctx = null
  let currentPage = 0
  let totalPages = 0
  let fileKey = null
  let scale = 1.0
  let onPageChange = null

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
  
    // фиксируем "логическое" разрешение — 100% качество, не масштабируем вручную
    canvas.width = imageData.width
    canvas.height = imageData.height
  
    ctx.setTransform(1, 0, 0, 1, 0, 0) // сброс трансформаций
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.putImageData(imageData, 0, 0)
  
    // применяем масштаб через CSS
    canvas.style.transform = `scale(${scale})`
    canvas.style.transformOrigin = 'top center'
  
    currentPage = pageIndex
    savePage()
  
    if (typeof onPageChange === 'function') {
      onPageChange({
        current: currentPage + 1,
        total: totalPages,
        percent: Math.round((currentPage + 1) / totalPages * 100),
      })
    }
  
    console.log(`📄 Rendered page ${currentPage + 1}/${totalPages} at scale ${scale}`)
  }

  async function loadDjvu(buffer, container) {
    documentInstance = new DjVu.Document(buffer)
    totalPages = documentInstance.pages?.length || 0
    if (totalPages === 0) {
      console.warn('⚠️ No pages found in document.')
      return
    }

    container.innerHTML = ''

    const wrapper = document.createElement('div')
    wrapper.style.width = '100%'
    wrapper.style.overflow = 'auto'
    
    canvas = document.createElement('canvas')
    canvas.style.display = 'block'
    canvas.style.margin = 'auto'
    canvas.className = 'mb-4 shadow border rounded'
    
    ctx = canvas.getContext('2d')
    wrapper.appendChild(canvas)
    container.appendChild(wrapper)

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

    setScale: (newScale) => {
      scale = Math.max(0.1, Math.min(newScale, 5.0))
      renderPage(currentPage)
    },

    getCurrentPage: () => currentPage,
    getTotalPages: () => totalPages,

    setOnPageChange: (callback) => { onPageChange = callback },
  }
})()
