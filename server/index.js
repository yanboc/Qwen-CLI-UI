const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sqlite3 = require('sqlite3').verbose()
const multer = require('multer')
// const pty = require('node-pty')
// const treeKill = require('tree-kill')

require('dotenv').config()

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:4009",
    methods: ["GET", "POST"]
  }
})

const PORT = process.env.PORT || 4008
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../dist')))

// 确保数据库目录存在
const dbDir = path.join(__dirname, 'database')
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// 数据库初始化
const db = new sqlite3.Database(path.join(dbDir, 'qwen_code_ui.db'))

db.serialize(() => {
  // 创建用户表
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    is_active BOOLEAN DEFAULT 1
  )`)

  // 创建设置表
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    api_key TEXT,
    base_url TEXT,
    model TEXT DEFAULT 'qwen3-coder-plus',
    theme TEXT DEFAULT 'light',
    font_size INTEGER DEFAULT 14,
    enable_auto_save BOOLEAN DEFAULT 1,
    enable_notifications BOOLEAN DEFAULT 1,
    max_history_length INTEGER DEFAULT 100,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`)

  // 创建项目表
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    path TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`)
})

// 认证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: '访问令牌缺失' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '无效的访问令牌' })
    }
    req.user = user
    next()
  })
}

// 认证路由
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' })
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    
    db.run(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: '用户名已存在' })
          }
          return res.status(500).json({ error: '注册失败' })
        }

        const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET)
        res.json({
          token,
          user: { id: this.lastID, username }
        })
      }
    )
  } catch (error) {
    res.status(500).json({ error: '注册失败' })
  }
})

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' })
  }

  db.get(
    'SELECT * FROM users WHERE username = ? AND is_active = 1',
    [username],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: '登录失败' })
      }

      if (!user) {
        return res.status(401).json({ error: '用户名或密码错误' })
      }

      try {
        const validPassword = await bcrypt.compare(password, user.password_hash)
        if (!validPassword) {
          return res.status(401).json({ error: '用户名或密码错误' })
        }

        // 更新最后登录时间
        db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id])

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET)
        res.json({
          token,
          user: { id: user.id, username: user.username }
        })
      } catch (error) {
        res.status(500).json({ error: '登录失败' })
      }
    }
  )
})

// 项目路由
app.get('/api/projects', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM projects WHERE user_id = ? ORDER BY last_accessed DESC',
    [req.user.id],
    (err, projects) => {
      if (err) {
        return res.status(500).json({ error: '获取项目列表失败' })
      }
      res.json({ projects })
    }
  )
})

app.post('/api/projects', authenticateToken, (req, res) => {
  const { name, path: projectPath } = req.body

  if (!name) {
    return res.status(400).json({ error: '项目名称不能为空' })
  }

  // 创建绝对路径
  const absolutePath = projectPath && projectPath.trim() ? 
    (projectPath.startsWith('/') ? projectPath : path.join(__dirname, '..', 'projects', name)) :
    path.join(__dirname, '..', 'projects', name)
  
  // 确保项目目录存在
  try {
    if (!fs.existsSync(absolutePath)) {
      fs.mkdirSync(absolutePath, { recursive: true })
    }
  } catch (error) {
    console.error('Error creating project directory:', error)
    return res.status(500).json({ error: '创建项目目录失败' })
  }

  db.run(
    'INSERT OR REPLACE INTO projects (user_id, name, path, last_accessed) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
    [req.user.id, name, absolutePath],
    function(err) {
      if (err) {
        return res.status(500).json({ error: '创建项目失败' })
      }
      res.json({ success: true, id: this.lastID })
    }
  )
})

app.post('/api/projects/select', authenticateToken, (req, res) => {
  const { path } = req.body

  if (!path) {
    return res.status(400).json({ error: '项目路径不能为空' })
  }

  db.get(
    'SELECT * FROM projects WHERE path = ? AND user_id = ?',
    [path, req.user.id],
    (err, project) => {
      if (err) {
        return res.status(500).json({ error: '选择项目失败' })
      }

      if (!project) {
        return res.status(404).json({ error: '项目不存在' })
      }

      // 更新最后访问时间
      db.run('UPDATE projects SET last_accessed = CURRENT_TIMESTAMP WHERE id = ?', [project.id])

      res.json({ project })
    }
  )
})

app.delete('/api/projects/:path', authenticateToken, (req, res) => {
  const projectPath = decodeURIComponent(req.params.path)

  db.run(
    'DELETE FROM projects WHERE path = ? AND user_id = ?',
    [projectPath, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: '删除项目失败' })
      }
      res.json({ success: true })
    }
  )
})

// 文件路由
app.get('/api/files', authenticateToken, (req, res) => {
  const projectPath = req.query.path

  if (!projectPath) {
    return res.status(400).json({ error: '项目路径不能为空' })
  }

  const getFileTree = (dirPath) => {
    try {
      const items = fs.readdirSync(dirPath)
      const tree = []

      for (const item of items) {
        const fullPath = path.join(dirPath, item)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
          tree.push({
            name: item,
            path: fullPath,
            type: 'directory',
            children: getFileTree(fullPath)
          })
        } else {
          tree.push({
            name: item,
            path: fullPath,
            type: 'file'
          })
        }
      }

      return tree
    } catch (error) {
      console.error('Error reading directory:', error)
      return []
    }
  }

  try {
    const files = getFileTree(projectPath)
    res.json({ files })
  } catch (error) {
    res.status(500).json({ error: '获取文件列表失败' })
  }
})

app.get('/api/files/content', authenticateToken, (req, res) => {
  const filePath = req.query.path

  if (!filePath) {
    return res.status(400).json({ error: '文件路径不能为空' })
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8')
    res.json({ content })
  } catch (error) {
    res.status(500).json({ error: '读取文件失败' })
  }
})

app.post('/api/files/save', authenticateToken, (req, res) => {
  const { path: filePath, content } = req.body

  if (!filePath || content === undefined) {
    return res.status(400).json({ error: '文件路径和内容不能为空' })
  }

  try {
    fs.writeFileSync(filePath, content, 'utf8')
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: '保存文件失败' })
  }
})

// 聊天路由
app.post('/api/chat', authenticateToken, (req, res) => {
  const { message, projectPath } = req.body

  if (!message || !projectPath) {
    return res.status(400).json({ error: '消息和项目路径不能为空' })
  }

  // 立即返回成功响应，然后通过 WebSocket 发送流式数据
  res.json({ success: true })
  
  // 调用 Qwen Code CLI
  const { spawn } = require('child_process')
  
  // 设置环境变量
  const env = { ...process.env }
  
  // 从数据库获取用户设置
  db.get(
    'SELECT * FROM settings WHERE user_id = ?',
    [req.user.id],
    (err, settings) => {
      if (err || !settings) {
        io.emit('chat_error', { error: '无法获取用户设置，请先在设置中配置 API 密钥' })
        return
      }

      // 设置 Qwen Code 环境变量
      if (settings.api_key) env.OPENAI_API_KEY = settings.api_key
      if (settings.base_url) env.OPENAI_BASE_URL = settings.base_url
      if (settings.model) env.OPENAI_MODEL = settings.model

      // 启动 Qwen Code CLI
      const absoluteProjectPath = path.resolve(projectPath)
      console.log('Starting Qwen Code CLI with:', {
        command: '/usr/bin/qwen',
        args: ['--prompt', message],
        cwd: absoluteProjectPath,
        env: {
          OPENAI_API_KEY: settings.api_key ? '***' : 'not set',
          OPENAI_BASE_URL: settings.base_url || 'not set',
          OPENAI_MODEL: settings.model || 'not set'
        }
      })
      
      const qwenProcess = spawn('/usr/bin/qwen', ['--prompt', message, '--yolo'], {
        cwd: absoluteProjectPath,
        env: env,
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let output = ''
      let errorOutput = ''

      io.emit('chat_start')

      qwenProcess.stdout.on('data', (data) => {
        const chunk = data.toString()
        output += chunk
        io.emit('chat_message', {
          type: 'assistant',
          content: chunk,
          timestamp: new Date()
        })
      })

      qwenProcess.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })

      qwenProcess.on('close', (code) => {
        if (code !== 0) {
          io.emit('chat_error', { 
            error: `Qwen Code CLI 执行失败 (退出码: ${code}): ${errorOutput}` 
          })
        } else {
          io.emit('chat_end')
        }
      })

      qwenProcess.on('error', (error) => {
        io.emit('chat_error', { 
          error: `启动 Qwen Code CLI 失败: ${error.message}` 
        })
      })
    }
  )
})

// 终端路由
app.post('/api/terminal/execute', authenticateToken, (req, res) => {
  const { command, projectPath } = req.body

  if (!command || !projectPath) {
    return res.status(400).json({ error: '命令和项目路径不能为空' })
  }

  // 这里应该执行命令
  // 暂时返回模拟响应
  res.json({ output: `执行命令: ${command}\n这是模拟的输出结果。` })
})

app.post('/api/terminal/stop', authenticateToken, (req, res) => {
  // 停止当前执行的命令
  res.json({ success: true })
})

// 设置路由
app.get('/api/settings', authenticateToken, (req, res) => {
  db.get(
    'SELECT * FROM settings WHERE user_id = ?',
    [req.user.id],
    (err, settings) => {
      if (err) {
        return res.status(500).json({ error: '获取设置失败' })
      }

      if (!settings) {
        // 创建默认设置
        const defaultSettings = {
          apiKey: '',
          baseUrl: '',
          model: 'qwen3-coder-plus',
          theme: 'light',
          fontSize: 14,
          enableAutoSave: true,
          enableNotifications: true,
          maxHistoryLength: 100
        }
        return res.json({ settings: defaultSettings })
      }

      res.json({
        settings: {
          apiKey: settings.api_key || '',
          baseUrl: settings.base_url || '',
          model: settings.model || 'qwen3-coder-plus',
          theme: settings.theme || 'light',
          fontSize: settings.font_size || 14,
          enableAutoSave: settings.enable_auto_save === 1,
          enableNotifications: settings.enable_notifications === 1,
          maxHistoryLength: settings.max_history_length || 100
        }
      })
    }
  )
})

app.post('/api/settings', authenticateToken, (req, res) => {
  const settings = req.body

  db.run(
    `INSERT OR REPLACE INTO settings (
      user_id, api_key, base_url, model, theme, font_size, 
      enable_auto_save, enable_notifications, max_history_length, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      req.user.id,
      settings.apiKey,
      settings.baseUrl,
      settings.model,
      settings.theme,
      settings.fontSize,
      settings.enableAutoSave ? 1 : 0,
      settings.enableNotifications ? 1 : 0,
      settings.maxHistoryLength
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: '保存设置失败' })
      }
      res.json({ success: true })
    }
  )
})

// WebSocket 连接处理
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// 启动服务器
server.listen(PORT, () => {
  console.log(`Qwen Code UI Server running on port ${PORT}`)
}) 