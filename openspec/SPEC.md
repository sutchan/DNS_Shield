# DNS Shield 项目规范

> 最后审查：2026-08-26（与 package.json v3.9.6 对齐）

## 1. 项目概述

| 属性 | 值 |
|------|-----|
| 项目名称 | DNS Shield |
| 项目类型 | DNS 广告过滤规则库 + Web 管理工具 |
| 核心功能 | 基于 dnsmasq/hosts 的路由器全局广告防护 |
| 目标用户 | 使用梅林/OpenWrt/小米/华硕/TP-Link 等路由器的用户 |
| 项目地址（主页/治理） | https://github.com/ArcesTeam/DNS_Shield |
| 运行时数据源（历史 fork 托管） | https://github.com/sutchan/DNS_Shield（raw 预设源，见 §9.3，勿改） |
| 演示地址 | https://dns.ewuse.com/ |
| 当前版本 | v3.9.6 |
| 拦截域名 | 525 (本地) / 6766+ (含预设源) |
| 技术栈 | Next.js 14 + React 18 + TypeScript 5 + Tailwind CSS 3.4 |
| UI 框架 | shadcn/ui + Radix UI + Lucide Icons |
| 通知组件 | sonner |
| 国际化 | 16 种语言 |

## 2. 文件结构

```
dns-shield/
├── README.md                       # 中文说明文档
├── README.en.md                    # 英文说明文档
├── CHANGELOG.md                    # 变更日志
├── DEPLOYMENT.md                   # 部署指南
├── .github/                        # Community Health Files（已迁至此，非根目录）
│   ├── CONTRIBUTING.md             # 贡献指南
│   ├── SECURITY.md                 # 安全指南
│   ├── SUPPORT.md                  # 支持文档
│   ├── CODE_OF_CONDUCT.md          # 行为准则（Contributor Covenant 2.1）
│   ├── PULL_REQUEST_TEMPLATE.md    # PR 模板
│   ├── FUNDING.yml                 # 赞助配置
│   └── ISSUE_TEMPLATE/             # Issue 模板（bug_report / feature_request）
├── openspec/                       # 项目规范文档
│   ├── SPEC.md                     # 项目规范（本文件）
│   ├── TASKS.md                    # 任务清单
│   ├── CHECKLIST.md                # 质量检查清单
│   └── config.yaml                 # 规范配置
├── scripts/                        # 构建/校验脚本
│   └── check-locales.mjs           # 国际化键覆盖校验（pnpm check:locales）
├── public/                         # 静态资源
│   ├── assets/icons/               # PWA 图标（72x72 ~ 512x512）
│   ├── domains.txt                 # 本地域名列表（供前端加载）
│   ├── whitelist.txt               # 白名单文件
│   ├── manifest.json               # Web 应用清单
│   ├── service-worker.js           # Service Worker
│   ├── adguard.txt                 # 预生成 AdGuard 格式
│   ├── dnsmasq.conf                # 预生成 Dnsmasq 格式
│   ├── hosts.txt                   # 预生成 Hosts 格式
│   ├── unbound.conf                # 预生成 Unbound 格式（local-zone refuse）
│   ├── pihole.txt                  # 预生成 Pi-hole 格式（0.0.0.0 gravity）
│   ├── rpz.db                      # 预生成 Bind RPZ 格式
│   └── smartdns.conf               # 预生成 SmartDNS 格式（address /domain/#）
├── src/                            # Next.js 源代码
│   ├── app/                        # App Router 目录
│   │   ├── page.tsx                # 主页面入口
│   │   ├── Home.tsx                # 主组件（组合各业务组件与 hook）
│   │   ├── globals.css             # 全局样式（CSS 变量 + Tailwind + 业务组件）
│   │   ├── layout.tsx              # 根布局（Metadata + SEO + 安全头部接入）
│   │   ├── robots.ts               # 自动生成 robots.txt（含 sitemap 索引）
│   │   └── sitemap.ts              # 自动生成 sitemap.xml
│   ├── components/                 # 业务组件
│   │   ├── ui/                     # shadcn/ui 基础组件
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── DropdownMenu.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Label.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Switch.tsx
│   │   │   ├── Tabs.tsx
│   │   │   └── Toast.tsx
│   │   ├── Header.tsx              # 页头（Shield 图标 + 语言/主题切换）
│   │   ├── Footer.tsx              # 页脚（链接 + 使用说明）
│   │   ├── InputEditor.tsx          # 域名编辑器子组件
│   │   ├── InputPanel.tsx          # 输入面板（域名编辑 + URL 导入）
│   │   ├── OutputPanel.tsx         # 输出面板（规则预览 + 设置）
│   │   ├── SettingsPanel.tsx       # 设置面板子组件
│   │   └── UrlSection.tsx          # URL 导入区域子组件
│   ├── config/
│   │   ├── index.ts                # 应用配置（预设源 URL、多镜像）
│   │   └── version.ts              # 版本号单一来源（APP_VERSION，派生自 package.json）
│   ├── context/
│   │   └── AppContext.tsx          # 应用上下文（集中提供 i18n 翻译 t）
│   ├── hooks/                      # 自定义 Hooks
│   │   ├── useDomainData.ts        # 域名数据管理
│   │   ├── useLanguage.ts          # 语言切换
│   │   ├── useRules.ts             # 规则生成
│   │   ├── useTheme.ts             # 主题切换
│   │   ├── useUrlManager.ts        # URL 管理
│   │   ├── useSettings.ts          # 设置管理
│   │   └── useLoading.ts           # 加载状态管理
│   ├── lib/
│   │   └── utils.ts                # 工具函数（cn 等）
│   ├── locales/                    # 国际化翻译文件（16 种语言）
│   │   ├── ar.json, cs.json, en.json, es.json
│   │   ├── hi.json, id.json, it.json, nl.json
│   │   ├── pl.json, ru.json, sv.json, th.json
│   │   ├── tr.json, vi.json, zh-cn.json, zh-tw.json
│   ├── types/
│   │   └── index.ts                # TypeScript 类型定义
│   └── utils/                      # 工具函数
│       ├── domainValidator.ts      # 域名验证与行解析
│       ├── domainFetch.ts          # 远程域名列表拉取（超时/兜底/体积上限）
│       ├── parser.ts               # 域名解析器（行级解析、提取域名）
│       ├── sortDedupe.ts           # 域名排序与去重（纯函数）
│       ├── rulesGenerator.ts       # 规则生成器（Dnsmasq/Hosts/AdGuard/白名单）
│       ├── rulesGenerator.test.ts  # 规则生成器单元测试（Vitest）
│       ├── fileUtils.ts            # 文件操作（下载、复制、URL 获取）
│       ├── i18n.ts                 # 国际化配置
│       └── uiUtils.ts              # UI 工具（行号生成、滚动同步）
├── prototype/                        # 原型目录（高保真可交互 + 真实数据 + 设计规范）
│   ├── index.html                   # 高保真原型（独立 HTML，极简风格/真实数据/响应式，可直接浏览器打开）
│   ├── README.md                    # 原型总览与设计规范索引
│   └── shadcn/                       # 设计规范（单一来源，对齐 globals.css token）
│       ├── design-system.md          # 设计系统（色彩/字体/间距/图标/动效）
│       ├── component-library.md      # 组件库（基础/复合/业务组件）
│       └── interaction-standards.md  # 交互标准（模式/反馈/错误/空状态）
├── .eslintrc.json                  # ESLint 配置
├── .gitignore                      # Git 忽略配置
├── components.json                 # shadcn/ui 配置
├── next.config.js                  # Next.js 配置（安全头部）
├── next-env.d.ts                   # Next.js 环境类型定义
├── package.json                    # 项目配置和依赖
├── postcss.config.js               # PostCSS 配置
├── tailwind.config.js              # Tailwind CSS 配置
├── tsconfig.json                   # TypeScript 配置
├── vitest.config.ts                # Vitest 单元测试配置
└── pnpm-lock.yaml                  # pnpm 锁定文件
```

## 3. 域名格式规范

### 3.1 domains.txt 格式

| 前缀 | 含义 | 示例 |
|------|------|------|
| 无前缀 | 黑名单，阻止解析 | `ad.example.com` |
| `+` | 白名单，允许通过 | `+api.example.com` |
| `!` | 注释域名 | `!commented.example.com` |
| `@` | 自定义 DNS 指向 | `@example.com=0.0.0.0` |
| `#` | 注释行 | `# 这是注释` |

### 3.2 输出格式

| 格式 | 规则示例 | 白名单示例 |
|------|----------|------------|
| Dnsmasq | `address=/example.com/127.0.0.1` | `server=/example.com/` |
| Hosts | `127.0.0.1 example.com` | `# 已白名单: example.com` |
| AdGuard | `\|\|example.com^` | `@@\|\|example.com^` |

## 4. Web 管理工具功能

### 4.1 输入功能

| 功能 | 说明 |
|------|------|
| URL 导入 | 从远程 URL 获取域名列表（带超时控制 10s） |
| 预设源 | 内置数据、AdGuard、EasyList、NeoHosts |
| 手动编辑 | 直接在文本框编辑域名 |
| 本地加载 | 自动加载 domains.txt 文件 |
| 多格式解析 | 输入支持 hosts / dnsmasq / AdGuard / 纯域名混合，`parseDomainLine` 逐行识别格式并提取域名、白名单(`+domain`)、自定义 DNS(`@domain=ip`)、注释(`#`) |
| 格式转换 | 粘贴任意格式清单，自动解析为统一域名条目结构后再输出为目标格式，实现不同格式互转 |
| 自动保存 | 每 30 秒自动保存到 localStorage |
| 自动恢复 | 页面加载时恢复未保存内容 |
| 隐私统计 | 可选接入 Google Analytics 4（衡量 ID 经 `NEXT_PUBLIC_GA_MEASUREMENT_ID` 注入，留空不启用；CSP 已放通 gtag 域名） |

### 4.2 输出功能

| 功能 | 说明 |
|------|------|
| Dnsmasq 格式 | `address=/domain/IP` |
| Hosts 格式 | `IP domain` |
| AdGuard 格式 | `\|\|domain^` |
| 白名单格式 | `@@\|\|domain^` |
| 九种目标格式 | Dnsmasq / Hosts / AdGuard / 白名单 / Unbound / Pi-hole / 纯域名 / Bind RPZ / SmartDNS，由统一中间结构生成 |
| 头部注释 | 自动生成项目信息头 |
| 一键下载 | 下载生成的文件 |
| 剪贴板复制 | 复制生成的内容 |

### 4.3 选项设置

| 设置项 | 默认值 |
|--------|--------|
| 项目名称 | DNS Shield |
| 版本号 | 3.9.6 |
| IPv4 目标 IP | 127.0.0.1 |
| IPv6 目标 IP | :: |
| 添加头部注释 | 开启 |
| 阻止 IPv6 | 关闭 |
| 自动去重 | 开启 |
| 移除通配符前缀 | 开启 |

## 5. 维护流程

### 5.1 新增规则

1. 编辑 `public/domains.txt`，添加新域名
2. 启动开发服务器：`pnpm dev`
3. 访问 http://localhost:8082
4. 加载 `domains.txt` 或手动输入
5. 配置输出选项
6. 点击"生成规则"
7. 下载更新后的文件

### 5.2 更新周期

- 每 2 周检查一次规则有效性
- 重要广告域名应及时更新

## 6. 路由器兼容列表

| 路由器/固件 | 支持格式 | 说明 |
|-------------|----------|------|
| Merlin (华硕) | Dnsmasq | 软件中心 → DNS 设置 |
| OpenWrt | Dnsmasq | 服务 → DHCP 和 DNS |
| 小米路由器 | Hosts | 广告拦截设置 |
| 华硕路由器 | Hosts | 自定义 hosts |
| TP-Link | Hosts | 自定义 hosts |

## 7. Git 提交规范

```
feat:     添加 xx 域名过滤
fix:      修复 xx 规则
docs:     更新文档
chore:    更新 Web 管理工具
refactor: 优化规则生成逻辑
```

## 8. 版本管理

使用 [SemVer](https://semver.org/) 格式: `v1.1.2`

| 版本类型 | 说明 |
|----------|------|
| 主版本号 (MAJOR) | 重大规则变更/格式变化 |
| 次版本号 (MINOR) | 新增功能/规则 |
| 修订号 (PATCH) | 规则修正/优化 |

## 9. 依赖关系

### 9.1 核心依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| next | ^14.2.25 | Next.js 框架（已固定至含安全补丁的版本） |
| react | ^18 | React 核心库 |
| react-dom | ^18 | React DOM 库 |
| sonner | ^2.0.7 | Toast 通知 |
| @radix-ui/react-checkbox | ^1.0.4 | Checkbox 组件 |
| @radix-ui/react-dropdown-menu | ^2.0.6 | 下拉菜单组件 |
| @radix-ui/react-label | ^2.0.2 | Label 组件 |
| @radix-ui/react-select | ^2.0.0 | Select 组件 |
| @radix-ui/react-slot | ^1.0.2 | Slot 组件 |
| @radix-ui/react-switch | ^1.0.3 | Switch 组件 |
| @radix-ui/react-tabs | ^1.0.4 | Tabs 组件 |
| @radix-ui/react-toast | ^1.1.5 | Toast 组件 |
| lucide-react | ^0.312.0 | 图标库 |
| tailwind-merge | ^2.2.0 | Tailwind 类合并 |
| class-variance-authority | ^0.7.0 | 组件变体管理 |
| clsx | ^2.1.0 | 条件类名 |

### 9.2 开发依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| @types/node | ^24.0.0 | Node.js 类型定义（匹配运行环境 Node 24） |
| @types/react | ^18 | React 类型定义 |
| @types/react-dom | ^18 | React DOM 类型定义 |
| autoprefixer | ^10.4.19 | CSS 自动前缀 |
| eslint | ^8 | 代码质量检查 |
| eslint-config-next | ^14 | Next.js ESLint 配置 |
| postcss | ^8.4.38 | CSS 处理工具 |
| tailwindcss | ^3.4.3 | 实用优先 CSS 框架 |
| tailwindcss-animate | ^1.0.7 | Tailwind 动画插件 |
| typescript | ^5 | TypeScript 语言 |
| vitest | ^2.1.9 | 单元测试框架 |

### 9.3 预设源 URL

| 预设源 | URL |
|--------|-----|
| 内置数据 | https://raw.githubusercontent.com/sutchan/DNS_Shield/main/public/domains.txt |
| AdGuard DNS Filter | https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_15_DnsFilter/filter.txt |
| EasyList | https://easylist-downloads.adblockplus.org/easylist.txt |
| NeoHosts | https://raw.githubusercontent.com/neoHosts/neoHosts/master/data/adblock.txt |

## 10. 浏览器兼容性

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 11. 已知限制

- 部分广告域名使用 HTTPS 硬编码，需配合 Pi-hole 或广告屏蔽插件
- 部分设备可能有 hosts 文件大小限制
- 需要定期更新规则以应对新广告形式

## 12. 安全规范

### 12.1 HTTP 安全头部

| 头部 | 值 | 说明 |
|------|-----|------|
| Content-Security-Policy | default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; img-src 'self' data: https: blob: https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https:; frame-src 'none'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; worker-src 'self' blob:; upgrade-insecure-requests; require-trusted-types-for 'script' | 内容安全策略，防止 XSS 和数据注入 |
| Strict-Transport-Security | max-age=63072000; includeSubDomains; preload | HSTS，强制 HTTPS |
| Cross-Origin-Opener-Policy | same-origin | 防止跨窗口攻击 |
| Cross-Origin-Resource-Policy | same-origin | 限制跨域资源加载 |
| X-Content-Type-Options | nosniff | 防止 MIME 嗅探 |
| X-Frame-Options | DENY | 防止点击劫持 |
| Referrer-Policy | strict-origin-when-cross-origin | 控制 Referrer 信息泄露 |

### 12.2 Service Worker 安全

- 仅缓存同源 GET 请求
- 按文件扩展名白名单过滤（.js/.css/.png/.jpg/.svg/.woff2 等）
- 不缓存跨域资源或 API 请求
- 缓存名称包含版本号，便于版本更新时清理

### 12.3 文件操作安全

- `sanitizeFilename()` 函数过滤危险字符（路径分隔符、控制字符等）
- 限制文件名最大长度（255 字符）
- 防止路径遍历攻击（../、..\\）
- 文件名仅允许字母、数字、点、下划线、连字符

## 12. 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v3.7.12 | 2026-08-09 | 文档同步与完善：统一全项目版本号至 v3.7.12；修正 openspec/config.yaml 版本、README.en 域名数与预设源、DEPLOYMENT Dockerfile(pnpm)、CONTRIBUTING 开发命令(pnpm)；对齐各文档与实际代码 |
| v3.7.10 | 2026-08-09 | 修复 AdGuard 输出 IPv6 通配符前缀、Service Worker 缓存键改用 env.version、补充 fileUtils 流式读取单测；统一全项目版本号至 v3.7.10 |
| v3.7.0 | 2026-07-21 | 安全与性能加固：fetchFromUrl 增加 10MB 响应体积上限（流式读取防大响应 DoS）、fetchFromUrls 改为并发抓取（Promise.allSettled）；补充 fileUtils 单元测试（体积上限/非法 URL/HTTP 错误/并发容错）；i18n 16 语言键 100% 覆盖验证；统一全项目版本号至 v3.7.0 |
| v3.6.1 | 2026-07-21 | 全项目代码审查与质量对齐：TypeScript 严格类型检查、ESLint、Vitest(31 项) 全部通过；i18n 16 种语言键全覆盖并验证多语言切换；parser.sortDomains 性能优化（Schwartzian 变换）；新增 rulesGenerator 单元测试覆盖核心规则生成；对齐 openspec/prototype 规范；统一全项目版本号至 v3.6.1 |
| v3.6.0 | 2026-07-21 | 增量版本对齐：代码与文档版本号统一至 v3.6.0（未单独记录变更日志） |
| v3.5.0 | 2026-07-17 | 安全加固：Service Worker 缓存策略优化（同源+扩展名白名单）、CSP 增强（frame-ancestors/worker-src）、新增 HSTS/COOP/CORP 安全头部、文件名安全验证（sanitizeFilename）；Badge 组件新增 success/warning 变体、Button 组件新增 loading 状态；设计系统文档同步更新（HSL 色彩空间修正）；README/CHANGELOG/openspec 规范文档全面同步更新；全项目版本号统一至 v3.5.0 |
| v3.4.0 | 2026-07-03 | 项目目录整理：移除冗余文件，shadcn/ 归入 prototype/ 统一管理；完善 GitHub Issue 模板配置；根目录新增 CHANGELOG.md |
| v3.3.0 | 2026-07-03 | 完成 4 个超过 200 行文件的模块拆分；新增 SettingsPanel/UrlSection/useSettings/useLoading 模块；移除所有 i18n 翻译中的 emoji 图标；版本统一 v3.4.0 |
| v3.2.0 | 2026-07-03 | 新增 domainValidator.ts/InputEditor.tsx 模块拆分；清理废弃 i18n 键；版本统一 v3.2.0 |
| v3.1.0 | 2026-06-30 | 添加 Accordion 组件，完善按钮点击缩放和面板悬停浮起动效 |
| v3.0.0 | 2026-06-30 | 设计系统全面重构：oklch 色彩空间、Swiss Precision 排版、Apple 风格动效曲线 |
| v2.3.2 | 2024-06-19 | 添加缺失国际化翻译键，创建 openspec 规范文档 |
| v2.3.0 | 2024-06-19 | 合并 trae/solo-agent 分支，添加 shadcn/ui，安全加固 |
