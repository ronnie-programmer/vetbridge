import { createContext, useContext, useState } from 'react'

import  api from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem('access')),
  )

  async function login(username, password) {
    const response = await api.post('/auth/login/', { username, password })
    localStorage.setItem('access', response.data.access)
    localStorage.setItem('refresh', response.data.refresh)
    setIsLoggedIn(true)
  }

  async function register(username, email, password) {
    await api.post('/auth/register/', { username, email, password })
  }

  async function confirm(token) {
    await api.post(`/auth/confirm/${token}/`)
  }

  async function logout() {
    const refresh = localStorage.getItem('refresh')
    try {
      await api.post('/auth/logout/', { refresh })
    } catch {
      // token may already be expired, we still clear it locally
    }
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    setIsLoggedIn(false)
  }

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, login, register, confirm, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
    return useContext(AuthContext)
}