# Qwen CLI UI

一个基于 Qwen Code 的可视化界面，让您可以随时随地享受 AI 辅助编程的乐趣😊

![Qwen Code UI](https://img.shields.io/badge/Qwen-Code%20UI-blue?style=for-the-badge&logo=github)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)

## 🌟 项目特色

- **🌐 响应式 Web 界面** - 支持桌面、平板、手机等各种设备：*能用浏览器就行* 😂
- **🤖 AI 辅助编程** - 集成 Qwen Code CLI，提供智能代码建议：*您只管说，AI 帮您写* 😎

## 🔧 开发中
- **🌐 远程访问** - 支持远程访问，这样您才可以真正做到随时随地（让 AI 帮您）编程。
- **📁 项目管理** - 可视化文件浏览器，实时监控 AI 的劳动成果
- **💻 集成终端** - 在浏览器中控制您的服务器，就像在本地一样
- **🔐 用户认证** - 安全的 JWT 认证系统，支持多用户登录
- **⚙️ 个性化设置** - 支持主题、字体、API 配置等

## 📦 快速开始

1. **前置要求**
- Node.js 20 或更高版本
- npm 或 yarn

2. **克隆仓库**
```bash
git clone https://github.com/yanboc/Qwen-CLI-UI.git
cd Qwen-CLI-UI
```

3. **安装依赖**
```bash
npm run install-all
npm install -g @qwen-code/qwen-code
# qwen --version
```

4. **配置环境变量**
```bash
cp env.example .env
```
- 根据 [Qwen Code](https://github.com/QwenLM/qwen-code) 中的提示配置 API 密钥，在`.env`文件中配置您的 Qwen API 密钥、基础 URL 和模型。

5. **启动应用**
```bash
npm run dev
```

6. **访问应用**
打开浏览器访问：http://localhost:4009/ （如果端口被占用，可以修改.env文件中的PORT）

## 🎯 使用方法

### 1. 注册/登录
- 首次使用需要注册账户
- 使用用户名和密码登录

### 2. 配置 API
- 在设置页面配置您的 Qwen API 密钥、基础 URL 和模型

### 3. 创建项目
- 点击侧边栏的"+"按钮创建新项目，或选择现有项目，例如`my-project`
- 创建成功后，项目文件会保存在`./projects`目录下，例如`./projects/my-project`

### 4. 开始编程
- 在聊天界面与 AI 对话，AI 会根据你的需求生成代码，并自动保存到项目文件中

## 📄 许可证

本项目基于 [Apache-2.0](LICENSE) 许可证开源。

## 🙏 致谢

- [Qwen Code](https://github.com/QwenLM/qwen-code) - 为 Qwen3-Coder 优化的 CLI 工作流
- [Gemini CLI UI](https://github.com/cruzyjapan/Gemini-CLI-UI) - 本项目的灵感来源

**⭐ 如果这个项目对您有帮助，请给我们一个 Star！** 
