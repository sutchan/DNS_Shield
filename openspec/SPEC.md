# DNS Shield 项目规范

## 1. 项目概述

| 属性 | 值 |
|------|-----|
| 项目名称 | DNS Shield |
| 项目类型 | DNS 广告过滤规则库 |
| 核心功能 | 基于 dnsmasq/hosts 的路由器全局广告防护 |
| 目标用户 | 使用梅林/OpenWrt/小米/华硕/TP-Link 等路由器的用户 |
| 项目地址 | https://github.com/sutchan/DNS_Shield |
| 演示地址 | https://dns.ewuse.com/ |
| 当前版本 | v2.2.5 |
| 拦截域名 | 473+ (本地) / 6766+ (含预设源) |
| 支持语言 | 16种语言（中文、英文、阿拉伯文、捷克文、西班牙文、印地文、印尼文、意大利文、荷兰文、波兰文、瑞典文、泰文、土耳其文、俄文、越南文） |

## 2. 文件结构

```
dns-shield/
├── README.md                      # 中文说明文档（默认）
├── README.en.md                   # 英文说明文档
├── CONTRIBUTING.md                # 贡献指南
├── DEPLOYMENT.md                  # 部署指南
├── SECURITY.md                    # 安全指南
├── SUPPORT.md                     # 支持指南
├── domains.txt                    # 原始域名清单（唯一数据源）
├── dnsmasq.conf                  # Dnsmasq 过滤列表
├── hosts.txt                      # Hosts 文件
├── adguard.txt                    # AdGuard 过滤列表
├── adguard_whitelist.txt         # AdGuard 白名单
├── CHANGELOG.md                  # 变更日志
├── .gitignore                    # Git 忽略配置
├── package.json                  # 项目配置和依赖
├── next.config.js                # Next.js 配置
├── next-env.d.ts                 # Next.js 环境类型定义
├── tsconfig.json                 # TypeScript 配置
├── tailwind.config.js            # Tailwind CSS 配置
├── postcss.config.js             # PostCSS 配置
├── jest.config.js                # Jest 测试配置
├── DNS_Shield.code-workspace     # VS Code 工作区配置
├── src/                          # Next.js 源代码
│   ├── app/                      # App Router 目录
│   │   ├── page.tsx              # 主页面
│   │   ├── Home.tsx              # 主组件
│   │   ├── globals.css           # 全局样式
│   │   └── layout.tsx            # 布局组件
│   ├── components/               # 组件目录
│   │   ├── ui/                   # UI 组件
│   │   │   ├── Loading.tsx       # 加载组件
│   │   │   └── Toast.tsx         # 提示组件
│   │   ├── DomainList.tsx        # 域名列表组件
│   │   ├── ExportOptions.tsx     # 导出选项组件
│   │   ├── FilterControls.tsx    # 过滤控制组件
│   │   ├── Footer.tsx            # 页脚组件
│   │   ├── Header.tsx            # 头部组件
│   │   ├── InputPanel.tsx        # 输入面板组件
│   │   ├── OutputPanel.tsx       # 输出面板组件
│   │   └── WhiteListControls.tsx # 白名单控制组件
│   ├── config/                   # 配置目录
│   │   └── index.ts              # 应用配置
│   ├── hooks/                    # 自定义钩子
│   │   ├── useDomainData.ts      # 域名数据钩子
│   │   ├── useLanguage.ts        # 语言钩子
│   │   ├── useRules.ts           # 规则生成钩子
│   │   ├── useTheme.ts           # 主题钩子
│   │   └── useUrlManager.ts      # URL 管理钩子
│   ├── locales/                   # 语言翻译文件
│   │   ├── ar.json               # 阿拉伯文
│   │   ├── cs.json               # 捷克文
│   │   ├── en.json               # 英文
│   │   ├── es.json               # 西班牙文
│   │   ├── hi.json               # 印地文
│   │   ├── id.json               # 印尼文
│   │   ├── it.json               # 意大利文
│   │   ├── nl.json               # 荷兰文
│   │   ├── pl.json               # 波兰文
│   │   ├── sv.json               # 瑞典文
│   │   ├── th.json               # 泰文
│   │   ├── tr.json               # 土耳其文
│   │   ├── ru.json               # 俄文
│   │   ├── vi.json               # 越南文
│   │   ├── zh-cn.json            # 中文简体
│   │   └── zh-tw.json            # 中文繁體
│   ├── types/                    # 类型定义
│   │   └── index.ts              # 类型定义文件
│   ├── utils/                    # 工具函数
│   │   ├── fileUtils.ts          # 文件工具
│   │   ├── i18n.ts               # 国际化工具
│   │   ├── parser.ts             # 域名解析工具
│   │   ├── rulesGenerator.ts     # 规则生成工具
│   │   └── uiUtils.ts            # UI 工具
│   └── setupTests.ts             # 测试设置
├── public/                        # 公共静态资源
│   ├── assets/                    # 资源目录
│   │   └── icons/                # 应用图标
│   ├── domains.txt               # 公共域名清单（用于 Web 访问）
│   ├── manifest.json             # Web 应用清单
│   └── service-worker.js         # Service Worker
└── openspec/                     # 项目规范文档
    ├── SPEC.md                   # 项目规范（本文件）
    ├── TASKS.md                  # 任务清单
    ├── CHECKLIST.md              # 质量检查清单
    └── config.yaml               # 项目配置
```

## 3. 核心工作流程

```
┌─────────────────────────────────────────────────────────┐
│                    单一数据源原则                        │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
                   ┌───────────────┐
                   │ domains.txt   │
                   │ (唯一数据源)  │
                   └───────────────┘
                           │
                           ▼
                   ┌───────────────┐
                   │ Next.js App  │
                   │ (Web 管理工具)│
                   └───────────────┘
                           │
            ┌──────────────┴──────────────┐
            ▼           ▼           ▼
   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
   │   dnsmasq.conf  │ │    hosts.txt    │ │   adguard.txt   │
   │  (Dnsmasq 格式) │ │   (Hosts 格式)  │ │ (AdGuard 格式)  │
   └─────────────────┘ └─────────────────┘ └─────────────────┘
                           │
                           ▼
                   ┌───────────────┐
                   │ 白名单输出    │
                   └───────────────┘
                           │
                           ▼
                   ┌───────────────┐
                   │adguard_whitelist.txt │
                   │ (白名单格式)  │
                   └───────────────┘
```

## 4. 域名格式规范

### 4.1 原始域名格式 (domains.txt)

| 前缀 | 说明 | 示例 |
|------|------|------|
| 无 | 黑名单，阻止解析 | `ad.example.com` |
| `+` | 白名单，允许解析 | `+api.example.com` |
| `!` | 注释域名，显示用 | `!example.com` |
| `@` | 自定义 DNS 指向 | `@example.com=192.168.1.1` |

### 4.2 Dnsmasq 格式 (dnsmasq.conf)

```dnsmasq
address=/domain/0.0.0.0
address=/domain/::
```

### 4.3 Hosts 格式 (hosts.txt)

```hosts
0.0.0.0 domain
:: domain
```

### 4.4 AdGuard 格式 (adguard.txt)

```adguard
! DNS Shield - AdGuard Ad Block Filter
! Version: 1.0.7
! Description: AdGuard-compatible ad blocking filter
!
||example.com^
||advertising.com^
! 注释行以 ! 开头
||ad.doubleclick.net^
```

| 语法 | 说明 |
|------|------|
| `\|\|example.com^` | 阻止 `example.com` 及其所有子域名 |
| `\|\|example.com^$important` | 重要规则，优先级更高 |
| `@@\|\|example.com^` | 白名单，允许通过 |
| `!` 开头 | 注释行 |

## 5. Web 管理工具功能

### 5.1 架构设计

- **组件化架构**：将功能拆分为多个独立组件，如 Header、DomainList、ExportOptions 等
- **自定义钩子**：使用 React Hooks 管理状态和逻辑，如 useDomainData、useRules、useUrlManager 等
- **工具函数**：将域名解析、规则生成等逻辑提取为独立工具函数
- **配置管理**：集中管理应用配置和预设源 URL

### 5.2 输入功能

| 功能 | 说明 |
|------|------|
| URL 导入 | 从远程 URL 获取域名列表 |
| 预设源 | AdGuard、EasyList、NeoHosts、本地（小米） |
| 手动编辑 | 直接在文本框编辑域名 |
| 本地加载 | 加载本地 domains.txt 文件 |
| 白名单管理 | 独立的白名单编辑界面，支持导入/导出白名单 |
| 多语言支持 | 支持 16 种语言，可在界面上切换 |
| URL 管理 | 支持添加、排序、批量获取多个 URL |

### 5.3 输出功能

| 功能 | 说明 |
|------|------|
| Dnsmasq 格式 | `address=/domain/IP` |
| Hosts 格式 | `IP domain` |
| AdGuard 格式 | `\|\|domain^` |
| 白名单格式 | `+domain` |
| 混合输出 | 同时输出多种格式 |
| 头部注释 | 自动生成项目信息头 |
| 一键下载 | 下载生成的文件 |
| 剪贴板复制 | 复制生成的内容 |
| 实时预览 | 生成规则后实时预览输出结果 |

### 5.4 选项设置

| 设置项 | 默认值 |
|--------|--------|
| 项目名称 | DNS Shield |
| 版本号 | 2.2.3 |
| IPv4 目标 IP | 127.0.0.1 |
| IPv6 目标 IP | :: |
| 添加头部注释 | 开启 |
| 阻止 IPv6 | 开启 |
| 自动去重 | 开启 |
| 移除通配符前缀 | 开启 |

## 6. 维护流程

### 6.1 新增规则

1. 编辑 `domains.txt`，添加新域名
2. 启动开发服务器：`npm run dev` 或 `pnpm dev`
3. 访问本地开发地址（通常为 http://localhost:8081）
4. 加载 `domains.txt` 或手动输入
5. 配置输出选项
6. 点击"生成规则"
7. 下载更新后的文件

### 6.2 同步更新

1. 访问公开域名列表 URL
2. 导入到管理工具
3. 合并去重
4. 下载更新后的文件

### 6.3 代码维护

1. **组件维护**：修改对应组件文件，如 `src/components/` 目录下的组件
2. **逻辑维护**：更新对应的钩子函数，如 `src/hooks/` 目录下的钩子
3. **工具函数**：修改 `src/utils/` 目录下的工具函数
4. **配置更新**：修改 `src/config/index.ts` 中的配置
5. **测试**：运行 `npm test` 确保功能正常

### 6.4 更新周期

- 每2周检查一次规则有效性
- 重要广告域名应及时更新

## 7. 路由器兼容列表

| 路由器/固件 | 支持格式 | 说明 |
|-------------|----------|------|
| Merlin (华硕) | Dnsmasq | 软件中心 → DNS 设置 |
| OpenWrt | Dnsmasq | 服务 → DHCP 和 DNS |
| 小米路由器 | Hosts | 广告拦截设置 |
| 华硕路由器 | Hosts | 自定义 hosts |
| TP-Link | Hosts | 自定义 hosts |

## 8. Git 提交规范

```
feat:     添加 xx 域名过滤
fix:      修复 xx 规则
docs:     更新文档
chore:    更新 Web 管理工具
refactor: 优化规则生成逻辑
```

## 9. 版本管理

使用 [SemVer](https://semver.org/) 格式: `v1.1.2`

| 版本类型 | 说明 |
|----------|------|
| 主版本号 (MAJOR) | 重大规则变更/格式变化 |
| 次版本号 (MINOR) | 新增功能/规则 |
| 修订号 (PATCH) | 规则修正/优化 |

## 10. 依赖关系

### 10.1 核心依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| next | ^14 | Next.js 框架 |
| react | ^18 | React 核心库 |
| react-dom | ^18 | React DOM 库 |

### 10.2 开发依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| @babel/preset-env | ^7.29.2 | Babel 环境预设 |
| @babel/preset-react | ^7.28.5 | React Babel 预设 |
| @babel/preset-typescript | ^7.28.5 | TypeScript Babel 预设 |
| @testing-library/jest-dom | ^6.9.1 | Jest DOM 测试库 |
| @testing-library/react | ^16.3.2 | React 测试库 |
| @testing-library/user-event | ^14.6.1 | 用户事件测试库 |
| @types/jest | ^30.0.0 | Jest 类型定义 |
| @types/node | ^25.5.0 | Node.js 类型定义 |
| @types/react | ^18 | React 类型定义 |
| @types/react-dom | ^18 | React DOM 类型定义 |
| autoprefixer | ^10.4.19 | CSS 自动前缀 |
| babel-jest | ^30.3.0 | Babel Jest 集成 |
| eslint | ^8 | 代码质量检查 |
| eslint-config-next | ^14 | Next.js ESLint 配置 |
| identity-obj-proxy | ^3.0.0 | Jest 模块代理 |
| jest | ^30.3.0 | 测试框架 |
| jest-environment-jsdom | ^30.3.0 | JSDOM 测试环境 |
| postcss | ^8.4.38 | CSS 处理工具 |
| tailwindcss | ^3.4.3 | 实用优先 CSS 框架 |
| ts-jest | ^29.4.9 | TypeScript Jest 集成 |
| typescript | ^5 | TypeScript 语言 |

### 10.3 预设源 URL

| 预设源 | URL |
|--------|-----|
| AdGuard DNS Filter | https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_15_DnsFilter/filter.txt |
| EasyList | https://easylist-downloads.adblockplus.org/easylist.txt |
| NeoHosts | https://raw.githubusercontent.com/neoHosts/neoHosts/master/data/adblock.txt |

## 11. 浏览器兼容性

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 12. 已知限制

- 部分广告域名使用 HTTPS 硬编码，需配合 Pi-hole 或广告屏蔽插件
- 部分设备可能有 hosts 文件大小限制
- 需要定期更新规则以应对新广告形式
