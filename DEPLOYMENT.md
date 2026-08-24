# 部署指南

本指南将帮助你了解如何部署 DNS Shield 项目的 Web 管理工具，使其可以在生产环境中使用。

> 当前版本：v3.8.7

## 部署环境

### 1. 系统要求

- **操作系统**：Linux、macOS 或 Windows
- **Node.js**：18.0 或更高版本（本地开发使用 Node 24 验证通过）
- **pnpm**：8.0 或更高版本（推荐，项目依赖 `pnpm-lock.yaml`）
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
# 安装依赖（使用 pnpm，与 pnpm-lock.yaml 一致）
pnpm install
```

#### 1.3 构建项目

```bash
# 构建生产版本
pnpm build
```

#### 1.4 启动服务器

```bash
# 运行生产服务器
pnpm start

# 或使用 PM2 管理进程
pnpm add -g pm2
pm2 start pnpm --name "dns-shield" -- start
```

#### 1.5 开发模式

```bash
# 启动开发服务器（默认端口 8082）
pnpm dev
```

#### 1.6 访问 Web 管理工具

打开浏览器，访问 `http://localhost:3000`（生产）或 `http://localhost:8082`（开发）。

### 2. 服务器部署

适用于生产环境或团队使用。

#### 2.1 准备服务器

- 选择云服务器或物理服务器
- 安装 Node.js（建议启用 corepack 以使用 pnpm）
- 配置防火墙，开放必要的端口

#### 2.2 克隆仓库

```bash
git clone https://github.com/sutchan/DNS_Shield.git
cd DNS_Shield
```

#### 2.3 安装依赖与构建

```bash
pnpm install
pnpm build
```

#### 2.4 配置进程管理

使用 PM2 管理进程：

```bash
# 安装 PM2
pnpm add -g pm2

# 启动应用
pm2 start pnpm --name "dns-shield" -- start

# 设置 PM2 开机自启
pm2 startup
pm2 save
```

#### 2.5 配置反向代理（可选）

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

#### 2.6 配置 HTTPS（可选）

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

# 启用 corepack 以使用 pnpm（项目依赖 pnpm-lock.yaml）
RUN corepack enable

# 设置工作目录
WORKDIR /app

# 复制清单与锁文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制项目文件
COPY . .

# 构建项目
RUN pnpm build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["pnpm", "start"]
```

#### 3.2 构建与运行

```bash
# 构建镜像
docker build -t dns-shield .

# 运行容器
docker run -d --name dns-shield -p 3000:3000 dns-shield
```

#### 3.3 使用 Docker Compose（可选）

创建 `docker-compose.yml`：

```yaml
version: '3'
services:
  dns-shield:
    build: .
    ports:
      - "3000:3000"
    restart: always
```

```bash
docker-compose up -d
```

> 说明：当前 `next.config.js` 未启用 `output: 'standalone'`，使用默认构建产物并经由 `next start` 启动。`Dockerfile` 已正确启用 corepack 以使用 `pnpm-lock.yaml` 安装依赖。

## 配置选项

### 1. 环境变量

| 环境变量 | 说明 | 默认值 |
|----------|------|--------|
| `PORT` | 服务器端口 | 3000 |
| `NODE_ENV` | 运行环境 | production |
| `NEXT_PUBLIC_APP_NAME` | 应用名称 | DNS Shield |
| `NEXT_PUBLIC_APP_VERSION` | 应用版本（同时由 `src/config/version.ts` APP_VERSION 与 `next.config.js` env.version 提供） | 3.8.7 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 衡量 ID（留空则不启用统计） | 空 |

### 2. Next.js 配置

修改 `next.config.js`（当前项目未启用 `output: 'standalone'`，使用默认构建产物并经由 `next start` 启动）：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    version: '3.8.7'
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Content-Security-Policy、HSTS、COOP/CORP 等安全头部
        ]
      }
    ];
  }
};

module.exports = nextConfig;
```

## 部署后操作

### 1. 健康检查

```bash
curl -I http://localhost:3000
# 预期响应：HTTP/1.1 200 OK
```

### 2. 日志管理

```bash
pm2 logs dns-shield
docker logs dns-shield
```

### 3. 定期更新

```bash
cd DNS_Shield
git pull origin main
pnpm install
pnpm build
pm2 restart dns-shield
# 或
docker-compose up -d --build
```

### 4. 监控

- **进程监控**：`pm2 monit` / `docker stats`
- **可用性与性能**：Uptime Robot、New Relic、Datadog 等

## 故障排除

### 1. 服务器启动失败

- 检查端口是否被占用：`lsof -i :3000`
- 检查日志：`pm2 logs dns-shield` 或 `docker logs dns-shield`
- 检查依赖是否正确安装（确认使用 pnpm 而非 npm，避免与 `pnpm-lock.yaml` 冲突）

### 2. 页面加载失败

- 检查网络连接、服务器状态、防火墙与反向代理配置

### 3. 功能不可用

- 检查浏览器控制台错误与服务器日志
- 确认 `pnpm build` 成功、依赖完整

### 4. 性能问题

- 检查服务器资源使用：`top` / `htop`
- 考虑使用 CDN 加速静态资源

## 最佳实践

- **使用最新版本**：定期更新项目代码和依赖
- **备份数据**：定期备份 `public/domains.txt` 等数据源
- **监控应用**：设置监控和告警
- **安全配置**：配置 HTTPS，限制访问权限
- **性能优化**：启用缓存，优化资源加载

## 结论

通过本指南，你可以成功部署 DNS Shield 项目的 Web 管理工具，使其在生产环境中稳定运行。根据你的具体需求和环境，可以选择适合的部署方法。定期维护和更新部署的应用，可以确保其始终保持最佳状态。
