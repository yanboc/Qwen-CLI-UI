import React, { useState, useRef, useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext'
import { useProject } from '../contexts/ProjectContext'
import { Send, Bot, User, Loader2 } from 'lucide-react'

const Chat = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const { socket, connected, on, off } = useSocket()
  const { currentProject } = useProject()

  useEffect(() => {
    if (socket) {
      on('chat_message', handleChatMessage)
      on('chat_error', handleChatError)
      on('chat_start', handleChatStart)
      on('chat_end', handleChatEnd)
      
      return () => {
        off('chat_message', handleChatMessage)
        off('chat_error', handleChatError)
        off('chat_start', handleChatStart)
        off('chat_end', handleChatEnd)
      }
    }
  }, [socket])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleChatMessage = (data) => {
    setMessages(prev => {
      const newMessages = [...prev]
      const lastMessage = newMessages[newMessages.length - 1]
      
      if (lastMessage && lastMessage.type === 'assistant' && lastMessage.isStreaming) {
        lastMessage.content += data.content
        return newMessages
      } else {
        return [...prev, { ...data, isStreaming: true }]
      }
    })
  }

  const handleChatError = (data) => {
    setMessages(prev => [...prev, { type: 'error', content: data.error, timestamp: new Date() }])
    setIsLoading(false)
  }

  const handleChatStart = () => {
    setIsLoading(true)
  }

  const handleChatEnd = () => {
    setIsLoading(false)
    setMessages(prev => {
      const newMessages = [...prev]
      const lastMessage = newMessages[newMessages.length - 1]
      if (lastMessage && lastMessage.isStreaming) {
        lastMessage.isStreaming = false
      }
      return newMessages
    })
  }

  const sendMessage = async () => {
    if (!input.trim() || !connected || !currentProject) return

    const userMessage = {
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')

    try {
      const token = localStorage.getItem('qwen_code_token')
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: input,
          projectPath: currentProject.path
        }),
      })

      if (!response.ok) {
        throw new Error('发送消息失败')
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: '发送消息失败，请稍后重试', 
        timestamp: new Date() 
      }])
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* 聊天头部 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            与 Qwen Code 聊天
          </h2>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {connected ? '已连接' : '未连接'}
            </span>
          </div>
        </div>
        {currentProject && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            当前项目: {currentProject.name}
          </p>
        )}
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <Bot size={48} className="mx-auto mb-4 opacity-50" />
            <p>开始与 Qwen Code 对话吧！</p>
            <p className="text-sm mt-2">您可以询问代码问题、请求重构或获取编程建议</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-lg px-4 py-2 ${
                  message.type === 'user'
                    ? 'bg-qwen-600 text-white'
                    : message.type === 'error'
                    ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'user' ? (
                    <User size={16} className="flex-shrink-0 mt-1" />
                  ) : (
                    <Bot size={16} className="flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Qwen Code 正在思考...
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入您的问题或指令..."
            className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-qwen-500 focus:border-transparent"
            rows={1}
            disabled={!connected || !currentProject}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !connected || !currentProject || isLoading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
        
        {!currentProject && (
          <p className="text-sm text-red-500 mt-2">
            请先选择一个项目才能开始聊天
          </p>
        )}
      </div>
    </div>
  )
}

export default Chat 