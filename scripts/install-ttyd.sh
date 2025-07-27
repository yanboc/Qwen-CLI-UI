#!/bin/bash

# ttyd 安装脚本
echo "开始安装 ttyd..."

# 检查是否已安装
if command -v ttyd &> /dev/null; then
    echo "ttyd 已经安装，版本: $(ttyd --version)"
    exit 0
fi

# 安装依赖
echo "安装依赖包..."
sudo apt update
sudo apt install -y build-essential cmake git libjson-c-dev libwebsockets-dev

# 克隆并编译 ttyd
echo "克隆 ttyd 源码..."
cd /tmp
git clone https://github.com/tsl0922/ttyd.git
cd ttyd

echo "编译 ttyd..."
mkdir build && cd build
cmake ..
make

echo "安装 ttyd..."
sudo make install

# 清理
cd /
rm -rf /tmp/ttyd

echo "ttyd 安装完成！"
echo "版本: $(ttyd --version)"

# 测试安装
if command -v ttyd &> /dev/null; then
    echo "✅ ttyd 安装成功！"
else
    echo "❌ ttyd 安装失败！"
    exit 1
fi 