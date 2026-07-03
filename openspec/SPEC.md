# DNS Shield 项目规范

## 1. 项目概述

| 属性 | 值 |
|------|-----|
| 项目名称 | DNS Shield |
| 项目类型 | DNS 广告过滤规则库 + Web 管理工具 |
| 核心功能 | 基于 dnsmasq/hosts 的路由器全局广告防护 |
| 目标用户 | 使用梅林/OpenWrt/小米/华硕/TP-Link 等路由器的用户 |
| 项目地址 | https://github.com/sutchan/DNS_Shield |
| 演示地址 | https://dns.ewuse.com/ |
| 当前版本 | v3.1.0 |
| 拦截域名 | 425+ (本地) / 6766+ (含预设源) |
| 技术栈 | Next.js 14 + React 18 + TypeScript 5 + Tailwind CSS 3.4 |
| UI 框架 | shadcn/ui + Radix UI + Lucide Icons |
| 通知组件 | sonner |
| 国际化 | 16 种语言 |

## 2. 文件结构

```
dns-shield/
├── docs/                           # 文档目录
│   ├── README.md                   # 中文说明文档
│   ├── README.en.md                # 英文说明文档
│   ├── CHANGELOG.md                # 变更日志
│   ├── CONTRIBUTING.md             # 贡献指南
│   ├── DEPLOYMENT.md               # 部署指南
│   ├── SECURITY.md                 # 安全指南
│   ├── SUPPORT.md                  # 支持文档
│   └── security_best_practices_report.md  # 安全审查报告 v3.1.0
├── openspec/                       # 项目规范文档
│   ├── SPEC.md                     # 项目规范（本文件）
│   ├── TASKS.md                    # 任务清单
│   ├── CHECKLIST.md                # 质量检查清单
│   └── config.yaml                 # 规范配置
├── public/                         # 静态资源
│   ├── assets/icons/               # PWA 图标（72x72 ~ 512x512）
│   ├── domains.txt                 # 本地域名列表（供前端加载）
│   ├── whitelist.txt               # 白名单文件
│   ├── manifest.json               # Web 应用清单
│   ├── service-worker.js           # Service Worker
│   ├── adguard.txt                 # 预生成 AdGuard 格式
│   ├── dnsmasq.conf                # 预生成 Dnsmasq 格式
│   └── hosts.txt                   # 预生成 Hosts 格式
├── src/                            # Next.js 源代码
│   ├── app/                        # App Router 目录
│   │   ├── page.tsx                # 主页面入口
│   │   ├── Home.tsx                # 主组件（包含所有功能逻辑）
│   │   ├── globals.css             # 全局样式（CSS 变量 + Tailwind + 业务组件）
│   │   └── layout.tsx              # 根布局（Metadata + SEO）
│   ├── components/                 # 业务组件
│   │   ├── ui/                     # shadcn/ui 基础组件
│   │   │   ├── Accordion.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── DropdownMenu.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Label.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Switch.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Tooltip.tsx
│   │   ├── Header.tsx              # 页头（Shield 图标 + 语言/主题切换）
│   │   ├── Footer.tsx              # 页脚（链接 + 使用说明）
│   │   ├── InputPanel.tsx          # 输入面板（域名编辑 + URL 导入）
│   │   └── OutputPanel.tsx         # 输出面板（规则预览 + 设置）
│   ├── config/
│   │   └── index.ts                # 应用配置（预设源 URL）
│   ├── hooks/                      # 自定义 Hooks
│   │   ├── useDomainData.ts        # 域名数据管理
│   │   ├── useLanguage.ts          # 语言切换
│   │   ├── useRules.ts             # 规则生成
│   │   ├── useTheme.ts             # 主题切换
│   │   └── useUrlManager.ts        # URL 管理
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
│       ├── fileUtils.ts            # 文件操作（下载、复制、URL 获取）
│       ├── i18n.ts                 # 国际化配置
│       ├── parser.ts               # 域名解析器
│       ├── rulesGenerator.ts       # 规则生成器
│       └── uiUtils.ts              # UI 工具（行号生成、滚动同步）
├── prototype/                        # 原型目录
│   ├── prototype.canvas.tsx          # 高保真原型
│   ├── design-system.md              # 设计系统规范
│   └── component-library.md          # 组件库规范
├── shadcn/                           # shadcn 设计规范
│   ├── design-system.md              # 设计系统（色彩/字体/间距/动效）
│   ├── component-library.md          # 组件库（基础/复合/业务组件）
│   └── interaction-standards.md      # 交互标准（模式/反馈/错误/空状态）
├── .env.local                      # 本地环境变量
├── .eslintrc.json                  # ESLint 配置
├── .gitignore                      # Git 忽略配置
├── components.json                 # shadcn/ui 配置
├── next.config.js                  # Next.js 配置（安全头部）
├── next-env.d.ts                   # Next.js 环境类型定义
├── package.json                    # 项目配置和依赖
├── postcss.config.js               # PostCSS 配置
├── tailwind.config.js              # Tailwind CSS 配置
├── tsconfig.json                   # TypeScript 配置
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
| 自动保存 | 每 30 秒自动保存到 localStorage |
| 自动恢复 | 页面加载时恢复未保存内容 |

### 4.2 输出功能

| 功能 | 说明 |
|------|------|
| Dnsmasq 格式 | `address=/domain/IP` |
| Hosts 格式 | `IP domain` |
| AdGuard 格式 | `\|\|domain^` |
| 白名单格式 | `@@\|\|domain^` |
| 头部注释 | 自动生成项目信息头 |
| 一键下载 | 下载生成的文件 |
| 剪贴板复制 | 复制生成的内容 |

### 4.3 选项设置

| 设置项 | 默认值 |
|--------|--------|
| 项目名称 | DNS Shield |
| 版本号 | 3.1.0 |
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
| next | ^14 | Next.js 框架 |
| react | ^18 | React 核心库 |
| react-dom | ^18 | React DOM 库 |
| sonner | ^2.0.7 | Toast 通知 |
| @radix-ui/* | various | shadcn/ui 基础组件 |
| lucide-react | ^0.312.0 | 图标库 |
| tailwind-merge | ^2.2.0 | Tailwind 类合并 |
| class-variance-authority | ^0.7.0 | 组件变体管理 |
| clsx | ^2.1.0 | 条件类名 |

### 9.2 开发依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| @types/node | ^25.5.0 | Node.js 类型定义 |
| @types/react | ^18 | React 类型定义 |
| @types/react-dom | ^18 | React DOM 类型定义 |
| autoprefixer | ^10.4.19 | CSS 自动前缀 |
| eslint | ^8 | 代码质量检查 |
| eslint-config-next | ^14 | Next.js ESLint 配置 |
| postcss | ^8.4.38 | CSS 处理工具 |
| tailwindcss | ^3.4.3 | 实用优先 CSS 框架 |
| tailwindcss-animate | ^1.0.7 | Tailwind 动画插件 |
| typescript | ^5 | TypeScript 语言 |

### 9.3 预设源 URL

| 预设源 | URL |
|--------|-----|
| 内置数据 | https://raw.githubusercontent.com/sutchan/DNS_Shield/main/domains.txt |
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

## 12. 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v3.1.0 | 2026-06-30 | 添加 Accordion 组件，完善按钮点击缩放和面板悬停浮起动效 |
| v3.0.0 | 2026-06-30 | 设计系统全面重构：oklch 色彩空间、Swiss Precision 排版、Apple 风格动效曲线 |
| v2.3.2 | 2024-06-19 | 添加缺失国际化翻译键，创建 openspec 规范文档 |
| v2.3.0 | 2024-06-19 | 合并 trae/solo-agent 分支，添加 shadcn/ui，安全加固 |
