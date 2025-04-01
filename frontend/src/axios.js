import axios from 'axios'

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

const api = axios.create({
  baseURL: '/api/',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrftoken')
  const csrfMethods = ['post', 'put', 'patch', 'delete']

  if (
    csrfMethods.includes(config.method.toLowerCase()) &&
    config.headers['Content-Type'] !== 'multipart/form-data'
  ) {
    config.headers['X-CSRFToken'] = csrfToken
  }

  return config
})

export const uploadBook = async (file) => {
  const formData = new FormData()
  formData.append('title', file.name.replace(/\.[^/.]+$/, ''))
  formData.append('file', file)
  return api.post('/books/', formData)
}

export const saveReadingPosition = (bookId, last_position) =>
  api.post(
    '/positions/',
    { book: bookId, last_position },
    { headers: { 'Content-Type': 'application/json' } }
  )

export const getReadingPosition = async (bookId) => {
  try {
    const response = await api.get(`/positions/${bookId}/book/`)
    return response.data
  } catch (error) {
    console.warn('No saved reading position for this book.')
    return null
  }
}

export const getLastOpenedBook = async () => {
  const response = await api.get('/positions/last/')
  return response.data
}

export const markBookAsOpened = async (bookId) => {
  return api.post(`/positions/${bookId}/mark-opened/`)
}

export const getBookText = async (bookId) => {
  const response = await api.get(`/books/${bookId}/read/`)
  return response.data.text
}

export default api
