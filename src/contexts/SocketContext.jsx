import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // 动态获取后端端口
    const getBackendPort = () => {
      // 从当前URL推断后端端口
      const currentPort = window.location.port
      if (currentPort === '4009' || currentPort === '4010') {
        return '4008' // 后端固定端口
      }
      return '4008' // 默认端口
    }

    const backendPort = getBackendPort()
    const token = localStorage.getItem('qwen_code_token')
    
    if (!token) {
      console.log('No auth token found, skipping socket connection')
      return
    }

    const newSocket = io(`http://localhost:${backendPort}`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      auth: {
        token: token
      }
    })

    newSocket.on('connect', () => {
      console.log('Connected to server with authentication')
      setConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      setConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error.message)
      setConnected(false)
      
      // 如果是认证错误，清除token并重新登录
      if (error.message === 'Authentication error') {
        localStorage.removeItem('qwen_code_token')
        window.location.reload()
      }
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  // 监听token变化，重新连接
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('qwen_code_token')
      if (token && !connected) {
        // Token存在但未连接，重新连接
        window.location.reload()
      } else if (!token && connected) {
        // Token被移除，断开连接
        socket?.close()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [connected, socket])

  const emit = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data)
    }
  }

  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback)
    }
  }

  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback)
    }
  }

  const value = {
    socket,
    connected,
    emit,
    on,
    off,
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
} 