import axios from 'axios'

// Base API configuration – points to the FastAPI backend
const api = axios.create({
  baseURL: 'http://localhost:8000',
})

// Request interceptor – attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor – redirect to login on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Simple client‑side navigation; may be replaced by React Router push in a full app
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
