import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
})

// every request carries the token, if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api