# Qwen CLI UI

一个基于 Web 的 Qwen Code CLI 界面，让您可以从任何设备进行 AI 辅助编程。

![Qwen Code UI](https://img.shields.io/badge/Qwen-Code%20UI-blue?style=for-the-badge&logo=github)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)

## 🌟 项目特色

- **🌐 响应式 Web 界面** - 支持桌面、平板、手机等各种设备
- **🤖 AI 辅助编程** - 集成 Qwen Code CLI，提供智能代码建议

## 🔧 开发中
- **📁 项目管理** - 可视化文件浏览器，支持多种编程语言
- **💻 集成终端** - 在 Web 界面中执行命令
- **🔐 用户认证** - 安全的 JWT 认证系统
- **⚙️ 个性化设置** - 支持主题、字体、API 配置等

## 🚀 主要功能

### 1. AI 聊天界面
- 与 Qwen Code AI 进行实时编程对话
- 支持流式响应，实时显示 AI 回复
- 智能代码建议和重构建议

### 2. 文件浏览器
- 可视化项目文件树
- 在线代码编辑器
- 支持多种编程语言的语法高亮
- 实时文件保存

### 3. 终端集成
- 在 Web 界面中执行命令
- 实时命令输出显示
- 项目上下文执行

### 4. 设置管理
- Qwen API 配置
- 模型选择（支持多种 Qwen 模型）
- 界面主题设置
- 个性化偏好配置

## 📦 安装

### 前置要求
- Node.js 20 或更高版本
- npm 或 yarn
- Qwen Code CLI（会自动安装）

### 快速开始

1. **克隆仓库**
```bash
git clone https://github.com/yanboc/Qwen-CLI-UI.git
cd Qwen-CLI-UI
```

2. **安装依赖**
```bash
npm run install-all
```

3. **配置环境变量**
```bash
cp env.example .env
# 编辑 .env 文件，配置您的 API 密钥
# 也可以后续在网页中设置
```

4. **启动应用**
```bash
npm run dev
```

5. **访问应用**
打开浏览器访问：http://localhost:4009/

## ⚙️ 配置

### API 配置

在设置页面配置以下参数：

#### 中国大陆用户
- **API Key**: 从 [阿里云 Bailian](https://bailian.console.aliyun.com/) 或 [ModelScope](https://modelscope.cn/docs/model-service/API-Inference/intro) 获取
- **Base URL**: `https://dashscope.aliyun.com/compatible-mode/v1` 或 `https://api-inference.modelscope.cn/v1`
- **Model**: `qwen3-coder-plus` 或 `Qwen/Qwen3-Coder-480B-A35B-Instruct`

#### 海外用户
- **API Key**: 从 [阿里云 ModelStudio](https://modelstudio.console.alibabacloud.com/) 获取
- **Base URL**: `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`
- **Model**: `qwen3-coder-plus`

## 🎯 使用方法

### 1. 注册/登录
- 首次使用需要注册账户
- 使用用户名和密码登录

### 2. 配置 API
- 在设置页面配置您的 Qwen API 密钥
- 选择合适的基础 URL 和模型

### 3. 创建项目
- 点击侧边栏的"+"按钮创建新项目
- 或选择现有项目

### 4. 开始编程
- 在聊天界面与 AI 对话
- 使用文件浏览器管理代码
- 在终端中执行命令

## 📁 项目结构

```
qwen-code-ui/
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   ├── contexts/          # React 上下文
│   └── main.jsx           # 入口文件
├── server/                # 后端源码
│   ├── index.js           # 服务器入口
│   └── database/          # 数据库文件
├── projects/              # 用户项目目录
├── public/                # 静态资源
└── package.json           # 项目配置
```

## 🔧 开发

### 启动开发服务器
```bash
# 启动前端和后端
npm run dev

# 仅启动前端
npm run client

# 仅启动后端
npm run server
```

### 构建生产版本
```bash
npm run build
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目基于 [Apache-2.0](LICENSE) 许可证开源。

## 🙏 致谢

- [Qwen Code](https://github.com/QwenLM/qwen-code) - 基于 Google Gemini CLI 的优秀项目
- [Gemini CLI](https://github.com/google/gemini-cli) - 原始项目灵感来源
- [React](https://reactjs.org/) - 前端框架
- [Express](https://expressjs.com/) - 后端框架

## 📞 支持

如果您遇到问题或有建议，请：

1. 查看 [Issues](https://github.com/yanboc/Qwen-CLI-UI/issues)
2. 创建新的 Issue
3. 联系维护者

---

**⭐ 如果这个项目对您有帮助，请给我们一个 Star！** 
