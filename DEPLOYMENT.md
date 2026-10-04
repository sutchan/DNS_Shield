# 部署指南

本指南将帮助你了解如何部署 DNS Shield 项目的 Web 管理工具，使其可以在生产环境中使用。

> 当前版本：v3.9.11

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

## CI/CD 自动化

项目使用 GitHub Actions 实现「提交即校验、合入即部署」。工作流位于 `.github/workflows/`。

### 1. 工作流总览

| 工作流 | 文件 | 触发时机 | 职责 |
|--------|------|----------|------|
| CI | `ci.yml` | push/PR → `main`、`dev`；手动 | 质量门禁：ESLint、TypeScript、Vitest（含覆盖率）、Next.js 构建、多语言与数据一致性 |
| Deploy | `deploy.yml` | push → `main`、push tag `v*`；手动 | 部署到 Vercel / EdgeOne Pages / GHCR 镜像 / 自托管服务器 |
| Release | `release.yml` | push tag `v*` | 校验版本号、重新生成 9 种规则文件、创建 GitHub Release 并附带规则文件资产 |

CI 采用「并行 job + 聚合门禁」结构：`lint`、`typecheck`、`test`、`build`、`data` 并行执行，最后由 `ci` 汇总结果。
配置分支保护时**只需把 `CI Gate` 勾选为必需检查**，后续增删 job 无需再改保护规则。

三个工作流的运行时准备统一收敛到复合动作 `.github/actions/setup`（安装 pnpm + Node 24 + 恢复依赖缓存），避免每处重复。

### 2. 需要配置的 Secrets

在仓库 **Settings → Secrets and variables → Actions** 中添加：

| Secret | 用途 | 不配置时的影响 |
|--------|------|----------------|
| `VERCEL_TOKEN` | Vercel 访问令牌 | Vercel job 跳过（若开关已开则会失败） |
| `VERCEL_ORG_ID` | Vercel 组织 ID | 同上 |
| `VERCEL_PROJECT_ID` | Vercel 项目 ID | 同上 |
| `EDGEONE_API_TOKEN` | EdgeOne Pages API Token | EdgeOne job 跳过 |
| `SSH_HOST` / `SSH_USERNAME` / `SSH_PRIVATE_KEY` / `SSH_PORT` | 自托管服务器 SSH 登录 | 自托管 job 跳过 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 衡量 ID（构建期内联） | 留空则前端不启用统计 |

GHCR 镜像推送使用内置的 `GITHUB_TOKEN`，无需额外配置。

### 3. 需要配置的 Variables（部署开关）

在 **Settings → Secrets and variables → Actions → Variables** 中添加，用于启用/停用对应部署目标：

| Variable | 取值 | 说明 |
|----------|------|------|
| `DEPLOY_VERCEL` | `true` / 不设置 | 启用 Vercel 部署 |
| `DEPLOY_EDGEONE` | `true` / 不设置 | 启用 EdgeOne Pages 部署 |
| `DEPLOY_GHCR` | `false` / 不设置 | 设为 `false` 关闭 GHCR 镜像构建 |
| `DEPLOY_SSH` | `true` / 不设置 | 启用自托管服务器部署 |
| `EDGEONE_PROJECT_NAME` | 默认 `dns-shield` | EdgeOne 项目名 |
| `EDGEONE_BUILD_PATH` | 默认 `./out` | EdgeOne 上传的产物目录 |
| `DOCKER_PLATFORMS` | 默认 `linux/amd64` | 树莓派等 ARM 设备设为 `linux/amd64,linux/arm64` |

之所以用「变量开关」而不是判断 Secret 是否存在：`secrets` 上下文在 job 级 `if` 中不可靠，显式开关更可控，也便于临时摘掉某个目标。

### 4. 标准发布流程

```bash
# 1. 跑一遍本地校验（等价于 CI 的 lint/typecheck/test）
pnpm run lint && pnpm exec tsc --noEmit && pnpm run test

# 2. 升级版本并打 tag（会同步修改 package.json）
pnpm version patch        # 或 minor / major

# 3. 推送（含 tag）
git push --follow-tags

# 之后自动完成：
#   - CI 质量门禁
#   - Deploy 部署到已启用的目标
#   - Release 生成规则文件并发布 Release 资产
```

> 版本号必须保持单一来源：`package.json` 的 `version` 决定 tag、`src/config/version.ts` 的
> `APP_VERSION`、`next.config.js` 的 `env.version`，以及规则文件头部的版本注释。
> `release.yml` 会强制校验 tag 与 `package.json` 一致。

### 5. 容器化部署

仓库已内置 `Dockerfile`（多阶段构建：deps → build → runner），无需再手写：

```bash
docker build -t dns-shield .
docker run -d --name dns-shield -p 3000:3000 \
  -e NODE_ENV=production dns-shield
```

镜像由 Deploy 工作流自动推送到 `ghcr.io/<owner>/<repo>`，自托管 job 会在目标机上拉取并滚动重启容器。

### 6. 已知问题：规则文件漂移

`public/*.txt|conf|db` 由 `scripts/gen-format-files.mjs` 从 `public/domains.txt` 生成，文件头带版本号与生成日期。
当前仓库内这些文件停留在 **v3.8.8 / 630 个域名**，而实际数据已是 **867 条（黑名单 635 + 白名单 232）**、`package.json` 版本为 3.9.11。

因此 CI 中的漂移检测目前是**软门禁**（`continue-on-error`），只在工作流 Summary 中提示、不阻断流水线。
补齐方式：

```bash
node scripts/gen-format-files.mjs   # 重新生成
pnpm run count-domains              # 核对计数
git add public && git commit -m "chore: 同步生成规则文件至 v3.9.11"
```

同步完成后，删除 `.github/workflows/ci.yml` 中 `Detect generated rule files drift` 步骤的
`continue-on-error: true`，即可升级为硬门禁，杜绝后续再漂移。

## 配置选项

### 1. 环境变量

| 环境变量 | 说明 | 默认值 |
|----------|------|--------|
| `PORT` | 服务器端口 | 3000 |
| `NODE_ENV` | 运行环境 | production |
| `NEXT_PUBLIC_APP_NAME` | 应用名称 | DNS Shield |
| `NEXT_PUBLIC_APP_VERSION` | 应用版本（同时由 `src/config/version.ts` APP_VERSION 与 `next.config.js` env.version 提供） | 3.9.11 |
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
    version: '3.9.11'
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
