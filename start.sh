#!/bin/bash

# ========================================
# KubeaszPull 镜像下载系统启动脚本
# ========================================

echo "========================================"
echo "KubeaszPull 镜像下载系统启动脚本"
echo "========================================"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js"
    echo "   安装命令：curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm未安装，请先安装npm"
    exit 1
fi

echo "✅ Node.js版本： $(node --version)"
echo "✅ npm版本： $(npm --version)"

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
fi

echo "🚀 正在启动KubeaszPull系统..."
echo "📱 前台页面：http://localhost:3000"
echo "⚙️  后台管理：http://localhost:3000/admin"
echo "🔑 默认账号：admin / admin123"
echo "按 Ctrl+C 停止服务器"
echo "========================================"

# 启动服务器
node server.js 