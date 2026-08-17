# Changelog

本项目所有重要变更均会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [3.7.37] - 2026-08-17

### Added
- 页脚新增 GitHub Star 引导按钮：在 GitHub 链接旁以主色高亮胶囊样式展示"如果对你有帮助，请给项目点个 Star ⭐"，引导用户为仓库标星
- 新增 `starLink` / `starLinkAria` 国际化文案（中英文提供，其余语言经 deepMerge 兜底 zh-cn）
- 补充 `footer-star-link` 语义化样式与 `github-star-link` id

## [3.7.36] - 2026-08-17

### Changed
- 更新项目字体风格，参考 Claude Code 官方排版（Anthropic 品牌观感）
  - 引入设计令牌 `--font-sans`（Inter）与 `--font-mono`（JetBrains Mono 几何等宽），统一正文与代码字体栈
  - `tailwind.config.js` 的 `fontFamily` 映射至上述 CSS 变量，使 `font-sans`/`font-mono` 工具类全局一致
  - 正文强化 Inter 字符变体（`ss01`）与 `optimizeLegibility`，标题沿用 `tracking-tight`
  - `layout.tsx` 预连接并加载 Google Fonts（Inter + JetBrains Mono），离线时回退系统字体保证可用
  - 同步全局版本展示位至 v3.7.36

## [3.7.35] - 2026-08-17

### Changed
- 品牌资产迁移至 `public/`：根 `brand/` 目录资产整合进应用资源目录，消除重复源
  - `logo.svg` / `favicon.svg` 同步至 `public/` 根（应用页眉与浏览器 favicon）
  - 新增 `public/logo-mono.svg`（单色反白标志，深色背景/单色印刷用）
  - 品牌文档（`brand-colors.md`、说明）移入 `public/brand/`（线上可访问）
  - 删除根 `brand/` 目录，品牌资源统一以 `public/` 为运行时读取位置
- 同步全局版本展示位至 v3.7.35

## [3.7.34] - 2026-08-17

### Added
- 品牌资产归集至仓库根 `/brand` 目录（权威源）：`logo.svg`、`favicon.svg`、`logo-mono.svg` 反白版、`brand-colors.md` 调色板规范、`README.md` 资产索引与使用规则
- 应用级 logo/favicon 置于 `public/`（与 `brand/` 同源同步），符合"应用 logo 放应用同目录"约定
- `brand/brand-colors.md` 完整品牌调色板：主蓝（Light #0D5FE2 / Dark #2674F2）、蓝色阶 50→900、中性色、语义色

### Changed
- `shadcn/design-system.md` §9 与 `prototype/README.md` 品牌形象章节更新为 `brand/` 权威源 + `public/` 应用副本结构，补充反白标志与禁区规则

## [3.7.33] - 2026-08-17

### Added
- 完善品牌形象资料：新增矢量 `public/logo.svg`（盾牌+文字）与 `public/favicon.svg`（盾牌+防护对勾，品牌主蓝 #0D5FE2）
- `layout.tsx` 增加 SVG favicon 引用（`<link rel="icon" type="image/svg+xml">`），PWA PNG 图标集保留
- 统一品牌主色：manifest 与 `viewport.themeColor` 由旧蓝 `#007AFF` 改为设计系统 primary 的 `#0D5FE2`（浅色）/ `#2674F2`（深色）
- 原型（`prototype/`）品牌色与版本号同步至 v3.7.33，与设计系统 token 完全一致

### Changed
- 品牌色语义对齐 `shadcn/design-system.md` 的 `--primary`（HSL 217 89% 47%），消除与原设计系统的色差

## [3.7.32] - 2026-08-17

### Fixed
- 修复 `parser.ts` 统计 bug：空行被误计入 `commentCount`，导致统计面板注释数失真（空行不再计入注释统计）
- 修复 `fileUtils.ts` 错误掩盖 bug：超体积（`readBodyWithSizeLimit` 抛出"响应过大"）后 `finally` 中 `decoder.decode()` 在流被 `abort` 时可能抛异常，覆盖原始错误信息；改为仅在正常结束时解码尾部，并显式保留"响应过大"错误
- 修正 `sortDedupe.test.ts` 排序断言以匹配真实块级排序语义（注释分组保持原序、块内数据按归一化域名排序）
- 新增 `parser.test.ts` 空行统计用例，明确空行不计入 `commentCount`
- 同步滞后源文件头注释（parser/sortDedupe/useDomainData/useSettings/useUrlManager/config/index/app/Home 等）与全局展示位至 v3.7.32

## [3.7.31] - 2026-08-17

### Fixed
- 修复生产构建 Type 错误：`src/types/index.ts` 的 i18n 类型缺失 `whitelist.hostsNote` 字段（`rulesGenerator.ts` 引用导致 `next build` 失败）
- 修复 `useRules.ts` 中 `useEffect` 的 `react-hooks/exhaustive-deps` 警告：将 `runGenerate` 纳入依赖数组
- 同步全部源文件头注释与展示版本号至 v3.7.31

### Changed
- `layout.tsx` JSON-LD `softwareVersion` 与 `public/*.txt` 样例头版本号对齐至 v3.7.31
- `openspec/SPEC.md` 本地拦截域名计数更新为脚本统计值 524（原手填 425+）
- 新增 `scripts/count-domains.mjs`，将域名计数脚本化并支持 `--write` 同步样例头部，避免手动维护漂移
- `openspec/CHECKLIST.md` 文件结构清单改为引用 `SPEC.md §2`，消除与规范重复维护
- `openspec/{SPEC,CHECKLIST,TASKS}.md` 新增「最后审查」日期锚点（2026-08-17）

## [3.7.30] - 2026-08-17

### Fixed
- 修复 `next.config.js` CSP 中重复的 `img-src` 指令（删除冗余行，避免后一条覆盖前一条导致 GA 图片域名失效）
- 同步文档与展示版本号至 v3.7.30：README.md、README.en.md、DEPLOYMENT.md、openspec/SPEC.md、openspec/TASKS.md、openspec/CHECKLIST.md、`layout.tsx` 元数据/JSON-LD、prototype 标题与默认值
- 修正 openspec/TASKS.md、CHECKLIST.md 中将根目录文档误写为 `docs/` 子目录路径的描述
- 补全 openspec/SPEC.md 中 Content-Security-Policy 模板为 `next.config.js` 实际完整指令，便于安全审计对齐
- 统一 src 下 49 个源文件头注释版本号至 v3.7.30（此前滞后于实际发布版本）

### Refactor
- 拆分 `src/hooks/useDomainData.ts`（205→160 行）：将自动保存的 schema 校验与 localStorage 读写纯逻辑抽离至 `src/hooks/autosaveStorage.ts`，主 hook 仅保留 React 编排，符合单文件 ≤200 行规则
- 审查确认全仓库无语法错误、无安全漏洞（路径穿越净化/DoS 体积上限/XSS 防护到位）、无性能问题，关键 DOM 均含语义化 id

## [3.7.29] - 2026-08-17

### Fixed
- 白名单在 dnsmasq/hosts 格式下真正生效：黑名单生成时剔除白名单域名，dnsmasq 不再对白名单域名写入 `address=/domain/IP` 黑洞规则，hosts 不再写入拦截行

### Docs
- 同步文档单一来源版本号至 v3.7.29：DEPLOYMENT.md、openspec/config.yaml、openspec/SPEC.md、README.md、README.en.md 版本号/徽章统一
- 同步 `next.config.js` env.version 与 `layout.tsx` 元数据/JSON-LD 展示版本至 v3.7.29
- 更新 public 静态样例（hosts.txt/dnsmasq.conf/adguard.txt）版本头至 v3.7.29
- hosts 白名单区块追加说明注释（hosts 原生不支持白名单语法，完整放行规则请使用 AdGuard 格式）
- 补正 `src/config/version.ts` 的 `APP_VERSION` 单一来源版本滞后（此前停留在 3.7.26）
- 升级全项目单一来源版本号至 v3.7.29
- 修复 `clearAll` 未重置 `parsedData` 导致清空后右侧合并统计（mergeInfo）残留旧域名/白名单数据的不一致问题
- 修复 AdGuard 黑名单规则 `||domain^$important` 等带 `$` 修饰符或缺失 `^` 结尾时被误判为无效域名、丢失拦截的问题

## [3.7.28] - 2026-08-17

### Fixed
- 修复 AdGuard 白名单例外规则 `@@||domain^$important` 无法识别的问题
- `parseDomainLine` 放宽 AdGuard 例外规则匹配：支持带 `$` 修饰符（如 `$important`）的规则，正确提取域名归入 whitelist
- 新增对应单元测试并全部通过
- 升级全项目单一来源版本号至 v3.7.28

## [3.7.27] - 2026-08-16

### Fixed
- 修复白名单"右侧生成窗口为空"问题：左侧已解析出白名单数据时，右侧 whitelist 标签页仍空白
- `useRules` 新增 sourceInput 变更自动生成 effect，确保右侧预览（含 whitelist 标签页）始终同步当前数据，不再依赖手动点击"生成规则"
- 升级全项目单一来源版本号至 v3.7.27

## [3.7.26] - 2026-08-16

### Fixed
- `useUrlManager` URL 输入框由非受控 `defaultValue` 改为受控 `urlInput` 状态：清空/回显一致，避免依赖 ref.value 造成的不同步
- `useSettings` 与 `Footer` 统一引用单一版本来源 `src/config/version.ts` 的 `APP_VERSION`，消除硬编码版本号滞后（此前 Footer 显示 3.7.21）
- `useDomainData` 恢复本地自动保存时增加 schema 校验（仅接受合法非空字符串且 ≤5MB），拒绝 localStorage 脏数据/超长内容
- 补充 `domainFetch` 结构化结果单测（成功/空/超长/网络错误）与 `parser` 的 `invalidCount` 断言，提升关键路径覆盖

## [3.7.25] - 2026-08-16

### Added
- 全站接入 Google Analytics 4（衡量 ID `G-1VNKFYGRXR`）：于根布局注入 gtag 脚本，覆盖所有页面
- `.env.local` 新增 `NEXT_PUBLIC_GA_MEASUREMENT_ID` 配置项
- `next.config.js` 的 CSP 放开 `www.googletagmanager.com` / `www.google-analytics.com` 脚本与上报域名
- 升级全项目单一来源版本号至 v3.7.25

## [3.7.24] - 2026-08-16

### Fixed
- `useDomainData` 远端加载与本地自动保存恢复串行化：引入 `autosaveRestoredRef`，远端内容不再覆盖用户本地草稿
- `domainFetch` 返回结构化结果（ok/text/error），区分 network/timeout/too_large/empty 失败原因，便于精准提示
- `useUrlManager.loadPreset` 多镜像降级：预设源提供 github 主源 + jsdelivr 镜像，主源被墙时自动切换
- `parser` 无效行（非法白名单/customDns/域名）从 commentCount 拆分到独立 invalidCount，统计数字不再失真

### Refactor
- `domainValidator.ParseStats` 与 `types.Stats` 新增 `invalidCount` 字段（向后兼容）
- `config.presets` 重构为多镜像数组（`presetMirrors`），公开类型 `PresetName`
- 裁剪 domainFetch/parser/domainValidator/config/useUrlManager 末尾多余空行
- 删除 domainValidator 未使用的 `CustomDnsEntry` 导入
- 升级全项目单一来源版本号至 v3.7.24

## [3.7.23] - 2026-08-13

### Docs
- 将 Community Health Files（CONTRIBUTING/SECURITY/SUPPORT）从仓库根目录移入 `.github/` 集中管理
- 新增 `CODE_OF_CONDUCT.md`（Contributor Covenant 2.1）、`PULL_REQUEST_TEMPLATE.md`、`FUNDING.yml`、`.github/README.md`
- 补全缺失的 `ISSUE_TEMPLATE/bug_report.md`；修正 `ISSUE_TEMPLATE/config.yml` 失效的 `docs/` 路径与仓库链接
- 统一社区文档仓库链接为 `ArcesTeam/DNS_Shield`，SECURITY.md 命令由 npm 改为 pnpm，移除 SUPPORT.md 占位邮箱
- 同步 openspec 版本号（config.yaml / SPEC.md）至 v3.7.23

### Fixed
- `next.config.js` 强化 CSP：新增 `upgrade-insecure-requests` 与 `require-trusted-types-for 'script'`，收紧 DOM XSS 注入面
- `OutputPanel` 输出渲染处补充内容清洗安全约束注释（outputContent 来源均经 parser/rulesGenerator 校验，以文本节点渲染而非 dangerouslySetInnerHTML）
- `Home.showToast` 缺少翻译键时输出 `console.warn`，便于发现漏翻
- 裁剪 AppContext/OutputPanel/useTheme/useLanguage/useRules/i18n/useUrlManager/useSettings/useLoading 末尾多余空行
- 升级全项目单一来源版本号至 v3.7.23（package.json / next.config.js / src 文件头注释）

### Added
- 新增 `scripts/check-locales.mjs`：以 zh-cn.json 为基准递归校验所有 locale 键一致性，并加入 `npm run check:locales`（CI 友好）

## [3.7.22] - 2026-08-13

### Docs
- 完善项目文档：README 补充架构与数据流、配置项、SEO 与元数据章节，更新项目结构树
- 同步 openspec/SPEC.md 目录结构与版本号，修正缺失的 domainFetch/sortDedupe/rulesGenerator.test 与 app 下 robots/sitemap/manifest/sw 文件，移除不存在的 .env.local 与误列的测试文件
- 修正 DEPLOYMENT.md 版本号与 Docker 启动模式说明（默认 next start，非 standalone）
- 升级全项目单一来源版本号至 v3.7.22（package.json / next.config.js / layout.tsx 头注释 / openspec/config.yaml）

## [3.7.21] - 2026-08-10

### Changed
- 为所有容器补充语义化 id：SettingsPanel 字段网格/各字段/复选项、UrlSection 预设区与列表项、Footer 内容/步骤/提示、Header 操作区、OutputPanel 空状态等

## [3.7.20] - 2026-08-10

### Style
- 为所有组件与页面容器补齐语义化 `id`，便于调试与端到端测试定位
- 涉及 InputEditor/InputPanel/Header/UrlSection/SettingsPanel/OutputPanel/Home 的块级容器（editor-container、input-section-header、input-editor-actions、header-top、header-brand、url-input-row、url-actions、settings-inner、output-body、output-header、output-panel-title、output-toolbar、output-editor-wrapper、main-content 等）

## [3.7.19] - 2026-08-10

### Changed
- 新增主题感知自定义滚动条：浅色用 border 系色，深色模式滑块降至 24% 亮度并加轨道内边距，消除右侧内容区滚动条突兀感
- `prototype.html` 解析/生成逻辑对齐真实引擎（`parser.ts`/`rulesGenerator.ts`/`domainValidator.ts`）：支持 `@@||domain^` AdGuard 白名单、hosts(`0.0.0.0/`127.0.0.1`) 与 dnsmasq(`address=/`) 与 AdGuard(`||domain^`) 格式行解析；自定义 DNS 按 domain 去重（保留首次）；头部输出格式专属描述行（descMap）；白名单标题走 i18n（`whitelistTitle`）

## [3.7.18] - 2026-08-10

### Changed
- 输入域名清单与输出预览默认高度由 200px 提升至 320px（输出上限 400px→560px），左右两栏内容高度一致对齐

## [3.7.17] - 2026-08-10

### Fixed
- `OutputPanel` 输出头部改为标题独占一行、格式切换 Tab（Hosts/Dnsmasq/AdGuard/白名单）换行至标题下方，避免窄屏挤压导致白名单 Tab 难以点击/生成不可见
- `OutputPanel` 合并信息栏改为基于已解析输入实时显示统计（黑名单/白名单/自定义DNS），白名单解析后即呈现，消除"白名单生成失败"观感

## [3.7.16] - 2026-08-10

### Fixed
- `domainValidator.parseDomainLine` 识别 AdGuard 白名单语法 `@@||domain^`，转 `whitelist` 类型，避免导入 AdGuard 源时白名单被静默丢弃
- `SettingsPanel` 4 个文本输入由 `defaultValue`（非受控）改为受控 `value`，确保程序化修改 `settings` 后正确回显
- `useUrlManager.fetchFromUrl` 移除 `fetchFn` 内重复 `validateUrlInput()` 调用，避免校验失败 toast 重复弹出
- `src/utils/domainFetch.ts` 文件头版本号 3.7.14 → 3.7.15（统一版本号口径）

## [3.7.15] - 2026-08-09

### Refactor
- 拆分 `useDomainData.ts`（206 行）超 200 行限制：`fetchDomainsText` 流式拉取逻辑抽离至 `src/utils/domainFetch.ts`，主 hook 仅保留状态与编排，公开 API（`useDomainData`）保持不变，依赖数组同步收敛

## [3.7.14] - 2026-08-09

### Fixed
- `prototype.html` / `prototype.canvas.tsx` 的"数据切换"按钮补 `aria-pressed`（true=有数据），符合交互规范 §7 切换控件语义
- `prototype.html` 语言下拉菜单支持 `Escape` 关闭并聚焦回触发按钮（键盘可达性，规范 §5.1）
- `prototype.html` Toast warning 文字色由白改为 `foreground`，修复白字 on `--warning`(#F59E0B) 对比度 ~2.1:1 不达标 WCAG AA 的问题
- 统一全项目版本号至 v3.7.14（package.json、next.config.js、源文件头部注释、README/openspec/prototype 文档）

## [3.7.13] - 2026-08-09

### Fixed
- 修复 `prototype.canvas.tsx` 的 `toggleData` 闭包 bug（旧 `showData` 值导致空状态/有数据恢复逻辑错乱），改用 `prev` 推导
- `prototype.html` 输出格式 tabs 补全 ARIA `tabpanel` 关联（`role="tabpanel"` + `aria-controls`/`aria-labelledby`），符合交互规范 §7.2
- `prototype.html` 全局键盘快捷键对齐交互规范 §5.1（Ctrl/Cmd+Enter 生成、Ctrl/Cmd+S 保存、Ctrl/Cmd+D 下载、Ctrl/Cmd+Shift+C 复制）
- `prototype.html` Toast 区分类型时长（success 3s / warning 4s / error 5s）并加错误/警告配色；fetch 加载态改用 Spinner（Button isLoading 规范）
- `prototype/shadcn/design-polish-report.md` 修正色彩空间表述为 HSL（非 oklch），标题去除 emoji

### Docs
- `prototype/OVERVIEW.md` 明确 `prototype.canvas.tsx` 为"React 静态视觉示意原型"（不含交互逻辑），如实描述与 html 版的能力差异；修正圆角描述（lg=10px）与 oklch 措辞
- 统一全项目版本号至 v3.7.13（package.json、next.config.js、源文件头部注释、README/openspec/prototype 文档）

## [3.7.12] - 2026-08-09

### Fixed
- 移除 61 个文件误写入的 UTF-8 BOM（根因：版本 bump 脚本以 BOM 模式写入 `package.json`，致 pnpm/build/lint/test 全部解析失败），构建与校验链路恢复
- `useDomainData.fetchDomainsText` 改为流式读取并按累计字节强制截断（10MB），不再仅信任 `content-length` 头，关闭 DoS 体积绕过缺口
- `UrlSection` URL 列表 `key` 由 `index` 改为 `url:index`，修复删除项重排错乱

### Perf
- `uiUtils.generateLineNumbers` 改用数组 `join` 替代循环字符串拼接，大文本下减少中间字符串分配
- `i18n` 16 语言 × 109 键全覆盖校验通过；多语言切换经类型与文案一致性确认

### Refactor
- 拆分 `parser.ts`（201 行）超 200 行限制：`sortDomains`/`dedupeDomains` 抽离至 `src/utils/sortDedupe.ts`，主文件仅保留 `parseSource` 编排核心，公开 API 通过 re-export 保持兼容

### Docs
- 统一全项目版本号至 v3.7.12（package.json、next.config.js、源文件头部注释、README/openspec/prototype 文档）
- `globals.css` 设计系统版本号（3.7.9 → 3.7.12）
- 完善 `README.en.md`：域名数 473+ → 524+、预设源对齐（built-in/AdGuard/EasyList/NeoHosts）、补 URL 导入/自定义 DNS/自动保存等特性
- 修正 `DEPLOYMENT.md`：Dockerfile 改用 pnpm 并启用 corepack；`next.config.js` 片段去除误导的 `output:'standalone'`，反映真实配置
- `CONTRIBUTING.md` 开发流程命令统一为 pnpm
- `openspec/SPEC.md` 版本历史补充 v3.7.10/v3.7.12 记录

## [3.7.10] - 2026-08-09

### Fixed
- 修复自定义 DNS 规则生成重复：`parseSource` 对 `customDns` 按 domain 去重（保留首次），避免 `@domain=ip` 重复条目生成重复 `address=/domain/ip` 规则
- 收紧 CSP：`next.config.js` 的 `script-src` 移除误加的 `https://raw.githubusercontent.com`（其为数据拉取源，已由 `connect-src 'self' https:` 覆盖），降低脚本注入面

### Changed
- `useRules.downloadOutput` 用显式 `filenameMap` 映射替代动态拼接 key + `as string` 强转，消除类型绕过
- `i18n.deepMerge` 用 `Record<string, unknown>` 替代 `any`，符合 TypeScript strict 精神
- 移除 `domainValidator.ts` 未使用的 `ParsedData` 导入
- 统一全项目版本号至 v3.7.10

## [3.7.9] - 2026-08-09

### Improved
- 全面实施原型合理规范改进（17 项）：
  - **保真度**：新增 `customDns` 统计项并参与输出（内置预设含 `@domain=ip` 示例）；去重归一为小写+去 `*.` 前缀（与真实 parser 一致）；`generateRules` 的 customDns 域名归一；白名单格式分支（`server=/`/`@@||`）本已正确保留
  - **无障碍**：统计区 `aria-label` 随语言切换（`statsLabel`）；语言菜单升级为 `role="menu"`+`menuitemradio`+`aria-checked`；URL 删除按钮 `aria-label` 语义修正为"移除 URL"；`aria-live`（mergeInfo/toast）与 `aria-controls`（折叠面板）本已实现并确认
  - **交互**：`fetchUrl`/`fetchAll` 增加 loading 态（禁用+文本切换，模拟 `withLoading`）；复制增加 `execCommand` 回退；`importSample` 与内置预设行为统一（消除重复入口歧义）
  - **文档**：OVERVIEW.md 新增"已知简化项"清单（URL 抓取为模拟、customDns 仅在示例体现、多语言为演示机制、对比度/reduced-motion 说明）
- 统一全项目版本号至 v3.7.9

## [3.7.8] - 2026-08-09

### Improved
- 改进高保真原型 prototype.html 不合理设计：
  - 预设切换真正加载对应示例数据（内置/AdGuard/EasyList/NeoHosts 各一套），而非始终显示内置 mock
  - 头部注释改为多语言（`t('titleMap')`/`headerTitle`/`sVersion` 等），切换语言后输出注释同步翻译
  - 移除与"域名"值重复的冗余"黑名单"统计项；`mergeInfo` 改用正确字段（域名/白名单/有效），去除误用的 `presetNeohosts`
  - 移除冗余的"解析域名"按钮，保留单一"生成规则"入口（输入即实时解析统计）
  - "获取"URL 点击后若 URL 有效自动加入列表（更贴近真实行为）
  - `parseSource` 空行不再计为注释（与真实 parser 一致）
- 同步 prototype.canvas.tsx：移除黑名单统计项、预设列表与 HTML 对齐为 4 个、按钮/空状态文案同步
- 同步更新 prototype/OVERVIEW.md 描述

## [3.7.7] - 2026-08-09

### Fixed
- 修复高保真原型 prototype.html 审查问题：语言切换器真正切换界面文案（zh/en 完整词典 + 其余语言回退英文演示机制）、设置开关/输入框变更后实时重算输出、解析按钮真正触发解析并自动生成、语言下拉选项点击同步 active 与 aria-selected、折叠按钮状态词随语言切换
- 修复 `src/hooks/useUrlManager.ts`：`withLoading<string>` 泛型错误（fetchFn 实际返回 `FetchUrlsResult`），改为 `withLoading<FetchUrlsResult>` 并导入 `type FetchUrlsResult`

## [3.7.6] - 2026-08-09

### Docs
- 更新 prototype/OVERVIEW.md：修正交付物编号重复（### 2. 重复 → ### 3.），同步全部原型文档版本引用至 v3.7.6
- 统一全项目版本号至 v3.7.6

## [3.7.5] - 2026-08-09

### Fixed
- 修复高保真原型 prototype.html 设计问题：新增 16 语言切换器、可折叠 URL 高级区(4 个真实预设源+URL 列表/操作)、输出设置面板(折叠)、Header 含 h1+副标题、修正输出示例版本号至 3.7.5、补全键盘无障碍(Enter/Space、aria-pressed/selected)
- 原型复刻 parseSource/generateRules 真实逻辑，解析/生成驱动输出，设置实时影响结果
- 统一全项目版本号至 v3.7.5


## [3.7.4] - 2026-08-09

### Added
- 新增独立高保真原型 prototype/prototype.html（纯 HTML+CSS+JS，零依赖可直接浏览器打开，含深/浅主题、有数据/空状态、四种格式切换、行号编辑器、响应式布局）

### Changed
- prototype/OVERVIEW.md 与 openspec/SPEC.md 文件结构新增 prototype.html 说明
- 统一全项目版本号至 v3.7.4


## [3.7.3] - 2026-08-09

### Changed
- 统一全项目版本号至 v3.7.3（补齐 prototype 子文件、globals.css 设计系统注释、DEPLOYMENT 环境变量表、service-worker / vitest / SPEC / config.yaml 等位置的版本引用）


## [3.7.2] - 2026-08-09

### Fixed
- 修复白名单生成失效观感：生成规则时同步将实时解析结果写回 `parsedData`/`stats`，消除防抖延迟导致的"规则已生成但白名单计数仍为 0"的不一致
- `useRules.generateRules` 新增 `syncParsedData` 回调，`Home` 传入 `parseSourceData` 复用既有解析逻辑

### Changed
- 统一全项目版本号至 v3.7.2（src 文件头注释 / package.json / next.config.js / layout.tsx / useSettings 默认值 / README / README.en）

## [3.7.1] - 2026-08-09

### Fixed
- 修复 `next.config.js` 与 `layout.tsx` 版本号漏改（3.6.1 → 3.7.1），统一全项目版本号
- 修复 `loadDomainData` 鲁棒性：fetch 远端预设源新增 10s AbortController 超时与 10MB 体积上限，远端/本地均失败时不静默吞异常并保留空状态
- 更新 `openspec/SPEC.md` 文件结构：移除已删除的 `prototype.html` 与 `components-showcase.html` 引用

### Security
- `loadDomainData` 同源 `/domains.txt` 回退同样受 10MB 体积上限保护，避免异常大响应耗尽内存

### Changed
- 统一全项目版本号至 v3.7.1（package.json / next.config.js / layout.tsx / 4 份设计文档）

## [3.7.0] - 2026-07-21

### Security
- `fetchFromUrl` 新增 10MB 响应体积上限，采用流式读取（ReadableStream + 中途中止），防止恶意/异常大响应耗尽内存（DoS 防护）
- `isValidHttpUrl` 继续强制仅允许 http/https 协议，阻断 `javascript:`/`ftp:` 等危险协议

### Performance
- `fetchFromUrls` 由串行 `for` 循环改为 `Promise.allSettled` 并发抓取，多源导入速度显著提升

### Changed
- 补充 `fileUtils` 单元测试：响应体积上限、非法 URL 拦截、HTTP 非 2xx 报错、并发抓取容错（失败项进入 `failedUrls` 不中断整体）
- i18n 复核：16 种语言翻译键 100% 覆盖，多语言切换与 fallback 验证正常
- 统一全项目版本号至 v3.7.0

## [3.6.1] - 2026-07-21

### Fixed
- 修复 `parser.sortDomains` 在大列表下比较器内重复解析域名的性能问题（改用 Schwartzian 变换，解析一次后排序）

### Changed
- 全项目代码审查与质量对齐：TypeScript 严格类型检查、ESLint、Vitest（31 项）全部通过
- i18n 复核：16 种语言翻译键全覆盖，多语言切换验证正常
- 对齐 `openspec/SPEC.md` 与 `prototype/` 规范文档版本号
- 统一全项目版本号至 v3.6.1

### Added
- 新增 `rulesGenerator` 单元测试，覆盖 Dnsmasq/Hosts/AdGuard/白名单/自定义 DNS/去重/阻止 IPv6 等核心规则生成逻辑

## [3.6.0] - 2026-07-21

增量版本对齐：代码与文档版本号统一至 v3.6.0（未单独记录变更日志）。

## [3.5.0] - 2026-07-17

### Added
- 新增 12 个 i18n 翻译键（`hostsFormat`、`dnsmasqFormat`、`mergeStats`、`versionLabel`、`languageSelectorAria`、`statsAria`、`editorActionsAria`、`outputActionsAria`、`outputFormatAria`、`urlActionsAria`、`urlListAria`、`usageGuideAria`），覆盖全部 16 种语言
- `Badge` 组件新增 `success` 和 `warning` 变体
- `Button` 组件新增 `isLoading` 状态（带 spinner 动画）
- 新增 HTTP 安全头部：HSTS、Cross-Origin-Opener-Policy、Cross-Origin-Resource-Policy
- CSP 新增 `frame-ancestors 'none'` 和 `worker-src 'self' blob:` 指令
- 新增 `sanitizeFilename()` 函数，防止路径遍历攻击
- OpenSpec SPEC.md 新增安全规范章节（11.5）

### Changed
- 统一原型文件（`prototype.html`、`prototype.canvas.tsx`、`components-showcase.html`）、安全审查报告、示例输出文件（`dnsmasq.conf`、`hosts.txt`、`adguard.txt`）、Bug 报告模板、SPEC.md 中的版本号至 v3.5.0
- `manifest.json` 的 `theme_color` 与 `viewport.themeColor` 对齐为 `#007AFF`
- Service Worker 缓存策略安全加固：仅缓存同源 GET 请求，按扩展名白名单过滤
- 设计系统文档色彩空间修正为 HSL（与实际 CSS 变量一致）
- README 文档新增安全特性和安全审查报告链接
- 全项目版本号统一至 v3.5.0

### Fixed
- 修复 `UrlSection` 预设标签访问 `t.builtin`（不存在）导致"内置数据"标签在所有语言下显示空白的功能性 bug（改用 `builtinAd` 映射）
- 修复 `Footer.tsx` 使用 `useState` 但缺少 `'use client'` 指令
- 修复 `useDomainData` 自动保存在清空输入后会被重新加载覆盖用户清空操作的 bug（拆分 useEffect + ref 守卫）
- 修复 `rulesGenerator` 中 `customDns` 在 `blockIPv6` 时硬编码 `::` 而非 `settings.ipv6` 的不一致
- 修复 `useUrlManager` 中 `urlInputRef.current!.value` 非空断言
- 修复翻译错误：`ar.json`（`removeWildcard`、`whitelistFormat`）、`id.json`（`removeWildcard`）、`cs.json`（`whitelistFormat`）
- 移除 `OutputPanel` 中 `isLangZh` 三元硬编码，改用 `t.mergeStats` 模板支持 16 种语言
- 移除 `OutputPanel` 中硬编码的 "Hosts"/"Dnsmasq" 标签，改用翻译键
- 修复 `Header` 语言选择器误用 `t.settingsTitle` 作为 aria-label
- 移除组件中所有硬编码的中文 aria-label（`统计信息`、`编辑操作`、`输出操作`、`URL操作`、`URL列表`、`使用指南`、`版本 x`、`{format} 格式输出`），改用翻译键
- 为所有装饰性 Lucide 图标添加 `aria-hidden="true"`
- `Loading` 组件添加 `role="status"`、`aria-live="polite"`、`aria-busy`、`aria-hidden` 无障碍属性
- `UrlSection` 的 `defaultValue` 改用 `config.domainsUrl`，消除硬编码重复
- 移除 `uiUtils` 中未被引用的 `syncScroll`/`syncOutputScroll` 死代码
- 移除 `InputPanel` 中重复定义的 `Stats` 接口，改用 `types` 中导出
- `useRules` 使用 `FormatType` 类型替代重复的字面量联合类型
- 移除 `useLoading`、`useDomainData`、`useUrlManager`、`useLanguage` 中未使用的导出/参数（`setIsLoading`、`loadDomainData`、`isLangZh`、`isChineseLanguage`）
- 修复 `prototype.canvas.tsx` 中 JSX 字符串包含中文引号导致的 TypeScript 编译错误
- 移除 `i18n.ts` 中语言列表的 emoji 图标

### UI Layout Fixes
- 修复 `globals.css` 中 30+ 个被组件使用但未定义的 CSS 类，导致页面布局完全错乱：
  - 根容器：补全 `.container`、`.main-content`（输入/输出面板 grid 布局）
  - 输入面板：补全 `.input-section`、`.section-header`、`.collapse-btn`、`.collapse-icon`、`.stats-compact`、`.stat-badge`、`.editor-actions`
  - URL 区域：补全 `.url-input-row`、`.url-input`、`.url-actions`、`.url-list`、`.url-item`、`.url-item-icon`、`.url-item-text`、`.url-remove-btn`
  - 预设标签：补全 `.preset-section`、`.preset-tags`、`.preset-tag`
  - 编辑器：补全 `.editor-container`（与 `.editor-wrapper` 共享样式）、新增 `.editor-preview`（div-based 输出预览）
  - 页脚：补全 `.footer-content`、`.footer-top`、`.footer-version`、`.usage-toggle`、`.toggle-arrow`、`.usage-guide`、`.usage-steps`、`.usage-step`、`.step-number`、`.step-content`、`.step-title`、`.step-desc`、`.usage-tip`、`.tip-label`、`.tip-content`
  - 加载：补全 `.loading-text`、`.loading-content`（spinner 和文字垂直居中堆叠）
- 统一折叠状态命名约定：组件使用 `collapsed` 修饰符（如 `class="url-section collapsed"`），CSS 改用组合选择器（如 `.url-section.collapsed`）替代不匹配的 `.url-section-collapsed`
- 修复 `InputEditor` 的 textarea 缺失 `editor-textarea` 类导致无边框、无 padding、无行高对齐
- 修复 `OutputPanel` 预览 div 误用 `editor-textarea` 类（已改为专用 `.editor-preview`，避免 resize 句柄出现在 div 上）
- 修复 `Loading` 组件 spinner 和文字横向排列（已改为通过 `.loading-content` flex-col 垂直堆叠）
- `header-top` 添加 `flex-wrap` 支持小屏幕品牌区和控制区换行

## [3.4.0] - 2026-07-03

### Added
- 根目录新增 `CHANGELOG.md`（Keep a Changelog 规范，含完整版本历史和 Release 链接）
- 新增 `.github/ISSUE_TEMPLATE/bug_report.md` — Bug 报告模板
- 新增 `.github/ISSUE_TEMPLATE/feature_request.md` — 功能请求模板

### Changed
- 重写 `.github/ISSUE_TEMPLATE/config.yml` 为标准 GitHub 格式（`contact_links` + `blank_issues_enabled`）
- 整理项目目录结构，移除冗余文件：
  - 移除临时工作记录文件 `overview.md`
  - 移除个人测试脚本 `test_e2e.py`（使用 Windows 本地路径）
  - 移除冗余工作区配置 `DNS_Shield.code-workspace`
  - 移除无效的 `pnpm-workspace.yaml`（引用不存在的 `unrs-resolver`）
  - 移除本地 IDE 配置目录 `.codebuddy/`
- 将 `shadcn/` 设计规范目录归入 `prototype/` 统一管理
- 版本号统一更新至 v3.4.0（源文件、文档、配置文件）

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

[Unreleased]: https://github.com/sutchan/DNS_Shield/compare/v3.4.0...HEAD
[3.4.0]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.4.0
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
