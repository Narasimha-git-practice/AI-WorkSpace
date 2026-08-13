import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '@/lib/axios'
import toast from 'react-hot-toast'

interface User {
  _id: string
  name: string
  email: string
  avatar: string | null
  role: 'user' | 'admin'
  theme: string
  language: string
  bio?: string
  website?: string
  company?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('aiw_token')
    const storedUser = localStorage.getItem('aiw_user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      if (data.success) {
        setToken(data.data.token)
        setUser(data.data.user)
        localStorage.setItem('aiw_token', data.data.token)
        localStorage.setItem('aiw_user', JSON.stringify(data.data.user))
        toast.success(`Welcome back, ${data.data.user.name}! 👋`)
        return true
      }
      return false
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      if (data.success) {
        setToken(data.data.token)
        setUser(data.data.user)
        localStorage.setItem('aiw_token', data.data.token)
        localStorage.setItem('aiw_user', JSON.stringify(data.data.user))
        toast.success('Account created successfully! 🎉')
        return true
      }
      return false
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('aiw_token')
    localStorage.removeItem('aiw_user')
    toast.success('Logged out successfully')
  }

  const updateUser = (userData: Partial<User>) => {
    const updated = { ...user, ...userData } as User
    setUser(updated)
    localStorage.setItem('aiw_user', JSON.stringify(updated))
  }

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me')
      if (data.success) {
        setUser(data.data)
        localStorage.setItem('aiw_user', JSON.stringify(data.data))
      }
    } catch {}
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, isAuthenticated: !!user, login, register, logout, updateUser, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
