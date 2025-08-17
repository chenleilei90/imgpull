# KubeaszPull - 专业镜像下载系统

## 🚀 项目简介

KubeaszPull 是一个专业的Kubeasz镜像付费下载系统，用户可以通过支付2元获取访问串码，使用串码查看所有镜像的下载地址。系统支持智能命令生成、批量镜像管理、会话持久化等功能。

## ✨ 主要功能

### 🎯 核心功能
- **智能镜像管理**: 只需输入镜像名称，系统自动生成完整的Docker命令
- **串码访问控制**: 付费获取串码，有效期可自定义（默认15天）
- **会话持久化**: 管理员登录状态保持7天，刷新页面不会丢失
- **批量操作**: 支持批量导入镜像，提高管理效率

### 🔧 管理功能
- **镜像管理**: 添加、编辑、删除镜像，支持分类管理
- **串码管理**: 查看所有串码，管理串码状态
- **系统设置**: 配置系统名称、价格、有效期等参数
- **统计面板**: 实时显示镜像数量、串码数量、收入等统计信息

### 💡 用户体验
- **智能命令生成**: 自动生成 `docker pull`、`docker run`、Harbor地址等命令
- **一键复制**: 支持一键复制串码和Docker命令
- **响应式设计**: 支持手机、平板、电脑等多种设备
- **实时预览**: 添加镜像时实时预览生成的命令

## 🛠️ 技术栈

### 后端
- **Node.js**: 服务器运行环境
- **Express.js**: Web框架
- **SQLite3**: 轻量级数据库
- **bcrypt**: 密码加密
- **express-session**: 会话管理
- **moment.js**: 时间处理
- **crypto**: 加密和ID生成

### 前端
- **HTML5**: 页面结构
- **CSS3**: 样式设计，支持渐变和动画
- **JavaScript (ES6+)**: 交互逻辑
- **响应式设计**: 适配多种设备

## 📁 项目结构

```
kubeaszpull/
├── server.js              # 主服务器文件
├── package.json           # 项目配置和依赖
├── start.sh              # Linux启动脚本
├── public/               # 静态文件目录
│   ├── index.html        # 前台用户界面
│   └── admin.html        # 后台管理界面
├── kubeaszpull.db        # SQLite数据库文件
└── README.md             # 项目说明文档
```

## 🗄️ 数据库结构

### 表结构
- **admins**: 管理员账号表
- **images**: 镜像信息表（简化字段，智能生成命令）
- **access_codes**: 访问串码表
- **payments**: 支付记录表
- **settings**: 系统设置表

### 智能字段设计
镜像表采用简化设计，只需输入基本信息：
- `name`: 镜像名称（如：nginx）
- `description`: 描述信息
- `version`: 版本（默认：latest）
- `category`: 分类（默认：kubeasz）
- `harbor_domain`: Harbor域名（可全局配置）
- `harbor_project`: Harbor项目（可全局配置）

系统自动生成：
- `docker pull` 命令
- `docker run` 命令
- `docker tag` 命令
- Harbor访问地址

## 🚀 快速开始

### 1. 环境要求
- Node.js 16+ 
- npm 8+

### 2. 安装依赖
```bash
npm install
```

### 3. 启动系统
```bash
# Linux/Mac
chmod +x start.sh
./start.sh

# 或者直接启动
node server.js
```

### 4. 访问系统
- **前台页面**: http://localhost:3000
- **后台管理**: http://localhost:3000/admin
- **默认账号**: admin / admin123

## 📋 API接口

### 公开接口
- `GET /api/system-info` - 获取系统信息
- `GET /api/images` - 获取所有镜像（公开）
- `GET /api/images/:code` - 通过串码获取镜像详情
- `POST /api/create-code` - 创建访问串码
- `GET /api/verify-code/:code` - 验证串码

### 管理接口
- `POST /admin/login` - 管理员登录
- `GET /admin/check-auth` - 检查登录状态
- `POST /admin/logout` - 管理员登出
- `GET /admin/stats` - 获取统计信息
- `GET /admin/images` - 获取所有镜像（管理）
- `POST /admin/images` - 添加镜像
- `PUT /admin/images/:id` - 更新镜像
- `DELETE /admin/images/:id` - 删除镜像
- `POST /admin/images/batch` - 批量导入镜像
- `GET /admin/codes` - 获取所有串码
- `PUT /admin/codes/:id` - 更新串码状态
- `GET /admin/settings` - 获取系统设置
- `PUT /admin/settings` - 更新系统设置

## 🔧 部署说明

### 开发环境
```bash
npm install
node server.js
```

### 生产环境（PM2）
```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start server.js --name kubeaszpull

# 查看状态
pm2 status

# 查看日志
pm2 logs kubeaszpull
```

### Docker部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### Nginx配置
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔒 安全特性

- **密码加密**: 使用bcrypt加密存储密码
- **会话管理**: 安全的会话配置，支持HTTPS
- **输入验证**: 前后端双重验证
- **权限控制**: 管理员接口权限验证
- **SQL注入防护**: 使用参数化查询

## 🎨 界面特色

- **现代化设计**: 使用渐变背景和毛玻璃效果
- **响应式布局**: 适配各种设备屏幕
- **交互动画**: 悬停效果和过渡动画
- **用户友好**: 直观的操作界面和提示信息

## 🔄 更新日志

### v1.0.0 (2024-12-19)
- ✅ 重新设计系统架构
- ✅ 修复会话管理问题
- ✅ 实现智能命令生成
- ✅ 添加批量导入功能
- ✅ 优化用户界面
- ✅ 改进错误处理

## 📞 技术支持

- **邮箱**: admin@kubeasz.com
- **项目地址**: https://github.com/your-repo/kubeaszpull

## 📄 许可证

MIT License

---

**KubeaszPull** - 让镜像下载更简单、更智能！ 