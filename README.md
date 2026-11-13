![DNS Shield 品牌横幅](public/brand-banner.svg)

![DNS Shield](public/logo.svg)

# DNS Shield - 路由器广告过滤工具

> 最后审查：2026-11-13（与 package.json 版本对齐）

[![中文](https://img.shields.io/badge/语言-中文-red)](README.md) [![English](https://img.shields.io/badge/language-English-blue)](README.en.md) [![Version](https://img.shields.io/badge/version-3.18.0-green)](https://github.com/sutchan/DNS_Shield) [![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org) [![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

基于 DNS 的广告过滤规则库，通过路由器设置即可拦截广告与追踪、保护隐私。既支持从统一域名数据源**生成**多种格式规则，也支持将已有清单在**不同格式间互相转换**。

## 功能简介

- **广告 / 追踪拦截** — 过滤网页、视频、App 广告与追踪器
- **支付保护** — 屏蔽扫码支付跳转链接（微信、支付宝）
- **多设备生效** — 路由器设置一次，全屋设备自动生效
- **12 种输出格式** — Dnsmasq、Hosts、AdGuard（黑白名单）、纯域名、Unbound、Pi-hole、Bind RPZ、SmartDNS、Mosdns、Clash Meta、CoreDNS
- **格式互转** — 粘贴任意格式（hosts / dnsmasq / AdGuard / 纯域名）自动识别并转换为目标格式
- **白名单 / 自定义 DNS** — `+domain` 放行、`@domain=ip` 自定义解析
- **URL 导入** — 从远程 URL 拉取域名列表（带超时与体积上限）
- **预设数据源** — 内置 AdGuard、EasyList、NeoHosts 等
- **规则测试器** — 输入域名即时返回命中层级（白名单 / 改道 / 黑名单 / 直连）与解析行为
- **路由器同步脚本** — 一键生成 OpenWrt / Merlin / Padavan / SmartDNS / Pi-hole 定时更新与重载脚本
- **本地自动保存** — 每 30 秒存入浏览器，刷新不丢失
- **16 语言 / 深色浅色** — 一键切换，国际化全覆盖
- **安全加固** — CSP / HSTS / PWA 安全缓存 / 文件名校验
- **大输入并行解析** — ≥20000 行自动分片到 Web Worker，逐级回退单 Worker → 主线程

## 快速开始

### 第一步：下载规则

| 路由器 | 下载文件 |
|--------|----------|
| 梅林 / OpenWrt | [dnsmasq.conf](public/dnsmasq.conf) |
| 小米 / 华硕 / TP-Link | [hosts.txt](public/hosts.txt) |
| AdGuard 用户 | [adguard.txt](public/adguard.txt) |

### 第二步：导入路由器

- **梅林（华硕）**：软件中心 → DNS 设置 → 自定义 dnsmasq，粘贴 `dnsmasq.conf` 内容
- **OpenWrt**：`curl -sL https://raw.githubusercontent.com/sutchan/DNS_Shield/main/public/dnsmasq.conf >> /etc/dnsmasq.conf`
- **小米**：设置 → 广告拦截 → 自定义 hosts，导入 `hosts.txt`

更多机型与同步脚本见 [部署指南](DEPLOYMENT.md)。

## 在线工具

需要自定义域名或生成其他格式，直接访问 [https://dns.ewuse.com](https://dns.ewuse.com/) 在线使用；部署方式见 [部署指南](DEPLOYMENT.md)。

## 文件说明

所有格式由 `domains.txt` 单一数据源派生，`whitelist.txt` 用于放行误拦截域名。

| 文件 | 用途 |
|------|------|
| `dnsmasq.conf` | Dnsmasq 路由器格式 |
| `hosts.txt` | 标准 hosts 格式 |
| `adguard.txt` | AdGuard 黑白名单格式 |
| `whitelist.txt` | 白名单（放行域名，`+domain`） |
| `domains.txt` | 统一域名数据源（事实来源） |
| `unbound.conf` / `pihole.txt` / `rpz.db` / `smartdns.conf` / `mosdns_domain_set.txt` / `clash_dns.yaml` / `coredns_hosts.txt` | 其余 7 种格式产物 |

## 格式转换

除从 `domains.txt` 生成外，也支持**已有清单不同格式互转**：

- **自动识别** — 粘贴 hosts / dnsmasq / AdGuard / 纯域名时，`parseDomainLine` 识别每行格式，提取域名 / 白名单（`+`）/ 自定义 DNS（`@`）/ 注释（`#`）
- **统一中间结构** — 先解析为统一域名条目（是否拦截、目标 IP、白名单标记）
- **任意输出** — 在输出面板「格式」下拉切换即可

典型场景：把一份 AdGuard 规则粘贴进输入框，一键转成 dnsmasq 或 Pi-hole；旧 hosts 清单转 SmartDNS / Bind RPZ。

## 数据流

```
统一数据源（public/domains.txt、whitelist.txt）
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

要点：单一数据源派生所有格式；解析 / 校验 / 排序 / 生成均为纯函数并由 Vitest 覆盖；本地优先（30s 自动保存）。

## 项目结构

完整模块清单见 [docs/SPEC.md](docs/SPEC.md) §2。核心目录：

- `src/app/` — Next.js App Router（页面、布局、SEO / PWA / llms.txt 路由）
- `src/components/` — UI 组件（`ui/` 为 shadcn 基础组件）
- `src/hooks/` `src/utils/` — 业务逻辑与纯函数（含 Vitest 单测）
- `src/locales/` — 16 种语言翻译（zh-cn 为兜底）
- `src/styles/` — 设计系统样式（按职责拆 8 模块）
- `src/config/` — 默认设置 / 版本 / 站点事实 / SEO 文案

## 开发

```bash
pnpm install     # 安装依赖
pnpm dev         # 开发模式（端口 3000）
pnpm build       # 生产构建
pnpm lint        # 代码检查
pnpm test        # 单元测试（Vitest）
```

## 文档与规范

- 规范与架构细节：[docs/SPEC.md](docs/SPEC.md)
- 部署指南：[DEPLOYMENT.md](DEPLOYMENT.md)
- 贡献指南：[.github/CONTRIBUTING.md](.github/CONTRIBUTING.md)
- 安全策略：[.github/SECURITY.md](.github/SECURITY.md)
- 版本历史：[CHANGELOG.md](CHANGELOG.md)

## 许可证

MIT License

## 版本

当前版本：v3.18.0，完整变更见 [CHANGELOG.md](CHANGELOG.md)。
