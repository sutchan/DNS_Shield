# Changelog

本项目所有重要变更均会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Changed
- 整理项目目录结构，移除冗余文件
  - 移除临时工作记录文件 `overview.md`
  - 移除个人测试脚本 `test_e2e.py`（使用 Windows 本地路径）
  - 移除冗余工作区配置 `DNS_Shield.code-workspace`
  - 移除无效的 `pnpm-workspace.yaml`（引用不存在的 `unrs-resolver`）
  - 移除本地 IDE 配置目录 `.codebuddy/`
- 将 `shadcn/` 设计规范目录归入 `prototype/` 统一管理
- 完善 `.github/ISSUE_TEMPLATE/` 配置：
  - 重写 `config.yml` 为标准 GitHub 格式（`contact_links` + `blank_issues_enabled`）
  - 新增 `bug_report.md` Bug 报告模板
  - 新增 `feature_request.md` 功能请求模板

## [3.3.0] - 2026-07-03

### Added
- 新增 `SettingsPanel.tsx` — 设置面板组件（从 OutputPanel.tsx 拆分）
- 新增 `UrlSection.tsx` — URL 导入区域组件（含 PresetTags 子组件，从 InputPanel.tsx 拆分）
- 新增 `useLoading.ts` — 通用加载状态管理 hook（从 useUrlManager.ts 拆分）
- 新增 `useSettings.ts` — 设置管理 hook（从 Home.tsx 拆分）

### Changed
- 版本号统一更新至 v3.3.0（全部源文件 + 文档文件）
- 完成 4 个超过 200 行文件的模块拆分：
  - `Home.tsx` 213 → 189 行
  - `OutputPanel.tsx` 212 → 137 行
  - `InputPanel.tsx` 205 → 153 行
  - `useUrlManager.ts` 204 → 148 行
- i18n 清理：移除所有 16 种语言翻译中的 emoji 图标，统一使用 Lucide SVG 图标
- 优化代码架构，提升模块复用性和可维护性
- 更新 openspec/SPEC.md 版本历史记录
- 更新 prototype 原型文件版本号
- 更新 shadcn 设计规范文档版本号

### Fixed
- 修复代码规范问题：UI 图标全部使用 Lucide SVG，移除翻译文本中的 emoji
- 修复模块过大问题，所有源文件均控制在 200 行以内
- 修复代码组织架构，职责分离更清晰

## [3.2.0] - 2026-07-03

### Added
- 新增 `domainValidator.ts` — 域名验证与行解析工具模块（从 parser.ts 拆分）
- 新增 `InputEditor.tsx` — 域名编辑器子组件（从 InputPanel.tsx 拆分）

### Changed
- 版本号统一更新至 v3.2.0（33 个源文件 + 9 个文档文件）
- 更新 README 中文/英文文档，同步当前功能说明
- i18n 清理：移除 16 种语言中 3 个废弃的翻译键（`adguardFile`、`downloadAdguard`、`toast.urlListEmpty`）
- InputPanel 优化：使用 Lucide SVG 图标替换 emoji × 关闭按钮
- InputEditor 提取为独立文件，降低 InputPanel 行数至 200 行以下
- parser.ts 精简：将域名验证逻辑提取到 domainValidator.ts

### Fixed
- 修复 Home.tsx settings 默认版本号为 v3.2.0
- 修复 layout.tsx description 中缺失版本号
- 修复输入/输出面板行号容器 ID 冲突（`#lineNumbers` → `#inputLineNumbers` / `#outputLineNumbers`）
- 修复代码与设计规范中关于图标使用的对齐问题

## [3.1.0] - 2026-06-30

### Added
- 新增 Accordion 折叠面板组件（基于 Radix UI）
- 新增按钮点击缩放交互效果（`active:scale-[0.98]`）
- 新增面板悬停浮起效果（hover-lift：上浮 2px + 阴影加深）
- 新增 `@radix-ui/react-accordion` 依赖

### Changed
- Button 组件过渡动画从 `transition-colors` 升级为 `transition-all`
- 更新 openspec 文档至 v3.1.0，补充组件注册表和版本历史
- 更新组件列表，添加 Accordion 组件

### Fixed
- 修复代码与设计规范中交互动效的对齐问题
- 修复组件库完整性，补充缺失的 Accordion 组件

## [3.0.0] - 2026-06-30

### Added
- 全面重构设计系统为 v3.0（Swiss Precision × Calm Technology 设计哲学）
- 采用 oklch 色彩空间替代 HSL，色彩分布更均匀
- 新增完整的设计系统文档（`shadcn/design-system.md`、`shadcn/interaction-standards.md`）
- 新增设计复盘报告（`shadcn/design-polish-report.md`）
- 新增高保真原型（`prototype/prototype.html`、`prototype/prototype.canvas.tsx`）
- 启用 Inter 字体 OpenType 特性（cv02, cv03, cv04, cv11）
- 新增 11 级灰阶色彩系统
- 新增 4px 基准间距系统
- 新增 Apple 风格 ease-out-quart 动效曲线（cubic-bezier(0.16, 1, 0.3, 1)）
- 新增 ::selection 半透明蓝色高亮样式
- 新增 focus ring 2px + 2px offset 样式
- 新增 PWA 图标（72x72 ~ 512x512，共 8 个尺寸）

### Changed
- 背景色从纯白调整为 98% 柔和近白，减少视觉刺眼
- 前景色从纯黑调整为 12% 阅读灰，更舒适
- 边框从 15% 灰调淡至 12% 灰，减少视觉噪音
- 深色模式背景调整为更柔和的 hsl(240 6% 7%)
- 容器 max-width 从 max-w-5xl 扩展至 max-w-6xl，更宽敞
- panel 内边距从 p-4 增加至 p-5 sm:p-6，增强呼吸感
- 标题字距优化为 letter-spacing: -0.02em，更紧凑
- 代码编辑器字号优化为 0.8125rem (13px)
- 所有元素行高对齐 6 的倍数（24px = 6×4pt）
- 统一使用 Lucide SVG 图标，移除所有 emoji 图标
- Loading spinner 使用 border-top-color 动画替代完整环

### Removed
- 移除 OutputPanel 底部多余的 theme toggle（已在 Header 中）
- 移除无必要的多层卡片嵌套
- 移除所有内联 SVG，统一使用 Lucide 图标库

### Security
- 增强安全性和性能（CSP 头部、URL 验证）

## [2.3.2] - 2026-06-30

### Added
- 添加缺失的国际化翻译键 `invalidUrl` 和 `invalidUrlsFiltered`（16 种语言）
- 创建高保真原型 `prototype.canvas.tsx`
- 添加 `openspec/` 项目规范文档（SPEC.md、TASKS.md、CHECKLIST.md、config.yaml）

### Changed
- 统一全项目版本号为 v2.3.2（package.json、layout.tsx、Home.tsx、next.config.js、docs 等）
- 更新所有源文件头注释版本至 v2.3.2
- 更新 openspec SPEC.md 至 v2.3.2，重写文件结构和依赖信息

### Fixed
- 修复 layout.tsx 中 og:title 版本号不一致（v2.3.0 → v2.3.2）
- 修复 useLanguage.ts 移除无用的 click-outside 事件监听器
- 修复 Loading 组件 DOM 结构（移除无意义的嵌套 div）
- 修复 docs/README.md 引用不存在的 GLOBAL_USAGE.md
- 修复 16 个 locale 文件缺失 `invalidUrl` 和 `invalidUrlsFiltered` 翻译键
- 修复 types/index.ts 缺失 toast 类型定义

## [2.3.0] - 2026-06-30

### Added
- 采用 Apple 设计系统，玻璃拟态效果
- 新增完整动画规范（弹性曲线、微交互）
- 新增视觉深度和分层规范
- 新增无障碍指南和 ARIA 属性
- 新增 16 语言国际化支持（ar, cs, en, es, hi, id, it, nl, pl, ru, sv, th, tr, vi, zh-cn, zh-tw）
- 新增完整设计令牌（颜色、阴影、间距、字体）
- 新增 PWA 支持（service worker + manifest）
- 新增 CSS 变量 --gray-400, --gray-500

### Changed
- 完整 UI/UX 重设计，遵循 Apple 设计原则
- 主色更新为 Apple Blue (#007AFF)
- 增强阴影系统，多层深度
- 过渡曲线更新为 Apple 风格 cubic-bezier 动画
- 优化移动端响应式设计
- 同步所有文件版本号至 v2.3.0
- 更新 OpenSpec 文档
- 更新全局 CSS 完整设计系统变量
- 修复 isLoading 状态在 useDomainData hook 中未正确跟踪
- 替换 innerHTML 为 innerText 提升 XSS 安全性
- 更新 README.en.md 版本引用从 2.2.5 到 2.3.0

### Fixed
- 修复 layout.tsx 主题颜色不一致
- 修复 SPEC.md 组件列表准确性
- 修复所有文件版本号一致性
- 修复未定义 CSS 变量 --gray-400, --gray-500
- 修复缺失 src/setupTests.ts 文件引用
- 修复 isLoading 状态在 useDomainData hook 中未更新
- 修复 XSS 安全问题（innerHTML → innerText）
- 修复 OutputPanel 中缺失的 theme-toggle-item CSS 类

## [2.2.5] - 2026-06-30

### Changed
- 更新 README 文档以匹配当前功能
- 同步所有文件版本号至 v2.2.5

## [2.2.3] - 2026-06-30

### Changed
- 检查并修复所有国际化语言文件的完整性
- 验证项目代码符合项目规范文档
- 同步代码功能详情到 openspec 文档
- 审查项目代码并修复所有现有问题
- 测试应用鲁棒性以确保所有功能正常运行
- 同步所有文件版本号至 v2.2.3

## [2.2.2] - 2026-06-30

### Changed
- 同步代码功能详情到 openspec 文档
- 检查并修复项目所有代码文件
- 验证所有国际化语言文件的完整性
- 测试应用鲁棒性以确保所有功能正常运行
- 同步所有文件版本号至 v2.2.2

## [2.2.1] - 2026-06-30

### Added
- 添加更多视频平台广告过滤规则（快手、搜狐视频、乐视、风行、PPTV、西瓜视频、火山小视频、好看视频、小红书等）

## [2.2.0] - 2026-06-30

### Added
- 新增白名单管理功能（独立编辑界面）
- 新增白名单导入/导出功能
- 新增白名单格式输出选项

### Changed
- 同步所有文件版本号至 v2.2.0
- 改进国际化语言文件
- 增强应用鲁棒性

## [2.1.0] - 2026-06-30

### Changed
- 同步所有文件版本号至 v2.1.0
- 改进国际化语言文件
- 增强应用鲁棒性

## [2.0.3] - 2026-06-30

### Changed
- 重新组织 domains.txt 文件结构，分类清晰
- 清理重复域名（ad.coocaa.com, ad.ffalcon.com, ad.hisense.com）
- 改进注释一致性和格式

## [2.0.2] - 2026-06-30

### Changed
- 同步所有文件版本号至 v2.0.2
- 改进国际化语言文件
- 增强应用鲁棒性

## [2.0.1] - 2026-06-30

### Changed
- 同步所有文件版本号至 v2.0.1
- 改进国际化语言文件

## [2.0.0] - 2026-06-30

### Changed
- 迁移到 Next.js 框架
- 更新项目结构和组件

## [1.1.2] - 2026-03-15

### Changed
- 更新 README.md 标题为「路由器级全局广告防护」
- 更新域名数量从 422+ 到 463+

## [1.1.1] - 2026-03-15

### Changed
- 同步所有文件版本号至 v1.1.1

### Removed
- 移除 index.html 中的 Service Worker 注册代码（service-worker.js 已删除）

## [1.1.0] - 2026-03-15

### Added
- 新增 PWA 支持（manifest.json）

## [1.0.7] - 2026-03-14

### Added
- PWA 支持（manifest.json + service worker）
- 多尺寸应用图标（72x72 ~ 512x512）
- Apple touch icon 和移动 web app meta 标签
- 输入/输出面板视觉区分（彩色左边框）
- 统计栏可视化与动画进度指示器
- URL 获取加载动画
- 空状态样式引导
- 按钮点击涟漪效果
- 键盘快捷键（Ctrl+Enter 生成，Ctrl+S 保存）
- 自动保存功能（localStorage，每 30 秒）
- 页面加载时恢复未保存内容
- 增强的 focus-visible 无障碍状态
- 移动端响应式设计优化

### Changed
- 输入面板添加紫色左边框
- 输出面板添加绿色左边框
- 统计徽章在有数据时显示视觉反馈
- 网络请求期间获取按钮显示加载状态

## [1.0.6] - 2026-03-14

### Added
- 增强渐变背景和动画的 UI 设计
- 保存按钮使用 File System Access API 直接保存到项目目录

### Changed
- 改进面板悬停效果
- 重新设计按钮（渐变背景 + 增强阴影）
- 添加输入框聚焦发光效果
- 注释行（#domain 和 !domain 语法）不再计入域名数量

### Fixed
- 将 `manager.html` 重命名为 `index.html`

## [1.0.5] - 2026-03-14

### Changed
- 同步所有文件版本号至 v1.0.5

### Fixed
- 修复跨文件版本不一致

## [1.0.4] - 2026-03-14

### Changed
- 输出文件描述更新为路由器通用（移除小米特定引用）
- 标准化 hosts 文件头描述

### Fixed
- 修复 SPEC.md 和 CHECKLIST.md 以反映当前文件结构
- 修复输出文件头中的域名计数（6766 domains）
- 移除 CHECKLIST.md 中重复的 app.js 条目

### Removed
- 移除弃用的 ui.js（拆分为 ui-urls.js, ui-editor.js, ui-controls.js）

## [1.0.2] - 2026-03-14

### Changed
- 标准化所有文件名：
  - `dnsmasq-ads-filter-list.txt` → `dnsmasq.conf`
  - `xiaomi-router-hosts-noad.txt` → `hosts.txt`
  - `raw-domains.txt` → `domains.txt`
  - `README_CN.md` → `README.zh-CN.md`（ISO 639-1 标准）
  - `hosts-manager.html` → `manager.html`

### Added
- 支持白名单域名（`+` 前缀）
- 支持注释域名（`!` 前缀）
- 支持自定义 DNS（`@` 前缀）
- 输出信息中显示白名单和自定义 DNS 计数

### Fixed
- 修复 `domains.txt` 规则文档（`@` 语法）
- 修复 `manager.html` 支持白名单、注释域名和自定义 DNS 前缀
- 重新生成输出文件并修正域名计数

## [1.0.1] - 2026-03-14

### Fixed
- 修复 Dnsmasq 规则中 IPv6 地址格式（`address=/domain/::` 替代 `address=/domain::/`）
- 修复重复的 HTML 元素 `blockIPv6` 复选框
- 修复 `hosts-manager.html` 中 JavaScript 函数结构问题
- 修复 JavaScript 中重复的翻译对象

### Changed
- IP 地址从 `127.0.0.1` 更新为 `0.0.0.0`
- `README.md` 从 HTML 转换为 Markdown 格式
- 添加 `hosts-manager.html` 文件头注释

### Added
- 输出文件标准头注释
- HTML 标题中的版本号
- 单一来源工作流文档

## [1.0.0] - 2026-03-13

### Added
- 初始发布
- Dnsmasq 广告过滤规则列表
- 小米路由器 hosts 文件
- Web 管理工具（`hosts-manager.html`）
- 原始域名源文件（`raw-domains.txt`）
- 项目文档（README.md, README_CN.md）
- OpenSpec 文档（SPEC.md, TASKS.md, CHECKLIST.md）

[Unreleased]: https://github.com/sutchan/DNS_Shield/compare/v3.3.0...HEAD
[3.3.0]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.3.0
[3.2.0]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.2.0
[3.1.0]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.1.0
[3.0.0]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.0.0
[2.3.2]: https://github.com/sutchan/DNS_Shield/releases/tag/v2.3.2
[2.3.0]: https://github.com/sutchan/DNS_Shield/releases/tag/v2.3.0
[2.2.5]: https://github.com/sutchan/DNS_Shield/releases/tag/v2.2.5
[2.2.3]: https://github.com/sutchan/DNS_Shield/releases/tag/v2.2.3
[2.2.2]: https://github.com/sutchan/DNS_Shield/releases/tag/v2.2.2
[2.2.1]: https://github.com/sutchan/DNS_Shield/releases/tag/v2.2.1
[2.2.0]: https://github.com/sutchan/DNS_Shield/releases/tag/v2.2.0
[2.1.0]: https://github.com/sutchan/DNS_Shield/releases/tag/v2.1.0
[2.0.3]: https://github.com/sutchan/DNS_Shield/releases/tag/v2.0.3
[2.0.2]: https://github.com/sutchan/DNS_Shield/releases/tag/v2.0.2
[2.0.1]: https://github.com/sutchan/DNS_Shield/releases/tag/v2.0.1
[2.0.0]: https://github.com/sutchan/DNS_Shield/releases/tag/v2.0.0
[1.1.2]: https://github.com/sutchan/DNS_Shield/releases/tag/v1.1.2
[1.1.1]: https://github.com/sutchan/DNS_Shield/releases/tag/v1.1.1
[1.1.0]: https://github.com/sutchan/DNS_Shield/releases/tag/v1.1.0
[1.0.7]: https://github.com/sutchan/DNS_Shield/releases/tag/v1.0.7
[1.0.6]: https://github.com/sutchan/DNS_Shield/releases/tag/v1.0.6
[1.0.5]: https://github.com/sutchan/DNS_Shield/releases/tag/v1.0.5
[1.0.4]: https://github.com/sutchan/DNS_Shield/releases/tag/v1.0.4
[1.0.2]: https://github.com/sutchan/DNS_Shield/releases/tag/v1.0.2
[1.0.1]: https://github.com/sutchan/DNS_Shield/releases/tag/v1.0.1
[1.0.0]: https://github.com/sutchan/DNS_Shield/releases/tag/v1.0.0
