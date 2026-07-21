# 部署指南

本指南将帮助你了解如何部署 DNS Shield 项目的 Web 管理工具，使其可以在生产环境中使用。

## 部署环境

### 1. 系统要求

- **操作系统**：Linux、macOS 或 Windows
- **Node.js**：18.0 或更高版本
- **pnpm**：8.0 或更高版本（推荐）
- **npm**：9.0 或更高版本
- **Git**：用于版本控制

### 2. 服务器要求

- **推荐配置**：
  - CPU：至少 1 核
  - 内存：至少 1 GB
  - 存储空间：至少 100 MB
- **网络**：稳定的网络连接
- **端口**：80 或 443（用于 HTTP/HTTPS）

## 部署方法

### 1. 本地部署

适用于个人使用或测试环境。

#### 1.1 克隆仓库

```bash
# 克隆仓库
git clone https://github.com/sutchan/DNS_Shield.git

# 进入项目目录
cd DNS_Shield
```

#### 1.2 安装依赖

```bash
# 安装依赖
pnpm install
# 或
npm install
```

#### 1.3 构建项目

```bash
# 构建生产版本
pnpm build
# 或
npm run build
```

#### 1.4 启动服务器

```bash
# 运行生产服务器
pnpm start
# 或
npm start

# 或使用 PM2 管理进程
npm install -g pm2
pm2 start npm --name "dns-shield" -- start
```

#### 1.5 访问 Web 管理工具

打开浏览器，访问 `http://localhost:3000`

### 2. 服务器部署

适用于生产环境或团队使用。

#### 2.1 准备服务器

- 选择云服务器或物理服务器
- 安装 Node.js 和 npm
- 配置防火墙，开放必要的端口

#### 2.2 克隆仓库

```bash
# 克隆仓库到服务器
git clone https://github.com/sutchan/DNS_Shield.git

# 进入项目目录
cd DNS_Shield
```

#### 2.3 安装依赖

```bash
# 安装依赖
pnpm install
# 或
npm install
```

#### 2.4 构建项目

```bash
# 构建生产版本
pnpm build
# 或
npm run build
```

#### 2.5 配置进程管理

使用 PM2 管理进程：

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start pnpm --name "dns-shield" -- start
# 或使用 npm
# pm2 start npm --name "dns-shield" -- start

# 设置 PM2 开机自启
pm2 startup
pm2 save
```

#### 2.6 配置反向代理（可选）

如果使用 Nginx 或 Apache 作为反向代理：

##### Nginx 配置

```nginx
server {
    listen 80;
    server_name dns-shield.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

##### Apache 配置

```apache
<VirtualHost *:80>
    ServerName dns-shield.example.com

    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    ProxyPreserveHost On
</VirtualHost>
```

#### 2.7 配置 HTTPS（可选）

使用 Let's Encrypt 配置 HTTPS：

```bash
# 安装 Certbot
apt install certbot python3-certbot-nginx  # Ubuntu/Debian
# 或
yum install certbot python3-certbot-nginx  # CentOS/RHEL

# 获取证书
certbot --nginx -d dns-shield.example.com

# 自动续期
certbot renew --dry-run
```

### 3. 容器化部署

使用 Docker 容器化部署。

#### 3.1 创建 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
# 使用 Node.js 18 作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件
COPY . .

# 构建项目
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
```

#### 3.2 构建 Docker 镜像

```bash
# 构建镜像
docker build -t dns-shield .

# 查看镜像
docker images
```

#### 3.3 运行 Docker 容器

```bash
# 运行容器
docker run -d --name dns-shield -p 3000:3000 dns-shield

# 查看容器状态
docker ps
```

#### 3.4 使用 Docker Compose（可选）

创建 `docker-compose.yml` 文件：

```yaml
version: '3'
services:
  dns-shield:
    build: .
    ports:
      - "3000:3000"
    restart: always
```

运行容器：

```bash
docker-compose up -d
```

## 配置选项

### 1. 环境变量

可以通过环境变量配置应用：

| 环境变量 | 说明 | 默认值 |
|----------|------|--------|
| `PORT` | 服务器端口 | 3000 |
| `NODE_ENV` | 运行环境 | production |
| `NEXT_PUBLIC_APP_NAME` | 应用名称 | DNS Shield |
| `NEXT_PUBLIC_APP_VERSION | 应用版本 | 3.6.0 |

### 2. Next.js 配置

修改 `next.config.js` 文件：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 配置选项
  output: 'standalone',
  // 其他配置...
}

module.exports = nextConfig
```

## 部署后操作

### 1. 健康检查

```bash
# 检查应用是否正常运行
curl -I http://localhost:3000

# 预期响应：HTTP/1.1 200 OK
```

### 2. 日志管理

```bash
# 查看 PM2 日志
pm2 logs dns-shield

# 查看 Docker 容器日志
docker logs dns-shield
```

### 3. 定期更新

```bash
# 进入项目目录
cd DNS_Shield

# 拉取最新代码
git pull origin main

# 安装依赖
pnpm install
# 或
npm install

# 构建项目
pnpm build
# 或
npm run build

# 重启应用
pm2 restart dns-shield
# 或
docker-compose up -d --build
```

### 4. 监控

#### 4.1 进程监控

- **PM2 Monitor**：`pm2 monit`
- **Docker Stats**：`docker stats`

#### 4.2 应用监控

- **Uptime Robot**：监控网站可用性
- **New Relic**：应用性能监控
- **Datadog**：综合监控

## 故障排除

### 1. 服务器启动失败

- 检查端口是否被占用：`lsof -i :3000`
- 检查日志：`pm2 logs dns-shield` 或 `docker logs dns-shield`
- 检查环境变量配置

### 2. 页面加载失败

- 检查网络连接
- 检查服务器状态
- 检查防火墙配置
- 检查反向代理配置

### 3. 功能不可用

- 检查浏览器控制台错误
- 检查服务器日志
- 检查依赖是否正确安装
- 检查构建是否成功

### 4. 性能问题

- 检查服务器资源使用情况：`top` 或 `htop`
- 优化 Node.js 内存配置
- 考虑使用 CDN 加速静态资源

## 最佳实践

- **使用最新版本**：定期更新项目代码和依赖
- **备份数据**：定期备份 `domains.txt` 文件
- **监控应用**：设置监控和告警
- **安全配置**：配置 HTTPS，限制访问权限
- **性能优化**：启用缓存，优化资源加载

## 结论

通过本指南，你可以成功部署 DNS Shield 项目的 Web 管理工具，使其在生产环境中稳定运行。根据你的具体需求和环境，可以选择适合的部署方法。

定期维护和更新部署的应用，可以确保其始终保持最佳状态，为用户提供良好的使用体验。