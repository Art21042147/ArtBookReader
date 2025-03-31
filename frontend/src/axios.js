import axios from 'axios'

// Get CSRF token from cookie
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

// Create an axios instance
const api = axios.create({
  baseURL: '/api/',
  withCredentials: true,
})

// Add the CSRF token to all necessary requests
api.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrftoken')

  // Only for methods with a request body
  const csrfMethods = ['post', 'put', 'patch', 'delete']

  if (
    csrfMethods.includes(config.method.toLowerCase()) &&
    config.headers['Content-Type'] !== 'multipart/form-data'
  ) {
    config.headers['X-CSRFToken'] = csrfToken
  }

  return config
})

// Books API
export const uploadBook = async (file) => {
  const formData = new FormData()
  formData.append('title', file.name.replace(/\.[^/.]+$/, ''))
  formData.append('file', file)
  return api.post('/books/', formData)
}

export const getMyBooks = () => api.get('/books/')

export const saveReadingPosition = (bookId, last_position) =>
  api.post(
    '/positions/',
    { book: bookId, last_position },
    { headers: { 'Content-Type': 'application/json' } }
  )

export const getReadingPosition = async (bookId) => {
  const response = await api.get('/positions/')
  const data = response.data

  if (Array.isArray(data)) {
    return data.find(pos => pos.book === bookId)
  }

  if (data.book === bookId) return data

  return null
}

export default api
