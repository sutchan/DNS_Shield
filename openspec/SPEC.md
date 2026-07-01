# DNS Shield - 技术规格说明书

> 版本: v2.3.1 | 最后更新: 2024-06-22 | 状态: 有效

---

## 1. 项目概述

### 1.1 项目名称与类型
- **项目名称**: DNS Shield
- **项目类型**: Web 应用（Next.js）
- **版本**: v2.3.1
- **描述**: 路由器级全局广告过滤规则生成工具

### 1.2 核心功能
DNS Shield 是一个在线工具，用于生成路由器级别的广告过滤规则，支持：
- 从预设源或自定义 URL 加载域名列表
- 支持 Dnsmasq、Hosts、AdGuard 三种规则格式
- 域名解析、排序、去重
- 一键复制或下载生成的规则文件

### 1.3 目标用户
- 路由器用户（梅林固件、小米路由器、OpenWrt）
- 需要生成广告过滤规则的技术用户
- 网络管理员

---

## 2. 技术架构

### 2.1 技术栈
| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js | ^14 |
| UI 库 | React | ^18 |
| 语言 | TypeScript | ^5 |
| 样式 | Tailwind CSS + CSS Variables | ^3.4 |
| UI 组件 | shadcn/ui + Radix UI | - |
| 图标 | Lucide React | ^0.312 |
| 构建工具 | Next.js + PostCSS | - |

### 2.2 目录结构
```
/workspace/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── Home.tsx           # 主页面组件
│   │   ├── page.tsx           # 页面入口
│   │   ├── layout.tsx         # 根布局
│   │   └── globals.css        # 全局样式 + CSS 变量
│   ├── components/
│   │   ├── ui/                # shadcn/ui 基础组件
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Switch.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── DropdownMenu.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Label.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Accordion.tsx
│   │   │   └── Loading.tsx
│   │   ├── Header.tsx         # 页头组件
│   │   ├── Footer.tsx         # 页脚组件
│   │   ├── InputPanel.tsx     # 输入面板
│   │   └── OutputPanel.tsx    # 输出面板
│   ├── hooks/                 # React Hooks
│   │   ├── useDomainData.ts   # 域名数据管理
│   │   ├── useUrlManager.ts   # URL 管理
│   │   ├── useRules.ts        # 规则生成
│   │   ├── useTheme.ts        # 主题管理
│   │   └── useLanguage.ts     # 语言管理
│   ├── utils/                 # 工具函数
│   │   ├── fileUtils.ts       # 文件操作（下载、复制、URL 验证）
│   │   ├── uiUtils.ts         # UI 工具（行号生成）
│   │   ├── parser.ts          # 域名解析
│   │   ├── rulesGenerator.ts   # 规则生成
│   │   └── i18n.ts            # 国际化
│   ├── locales/               # 多语言文件
│   │   ├── zh-cn.json
│   │   ├── en.json
│   │   └── ... (15 种语言)
│   ├── types/                 # TypeScript 类型
│   │   └── index.ts
│   └── config/                # 配置文件
│       └── index.ts
├── prototype/                 # 设计资源
│   ├── DESIGN_SYSTEM.md       # 设计系统规范
│   ├── COMPONENT_LIBRARY.md   # 组件库规范
│   ├── INTERACTION_STANDARDS.md # 交互标准
│   └── prototype.html         # 高保真原型
├── docs/                      # 项目文档
│   ├── README.md / README.en.md
│   ├── CHANGELOG.md
│   └── ...
├── public/                    # 静态资源
│   ├── domains.txt           # 本地域名列表
│   ├── manifest.json          # PWA 配置
│   └── service-worker.js     # Service Worker
├── next.config.js             # Next.js 配置（含安全头部）
├── tailwind.config.js         # Tailwind CSS 配置
├── tsconfig.json              # TypeScript 配置
└── package.json               # 依赖配置
```

### 2.3 数据流
```
用户输入/URL → useDomainData → parseSource() → ParsedData
                                      ↓
                              Stats (domainCount, etc.)
                                      ↓
useRules ← Settings → rulesGenerator → outputContent
                                      ↓
                           OutputPanel (预览/下载/复制)
```

---

## 3. 功能规格

### 3.1 核心功能

#### F-001: 域名加载
- **描述**: 从预设源或自定义 URL 加载域名列表
- **预设源**:
  - EasyList: `https://easylist-downloads.adblockplus.org/easylist.txt`
  - EasyList China: `https://easylist-downloads.adblockplus.org/easylistchina+easylist.txt`
- **URL 验证**: 仅允许 http/https 协议，最大长度 2048 字符
- **超时控制**: 10 秒超时，使用 AbortController

#### F-002: 域名解析
- **描述**: 解析域名列表，区分黑名单/白名单
- **支持格式**:
  - 注释行（# 开头）
  - 域名格式
  - 空行过滤

#### F-003: 域名操作
- **排序**: 按字母顺序排序
- **去重**: 移除重复域名
- **清空**: 清空当前域名列表

#### F-004: 规则生成
- **支持格式**:
  - Dnsmasq: `address=/domain/0.0.0.0`
  - Hosts: `0.0.0.0 domain`
  - AdGuard: `||domain^$dnsrewrite=0.0.0.0`
- **配置选项**:
  - 自定义 IPv4 地址
  - 自定义 IPv6 地址
  - 添加文件头注释
  - 启用 IPv6 阻止
  - 去重域名
  - 移除通配符

#### F-005: 导出功能
- **复制**: 复制规则到剪贴板
- **下载**: 下载为 .conf / .txt 文件

#### F-006: 主题切换
- **模式**: 浅色 / 深色
- **实现**: CSS 变量 + data-theme 属性

#### F-007: 多语言支持
- **支持语言**: 15 种（中文、英文、日文、韩文、法文、德文等）
- **持久化**: localStorage 保存偏好

### 3.2 用户界面

#### UI-001: 页面结构
```
┌─────────────────────────────────────────────┐
│  Header (Logo + 语言 + 主题)                │
├──────────────────┬──────────────────────────┤
│  Input Panel     │  Output Panel            │
│  - URL 输入      │  - 格式选择              │
│  - 预设标签      │  - 规则预览              │
│  - 域名编辑器    │  - 下载/复制             │
│  - 操作按钮      │                          │
│  - 统计信息      │                          │
├──────────────────┴──────────────────────────┤
│  Settings Panel (可折叠)                     │
├─────────────────────────────────────────────┤
│  Footer (使用指南 + 链接)                    │
└─────────────────────────────────────────────┘
```

#### UI-002: 响应式断点
| 断点 | 布局 |
|------|------|
| < 640px | 单栏，移动端优化 |
| 640-1023px | 单栏，平板优化 |
| >= 1024px | 双栏，桌面端 |

### 3.3 数据类型

```typescript
interface ParsedData {
  domains: string[];      // 黑名单域名
  whitelist: string[];    // 白名单域名
  customDns: string[];    // 自定义 DNS
}

interface Stats {
  domainCount: number;
  validCount: number;
  commentCount: number;
  blacklistCount: number;
  whitelistCount: number;
}

interface Settings {
  projectName: string;
  version: string;
  ipv4: string;
  ipv6: string;
  addHeader: boolean;
  blockIPv6: boolean;
  dedupDomains: boolean;
  removeWildcard: boolean;
  dnsmasqFilename: string;
  hostsFilename: string;
  adguardFilename: string;
  whitelistFilename: string;
}

type OutputFormat = 'dnsmasq' | 'hosts' | 'adguard';
```

---

## 4. 安全规格

### 4.1 安全头部
在 `next.config.js` 中配置：
- Content-Security-Policy (CSP)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy

### 4.2 输入验证
- URL 协议限制: 仅 http/https
- URL 长度限制: 最大 2048 字符
- 域名格式验证: 正则表达式
- HTTP 请求超时: 10 秒

### 4.3 XSS 防护
- 使用 `innerText` 替代 `innerHTML`
- React 自动转义
- 避免 `dangerouslySetInnerHTML`

---

## 5. 性能规格

### 5.1 优化措施
- 域名解析使用 useCallback 缓存
- 本地存储自动保存（30 秒间隔）
- 域名列表虚拟化（大量域名时）
- 图片和静态资源优化

### 5.2 性能指标
| 指标 | 目标 |
|------|------|
| 首屏加载 | < 2s |
| 域名解析（1000条） | < 500ms |
| 规则生成 | < 200ms |

---

## 6. 可访问性规格

### 6.1 WCAG 2.1 AA 标准
- 颜色对比度 >= 4.5:1
- 触控目标 >= 44x44px
- 键盘导航支持
- 屏幕阅读器支持

### 6.2 ARIA 属性
- 语义化 HTML 标签
- 适当的 ARIA 标签
- 焦点管理

---

## 7. 浏览器支持

| 浏览器 | 最低版本 |
|--------|----------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

---

## 8. 部署规格

### 8.1 环境变量
| 变量 | 描述 |
|------|------|
| NEXT_PUBLIC_GOOGLE_VERIFICATION | Google Search Console 验证代码 |

### 8.2 构建命令
```bash
npm run build    # 生产构建
npm run start    # 生产服务器
npm run dev      # 开发服务器
```

### 8.3 端口配置
- 开发服务器: 8082

---

## 9. 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v2.3.1 | 2024-06-22 | 对齐设计规范，添加 Accordion 组件，完善交互动效，更新字体系统 |
| v2.3.0 | 2024-06-19 | 合并 trae/solo-agent-XM3tte，添加 shadcn/ui，安全加固 |
| v2.2.5 | 2024-06-17 | 设计系统完善，多语言支持 |
| v2.2.0 | 2024-06-15 | 初始功能实现 |

---

*本文档与原型 `prototype.html` 和设计系统 `DESIGN_SYSTEM.md` 保持同步*
