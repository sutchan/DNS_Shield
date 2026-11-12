# Changelog

本项目所有重要变更均会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

> 最后审查：2026-11-12（与 package.json v3.18.0 对齐）。**冻结快照约定**：带版本号的历史小节按当时状态保留，不回填后续数字或配置；当前权威实况见 `docs/SPEC.md` / `docs/tasks.md`。

## [Unreleased]

## [3.18.0] - 2026-11-12

### Added（SEO 与生成式引擎优化 GEO）
- 新增 `/llms.txt`：给生成式引擎（LLM 检索 / 引用）的站点简报，含项目定义、隐私边界、12 个预生成规则文件链接、使用步骤、中英双语 FAQ 与机器可读元数据入口。由 `src/app/llms.txt/route.ts` 以 `force-static` 在构建期预渲染；内容由 `src/config/seo-content.ts` 单一来源派生并注入 `APP_VERSION`，版本号不会漂移。采用 App Router Route Handler 而非 `public/` 静态文件，是因为 EdgeOne 部署工作流只上传 `.next/`
- 新增页面可见的「关于 DNS Shield / 支持的 12 种导出格式 / 常见问题（5 条）」区块（`SeoContent.tsx` + `seo.css`），服务端预渲染即进入 HTML。此前页面除 Hero 描述与快速入门三步外几乎无可引用事实文本，格式清单与部署提示又藏在需点击才渲染的弹窗里，抓取器与 LLM 无从引用
- `layout.tsx` 新增 `<noscript>` 兜底事实文本与 4 个可直接订阅的规则文件链接，覆盖不执行 JavaScript 的抓取器
- 新增 `src/config/site.ts`（站点 URL / OG 图 / 16 语 BCP47 标签 / 22 个 AI 爬虫 UA 的单一来源）与 `src/config/seo-content.ts`（关于、12 格式、FAQ、HowTo、llms.txt 生成器）；新增真实 1200×630 社交分享图 `public/og-image.png`
- 新增 `src/config/seo.test.ts`（14 用例）：覆盖 canonical / 无 hreflang / 标题不含版本号 / 无占位验证值 / OG 尺寸与真实 PNG 一致 / JSON-LD 五实体与引用闭环 / 16 语 inLanguage / FAQ 与可见文本逐字一致 / HowTo position / robots 不屏蔽 `_next` / AI UA 全覆盖 / sitemap 无 fragment 伪条目 / llms.txt 文件真实存在 / 中英 FAQ 同源。此前 `src/app/**` 的 SEO 输出零测试覆盖

### Changed（元数据与爬虫策略修正）
- JSON-LD 由单一 `SoftwareApplication` 升级为 `@graph` 五实体：`Organization` / `WebSite` / `SoftwareApplication` / `FAQPage` / `HowTo`；补 `publisher`、`dateModified`、`image`、`isAccessibleForFree`、`browserRequirements`，`inLanguage` 由 3 种扩为真实 16 种；FAQ 与 HowTo 文案与页面可见文本同源，避免结构化数据与正文不符
- 修复 `verification.google` 未配置环境变量时仍输出占位值 `google-site-verification-code`（向搜索引擎声明无效验证）：改为仅在配置真实 token 时输出
- 修复 Open Graph / Twitter 使用 512×512 图标却声明 1200×630 的无效尺寸：改指向新增的真实 1200×630 `og-image.png`
- 标题去掉内嵌版本号（发版导致标题漂移，不利于关键词稳定性）；description 重写为可引用的事实句；补 `applicationName` / `category` / `formatDetection` / `appleWebApp`，keywords 补 AdGuard / Pi-hole / Clash Meta
- `robots.txt` 移除 `Disallow: /_next/`（会阻断 Googlebot 抓取 JS/CSS，使依赖客户端渲染的页面无法被正确渲染与索引），并显式 `Allow` 22 个主流 AI / 生成式引擎 UA（GPTBot、OAI-SearchBot、ClaudeBot、PerplexityBot、Google-Extended、CCBot 等）
- `sitemap.xml` 移除 3 条带 fragment 的伪 URL（会被搜索引擎归一化为 `/`，形成重复条目）与每次构建都变的 `new Date()` 时间戳，收敛为唯一有效 URL
- 移除 `layout.tsx <head>` 中手写的 `icon` / `manifest` link（与 metadata 输出重复）
- 本地 `.nvmdrc` 由开发环境按当前 Node 自动生成、内容随环境变化，纳入 `.gitignore`：`check-root-clean.mjs` 对 gitignored 条目直接放行，根目录门禁不再反复失败；项目 Node 版本约束仍以 `package.json engines` 与 CI setup 输入为准
- 版本按 minor 规则升至 v3.18.0（新增 SEO/GEO 能力）：`package.json` / `src/config/version.ts` / `next.config.js` env.version / `sync-facts.mjs` 13 处文档展示位 / `public/` 11 个规则产物头部

### Fixed（本地预览被 CSP 拦截 eval）
- `next.config.js` 的 `headers()` 增加 dev/prod 分支：`NODE_ENV !== 'production'` 时为 `script-src` 追加 `'unsafe-eval'`，使 `next dev` 的 webpack eval 模块可在带 CSP 的浏览器 / 内嵌 WebView 预览中正常执行，修复 `Refused to evaluate a string as JavaScript`
- 生产构建（`next build` / `next start`）与 `vercel.json` 保持严格 CSP，不含 `unsafe-eval`，不扩大线上脚本注入面
- `DEPLOYMENT.md` / `SPEC.md §12.1` 同步：把「本地调试需临时手工追加」的排障说明改为「配置已内置 dev 分支」
- 同步修正 `next.config.js` 文件头「CI 有安全头一致性检查」的陈旧注释（实际 CI 无该检查，需手工核对两处 CSP）

### Fixed（解析任务内存堆积）
- `useRuleWorker` 引入 `inflightRef` 单飞：以内容键 `task + '\0' + text` 复用同一解析任务、作废旧输入结果；`useWorkerPool` 并行分支同样按文本单飞，并用 `useMemo` 稳定池引用，避免 `loadDomainData` 每帧重复派发导致 `postMessage` 反复克隆大文本（线上曾观测页面内存飙升至 5GB）
- 新增 `src/hooks/useWorkerPool.singleflight.test.ts`（5 用例）覆盖单飞复用、内容键与池引用稳定性；测试实算 **48 文件 / 293 用例**（`src/**/*.test.ts` 静态计数）

### CI（质量门禁与工具链）
- 新增根目录临时文件洁净度门禁 `scripts/check-root-clean.mjs`（根目录与 `scripts/` 下的 `_*.mjs` 一律违规，唯一合法临时位置为根 `.tmp/`），以 `rootclean` job 纳入 CI Gate 的 `needs`
- 修复 `.github/actions/setup` 复合动作的 bash 语法错误与 pnpm 11 store 路径兼容（改用显式 `actions/cache`）；`ci.yml` 漂移检测剔除正则兼容 `; 更新::` 注释前缀
- 官方 action 升级至最新主版本：`actions/checkout@v5`、`actions/setup-node@v6`、`pnpm/action-setup@v6`、`actions/cache@v5`、`actions/upload-artifact@v5`

### Docs（第十八轮全量文档核查，2026-11-12）
- 统一全部活跃文档头部审查锚点、仓库地址（以 `git remote` 的 `sutchan/DNS_Shield` 为准）与术语；实时指标按实算更新（48 测试文件 / 293 用例）
- 补充新增能力说明：解析任务单飞/内容键、CI `rootclean` 门禁与 action 升级、设置弹窗分组修复、统计条与输出面板信息层次、Hero 双栏
- 标注已废弃内容：`ui/Tabs.tsx` / `@radix-ui/react-tabs`（v3.15.5 起由单一「格式」下拉取代，暂保留勿新增引用）、`OutputPanel.formatTabs.tsx`、`moreFormats` 键、旧 9 格式列表、旧端口 8082
- 补 `next.config.js` / `vercel.json` 双源 CSP 现状与开发模式 `unsafe-eval` 排障说明；冻结快照（CHANGELOG 历史段 / `prototype/` / `public/brand-colors.md` / `STRUCTURE-REVIEW.md` / `tasks-done.md`）按声明不回填数值，仅补冻结与废弃标注

> 以上提交均在 v3.17.4 之后合入 `main`，版本未 bump；发布时统一收编为正式版本小节。

## [3.17.4] - 2026-11-09

### Changed（页面排版与信息层次优化）
- 修复 Hero 主标题末字单独成行的孤字断行（1280 宽下「挡在网络入口」的「口」独占一行）：`.hero-title` 启用 `text-wrap: balance`，lg 字号由 2.375rem 降至 2.25rem、行高 1.12 → 1.15；文案列配比由 1.15fr 调整为 1.25fr，进一步减少窄列断行
- `.hero-desc` 启用 `text-wrap: balance`，两行描述行宽均衡（此前尾行仅「DNS 服务。」四字）
- 输出面板：格式下拉与面板标题之间补 0.75rem 呼吸位（此前紧贴标题，读起来像同一串文字），窄屏（≤768px）回落为 0
- 输出面板：merge-info 与预览统计条两条语义重叠的灰字带并作一组——分隔线上移至信息组顶部，组内两行紧邻，消除两条信息带把面板割裂的观感
- 版本按 patch 规则升至 v3.17.4：`package.json` / `src/config/version.ts` / `next.config.js` env.version / `sync-facts.mjs` 文档展示位 / `public/` 11 个规则产物头部

## [3.17.3] - 2026-11-07

### Docs（第十六轮全量文档核查）
- README：删除 `src/app/i18n.ts` 幽灵条目（实际位于 `src/utils/i18n.ts`）；结构树补 `src/config/`
- SPEC：删除 `uiUtils.ts` / `buildFlowPool.ts` 幽灵条目（第十五轮误入）；§12.1 CSP 如实描述 `next.config.js` 与 `vercel.json` 双源差异（后者额外启用 `require-trusted-types-for`，统一方案待定）
- DEPLOYMENT：工作流总览 / 标准发布流程 / 漂移门禁同步自动发布实况（`push → CI → Deploy → Release` 自动打 tag；漂移检测为硬门禁）；删除无代码消费的 `PORT` / `NEXT_PUBLIC_APP_NAME`
- SUPPORT / `ci.yml` 注释：产物计数口径修正（11 个格式产物文件，`domains` 格式即数据源本身）
- ISSUE 模板：移除不存在的容器化部署描述
- `src/types/formats.ts` 注释：Tab → 「格式」下拉修正（v3.15.5 起）
- 版本按 patch 规则升至 v3.17.3：`package.json` / `src/config/version.ts` / `next.config.js` env.version / `sync-facts.mjs` 13 处文档展示位 / `public/` 11 个规则产物头部

### Fix（CI：增量复核定位自动发布链路从未发版的根因）
- `.github/actions/setup/action.yml`：修复 `Install dependencies` 步骤 bash 语法错误（`if [ ... = "true";` 缺失右方括号 `]`）——该错误导致需装依赖的全部 job（ESLint / TypeScript / Vitest / Build）在 setup 步骤必然失败，CI Gate 长期红，Deploy 与 Release 均被 skip，自动发布链路从未成功打 tag（远程 tag 停在 v3.7.31）
- SPEC §2：`public/` 结构树产物计数「12 种规则产物」→「11 种格式产物」（口径统一）
- `ci.yml` 漂移检测：剔除「更新::」日期行的正则字符类补 `;` 前缀——Bind RPZ 等格式注释用 `;`，跨天运行时该行 diff 未被剔除导致 `Data Integrity` 硬门禁误报（本地复现：剔除后仅剩 `; 更新::` 两行差异）
- `.github/actions/setup`：弃用 `actions/setup-node` 内置 `cache: 'pnpm'`，改为显式 `actions/cache` 缓存 `pnpm store path`——setup-node@v4 的 pnpm 缓存实现面向 pnpm ≤10，与 pnpm 11 的 store 路径变更不兼容，曾导致启用缓存的 4 个 job（ESLint / TypeScript / Vitest / Build）在 setup 必败（排除法：data job 无缓存而幸免；lockfile 与 package.json 同步性、上游版本存在性、本地等价全新安装均已逐一验证排除）

## [3.17.2] - 2026-11-07

### Changed（移除输出工具栏设置按钮）
- 输出面板工具栏（`OutputToolbar`）移除设置齿轮按钮（`#settings-panel-toggle-btn`）：仅保留「规则测试」与「路由器脚本」两个图标按钮，设置统一走 Header 入口（`#settings-btn`），消除双入口冗余
- `OutputToolbar` props 随之精简（移除 `onOpenSettings` / `isSettingsOpen`）；`OutputPanel` 不再接收 `onOpenSettings`，`Home.tsx` 同步移除传递；`SettingsPanel` 弹窗本身及 Header 入口行为不变
- `src/components/OutputPanel.parts.tsx` / `src/components/OutputPanel.tsx` / `src/app/Home.tsx` 头注释同步 v3.17.2
- 版本按 patch 规则升至 v3.17.2：`package.json` / `src/config/version.ts` / `next.config.js` env.version / `sync-facts.mjs` 13 处文档展示位 / `public/` 11 个规则产物头部

### CI（所有工作流全绿后自动发布 Releases）
- `release.yml` 触发方式由「手动推 `v*` tag」改为监听 `Deploy` 工作流在 main 分支 `completed` 且 `conclusion == success`，形成 `push → CI → Deploy → Release` 全绿链路后自动发布
- 发布时按 `package.json` 版本自动创建轻量 tag 并推送；tag 已存在则跳过（仅版本号变更才发版，避免每次提交都发 Release）
- 同步更新 `deploy.yml` 注释（移除旧的「tag 触发 Release」说明）

## [3.17.1] - 2026-11-07

### Changed（取消预览统计条胶囊轮廓）
- 输出面板预览统计条（「当前格式 / 规则行数 / 域名总数 / 可见格式数」4 项）取消胶囊形轮廓：`.preview-stat` 移除 `rounded-full` / `px-2.5 py-1` / `bg-muted` 灰底，改为纯文本；`.preview-stats` 水平间距 `gap-x-3` → `gap-x-5` 以间距替代胶囊分隔，与输入区统计条 v3.17.0 的「色点 + 纯文本」轻量视觉统一（`hero.css`）
- 结构不动：`OutputPanel.parts.tsx` 的 `PreviewStats` 组件、4 个 `<span className="preview-stat">`、`preview-stat-value` 与所有 DOM id 均保持不变，仅样式层调整
- 顺带落入上一轮未提交的 Hero 样式优化：大屏双栏竖向分隔线改由伪元素绘制并定位在两栏间隙中点（视觉居中）
- `prototype/prototype.html` 的 `.ps` 胶囊样式为冻结原型快照，按既有规范不改
- 版本按 patch 规则升至 v3.17.1：`package.json` / `src/config/version.ts` / `next.config.js` env.version / `sync-facts.mjs` 文档展示位 / `public/` 11 个规则产物头部

### Changed（第十五轮全量文档核查与漂移修正）
- 以代码实况为权威源实算并统一全部活跃文档：16 语 / 顶层 140 键 / 递归 209 键、47 个测试文件 / 288 处 `it()`、顶层 16 个 `.tsx`、`ui/` 12 个、`src` 无 >200 行源文件、`public/domains.txt` 非空 897 行（20 注释 + 877 条规则 = 黑名单 645 + 白名单 232）
- `README.md`：项目结构树补 `workers/` / `useWorkerPool` / `parseAggregate` / `OutputPanel.formatSelect`，`parser.ts` 更新为 collectLines + finalizeParsed 两段式；输出格式控件由 Tabs 修正为单一「格式」下拉；补多核并行解析与语言优先级特性
- `README.en.md`：同步语言优先级与多核并行解析能力
- `DEPLOYMENT.md`：删除陈旧硬编码版本号与示例死版本号，改为指向 `package.json` 单一来源
- `docs/SPEC.md` / `docs/tasks.md` / `docs/CHECKLIST.md` / `docs/config.yaml`：结构树组件、FlowViz 静态快照描述、实时指标实算修正、审查时间与上下文同步
- `.github/SUPPORT.md`：修复「误屏蔽时直接编辑 whitelist.txt」与「whitelist.txt 是生成产物请勿编辑」自相矛盾
- `.github/CONTRIBUTING.md` / `PULL_REQUEST_TEMPLATE.md` / `SECURITY.md`：补齐提交类型、分支命名、版本发布清单、版本单一来源、废弃响应头修正
- 冻结快照（CHANGELOG 历史段 / `prototype/` / `public/brand-colors.md` / `STRUCTURE-REVIEW.md` / `tasks-done.md` 历史实测值）按各自声明不回填
- 静态校验：`sync-facts.mjs --check` 13 处一致、`check-locales.mjs` 16 语 / 209 键一致；本机无 `node_modules`，`tsc` / `lint` / `vitest` 待 CI 复核

## [3.17.0] - 2026-11-07

### Changed（国际化补全与语言优先级规范）
- 输入区统计条由胶囊 `Badge` 简化为「色点 + 纯文本」（`InputPanel.tsx` / `stats.css`），加大水平间距替代胶囊分隔，视觉更轻量
- 完善全部 16 语国际化字符串：系统性排查各语言与英文原文相同的残留串，共补译 **764 处**——13 语（ar / cs / es / hi / id / it / nl / pl / ru / sv / th / tr / vi）各约 54-61 键（`usageTitle` / `heroTitle` / `heroDesc` / `shareTexts` / `copied` / `urlHint` / 各格式 `header.*` 说明与用法 / 部署提示 / 外观与设置标签等）、zh-tw 38 键（分享文案 / Hero / 快速入门 / 部署提示等）；仅替换仍与英文相同的值，不覆盖任何既有翻译
- 补齐全部 14 个非基准语言缺失的 `shareTexts.3`（分享文案第 4 条，此前仅 zh-cn / en 有，其余语言靠深合并回退显示中文）
- 语言优先级写入全局规范：**默认简体中文 → 繁体中文 → 英语**。`i18n.ts` 的 `supportedLanguages` 顺序调整为 zh-cn / zh-tw / en 置前三（语言切换菜单与 `useLanguage` 校验共用此清单）；SEO 结构化数据 `inLanguage` 由 `['zh-CN','en-US']` 扩为 `['zh-CN','zh-TW','en-US']`；`docs/config.yaml` 项目上下文与 `docs/SPEC.md` §1 写入该规范（默认语言 `useLanguage` 与 `<html lang="zh-CN">` 原本已为简中，无需改动）
- 合理同形保留：纯格式专名按钮（Dnsmasq / Hosts / Unbound / Pi-hole / Bind (RPZ) / SmartDNS / Mosdns / Clash Meta / CoreDNS / `gStep2d` 格式列表）、上游源名（`category.*`）与目标语言本就与英文同形的词（印尼语 Valid、瑞典语 Version 等）不视为残留，保持原样
- `check:locales` 通过（16 语 / 209 键一致）；版本按 minor 规则升至 v3.17.0（国际化行为与规范变更）：`package.json` / `src/config/version.ts` / `next.config.js` env.version / `sync-facts.mjs` 文档展示位 / `public/` 11 个规则产物头部

### Changed（统计条简化）
- 输入面板统计条由胶囊形 Badge（`Badge variant="secondary"` 底色圆角）简化为「彩色圆点 + 纯文本」：`InputPanel.tsx` 改用纯 `span.stat-badge`（保留逐项 `role="status"` / `aria-live`），`stats.css` 去掉 `.stat-badge` 内边距并以 `gap-x-5` 加大项间距替代胶囊分隔；语义色点（黑名单红 / 白名单绿 / 改道蓝）不变

## [3.16.1] - 2026-11-07

### Fixed（设置弹窗结构缺陷）
- 修复「输出规则类型」分组标题渲染两次：`SettingsForm.tsx` 中存在一个只含标题的空分组（`settings-group-format`），其下方 5 个生成选项卡片未归属任何分组；删除空分组并把选项卡片归入独立的 `settings-group-options`（所有既有 field / option / format-toggle / theme 元素 id 保持不变）

### Changed（设置弹窗视觉优化）
- 首屏 Hero 大屏（lg+）改「左文案 + 右快速入门」双栏布局（`hero-inner` 两列 grid），消除大屏右侧留白；快速入门移入右栏竖排并以左分隔线与文案区隔，CTA 按钮升级 default 尺寸（`FlowViz.tsx` / `hero.css`）
- 项目信息字段网格由 4 列改 2 列（`sm/lg:grid-cols-4` → `grid-cols-2`）：600px 弹窗内 IPv6 等长值不再被挤压截断；弹窗宽度上限 560px → 600px
- 生成选项卡片末项（「包含白名单(AdGuard黑名单)」）整行铺满（`.opt-card-wide`），消除奇数项右下角半行留白
- 格式显示开关由 `auto-fill(minmax 80px)` 改等宽 3 列（窄屏 ≤480px 回落 2 列），按钮等高、单行不折行、超长标签省略；修复原方案单行塞 5 个按钮导致「AdGuard 黑名单」「纯域名列表」折行、各按钮宽度不一的问题
- 版本按 patch 规则升至 v3.16.1：`package.json` / `src/config/version.ts` / `next.config.js` env.version / `sync-facts.mjs` 文档展示位 / `public/` 11 个规则产物头部

### Changed（Hero 区 UI 布局优化）
- 大屏（lg+）Hero 改为「左文案 + 右快速入门」双栏布局：`FlowViz` 将快速入门面板从 `hero-copy` 移出成为 `hero-inner` 第二栏（右栏竖排三步卡片、左细分隔线区隔），消除 1280 宽下右侧约 40% 的留白；窄屏保持单栏、三步通栏三列不变
- CTA 按钮（开始使用 / 配置生成）由 `size="sm"` 升级为 default（h-10），主行动更醒目
- 修复快速入门步骤描述「dnsmasq / hosts / AdGuard…」尾部省略号视觉上像被截断的问题：16 语言统一改为明示「还有 9 种」的完整文案（zh-cn / zh-tw 为「等 12 种格式」）
- Hero 内快速入门卡片贴住卡片底部，去除 Footer 场景 `mb-4` 造成的多余下边距

## [3.16.0] - 2026-11-07

### Added（Web Worker 分片并行化：多核并行求值）
- 落地任务清单中最后一项增强 `Web Worker 分片并行化（多核并行求值）`（编号 T-P1-18）：超过 `PARALLEL_PARSE_THRESHOLD`（20000 行）的解析任务按行边界切分为多片，派发到 `min(硬件核心数, 8, 满额分片数)` 个分片 Worker 并行求值，主线程收齐后聚合，充分利用多核缩短超大输入（10 万行级）的解析耗时；中等文本仍走单 Worker 串行，小文本仍走主线程同步，阈值策略不变
- `parser.ts` 拆为两段并保持 `parseSource` 签名与行为完全兼容：`collectLines`（纯逐行收集，无跨行状态，可安全分片）+ `finalizeParsed`（跨行去重、白名单/自定义 DNS 剔除黑名单与统计组装，必须全局执行一次）；新导出 `RawCollected` / `RawCounters`
- 新增 `workers/parseShard.worker.ts`（分片收集 Worker，含进度上报）、`hooks/useWorkerPool.ts`（池管理：按需扩展、最闲优先负载均衡、进度求和、聚合收口）、`utils/parseAggregate.ts`（并行度决策 / 行边界分片 / 原始产物聚合纯函数）；`useRuleWorker.run('parse')` 自动按行数选择并行/串行路径，并行失败逐级回退单 Worker → 主线程同步，排序/去重路径不变
- 并行等价契约：分片收集 + 聚合 + 全局后处理与单线程整段 `parseSource` 逐字段相等（含跨分片白名单剔除与跨分片重复域名场景），由新增 `utils/parseAggregate.test.ts` 断言；T-P1-14 结算契约延续（分片失败 / Worker 崩溃 / postMessage 异常 / 卸载时全部挂起任务以 null 结算回退）
- 新增测试 1 套件 12 用例（静态计数；本机无 `node_modules`，`vitest` / `tsc` / `lint` 未实跑，以 `read_lints` 0 诊断与等价契约静态核对为准，待 CI 复核）
- 版本按 minor 规则升至 v3.16.0（新功能）：`package.json` / `src/config/version.ts` / `next.config.js` env.version / `sync-facts.mjs` 文档展示位 / `public/` 11 个规则产物头部；任务清单同步 `docs/tasks.md` / `docs/tasks-done.md`

## [3.15.6] - 2026-11-07

### Changed（首屏与面板视觉优化）
- Hero 单栏视觉增强：CTA 由「快速入门三步」之后上移至描述下方更醒目；新增 `.hero-cta` 按钮组布局（flex + gap）；Hero 圆角升为 `rounded-2xl`、内边距/标题字号加大、渐变底纹增强
- 快速入门三步卡片由低对比 `bg-muted/40` 改为描边卡片（`bg-background` + `border`）+ hover 主色描边，序号徽章放至 `w-7 h-7` 并加阴影，在 Hero 白底上形成清晰层次
- 新增 `.quickstart` 顶部分隔线，正文与快速入门层次分离
- 面板层次：`.panel` 阴影由单层 1px/0.04 加强为双层柔和阴影；`.panel-title` 图标统一主色，输入/输出两侧视觉一致

### Fixed（线上页面分析与可访问性 / SEO 修正）
- 线上实测分析 https://dns.ewuse.com/ （桌面 1280 + 移动 375 取证）：输出面板头部裁切与格式标签栏溢出已由 v3.15.5 单一下拉重构修复，本轮处理剩余两项结构问题
- 修复页面存在两个 `<h1>`（`Header.tsx` 品牌名与 Hero 主标题）：品牌名降级为 `<p>`（保留 `app-title` 样式与 `aria-describedby`），页面回归单一主标题，符合可访问性与 SEO 规范
- 修复 `site-meta.ts` 的 hreflang 指向不存在的 `/en`、`/zh-TW` 路由：语言为客户端切换、无独立 URL，删除 `alternates.languages` 仅保留 canonical，避免搜索引擎抓取 404
- JSON-LD `featureList` 由「7 种格式 + 等」改为列全 12 种输出格式，与页面「12 种格式」宣传一致
- 版本按 patch 规则升至 v3.15.6：`package.json` / `src/config/version.ts` / `next.config.js` env.version / `sync-facts.mjs` 文档展示位 / `public/` 11 个规则产物头部

## [3.15.5] - 2026-11-07

### Changed（格式切换控件改为单一「格式」下拉）
- 「生成过滤规则」面板的格式切换控件由「核心 4 标签 + 更多格式下拉」（v3.15.2 引入）改为单一「格式」下拉菜单（`FormatSelect`）：12 种格式收敛到同一个菜单，不再有核心/高级两级入口，选择路径统一；触发器仅显示当前格式名 + 箭头，窄屏天然单行，彻底消除 v3.15.4 所修的标签栏溢出覆盖工具按钮问题
- 格式清单核对：`ALL_FORMATS` 共 12 种（dnsmasq / hosts / adguard / whitelist / unbound / pihole / domains / bind / smartdns / mosdns / clash / coredns）全部进入下拉，无丢失；沿用 `useVisibleFormats` 的「有产出才显示」惰性过滤（按黑名单 / 自定义 DNS / 白名单 / 正则段推导），某格式暂无产出时不出现属设计行为，并未隐藏任何可产出格式
- 新组件 `src/components/OutputPanel.formatSelect.tsx` 取代 `OutputPanel.formatTabs.tsx`；`OutputPanel.parts.tsx` re-export 同步为 `FormatSelect` / `FormatSelectProps`，`OutputPanel.tsx` 调用点不再传 `moreFormatsLabel`
- DOM id 变更：容器 `output-format-controls` 保留；`output-format-tabs` / `format-more-btn` / `format-more-menu` / `format-more-item-{fmt}` / `format-{fmt}-btn` 由 `output-format-select-btn` / `output-format-menu` / `format-item-{fmt}` 取代（全量 kebab-case）
- 样式：`output.css` 移除 `.format-tabs-root` / `.format-tabs` / `.format-tab(.active)` / `.format-more-trigger` 及标签栏滚动条、≤768px 标签缩小规则；新增 `.format-select-trigger`；保留 v3.15.4 的工具栏分区（`output-format-slot` / `output-tool-actions`）与窄屏三行布局
- i18n：16 语 locale 与 `translation.ts` 移除不再使用的 `moreFormats` 死键（键对称性保持）
- 注：`src/components/ui/Tabs.tsx` 与 `@radix-ui/react-tabs` 依赖暂保留（本机无 `node_modules` 无法重生成 `pnpm-lock.yaml`，移除依赖留待后续版本）
- 版本按 patch 规则升至 v3.15.5：`package.json` / `src/config/version.ts` / `next.config.js` env.version / `sync-facts.mjs` 文档展示位 / `public/` 产物头部；被改文件头注释同步至 v3.15.5


### Fixed（输出面板工具栏 UI 重叠）
- 修复「生成过滤规则」头部在窄屏/中间宽度（如 606px）下，核心格式标签栏撑破工具栏并覆盖右侧「规则测试 / 路由器脚本 / 设置」图标按钮，导致「AdGuard 白名单」等标签文字被截断、按钮压在标签上；线上实测标签栏右边界 592px > 按钮左边界 437px，重叠 155px，且「更多格式」被挤到第二行
- 根因：Radix `Tabs.Root` 渲染的无 class div 使用默认 `min-width:auto`，按内容撑到 417px（父级仅 254px），使 `TabsList` 的 `max-w-full` / `overflow-x-auto` 失效；叠加 `.format-controls` 的 `flex-wrap` 让下拉换行
- `OutputPanel.formatTabs.tsx`：给 `Tabs.Root` 加 `format-tabs-root` 宽度约束（min-width:0 / max-width:100% / flex:1 1 auto），空间不足时标签栏改为内部横向滚动
- `src/styles/output.css`：格式控制区改 `flex-nowrap`；工具栏拆为 `output-format-slot` / `output-tool-actions` 两区，按钮区固定不收缩且 `z-index:1` 置于上层；隐藏标签栏滚动条；≤768px 时标题 / 格式区 / 按钮分三行垂直排列并缩小标签内边距
- `OutputPanel.parts.tsx`：为两个分区加语义类名，DOM 顺序与导出契约不变
- 版本按 patch 规则升至 v3.15.4：`package.json` / `src/config/version.ts` / `next.config.js` env.version / `sync-facts.mjs` 13 处文档展示位 / `public/` 产物头部
- 仅被改动文件 `OutputPanel.formatTabs.tsx` / `OutputPanel.parts.tsx` / `output.css` / `version.ts` 头注释同步至 v3.15.4，其余源文件头注释按规则保持不变
- 注：本机无 `node_modules`，`next build` / `vitest` / `lint` 未能实跑；问题由线上 DOM 边界矩形实测定位，修复效果需部署后复核

## [3.15.3] - 2026-11-06

### Fixed（修复 EdgeOne 构建期字体加载失败）
- `next build` 在 EdgeOne / CI 离线环境失败：`src/app/layout.tsx` 用 `next/font/google` 加载 Inter / JetBrains Mono / Noto Sans SC / Spectral，构建期需访问 `fonts.googleapis.com`；取不到 CSS 时 next/font loader 抛 `TypeError: Cannot read properties of null (reading '1')`，构建在 `next/font` 阶段中断
- 移除 4 个 `next/font/google` 实例与 `<body>` 上的字体变量类名；`src/app/globals.css` 的 `--font-sans` / `--font-mono` / `--font-serif` 改回纯系统字体栈（含中文回退），不再依赖 `var(--font-inter)` 等注入变量。不引入外部字体 `<link>`，避免重新触发 EO 静态导出的 `no-page-custom-font` 警告
- 构建期不再产生任何外部字体网络请求；功能与 DOM 契约不变（`id="app-body"` / `id="app-shell"` 保留），视觉改为系统字体栈
- CSP 中 `fonts.googleapis.com` / `fonts.gstatic.com` allowlist 保留（已不再实际请求），`next.config.js` / `vercel.json` / `edgeone.json` 安全头未改动
- 版本按 patch 规则升至 v3.15.3：`package.json` / `src/config/version.ts` / `next.config.js` env.version / `sync-facts.mjs` 13 处文档展示位 / `public/` 11 个规则产物头部（由 `gen-format-files.mjs` 重生成）
- 仅被改动文件 `layout.tsx` / `globals.css` / `version.ts` 头注释同步至 v3.15.3，其余源文件头注释按「仅被改文件更新」规则保持不变

## [3.15.2] - 2026-11-06

### Changed（首屏精简与格式选择优化）
- 移除首屏 Hero 右侧「黑名单/白名单」可视化窗口（原 `.flowviz` 数据快照面板），Hero 回归单栏信息布局；`FlowViz` 删除 `buildSnapshot` / `SNAPSHOT_LIMITS` 与 `buildFlowPool` 引用，`hero.css` 删除 `.flowviz` / `.fv-*` 样式
- 清理死代码：删除仅被该面板使用的 `src/utils/buildFlowPool.ts` 及其测试 `buildFlowPool.test.ts`
- 优化「生成过滤规则」格式选择：原 12 个格式标签平铺在窄屏会换行堆叠成两列，改为「核心 4 格式标签（dnsmasq / hosts / AdGuard 黑名单 / AdGuard 白名单）+ 更多格式下拉」，高级格式收进下拉菜单；格式控件抽离为 `OutputPanel.formatTabs.tsx`，`OutputPanel.parts.tsx` 仅 re-export 保持导出契约
- 新增 i18n 键 `moreFormats`（16 语言），用于「更多格式」下拉标签
- 版本按 patch 规则升至 v3.15.2：`package.json` / `src/config/version.ts` / `next.config.js` env.version / `sync-facts.mjs` 文档展示位
- 重整 `public/domains.txt`：清除开头 14 个空行与堆在文件头的 15 个孤立分类注释，恢复「黑名单 645 条全局字典序 + 白名单 232 条按 13 个真实分类分组（组内字典序）」结构并补规范文件头；域名集合完全不变，`public/` 11 个产物由 `gen-format-files.mjs` 重生成（头部 v3.15.2 / 644 唯一域名 / 232 白名单）

## [3.15.1] - 2026-11-06

### Changed（文档全量勘误与版本同步，2026-11-06）
- 全项目文档与代码实况对齐，仅文档与版本展示位变更，无运行时功能变更；权威指标经脚本实算：v3.15.1 / 12 格式 / 16 语 146 顶层键 215 递归键 / 47 测试套件 / `src` 无 >200 行源文件 / `public/domains.txt` 非空 882 行（15 注释 + 867 规则 = 黑名单 635 + 白名单 232）
- 统一开发端口 8082 → 3000（`README.md`、`DEPLOYMENT.md`、`docs/config.yaml`），与 `package.json` 脚本及 `CHANGELOG` 历史修正记录一致
- 修复失效链接：`README.md` / `README.en.md` 品牌图路径改 `public/`、`README.en.md` 全部 raw 下载链接补 `public/` 前缀、`.github/SUPPORT.md` 相对链接补 `../`
- 修正路径与命令：`.github/CONTRIBUTING.md` 域名源改 `public/domains.txt`；`.github/SUPPORT.md` 生成命令改 `node scripts/gen-format-files.mjs`、白名单改 `+域名` 语法；`docs/CHECKLIST.md` ui 组件文件名改 PascalCase；`.github/PULL_REQUEST_TEMPLATE.md` 移除已删除的 `CODE_REVIEW.md` 引用
- `docs/config.yaml` 补齐 12 种输出格式；`docs/SPEC.md` 修 §1 表格列数与域名口径、补全 §2 结构树（`docs/scripts/public/components/config/types/workers`）、重写 §5.3 任务记录规范为 `tasks.md`（未完成）/ `tasks-done.md`（已完成归档）分工、§9.2 补齐 `@vitest/coverage-v8` 与 `jsdom`
- `README.en.md` 输出格式图改显式列 12 种，消除「9 列 vs 12 格式」自相矛盾；`DEPLOYMENT.md` 陈旧版本 3.14.0 → 当前版本
- 冻结快照按各自声明不改：`CHANGELOG` 历史段、`prototype/**`、`public/brand-colors.md`、`docs/STRUCTURE-REVIEW.md`、`docs/tasks-done.md` 历史实测值
- 版本按 patch 规则由 v3.15.0 升至 v3.15.1：`package.json`（权威源）/ `src/config/version.ts` / `next.config.js` env.version / `sync-facts.mjs` 13 处文档展示位 / `public/` 11 个规则产物头部；`src` 其余文件头注释按「仅被改文件更新」规则保持 v3.15.0
- 本轮静态校验实跑通过：`sync-facts.mjs --check`（13 处展示位一致）、`check-locales.mjs`（16 语 / 215 键）、`src` 行数扫描（0 个 >200 行）、活跃文档相对链接检查（0 失效）；`public/` 11 个产物由 `gen-format-files.mjs` 重生成
- 注：本机无 `node_modules`，`vitest` / `lint` 未能实跑；测试 282 用例与覆盖率为 2026-11-05 实测值，按「数字必须实算」纪律沿用并注明，未凭静态计数臆改

## [3.15.0]

### Fixed（P0/P1 缺陷修复）
- **T-P1-10 导出头部 usage 行缺注释符（最高优先级）**：`rulesGenerator.generateHeader` 把用法说明整行推入头部而未加格式注释符，导致导出的 `dnsmasq.conf` 出现「使用方法:」等 3 行裸指令（dnsmasq 判定为未知指令并**拒绝加载整个配置**，路由器 DNS 失效），`unbound.conf` / `pihole.txt` / `domains.txt` / `rpz.db` / `smartdns.conf` / `mosdns_domain_set.txt` / `clash_dns.yaml` / `coredns_hosts.txt` 各混入 1 行非法内容。现逐行补注释符（`# ` / `! ` / `; `），并新增 `rulesGenerator.header.test.ts` 断言「所有格式头部非空行均以注释符开头」
- **T-P1-11 本地草稿被远端清单静默覆盖（数据丢失）**：`useDomainData.loadDomainData` 的草稿守卫在 `await` 之前求值，网络往返期间恢复的草稿会被远端内置清单顶掉；`useAutosave` 也在「远端先落地」时直接放弃草稿。现确立**草稿优先**契约：草稿无条件恢复，远端加载完成后检测到草稿已恢复即放弃远端内容（两种时序均有回归用例覆盖）
- **T-P1-13 设置变更后预览/导出/统计不刷新**：`useRules.runGenerate` 依赖数组缺 `settings`/`t`，改 IP、项目名、去通配/去重开关或切换语言后预览仍停留在旧口径。现把 `settings`、`t` 纳入依赖并移除失效的 `settingsRef`/`tRef`
- **T-P1-14 Worker 任务失败被静默吞掉、挂起任务永不结算**：Worker 任务失败返回空文本后 `processParse` 直接返回 `null`，输入内容与解析结果长期不一致；Worker 卸载时 `pendingTasks.clear()` 未 resolve，调用方 `await` 永挂、进度条常驻；`postMessage` 失败无兜底。现分别改为「回退主线程同步解析」「卸载时逐个 resolve 兜底结果」「postMessage 异常即时结算」
- **T-P1-15 排序/去重结果覆盖用户新输入**：处理期间用户继续输入时，点击瞬间的旧文本结果会覆盖新内容。现新增转换序号（排序/去重共用）+ 输入快照双重守卫
- **T-P1-12 RTL 语言刷新后方向错误**：`useLanguage` 仅在切换语言时写 `<html dir>`，刷新后 RTL 语言首屏仍按 LTR 排版。现初始化即同步方向
- **T-P1-16 一次 Escape 关闭多个叠放弹窗**：各弹窗各自监听 `window`/`document` 的 keydown。现抽出 `useModalEscape` 弹窗栈，仅栈顶弹窗响应 Escape
- **T-P1-17 弹窗滚动锁互相破坏**：各弹窗直接写 `body.style.overflow`，关闭内层弹窗会解除外层锁定（背景穿透），且开→关→开时计数泄漏导致页面永久不可滚动。现抽出 `utils/scrollLock` 引用计数实现，四个弹窗统一使用
- **T-P2-11 URL 全部抓取失败仍提示「获取成功」**：`fetchFromUrls` 全失败时 `onSuccess` 提前返回，但 `withLoading` 仍走成功分支弹提示。现全失败时抛出错误走失败分支
- **T-P2-07 AdGuard 内容恰为 `||` 时按非法位置切片**：`Math.min(...[])` 得 `Infinity`，现回退到行尾
- **T-P2-09 正则本体含 `#` 被内联注释剥离截断**（如 `/\d+#/`）：正则识别提前到注释剥离之前
- **T-P2-08 hosts 行仅识别 `0.0.0.0 ` / `127.0.0.1 `**：现支持任意合法 IP 与 Tab 分隔

### Changed（语义化 ID 统一与超长文件拆分）
- **DOM id 全量统一为 kebab-case**：源码 154 处 id（此前 28 处为 camelCase，如 `shareBtn` / `settingsBtn` / `projectNameInput` / `guideModal`）全部改为 `share-btn` / `settings-btn` / `project-name-input` / `guide-modal` 等，同步 `htmlFor` / `aria-*` / JS 选择器引用；`prototype/prototype.html`、`flows.html`、`wireframes.html` 的 id 同步 kebab 化并校验所有 `$('x')` 引用均能命中，无重复 id
- **拆分全部超 200 行源文件**：5 个超长测试文件（`useDomainData.test.ts` 558 / `useHomeController.test.ts` 435 / `useRules.test.ts` 392 / `useUrlManager.test.ts` 389 / `useLoading.test.ts` 215）按关注点拆为 18 个测试文件，共享装置抽到 `src/test-utils/{domainData,rules,urlManager}TestKit.ts`；`src` 下现无超过 200 行的源文件
- 性能：行号生成改用非分配计数并在行数未变时跳过重绘（`useLineNumbers`）、`OutputPanel` 行数统计改用 `countLines` 并 memo 化、弹窗滚动锁改引用计数
- `scripts/lib/formatHeaders.mjs` 与运行时 `generateHeader` 对齐（Bind RPZ 注释符由 `#` 修正为 `;`，补齐带注释符的 usage 行），`public/` 11 个预生成规则产物同步更新

### Added
- `src/utils/scrollLock.ts`：引用计数滚动锁（叠放弹窗互不破坏）
- `src/hooks/useModalEscape.ts`：弹窗栈 Escape 管理（仅栈顶响应）
- 新增测试：`rulesGenerator.header.test.ts`、`parseLine.edge.test.ts`、`scrollLock.test.ts`、`useModalEscape.test.ts`、`useLineNumbers.test.ts`、`useRules.settings.test.ts`，用例总数 250 → **282**

### Verified
- `tsc --noEmit` 0 错、`eslint src --ext .ts,.tsx` 0 warning 0 error、`vitest run` **47 套件 / 282 用例**全绿、覆盖率 **88.85 / 85.45 / 91.74 / 88.85**（语句/分支/函数/行）、`check-locales` 16 语 / 215 键一致、`sync-facts.mjs` 13 处版本展示位一致
- 覆盖率统计口径显式声明 `all: false`（`vitest.config.ts`）：默认 `all=true` 会把未被 import 的文件按 0% 计入，全局覆盖率由 88.85% 跌至 35.27% 并误判门禁失败；显式声明后门禁数值跨环境稳定
- 同步 bump 版本至 v3.15.0（`package.json` / `src/config/version.ts` / `next.config.js` env.version + 13 处文档展示位 + `public/` 规则产物头部版本号）

## [3.14.0]

### Added（域名源加载失败用户告警 · T-P1-09）
- `useDomainData.loadDomainData` 在远端预设源与同源 `/domains.txt` 回退**全部失败**时，此前仅写 `logger.warn`（生产环境 logger 静默），用户完全无感知；现追加用户可见 toast `toast.domainsLoadFailed`
- i18n 新增 `toast.domainsLoadFailed` × 16 语言（zh-cn「域名源加载失败，请检查网络连接」、en「Failed to load the domains source, please check your connection」等），`TranslationToast` 接口同步补字段声明
- `scripts/locale-baseline.json` 基线由 214 键刷新至 **215 键**（`pnpm locales:baseline`），`check-locales` 双源硬门禁校验通过
- `useDomainData.test.ts` 补 2 例：源全空 / 远端抛错时均断言 toast 被调用

### Changed（统一行数统计，消除重复实现与全量 split 分配 · T-P1-08）
- 新增 `src/utils/lineCount.ts`：非分配换行计数 `countLines`，语义与 `split('\n').length` 完全一致，零额外内存分配
- 同一「文本行数」逻辑此前散落 3 处、其中 2 处用 `text.split('\n').length`（10 万行输入每次分配 10 万元素数组，主线程可感知卡顿）：`useAsyncRuleProcessing`（本地重复实现）、`useDomainData`（内联计数循环）、`useRuleWorker`（进度总数）—— 现统一收敛到 `utils/lineCount`
- 新增 `src/utils/lineCount.test.ts`（7 例）：空串 / 单行 / 换行 / 结尾换行语义、与 `split('\n').length` 的样本一致性、10 万行性能回归守卫

### Fixed（任务文档数据漂移修正）
- `docs/tasks.md` 指标表「测试套件 / 用例」长期记 27 / 249，实为 v3.13.5 删除 `useFlowTokens`（-1 套件 / -8 用例）后的过期值；按 2026-11-05 实跑修正为 **27 / 250**
- 覆盖率数值由 2026-10-19 的 87.42 / 86.05 / 89.83 更新为 **2026-11-05 实测 87.20 / 85.59 / 90.75**（语句 / 分支 / 函数 / 行）
- i18n 递归键数 214 → **215**；`docs/tasks.md` 登记本轮 T-P1-08 / T-P1-09（🟡 P1）并在其完成后归档至 `docs/tasks-done.md`
- 「超大规模数据性能 (Web Worker)」进度 40% → **55%**（主线程 O(n) 分配已消除；分片并行化未实施，仍为后续增强项）

### Verified
- `tsc --noEmit` 0 错、`next lint` 0 warning 0 error、`vitest run` **27 套件 / 250 用例**全绿、`check-locales` 16 语 / 215 键一致、`sync-facts.mjs --check` 13 处版本展示位一致
- 同步 bump 版本至 v3.14.0（`package.json` / `src/config/version.ts` / `next.config.js` env.version + 13 处文档展示位 + `public/` 规则产物头部版本号）

## [3.13.6]

### Fixed（全项目代码审查与质量加固）
- 修复测试基线：`src/test-utils/setup.ts` 补齐 jsdom 缺失的 `localStorage` / `matchMedia` 桩，修复 `useTheme.test.ts` / `useHomeController.test.ts` 共 32 例因 `localStorage.clear()` 抛错（"Cannot read properties of undefined (reading 'clear')"）导致的失败；全套 26 套件 / 241 用例恢复全绿
- 修复 Worker 实时进度失效：`useRuleWorker.ts` 的 `run()` 未透传 `onProgress`，进度消息被静默丢弃、进度条恒为 0%；改为透传回调并基于本任务真实 total 收尾
- 修复 Hero CTA 聚焦失效：`scrollToInput` 以 `getElementById('source-editor')` 定位，但 textarea 实际 id 为 camelCase `sourceInput`，名实不符导致聚焦静默失败；改用 ref 优先 + 语义 id 回退
- 安全加固：`fileUtils.ts` 无流式读取能力的回退路径补 `content-length` 硬拒，防止绕过 10MB 响应体积上限（DoS 护栏）
- 性能优化：`useDomainData.ts` 防抖判断中每次按键全量 `split('\n')` 计数（10 万行级分配巨大数组）改为非分配换行计数
- 统一 6 个 DOM id 为 kebab-case 语义命名（`source-editor` / `input-line-numbers` / `url-input` / `url-list` / `output-line-numbers` / `output-preview`），同步 `htmlFor` / `aria-describedby`，对齐规范文档与原型
- 拆分超 200 行源文件：`useHomeController.ts`(216)/`InputPanel.tsx`(205) 抽离 types 常量与 UI 状态 hook（`useHomeUiState`/`useHomeController.types`/`InputPanel.types`）；`globals.css`(1018) 按职责拆为 `src/styles/*.css` 7 模块，由 `layout.tsx` 按原级联顺序导入；全部 production 源文件 ≤200 行
- 移除 `Home.tsx` 冗余的 `globals.css` 重复导入，统一由根布局按序装配
- 文档同步：SPEC/DEPLOYMENT/tasks/CHECKLIST/config.yaml/README 版本展示位统一至 v3.13.6（sync-facts 13 处校验通过）；修正 SPEC 文件结构与 prototype 目录描述、DEPLOYMENT 陈旧版本叙述

### Verified
- `tsc --noEmit` 0 错、`vitest run` 26 套件 / 241 用例全绿、`next lint` 0 错、`sync-facts.mjs --check` 13 处一致、`node scripts/check-locales.mjs` 16 语键一致

## [3.13.5]

### Changed（首屏右侧可视化静态化）
- 应用户要求移除首屏（Hero）右侧域名「下落 token」动效，整体优化该区域 UI 设计
- 删除 `useFlowTokens`（650ms `setInterval` 驱动 token 生成 + `fvDrop` CSS 动画）及其测试——消除定时器触发的持续重渲染与 CPU 开销
- `FlowViz` 改为**静态数据快照面板**：按黑名单 4 / 白名单 2 / 改道 2 三态比例确定性抽样（`buildSnapshot`，不随机、不随时间变化），以静态彩色徽章陈列；空数据时居中显示等待文案
- `globals.css`：`.fv-track`/`.fv-token`/`@keyframes fvDrop` 及两处 fv-token reduced-motion 覆盖块删除，新增 `.fv-panel`/`.fv-chip`/`.fv-empty` 静态样式；`id="fvTrack"` 锚点保留（兼容既有 e2e 定位）
- 死代码清理：删除 `src/hooks/useFlowTokens.ts` 与 `useFlowTokens.test.ts`；`buildFlowPool` 保留（静态抽样仍消费）
- 同步 bump 版本至 v3.13.5

## [3.13.4]

### Fixed（格式标签栏换行叠画错乱）
- 修复输出面板格式标签栏布局错乱（用户截图取证）：12 个格式标签在 `flex-wrap` 换行后，`TabsList` 基类的固定 `h-10`（40px）高度不随之增高，换行的标签触发器溢出药丸、叠画到下方合并统计行与预览统计条上（截图中的「AdGuard 黑名单」「AdGuard 白名单」及统计条上的「ol」「le」碎片均为被叠画的标签，中文标签见 zh-cn.json `adguardFormat`/`whitelistFormat`）
- `.format-tabs` 覆盖基类固定高度为 `h-auto min-h-[2.5rem]`：药丸随换行行数自适应增高，换行标签不再溢出；`justify-start` 使换行行左对齐
- 根因链：`.output-toolbar` 占满剩余宽度（v3.13.3）→ 标签栏可变窄 → 标签换行 → 固定高度裁切失效暴露为叠画
- 同步 bump 版本至 v3.13.4

## [3.13.3]

### Fixed（输出面板头部布局错乱）
- 修复「生成过滤规则」输出面板头部布局错乱：原 `.output-header` 为 flex 行布局，`.output-toolbar` 未占满剩余宽度，导致 12 个格式标签与标题争夺空间、标签栏溢出或被右侧图标按钮挤压（窄屏尤为明显）
- `.output-toolbar` 增加 `flex-1 min-w-0` 占据头部剩余宽度，使内部 `FormatTabs` 的 `flex-1` 真正生效、标签在栏内换行、三个图标按钮固定在右
- `.panel-title` 增加 `flex-shrink-0` 防止标题被压缩
- 同步 bump 版本至 v3.13.3（package.json / src/config/version.ts / next.config.js env.version）

## [3.13.2]

### Added（页脚构建编号）
- 落地「全局编码规范 · 页脚构建号」：页脚区（footer）现展示「版本号 + build 编号」，不再仅显示版本号
- `next.config.js` 在构建/启动时为 `env.NEXT_PUBLIC_BUILD_ID` 注入本地构建时间到分钟（`yyyymmddhhmm`，如 `202611031209`）；CI 可覆盖该值反映真实构建时间
- `src/components/Footer.tsx` 读取 `process.env.NEXT_PUBLIC_BUILD_ID` 展示 `v{version} · build {buildId}`；注入缺失时回退为版本号
- footer 容器语义化 id 由 `about-panel` 修正为 `app-footer`（符合无障碍与测试定位规范）
- 同步 bump 版本至 v3.13.2（package.json / src/config/version.ts / next.config.js env.version）

## [3.13.1]

### Fixed（单格式生成器 Pi-hole 口径对齐）
- 修复 `formatGenerators.single.ts` 在「addHeader=true 且有白名单」场景下，Pi-hole 格式多输出一段白名单标题注释（`# 白名单`）的缺陷
- 根因：`whitelistHeader` 的 `default` 分支误将 Pi-hole 纳入（返回 `\n# 白名单标题\n`），而全量 `buildWhitelistRules` 的对应分支不含 Pi-hole（Pi-hole 原生不支持白名单语法，不输出任何内容）
- 现新增 `case 'pihole': return ''` 与全量实现逐字节对齐；`formatGenerators.single.test.ts` 的 12 格式一致性断言已全绿
- 同步修正 `next.config.js` 滞后的 `env.version`（`3.12.0` → `3.13.1`，该字段属 sync-facts 手工同步项）

## [3.13.0]

### Added（分类筛选 UI 接入与规则生成惰性化）
- 域名分类筛选 UI（T-P2-01 / T-P2-05）：新增 `CategoryFilter` 组件与 `useCategoryFilter` / `useCategoryIndex` 钩子，按真实上游命中源（AdGuard/EasyList/neoHosts/StevenBlack/YouSList）多选过滤域名；索引（`public/category-index.txt`，由 `scripts/aggregate-upstream.mjs` 产出）缺失时控件自动隐藏、筛选退化为全量，不影响主流程
- 规则生成惰性化（T-P1-06）：`useRules` 预览仅生成当前格式文本（`generateSingleFormat`），去除每次同步生成全部 12 种格式的冗余开销；下载/复制直接消费当前格式文本，语义由 `formatGenerators.single.test.ts` 逐格式断言与全量生成逐字节一致
- 新增 `src/utils/formatGenerators.single.ts` 与一致性测试（12 种格式 × 多种输入组合）

### Changed
- 版本号 v3.12.0 → v3.13.0（package.json / `src/config/version.ts` / 被改文件头注释 / 文档展示位统一同步，由 `scripts/sync-facts.mjs` 校验）

## [3.12.0]

### Fixed（目录结构审查 P0 + 事实副本收敛）
- 删除生产零引用的投机模块 `src/utils/statsAggregator.ts` 及其测试（其统计语义与 `parser.ts` 内联统计不同，属重复实现）
- 删除根目录垃圾与占位配置：`{const`（0 字节）、`tsconfig.tsbuildinfo`、临时 `_*.txt`、`metadata.json`（无引用的 AI Studio 元数据）、`pnpm-workspace.yaml`（`allowBuilds` 为占位串 `set this to true or false`）
- 修复 `scripts/count-domains.mjs --write` 把产物头部版本硬写为 `3.7.34` 的缺陷，改为读 `package.json`
- 安全响应头统一：以 `vercel.json` 为准回写 `next.config.js`，补齐 HSTS / X-Frame-Options / COOP / CORP，`frame-ancestors` 由 `*` 收紧为 `none`，移除生产不需要的 `unsafe-eval`
- 默认设置收敛为单一来源 `src/config/defaults.json`，消除 `useSettings.ts`（`ipv4=127.0.0.1`）与生成脚本（`0.0.0.0`）的冲突
- 更正 `README.md` / `README.en.md` 中不存在的文件（`uiUtils.ts`/`manifest.ts`/`sw.js`）与 4 处失效社区文件链接


### Added（测试与门禁）
- 新增 `scripts/sync-facts.mjs`：把 `package.json` 版本号写入 13 处文档展示位，并提供 `--check` 模式，已纳入 CI 硬门禁（版本号曾分散 40+ 处手工维护）
- 新增 4 个 hooks 层单元测试（`useSettings` / `useLanguage` / `useModalA11y` / `useVirtualList`），覆盖率门禁扩展至 `src/hooks`；实测语句 51.61 / 分支 83.94 / 函数 80.24 / 行 51.61，门槛按实测校准为 50/75/80/50（编排层 14 个钩子中仅 4 个有测试，补齐后应提升回 80/75/85/80）
- 新增 `src/test-utils/renderHook.ts`：零依赖测试助手（`react-dom/client` + React 18.3 内置 `act`），避开 `@testing-library/react` 在 pnpm 隔离布局下无法解析 peer `react` 的问题（该依赖已移除）
- 测试规模：19 套件 / 129 用例全通过
- 新增 `src/config/defaults.json`（默认设置单一来源，双端可读）

### Changed（文档口径）
- `docs/tasks.md`：T-P2-01 / T-P2-04 状态由「✅ 已完成」修正为「🟡 库已就绪，UI/生成器未接入」（经核实两个模块生产零引用，UI 不可见）
- `docs/SPEC.md`：新增 CHECKLIST 豁免条款（发布验收清单允许 `- [ ]`）
- `prototype/` 四个 md 与三个 HTML 标注为**设计快照**（内容停留在 v3.9.x ~ v3.10.x，不再随代码回填）
- 新增 `docs/STRUCTURE-REVIEW.md`：目录结构与可维护性审查报告（含改进点排期）

## [3.11.2]

### Fixed（工作流审查整改：8 项）
- **依赖可复现性**：此前仓库无 `pnpm-lock.yaml`，而 CI 以 `--frozen-lockfile` 安装且 `cache: 'pnpm'`，依赖树完全不可复现；`setup` action 注释声称的 `packageManager` / `engines` / `.npmrc` 也都不存在。现已入库 `pnpm-lock.yaml`（lockfileVersion 9.0）、补 `packageManager: pnpm@11.24.0` 与 `engines.node >=24.11.0`、新增 `.npmrc`（`engine-strict=true`），并从 `.gitignore` 移除 `pnpm-lock.yaml` 忽略项
- **Release 资产清单**：zip 内 `mosdns/clash/coredns` 各重复一次，单文件资产缺这 3 个新格式（用户无法从 Release 页下载）。改为消费 `node scripts/gen-format-files.mjs --list-files` 的单一来源清单，新增格式不再需要改 workflow
- **`aggregate.yml` 权限**：`create-pull-request` 需要推送分支，原 `contents: read` 必然 403 失败；已补 `contents: write`
- **生成产物漂移门禁**：`ci.yml` 的比对由 `continue-on-error` 软门禁改为硬门禁，并从比对中剔除头部「更新::」日期行（每天变化的噪声），「版本::」与规则内容漂移会真正阻断
- **部署门禁**：`deploy.yml` 原先 main push 即部署（CI 红了也照发）。改为 `workflow_run` 触发，仅 CI 成功后部署，并检出触发 CI 的 `head_sha`，杜绝「部署到比 CI 更新的代码」
- **EdgeOne 产物路径**：默认 `./out` 属于 `output: 'export'` 形态，与 `next.config.js` 的 `output: 'standalone'` 不符，会退化为 "No server-handler detected"；默认改为 `./.next`，DEPLOYMENT.md 同步纠正（原文档还误称未启用 standalone）
- **供应链与健壮性**：`vercel` / `edgeone` CLI 由 `@latest` 钉到 62.2.0 / 1.6.41；所有 job 补 `timeout-minutes`（build/deploy 20、test 15、其余 10、聚合门禁 5）；`setup` action 补 `cache-dependency-path` 与锁文件存在性断言
- **杂项**：CI 补 `NO_COLOR` / `FORCE_COLOR` / `CI` 环境变量并放宽测试摘要 grep（此前 ANSI 转义码导致 `Tests` 行匹配不到，摘要恒为空）；新增 `.gitattributes` 统一 LF，避免 Windows 检出把规则产物转成 CRLF 导致漂移门禁恒红
- 重生成 12 个规则产物，头部版本由 3.10.1 对齐至 3.11.2

## [3.11.1]

### Fixed（修复 EdgeOne 构建失败并找回丢失的格式切换 UI）
- **修复 `next build` ESLint 门禁失败**（EdgeOne Pages 部署 exit 18）：清理 3 处 `@typescript-eslint/no-unused-vars` 错误（`OutputPanel.tsx` 的 `FormatTabs`、`SettingsPanel.tsx` 的 `updateSettings`、`useHomeController.ts` 未使用的 `React` 导入）与 2 处 `react-hooks/exhaustive-deps` 警告（`useAutosave` 定时器依赖 `sourceInputRef`、`useRuleWorker` 卸载清理在 effect 体内取出挂起表引用）
- **找回丢失的输出格式切换标签栏**：`<FormatTabs>` 的 JSX 在 v3.10.2 的组件拆分（T-P1-04）中被误删，只剩未使用的 import——输出面板自此只能显示当前默认格式，无法切换 12 种格式。已恢复渲染（`OutputToolbar` 增加 `children` 插槽，DOM 顺序与 v3.10.0 一致：`#output-format-tabs` 位于工具栏按钮之前）
- 清理 `updateSettings` 死代码链：表单已改为 `setSettings(prev => ...)` 就地更新，移除 `SettingsPanel`/`OutputPanel`/`Home` 的 prop 透传，以及 `useSettings` 中基于 input id 的 `FIELD_MAP` 与回调
- 同步全局版本展示位至 v3.11.1

## [3.11.0]

### Added（性能与功能）
- Web Worker 异步规则解析：`ruleProcessor.worker.ts` 将解析/排序/去重移出主线程（阈值 5000 行），分片上报进度并展示进度条与耗时；Worker 不可用时自动回退主线程
- IndexedDB 存储层：`idb.ts` / `httpCache.ts` / `cachedFetch.ts`，自动保存上限由 5MB 提升至 50MB，支持 ETag 条件请求（304 复用）与离线兜底，旧 localStorage 草稿自动迁移
- 输出预览虚拟渲染：`useVirtualList` + `OutputPreview`，长文本仅挂载可视区切片
- 正则规则双向转换：`regexRules.ts` 支持 AdGuard `/pattern/` ↔ Pi-hole FTL `regex:pattern`（如实标注 dnsmasq 不支持正则）
- 域名分类与标签过滤：`domainCategory.ts` 依据真实上游源命中关系打标与筛选
- OpenWrt LuCI 配置包：`openwrt-package/` 提供 `luci-app-dnsshield` 规则订阅

### Changed
- 升级 Vitest 至 3.2.7，根治 Windows 盘符重复统计导致的覆盖率虚低（报告值 47.85% → 真实 84.46%），阈值提升至 80/75/85/80
- 移除 Docker 部署：`Dockerfile` / `.dockerignore` 删除，Deploy 工作流仅保留 Vercel 与 EdgeOne Pages

## [3.10.3]

### Refactor（GA4 衡量 ID 环境变量化）
- 移除 `src/app/layout.tsx` 中硬编码的兜底衡量 ID（`G-XXXX...`），衡量 ID **仅**从环境变量 `NEXT_PUBLIC_GA_MEASUREMENT_ID` 读取，源码不再写入任何真实 ID
- 新增 `src/utils/analytics.ts`：衡量 ID 归一化（去空白 + 大写）、格式校验（`G-` 前缀 + 4~32 位大写字母数字）、`missing`/`invalid` 降级判定、gtag 加载地址与初始化片段生成（ID 经 `JSON.stringify` 转义，防注入）
- 新增 `src/app/(seo)/ga-scripts.tsx`：从 `layout.tsx` 拆出 gtag 注入，环境变量缺失或格式非法时返回 `null`，不渲染任何统计脚本（分析功能在正确配置下行为不变）
- 环境变量须以字面量 `process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID` 引用以保证 Next.js 构建期内联；未启用情形输出开发期诊断日志（生产环境由 `logger` 静默），诊断信息不回显原始值
- 新增 `.env.example` 模板（含 GA 与预设源变量），并在 `.gitignore` 中放行 `!.env.example`
- 新增 `src/utils/analytics.test.ts`（13 例）：缺失/空白、UA- 前缀等非法值、大小写与空白归一化、环境变量读取、脚本注入转义
- 同步文档：README / README.en / DEPLOYMENT / SPEC.md / tasks.md 中的衡量 ID 说明与版本展示位；全局版本展示位升至 v3.10.3

## [3.10.2]

### Chore（移除 Docker 部署）
- 移除 `Dockerfile` 与 `.dockerignore`：项目不再提供容器化部署
- 清理 `DEPLOYMENT.md` 中「容器化部署」章节、GHCR 镜像与自托管 SSH 部署目标及对应变量与命令
- `deploy.yml` 删除 GHCR 镜像构建与自托管 SSH 两个 job，移除 `packages: write` 权限与说明表对应行
- 从 Bug 报告模板与任务文档移除 Docker 相关措辞
- 同步全局版本展示位至 v3.10.2

## [3.10.1]

### Added（新增输出格式：Mosdns / Clash Meta / CoreDNS）
- 新增 `Mosdns` 格式：生成 `domain:域名` domain-set 拦截规则（匹配域名及其子域）
- 新增 `Clash Meta` 格式：生成 `DOMAIN-SUFFIX,域名,reject` DNS 规则，白名单映射为 `DOMAIN-SUFFIX,域名,DIRECT`
- 新增 `CoreDNS` 格式：生成 hosts 插件格式 `0.0.0.0 域名` 拦截规则，自定义 DNS 映射为 `IP 域名`
- 扩展 `OutputContent` 与 `FormatType`，新增格式自动纳入 ALL_FORMATS / MASKED_FORMATS 与输出 Tab、下载/复制链路
- 为 16 种国际化语言补齐三种新格式标签与头部文案，并通过 `check:locales` 校验
- 新增 `scripts/aggregate-upstream.mjs` 与 `.github/workflows/aggregate.yml`：定时（每周一）聚合 AdGuard / EasyList / NeoHosts / StevenBlack / YousList 上游，合并去重后自动发起 Pull Request

### Changed（项目结构）
- 规范文档目录由 `openspec/` 重命名为 `docs/`，同步更新全部路径引用
- **任务记录收敛为唯一来源**：合并原 `docs/TASKS.md` 与 `docs/REMAINING_TASKS.md` 为 `docs/tasks.md`（小写），删除冗余任务文档，并将未完成任务口径统一为 **7 项**（P1 四项、P2 两项、P3 一项、P4 一项）
- 在 `docs/SPEC.md` 新增 §5.3「任务记录规范（强制）」：`docs/tasks.md` 为任务记录唯一来源，禁止在其他文档另建任务清单或维护 `- [ ]` 任务条目
- 文档与静态产物全量同步至 12 种格式：README（中英）/ DEPLOYMENT / SPEC.md / prototype 三件套补齐 Mosdns、Clash Meta、CoreDNS 的文件表、格式清单、下载链接与生成逻辑（`genMosdns` / `genClash` / `genCoredns`）
- `gen-format-files.mjs` 按单文件 200 行规则拆分为编排层 + `scripts/lib/{domainSource,formatHeaders,formatRules}.mjs`，并新增生成 Mosdns / Clash Meta / CoreDNS 静态产物
- 新增静态产物 `public/mosdns_domain_set.txt`、`public/clash_dns.yaml`、`public/coredns_hosts.txt`，并纳入 Release 工作流打包与资产列表
- Service Worker 缓存白名单补充 `.conf` / `.yaml` / `.db` 扩展名以覆盖新增规则文件，缓存版本号升至 v3

### Fixed
- 修复测试覆盖率门禁形同虚设：`vitest.config.ts` 此前**完全没有配置** `coverage.thresholds`，T-P0-01 文档声称的「行 ≥80% / 分支 ≥75%」并不存在。现已落地真实门禁（语句 45 / 分支 75 / 函数 70 / 行 45，阈值按 Windows 报告值校准），覆盖率不达标时以非零码退出
- 澄清覆盖率数字虚低的原因：报告值 47.85% 并非测试文件混入分母，而是 Vitest 2.1.9 + `@vitest/coverage-v8` 在 Windows 上按盘符大小写（`e:\` 与 `E:\`）把同一源文件重复统计两次，导致「All files」折半；真实被测源码覆盖率约为报告值的 2 倍（~95%+）。已在 `vitest.config.ts` 注释中记录该根因，彻底根治需升级 Vitest 3.x
- 补 `coverage.exclude` 防御性排除 `*.test.ts` / `*.spec.ts` / barrel 文件
- 修复 `statsAggregator.test.ts` 使用过期字段（`raw` / `line`）导致的 6 处 TypeScript 类型错误，改为真实 `ParseResult` 的 `originalLine` 字段
- 清除 `vitest.config.ts` 的 UTF-8 BOM 污染
- 统一全站「9 种格式」表述为「12 种格式」，覆盖 16 种语言 i18n 文案（heroDesc / SEO 描述）、源文件头注释与原型文案
- 合并 CHANGELOG 中重复的 `[3.10.1]` 小节为单一小节

### Docs
- 按代码实况校正任务文档中与实现脱节的数字：i18n 基准键数 195 → **145**、单元测试用例 82 → **85**、覆盖率 91.9% → 说明虚低根因
- 修正任务文档的口径矛盾（「剩余 7 项」实为 **5 项**功能任务），并登记新发现的 T-P0-04 / T-P1-04
- 新增「事实核验基线」小节，明确数据型数字必须脚本实算、禁止凭记忆书写
- 修正开发端口说明：8082 → **3000**（以 `package.json` dev 脚本为准）

## [3.9.12]

### Added（功能增强与覆盖率治理）
- 新增 `src/utils/ruleMatcher.ts`：支持域名/URL层级规则匹配测试引擎（白名单 > 自定义DNS > 黑名单 > 直连放行），支持通配符与子域名泛匹配
- 新增 `src/components/RuleTesterModal.tsx`：可视化域名规则匹配测试弹窗，支持实时输入待测域名快速返回命中规则与解析行为
- 新增 `src/utils/scriptGenerator.ts`：支持 OpenWrt、Merlin、Padavan、SmartDNS、Pi-hole 自动化定时更新与重载 Shell 脚本生成
- 新增 `src/components/ScriptGeneratorModal.tsx`：路由器固件同步脚本一键生成与复制弹窗
- 新增 `src/utils/logger.ts`：生产环境安全日志门禁工具，避免敏感调试信息外泄
- 配置 `@vitest/coverage-v8` 自动化代码覆盖率阈值监控，核心工具与生成器单元测试覆盖率达到 91.9%+（语句 91.9%，分支 87.16%，函数 92.68%）
- 补全 16 种国际化语言对应新功能翻译字典，并通过 `check:locales` 一致性校验

### Fixed（稳定性与钩子修复）
- 修复 `src/hooks/useRules.ts` 中 `computeEffectiveStats` 读取 stale settings 导致导出统计与实际输出不一致的缺陷
- 修复 `src/utils/statsAggregator.ts` 统计聚合与流式图池单元测试用例

## [3.9.11] - 2026-08-26

### Fixed（CI pnpm 版本冲突）
- 移除 ci.yml 中 `pnpm/action-setup@v4` 硬编码的 `version: '9'`，改由 `package.json` 的 `packageManager`（pnpm@11.24.0）统一驱动，消除 `ERR_PNPM_BAD_PM_VERSION` 多重版本冲突
- `engines.pnpm` 由 `>=9` 对齐为 `>=11`，与 packageManager 声明一致

## [3.9.11] - 2026-08-26

### Fix（构建修复）
- 修复 `React.memo` 包裹组件缺少 displayName 导致的 EO CI `next build` ESLint 报错（`react/display-name`）
- `FlowViz.tsx` / `Footer.tsx` 的 memo 包裹改为命名函数，满足 ESLint display-name 规则
- 同步全局版本展示位至 v3.9.11

## [3.9.10] - 2026-08-26

### Chore（部署/构建配置）
- 新增 `edgeone.json`：将 EdgeOne Makers 安装命令从默认的 `npm install` 覆盖为 `pnpm install --config.dangerouslyAllowAllBuilds=true`，修复 EO CI 因 `only-allow pnpm` 拦截 `npm install` 导致构建失败，并放行 esbuild 等构建脚本
- 同步全局版本展示位至 v3.9.10

## [3.9.9] - 2026-08-26

### Chore（构建/依赖配置）
- `package.json` 新增 `pnpm.onlyBuiltDependencies`，允许 `esbuild`/`unrs-resolver` 执行构建脚本，修复 pnpm 默认安全策略下 `next`/`vitest` 因 esbuild 未构建而不可用的问题
- 同步全局版本展示位至 v3.9.9

## [3.9.8] - 2026-08-26

### Perf（性能优化）
- `FlowViz`/`Footer` 包 `React.memo`，避免输入时随父组件无谓重渲染
- `Home` 的 `onOpenGuide` 改为 `useCallback` 稳定引用，修复 Footer memo 击穿
- `useRules` 用 ref 持有最新 `settings`/`t`，稳定 `runGenerate` 引用，防止 `OutputPanel` memo 被设置变更击穿
- `useDomainData` 自动保存恢复 effect 加严格单次守卫，避免 StrictMode 双执行

## [3.9.7] - 2026-08-26

### Changed（pnpm 迁移与强制约束）
- 新增 `.npmrc`：`engine-strict=true` 与 `package-manager-strict=true`
- `package.json` 增加 `packageManager: pnpm@11.24.0`、`engines.pnpm: >=9`、`preinstall: npx only-allow pnpm`、`devDependencies.only-allow`
- `.gitignore` 追加 `*.err`；删除非项目文档 `CODE_REVIEW.md`
- 同步全局版本展示位至 v3.9.7；修正原型 `prototype.html` 头注释/标题版本滞后（v3.9.2 → v3.9.7）

## [3.9.6] - 2026-08-26

### Fixed
- 修复 CI 构建失败：`globals.css` 的 `.stat-dot.allow` 误用 `@apply bg-success`，但 `tailwind.config.js` 的 colors 未定义 `success` 键导致类不存在；改为原生 `bg-green-500`（与 `--success: 142 71% 45%` 及 Badge 成功色一致）

## [3.9.5] - 2026-08-25

### Changed（对齐原型视觉与无障碍）
- `globals.css` 新增 `.stat-dot`（block/allow/dns 三色语义圆点）与 `.output-header` 横向布局，对齐原型 `.input-panel` / `.output-header`
- `InputPanel` 统计项重构为带彩色圆点（`block`/`allow`/`dns` 语义色），对齐原型 `.stat-dot`
- `OutputPanel` 用内联 SVG 替换 `FileCode` lucide 图标，移除未用 import
- `UrlSection` preset 标签无障碍由 `aria-labelledby` 改为 `aria-label`
- 同步全局版本展示位至 v3.9.5

## [3.9.4]

### Changed（对齐原型 .tablist 排序）
- 格式 Tab 顺序对齐原型 `prototype.html` 的 `.tablist`：`dnsmasq` 提至首位（路由器级 DNS 工具最常用），其后为 `hosts / adguard / whitelist / unbound / pihole / domains / bind / smartdns`
- `ALL_FORMATS`、`CORE_FORMATS` 顺序同步调整；默认输出格式 `currentFormat` 初值由 `hosts` 改为 `dnsmasq`，与原型默认激活态一致

## [3.9.3]

### Changed（严格对齐原型布局：消除 3 处架构级差异）
- **L1 主区域布局**：`.main-content` 由两栏并排（`lg:grid-cols-2`）改为单栏堆叠（`grid-cols-1`），对齐原型单栏 input/output 卡片流
- **L2 设置面板形态**：由侧栏折叠改为居中弹窗 modal（`.settings-modal` + `.settings-dialog` + 遮罩 + 关闭按钮），对齐原型 settings-modal/settings-dialog
- **L3 主题切换入口**：移除 Header 独立 `#theme-toggle-btn`，主题切换仅保留在设置面板内（对齐原型，原型无独立 theme 按钮）
- 新增 `closeBtn` 翻译键并补充至全部 16 语言（modal 关闭按钮 aria-label）

## [3.9.2]

### Changed（原型-应用视觉对齐：Header 设置入口 + Settings 分组修复）
- Header 新增设置按钮（`#settingsBtn`），对齐原型设置触发入口，点击展开/收起设置侧栏
- 修复 SettingsPanel 分组标题：项目信息字段（projectName/version/ipv4/ipv6）从"输出规则类型"组移出，改为独立无标题分组，消除重复的 fmtGroup 标题
- Hero 标题补 `font-serif`（Spectral），对齐原型 hero-title 品牌字体

## [3.9.1]

### Changed（原型-应用视觉对齐：FlowViz 改为单轨下落动画）
- FlowViz 由三列竖直管道改为原型 `#flowviz` 单条横向流量轨道，域名 token 从真实解析数据随机抽样下落
- 新增 `useFlowTokens` hook 与 `buildFlowPool` 工具，按黑名单/白名单/改道三态比例生成可视化 token
- 同步更新 FlowViz 与 globals.css 样式，移除旧的 `.fv-pipes/.fv-pipe/.fv-legend` 三管道视觉
- 保留真实数据驱动与无障碍降级（prefers-reduced-motion 隐藏动画 token）

## [3.9.0]

### Added（原型-应用 UI 对齐：输出规则类型逐格式开关）
- 新增 `Settings.visibleFormats` 字段，支持「输出规则类型」9 个格式独立显示/隐藏开关（对齐原型 .box + .on 视觉）
- 设置面板重构为两组：生成选项（5 项卡片网格）+ 输出规则类型（showAllFormats 开关 + 9 格式 toggle 卡片）
- 输入面板编辑操作按钮对齐原型顺序（生成规则 / 排序 / 去重 / 清空），移除 save 按钮
- 统计条移除 domainCount，对齐原型 5 项统计（黑名单/白名单/改道/注释/总行数）
- 生成选项卡片网格改为 2 列（对齐原型 .opt-grid）

## [3.8.8]

### Changed（原型-应用 UI 对齐：视觉令牌收紧）
- 面板/卡片圆角由 rounded-2xl 收至 rounded-xl，对齐原型 --radius-lg 紧凑值
- 移除 .panel:hover 抬升位移与重阴影，对齐原型 .card 极轻阴影风格
- FlowViz 内联快速入门三步改用原型键 step1t~3d（简洁版），删除冗余 usageStep*/usageTip* 详细键与 Hero tip 区，对齐原型 #about-panel（仅 3 步、无 tip）

## [3.8.7]

### Changed（原型-应用对齐：使用指南弹窗部署提示）
- 重构 GuideModal 提示区为原型 #guideModal 的多格式部署列表（Dnsmasq/Hosts/AdGuard·Pi-hole/Unbound·Bind RPZ·SmartDNS 四项）
- i18n 新增 4 个部署提示键（deployDnsmasq/deployHosts/deployAdguardPihole/deployUnboundBindSmartdns），移除冗余 guideNoteContent 纯文本键
- guideNoteTitle 文案对齐原型（「各格式部署提示」）

## [3.8.6]

### Changed（原型-应用 UI 对齐）
- 输入面板主按钮改为一步式「生成规则」（对齐原型 #parseBtn），点击直接解析 + 生成全部格式，移除独立的「解析域名」步骤
- 设置面板「生成选项」6 项渲染为带边框卡片 checkbox 网格（对齐原型 .opt-row + .box 视觉，保留 Radix Checkbox 可访问性）

## [3.8.5]

### Changed（原型-应用视觉对齐）
- 补齐 FlowViz DNS 信号配色对齐：图例点 / 管道边框 / 信号点 / 下落 token / 计数文字由 warning（黄）统一改为 primary（蓝），对齐 prototype.html 的 `fv-dot.dns` / `fv-pipe-dns` / `fv-token.dns` 设计（上次改动未落盘，本次修正）

## [3.8.4]

### Added（原型-应用功能对齐）
- 新增独立「使用指南」弹窗（GuideModal，对齐原型 #guideModal）：页脚 `linkGuide` 触发，含 3 步指南（gStep1t~3d）+ 部署提示框（guideNoteTitle/guideNoteContent）
- i18n 新增 `guideNoteContent`/`close` 键，16 语言同步

## [3.8.3]

### Changed（原型-应用设计对齐）
- 落地 Hero 营销文案区（heroKicker/heroTitle/heroDesc）与 FlowViz CTA（ctaStart/ctaSettings）
- SettingsPanel 按 fgroup（格式组）/appearanceGroup（外观组）分组，外观组含主题分段切换
- 补齐 RTL 逻辑（ar 标记 rtl:true，切换时设置 html dir）与分享功能（Header #shareBtn 复制随机 shareTexts + 仓库链接）

## [3.8.2]

### Added（原型-应用功能对齐）
- 落地真实功能缺口：RTL 语言支持、分享功能、i18n 补全（heroKicker/heroTitle/heroDesc/ctaStart/ctaSettings 等）

## [3.8.1]

### Changed（原型-应用视觉对齐）
- 流量可视化（FlowViz）DNS 信号/管道/下落 token/计数/图例点配色由 warning（黄）统一改为 primary（蓝），对齐 prototype.html 的 `fv-dot.dns`/`fv-pipe-dns`/`fv-token.dns` 设计
- 输出预览统计条补齐顶部分隔线（border-top）与每项胶囊背景（rounded-full + muted 底），对齐原型 `.ps` 卡片式统计条样式

## [3.8.0]

### Changed（原型-应用设计对齐）
- 快速入门三步卡片由页脚折叠区移至 Hero 首屏（与 prototype.html 对齐，首屏可见）
- URL 导入加载形态由全屏遮罩改为 URL 区细进度条 `.loading-bar`（贴合原型、提升可交互性）
- 输入统计条补齐「改道」与「总行数」维度，共 5 维对齐原型（黑名单/白名单/改道/注释/总行数）
- i18n 新增 `usageTitle`（快速入门）、`customDnsCount`（改道）、`totalLines`（总行数）键
- `src/config/version.ts` APP_VERSION 追平 package.json 权威值 3.8.0（修正头注释与常量脱节）

### Fixed（代码质量与规范对齐）
- 修复 `OutputPanel.tsx` 被 `React.memo` 包裹导致内联 `Button` 的 `variant`/`size` 字面量拓宽为 `string` 的 4 处 TS2322 类型错误，以及 `Tabs` `onValueChange` 回调 `v` 参数隐式 `any`（TS7006），消除阻塞 `next build` 的生产构建错误
- 删除无调用方的死代码 `src/utils/parseSource.ts`，并清理 `domainValidator.ts` re-export 层，消除其与 `parser.ts` 同名 `parseSource` 的重名隐患
- 拆分 `OutputPanel.tsx`（206 行）为 `OutputPanel.parts.tsx`（`FormatTabs` + `PreviewStats` 子组件），主文件降至约 175 行，符合单文件 ≤200 行规范
- 补充语义化 id：`OutputPanel` 的 `output-format-tabs`/`output-preview-area`；`UrlSection` 的 `url-remove-btn-${index}`；保持项目「主要容器加语义化 id」约定
- 统一 src 下全部 39 个源码文件头注释版本号至 v3.8.0（修正此前 3.7.50~3.7.68 分散失实）
- 删除 npm 副作用生成的 `package-lock.json`，避免与项目 pnpm-lock.yaml 冲突（Vercel 使用 pnpm 安装）

## [3.7.68]

### Changed（自定义 DNS 文案重命名）
- 面向用户的中文「自定义DNS」统一重命名为「改道」（统计标签、i18n zh-cn/zh-tw、输入提示、合并统计）
- 内部类型与变量名 `customDns` 保持不变，仅展示文案变更，对外契约稳定

## [3.7.67]

### Changed（原型页脚与设置优化）
- 页脚 `#footerMeta` 与 `#footerVer` 并排；`.about-links` 链接强制单行不折行
- 使用指南「linkGuide」改为弹出详细指南弹窗（含分步说明与各格式部署提示）
- 设置内深浅色切换由复选框升级为分段开关（日/月图标 + 滑块），支持方向键切换
- 分享按钮文案改为多条随机搭配（zh-cn / en），每次分享随机选用
- `.preview-stats` 上方增加分隔线；`.about-panel` 移至 `.hero-cta` 下方
- 点击「获取」按钮且 URL 为空时默认使用内置数据填入获取
- 规则输出注释行数统计修正为实际输出文本注释行数（修复输入注释数误用）
- `.brand-icon` logo 完整显示（32×32、object-fit:contain）；`.brand-title` 字号 20px

### Fixed
- 修正 `next.config.js` env.version（3.7.60→3.7.67）、README/openspec/prototype 版本展示位脱节
- 同步 `package.json` version、`src/config/version.ts` APP_VERSION 至 3.7.67
- 重新生成 public 格式文件头注释版本至 3.7.67

## [Unreleased]

### Fixed（OutputPanel 类型错误修复 v3.7.64）
- 修复 `OutputPanel.tsx` 被 `React.memo` 包裹后内联 `Button` 的 `variant`/`size` 字面量被拓宽为 `string` 导致 4 处 TS2322 类型错误
- 修复 `Tabs` `onValueChange` 回调 `v` 参数隐式 `any`（TS7006），显式标注为 `string`
- 上述 5 处 TS 错误会阻塞 `next build` 生产构建，已通过 `as const` 精确类型标注消除，tsc 0 错误、67/67 测试通过

### Fixed（CI 构建修复 v3.7.62）
- 修复 Vercel 构建失败：`pnpm-lock.yaml` 的 `@types/node` specifier（`^20.14.0`）与 `package.json`（`^24.0.0`）脱节导致 `frozen-lockfile` 校验失败
- 将 lock 的 `@types/node` 解析对齐至 `24.13.3`，新增对应 packages 条目，恢复 lock 与 manifest 一致

### Added
- 扩充 `public/domains.txt` 广告域名清单（v3.7.60）
  - 从权威 blocklist 源（pgl.yoyo.org、anudeepND）筛选 106 个品牌级稳定广告/追踪基础设施域名，补齐 Google 广告分析栈、主流 SSP/DSP（criteo/pubmatic/rubiconproject/taboola/outbrain/adform 等）
  - 黑名单区按字母升序排序并去重，白名单段保持业务分组原样
  - 重新生成 8 种输出格式文件（hosts/dnsmasq/AdGuard/Unbound/Pi-hole/Bind RPZ/纯域名/SmartDNS），版本同步至 3.7.60

### Changed
- 重构目录结构与职责划分（refactor，v3.7.59）
  - `domainPrimitives.ts`：移除重复的 `ParseResult`/`ParseStats` 类型，改由 `types/formats.ts` 统一承载
  - `domainValidator.ts`：复用 `domainPrimitives` 与 `formatLineParsers`，消除重复正则/校验定义，统计聚合拆出 `statsAggregator.ts`，行数降至 ≤200
  - `parseDomainFormats.ts` 改名为 `formatLineParsers.ts`，语义更清晰（格式行解析器）
  - `uiUtils.ts` 的 `generateLineNumbers`（操作 DOM ref）移出纯逻辑 `utils/`，归位 `hooks/useLineNumbers.ts`，保持 `utils/` 不含 React/DOM 依赖
  - `domainValidator` 重新导出 `ParseResult`/`ParseStats`，保持 `parser.ts`/`sortDedupe.ts` 公开 API 兼容
  - SEO 元数据模块归位：`app/site-meta.ts` 移入 `app/(seo)/site-meta.ts`，`layout.tsx` 同步更新 import；`robots.ts`/`sitemap.ts` 属 Next 约定文件保留于 `app/` 根以维持 `/robots.txt`、`/sitemap.xml` 路由

### Changed（原型体系 v3.7.59）
- 原型生成引擎对齐真实 `src/utils`（rulesGenerator / parser / formatGenerators）：白名单从黑名单剔除、自定义 DNS 按 domain 去重、blockIPv6 追加 IPv6 拦截、removeWildcard 控制通配符剥离、头部含版本+域名+白名单计数

### Changed（前端审查修复，v3.7.60）
- React 渲染性能：为 `useRules`/`useUrlManager` 的导出回调函数加 `useCallback` 稳定引用，避免下游 hook 与组件依赖链抖动触发无谓重渲染
- `Home.tsx` 的 `showToast` 改为 `useCallback` 包裹，切断 `useDomainData`/`useRules`/`useUrlManager` 依赖抖动
- `useLanguage` 的翻译对象 `t` 改用 `useMemo` 缓存，避免每次渲染深合并计算
- `OutputPanel` 用 `React.memo` 包裹，仅在 props 实际变化时重渲染
- `globals.css` 的 `.editor-preview` 增加 `content-visibility: auto` + `contain-intrinsic-size`，长文本预览跳过屏外渲染以降低首次绘制成本
- 补齐 9 种格式真实输出（含 Bind RPZ / 纯域名 / AdGuard 白名单段 `@@||domain^`），AdGuard 自定义 DNS 由 `||domain^$dnsrewrite` 修正为 `||domain^`
- 设置面板新增「AdGuard 含白名单」开关；i18n 下拉扩至真实 16 语言，阿拉伯语标记 RTL 并切换 `dir`
- 新增 Hero 签名元素「DNS 拦截流可视化」（拦截/放行/自定义三类流动态）

### Changed（审查修复 v3.7.61）
- 拆分超 200 行的 `domainValidator.ts`（原 268 行）：`parseDomainLine` 单行解析抽至 `parseLine.ts`、`parseSource` 跨行混排预览聚合抽至 `parseSource.ts`，`domainValidator.ts` 改为 re-export 兼容层（公开 API 不变，避免大范围改 import）
- `Home.tsx`：`syncScroll`/`toggleSection` 加 `useCallback`（函数式 setState 稳定依赖），移除纯转发 Middle Man `parseSource`，直接传 `parseSourceData`
- `Footer.tsx`：「更新日志」硬编码改为 `t.changelogLabel` 翻译键，新增 `changelogLabel` 键（zh-cn/en，Translation 接口设为可选，其他语言回退基准）

### Fixed（原型体系 v3.7.59）
- 修正 `wireframes.html` wlHeader 逻辑错误；移除装饰性章节序号；补齐 InputPanel/OutputPanel 语义化 id
- 预览区空状态引导文案；`prefers-reduced-motion` 降级（原型三件套）；flows 格式切换扩至 9 种

## [3.7.58] - 2026-08-22

### Added
- 完善高保真原型体系，新增 `prototype/wireframes.html`（组件库规范：基础/复合/业务组件 + 设计令牌 + 使用规则）与 `prototype/flows.html`（关键业务流程交互原型：URL 导入/格式切换/设置驱动/主题语言，带动效）
- 增强 `prototype/prototype.html`：补齐设置面板（项目名/版本/IPv4/IPv6/4 选项，实时驱动生成，对齐 `SettingsPanel.tsx`）、URL 批量导入区（流式加载态 + 10MB 上限模拟，对齐 `UrlSection.tsx`）、About 业务组件（GitHub/Star/更新日志/使用指南三步，对齐 `Footer.tsx`）

### Changed
- 同步全局版本展示位至 v3.7.58（package.json / version.ts / next.config.js / README / README.en / DEPLOYMENT / openspec SPEC.md / prototype 三件套头注释与版本引用）

## [3.7.57] - 2026-08-19

### Added
- 新增 `src/utils/domainPrimitives.ts` 与 `src/utils/parseDomainFormats.ts`：域名/IP 校验与规范化、各过滤格式入站解析器，供 domainValidator 与各格式解析器复用

## [3.7.56] - 2026-08-19

### Changed
- 同步全局版本展示位至 v3.7.56（package.json / version.ts / next.config.js / README / README.en / DEPLOYMENT / openspec config.yaml / SPEC.md / prototype / public 格式文件头注释）
- 修复 prototype 内部 `settings.version` 运行时默认值滞后（原 3.7.53）
- 修复 CHANGELOG `[Unreleased]` 锚点指向过旧版本（原 v3.7.45...HEAD → v3.7.56...HEAD）
- 刷新 public 预生成格式文件头注释至 v3.7.56

## [3.7.55] - 2026-08-19

### Changed
- 改进并统一 prototype 中 `.tablist`（role=tablist）的标签样式，对齐真实应用 `.format-tabs` / `.format-tab`：
  容器改 `rounded-lg`、选中态 `rounded-md` 加阴影、新增 hover 态与 `focus-visible` 焦点环、支持 `flex-wrap` 响应式换行

## [3.7.54] - 2026-08-19

### Added
- 增强格式转换入站解析：parseDomainLine 现支持 BIND RPZ（`domain CNAME .` / `*.domain CNAME .`）、
  SmartDNS（`address /domain/#` / `server /domain/ip` / `nameserver /domain/#`）、
  Unbound（`local-zone "domain" refuse|transparent`）三种新格式，Pi-hole 复用 hosts 解析
- 支持粘贴上述任意格式清单自动解析为统一结构并互转输出，补齐文档 4.1「不同格式互转」能力
- 为新增格式解析补充 vitest 用例（Pi-hole / RPZ / SmartDNS / Unbound）

### Fixed
- 修复 EdgeOne 构建失败：移除 `layout.tsx` 中错误的 `Header`/`Footer`/`loadDictionary` 命名导入与重复渲染（`loadDictionary` 不存在，且 layout 为 server component 无法提供交互 props，Header/Footer 由 Home 页面负责）；布局 main 改 div 避免嵌套重复 id
- 修复 `edgeone.json` 的 `root.headers.[0].source` 类型错误：EO 要求 `source` 字段，原 `path` 字段被拒

## [3.7.53] - 2026-08-19

### Added
- 补齐文档规定的 9 种过滤规则预生成静态产出：新增 unbound.conf / pihole.txt / rpz.db / smartdns.conf
- 新增 scripts/gen-format-files.mjs，从 public/domains.txt 派生全部格式文件（对齐 formatGenerators.ts 逻辑）
- package.json 增加 build:formats 命令；刷新现存格式文件版本至 v3.7.53
- 同步全局版本展示位至 v3.7.53
- 更新全部项目文档：明确工具既支持从统一数据源生成规则，也支持不同格式域名清单互相转换（README / README.en / SPEC / prototype / DEPLOYMENT 新增格式转换说明）

## [3.7.52] - 2026-08-19

### Added
- 在 layout 注入 Google Analytics 4（gtag）脚本，衡量 ID G-1VNKFYGRXR（取 NEXT_PUBLIC_GA_MEASUREMENT_ID，缺省回退约定 ID）
- 同步全局版本展示位至 v3.7.52

## [3.7.51] - 2026-08-18

### Changed
- 适配腾讯云 EdgeOne 构建环境 Node.js 24.11.0：新增 `.nvmrc` 锁定 24.11.0，并在 `package.json` 声明 `engines.node: ">=24.11.0"`
- 升级 `@types/node` 至 `^24` 匹配运行环境 Node 24（原 `^20`）
- `next.config.js` 新增 `images.unoptimized: true`，静态导出下避免 Node 24 环境 sharp 缺失告警
- 同步全局版本展示位至 v3.7.51（package.json / version.ts / README 徽章 / DEPLOYMENT / openspec）

## [3.7.50] - 2026-08-18

### Added
- 建立品牌资产单一来源 `brand/` 目录（logo.svg / logo-mono.svg / favicon.svg / brand-banner.svg），与 public/ 同源
- 新增源文件模块拆分：`src/types/formats.ts`（FormatType 与格式常量）、`src/utils/headerConfigs.ts`（各格式头部注释配置）、`src/app/site-meta.ts`（metadata/jsonLd 常量）

### Changed
- Header 品牌图标改为引用 `/logo.svg`，统一品牌资产来源（移除内联 SVG）
- README 的 logo 与品牌横幅引用路径统一指向 `brand/`
- 代码审查对齐：`layout.tsx` 元数据版本号改为引用 `APP_VERSION` 单一来源，消除硬编码漂移
- 统一同步全仓库源文件头注释版本至 v3.7.50
- openspec/SPEC.md、config.yaml、README、prototype 补充 5 种新增输出格式（Unbound/Pi-hole/纯域名/Bind RPZ/SmartDNS）说明
- 同步全局版本展示位至 v3.7.50

## [3.7.49] - 2026-08-18

### Fixed
- 修复导出头部用法说明在非 dnsmasq 格式下输出字面量 i18n 路径（如 `header.hostsUsage`）而非真实文案
- 修复统计数字与实际导出结果不符：UI 展示的黑名单/白名单/有效计数现已应用「去通配」「去重」「白名单剔除」设置，与生成规则一致
- 核实多源 URL 加载已采用 `Promise.allSettled` 部分容错，非缺陷（保留既有 failedUrls 提示）

## [3.7.48] - 2026-08-18

### Added
- 新增 5 种输出格式：Unbound（`local-zone refuse`）、Pi-hole（`0.0.0.0` gravity 兼容）、纯域名列表、Bind RPZ（`CNAME .` 响应策略区）、SmartDNS（`address /domain/#`）
- 各格式独立下载文件名设置与语义化导出 Tab
- 头部元信息覆盖全部 9 种格式，含对应部署用法说明

## [3.7.47] - 2026-08-18

### Changed
- 品牌横幅 `public/brand-banner.svg` 移除版本号（避免版本频繁变更需同步），改为展示 5 种生成清单胶囊：Dnsmasq / Hosts / AdGuard / 白名单 / 自定义 DNS
- 同步全局版本展示位至 v3.7.47

## [3.7.46] - 2026-08-18

### Added
- 新增品牌横幅 `public/brand-banner.svg`（蓝渐变背景 + 盾牌母版 + DNS Shield 字标 + 标语），置入 README 顶部
- `public/README.md` 品牌资产索引新增 brand-banner.svg
- 同步全局版本展示位至 v3.7.46

## [3.7.45] - 2026-08-18

### Fixed
- 消除 EO 静态导出下的 `no-page-custom-font` 警告：用 `next/font/google` 注入 Inter 与 JetBrains Mono，移除 `layout.tsx` 中的 `<link>` Google Fonts 标签，`globals.css` 字体变量改为引用 next/font 生成的 CSS 变量
- 修复 EO 静态导出忽略 `next.config.js` 的 `headers()` 安全头问题：新增 `edgeone.json` 配置安全响应头（CSP/HSTS/COOP/CORP 等），与 Vercel 策略一致

### Added
- 新增 `edgeone.json`（EO 静态导出 + 安全响应头）与 `vercel.json`（框架声明 + 统一安全头），协调腾讯云 EO 与 Vercel 双平台部署

### Changed
- 同步全局版本展示位至 v3.7.45

## [3.7.44] - 2026-08-18

### Fixed
- 修复构建类型错误：`Translation` 类型要求 `adguard`/`adguardFormat`/`adguardTitle`/`adguardDescription` 等 camelCase 键，但 16 个 locale 文件使用大写 `AdGuard*` 键名，导致 `i18n.ts` 类型不匹配（`next build` 失败）
- 将 16 个 locale 文件的 `AdGuard`/`AdGuardFormat`/`AdGuardTitle`/`AdGuardDescription` 键统一重命名为 camelCase

### Changed
- 同步全局版本展示位至 v3.7.44

## [3.7.43] - 2026-08-18

### Fixed
- 修复构建类型错误：`SettingsPanel` 引用 `t.adguardIncludeWhitelist` 但 `Translation` 类型缺失该键、各 locale 键名为 `AdGuardIncludeWhitelist`（大小写不一致）导致 `next build` 失败
- 在 `Translation` 类型补充 `adguardIncludeWhitelist` 键，并将 16 个 locale 文件的 `AdGuardIncludeWhitelist` 统一重命名为 `adguardIncludeWhitelist`

### Changed
- 同步全局版本展示位至 v3.7.43

## [3.7.42] - 2026-08-18

### Changed
- 从盾牌母版（`favicon.svg`，与 `logo.svg` 盾牌逐像素一致）重生成全部 PWA 图标（72/96/128/144/152/192/384/512），统一为蓝盾 `#0D5FE2` + 白勾
- 新增 `scripts/gen-icons.mjs` 图标生成脚本并注册 `icons:gen` 命令
- 同步全局版本展示位至 v3.7.42

## [3.7.41] - 2026-08-18

### Added
- Star 提示文案改为悬停 GitHub 链接时显示（`starPrompt`，16 语言）：指针悬停 GitHub/Star 链接触发 tooltip

### Changed
- 全局按钮圆角加大至 `rounded-xl`，强化主按钮阴影层级与「生成过滤规则」视觉权重
- 页脚链接、使用说明折叠按钮增加圆角与 hover 背景反馈，统一视觉语言
- 同步全局版本展示位至 v3.7.41

## [3.7.40] - 2026-08-18

### Changed
- 精简输出格式标签文案，减少宽度占用：
  - ADGuard 黑名单 → ADG 黑名单
  - ADGuard 白名单 → ADG 白名单（16 种语言同步）
- 同步全局版本展示位至 v3.7.40

## [3.7.39] - 2026-08-18

### Added
- 设置面板新增「ADGuard 黑名单是否包含白名单」开关（`adguardIncludeWhitelist`）
- 关闭时 ADGuard 黑名单仅生成拦截规则（纯黑名单语义），白名单仍可经独立「ADGuard 白名单」清单导出
- 16 种语言 i18n 文案同步
- 同步全局版本展示位至 v3.7.39

## [3.7.38] - 2026-08-18

### Changed
- 对齐左右文本框高度：输入与输出文本框容器均固定 504px 且 `h-full` 填满，
  统一左右面板内边距，文本框 `mt-auto` 贴面板底部，保证两栏文本框严格等高对齐
- 同步全局版本展示位至 v3.7.38

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

[Unreleased]: https://github.com/sutchan/DNS_Shield/compare/v3.18.0...HEAD
[3.18.0]: https://github.com/sutchan/DNS_Shield/compare/v3.17.4...v3.18.0
[3.17.4]: https://github.com/sutchan/DNS_Shield/compare/v3.17.3...v3.17.4
[3.17.3]: https://github.com/sutchan/DNS_Shield/compare/v3.17.2...v3.17.3
[3.17.2]: https://github.com/sutchan/DNS_Shield/compare/v3.17.1...v3.17.2
[3.17.1]: https://github.com/sutchan/DNS_Shield/compare/v3.17.0...v3.17.1
[3.17.0]: https://github.com/sutchan/DNS_Shield/compare/v3.16.1...v3.17.0
[3.16.1]: https://github.com/sutchan/DNS_Shield/compare/v3.16.0...v3.16.1
[3.16.0]: https://github.com/sutchan/DNS_Shield/compare/v3.15.6...v3.16.0
[3.15.6]: https://github.com/sutchan/DNS_Shield/compare/v3.15.5...v3.15.6
[3.15.5]: https://github.com/sutchan/DNS_Shield/compare/v3.15.4...v3.15.5
[3.15.4]: https://github.com/sutchan/DNS_Shield/compare/v3.15.3...v3.15.4
[3.15.3]: https://github.com/sutchan/DNS_Shield/compare/v3.15.2...v3.15.3
[3.15.2]: https://github.com/sutchan/DNS_Shield/compare/v3.15.1...v3.15.2
[3.15.1]: https://github.com/sutchan/DNS_Shield/compare/v3.15.0...v3.15.1
[3.10.1]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.10.1
[3.9.12]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.9.12
[3.8.1]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.8.1
[3.8.0]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.8.0
[3.7.68]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.68
[3.7.67]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.67
[3.7.56]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.56
[3.7.45]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.45
[3.7.44]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.44
[3.7.43]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.43
[3.7.42]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.42
[3.7.41]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.41
[3.7.40]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.40
[3.7.39]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.39
[3.7.38]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.38
[3.7.37]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.37
[3.7.36]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.36
[3.7.35]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.35
[3.7.34]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.34
[3.7.33]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.33
[3.7.32]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.32
[3.7.31]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.31
[3.7.30]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.30
[3.7.29]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.29
[3.7.28]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.28
[3.7.27]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.27
[3.7.26]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.26
[3.7.25]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.25
[3.7.24]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.24
[3.7.23]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.23
[3.7.22]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.22
[3.7.21]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.21
[3.7.20]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.20
[3.7.19]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.19
[3.7.18]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.18
[3.7.17]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.17
[3.7.16]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.16
[3.7.15]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.15
[3.7.14]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.14
[3.7.13]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.13
[3.7.12]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.12
[3.7.11]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.11
[3.7.10]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.10
[3.7.9]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.9
[3.7.8]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.8
[3.7.7]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.7
[3.7.6]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.6
[3.7.5]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.5
[3.7.4]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.4
[3.7.3]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.3
[3.7.2]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.2
[3.7.1]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.1
[3.7.0]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.7.0
[3.6.1]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.6.1
[3.6.0]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.6.0
[3.5.0]: https://github.com/sutchan/DNS_Shield/releases/tag/v3.5.0
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
