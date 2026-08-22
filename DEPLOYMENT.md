# 部署指南

本指南将帮助你了解如何部署 DNS Shield 项目的 Web 管理工具，使其可以在生产环境中使用。

> 当前版本：**v3.7.58**。项目同时部署于 **腾讯云 EdgeOne（EO）** 与 **Vercel** 双平台，二者均通过平台级配置文件（`edgeone.json` / `vercel.json`）声明构建命令与安全响应头（CSP/HSTS/COOP/CORP 等），策略保持一致。

## 部署环境

### 1. 系统要求

- **操作系统**：Linux、macOS 或 Windows
- **Node.js**：24.11.0 或更高版本（EO 构建环境固定使用 Node 24.11.0，见 `.nvmrc` 与 `package.json` 的 `engines.node`）
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

#### 1.5 访问 Web 管理工具

打开浏览器，访问 `http://localhost:3000`

### 2. 服务器部署

适用于生产环境或团队使用。

#### 2.1 准备服务器

- 选择云服务器或物理服务器
- 安装 Node.js（建议启用 corepack 以使用 pnpm）
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
```

#### 2.4 构建项目

```bash
# 构建生产版本
pnpm build
```

#### 2.5 配置进程管理

使用 PM2 管理进程：

```bash
# 安装 PM2
pnpm add -g pm2

# 启动应用
pm2 start pnpm --name "dns-shield" -- start
# 或使用 npm
# pm2 start pnpm --name "dns-shield" -- start

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
# 使用 Node.js 24 作为基础镜像（与 EO 构建环境 24.11.0 对齐）
FROM node:24-alpine

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

> 说明：当前 `next.config.js` 未启用 `output: 'standalone'`，使用默认构建产物并经由 `next start` 启动。`Dockerfile` 已正确启用 corepack 以使用 `pnpm-lock.yaml` 安装依赖。

### 4. 腾讯云 EdgeOne（EO）部署

EO 通过 `@edgeone/opennextjs-pages` 进行**静态导出**（生成 `out/` 目录），此时 `next.config.js` 的 `headers()` 不会被应用。安全响应头改由 `edgeone.json` 的 `headers` 字段声明，与 Vercel 策略一致。

在 EO 控制台创建项目时选择「导入 Git 仓库」，构建配置会自动读取 `edgeone.json`：

- **构建命令**：`pnpm build`
- **输出目录**：`out`
- **静态导出**：已启用（`staticExport: true`）
- **安全响应头**：CSP / HSTS / X-Frame-Options / COOP / CORP 等已在 `edgeone.json` 声明

> 注意：EO 静态导出环境下，自定义字体需经 `next/font`（本项目已在 `layout.tsx` 用 `next/font/google` 注入 Inter 与 JetBrains Mono），不可使用 `<link>` 引入外部字体，否则构建会报 `no-page-custom-font` 警告。

### 5. Vercel 部署

Vercel 使用标准 Next.js 构建流程，`next.config.js` 的 `headers()` 默认生效；为双平台策略一致，`vercel.json` 也显式声明了相同的安全响应头。

在 Vercel 控制台导入 Git 仓库即可，构建配置自动读取 `vercel.json`：

- **框架预设**：`nextjs`（自动识别）
- **构建命令**：`pnpm build`
- **安装命令**：`pnpm install`
- **安全响应头**：与 EO 完全一致的 CSP / HSTS / COOP / CORP 策略

两平台共用同一份源码与同一套安全头策略，无需为不同平台维护不同分支。

## 配置选项

### 1. 环境变量

可以通过环境变量配置应用：

| 环境变量 | 说明 | 默认值 |
|----------|------|--------|
| `PORT` | 服务器端口 | 3000 |
| `NODE_ENV` | 运行环境 | production |
| `NEXT_PUBLIC_APP_NAME` | 应用名称 | DNS Shield |
| `NEXT_PUBLIC_APP_VERSION` | 应用版本 | 3.7.58 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 衡量 ID（留空则不启用统计） | 空 |
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` | Google Search Console 验证代码（覆盖默认值占位符） | google-site-verification-code |

### 2. Next.js 配置

修改 `next.config.js` 文件（当前项目未启用 `output: 'standalone'`，使用默认构建产物并经由 `next start` 启动）：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  env: {
    version: '3.7.58'
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Content-Security-Policy、HSTS、COOP/CORP 等安全头部
        ]
      }
    ]
  }
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

# 构建项目
pnpm build

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