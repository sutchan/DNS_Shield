# 04 API 接口文档

> 最后审查：2026-11-27（与 package.json v3.22.6 对齐） · 文档集版本：v3.22.6
> 权威级别：权威说明 · 事实源：`src/app/` 路由与 `public/` 产物；机器可读定义见 [openapi.yaml](./openapi.yaml)（OpenAPI 3.1.0），离线校验 `node scripts/check-openapi.mjs`。

## 目录

- [1. 适用范围与重要事实](#1-适用范围与重要事实)
- [2. HTTP 端点总览](#2-http-端点总览)
- [3. 端点详情](#3-端点详情)
- [4. 参数与返回格式约定](#4-参数与返回格式约定)
- [5. 错误码定义](#5-错误码定义)
- [6. 浏览器内模块 API（非 HTTP）](#6-浏览器内模块-api非-http)
- [7. 规范符合性说明](#7-规范符合性说明)

## 1. 适用范围与重要事实

**本项目没有业务 REST API。** 域名清单在浏览器本地解析与生成，不上传用户输入，也没有账号、数据库或 `/api/*` 业务路由。`robots.txt` 中出现的 `Disallow: /api/` 是给爬虫的通用声明，不代表项目存在该路径。

因此本文档的「API」仅覆盖两类真实存在的接口：

1. **HTTP 端点**：页面路由、元数据端点（`robots.txt` / `sitemap.xml` / `llms.txt`）、静态规则文件。
2. **浏览器内模块 API**：`src/utils/` 与 `src/hooks/` 导出的纯函数 / Hook，供前端内部调用，**不是网络接口**。

任何新增 HTTP 接口必须先改代码再更新 [openapi.yaml](./openapi.yaml)，并在 [任务清单](./tasks.md) 登记；禁止在文档中虚构接口或错误码。

## 2. HTTP 端点总览

| 路径 | 方法 | 来源 | Content-Type | 说明 |
|------|------|------|--------------|------|
| `/` | GET | Next.js 页面 | `text/html` | 主工具页（单页应用） |
| `/about/` | GET | Next.js 页面 | `text/html` | 关于 / 使用步骤 / 12 格式 / FAQ 事实页（v3.20.0 起独立） |
| `/robots.txt` | GET | `src/app/robots.ts` | `text/plain` | 爬虫规则，声明 sitemap 与生成式引擎准入 |
| `/sitemap.xml` | GET | `src/app/sitemap.ts` | `application/xml` | 站点地图，仅含 `/` 与 `/about/`（锚点 URL 已移除） |
| `/llms.txt` | GET | `src/app/llms.txt/route.ts` | `text/plain; charset=utf-8` | 面向生成式引擎的站点简报，构建期静态预渲染 |
| `/category-index.txt` | GET | `public/` 静态文件 | `text/plain` | 域名分类索引（`<source> <domain>`），供分类筛选使用，已纳入 aggregate / release / CI 清单 |
| `/domains.txt` 等 12 个规则文件 | GET | `public/` 静态文件 | `text/plain` / `application/octet-stream` | 1 个数据源 + 11 个派生产物，均可作为订阅 URL 使用；`domains.txt` 为唯一事实来源 |

## 3. 端点详情

### 3.1 `GET /llms.txt`

- **实现**：`src/app/llms.txt/route.ts`，`export const dynamic = 'force-static'`，构建期预渲染。
- **参数**：无路径参数、无查询参数、无请求体。
- **响应头**：
  - `Content-Type: text/plain; charset=utf-8`
  - `Cache-Control: public, max-age=0, s-maxage=86400`（浏览器不缓存、CDN 缓存 1 天）
- **响应体**：`buildLlmsTxt(APP_VERSION)` 生成的纯文本简报，含站点定位、使用步骤、12 格式说明与版本。

```bash
curl -fsSL https://dns.ewuse.com/llms.txt
```

### 3.2 `GET /robots.txt`

- **实现**：`src/app/robots.ts` 返回 `MetadataRoute.Robots`。
- **规则**：`User-agent: *` 允许 `/`，禁止 `/api/` 与 `/admin/`（声明性路径，当前无对应实现）；显式 Allow 主流生成式引擎 UA。
- **响应体片段**：

```text
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Sitemap: https://dns.ewuse.com/sitemap.xml
```

### 3.3 `GET /sitemap.xml`

- **实现**：`src/app/sitemap.ts`，`lastModified` 取 `SITE_LAST_MODIFIED`（手工维护的稳定日期，非构建时 `new Date()`）。
- **条目**：`https://dns.ewuse.com/`（priority 1.0）与 `https://dns.ewuse.com/about/`（priority 0.6）。

### 3.4 `GET /{rule-file}`

12 个规则文件 = 唯一数据源 `public/domains.txt` 本身 + 由 `scripts/gen-format-files.mjs` 派生的 11 个产物，均可通过站点根路径直接下载：

| 文件 | 目标系统 |
|------|----------|
| `domains.txt` | 纯域名列表（亦为唯一数据源） |
| `dnsmasq.conf` | dnsmasq / Merlin / OpenWrt |
| `hosts.txt` | 标准 hosts（小米 / 华硕 / TP-Link） |
| `adguard.txt` / `whitelist.txt` | AdGuard / AdGuard Home 黑名单 / 白名单 |
| `unbound.conf` / `pihole.txt` / `rpz.db` | Unbound / Pi-hole / BIND RPZ |
| `smartdns.conf` / `mosdns_domain_set.txt` / `clash_dns.yaml` / `coredns_hosts.txt` | 对应 DNS 软件 |

调用示例（作为订阅地址，注意先下载到临时文件核对内容，不要直接 `>>` 追加）：

```bash
curl -fsSL https://dns.ewuse.com/dnsmasq.conf -o /tmp/dnsmasq-ads.conf
head -n 20 /tmp/dnsmasq-ads.conf
```

### 3.5 其他端点调用示例

```bash
# 页面：返回 HTML（HEAD 即可验证可达性）
curl -fsSI https://dns.ewuse.com/
curl -fsSI https://dns.ewuse.com/about/

# 元数据端点
curl -fsSL https://dns.ewuse.com/robots.txt
curl -fsSL https://dns.ewuse.com/sitemap.xml
curl -fsSL https://dns.ewuse.com/llms.txt | head -n 20

# 分类索引（每行 = 上游来源 + 域名，供前端分类筛选）
curl -fsSL https://dns.ewuse.com/category-index.txt | head -n 5
```

所有端点均为匿名只读 GET，无请求体、无认证头。本地开发将域名替换为 `http://localhost:3000` 即可。

## 4. 参数与返回格式约定

| 项 | 约定 |
|----|------|
| 路径参数 | 仅静态文件名，无动态路由参数 |
| 查询参数 | 无。所有生成逻辑在浏览器本地完成，不接受服务端参数 |
| 请求体 | 无。端点均为 GET，幂等只读 |
| 成功响应 | `2xx`；`llms.txt` 与静态文件返回纯文本，页面返回 HTML |
| 认证 | 无。项目无账号体系，端点全部公开 |

## 5. 错误码定义

项目**没有自定义业务错误码**，所有失败均为 HTTP 标准状态码，由 Next.js / 托管平台产生：

| 状态码 | 含义 | 常见原因 | 处理建议 |
|--------|------|----------|----------|
| `404` | 资源不存在 | 规则文件名拼写错误、产物未生成 | 核对 [§3.4](#34-getrule-file) 文件名；本地跑 `npm run build:formats` |
| `403` | 禁止访问 | CDN / WAF 拦截 | 检查来源 IP 与平台配置 |
| `429` | 请求过多 | 订阅客户端刷新过频 | 降低刷新频率；`llms.txt` 有 1 天 CDN 缓存 |
| `500` / `502` / `503` | 服务端 / 边缘错误 | 部署异常、边缘运行时故障 | 查看平台日志；稍后重试 |

前端的用户可见错误（如「域名源加载失败」「URL 抓取失败」）通过 toast 呈现，不属于 HTTP 接口错误码；对应文案在 `src/locales/*.json` 的 `toast.*` 中。

## 6. 浏览器内模块 API（非 HTTP）

以下函数供应用内部调用，列此供开发者参考；**不能通过网络调用**。

| 模块 | 导出 | 入参 → 返回 | 关键契约 |
|------|------|-------------|----------|
| `utils/parseLine.ts` | `parseDomainLine` | `(line: string) → ParseResult` | 识别 `+` / `@` / `#` 与 AdGuard `\|\|`，正则识别先于注释剥离 |
| `utils/rulesGenerator.ts` | `generateHeader` | `(format, counts, date, settings, t) → string` | 头部每行必须以格式注释符开头 |
| `utils/rulesGenerator.ts` | `generateRules` | `(format, entries, settings, t) → string` | 只生成单一目标格式 |
| `utils/lineCount.ts` | `countLines` | `(text: string) → number` | 非分配计数，语义等同 `split('\n').length` |
| `utils/fileUtils.ts` | `downloadOutput` | `(content: string, filename: string) → void` | 内部经 `sanitizeFilename` 净化文件名，去路径分隔符防穿越 |
| `utils/fileUtils.ts` | `fetchFromUrls` | `(urls: string[], timeout?: number) → Promise<FetchUrlsResult>` | 10MB/响应、50MB/批、5 URL/批；失败 URL 随 `failedUrls` 返回 |
| `scripts/count-domains.mjs` | CLI | 无参 | 实算域名数（2026-11-26 实算 127188），禁止手写数字 |

## 7. 规范符合性说明

[openapi.yaml](./openapi.yaml) 遵循 OpenAPI 3.1.0：包含 `info`（版本与许可）、`servers`（生产 / 本地）、`paths`（7 条真实端点：2 页面 + 3 元数据 + 分类索引 + 规则文件模板）、`components.schemas`（纯文本 / XML / HTML 响应体）与 `components.responses`（404 / 403 / 429 / 5XX 标准错误）。`node scripts/check-openapi.mjs` 已纳入 CI data job，校验版本一致性、`operationId` 唯一与本地 `$ref` 可解析。由于无业务 API，文档中**没有** `requestBody`、认证 scheme 或业务错误码 schema；这是有意为之，不是遗漏。

### 7.1 验证状态与边界（v3.22.6 · 2026-11-27）

| 项 | 当前状态 |
|----|----------|
| 规范校验 | `node scripts/check-openapi.mjs` 实跑：7 路径 / 7 操作，版本 3.22.6，通过 |
| 契约冒烟 | `npm run check:api-contract` 对 7 端点发本地请求，断言状态码 200 与 `Content-Type`，已接入 CI build job |
| 已实现能力 | `/category-index.txt` 域名分类索引（`<source> <domain>`）已纳入 aggregate / release / CI 清单，缺失时前端控件降级隐藏 |
| 已知边界 | 无业务 REST API、无认证与自定义错误码；`robots.txt` 的 `Disallow: /api/` 是声明性路径，不代表存在该接口；规则文件内容由浏览器本地生成，服务端只提供静态文件 |
| 端点变更规则 | 新增 / 修改 HTTP 端点须先改代码，再同步本文与 `openapi.yaml`，并在 `docs/tasks.md` 登记；不得两处手写不同域名或版本 |
