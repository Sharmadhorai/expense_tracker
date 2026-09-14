import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import API from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(() => {
    const stored = localStorage.getItem('et_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('et_token')
    if (!token) { setLoading(false); return }
    API.get('/auth/me')
      .then(res => { setUser(res.data); localStorage.setItem('et_user', JSON.stringify(res.data)) })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem('et_token')
          localStorage.removeItem('et_user')
          setUser(null)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const cleanEmail = email.trim().toLowerCase()
    const res = await API.post('/auth/login', {
      email: cleanEmail,
      username: cleanEmail,
      password: password
    })
    localStorage.setItem('et_token', res.data.access_token)
    localStorage.setItem('et_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data
  }, [])

  const register = useCallback(async (name, email, password) => {
    const res = await API.post('/auth/register', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password
    })
    localStorage.setItem('et_token', res.data.access_token)
    localStorage.setItem('et_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('et_token')
    localStorage.removeItem('et_user')
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const res = await API.get('/auth/me')
    setUser(res.data)
    localStorage.setItem('et_user', JSON.stringify(res.data))
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
