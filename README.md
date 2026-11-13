![DNS Shield 品牌横幅](public/brand-banner.svg)

![DNS Shield](public/logo.svg)

# DNS Shield - 路由器广告过滤工具

> 最后审查：2026-11-13（与 package.json 版本对齐）

[![中文](https://img.shields.io/badge/语言-中文-red)](README.md) [![English](https://img.shields.io/badge/language-English-blue)](README.en.md) [![Version](https://img.shields.io/badge/version-3.18.1-green)](https://github.com/sutchan/DNS_Shield) [![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org) [![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

基于 DNS 的广告过滤规则库：在路由器或 DNS 服务上配置一次，即可为全屋设备拦截广告与追踪域名。既支持从统一域名数据源**生成** 12 种格式规则，也支持把已有清单在**常见格式之间互相转换**。

**域名清单全程在浏览器本地处理，不会上传到服务器**；无需注册、无账号体系。

## 功能简介

### 核心能力

- **广告 / 追踪拦截** — 过滤网页、视频、App 广告与追踪器
- **多设备生效** — 路由器设置一次，全屋设备自动生效
- **12 种输出格式** — Dnsmasq、Hosts、AdGuard 黑名单（`||domain^`）、AdGuard 白名单（`@@||domain^`）、纯域名列表、Unbound、Pi-hole、BIND RPZ、SmartDNS、Mosdns、Clash Meta、CoreDNS
- **单一数据源** — `public/domains.txt` 为事实来源，构建时派生其余 11 个规则文件
- **白名单 / 自定义 DNS** — `+domain` 放行、`@domain=ip` 自定义解析；`#` 开头为注释
- **格式互转** — 粘贴 hosts / dnsmasq / AdGuard / 纯域名清单，自动识别后转换为目标格式

### 输入与体验

- **URL 导入** — 从远程 URL 拉取域名列表（仅 http/https，带超时与体积上限）
- **预设数据源** — 内置 AdGuard、EasyList、NeoHosts 等，支持批量添加
- **规则测试器** — 输入域名即时返回命中层级（白名单 / 改道 / 黑名单 / 直连）与解析行为
- **本地自动保存** — 每 30 秒写入 IndexedDB（localStorage 兜底），刷新后恢复草稿
- **界面 16 语言 / 深浅色** — 默认简体中文，其次繁体中文、英语；语言偏好保存在本地

### 部署与工程

- **路由器同步脚本** — 一键生成 OpenWrt / iStoreOS、AsusWRT-Merlin、Padavan、SmartDNS、Pi-hole 的定时更新与重载脚本
- **大输入并行解析** — ≥20000 行按行边界分片，最多 8 个 Worker 并行；失败逐级回退单 Worker → 主线程
- **安全加固** — CSP / HSTS 等安全响应头、PWA 离线缓存（同源 + 扩展名白名单）、文件名校验、URL 协议与体积限制

## 快速开始

### 第一步：下载规则

| 路由器 / 软件 | 下载文件 |
|--------|----------|
| 梅林 / OpenWrt | [dnsmasq.conf](public/dnsmasq.conf) |
| 小米 / 华硕 / TP-Link | [hosts.txt](public/hosts.txt) |
| AdGuard / AdGuard Home | [adguard.txt](public/adguard.txt) |

仓库内是构建产物；也可直接用 `https://dns.ewuse.com/<文件名>` 下载或作为订阅 URL。

### 第二步：导入路由器

- **梅林（华硕）**：软件中心 → DNS 设置 → 自定义 dnsmasq，粘贴 `dnsmasq.conf` 内容
- **OpenWrt**：先下载到临时文件、确认内容后再纳入配置，避免 `>>` 反复追加：

  ```bash
  curl -fsSL https://dns.ewuse.com/dnsmasq.conf -o /tmp/dnsmasq-ads.conf
  ```

  建议放入 `/etc/dnsmasq.d/` 或通过 UCI 配置引用，并重启 dnsmasq 生效。
- **小米**：设置 → 广告拦截 → 自定义 hosts，导入 `hosts.txt`

更多机型与同步脚本见 [部署指南](DEPLOYMENT.md)。

## 在线工具

访问 [https://dns.ewuse.com](https://dns.ewuse.com/) 自定义域名清单、切换格式、复制或下载结果；部署方式见 [部署指南](DEPLOYMENT.md)。站点还提供 [llms.txt](https://dns.ewuse.com/llms.txt)、`sitemap.xml` 与 `robots.txt` 供搜索引擎和生成式引擎读取。

## 文件说明

`public/domains.txt` 是唯一事实来源（含黑名单、白名单与改道规则），构建时由 `scripts/gen-format-files.mjs` 派生其余 **11** 个规则文件。因此「12 种格式」对应 12 个文件，其中 `domains.txt` 既是数据源，也是「纯域名列表」格式本身。

| 文件 | 用途 |
|------|------|
| `domains.txt` | 统一域名数据源（事实来源，亦为「纯域名列表」格式） |
| `dnsmasq.conf` | Dnsmasq 路由器格式 |
| `hosts.txt` | 标准 hosts 格式 |
| `adguard.txt` | AdGuard 黑名单（`||domain^`） |
| `whitelist.txt` | AdGuard 白名单（`@@||domain^`，放行误拦截域名） |
| `unbound.conf` / `pihole.txt` / `rpz.db` / `smartdns.conf` / `mosdns_domain_set.txt` / `clash_dns.yaml` / `coredns_hosts.txt` | 其余 7 种格式产物 |

## 格式转换

除从 `domains.txt` 生成外，也支持**已有清单不同格式互转**：

- **自动识别** — 粘贴 hosts / dnsmasq / AdGuard / 纯域名时，`parseDomainLine` 识别每行格式，提取域名 / 白名单（`+`）/ 自定义 DNS（`@`）/ 注释（`#`）
- **统一中间结构** — 先解析为统一域名条目（是否拦截、目标 IP、白名单标记）
- **切换输出** — 在输出面板「格式」下拉选择目标格式即可

典型场景：把一份 AdGuard 规则粘贴进输入框，一键转成 dnsmasq 或 Pi-hole；旧 hosts 清单转 SmartDNS / BIND RPZ。

## 数据流

```
统一数据源（public/domains.txt）
        │  useDomainData（远端拉取 + 超时/兜底）
        ▼
  域名解析（parser.ts + domainValidator.ts）
        │  ≥20000 行 → useWorkerPool 多核分片并行（回退单 Worker → 主线程）
        ▼
  排序去重（sortDedupe.ts）
        ▼
  规则生成（rulesGenerator.ts，useRules 实时同步）
        ▼
  输出 12 种格式 → 复制 / 下载
```

要点：单一数据源派生其余 11 个格式文件；解析 / 校验 / 排序 / 生成的核心纯函数由 Vitest 单元测试覆盖；本地优先（每 30 秒自动保存，IndexedDB + localStorage 兜底）。

## 项目结构

完整模块清单见 [docs/SPEC.md](docs/SPEC.md) §2。核心目录：

- `src/app/` — Next.js App Router（页面、布局、SEO / PWA / `llms.txt` 路由）
- `src/components/` — 业务组件；`ui/` 为 shadcn 基础组件
- `src/hooks/` `src/utils/` `src/workers/` — 状态逻辑、纯函数与 Web Worker（含 Vitest 单测）
- `src/locales/` — 16 种语言翻译（`zh-cn` 为缺失键回退基准）
- `src/styles/` — 设计系统样式（按职责拆分）
- `src/config/` `src/types/` `src/context/` — 默认设置 / 站点事实 / 类型 / 全局 Context
- `src/test-utils/` — Vitest 共享测试装置

## 开发

环境要求：Node.js ≥ 24.11.0、pnpm 11.24.0（见 `package.json` 的 `engines` / `packageManager`）。

```bash
pnpm install          # 安装依赖
pnpm dev              # 开发模式（http://localhost:3000）
pnpm build            # 生产构建（standalone 输出）
pnpm lint             # ESLint 检查
pnpm test             # Vitest 单元测试
pnpm test:coverage    # 覆盖率报告
```

维护脚本（改版本号或域名清单后需执行）：

```bash
pnpm check:locales                     # 16 语键一致性校验
pnpm build:formats                     # 从 domains.txt 重建 11 个规则产物
node scripts/sync-facts.mjs --check   # 文档版本展示位一致性（CI 门禁）
```

## 文档与规范

- 规范与架构细节：[docs/SPEC.md](docs/SPEC.md)
- 部署指南：[DEPLOYMENT.md](DEPLOYMENT.md)
- 任务与进度：[docs/tasks.md](docs/tasks.md) · [docs/tasks-done.md](docs/tasks-done.md)
- 发布检查清单：[docs/CHECKLIST.md](docs/CHECKLIST.md)
- 贡献指南：[.github/CONTRIBUTING.md](.github/CONTRIBUTING.md)
- 安全策略：[.github/SECURITY.md](.github/SECURITY.md)
- 版本历史：[CHANGELOG.md](CHANGELOG.md)

## 许可证

MIT License

## 版本

当前版本：v3.18.1，完整变更见 [CHANGELOG.md](CHANGELOG.md)。
