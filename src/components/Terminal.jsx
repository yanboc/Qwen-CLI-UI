import React, { useState, useEffect, useRef } from 'react'
import { useProject } from '../contexts/ProjectContext'
import { useSocket } from '../contexts/SocketContext'
import { RefreshCw, X, Plus, ChevronDown, Edit2, Check } from 'lucide-react'
import TerminalManager from '../utils/TerminalManager'
import 'xterm/css/xterm.css'

const Terminal = () => {
  const { currentProject } = useProject()
  const { socket, connected } = useSocket()
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // 终端管理器和相关 refs
  const terminalManagerRef = useRef(null)
  const terminalRef = useRef(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [newTerminalName, setNewTerminalName] = useState('')
  const [editingSessionId, setEditingSessionId] = useState('')
  const [editingName, setEditingName] = useState('')
  const dropdownRef = useRef(null)
  const [isTerminalManagerReady, setIsTerminalManagerReady] = useState(false)

  // 初始化终端管理器
  useEffect(() => {
    if (socket && connected && !terminalManagerRef.current) {
      console.log('Initializing TerminalManager...')
      terminalManagerRef.current = new TerminalManager(socket)
      setIsTerminalManagerReady(true)
    }

    return () => {
      if (terminalManagerRef.current) {
        terminalManagerRef.current.destroy()
        terminalManagerRef.current = null
        setIsTerminalManagerReady(false)
      }
    }
  }, [socket, connected])

  // 设置终端元素 - 临时版本
  useEffect(() => {
    if (isTerminalManagerReady && terminalManagerRef.current) {
      // 使用一个检查函数来确保DOM元素准备好
      const checkAndSetElement = () => {
        if (terminalRef.current) {
          console.log('Setting terminal element...')
          terminalManagerRef.current.setTerminalElement(terminalRef.current)
        } else {
          // DOM还没准备好，稍后再试
          console.log('Terminal element not ready, retrying...')
          setTimeout(checkAndSetElement, 50)
        }
      }
      
      checkAndSetElement()
    }
  }, [isTerminalManagerReady])

  // 加载会话列表
  useEffect(() => {
    if (currentProject && connected) {
      loadSessions()
    }
  }, [currentProject, connected])

  // 监听连接状态变化
  useEffect(() => {
    if (connected && sessions.length === 0) {
      loadSessions()
    }
  }, [connected])

  // 窗口大小变化时调整终端
  useEffect(() => {
    const handleResize = () => {
      if (terminalManagerRef.current) {
        setTimeout(() => {
          terminalManagerRef.current.fitActiveTerminal()
        }, 100)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
        // 取消编辑状态
        if (editingSessionId) {
          cancelEditing()
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [editingSessionId])

  // 加载会话列表
  const loadSessions = async () => {
    if (!connected) return
    
    try {
      const token = localStorage.getItem('qwen_code_token')
      const response = await fetch('/api/terminal/sessions', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
        
        // 为每个会话创建虚拟终端
        if (terminalManagerRef.current) {
          data.sessions.forEach(session => {
            terminalManagerRef.current.createVirtualTerminal(session.sessionId)
          })
        }
        
        // 处理活跃会话
        if (!activeSessionId && data.sessions.length > 0) {
          switchToSession(data.sessions[0].sessionId)
        } else if (activeSessionId && data.sessions.length > 0) {
          const activeExists = data.sessions.find(s => s.sessionId === activeSessionId)
          if (!activeExists) {
            switchToSession(data.sessions[0].sessionId)
          }
        } else if (data.sessions.length === 0) {
          setActiveSessionId('')
        }
      } else {
        console.error('Failed to load sessions:', response.status)
      }
    } catch (error) {
      console.error('Error loading sessions:', error)
    }
  }

  // 创建新终端
  const createTerminal = async (terminalName = '') => {
    if (!currentProject || !connected) return

    setIsLoading(true)
    try {
      const token = localStorage.getItem('qwen_code_token')
      const response = await fetch('/api/terminal/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          projectPath: currentProject.path,
          terminalName: terminalName
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // 创建虚拟终端
        if (terminalManagerRef.current) {
          terminalManagerRef.current.createVirtualTerminal(data.sessionId)
        }
        
        // 切换到新创建的终端
        switchToSession(data.sessionId)
        
        // 刷新会话列表
        setTimeout(() => loadSessions(), 200)
        
        setShowDropdown(false)
        setNewTerminalName('')
        console.log('Terminal created:', data.message)
      } else {
        const errorData = await response.json()
        console.error('Failed to create terminal:', errorData.error)
      }
    } catch (error) {
      console.error('Error creating terminal:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 切换会话
  const switchToSession = (sessionId) => {
    if (terminalManagerRef.current) {
      terminalManagerRef.current.switchToSession(sessionId)
      setActiveSessionId(sessionId)
      setShowDropdown(false)
      console.log(`UI switched to session: ${sessionId}`)
    }
  }

  // 重命名会话
  const renameSession = async (sessionId, newName) => {
    if (!connected) return
    
    try {
      const token = localStorage.getItem('qwen_code_token')
      const response = await fetch('/api/terminal/rename', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: sessionId,
          newName: newName
        }),
      })

      if (response.ok) {
        await loadSessions()
        setEditingSessionId('')
        setEditingName('')
      } else {
        console.error('Failed to rename session')
      }
    } catch (error) {
      console.error('Error renaming session:', error)
    }
  }

  // 销毁会话
  const destroySession = async (sessionId) => {
    if (!connected) return
    
    try {
      const token = localStorage.getItem('qwen_code_token')
      const response = await fetch('/api/terminal/destroy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      })

      if (response.ok) {
        // 销毁虚拟终端
        if (terminalManagerRef.current) {
          terminalManagerRef.current.destroyVirtualTerminal(sessionId)
        }
        
        // 处理活跃会话切换
        if (sessionId === activeSessionId) {
          const remainingSessions = sessions.filter(s => s.sessionId !== sessionId)
          if (remainingSessions.length > 0) {
            switchToSession(remainingSessions[0].sessionId)
          } else {
            setActiveSessionId('')
          }
        }
        
        await loadSessions()
      } else {
        console.error('Failed to destroy session')
      }
    } catch (error) {
      console.error('Error destroying session:', error)
    }
  }

  // 刷新会话
  const refreshSessions = async () => {
    setIsLoading(true)
    try {
      await loadSessions()
    } finally {
      setIsLoading(false)
    }
  }

  // 创建新终端
  const createNewTerminal = async () => {
    const terminalName = newTerminalName.trim() || `terminal(${sessions.length + 1})`
    await createTerminal(terminalName)
  }

  // 开始编辑
  const startEditing = (session) => {
    setEditingSessionId(session.sessionId)
    setEditingName(session.terminalName)
  }

  // 取消编辑
  const cancelEditing = () => {
    setEditingSessionId('')
    setEditingName('')
  }

  // 保存编辑
  const saveEditing = () => {
    if (editingName.trim()) {
      renameSession(editingSessionId, editingName.trim())
    } else {
      cancelEditing()
    }
  }

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">请先选择一个项目</h3>
          <p className="text-sm">选择项目后即可使用终端功能</p>
        </div>
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">连接中...</h3>
          <p className="text-sm">正在连接到服务器</p>
        </div>
      </div>
    )
  }

  const activeSession = sessions.find(s => s.sessionId === activeSessionId)

  return (
    <div className="flex flex-col h-full bg-black">
      {/* 终端头部 */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-white">终端</h2>
          <span className="text-sm text-gray-400">{currentProject.name}</span>
          
          {/* 终端选择下拉框 */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded border border-gray-600"
            >
              <span>{activeSession?.terminalName || '选择终端'}</span>
              <ChevronDown size={14} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showDropdown && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-gray-800 border border-gray-600 rounded shadow-lg z-50">
                {/* 新建终端输入框 */}
                <div className="p-3 border-b border-gray-600">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTerminalName}
                      onChange={(e) => setNewTerminalName(e.target.value)}
                      placeholder={`terminal(${sessions.length + 1})`}
                      className="flex-1 px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-500 focus:outline-none focus:border-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          createNewTerminal()
                        }
                      }}
                    />
                    <button
                      onClick={createNewTerminal}
                      disabled={isLoading}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm rounded"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                
                {/* 现有终端列表 */}
                <div className="max-h-48 overflow-y-auto">
                  {sessions.map((session) => (
                    <div
                      key={session.sessionId}
                      className={`flex items-center justify-between px-3 py-2 hover:bg-gray-700 cursor-pointer ${
                        session.sessionId === activeSessionId ? 'bg-blue-600' : ''
                      }`}
                      onClick={() => switchToSession(session.sessionId)}
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        {editingSessionId === session.sessionId ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1 px-2 py-1 bg-gray-600 text-white text-sm rounded border border-gray-400 focus:outline-none focus:border-blue-500"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                saveEditing()
                              } else if (e.key === 'Escape') {
                                cancelEditing()
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                        ) : (
                          <span className="text-white text-sm">{session.terminalName}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {editingSessionId === session.sessionId ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                saveEditing()
                              }}
                              className="p-1 hover:text-green-400 text-gray-400"
                            >
                              <Check size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                cancelEditing()
                              }}
                              className="p-1 hover:text-red-400 text-gray-400"
                            >
                              <X size={12} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                startEditing(session)
                              }}
                              className="p-1 hover:text-blue-400 text-gray-400"
                              title="重命名"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                destroySession(session.sessionId)
                              }}
                              className="p-1 hover:text-red-400 text-gray-400"
                              title="关闭"
                            >
                              <X size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {sessions.length === 0 && (
                    <div className="px-3 py-2 text-gray-400 text-sm">
                      暂无终端会话
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshSessions}
            disabled={isLoading}
            className="p-2 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white"
            title="刷新"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 终端内容 - 单一容器 */}
      <div className="flex-1 relative bg-black">
        {/* 终端容器始终存在 */}
        <div 
          ref={terminalRef} 
          className="w-full h-full"
          style={{ minHeight: '200px' }}
        />
        
        {/* 无会话时的提示覆盖层 */}
        {sessions.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <p>暂无终端会话</p>
              <button
                onClick={() => createTerminal()}
                disabled={isLoading}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-600"
              >
                {isLoading ? '创建中...' : '创建终端'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 简化的状态栏 */}
      <div className="bg-gray-900 border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            会话: {sessions.length} | 
            连接: {connected ? '已连接' : '未连接'} | 
            项目: {currentProject.name}
          </span>
          {activeSession && (
            <span>
              当前: {activeSession.terminalName}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default Terminal 