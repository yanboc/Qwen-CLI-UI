import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'

class VirtualTerminal {
  constructor(sessionId, socket) {
    this.sessionId = sessionId
    this.socket = socket
    this.buffer = '' // 完整的终端输出缓冲区
    this.isActive = false
    this.xterm = null
    this.fitAddon = null
    this.connected = false
    
    // 终端状态
    this.cols = 80
    this.rows = 24
    
    // 事件处理器引用（用于清理）
    this.inputDisposable = null
    this.resizeDisposable = null
    
    console.log(`VirtualTerminal created for session: ${sessionId}`)
  }

  // 写入数据到虚拟终端
  write(data) {
    this.buffer += data
    
    // 如果是活跃终端，同时写入到真实终端
    if (this.isActive && this.xterm) {
      this.xterm.write(data)
    }
  }

  // 激活虚拟终端（连接到真实的 xterm 实例）
  activate(terminalElement) {
    if (this.isActive) return this.xterm

    console.log(`Activating virtual terminal: ${this.sessionId}`)

    // 清理旧的实例
    this.deactivate()

    // 创建新的 xterm 实例
    this.xterm = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Monaco, Menlo, "Courier New", monospace',
      theme: {
        background: '#000000',
        foreground: '#ffffff',
        cursor: '#ffffff',
        selection: '#ffffff40'
      },
      allowTransparency: true,
      cols: this.cols,
      rows: this.rows,
      disableStdin: false
    })

    this.fitAddon = new FitAddon()
    this.xterm.loadAddon(this.fitAddon)
    
    // 挂载到 DOM
    this.xterm.open(terminalElement)
    this.fitAddon.fit()

    // 恢复完整的缓冲区内容
    if (this.buffer) {
      this.xterm.write(this.buffer)
    }

    // 绑定事件处理器
    this.bindEvents()
    
    this.isActive = true

    // 连接到服务器会话
    if (!this.connected && this.socket) {
      console.log(`Connecting to server session: ${this.sessionId}`)
      this.socket.emit('terminal:connect', { sessionId: this.sessionId })
    }

    return this.xterm
  }

  // 停用虚拟终端
  deactivate() {
    if (!this.isActive) return

    console.log(`Deactivating virtual terminal: ${this.sessionId}`)

    this.isActive = false

    // 清理事件处理器
    if (this.inputDisposable) {
      this.inputDisposable.dispose()
      this.inputDisposable = null
    }
    if (this.resizeDisposable) {
      this.resizeDisposable.dispose()
      this.resizeDisposable = null
    }

    // 保存终端状态
    if (this.xterm) {
      this.cols = this.xterm.cols
      this.rows = this.xterm.rows
      
      // 销毁 xterm 实例
      this.xterm.dispose()
      this.xterm = null
      this.fitAddon = null
    }
  }

  // 绑定事件处理器
  bindEvents() {
    if (!this.xterm || !this.socket) return

    // 处理用户输入
    this.inputDisposable = this.xterm.onData((data) => {
      if (this.socket && this.socket.connected) {
        this.socket.emit('terminal:input', { sessionId: this.sessionId, data })
      }
    })

    // 处理终端大小调整
    this.resizeDisposable = this.xterm.onResize(({ cols, rows }) => {
      this.cols = cols
      this.rows = rows
      if (this.socket && this.socket.connected) {
        this.socket.emit('terminal:resize', { sessionId: this.sessionId, cols, rows })
      }
    })
  }

  // 调整终端大小
  fit() {
    if (this.isActive && this.fitAddon) {
      try {
        this.fitAddon.fit()
      } catch (error) {
        console.error('Error fitting terminal:', error)
      }
    }
  }

  // 标记为已连接
  setConnected(connected) {
    this.connected = connected
    if (connected && this.isActive && this.buffer === '') {
      // 如果刚连接且没有缓冲区内容，发送初始命令
      setTimeout(() => {
        if (this.socket && this.socket.connected) {
          this.socket.emit('terminal:input', { sessionId: this.sessionId, data: '\r' })
        }
      }, 100)
    }
  }

  // 清除缓冲区
  clear() {
    this.buffer = ''
    if (this.isActive && this.xterm) {
      this.xterm.clear()
    }
  }

  // 获取终端状态信息
  getStatus() {
    return {
      sessionId: this.sessionId,
      isActive: this.isActive,
      connected: this.connected,
      bufferLength: this.buffer.length,
      cols: this.cols,
      rows: this.rows
    }
  }

  // 清理资源
  destroy() {
    console.log(`Destroying virtual terminal: ${this.sessionId}`)
    
    this.deactivate()
    
    if (this.socket) {
      this.socket.emit('terminal:disconnect', { sessionId: this.sessionId })
    }
    
    this.buffer = ''
    this.socket = null
  }
}

export default VirtualTerminal 