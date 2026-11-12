# 部署指南

本指南将帮助你了解如何部署 DNS Shield 项目的 Web 管理工具，使其可以在生产环境中使用。

> 当前版本：v3.17.4
> 最后审查：2026-11-12（第十八轮全量文档核查；权威版本源为 `package.json`）

## 部署环境

### 1. 系统要求

- **操作系统**：Linux、macOS 或 Windows
- **Node.js**：24.11.0 或更高版本（`package.json` 的 `engines.node` 下限，`.npmrc` 开启 `engine-strict` 后版本不满足会直接安装失败；CI 使用 Node 24）
- **pnpm**：11.24.0（由 `package.json` 的 `packageManager` 字段锁定，CI 走 `pnpm/action-setup` 自动安装，勿手动指定版本）
- **Git**：用于版本控制

> 依赖安装一律基于入库的 `pnpm-lock.yaml`（`pnpm install --frozen-lockfile`）。修改依赖后请先本地 `pnpm install` 并提交锁文件，否则 CI 会直接失败。

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
# 启动开发服务器（默认端口 3000）
pnpm dev
```

#### 1.6 访问 Web 管理工具

打开浏览器，访问 `http://localhost:3000`（开发与生产均为 3000，由 `package.json` 的 `next dev -p 3000 -H 0.0.0.0` / `next start -p 3000` 固定）。

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

## CI/CD 自动化

项目使用 GitHub Actions 实现「提交即校验、合入即部署」。工作流位于 `.github/workflows/`。

### 1. 工作流总览

| 工作流 | 文件 | 触发时机 | 职责 |
|--------|------|----------|------|
| CI | `ci.yml` | push/PR → `main`、`dev`；手动 | 质量门禁：根目录临时文件洁净度（`rootclean`）、ESLint、TypeScript、Vitest（含覆盖率）、Next.js 构建、多语言与数据一致性 |
| Deploy | `deploy.yml` | `main` 的 CI 成功后自动（`workflow_run`）；手动 | 部署到 Vercel / EdgeOne Pages |
| Release | `release.yml` | `main` 的 Deploy 完成且成功后自动（`workflow_run`） | 按 `package.json` 版本自动打 tag、重新生成全部格式产物、创建 GitHub Release 并附带规则文件资产 |
| Aggregate | `aggregate.yml` | 每周一定时；手动 | 聚合 AdGuard / EasyList / NeoHosts / StevenBlack / YousList 上游域名，去重合并后自动发起 Pull Request 更新 `public/domains.txt` |

CI 采用「并行 job + 聚合门禁」结构：`rootclean`、`lint`、`typecheck`、`test`、`build`、`data` 并行执行，最后由 `ci` 汇总（`needs` 含 `rootclean`）。`rootclean` 执行 `node scripts/check-root-clean.mjs`，拦截散落在根目录或 `scripts/` 下的 `_*.mjs` 临时脚本（唯一合法临时位置为根 `.tmp/`）。
配置分支保护时**只需把 `CI Gate` 勾选为必需检查**，后续增删 job 无需再改保护规则。

CI / Deploy / Release / Aggregate 四个工作流的运行时准备统一收敛到复合动作 `.github/actions/setup`（安装 pnpm + Node 24 + 显式 `actions/cache` 恢复 pnpm store），避免每处重复。当前官方 action 版本：`actions/checkout@v5`、`actions/setup-node@v6`、`pnpm/action-setup@v6`、`actions/cache@v5`、`actions/upload-artifact@v5`（2026-11-12 实况；升级记录见 CHANGELOG `[Unreleased]`）。

`aggregate.yml` 不参与发布链路，仅做上游数据源聚合：每周一定时拉取各上游列表，合并去重后更新 `public/domains.txt` 并自动发起 Pull Request，需人工 review 后合并，从而保证过滤数据持续更新。

### 2. 需要配置的 Secrets

在仓库 **Settings → Secrets and variables → Actions** 中添加：

| Secret | 用途 | 不配置时的影响 |
|--------|------|----------------|
| `VERCEL_TOKEN` | Vercel 访问令牌 | Vercel job 跳过（若开关已开则会失败） |
| `VERCEL_ORG_ID` | Vercel 组织 ID | 同上 |
| `VERCEL_PROJECT_ID` | Vercel 项目 ID | 同上 |
| `EDGEONE_API_TOKEN` | EdgeOne Pages API Token | EdgeOne job 跳过 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 衡量 ID（构建期内联，源码不硬编码） | 留空或格式非法则不注入统计脚本 |

### 3. 需要配置的 Variables（部署开关）

在 **Settings → Secrets and variables → Actions → Variables** 中添加，用于启用/停用对应部署目标：

| Variable | 取值 | 说明 |
|----------|------|------|
| `DEPLOY_VERCEL` | `true` / 不设置 | 启用 Vercel 部署 |
| `DEPLOY_EDGEONE` | `true` / 不设置 | 启用 EdgeOne Pages 部署 |
| `EDGEONE_PROJECT_NAME` | 默认 `dns-shield` | EdgeOne 项目名 |
| `EDGEONE_BUILD_PATH` | 默认 `./.next` | EdgeOne 上传的产物目录（`next.config.js` 为 `output: 'standalone'`，产物在 `.next/`） |

之所以用「变量开关」而不是判断 Secret 是否存在：`secrets` 上下文在 job 级 `if` 中不可靠，显式开关更可控，也便于临时摘掉某个目标。

### 4. 标准发布流程

```bash
# 1. 跑一遍本地校验（等价于 CI 的 lint/typecheck/test）
pnpm run lint && pnpm exec tsc --noEmit && pnpm run test

# 2. 升级版本（会同步修改 package.json；无需手动打 tag）
pnpm version patch        # 或 minor / major

# 3. 推送 main
git push

# 之后全自动完成：
#   - CI 质量门禁
#   - Deploy 部署到已启用的目标
#   - Release 按 package.json 版本自动打 tag 并发布 Release 资产
```

> 版本号必须保持单一来源：`package.json` 的 `version` 决定 tag、`src/config/version.ts` 的
> `APP_VERSION`、`next.config.js` 的 `env.version`，以及规则文件头部的版本注释。
> `release.yml` 按 `package.json` 版本自动创建 tag `vX.Y.Z` 并发布；tag 已存在则跳过，
> 因此仅版本号升级的提交会触发新 Release。

### 5. 规则文件漂移（硬门禁）

`public/*.txt|conf|db` 由 `scripts/gen-format-files.mjs` 从 `public/domains.txt` 生成，文件头带版本号与生成日期。
规则产物的头部版本与域名计数由生成脚本写入（当前**规则 877 条 = 黑名单 645 + 白名单 232**；`public/domains.txt` 非空 **897 行**，含注释 20 行、改道 0 行，以 `node scripts/count-domains.mjs` 实算为准；`package.json` 为版本单一来源（由 `sync-facts.mjs` / `gen-format-files.mjs` 自动派生，勿在此硬编码））。改动数据源后须运行 `node scripts/gen-format-files.mjs` 重建产物。

CI 中的漂移检测是**硬门禁**（产物与数据源不一致即 `exit 1` 阻断流水线）；比对时自动剔除产物头部的
「更新::」日期行（每天变化，属噪声），仅对「版本::」与实际内容漂移拦截。补齐方式：

```bash
node scripts/gen-format-files.mjs   # 重新生成（版本号取自 package.json，禁止硬编码）
node scripts/count-domains.mjs       # 核对计数
node scripts/sync-facts.mjs --check  # 13 处文档版本展示位一致性
node scripts/check-locales.mjs       # 16 语 / 209 键一致性
node scripts/check-root-clean.mjs    # 根目录临时文件洁净度（CI rootclean job 同款）
git add public && git commit -m "chore: 同步生成规则文件"
```

除产物漂移外，CI 首步 `rootclean` 还会拦截散落在根目录或 `scripts/` 的 `_*.mjs` 临时脚本（唯一合法临时位置为根 `.tmp/`），提交前可用上表最后一条命令本地自检。

## 配置选项

### 1. 环境变量

| 环境变量 | 说明 | 默认值 |
|----------|------|--------|
| `NODE_ENV` | 运行环境 | production |
| `NEXT_PUBLIC_BUILD_ID` | 页脚构建编号（`yymmddhhmm`，由 `next.config.js` 构建期生成并注入，见 SPEC §8.1） | 构建时生成 |
| `NEXT_PUBLIC_APP_VERSION` | 应用版本（构建期由 `next.config.js` env.version 注入；应用内展示实际读取 `src/config/version.ts` 的 APP_VERSION） | 3.17.4 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 衡量 ID（须形如 `G-XXXXXXXXXX`；留空或格式非法则不启用统计，详见 `.env.example`） | 空 |

### 2. Next.js 配置

修改 `next.config.js`（当前项目启用 `output: 'standalone'`，构建产物位于 `.next/`，本地经由 `next start` 启动；EdgeOne Pages 上传的产物目录即 `.next/`，可通过仓库变量 `EDGEONE_BUILD_PATH` 覆写）：

```javascript
/** @type {import('next').NextConfig} */
// securityHeaders：CSP / HSTS / COOP / CORP / X-Frame-Options 等 8 个响应头（完整定义见文件实文）
const securityHeaders = [ /* ... */ ];
const buildTimeId = () => { /* 本地构建时间 yymmddhhmm */ };

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    version: '3.17.4',                    // 展示位由 sync-facts.mjs 从 package.json 派生，勿另处硬编码
    NEXT_PUBLIC_BUILD_ID: buildTimeId()  // 构建期注入，页脚 build 编号（缺失时回退版本号）
  },
  devIndicators: { buildActivity: false },
  onDemandEntries: { maxInactiveAge: 25 * 1000, pagesBufferLength: 2 },
  async headers() {
    // dev: CSP script-src 追加 'unsafe-eval'（webpack eval）；prod: 严格 CSP
    return [{ source: '/(.*)', headers: securityHeaders }];
  }
};

module.exports = nextConfig;
```

> **CSP 双源**：`vercel.json` 另有一份逐字相同的 CSP，末尾额外启用 `require-trusted-types-for 'script'`；两处尚未统一（见 SPEC §12.1）。CI 目前**没有**自动一致性检查，修改一处须手工核对另一处。
> **本地开发提示（已内置修复）**：`next dev` 的 webpack 需以 `eval` 执行模块，若 CSP 不含 `'unsafe-eval'`，带 CSP 的浏览器 / 内嵌 WebView 预览会被拦截并报 `Refused to evaluate a string as JavaScript`。现 `next.config.js` 的 `headers()` 按 `NODE_ENV` 分支：dev 自动为 `script-src` 追加 `'unsafe-eval'`，生产（`next build` / `next start`）保持严格不含该指令；`vercel.json` 属生产部署路径，同样不含。无需临时手工改配置或更换预览方式。

## 部署后操作

### 1. 健康检查

```bash
curl -I http://localhost:3000
# 预期响应：HTTP/1.1 200 OK
```

### 2. 日志管理

```bash
pm2 logs dns-shield
```

### 3. 定期更新

```bash
cd DNS_Shield
git pull origin main
pnpm install
pnpm build
pm2 restart dns-shield
```

### 4. 监控

- **进程监控**：`pm2 monit`
- **可用性与性能**：Uptime Robot、New Relic、Datadog 等

## 故障排除

### 1. 服务器启动失败

- 检查端口是否被占用：`lsof -i :3000`
- 检查日志：`pm2 logs dns-shield`
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
