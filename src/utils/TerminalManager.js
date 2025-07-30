import VirtualTerminal from './VirtualTerminal'

class TerminalManager {
  constructor(socket) {
    this.socket = socket
    this.virtualTerminals = new Map() // sessionId -> VirtualTerminal
    this.activeSessionId = null
    this.terminalElement = null
    
    this.setupSocketListeners()
    console.log('TerminalManager initialized')
  }

  setupSocketListeners() {
    if (!this.socket) return

    // 清理旧的监听器（防止重复绑定）
    this.socket.off('terminal:data')
    this.socket.off('terminal:connected')
    this.socket.off('terminal:error')
    this.socket.off('terminal:session_closed')

    // 处理终端数据
    this.socket.on('terminal:data', ({ sessionId, data }) => {
      const vterm = this.virtualTerminals.get(sessionId)
      if (vterm) {
        vterm.write(data)
      } else {
        console.warn(`Received data for unknown session: ${sessionId}`)
      }
    })

    // 处理连接成功
    this.socket.on('terminal:connected', ({ sessionId }) => {
      const vterm = this.virtualTerminals.get(sessionId)
      if (vterm) {
        vterm.setConnected(true)
        console.log(`Virtual terminal ${sessionId} connected`)
      }
    })

    // 处理连接错误
    this.socket.on('terminal:error', ({ error }) => {
      console.error('Terminal error:', error)
      // 可以在这里添加错误处理逻辑，比如显示错误消息
    })

    // 处理会话关闭
    this.socket.on('terminal:session_closed', ({ sessionId }) => {
      const vterm = this.virtualTerminals.get(sessionId)
      if (vterm) {
        vterm.setConnected(false)
        console.log(`Virtual terminal ${sessionId} session closed`)
      }
    })

    console.log('Socket listeners setup complete')
  }

  // 设置终端容器元素
  setTerminalElement(element) {
    this.terminalElement = element
    console.log('Terminal element set')
  }

  // 创建虚拟终端
  createVirtualTerminal(sessionId) {
    if (this.virtualTerminals.has(sessionId)) {
      console.log(`Virtual terminal ${sessionId} already exists`)
      return this.virtualTerminals.get(sessionId)
    }

    console.log(`Creating virtual terminal for session: ${sessionId}`)
    const vterm = new VirtualTerminal(sessionId, this.socket)
    this.virtualTerminals.set(sessionId, vterm)
    return vterm
  }

  // 切换到指定会话
  switchToSession(sessionId) {
    if (this.activeSessionId === sessionId) {
      console.log(`Already active session: ${sessionId}`)
      return
    }

    console.log(`Switching from ${this.activeSessionId} to ${sessionId}`)

    // 停用当前活跃会话
    if (this.activeSessionId) {
      const currentVterm = this.virtualTerminals.get(this.activeSessionId)
      if (currentVterm) {
        currentVterm.deactivate()
      }
    }

    // 激活目标会话
    const targetVterm = this.virtualTerminals.get(sessionId)
    if (targetVterm && this.terminalElement) {
      targetVterm.activate(this.terminalElement)
      this.activeSessionId = sessionId
      
      // 调整终端大小
      setTimeout(() => {
        targetVterm.fit()
      }, 100)
      
      console.log(`Successfully switched to session: ${sessionId}`)
    } else {
      console.error(`Cannot switch to session ${sessionId}: virtual terminal or element not found`)
    }
  }

  // 销毁虚拟终端
  destroyVirtualTerminal(sessionId) {
    const vterm = this.virtualTerminals.get(sessionId)
    if (vterm) {
      console.log(`Destroying virtual terminal: ${sessionId}`)
      vterm.destroy()
      this.virtualTerminals.delete(sessionId)
      
      // 如果销毁的是当前活跃会话，清空活跃状态
      if (this.activeSessionId === sessionId) {
        this.activeSessionId = null
        console.log('Active session cleared')
      }
    } else {
      console.warn(`Virtual terminal ${sessionId} not found for destruction`)
    }
  }

  // 获取虚拟终端
  getVirtualTerminal(sessionId) {
    return this.virtualTerminals.get(sessionId)
  }

  // 获取所有虚拟终端
  getAllVirtualTerminals() {
    return Array.from(this.virtualTerminals.values())
  }

  // 获取所有虚拟终端的状态
  getAllTerminalStatus() {
    const status = {}
    for (const [sessionId, vterm] of this.virtualTerminals.entries()) {
      status[sessionId] = vterm.getStatus()
    }
    return status
  }

  // 调整当前活跃终端大小
  fitActiveTerminal() {
    if (this.activeSessionId) {
      const vterm = this.virtualTerminals.get(this.activeSessionId)
      if (vterm) {
        vterm.fit()
      }
    }
  }

  // 获取当前活跃的会话ID
  getActiveSessionId() {
    return this.activeSessionId
  }

  // 检查会话是否存在
  hasSession(sessionId) {
    return this.virtualTerminals.has(sessionId)
  }

  // 获取会话数量
  getSessionCount() {
    return this.virtualTerminals.size
  }

  // 清除所有虚拟终端的缓冲区
  clearAllBuffers() {
    for (const vterm of this.virtualTerminals.values()) {
      vterm.clear()
    }
    console.log('All terminal buffers cleared')
  }

  // 重新连接所有会话
  reconnectAllSessions() {
    console.log('Reconnecting all sessions...')
    for (const [sessionId, vterm] of this.virtualTerminals.entries()) {
      if (vterm.connected) {
        this.socket.emit('terminal:connect', { sessionId })
      }
    }
  }

  // 清理所有资源
  destroy() {
    console.log('Destroying TerminalManager...')
    
    // 销毁所有虚拟终端
    for (const vterm of this.virtualTerminals.values()) {
      vterm.destroy()
    }
    
    this.virtualTerminals.clear()
    this.activeSessionId = null
    this.terminalElement = null
    
    // 清理 socket 监听器
    if (this.socket) {
      this.socket.off('terminal:data')
      this.socket.off('terminal:connected')
      this.socket.off('terminal:error')
      this.socket.off('terminal:session_closed')
    }
    
    console.log('TerminalManager destroyed')
  }
}

export default TerminalManager 