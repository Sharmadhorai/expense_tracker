import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('et_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally – clear storage and redirect to login
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('et_token')
      localStorage.removeItem('et_user')
      window.location.href = '/login'
    }
    
    // Format FastAPI validation errors (array of objects) into a clean string
    if (err.response?.data && Array.isArray(err.response.data.detail)) {
      const details = err.response.data.detail
      err.response.data.detail = details.map(d => {
        const field = d.loc ? d.loc[d.loc.length - 1] : ''
        return `${field ? field + ': ' : ''}${d.msg}`
      }).join(', ')
    }
    
    return Promise.reject(err)
  }
)

export default API
