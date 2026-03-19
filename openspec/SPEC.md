# DNS Shield 项目规范

## 1. 项目概述

| 属性 | 值 |
|------|-----|
| 项目名称 | DNS Shield |
| 项目类型 | DNS 广告过滤规则库 |
| 核心功能 | 基于 dnsmasq/hosts 的路由器广告过滤 |
| 目标用户 | 使用梅林/OpenWrt/小米/华硕/TP-Link 等路由器的用户 |
| 项目地址 | https://github.com/sutchan/DNS_Shield |
| 演示地址 | https://dns.ewuse.com/ |
| 当前版本 | v1.0.7 |
| 拦截域名 | 448+ (本地) / 6766+ (含预设源) |

## 2. 文件结构

```
dns-shield/
├── README.md                      # 中文说明文档（默认）
├── README.en.md                   # 英文说明文档
├── README.zh-CN.md                # 简体中文说明文档
├── domains.txt                    # 原始域名清单（唯一数据源）
├── dnsmasq.conf                  # Dnsmasq 过滤列表
├── hosts.txt                      # Hosts 文件
├── index.html                     # Web 管理界面
├── CHANGELOG.md                  # 变更日志
├── .gitignore                    # Git 忽略配置
├── assets/                       # 资源目录
│   ├── js/
│   │   ├── app.js               # 主逻辑（入口）
│   │   ├── i18n.js              # 国际化模块
│   │   ├── utils.js             # 工具函数
│   │   ├── core.js              # 核心状态管理
│   │   ├── parser.js            # 域名解析
│   │   ├── generator.js         # 规则生成
│   │   ├── ui-urls.js           # URL 管理交互
│   │   ├── ui-editor.js         # 编辑器交互
│   │   └── ui-controls.js       # 控件交互
│   └── css/
│       ├── styles.css            # 样式入口
│       ├── variables.css         # CSS 变量
│       ├── layout.css            # 布局样式
│       ├── components.css        # 组件样式
│       ├── editor.css            # 编辑器样式
│       └── utilities.css         # 工具类
└── openspec/                     # 项目规范文档
    ├── SPEC.md                   # 项目规范（本文件）
    ├── TASKS.md                  # 任务清单
    └── CHECKLIST.md              # 质量检查清单
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
                   │ index.html  │
                   │ (Web 管理工具)│
                   └───────────────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                                 ▼
   ┌─────────────────┐           ┌─────────────────┐
   │   dnsmasq.conf  │           │    hosts.txt    │
   │  (Dnsmasq 格式) │           │   (Hosts 格式)  │
   └─────────────────┘           └─────────────────┘
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

### 5.1 输入功能

| 功能 | 说明 |
|------|------|
| URL 导入 | 从远程 URL 获取域名列表 |
| 预设源 | AdGuard、EasyList、NeoHosts、本地（小米） |
| 手动编辑 | 直接在文本框编辑域名 |
| 本地加载 | 加载本地 domains.txt 文件 |

### 5.2 输出功能

| 功能 | 说明 |
|------|------|
| Dnsmasq 格式 | `address=/domain/IP` |
| Hosts 格式 | `IP domain` |
| AdGuard 格式 | `\|\|domain^` |
| 混合输出 | 同时输出多种格式 |
| 头部注释 | 自动生成项目信息头 |
| 一键下载 | 下载生成的文件 |
| 剪贴板复制 | 复制生成的内容 |

### 5.3 选项设置

| 设置项 | 默认值 |
|--------|--------|
| 项目名称 | DNS Shield |
| 版本号 | 1.0.6 |
| IPv4 目标 IP | 127.0.0.1 |
| IPv6 目标 IP | :: |
| 添加头部注释 | 开启 |
| 阻止 IPv6 | 开启 |
| 自动去重 | 开启 |
| 移除通配符前缀 | 开启 |

## 6. 维护流程

### 6.1 新增规则

1. 编辑 `domains.txt`，添加新域名
2. 打开 `index.html`
3. 加载 `domains.txt` 或手动输入
4. 配置输出选项
5. 点击"生成规则"
6. 下载更新后的文件

### 6.2 同步更新

1. 访问公开域名列表 URL
2. 导入到管理工具
3. 合并去重
4. 下载更新后的文件

### 6.3 更新周期

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

使用 [SemVer](https://semver.org/) 格式: `v1.0.7`

| 版本类型 | 说明 |
|----------|------|
| 主版本号 (MAJOR) | 重大规则变更/格式变化 |
| 次版本号 (MINOR) | 新增功能/规则 |
| 修订号 (PATCH) | 规则修正/优化 |

## 10. 依赖关系

```
index.html (纯静态，无需服务器)
    │
    ├── domains.txt                ← 数据源
    │
    ├── assets/js/
    │   ├── i18n.js              ← 国际化
    │   ├── utils.js              ← 工具函数
    │   ├── core.js               ← 状态管理
    │   ├── parser.js             ← 域名解析
    │   ├── generator.js          ← 规则生成
    │   ├── ui-urls.js           ← URL 管理交互
    │   ├── ui-editor.js         ← 编辑器交互
    │   ├── ui-controls.js       ← 控件交互
    │   └── app.js               ← 主逻辑入口
    │
    ├── assets/css/
    │   ├── styles.css            ← 样式入口
    │   ├── variables.css         ← CSS 变量
    │   ├── layout.css            ← 布局样式
    │   ├── components.css        ← 组件样式
    │   ├── editor.css            ← 编辑器样式
    │   └── utilities.css         ← 工具类
    │
    └── 预设源 URL
        ├── AdGuard DNS Filter (https://adguardteam.github.io/AdGuardSDNSFilter/)
        ├── EasyList (https://easylist.to/easylist/)
        └── NeoHosts (https://github.com/neo-forte/neo-forte)
```

## 11. 浏览器兼容性

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 12. 已知限制

- 部分广告域名使用 HTTPS 硬编码，需配合 Pi-hole 或广告屏蔽插件
- 部分设备可能有 hosts 文件大小限制
- 需要定期更新规则以应对新广告形式
