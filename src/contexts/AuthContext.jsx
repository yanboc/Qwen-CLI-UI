import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查本地存储的认证状态
    const token = localStorage.getItem('qwen_code_token')
    const userData = localStorage.getItem('qwen_code_user')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Failed to parse user data:', error)
        localStorage.removeItem('qwen_code_token')
        localStorage.removeItem('qwen_code_user')
      }
    }
    
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('qwen_code_token', data.token)
        localStorage.setItem('qwen_code_user', JSON.stringify(data.user))
        setUser(data.user)
        setIsAuthenticated(true)
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.message }
      }
    } catch (error) {
      return { success: false, error: '网络错误，请稍后重试' }
    }
  }

  const register = async (username, password) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('qwen_code_token', data.token)
        localStorage.setItem('qwen_code_user', JSON.stringify(data.user))
        setUser(data.user)
        setIsAuthenticated(true)
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.message }
      }
    } catch (error) {
      return { success: false, error: '网络错误，请稍后重试' }
    }
  }

  const logout = () => {
    localStorage.removeItem('qwen_code_token')
    localStorage.removeItem('qwen_code_user')
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 