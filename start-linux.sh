#!/bin/bash

echo "========================================"
echo "KubeaszPull 镜像下载系统启动脚本 (Linux)"
echo "========================================"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，正在安装..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm未安装，正在安装..."
    sudo apt-get install -y npm
fi

echo "✅ Node.js版本： $(node -v)"
echo "✅ npm版本： $(npm -v)"

# 删除旧数据库
echo "🗑️  清理旧数据库..."
rm -f kubeaszpull.db

# 安装依赖
echo "📦 安装依赖包..."
npm install

# 检查better-sqlite3是否安装成功
if ! node -e "require('better-sqlite3')" 2>/dev/null; then
    echo "❌ better-sqlite3安装失败，尝试重新安装..."
    npm uninstall better-sqlite3
    npm install better-sqlite3 --build-from-source
fi

echo "🚀 正在启动KubeaszPull系统..."
echo "📱 前台页面：http://localhost:3000"
echo "⚙️  后台管理：http://localhost:3000/admin"
echo "🔑 默认账号：admin / admin123"
echo "按 Ctrl+C 停止服务器"
echo "========================================"

# 启动服务器
node server.js 