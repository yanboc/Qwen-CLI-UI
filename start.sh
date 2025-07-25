#!/bin/bash

echo "🚀 启动 Qwen Code UI..."

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装前端依赖..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 安装后端依赖..."
    cd server && npm install && cd ..
fi

# 创建环境变量文件（如果不存在）
if [ ! -f ".env" ]; then
    echo "⚙️ 创建环境变量文件..."
    cp env.example .env
    echo "请编辑 .env 文件配置您的 API 密钥"
fi

# 启动开发服务器
echo "🌟 启动开发服务器..."
npm run dev 