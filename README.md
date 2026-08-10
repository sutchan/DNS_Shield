# DNS Shield - 路由器广告过滤工具

基于 DNS 的广告过滤规则库，通过路由器设置即可拦截广告和保护隐私。

## 功能简介

- **广告拦截** - 过滤网页广告、视频广告、App 广告
- **支付保护** - 屏蔽扫码支付跳转链接（微信、支付宝）
- **隐私防护** - 阻止追踪器和数据采集
- **多设备生效** - 路由器设置一次，所有连接设备自动生效
- **多种格式支持** - Dnsmasq、Hosts、AdGuard、白名单等格式
- **白名单管理** - 自定义白名单，避免误拦截关键服务
- **自定义 DNS 指向** - 支持 @domain=ip 语法，自定义域名解析
- **URL 导入** - 从远程 URL 获取域名列表（带超时控制）
- **预设数据源** - 内置 AdGuard、EasyList、NeoHosts 等预设
- **自动保存/恢复** - 每 30 秒自动保存内容到浏览器
- **国际化支持** - 支持 16 种语言，翻译键全覆盖并带 zh-cn 兜底
- **深色/浅色模式** - 一键切换主题配色
- **安全加固** - CSP 安全头部、HSTS、Service Worker 安全缓存策略、文件名安全验证
- **单元测试** - 基于 Vitest 覆盖核心纯函数（解析/校验/规则生成/国际化）

## 快速开始

### 第一步：下载过滤规则

根据你的路由器类型下载对应文件：

| 路由器 | 下载文件 |
|--------|----------|
| 梅林/OpenWrt | [dnsmasq.conf](public/dnsmasq.conf) |
| 小米/华硕/TP-Link | [hosts.txt](public/hosts.txt) |
| AdGuard 用户 | [adguard.txt](public/adguard.txt) |

### 第二步：导入路由器

**梅林固件（华硕）**
- 路径：软件中心 → DNS 设置 → 自定义 dnsmasq
- 将 `dnsmasq.conf` 内容复制到配置框中

**OpenWrt**
```bash
curl -sL https://raw.githubusercontent.com/sutchan/DNS_Shield/main/public/dnsmasq.conf >> /etc/dnsmasq.conf
```

**小米路由器**
- 路径：设置 → 广告拦截 → 自定义 hosts
- 导入 `hosts.txt`

详细设置方法请查看 [部署指南](DEPLOYMENT.md)。

## 在线工具

如需自定义域名列表或生成其他格式，可使用 Web 管理工具。

访问 [https://dns.ewuse.com](https://dns.ewuse.com/) 在线使用。

部署方法请查看 [部署指南](DEPLOYMENT.md)。

## 文件说明

| 文件 | 用途 |
|------|------|
| `dnsmasq.conf` | Dnsmasq 路由器格式 |
| `hosts.txt` | 标准 hosts 格式 |
| `adguard.txt` | AdGuard 格式 |
| `whitelist.txt` | 白名单（需要放行的域名） |
| `domains.txt` | 统一域名数据源 |

## 技术特性

- **Swiss Modernism 设计风格** - 现代化 UI/UX，Apple 设计精度
- **shadcn/ui 组件库** - 基于 Radix UI，可访问性强
- **响应式布局** - 完美支持桌面端和移动端
- **深色/浅色模式** - 支持一键主题切换
- **PWA 支持** - 可安装到桌面，离线可用
- **TypeScript** - 完整的类型安全
- **SSR** - Next.js 框架支持服务端渲染
- **16 种国际化语言** - 全球用户友好体验
- **模块化架构** - 清晰的分层文件结构
- **安全头部** - CSP、HSTS、COOP、CORP 等安全响应头
- **PWA 安全** - Service Worker 仅缓存同源静态资源，扩展名白名单过滤

## 项目结构

```
src/
├── app/              # Next.js App Router（布局、页面、全局样式）
├── components/       # React 组件
│   ├── ui/           # shadcn/ui 基础组件（12 个：Badge/Button/Card/Checkbox/DropdownMenu/Input/Label/Loading/Select/Switch/Tabs/Toast）
│   ├── Header.tsx    # 页头组件（主题/语言切换）
│   ├── Footer.tsx    # 页脚组件
│   ├── InputPanel.tsx # 输入面板
│   ├── InputEditor.tsx # 域名编辑器子组件（行号 + 自动保存）
│   ├── OutputPanel.tsx # 输出面板（格式切换 + 空状态）
│   ├── SettingsPanel.tsx # 设置面板子组件
│   └── UrlSection.tsx # URL 导入区域子组件
├── context/          # 应用上下文
│   └── AppContext.tsx # 集中提供 i18n 翻译 t（避免逐层透传）
├── hooks/            # 自定义 Hooks
│   ├── useTheme.ts   # 主题切换
│   ├── useLanguage.ts # 语言切换
│   ├── useDomainData.ts # 域名数据管理（含远端加载超时/兜底）
│   ├── useRules.ts   # 规则生成（实时解析同步）
│   ├── useUrlManager.ts # URL 管理
│   ├── useSettings.ts # 设置管理
│   └── useLoading.ts # 加载状态管理
├── lib/              # 工具库（cn 类名合并等）
├── locales/          # 16 种语言翻译文件（112 键 100% 覆盖）
├── types/            # TypeScript 类型定义
├── utils/            # 工具函数（含 *.test.ts 单元测试）
│   ├── parser.ts     # 域名解析与排序去重
│   ├── domainValidator.ts # 域名验证与行解析
│   ├── rulesGenerator.ts  # 规则生成器
│   ├── fileUtils.ts  # 文件操作（fetch 超时/体积上限）
│   ├── i18n.ts       # 国际化配置
│   └── uiUtils.ts    # UI 工具函数（行号生成、滚动同步）
└── config/           # 应用配置（预设源 URL）
```

```
prototype/            # 高保真原型与设计规范
├── prototype.canvas.tsx # React 高保真原型
├── OVERVIEW.md       # 原型总览
└── shadcn/           # shadcn 设计规范（design-system/component-library/interaction-standards/design-polish-report）
```

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式（端口 8082）
pnpm dev

# 构建生产版本
pnpm build

# 代码检查
pnpm lint

# 运行单元测试
pnpm test
```

## 项目规范

项目严格遵循 [openspec/SPEC.md](openspec/SPEC.md) 定义的规范，包括：

- 域名格式规范（`+` 白名单、`@` 自定义 DNS、`#` 注释）
- 输出格式规范（Dnsmasq、Hosts、AdGuard、白名单）
- Git 提交规范（feat/fix/docs/chore/refactor）
- 版本管理规范（SemVer 语义化版本）
- 组件分层规范（UI 基础组件 → 业务组件 → 页面组件）

## 常见问题

**Q: 为什么过滤规则不起效？**
- 清除浏览器缓存
- 重启路由器 DNS 缓存
- 检查路由器 DNS 设置是否生效

**Q: 如何添加白名单？**
- 使用 Web 管理工具的白名单功能
- 或手动编辑 `whitelist.txt`，每行一个域名

**Q: 规则多久更新一次？**
- 建议定期从仓库下载最新规则

## 参与贡献

欢迎提交域名规则和问题反馈，请查看 [贡献指南](CONTRIBUTING.md)。

## 安全

请查看 [安全策略](SECURITY.md) 了解项目的安全最佳实践。

## 许可证

MIT License

## 版本

当前版本：v3.7.19

## 更新日志

请查看 [CHANGELOG.md](CHANGELOG.md) 了解项目的版本历史和变更记录。
