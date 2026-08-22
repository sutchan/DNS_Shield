# DNS Shield — 项目原型 (Prototype) v3.7.60

> 高保真、可交互、内联真实数据的产品原型，与真实引擎 `src/` 及 OpenSpec 规范保持最小颗粒度对齐。

## 目录结构

```
prototype/
├── prototype.html             # 高保真可交互原型（主页：极简风格 / 真实数据 / 响应式 PC+移动）
├── wireframes.html            # 组件库规范：基础 / 复合 / 业务组件 + 设计令牌 + 使用规则
├── flows.html                 # 关键业务流程交互原型（URL导入 / 格式切换 / 设置 / 主题语言，带动效）
├── README.md                  # 本文件：原型说明与索引
└── shadcn/
    ├── design-system.md       # 设计系统：色彩 / 字体 / 间距 / 图标 / 动效（token 单一来源）
    ├── component-library.md   # 组件库：基础 / 复合 / 业务组件规范
    └── interaction-standards.md # 交互标准：模式 / 反馈 / 错误 / 空状态 / a11y
```

## 原型能力（`index.html`）

- **极简视觉**：严格复用 `shadcn/design-system.md` 的 HSL token 与 Inter 字体、4px 间距、Apple ease-out-quart 缓动。
- **真实数据**：内置与 `public/domains.txt` 语法一致的样本（黑名单 / `+` 白名单 / `@domain=ip` 自定义 DNS / `!` 注释），输出逻辑 1:1 对齐 `src/utils/parser.ts` 与 `rulesGenerator.ts`。
- **格式转换**：粘贴 hosts / dnsmasq / AdGuard / 纯域名任意格式清单，`parseDomainLine` 逐行识别并解析为统一中间结构，再输出为目标格式，支持不同格式互转。
- **高保真交互**：
  - 主题切换（Light/Dark，持久化 `localStorage` + `prefers-color-scheme`）
  - 8 语言下拉（i18n 最小集，对齐 `src/locales`）
  - 实时解析统计（黑名单 / 白名单 / 自定义 DNS / 注释）
  - 9 种格式输出（Dnsmasq / Hosts / AdGuard / 白名单 / Unbound / Pi-hole / 纯域名 / Bind RPZ / SmartDNS）Tab 切换
  - 行号编辑器、排序、去重、清空、复制、下载
  - 预设数据（内置 / AdGuard / EasyList / NeoHosts）
  - **设置面板**（项目名 / 版本 / IPv4 / IPv6 / 头部注释 / IPv6 屏蔽 / 去重 / 通配符，实时驱动生成，对齐 `src/components/SettingsPanel.tsx`）
  - **URL 批量导入**（流式读取 + 加载态 + 10MB 上限模拟，对齐 `src/components/UrlSection.tsx`）
  - **About 业务组件**（GitHub / Star / 更新日志 / 使用指南三步，对齐 `src/components/Footer.tsx`）

## 组件库规范（`wireframes.html`）

按层级定义全部组件，与 `src/components/ui/` 的 shadcn 封装 1:1 对齐：

- **基础组件（Atoms）**：Button（6 变体 / 4 尺寸）、Input、Label、Textarea、Checkbox、Switch、Badge（6 变体）、Select、Tabs、DropdownMenu、Loading（Spinner / Skeleton / Indeterminate Bar）、Toast。
- **复合组件（Composite）**：Card（header/body/footer）、Form（字段组）、List（域名条目）、Stat（统计卡）、Code Preview（注释/白名单着色）。
- **业务组件（Business）**：AppHeader（语言+主题）、SettingsPanel、InputPanel+UrlSection、OutputPanel、AppFooter（使用指南）。
- **设计令牌**：Light/Dark HSL 通道值表，圆角四级，与 `globals.css` 同源。
- **使用规则**：语义化 id、单一数据源、变体契约、a11y、动效规范、文件头注释。

## 业务流程原型（`flows.html`）

纯前端可交互流程，带动效：① URL 导入→解析（步进器 + 加载态）；② 9 格式切换（淡入 + 复制）；③ 设置变更→实时重生成（双向绑定）；④ 主题 / 语言切换（整体缓动过渡）。

## 设计规范索引
- **3.7.29 语义**：白名单域名不进入黑名单拦截列表，仅以 `server=/`（Dnsmasq）、`# 已白名单:`（Hosts）、`@@||domain^$important`（AdGuard 白名单）呈现。
- **响应式**：≥768px 双栏，移动端单列堆叠；sticky 顶栏；Toast 反馈。
- **语义化 id / 无障碍**：主要容器与控件均带 `id`（`app-header`/`main-content`/`input-panel`/`output-panel`/`langBtn`/`themeBtn` 等），支持键盘与 ARIA。

## 设计规范索引

| 文档 | 覆盖 |
|------|------|
| `shadcn/design-system.md` | 色彩（Light/Dark HSL token）、字体（Inter/Mono）、间距（4px）、圆角、图标（Lucide）、动效（ease-out-quart） |
| `shadcn/component-library.md` | 基础组件（Button/Card/Input/Badge/Tabs）、复合组件（CodeEditor/StatBadge/EmptyState）、使用规则（cn/forwardRef/Lucide/无 any） |
| `shadcn/interaction-standards.md` | 交互模式、反馈（即时/进度/完成/Toast）、错误处理、空状态、键盘导航、a11y、响应式状态机 |

## 品牌形象（Brand Assets）

品牌资产统一存放于 `public/`（应用运行时直接读取），线上品牌说明位于 `public/brand/`：

| 资源 | 应用路径（`public/`） | 用途 |
|------|------|------|
| 品牌 Logo | `public/logo.svg` | 盾牌图标 + "DNS Shield" 文字，用于 README / OG / 文档 |
| 网站图标 | `public/favicon.svg` | 盾牌 + 防护对勾，浅底主蓝，浏览器标签（`<link rel="icon" type="image/svg+xml">`） |
| 反白标志 | `public/logo-mono.svg` | 深色背景 / 单色印刷 |
| PWA 图标集 | `public/assets/icons/icon-{72,96,128,144,152,192,384,512}.png` | 安装到主屏、manifest 引用 |
| 调色板规范 | `public/brand/brand-colors.md` | 主色 / 色阶 / 中性 / 语义色 |

**品牌色（与 `shadcn/design-system.md` 的 `--primary` 严格一致）**
- 主蓝（Light）：`hsl(217 89% 47%)` ≈ `#0D5FE2`
- 主蓝（Dark）：`hsl(217 85% 55%)` ≈ `#2674F2`
- 语义：保护 / 防护 / 可信。`manifest` 与 `viewport.themeColor` 已统一使用上述值（旧 `#007AFF` 已弃用）。完整色阶见 `public/brand/brand-colors.md`。

**使用规则**
- 优先使用矢量 `public/logo.svg` / `public/favicon.svg`（任意缩放清晰）；PNG 仅用于需要位图的场景（PWA / 旧客户端）。
- 图标主色始终取品牌主蓝，禁止随意改色；深色背景用 `public/logo-mono.svg`。
- 应用内导航栏 Logo 复用 `lucide-react` 的 `Shield` 图标（`text-primary`），与 `favicon.svg` 视觉一致。
- 修改标志时直接更新 `public/` 下对应资产，并保持 `public/brand/` 文档同步。

## 与真实引擎的同步状态（v3.7.60）

`prototype.html` 的解析/生成逻辑对齐 `src/utils/parser.ts`、`rulesGenerator.ts`、`domainValidator.ts`：

- **解析**：纯域名、`+` 白名单、`@domain=ip` 自定义 DNS、`@@||domain^$important` AdGuard 白名单（3.7.28 `$important`）、`0.0.0.0/127.0.0.1` hosts、`address=/domain/` dnsmasq、`||domain^` AdGuard；无效行计入注释统计。
- **去重**：自定义 DNS 按 domain 去重（3.7.10）；域名/白名单按归一化键去重。
- **白名单语义（3.7.29）**：黑名单拦截列表剔除白名单域名。
- **头部**：每种格式输出版本与域名计数（对齐 `generateHeader`）。
- **组件对齐**：`wireframes.html` 组件库对齐 `src/components/ui/` 全部 12 个 shadcn 封装；`flows.html` 业务流程对齐 `SettingsPanel` / `UrlSection` / `Footer` 交互语义。
- **未同步（原型边界）**：URL 为模拟 fetch（真实实现见 `src/utils/domainFetch.ts` 流式读取 + 10MB 上限）、完整 merlin/openwrt usage 多行。

## 使用方式

直接用浏览器打开 `prototype/prototype.html` 即可预览；无需构建。所有交互在纯前端（vanilla JS）实现，数据内联，零外部运行时依赖。`wireframes.html` / `flows.html` 同理。

## 版本

当前原型版本 **v3.7.60**，与 `src/config/version.ts`、`openspec/SPEC.md`、`openspec/config.yaml` 一致。
