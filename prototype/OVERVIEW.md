# DNS Shield 高保真原型 v3.7.29
> 基于 DNS Shield Design System v3.7.29 (Swiss Modernism 2.0 × Apple Precision)

## 交付物

### 1. `prototype.html` — 独立高保真原型（可交互，无需构建）
- 纯 HTML + CSS + 原生 JS，零依赖，双击即可在浏览器打开
- 完整还原 Design System v3.7.29 色板（HSL 变量）、Inter 字体、4px 间距、Lucide 风格 SVG 图标
- **16 语言切换器**（Globe 下拉菜单，role=menu/menuitemradio；切换即时翻译界面文案，含 zh/en 完整词典，其余语言回退英文以演示多语言机制）
- **可折叠"高级选项"URL 区**：URL 输入框、获取/添加URL/前缀优先(排序)/获取全部、URL 列表(带删除)、4 个真实预设源(builtin/AdGuard/EasyList/NeoHosts)
- **输出设置面板**（折叠）：项目名/版本/IPv4/IPv6 + 头部注释/阻止IPv6/自动去重/移除通配符 开关，修改后若已生成则**实时重算**输出
- 真实可交互核心流程：复刻 `parseSource` + `generateRules` 逻辑，输入即实时解析统计，单一"生成规则"按钮产出多格式输出，统计/合并信息实时更新
- 深色/浅色主题切换、有数据 / 空状态切换（状态词随语言切换）
- 格式切换（Dnsmasq / Hosts / AdGuard / 白名单，tablist + tabpanel + aria-controls 关联），输出随切换与设置实时更新
- 行号编辑器（可编辑输入 + 只读输出，滚动同步）、复制/下载真实可用
- 键盘无障碍：预设/格式 tab/语言项支持 Enter/Space，aria-pressed/aria-selected/expanded 完整；语言下拉选项点击后同步 active 与 aria-selected
- 全局键盘快捷键：Ctrl/Cmd+Enter 生成、Ctrl/Cmd+S 保存、Ctrl/Cmd+D 下载、Ctrl/Cmd+Shift+C 复制（对齐交互规范 §5.1）
- 响应式布局（移动端单栏 → 桌面端双栏），`prefers-reduced-motion` 支持

### 2. `prototype.canvas.tsx` — React 静态视觉示意原型
> 定位：UI 结构 / 布局 / 视觉风格的 **静态预览**，用于在 React/Next.js 语境下展示组件树与样式，*不实现* html 版的交互逻辑。
- 完整的双栏布局（输入面板 + 输出面板），视觉对齐 Design System
- 深色/浅色主题切换、有数据 / 空状态切换（已修正 `toggleData` 闭包 bug，状态自洽）
- 格式切换标签（Dnsmasq / Hosts / AdGuard / 白名单），静态展示
- 行号编辑器（可编辑输入 + 只读输出）
- 纯 SVG 图标（Lucide 风格，无 emoji）
- TypeScript + React Hooks，主题与数据状态管理
- 响应式布局（移动端单栏 → 桌面端双栏）
- **与 html 版的差异（有意省略，非缺陷）**：无实时解析/生成、无预设切换、无 URL 增删、无设置面板、无多语言、无复制/下载逻辑、无键盘快捷键。如需可交互原型，请使用 `prototype.html`。

### 3. `shadcn/` — 设计规范文档
详情见各子文档：
- `design-system.md` — 色彩(HSL)/字体/间距/圆角/阴影/动效/z-index/响应式断点
- `component-library.md` — 基础/复合/业务组件的 TS 代码规范
- `interaction-standards.md` — 操作层级/反馈/加载/错误/空状态/键盘导航/ARIA
- `design-polish-report.md` — 设计打磨复盘报告（已修正：色彩空间为 HSL，非 oklch；标题去 emoji）

## 设计规范遵循

- [x] 色彩系统：精确匹配 Design System v3.7.29 色板（HSL 变量）
- [x] 字体系统：Inter，严格使用 Display/H1/H2/H3/Body/Small/Caption
- [x] 间距系统：4px 基数（space-1 ~ space-12）
- [x] 圆角系统：sm=6px, md=8px, lg=10px, xl=12px, 2xl=16px
- [x] 阴影系统：Light / Dark 不同阴影值
- [x] 动效系统：ease-out 缓动，prefers-reduced-motion 支持
- [x] 无障碍：focus-visible 环形，aria-label / role / aria-selected / aria-controls 属性
- [x] 无 emoji 图标：全部使用 Lucide 风格 SVG 图标

## 已知简化项（原型边界，非缺陷）

- **URL 抓取为模拟**：`fetchUrl` / `fetchAll` 仅将 URL 加入列表并提示（带 Spinner 加载态），不真正发起网络请求（真实 `useUrlManager` 有 `fetchFromUrls` 合并逻辑）。
- **多语言为演示机制**：仅 zh-cn / en 有完整界面词典，其余 14 语言回退英文以演示切换能力（真实应用 `i18n.ts` 全量翻译）。
- **主题/设置实时重算**：设置开关与输入框变更若已生成输出则即时 `generateRules()` 重算；未生成时仅影响下次生成。
- **对比度**：标签/正文使用 Design System 的 `muted-foreground` 令牌，已满足 WCAG AA（≥4.5:1）；原型 CSS 变量直接引用 design-system 定义。
- **reduced-motion**：已通过 `@media (prefers-reduced-motion: reduce) { * { transition: none } }` 真正禁用过渡。
- **canvas 版为静态示意**：`prototype.canvas.tsx` 仅展示视觉结构，不含交互逻辑（见上文"与 html 版的差异"）。

## 原型与真实引擎的同步状态（v3.7.29）

`prototype.html` 的 `parseSource` / `generateRules` / `generateHeader` 已对齐真实引擎（`src/utils/parser.ts`、`rulesGenerator.ts`、`domainValidator.ts`）：

- **解析**：支持纯域名、`+` 白名单、`@domain=ip` 自定义 DNS、`@@||domain^$important` AdGuard 白名单（3.7.28 修复 `$important` 修饰符，原型已支持尾部 `^` 与 `^$important`）、`0.0.0.0/127.0.0.1` hosts 行、`address=/domain/` dnsmasq 行、`||domain^` AdGuard 行；无效行计入注释统计。
- **去重**：自定义 DNS 按 domain 去重（保留首次，3.7.10 修复）；白名单/域名按归一化键去重。
- **白名单语义（3.7.29）**：黑名单拦截列表（Dnsmasq/Hosts/AdGuard）剔除白名单域名，白名单域名不再生成黑洞规则，仅以 `server=/`、`# 已白名单:`、`@@||...^$important` 形式出现在白名单区。
- **头部**：每种格式输出专属描述行（descMap），白名单标题走 i18n（`whitelistTitle`）。
- **未同步（原型边界）**：URL 真实抓取合并、流式读取、统计 `blacklistCount` 字段、完整 usage 多行（merlin/openwrt）。
