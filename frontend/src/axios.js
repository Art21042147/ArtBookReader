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
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add the CSRF token to all necessary requests
api.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrftoken')

  // Add only for CSRF sensitive methods
  const csrfMethods = ['post', 'put', 'patch', 'delete']
  if (csrfMethods.includes(config.method)) {
    config.headers['X-CSRFToken'] = csrfToken
  }

  return config
})

export default api
