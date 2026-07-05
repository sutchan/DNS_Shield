# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Added 12 i18n translation keys (`hostsFormat`, `dnsmasqFormat`, `mergeStats`, `versionLabel`, `languageSelectorAria`, `statsAria`, `editorActionsAria`, `outputActionsAria`, `outputFormatAria`, `urlActionsAria`, `urlListAria`, `usageGuideAria`) across all 16 languages

### Changed
- Unified version numbers in prototype files (`prototype.html`, `prototype.canvas.tsx`, `components-showcase.html`), security report, sample output files (`dnsmasq.conf`, `hosts.txt`, `adguard.txt`), bug report template, and SPEC.md to v3.4.0
- Aligned `manifest.json` `theme_color` with `viewport.themeColor` (`#007AFF`)

### Fixed
- Fixed functional bug where `UrlSection` preset label accessed non-existent `t.builtin`, causing the "Built-in" preset tag to render blank in all languages (now maps to `builtinAd`)
- Fixed `Footer.tsx` using `useState` without a `'use client'` directive
- Fixed `useDomainData` autosave restoring content after the user explicitly cleared input (split useEffect + ref guard)
- Fixed `rulesGenerator` hardcoding `::` for `customDns` IPv6 blocking instead of `settings.ipv6`
- Fixed non-null assertion `urlInputRef.current!.value` in `useUrlManager`
- Fixed translation errors: `ar.json` (`removeWildcard`, `whitelistFormat`), `id.json` (`removeWildcard`), `cs.json` (`whitelistFormat`)
- Replaced `OutputPanel` `isLangZh` ternary with `t.mergeStats` template supporting all 16 languages
- Replaced hardcoded "Hosts"/"Dnsmasq" labels with translation keys
- Fixed `Header` language selector misusing `t.settingsTitle` as aria-label
- Replaced all hardcoded Chinese aria-labels in components with translation keys
- Added `aria-hidden="true"` to all decorative Lucide icons
- Added `role="status"`, `aria-live`, `aria-busy`, `aria-hidden` accessibility attributes to `Loading` component
- `UrlSection` `defaultValue` now uses `config.domainsUrl`
- Removed dead `syncScroll`/`syncOutputScroll` exports from `uiUtils`
- Removed duplicate `Stats` interface in `InputPanel` (now imported from `types`)
- `useRules` now uses `FormatType` instead of repeated literal unions
- Removed unused exports/params (`setIsLoading`, `loadDomainData`, `isLangZh`, `isChineseLanguage`)

### UI Layout Fixes
- Fixed 30+ CSS classes used by components but undefined in `globals.css`, which caused complete layout breakdown:
  - Root containers: added `.container`, `.main-content` (grid layout for input/output panels)
  - Input panel: added `.input-section`, `.section-header`, `.collapse-btn`, `.collapse-icon`, `.stats-compact`, `.stat-badge`, `.editor-actions`
  - URL section: added `.url-input-row`, `.url-input`, `.url-actions`, `.url-list`, `.url-item`, `.url-item-icon`, `.url-item-text`, `.url-remove-btn`
  - Presets: added `.preset-section`, `.preset-tags`, `.preset-tag`
  - Editor: added `.editor-container` (shares styles with `.editor-wrapper`), new `.editor-preview` (div-based output preview)
  - Footer: added `.footer-content`, `.footer-top`, `.footer-version`, `.usage-toggle`, `.toggle-arrow`, `.usage-guide`, `.usage-steps`, `.usage-step`, `.step-number`, `.step-content`, `.step-title`, `.step-desc`, `.usage-tip`, `.tip-label`, `.tip-content`
  - Loading: added `.loading-text`, `.loading-content` (vertical centering of spinner and text)
- Unified collapse state naming convention: components use `collapsed` modifier (e.g., `class="url-section collapsed"`), CSS now uses compound selectors (e.g., `.url-section.collapsed`) instead of mismatched `.url-section-collapsed`
- Fixed `InputEditor` textarea missing `editor-textarea` class — no border, no padding, no line-height alignment
- Fixed `OutputPanel` preview div incorrectly using `editor-textarea` class (now uses dedicated `.editor-preview` to avoid resize handle on div)
- Fixed `Loading` component spinner and text laid out horizontally (now vertically stacked via `.loading-content` flex-col)
- Added `flex-wrap` to `.header-top` to support wrapping of brand area and controls on small screens

## [3.4.0] - 2026-07-03

### Added
- 根目录新增 `CHANGELOG.md`（Keep a Changelog 规范，含 Release 链接）
- 新增 `.github/ISSUE_TEMPLATE/bug_report.md` Bug 报告模板
- 新增 `.github/ISSUE_TEMPLATE/feature_request.md` 功能请求模板

### Changed
- 重写 `.github/ISSUE_TEMPLATE/config.yml` 为标准 GitHub 格式
- 整理项目目录：移除 `overview.md`、`test_e2e.py`、`DNS_Shield.code-workspace`、`pnpm-workspace.yaml`、`.codebuddy/`
- 将 `shadcn/` 目录归入 `prototype/` 统一管理
- 版本号统一更新至 v3.4.0

### Fixed
- 修复 `openspec/config.yaml` 版本号停留在 v3.1.0 的问题

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
- 修复输入/输出面板行号容器 ID 冲突（`#lineNumbers` → `#inputLineNumbers`）
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

## [2.3.2]

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

## [2.3.0]

### Added
- Enhanced Apple design system with glassmorphism effects
- Added comprehensive animation specifications (elastic curves, micro-interactions)
- Added visual depth and layering specifications
- Added accessibility guidelines and ARIA attributes
- Added 16 language internationalization support (ar, cs, en, es, hi, id, it, nl, pl, ru, sv, th, tr, vi, zh-cn, zh-tw)
- Added comprehensive design tokens (colors, shadows, spacing, typography)
- Added PWA support with service worker and manifest
- Added setupTests.ts for Jest test configuration
- Added CSS variables for gray colors (--gray-400, --gray-500)

### Changed
- Complete UI/UX redesign following Apple design principles
- Updated color palette to Apple blue (#007AFF) as primary color
- Enhanced shadow system with multi-layer depth
- Updated transition curves to Apple-style cubic-bezier animations
- Improved responsive design for mobile devices
- Synchronized all file version numbers to v2.3.0
- Updated OpenSpec documentation with new design specifications
- Updated prototype design with enhanced visual effects
- Updated global CSS with complete design system variables
- Verified and fixed all code quality issues via lint
- Fixed isLoading state in useDomainData hook to properly track loading state
- Replaced innerHTML with innerText in uiUtils.ts for improved security (XSS prevention)
- Added theme-toggle-item CSS class for theme switcher styling
- Updated README.en.md version references from 2.2.5 to 2.3.0

### Fixed
- Fixed theme color inconsistency in layout.tsx
- Fixed SPEC.md component list accuracy
- Fixed version number consistency across all files
- Fixed undefined CSS variables (--gray-400, --gray-500)
- Fixed missing src/setupTests.ts file referenced in spec
- Fixed isLoading state not being updated in useDomainData hook
- Fixed XSS security issue by replacing innerHTML with innerText in line number generation
- Fixed missing theme-toggle-item CSS class used in OutputPanel

## [2.2.5]

### Changed
- Updated Readme documentation to ensure content matches current functionality
- Synchronized and updated version numbers across all files to v2.2.5

## [2.2.3]

### Changed
- Checked and fixed all internationalization language files for completeness
- Verified project code compliance with project specification documentation
- Synchronized code functionality details to openspec documentation
- Reviewed project code and fixed all existing issues
- Tested application robustness to ensure all functions work properly
- Updated Readme documentation to ensure content matches current functionality
- Synchronized and updated version numbers across all files to v2.2.3

## [2.2.2]

### Changed
- Synchronized code functionality details to openspec documentation
- Checked and fixed all code files in the project
- Verified integrity of all internationalization language files
- Tested application robustness to ensure all functions work properly
- Updated Readme documentation to ensure content matches current functionality
- Synchronized and updated version numbers across all files to v2.2.2

## [2.2.1]

### Added
- 添加更多视频平台的广告过滤规则，包括快手、搜狐视频、乐视视频、风行视频、PPTV、西瓜视频、火山小视频、好看视频、小红书等平台

## [2.2.0]

### Added
- Added whitelist management functionality with independent editing interface
- Added whitelist import/export capabilities
- Added whitelist format output option

### Changed
- Updated all file version numbers to v2.2.0
- Synchronized version consistency across project files
- Improved internationalization language files
- Enhanced application robustness
- Updated documentation content
- Synchronized code functionality details to openspec documentation

## [2.1.0]

### Changed
- Updated all file version numbers to v2.1.0
- Synchronized version consistency across project files
- Improved internationalization language files
- Enhanced application robustness
- Updated documentation content
- Synchronized code functionality details to openspec documentation

## [2.0.3]

### Changed
- Reorganized domains.txt file structure with clear categories
- Cleaned duplicate domains (ad.coocaa.com, ad.ffalcon.com, ad.hisense.com)
- Improved comment consistency and formatting
- Updated metadata.json to v2.0.3

## [2.0.2]

### Changed
- Updated all file version numbers to v2.0.2
- Synchronized version consistency across project files
- Improved internationalization language files
- Enhanced application robustness
- Updated documentation content
- Synchronized code functionality details to openspec documentation

## [2.0.1]

### Changed
- Updated all file version numbers to v2.0.1
- Synchronized version consistency across project files
- Improved internationalization language files
- Enhanced application robustness
- Updated documentation content
- Synchronized code functionality details to openspec documentation

## [2.0.0]

### Changed
- Updated all file version numbers to v2.0.0
- Synchronized version consistency across project files
- Migrated to Next.js framework
- Updated project structure and components

## [1.1.2]

### Changed
- Updated README.md title to "路由器级全局广告防护"
- Updated domain count from 422+ to 463+
- Updated version numbers in README files to v1.1.2
- Updated SPEC.md version to v1.1.2

## [1.1.1]

### Changed
- Updated all file version numbers to v1.1.1
- Synchronized version consistency across project files

### Removed
- Removed Service Worker registration code from index.html since service-worker.js file was deleted

## [1.1.0]

### Added
- PWA support with manifest.json

## [1.0.7]

### Added
- PWA support with manifest.json
- Service worker for offline caching
- App icons in multiple sizes (72x72 to 512x512)
- Apple touch icon and mobile web app meta tags
- Visual distinction between input/output panels (colored left borders)
- Statistics bar visualization with animated progress indicators
- Loading spinner animation for URL fetch operations
- Empty state styling for better user guidance
- Ripple effect on button clicks
- Keyboard shortcuts (Ctrl+Enter to generate, Ctrl+S to save)
- Auto-save functionality with localStorage (every 30 seconds)
- Auto-restore of unsaved content on page load
- Enhanced focus states for accessibility (`:focus-visible`)
- Improved mobile responsive design

### Changed
- Input panel now has accent color (purple) left border
- Output panel now has success color (green) left border
- Statistics badges show visual feedback when data is present
- Loading states added to fetch buttons during network requests
- Mobile breakpoints optimized for better touch experience

## [1.0.6]

### Changed
- Enhanced UI design with gradient backgrounds and smooth animations
- Improved panel hover effects with gradient top border
- Redesigned buttons with gradient backgrounds and enhanced shadows
- Added input focus states with accent glow
- Updated color scheme for better visual hierarchy
- Comment lines (#domain and !domain syntax) no longer counted in domain count

### Added
- Save button now uses File System Access API to save directly to project directory

### Fixed
- Renamed `manager.html` to `index.html` for consistency with web standards

## [1.0.5]

### Changed
- Synchronized all file version numbers to v1.0.5
- Updated SPEC.md version references
- Updated README version badges
- Updated output file headers (dnsmasq.conf, hosts.txt)

### Fixed
- Fixed version inconsistency across project files
- Verified code robustness and updated documentation

## [1.0.4]

### Changed
- Updated output file descriptions to be router-agnostic (通用路由器支持)
- Removed Xiaomi-specific references from generator.js
- Standardized hosts file header descriptions

### Fixed
- Fixed SPEC.md and CHECKLIST.md to reflect current file structure
- Fixed domain count in output file headers (6766 domains)
- Removed duplicate app.js entries in CHECKLIST.md

### Removed
- Removed deprecated ui.js (split into ui-urls.js, ui-editor.js, ui-controls.js)

## [1.0.2] - 2026-03-14

### Changed
- **File Renaming**: Standardized all file names for consistency
  - `dnsmasq-ads-filter-list.txt` → `dnsmasq.conf`
  - `xiaomi-router-hosts-noad.txt` → `hosts.txt`
  - `raw-domains.txt` → `domains.txt`
  - `README_CN.md` → `README.zh-CN.md` (ISO 639-1 standard)
  - `hosts-manager.html` → `manager.html`
- Updated all internal references in `manager.html` to use new file names
- Updated README.md and README.zh-CN.md with new file references

### Fixed
- Fixed `domains.txt` rule documentation (`@` syntax)
- Fixed `manager.html` to support whitelist (`+`), comment domain (`!`), and custom DNS (`@`) prefixes
- Regenerated output files with correct domain count

### Added
- Support for whitelist domains (`+` prefix) in `manager.html`
- Support for comment domains (`!` prefix) in `manager.html`
- Support for custom DNS (`@` prefix) in `manager.html`
- Display of whitelist and custom DNS counts in output info

## [1.0.1] - 2026-03-14

### Fixed
- Fixed IPv6 address format in Dnsmasq rules (`address=/domain/::` instead of `address=/domain::/`)
- Fixed duplicate HTML element `blockIPv6` checkbox
- Fixed JavaScript function structure issues in `hosts-manager.html`
- Fixed duplicate translation objects in JavaScript

### Changed
- Regenerated `dnsmasq-ads-filter-list.txt` with correct format and standard header
- Regenerated `xiaomi-router-hosts-noad.txt` with correct format and standard header
- Updated IP address from `127.0.0.1` to `0.0.0.0` for consistency
- Converted `README.md` from HTML to Markdown format
- Updated `README_CN.md` with complete documentation
- Added file header comment to `hosts-manager.html`

### Added
- Standard header comments to output files
- Version number in HTML title
- Single source workflow documentation

## [1.0.0] - 2026-03-13

### Added
- Initial release
- Dnsmasq ad blocking filter list
- Xiaomi router hosts file
- Web management tool (`hosts-manager.html`)
- Raw domains source file (`raw-domains.txt`)
- Project documentation (README.md, README_CN.md)
- OpenSpec documentation (SPEC.md, TASKS.md, CHECKLIST.md)
