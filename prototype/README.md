<!-- 双轨说明：dashboard.html 是当前版本（v3.22.0）高保真原型，与实现同步；
     prototype.html / wireframes.html / flows.html 为 v3.9.x~v3.10.x 设计快照（冻结留档），不再回填版本与指标。
     当前实现以 docs/SPEC.md 为准，版本号以 package.json 为准。 -->
# DNS Shield — 项目原型 (Prototype)

> 当前高保真原型：**`dashboard.html`（v3.22.2）**——覆盖桌面等宽双栏、移动单列、关于/FAQ、加载/错误/404 状态页与设置/格式/规则测试/同步脚本四类弹窗；顶栏仅 Share/Settings，语言与主题在设置弹窗内。DOM id 与实现及 `docs/SPEC.md` §4.4 一一对应。下方历史文件为设计决策留档。

## 目录结构

```
prototype/
├── dashboard.html             # 【当前 v3.22.2】高保真原型：桌面/移动/FAQ/状态页/四类弹窗，token 与 DOM id 对齐实现
├── prototype.html             # 【冻结快照 v3.9.7】早期高保真交互原型
├── wireframes.html            # 【冻结快照 v3.10.1】组件库规范：基础 / 复合 / 业务组件 + 设计令牌 + 使用规则
├── flows.html                 # 【冻结快照 v3.10.1】关键业务流程交互原型（URL导入 / 格式切换 / 设置 / 主题语言）
├── README.md                  # 本文件：原型说明与索引
└── shadcn/
    ├── design-system.md       # 设计系统：色彩 / 字体 / 间距 / 图标 / 动效（token 单一来源）
    ├── component-library.md   # 组件库：基础 / 复合 / 业务组件规范
    └── interaction-standards.md # 交互标准：模式 / 反馈 / 错误 / 空状态 / a11y
```

## 原型能力（`index.html`）

- **极简视觉**：严格复用 `shadcn/design-system.md` 的 HSL token 与 Inter 字体、4px 间距、Apple ease-out-quart 缓动。
- **真实数据**：内置数据预设 `SAMPLE` 取自真实运行时源 `https://raw.githubusercontent.com/sutchan/DNS_Shield/refs/heads/main/public/domains.txt`（纯黑名单域名列表，样本为该文件头部真实域名），与运行时源同构；`+` 白名单 / `@domain=ip` 自定义 DNS / `!` 注释等混合语法由 adguard/easylist 等预设演示，输出逻辑 1:1 对齐 `src/utils/parser.ts` 与 `rulesGenerator.ts`。
- **格式转换**：粘贴 hosts / dnsmasq / AdGuard / 纯域名任意格式清单，`parseDomainLine` 逐行识别并解析为统一中间结构，再输出为目标格式，支持不同格式互转。
- **高保真交互**：
  - 主题切换（Light/Dark，持久化 `localStorage` + `prefers-color-scheme`）
  - 16 语言下拉（对齐 `src/utils/i18n.ts` `supportedLanguages`）
  - 实时解析统计（黑名单 / 白名单 / 自定义 DNS / 注释 / 无效行）
  - 12 种格式输出（Dnsmasq / Hosts / AdGuard / 白名单 / Unbound / Pi-hole / 纯域名 / Bind RPZ / SmartDNS / Mosdns / Clash Meta / CoreDNS）Tab 切换（**已废弃**：当前实现自 v3.15.5 起为单一「格式」下拉 `OutputPanel.formatSelect.tsx`）
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
- **设计令牌**：Light/Dark HSL 通道值表，圆角五级（sm/md/lg/xl/2xl）+ full 药丸，与 `globals.css` 同源。
- **使用规则**：语义化 id、单一数据源、变体契约、a11y、动效规范、文件头注释。

## 业务流程原型（`flows.html`）

纯前端可交互流程，带动效：① URL 导入→解析（步进器 + 加载态）；② 9 格式切换（淡入 + 复制）（**已废弃**：当前为 12 种格式、单一「格式」下拉）；③ 设置变更→实时重生成（双向绑定）；④ 主题 / 语言切换（整体缓动过渡）。

## 设计规范索引
- **3.7.29 语义**：白名单域名不进入黑名单拦截列表，仅以 `server=/`（Dnsmasq）、`# 已白名单:`（Hosts）、`@@||domain^$important`（AdGuard 白名单）呈现。
- **响应式**：≥768px 双栏，移动端单列堆叠；sticky 顶栏；Toast 反馈。
- **语义化 id / 无障碍**：主要容器与控件均带 `id`（`app-header`/`main-content`/`input-panel`/`output-panel`/`lang-selector-btn`/`settings-btn`/`share-btn` 等，主题切换位于设置弹窗内对应 `theme-seg-btn`），支持键盘与 ARIA；`settingsBtn` / `shareBtn` 等 camelCase 写法自 v3.15.0 起**已废弃**，一律 kebab-case。

## 设计规范索引

| 文档 | 覆盖 |
|------|------|
| `shadcn/design-system.md` | 色彩（Light/Dark HSL token）、字体（Inter/Mono）、间距（4px）、圆角、图标（Lucide）、动效（ease-out-quart） |
| `shadcn/component-library.md` | 基础组件（Button/Card/Input/Badge/Tabs）、复合组件（CodeEditor/StatBadge/EmptyState）、使用规则（cn/forwardRef/Lucide/无 any） |
| `shadcn/interaction-standards.md` | 交互模式、反馈（即时/进度/完成/Toast）、错误处理、空状态、键盘导航、a11y、响应式状态机 |

## 品牌形象（Brand Assets）

品牌资产统一存放于 `public/`（应用运行时直接读取），线上品牌说明位于 `public/brand-colors.md`：

| 资源 | 应用路径（`public/`） | 用途 |
|------|------|------|
| 品牌 Logo | `public/logo.svg` | 盾牌图标 + "DNS Shield" 文字，用于 README / OG / 文档 |
| 网站图标 | `public/favicon.svg` | 盾牌 + 防护对勾，浅底主蓝，浏览器标签（`<link rel="icon" type="image/svg+xml">`） |
| 反白标志 | `public/logo-mono.svg` | 深色背景 / 单色印刷 |
| PWA 图标集 | `public/assets/icons/icon-{72,96,128,144,152,192,384,512}.png` | 安装到主屏、manifest 引用 |
| 调色板规范 | `public/brand-colors.md` | 主色 / 色阶 / 中性 / 语义色 |

**品牌色（与 `shadcn/design-system.md` 的 `--primary` 严格一致）**
- 主蓝（Light）：`hsl(217 89% 47%)` ≈ `#0D5FE2`
- 主蓝（Dark）：`hsl(217 85% 55%)` ≈ `#2674F2`
- 语义：保护 / 防护 / 可信。`manifest` 与 `viewport.themeColor` 已统一使用上述值（旧 `#007AFF` 已弃用）。完整色阶见 `public/brand-colors.md`。

**使用规则**
- 优先使用矢量 `public/logo.svg` / `public/favicon.svg`（任意缩放清晰）；PNG 仅用于需要位图的场景（PWA / 旧客户端）。
- 图标主色始终取品牌主蓝，禁止随意改色；深色背景用 `public/logo-mono.svg`。
- 应用内导航栏 Logo 复用 `lucide-react` 的 `Shield` 图标（`text-primary`），与 `favicon.svg` 视觉一致。
- 修改标志时直接更新 `public/` 下对应资产，并保持 `public/brand-colors.md` 文档同步。

## 与真实引擎的同步状态（v3.9.3）

`prototype.html` 的解析/生成逻辑对齐 `src/utils/parser.ts`、`rulesGenerator.ts`、`domainValidator.ts`：

- **解析**：纯域名、`+` 白名单、`@domain=ip` 自定义 DNS、`@@||domain^$important` AdGuard 白名单（3.7.28 `$important`）、`0.0.0.0/127.0.0.1` hosts、`address=/domain/` dnsmasq、`||domain^` AdGuard；无效行计入注释统计。
- **去重**：自定义 DNS 按 domain 去重（3.7.10）；域名/白名单按归一化键去重。
- **白名单语义（3.7.29）**：黑名单拦截列表剔除白名单域名。
- **头部**：每种格式输出版本与域名计数（对齐 `generateHeader`）。
- **组件对齐**：`wireframes.html` 组件库对齐 `src/components/ui/` 全部 12 个 shadcn 封装（其中 `Tabs` 自 v3.15.5 起已废弃、仅暂保留）；`flows.html` 业务流程对齐 `SettingsPanel` / `UrlSection` / `Footer` 交互语义。
- **未同步（原型边界）**：URL 为模拟 fetch（真实实现见 `src/utils/domainFetch.ts` 流式读取 + 10MB 上限）、完整 merlin/openwrt usage 多行。

## 使用方式

直接用浏览器打开 `prototype/dashboard.html` 预览**当前 v3.22.2 原型**（顶部界面切换器可切换桌面 / 移动 / FAQ / 状态页）；无需构建。交互为纯前端 vanilla JS，数据内联、零外部依赖。`prototype.html` / `wireframes.html` / `flows.html` 为冻结快照，同理可直接打开，但仅作设计留档。

## 版本

当前原型 `dashboard.html` 版本 **v3.22.2**（与实现同步）；历史快照 `prototype.html`(v3.9.7) / `wireframes.html`(v3.10.1) / `flows.html`(v3.10.1) 冻结于 v3.12.0 结构审查，不再回填版本与指标。当前实现版本以 `package.json` / `src/config/version.ts` 为准。
