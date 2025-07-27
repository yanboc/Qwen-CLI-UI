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
    const newSocket = io(`http://localhost:${backendPort}`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })

    newSocket.on('connect', () => {
      console.log('Connected to server')
      setConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      setConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      setConnected(false)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

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