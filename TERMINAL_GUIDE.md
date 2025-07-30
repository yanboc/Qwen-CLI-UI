# 单端口多终端使用指南 (node-pty + WebSocket)

## 🚀 功能概述

本项目现已采用 **node-pty + WebSocket + xterm.js** 架构，实现真正的单端口多终端会话支持，提供原生终端体验。

## ✨ 主要特性

### ✅ 真正的多会话隔离
- 每个终端都是独立的 pty 进程
- 真正的工作目录隔离，无需手动切换
- 独立的环境变量和进程状态
- 会话间完全独立，互不干扰

### ✅ 单端口 WebSocket 架构
- 所有终端通信通过单一 WebSocket 端口
- 不需要动态端口分配和管理
- 统一的连接和认证机制
- 高效的数据传输

### ✅ 原生终端体验
- 使用 xterm.js 提供完整终端功能
- 支持颜色、光标、特殊字符
- 支持复制粘贴、选择文本
- 支持终端大小调整

### ✅ 智能会话管理
- 下拉选择器快速切换终端
- 支持终端重命名（双击或编辑按钮）
- 自动命名：terminal(1), terminal(2)...
- 会话状态实时同步

## 🎯 使用方法

### 1. 创建终端
1. 选择一个项目
2. 点击"终端"标签
3. 点击下拉选择器
4. 在输入框中输入终端名称（可选）
5. 点击绿色 `+` 按钮创建

### 2. 管理终端
- **切换终端**: 点击下拉选择器中的终端名称
- **重命名终端**: 点击终端名称旁的编辑图标
- **关闭终端**: 点击终端名称旁的 `×` 按钮
- **刷新状态**: 点击蓝色刷新按钮

### 3. 终端操作
- **输入命令**: 直接在终端中输入
- **复制文本**: 选择文本后右键复制或 Ctrl+C
- **粘贴文本**: 右键粘贴或 Ctrl+V
- **清屏**: 输入 `clear` 或 Ctrl+L

## 🏗️ 技术架构

### 服务器端 (Node.js + node-pty)
```javascript
// 终端管理器
const terminalManager = {
  createSession(userId, projectPath, terminalName) {
    // 创建独立的 pty 进程
    const ptyProcess = pty.spawn(shell, [], {
      cwd: absoluteProjectPath, // 自动设置工作目录
      env: { ...process.env, TERM: 'xterm-256color' }
    })
    
    // 存储会话信息
    terminalSessions.set(sessionId, {
      sessionId, userId, projectPath, terminalName,
      ptyProcess, connections: new Set()
    })
  }
}
```

### WebSocket 通信
```javascript
// 连接到终端会话
socket.emit('terminal:connect', { sessionId })

// 发送用户输入
socket.emit('terminal:input', { sessionId, data })

// 接收终端输出
socket.on('terminal:data', ({ sessionId, data }) => {
  xterm.write(data)
})

// 调整终端大小
socket.emit('terminal:resize', { sessionId, cols, rows })
```

### 前端组件 (React + xterm.js)
```jsx
// 创建 xterm 实例
const xterm = new XTerm({
  cursorBlink: true,
  fontSize: 14,
  fontFamily: 'Monaco, Menlo, "Courier New", monospace'
})

// 加载插件
const fitAddon = new FitAddon()
xterm.loadAddon(fitAddon)

// 挂载到 DOM
xterm.open(terminalRef.current)
fitAddon.fit()
```

## 📊 架构优势

| 特性 | ttyd 方案 | node-pty 方案 |
|------|-----------|---------------|
| 会话隔离 | ❌ 共享连接 | ✅ 独立进程 |
| 工作目录 | ❌ 需手动切换 | ✅ 自动设置 |
| 端口管理 | 🔶 单端口但无真实隔离 | ✅ 单端口真实隔离 |
| 终端功能 | ✅ 完整 | ✅ 完整 |
| 性能 | 🔶 iframe 开销 | ✅ 直接通信 |
| 可控性 | ❌ 依赖外部工具 | ✅ 完全控制 |

## 🔧 API 接口

### 创建终端
```http
POST /api/terminal/create
{
  "projectPath": "/path/to/project",
  "terminalName": "my-terminal"
}
```

### 重命名终端
```http
POST /api/terminal/rename
{
  "sessionId": "session-id",
  "newName": "new-name"
}
```

### 关闭终端
```http
POST /api/terminal/destroy
{
  "sessionId": "session-id"
}
```

### 获取会话列表
```http
GET /api/terminal/sessions
```

## 📋 依赖要求

### 服务器端
```json
{
  "node-pty": "^0.10.1",
  "socket.io": "^4.7.2"
}
```

### 前端
```json
{
  "xterm": "^5.3.0",
  "xterm-addon-fit": "^0.8.0"
}
```

## 🎨 界面特性

### 下拉选择器
- 显示当前活跃终端名称
- 下拉展示所有终端会话
- 新建终端输入框
- 每个会话显示编辑和关闭按钮

### 状态栏
- 会话数量统计
- WebSocket 连接状态
- 当前项目名称
- 当前活跃终端名称

### 终端显示
- 黑色背景，白色文字
- 支持光标闪烁
- 自动调整大小
- 隐藏非活跃终端

## ⚡ 性能优化

1. **按需渲染**: 只渲染活跃的终端组件
2. **连接复用**: WebSocket 连接在所有终端间共享
3. **内存管理**: 终端关闭时自动清理资源
4. **大小调整**: 响应式终端大小调整

## 🔒 安全特性

1. **JWT 认证**: WebSocket 连接需要有效 token
2. **用户隔离**: 用户只能访问自己的终端会话
3. **路径验证**: 创建终端时验证项目路径权限
4. **会话验证**: 所有操作都验证会话所有权

## 🚨 注意事项

1. **会话持久化**: 会话信息存储在内存中，服务重启后会丢失
2. **进程管理**: 终端进程在会话关闭时自动清理
3. **网络连接**: 需要稳定的 WebSocket 连接
4. **浏览器兼容**: 需要支持 WebSocket 和现代 JavaScript 的浏览器

## 🔧 故障排除

### 终端无法创建
1. 检查项目路径是否存在
2. 检查用户权限
3. 查看服务器日志

### 终端无法连接
1. 检查 WebSocket 连接状态
2. 验证 JWT token 是否有效
3. 检查网络连接

### 终端显示异常
1. 刷新页面重新连接
2. 检查浏览器控制台错误
3. 确认 xterm.js 资源加载正常

## 🎉 更新日志

- **v2.0**: 完全重构为 node-pty + WebSocket 架构
- **v2.1**: 添加真正的多会话隔离支持
- **v2.2**: 优化用户界面和交互体验
- **v2.3**: 增强安全性和错误处理 