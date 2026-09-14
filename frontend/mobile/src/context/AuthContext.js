import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import API from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const token = await AsyncStorage.getItem('et_token')
        if (!token) { setLoading(false); return }
        const res = await API.get('/auth/me')
        setUser(res.data)
        await AsyncStorage.setItem('et_user', JSON.stringify(res.data))
      } catch (err) {
        if (err.response?.status === 401) {
          await AsyncStorage.multiRemove(['et_token', 'et_user'])
          setUser(null)
        }
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const login = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase()
    const res = await API.post('/auth/login', {
      email: cleanEmail,
      username: cleanEmail,
      password: password
    })
    await AsyncStorage.setItem('et_token', res.data.access_token)
    await AsyncStorage.setItem('et_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data
  }

  const register = async (name, email, password) => {
    const res = await API.post('/auth/register', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password
    })
    await AsyncStorage.setItem('et_token', res.data.access_token)
    await AsyncStorage.setItem('et_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data
  }

  const logout = async () => {
    await AsyncStorage.multiRemove(['et_token', 'et_user'])
    setUser(null)
  }

  const refreshUser = async () => {
    const res = await API.get('/auth/me')
    setUser(res.data)
    await AsyncStorage.setItem('et_user', JSON.stringify(res.data))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
