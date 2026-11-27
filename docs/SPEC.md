# DNS Shield 项目规范

> 最后审查：2026-11-27（与 package.json v3.22.4 对齐） · 文档集版本：v3.22.4
> 权威级别：规范（约束定义唯一权威） · 事实源：代码与脚本实算；任务状态见 `docs/tasks.md`，变更历史见 `CHANGELOG.md`。
> 冻结快照（`prototype/`、`public/brand-colors.md`、`docs/STRUCTURE-REVIEW.md`、`docs/tasks-done.md`）按各自声明保留，不作当前指标。
> 本轮同步（2026-11-27，v3.22.4）：README / README.en 新增「项目状态」聚合节（最新变更 / 已知边界 / 待办入口 / 关键决策）；`04-api.md` §7.1 补端点验证状态；`01-overview.md` §5 标注状态基线。任务唯一来源仍为 `docs/tasks.md`（当前 0 项），本文件不新增任务状态。

## 0. 规范总览与适用规则

本文件是项目**规范定义的唯一权威源**；协作流程见 `.github/CONTRIBUTING.md`，任务状态见 `docs/tasks.md`，变更历史见 `CHANGELOG.md`。四者冲突时以本文件为准（任务与指标数字除外——数字以脚本实算为准，见 §5.3）。

**约束级别**（全篇表格与条目的统一前缀）：

| 级别 | 含义 | 违反后果 |
|------|------|----------|
| **【强制】** | 必须满足，无例外 | CI 门禁失败、构建失败或用户数据损坏 |
| **【约定】** | 默认遵循，例外须在 PR 中说明理由 | 代码评审驳回 |
| **【指导】** | 推荐做法，按场景取舍 | 不计入评审阻塞项 |

**按模块定位规范**：

| 关心的问题 | 跳至 | 主要级别 |
|------------|------|----------|
| 项目事实、技术栈、语言优先级 | §1 项目概述 | 强制 |
| 目录职责、文件命名、硬编码引用 | §2.1 目录职责与硬约束 | 强制 |
| 域名源文件与输出格式语法 | §3 域名格式规范 | 强制 |
| 交互行为、DOM id、UI 呈现 | §4.1–§4.4 功能与交互约定 | 约定为主 |
| 编码红线、Hook 稳定性、Worker 契约 | §4.5 编码规范 | 强制 |
| 任务记录与数字实算 | §5.3 任务记录规范 | 强制 |
| 分支保留、提交格式、提交前门禁 | §7 Git 提交规范 | 强制 |
| 版本号、页脚展示、自动发版 | §8 版本管理 | 强制 |
| 依赖清单与预设源 | §9 依赖关系 | 指导 |
| 已知未修复问题（勿当作已生效能力） | §11 已知限制 | 强制 |
| 安全头部与文件操作 | §12 安全规范 | 强制 |

**通用约束**：① 全文「产物」专指 `public/` 下 11 个可订阅规则文件，「源文件」专指 `src/` 下 `.ts/.tsx/.css`；② 标注日期的规范自该日起生效，旧口径仅存于冻结快照；③ 数字型事实一律脚本实算（§5.3 第 5 条），禁止从记忆或其他文档抄写。

## 1. 项目概述

| 属性 | 值 |
|------|-----|
| 项目名称 | DNS Shield |
| 项目类型 | DNS 广告过滤规则库 + Web 管理工具 |
| 核心功能 | 基于 dnsmasq/hosts 的路由器全局广告防护 |
| 目标用户 | 使用梅林/OpenWrt/小米/华硕/TP-Link 等路由器的用户 |
| 项目地址（主页/治理） | https://github.com/sutchan/DNS_Shield（以 `git remote -v` 为准；`ArcesTeam` 为历史维护团队名，非仓库地址） |
| 运行时数据源（历史 fork 托管） | https://github.com/sutchan/DNS_Shield（raw 预设源，见 §9.3，勿改） |
| 演示地址 | https://dns.ewuse.com/ |
| 当前版本 | v3.22.4 |
| 拦截域名 | **127188 条**（黑名单 127188 + 白名单 0），2026-11-26 `node scripts/count-domains.mjs` 实算；2026-11-25 曾记录 644 条（回退态），已从 `af976b8` 恢复，`origin/auto/aggregate-upstream` 上 7fac633 的 129348 条未合入（T-DATA-01）。永远以实算为准，禁止手写数字 |
| 技术栈 | Next.js 14 + React 18 + TypeScript 5 + Tailwind CSS 3.4 |
| UI 框架 | shadcn/ui + Radix UI + Lucide Icons |
| 通知组件 | sonner |
| 国际化 | 16 种语言；优先级规范：**简体中文（默认）→ 繁体中文 → 英语**，其余语言跟随；`supportedLanguages` 顺序与 `<html lang>` / SEO `inLanguage` 保持一致 |

## 2. 文件结构

```
dns-shield/
├── README.md                       # 中文说明文档
├── README.en.md                    # 英文说明文档
├── CHANGELOG.md                    # 变更日志
├── DEPLOYMENT.md                   # 部署指南
├── .github/                        # Community Health Files（已迁至此，非根目录）
│   ├── CONTRIBUTING.md             # 贡献指南
│   ├── SECURITY.md                 # 安全指南
│   ├── SUPPORT.md                  # 支持文档
│   ├── CODE_OF_CONDUCT.md          # 行为准则（Contributor Covenant 2.1）
│   ├── PULL_REQUEST_TEMPLATE.md    # PR 模板
│   ├── FUNDING.yml                 # 赞助配置
│   └── ISSUE_TEMPLATE/             # Issue 模板（bug_report / feature_request）
├── docs/                            # 项目文档（00 索引；02 为根目录 DEPLOYMENT.md）
│   ├── README.md                   # 文档中心：导航、术语表、版本控制、维护规则
│   ├── 01-overview.md              # 项目概述：背景、目标、技术栈、架构
│   ├── 03-modules.md               # 功能模块 M1~M9 与业务流程图
│   ├── 04-api.md                   # HTTP 端点与浏览器内模块 API
│   ├── 05-user-guide.md            # 用户操作指南
│   ├── 05-security-assessment-csp.md # T-SEC-01 CSP / Trusted Types 评估结论
│   ├── 06-faq-troubleshooting.md   # FAQ 与故障排除
│   ├── 07-improvements.md          # 优化建议方案与闭环实证
│   ├── SPEC.md                     # 项目规范（本文件，约束唯一权威）
│   ├── tasks.md                    # 未完成任务清单（唯一来源）+ 实时指标
│   ├── tasks-done.md               # 已完成任务归档（含开发进度全景）
│   ├── CHECKLIST.md                # 发布质量检查清单
│   ├── TEMP-FILES.md               # 临时文件管理规范（.tmp/ 唯一合法位置）
│   ├── config.yaml                 # 规范配置（上下文、组件注册表、版本）
│   ├── openapi.yaml                # OpenAPI 3.1 端点契约（7 路径）
│   ├── STRUCTURE-REVIEW.md         # 结构审查快照（v3.12.0 起冻结）
│   └── AUDIT-REPORT-v3.19.0.md     # 三路代码审查汇总（v3.19.0 冻结快照）
├── scripts/                        # 构建/校验脚本
│   ├── check-locales.mjs           # 国际化键覆盖校验（npm run check:locales）
│   ├── check-doc-facts.mjs         # 文档数字权威化门禁（npm run check:doc-facts）
│   ├── check-openapi.mjs           # OpenAPI 结构 / 版本 / path / $ref 校验
│   ├── check-root-clean.mjs        # 根目录洁净度门禁（CI rootclean job；唯一合法位置根 .tmp/）
│   ├── check-security-headers.mjs  # next.config.js 与 edgeone.json 安全头一致性
│   ├── smoke-openapi.mjs           # 7 条端点契约冒烟（npm run check:api-contract）
│   ├── manage-tmp.mjs              # 临时目录管理工具（npm run tmp:init / tmp:clean）
│   ├── sync-facts.mjs              # 版本号写入 12 处文档展示位（--check 为 CI 门禁）
│   ├── gen-format-files.mjs        # 生成 11 个派生产物（npm run build:formats；domains 为数据源本身）
│   ├── count-domains.mjs           # 域名计数实算（npm run count:domains）
│   ├── aggregate-upstream.mjs      # 上游规则聚合（aggregate.yml 调用）
│   ├── gen-icons.mjs               # PWA 图标生成
│   ├── locale-baseline.json        # i18n 独立基线清单（防「集体缺键」）
│   └── lib/                        # 共享脚本模块
│       ├── domainSource.mjs        # 域名源读取
│       ├── formatHeaders.mjs       # 各格式头部（与运行时对齐）
│       ├── formatRules.mjs         # 规则文本生成
│       ├── validateOpenApi.mjs     # OpenAPI 语义校验（check-openapi 复用）
│       └── aggregateFetch.mjs      # 聚合抓取与域名提取（T-REFACTOR-01 拆分）
├── public/                         # 静态资源
│   ├── assets/icons/               # PWA 图标（72x72 ~ 512x512）
│   ├── domains.txt                 # 域名单一来源（含 + 白名单 / @ 改道 / # 注释）
│   ├── manifest.json               # Web 应用清单
│   ├── service-worker.js           # Service Worker
│   ├── brand-banner.svg / logo.svg / logo-mono.svg / favicon.svg # 品牌资源
│   ├── brand-colors.md             # 品牌色板（冻结快照）
│   ├── adguard.txt / dnsmasq.conf / hosts.txt / unbound.conf / pihole.txt
│   ├── whitelist.txt / rpz.db / smartdns.conf
│   └── mosdns_domain_set.txt / clash_dns.yaml / coredns_hosts.txt  # 11 种格式产物（domains 即数据源本身）
├── src/                            # Next.js 源代码
│   ├── app/                        # App Router 目录
│   │   ├── page.tsx                # 主页面入口
│   │   ├── about/page.tsx          # 独立「关于 / FAQ」事实页（v3.20.0，Server Component 预渲染）
│   │   ├── Home.tsx                # 主组件（组合各业务组件与 hook）
│   │   ├── globals.css             # 全局样式入口（Tailwind 指令 + 基础层 design tokens）
│   │   ├── layout.tsx              # 根布局（Metadata + SEO + 安全头部接入，按序导入 src/styles/*.css）
│   │   ├── (seo)/                  # <head> 注入类关注点（元数据、GA 脚本）
│   │   │   ├── site-meta.ts        # 站点元数据（re-export JSON-LD）
│   │   │   ├── json-ld.ts          # 站点级 @graph：Organization / WebSite / WebPage / SoftwareApplication
│   │   │   ├── about-json-ld.ts    # /about/ 页级 @graph：WebPage / FAQPage / HowTo（v3.20.0）
│   │   │   ├── meta-content.ts     # 标题与描述单一来源
│   │   │   └── ga-scripts.tsx      # GA4 脚本注入（衡量 ID 取自环境变量，缺失/非法则不注入）
│   │   ├── robots.ts               # 自动生成 robots.txt（含 sitemap 索引与 AI 爬虫白名单）
│   │   ├── sitemap.ts              # 自动生成 sitemap.xml（首页 + /about/ 两条真实路由）
│   │   └── llms.txt/route.ts       # 生成式引擎站点简报 /llms.txt（force-static 预渲染）
│   ├── components/                 # 业务组件
│   │   ├── ui/                     # shadcn/ui 基础组件（9 个：Badge/Button/Checkbox/DropdownMenu/EmptyState/Input/Label/Select/Toast；v3.18.0 清理 Card / Loading / Switch / Tabs）
│   │   ├── SeoContent.tsx          # 关于 / 12 格式清单 / FAQ（Server Component，v3.20.0 起仅在 /about/ 渲染）
│   │   ├── ServiceWorkerRegistrar.tsx # 生产环境注册同源 Service Worker（dev 跳过）
│   │   ├── SettingsLanguage.tsx    # 设置弹窗内的语言选择控件（v3.22.1）
│   │   ├── Header.tsx              # 页头（Shield 图标 + 分享/设置入口；语言/主题切换已移入设置弹窗）
│   │   ├── Footer.tsx              # 页脚（链接 + 使用说明）
│   │   ├── InputEditor.tsx         # 域名编辑器子组件
│   │   ├── InputPanel.tsx          # 输入面板（域名编辑 + URL 导入）
│   │   ├── InputPanel.types.ts     # 输入面板 props 接口与统计常量（v3.13.6 拆分）
│   │   ├── OutputPanel.tsx        # 输出面板（规则预览 + 设置）
│   │   ├── OutputPanel.formatSelect.tsx # 单一「格式」下拉（v3.15.5）
│   │   ├── OutputPanel.derived.ts  # 输出面板派生状态（useMemo 聚合）
│   │   ├── OutputPanel.parts.tsx   # 输出面板拆分子组件
│   │   ├── OutputPreview.tsx       # 规则预览窗（虚拟滚动）
│   │   ├── SettingsPanel.tsx       # 设置面板子组件
│   │   ├── SettingsForm.tsx        # 设置表单控件
│   │   ├── UrlSection.tsx          # URL 导入区域子组件
│   │   ├── CategoryFilter.tsx      # 上游分类筛选（T-P2-01/05）
│   │   ├── RuleTesterModal.tsx    # 域名匹配测试弹窗
│   │   ├── ScriptGeneratorModal.tsx # 路由器同步脚本弹窗
│   │   ├── GuideModal.tsx           # 使用指南弹窗
│   │   └── FlowViz.tsx            # 静态数据快照面板（v3.13.5 起移除下落 token 动效）
│   ├── config/
│   │   ├── defaults.json           # 默认设置单一来源（v3.12.0 收敛）
│   │   ├── index.ts                # 应用配置（预设源 URL、多镜像）
│   │   ├── version.ts              # 版本号单一来源（APP_VERSION，派生自 package.json）
│   │   ├── site.ts                 # 站点事实常量（URL / OG 图 / 16 语 / AI 爬虫 UA）
│   │   ├── languages.ts            # 语言优先级与 BCP 47 标签映射
│   │   ├── jsonld.ts               # JSON-LD @graph 常量
│   │   ├── seo-content.ts          # GEO 文案单一来源（关于 / 12 格式 / FAQ / HowTo / llms.txt）
│   │   └── seo.test.ts             # SEO/GEO 输出回归测试（15 用例）
│   ├── workers/
│   │   ├── ruleProcessor.worker.ts # 大文本解析 Worker（分片 + 进度上报，串行路径）
│   │   └── parseShard.worker.ts    # 多核并行解析分片 Worker（逐行收集，v3.16.0）
│   ├── context/
│   │   └── AppContext.tsx          # 应用上下文（集中提供 i18n 翻译 t）
│   ├── hooks/                      # 自定义 Hooks
│   │   ├── useDomainData.ts        # 域名数据管理（Web Worker 解析 + 自动保存）
│   │   ├── useLanguage.ts           # 语言切换
│   │   ├── useRules.ts             # 规则生成（惰性单格式生成 T-P1-06）
│   │   ├── useTheme.ts             # 主题切换
│   │   ├── useUrlManager.ts        # URL 管理
│   │   ├── useSettings.ts          # 设置管理
│   │   ├── useLoading.ts           # 加载状态管理
│   │   ├── useHomeController.ts   # 首页交互编排（toast 回退/进度）
│   │   ├── useHomeController.types.ts # 首页控制器返回契约类型（v3.13.6 拆分）
│   │   ├── useHomeUiState.ts      # 首页本地 UI 状态编排（折叠/弹窗/滚动聚焦，v3.13.6 拆分）
│   │   ├── useLineNumbers.ts       # 输出行号同步
│   │   ├── useAsyncRuleProcessing.ts # Worker 解析/排序/去重调度
│   │   ├── useRuleWorker.ts        # Web Worker 封装与阈值（parse 超阈值走多核并行池）
│   │   ├── useWorkerPool.ts        # 分片解析 Worker 池（负载均衡/聚合/回退，v3.16.0）
│   │   ├── useAutosave.ts          # 草稿自动保存编排
│   │   ├── autosaveStorage.ts      # localStorage 草稿读写
│   │   ├── useCategoryFilter.ts    # 分类筛选 UI 状态
│   │   ├── useCategoryIndex.ts     # 上游分类索引加载
│   │   ├── useModalA11y.ts         # 弹窗无障碍焦点管理
│   │   ├── useModalEscape.ts       # 弹窗栈 Escape 管理（仅栈顶响应，T-P1-16）
│   │   └── useVirtualList.ts      # 虚拟滚动（超大规模预览）
│   ├── lib/
│   │   └── utils.ts                # 工具函数（cn 等）
│   ├── locales/                    # 国际化翻译文件（16 种语言，zh-cn 为基准缺失键深合并回退）
│   │   ├── ar.json, cs.json, en.json, es.json
│   │   ├── hi.json, id.json, it.json, nl.json
│   │   ├── pl.json, ru.json, sv.json, th.json
│   │   ├── tr.json, vi.json, zh-cn.json, zh-tw.json
│   ├── styles/                     # 设计系统样式模块（v3.13.6 由 globals.css 按职责拆分）
│   │   ├── layout.css              # 布局骨架与面板容器
│   │   ├── stats.css               # 统计胶囊与 Worker 进度条
│   │   ├── input.css               # URL 导入区 / 编辑器 / 预览 / 预设标签
│   │   ├── output.css              # 输出面板与设置弹窗
│   │   ├── footer.css              # 页脚与使用指南
│   │   ├── feedback.css            # 加载态 / 弹窗 / 可访问性工具类
│   │   ├── hero.css                # Hero/FlowViz / 预览统计 / 动效降级
│   │   └── seo.css                 # 关于 / 格式清单 / FAQ 与 noscript 兜底（v3.18.0）
│   ├── test-utils/                 # 测试辅助（coverage.exclude 排除，不计入覆盖率）
│   │   ├── renderHook.ts           # 极简 renderHook（不依赖 testing-library）
│   │   ├── setup.ts               # jsdom localStorage/matchMedia 桩（vitest setupFiles）
│   │   ├── domainDataTestKit.ts   # useDomainData 测试装置（mock 实例 + 异步辅助）
│   │   ├── rulesTestKit.ts        # useRules 测试装置（翻译表/基础设置/样例数据）
│   │   └── urlManagerTestKit.ts   # useUrlManager 测试装置（统一装配）
│   ├── types/
│   │   ├── formats.ts              # FormatType / ALL_FORMATS（12 格式权威源）
│   │   ├── index.ts                # TypeScript 类型定义
│   │   ├── translation.ts          # 翻译类型
│   │   └── translation.parts.ts    # 翻译类型拆分片段
│   └── utils/                      # 工具函数
│       ├── analytics.ts            # GA4 衡量 ID 读取/校验与 gtag 片段生成（纯逻辑）
│       ├── domainValidator.ts       # 域名验证与行解析
│       ├── domainFetch.ts          # 远程域名列表拉取（超时/兜底/体积上限）
│       ├── fetchGuards.ts          # fetch 响应体积/超时护栏（v3.22.x）
│       ├── iterateLines.ts         # 逐行迭代（替代全量 split('\n')，v3.22.x）
│       ├── parser.ts               # 域名解析器（collectLines 逐行收集 + finalizeParsed 全局后处理，v3.16.0 拆分支持分片并行）
│       ├── parseAggregate.ts       # 并行度决策 / 行边界分片 / 原始产物聚合（v3.16.0）
│       ├── sortDedupe.ts           # 域名排序与去重（纯函数）
│       ├── rulesGenerator.ts       # 规则生成核心（12 格式编排 + prepareRuleData 统一口径）
│       ├── formatGenerators.ts     # 全量格式拼接（blocked/customDns/whitelist/regex/header）
│       ├── formatGenerators.single.ts # 惰性单格式生成（T-P1-06，与全量逐字节一致）
│       ├── headerConfigs.ts         # 各格式头部注释配置（HEADER_CONFIGS）
│       ├── fileUtils.ts            # 文件操作（下载、复制、URL 获取、sanitizeFilename）
│       ├── i18n.ts                 # 国际化配置
│       ├── parseLine.ts            # 单行多格式识别（hosts/dnsmasq/adguard/regex）
│       ├── domainCategory.ts       # 上游分类索引解析与筛选（T-P2-01/05）
│       ├── regexRules.ts           # AdGuard/Pi-hole 正则双向转换（T-P2-04/06）
│       ├── scriptGenerator.ts       # 路由器一键同步 Shell 脚本生成（shellQuote 防注入 T-P3-04）
│       ├── ruleMatcher.ts          # 域名匹配测试器引擎
│       ├── idb.ts                  # IndexedDB 持久化（T-P1-03）
│       ├── httpCache.ts / cachedFetch.ts # ETag 条件请求 + 离线缓存
│       ├── logger.ts              # 生产日志收敛（T-P0-03）
│       ├── lineCount.ts           # 非分配换行计数（T-P1-08）
│       ├── scrollLock.ts          # 共享滚动锁（引用计数，T-P1-17）
│       └── domainPrimitives.ts     # 原始域名/IP 类型原语
├── prototype/                        # 设计快照（v3.12.0 起冻结，停留 v3.9.x~v3.10.x，不代表当前实现）
│   ├── prototype.html               # 高保真可交互原型（独立 HTML，极简风格/真实数据/响应式）
│   ├── wireframes.html              # 线框与组件库规范（Wireframes & Component Library）
│   ├── flows.html                   # 关键业务流程交互原型（Interactive Flows）
│   ├── README.md                    # 原型总览与设计规范索引
│   └── shadcn/                       # 设计规范（单一来源，对齐 globals.css token）
│       ├── design-system.md          # 设计系统（色彩/字体/间距/图标/动效）
│       ├── component-library.md      # 组件库（基础/复合/业务组件）
│       └── interaction-standards.md  # 交互标准（模式/反馈/错误/空状态）
├── e2e/                            # Playwright 无障碍回归（a11y.spec.ts，npm run check:a11y）
├── .env.example                    # 环境变量样例（GA / 预设源等，不含真实密钥）
├── .eslintrc.json                  # ESLint 配置
├── .gitattributes                  # Git 行尾与属性配置
├── .gitignore                      # Git 忽略配置（含 .tmp/、playwright-report/ 等产物目录）
├── .npmrc                          # engine-strict=true（必须入库）
├── DNS_Shield.code-workspace       # 工作区配置（唯一，禁止删除）
├── edgeone.json                    # EdgeOne Pages 配置（安全头与 next.config.js 对齐）
├── next.config.js                  # Next.js 配置（安全头部单一来源）
├── next-env.d.ts                   # Next.js 环境类型定义
├── package.json                    # 项目配置和依赖（版本唯一权威源）
├── package-lock.json               # npm 锁定文件（必须入库，CI 以 npm ci 安装）
├── playwright.config.ts            # Playwright 配置（testDir: ./e2e）
├── postcss.config.js               # PostCSS 配置
├── tailwind.config.js              # Tailwind CSS 配置
├── tsconfig.json                   # TypeScript 配置
├── vitest.config.ts                # Vitest 单元测试配置
└── vitest.bench.config.ts          # 50MB 大输入基准（npm run benchmark:large，不进入默认套件）
```

### 2.1 目录职责与硬约束（2026-11-22 起）

> **本节全部为【强制】**：各目录只承载本职责内容，跨层调用视为架构违规。

| 目录 | 职责 | 禁止事项 |
|------|------|----------|
| `src/app/` | App Router 约定层：路由、布局、SEO/PWA/llms.txt 路由 | 不得放业务逻辑；`page.tsx`/`layout.tsx` 等约定文件**不可重命名**（框架按路径加载） |
| `src/components/` | 展示层（`.tsx`）与派生状态；`ui/` 为 shadcn 基础组件 | 不得在组件内直接 fetch 或写 localStorage（交 `hooks/`）；单文件 ≤200 行 |
| `src/hooks/` | 状态编排层：副作用、Worker 调度、自动保存 | 不得放可独立测试的纯计算（放 `utils/`）；返回值对象须 `useMemo` 稳定 |
| `src/utils/` | 纯函数层：解析、校验、排序去重、规则生成、fetch 护栏 | 不得依赖 React 或浏览器全局（须可在 node 环境单测） |
| `src/workers/` | 后台线程：解析分片、进度上报 | 入口文件名不可改（`new URL(..., import.meta.url)` 需静态可分析） |
| `src/config/` | 站点/应用事实与常量（版本、站点信息、默认设置、GEO 文案） | 不得硬编码版本号（取 `version.ts`）；格式清单等事实应集中而非多处复制 |
| `src/locales/` | 16 语翻译 JSON，`zh-cn` 为缺失键深合并回退基准 | 键集必须与 `scripts/locale-baseline.json` 一致；不得在组件内散落硬编码文案 |
| `src/styles/` | 设计系统样式，按职责拆分 | 仅由 `app/layout.tsx` 按序 side-effect 导入，组件内不得 `@import` |
| `src/test-utils/` | Vitest 共享装置与 setup | 属测试辅助代码，不计入覆盖率门禁 |
| `public/` | 静态交付物：数据源、11 个规则产物、PWA 与品牌资源 | **产物文件名即线上订阅 URL，禁止改名/移动**；产物由 `gen-format-files.mjs` 生成，不得手改 |
| `scripts/` | 离线生成与 CI 门禁脚本 | 一次性脚本归 `.tmp/scripts/`，不得留 `_` 前缀临时文件（`check-root-clean.mjs` 拦截）；完整规范见 `docs/TEMP-FILES.md` |
| `docs/` | 规范文档 | `tasks.md` 为未完成任务唯一来源，禁止在别处另建任务清单；`TEMP-FILES.md` 为临时文件权威规范 |
| `prototype/` | 设计快照（v3.12.0 起冻结） | 不代表当前实现，不回填 |

**硬约束（改动前必查引用）**：

1. `scripts/sync-facts.mjs` 硬编码读取 7 个文档（`README.md`/`README.en.md`/`DEPLOYMENT.md`/`docs/SPEC.md`/`docs/config.yaml`/`docs/tasks.md`/`docs/CHECKLIST.md`）——**这些文件不得移动或改名**，否则 CI 版本门禁直接失败。
2. `public/` 下 11 个规则产物 + `domains.txt` 是线上订阅端点，URL 形如 `https://dns.ewuse.com/dnsmasq.conf`。
3. 目录重构前先跑引用检索（`search_content` / `git grep`），确认无引用后再动；「搜索无 import 命中」不等于死代码——locale JSON 由 `i18n.ts` 静态 import、CSS 由 `layout.tsx` side-effect 导入、App Router 约定文件由框架按路径加载、测试装置由 `vitest.config.ts` 字符串路径引用。

## 3. 域名格式规范

### 3.1 domains.txt 格式

| 前缀 | 含义 | 示例 |
|------|------|------|
| 无前缀 | 黑名单，阻止解析 | `ad.example.com` |
| `+` | 白名单，允许通过 | `+api.example.com` |
| `!` | 注释域名 | `!commented.example.com` |
| `@` | 自定义 DNS 指向 | `@example.com=0.0.0.0` |
| `#` | 注释行 | `# 这是注释` |

### 3.2 输出格式

| 格式 | 规则示例 | 白名单示例 |
|------|----------|------------|
| Dnsmasq | `address=/example.com/127.0.0.1` | `server=/example.com/` |
| Hosts | `127.0.0.1 example.com` | `# 已白名单: example.com` |
| AdGuard | `\|\|example.com^` | `@@\|\|example.com^` |

## 4. Web 管理工具功能

### 4.1 输入功能

| 功能 | 说明 |
|------|------|
| URL 导入 | 从远程 URL 获取域名列表（带超时控制 10s） |
| 预设源 | 内置数据、AdGuard、EasyList、NeoHosts |
| 手动编辑 | 直接在文本框编辑域名 |
| 本地加载 | 自动加载 domains.txt 文件 |
| 多格式解析 | 输入支持 hosts / dnsmasq / AdGuard / 纯域名混合，`parseDomainLine` 逐行识别格式并提取域名、白名单(`+domain`)、自定义 DNS(`@domain=ip`)、注释(`#`) |
| 格式转换 | 粘贴任意格式清单，自动解析为统一域名条目结构后再输出为目标格式，实现不同格式互转 |
| 自动保存 | 每 30 秒自动保存到 localStorage |
| 自动恢复 | 页面加载时恢复未保存内容；**草稿优先契约**：本地草稿始终优先于远端预设清单——草稿无条件恢复，远端加载完成后若检测到草稿已恢复即放弃远端内容（两种网络/存储时序下用户编辑都不得被内置清单覆盖，见 T-P1-11） |
| 隐私统计 | 可选接入 Google Analytics 4（衡量 ID 仅从环境变量 `NEXT_PUBLIC_GA_MEASUREMENT_ID` 注入，源码不硬编码；须形如 `G-XXXXXXXXXX`，留空或格式非法则不注入统计脚本并输出开发期诊断日志；CSP 已放通 gtag 域名） |

### 4.2 输出功能

| 功能 | 说明 |
|------|------|
| Dnsmasq 格式 | `address=/domain/IP` |
| Hosts 格式 | `IP domain` |
| AdGuard 格式 | `\|\|domain^` |
| 白名单格式 | `@@\|\|domain^` |
| Mosdns 格式 | `domain:domain`（domain-set，匹配域名及子域） |
| Clash Meta 格式 | `DOMAIN-SUFFIX,domain,reject`（白名单为 `DIRECT`） |
| CoreDNS 格式 | `0.0.0.0 domain`（hosts 插件格式） |
| 十二种目标格式 | Dnsmasq / Hosts / AdGuard / 白名单 / Unbound / Pi-hole / 纯域名 / Bind RPZ / SmartDNS / Mosdns / Clash Meta / CoreDNS，由统一中间结构生成 |
| 头部注释 | 自动生成项目信息头；**注释符契约**：头部每一行（含「使用方法」等说明行）都必须以该格式的注释符开头（`#` / `!` / `;`），否则 dnsmasq/unbound 会因未知指令拒绝加载整个配置、hosts/AdGuard 清单会混入非法条目、Bind RPZ 区域文件会语法报错（见 T-P1-10） |
| 一键下载 | 下载生成的文件 |
| 剪贴板复制 | 复制生成的内容 |

### 4.3 选项设置

| 设置项 | 默认值 |
|--------|--------|
| 项目名称 | DNS Shield |
| 版本号 | 3.22.4 |
| IPv4 目标 IP | 127.0.0.1 |
| IPv6 目标 IP | :: |
| 添加头部注释 | 开启 |
| 阻止 IPv6 | 关闭 |
| 自动去重 | 开启 |
| 移除通配符前缀 | 开启 |

### 4.4 交互与 DOM 约定

| 约定 | 说明 |
|------|------|
| 语义化 DOM id | 所有可定位元素使用 kebab-case 语义 id（如 `source-editor` / `share-btn` / `guide-modal`），与 `prototype/` 的 id 保持一一对应；`htmlFor` / `aria-*` / JS 选择器必须同步，禁止 camelCase 与无语义命名（如 `div1`）；不得出现重复 id |
| 弹窗 Escape | 所有弹窗统一经 `useModalEscape` 注册到弹窗栈，一次 Escape 只关闭栈顶弹窗，避免叠放弹窗被同一个按键全部关闭 |
| 滚动锁 | 弹窗打开期间锁定 `body` 滚动，统一使用 `utils/scrollLock` 的引用计数实现，禁止直接写 `document.body.style.overflow`，避免内层弹窗关闭时解除外层锁定 |
| 异步竞态 | Worker 解析/排序/去重等异步结果落地前必须校验请求序号与输入快照，过期结果直接丢弃；Worker 卸载时须结算全部挂起任务，不得让调用方 `await` 永挂 |
| 解析任务单飞 | `useRuleWorker` 以内容键 `task + '\0' + text` 复用同一解析任务并作废旧输入结果；`useWorkerPool` 并行分支按文本单飞且池引用必须 `useMemo` 稳定，避免重复派发导致 `postMessage` 克隆大文本堆积（内存护栏，2026-11-12） |
| 设置联动 | 设置项（IP、项目名、去通配/去重开关）与界面语言变更后必须重新生成预览与导出内容，避免预览停留在旧口径 |
| 设置弹窗布局 | 4 个分组（项目信息 / 生成选项 / 输出规则类型 / 外观）仅后两者带标题；字段 2 列、格式开关等宽 3 列（≤480px 回落 2 列）、选项末项整行铺满；不得恢复重复分组标题（v3.16.1） |
| 首屏本地化与主题 | `layout.tsx` 在 body 起始处用内联脚本按 localStorage 设置 `<html lang>` / `dir` / `.dark`；`useLanguage` 同步 `lang`+`dir`，`useTheme` 初始化只读偏好、**仅用户显式切换时写盘**，保留「跟随系统」语义，禁止把默认值写回 localStorage（v3.19.0） |
| 可读性 | 辅助文本 ≥12px、正文 14px；`--muted-foreground` 与背景对比度 ≥4.5:1，禁止在灰字上叠加 `/70` 等透明度；分组标签不用全大写；`aria-live` 只在容器上声明一次，禁止逐项播报（v3.19.0） |
| CTA 唯一性 | 主「生成规则」按钮固定为输入区 `#parse-btn`；输出区同类按钮只能是次级变体并明确写「刷新预览」，不得出现两个同名主按钮（v3.19.0） |
| 统计口径 | 输入区 `#stats-bar` 只展示**输入解析结果**，输出区 `#preview-stats` 只展示**产物统计**；不得重复呈现黑名单/白名单/改道，行数标签须写清口径（输入行 vs 规则行）；`merge-info` 已移除（v3.19.0） |
| 引导与折叠 | Hero 快速入门三步必须是可聚焦锚点（分别定位 `#source-editor` / `#output-format-select-btn` / `#download-btn`）；FAQ 用 `details/summary` 折叠且答案保留在 SSR HTML；折叠控件用 Lucide 图标而非字符（v3.19.0） |
| 主题入口 | 仅在设置弹窗「外观」分组内提供明暗三态分段控件；`v3.22.1` 起顶栏已移除 `#theme-toggle-btn` 与语言下拉，只保留「分享 / 设置」入口（见 CHANGELOG v3.22.1） |
| 空状态 | 统一使用 `src/components/ui/EmptyState.tsx`，带语义化 `id` 与 `role="status"`，禁止各处内联空态（v3.19.0） |
| 视觉层级与栅格 | 设计方向为「控制台：规则文件就是产品」：Hero 无边框/纯色信息带、工具面板白卡+边框、SEO 区仅一条分隔线；工作台双栏等宽（`md` 起 1:1，两列 `minmax(0,1fr)` 防内容撑破），窄屏单列；中文标题统一 sans 700 + `-0.02em`，等宽仅用于代码/域名（v3.19.0，详见 `prototype/shadcn/design-system.md §2.1`） |

### 4.5 编码规范（2026-11-22 起）

> **本节全部为【强制】**，例外须在 PR 中明示并获得评审同意；现状与约定不符之处以 §11 已知限制为准。

| 项 | 约定 |
|------|------|
| 语言与类型 | TypeScript `strict: true`；生产代码禁用 `any`（当前 0 处）、禁用游离 `console.*`（统一走 `utils/logger`）；类型导入用 `import type` |
| 文件规模 | `src/` 与 `scripts/` 下代码文件（含测试）**≤200 行**，超限先拆分再提交（2026-11-26 实扫 0 个超限，由 `npm run check:doc-facts` 持续守护，见 `docs/tasks-done.md` T-REFACTOR-01 / `docs/07-improvements.md` O-13）；组件拆分沿用 `Xxx.parts.tsx` / `Xxx.derived.ts` / `Xxx.types.ts` 既有命名法 |
| 纯函数优先 | 可独立测试的计算放 `src/utils/`，不得混入 React 依赖；`utils/` 代码必须能在 node 环境（Vitest 默认环境）直接单测 |
| 单一数据源 | 版本号取 `src/config/version.ts`；默认设置取 `config/defaults.json`；格式清单、头部模板、SEO 文案等**同一事实只允许一处定义**（发现第二处即视为待重构）；生成物头部由 `scripts/` 统一派生，禁止手改 |
| Hook 稳定性 | 返回对象/函数须 `useMemo` / `useCallback` 稳定；`Context` 的 `value` 必须 memo 化（`Home.tsx` 已用 `useMemo(() => ({ t: c.t }), [c.t])` 稳定 `AppProvider` 的 value，2026-11-25 已闭环 M-12）；Worker 池等返回对象同样须稳定，避免触发 effect 自持循环 |
| Worker 约定 | Worker 入口文件不可改名；`postMessage` 前必须做任务标识与内容快照校验，过期结果丢弃；卸载时结算全部挂起任务，禁止让调用方 `await` 永挂；分片收集与全局后处理必须分离（`collectLines` / `finalizeParsed`），保证并行与串行等价 |
| 异步与竞态 | 所有异步结果落地前校验请求序号；失败必须有可见反馈（toast/错误态），禁止「返回空串当成功」导致静默清空用户数据；写盘失败（IndexedDB / localStorage）须向上传播并提示，禁止无条件弹成功 |
| 大输入 | ≥20000 行走多核分片并行（`useWorkerPool`），失败逐级回退单 Worker → 主线程；注意 `push(...arr)` 展开上限（约 12.6 万元素即 RangeError），大数组须用 `for` 循环或 `concat` |
| 国际化 | 全部用户可见文案走 `useT()` / locale JSON；新增键须同步 16 语并跑 `npm run check:locales`；语言优先级固定为**简体中文 → 繁体中文 → 英语**（`supportedLanguages` 顺序即优先级） |
| 日志与错误 | 统一 `utils/logger`；可恢复错误给用户可见提示，不可恢复错误记录上下文后上抛；禁止 `catch {}` 静默吞异常 |
| 样式 | Tailwind 原子类为主，自定义样式进 `src/styles/`；遵循 §4.4 视觉层级与栅格约定 |
| 注释 | 仅注释「为什么」而非「做了什么」；文件头注释须写清版本、职责与关键约束；改动文件才更新头注释版本号，禁止全仓库批量刷写 |
| 依赖引入 | 新增依赖须评估体积与许可证，并同步 `package.json`、`docs/SPEC.md` §9 与 `package-lock.json`（原零引用依赖 `@radix-ui/react-{switch,tabs,toast}` 已于 v3.22.x 移除） |

## 5. 维护流程

### 5.1 新增规则

> **【约定】** 日常更新以 `aggregate.yml` 的上游聚合为准（提交落在 `auto/aggregate-upstream`，合并后删分支，见 §7.1）；手工编辑 `domains.txt` 仅用于紧急修复，且下次聚合会覆盖——手工改动须同步评估是否需要回填上游。

1. 编辑 `public/domains.txt`，添加新域名
2. 启动开发服务器：`npm run dev`
3. 访问 http://localhost:3000（端口由 `package.json` 的 `dev` 脚本固定）
4. 加载 `domains.txt` 或手动输入
5. 配置输出选项
6. 点击"生成规则"
7. 下载更新后的文件

### 5.2 更新周期

- 每 2 周检查一次规则有效性
- 重要广告域名应及时更新

### 5.3 任务记录规范（强制）

> **本节为项目长期遵循的强制规则，不因单次任务而放宽。**

1. **唯一来源**：[`docs/tasks.md`](./tasks.md) 是项目**未完成任务**与**实时指标**的唯一来源（Single Source of Truth）；已完成任务、历轮变更叙述与开发进度全景归档于 [`docs/tasks-done.md`](./tasks-done.md)。两文件按「活跃清单 / 归档」分工，不重复维护同一条目，避免两处口径漂移。
2. **禁止另建**：项目内其他位置（`README.md`、`docs/SPEC.md`、`docs/CHECKLIST.md`、`CHANGELOG.md`、`prototype/`、源码注释等）**不得**另建任务清单或以 `- [ ]` 形式维护任务条目。
3. **文档分工**：
   - `docs/tasks.md` — **未完成任务**清单（数量与状态以该文件 §二 实时声明为准，禁止在本规范或其他文档写死项数）+ 实时指标 + 日常/定期/版本发布维护清单
   - `docs/tasks-done.md` — **已完成任务**归档（结构化任务、专项整改、验收标准、诊断证据、开发进度全景）
   - `docs/CHECKLIST.md` — 发布/验收前的**质量核验清单**（非任务跟踪，不含排期与优先级）
   - `docs/SPEC.md` — 规范定义（不含任务状态）
   - `CHANGELOG.md` — 已发布版本的历史变更记录（不可篡改）
4. **更新时机**：新增任务、完成任务、任务状态或优先级变更、发现新缺陷时，**必须**同步更新 `docs/tasks.md`，并在其「最后审查」时间戳中记录更新时间；任务完成后将条目移入 `docs/tasks-done.md`，使 `tasks.md` 仅保留未完成项。
5. **数据准确性**：`docs/tasks.md` 中的数据型数字（i18n 键数、测试用例数、覆盖率、文件行数、格式数量等）**必须用脚本实算**后填写，禁止凭记忆书写；修改前先实查 `package.json` 等权威源。无法实跑时沿用最近一次实测值并注明，不得凭静态计数臆改。
6. **删除冗余**：若发现其他文档存在任务清单内容，须按「未完成 → `docs/tasks.md`、已完成 → `docs/tasks-done.md`」迁移，并删除冗余任务文档；原位置仅保留问题证据 / 方案正文与指向 `tasks.md` 的链接，不保留第二份状态。
7. **CHECKLIST 例外**：`docs/CHECKLIST.md` 是**发布验收清单**（每次发版逐项核验），允许使用 `- [ ]` 复选框，不受第 2 条「禁止 `- [ ]`」约束；但严禁在其中记录任务状态或新增任务条目。
8. **任务型表述回流（强制）**：任何文档（`AUDIT-REPORT*.md`、`07-improvements.md`、FAQ、README、CHANGELOG、代码注释等）出现「修：」「待评估」「待验证」「TODO」「未实施」「未闭环」「未修复」等任务型表述时，必须能在 `docs/tasks.md` 找到对应条目；**先补登、后改原文**。原位置只描述问题与方案，状态与排期一律以 `docs/tasks.md` 为唯一来源。审计报告等冻结快照不回填状态，只在入口处指向任务清单。

## 6. 路由器兼容列表

> 兼容声明分三级：**原生脚本**（`src/utils/scriptGenerator.ts` 提供一键 Shell 脚本）＞ **规则导入**（手动把产物贴入设备或 DNS 软件配置）＞ **间接方案**（设备把 DNS 指向局域网内解析服务）。下表只收录有代码或公开文档支撑的映射；未证实的能力不写作「兼容」。

### 6.1 原生一键脚本（代码已实现）

| 路由器 / 固件 | 推荐产物 | 接入方式 | 依据 |
|---------------|----------|----------|------|
| OpenWrt | `dnsmasq.conf` | `openwrt` 脚本写入 `/etc/dnsmasq.d/dns-shield.conf`，重启 dnsmasq | `src/utils/scriptGenerator.ts` |
| AsusWRT-Merlin | `dnsmasq.conf` | `merlin` 脚本写入 `/jffs/configs/dnsmasq.conf.add` | 同上 |
| Padavan | `dnsmasq.conf` | `padavan` 脚本写入 `/etc/storage/dnsmasq/dnsmasq.conf` | 同上 |
| SmartDNS | `smartdns.conf` | `smartdns` 脚本写入 `/etc/smartdns/conf.d/` | 同上 |
| Pi-hole | `pihole.txt` | `pihole` 脚本写入 `/etc/pihole/custom.list` | 同上 |

### 6.2 规则文件导入（无原生一键脚本）

| 目标 | 推荐产物 | 接入方式 | 边界与依据 |
|------|----------|----------|------------|
| OpenClash（OpenWrt 插件） | `dnsmasq.conf` | 「插件设置 → 开发者选项」配置自定义 dnsmasq 规则文件，由插件加载本产物 | 依据社区文档 `github.com/Aethersailor/Custom_OpenClash_Rules/wiki`，菜单路径随版本变化，**不声明为官方支持** |
| mihomo / Clash Meta | `clash_dns.yaml` | 将文件内 `DOMAIN-SUFFIX,...,REJECT` 规则段追加到配置 | 官方文档 [Routing Rules](https://wiki.metacubex.one/en/config/rules/) 定义该语法；本产物是规则段，不是完整配置 |
| AdGuard / AdGuard Home | `adguard.txt` | 作为过滤器列表导入；白名单另取 `whitelist.txt` | 产物头部与 [04 API](./04-api.md) |
| 小米 / 华硕 / TP-Link 家用固件 | `hosts.txt` | 粘贴到「自定义 hosts / 广告拦截」 | 固件界面因型号而异，不保证全部型号可用 |

### 6.3 无原生导入能力

华为、中兴等家用路由器固件通常只提供「自定义 DNS 服务器地址」或网址过滤，未查到公开的 Dnsmasq 配置文件 / Shell 脚本导入接口，因此**不声明原生兼容**。可行方案是把设备 DNS 指向局域网内运行 SmartDNS 或 AdGuard Home 的主机，由该主机加载 `smartdns.conf` / `adguard.txt`。

> mihomo / Clash Meta 的 `rule-providers`（`type: http` + `format: yaml`）要求远端文件为 `payload:` 规则集格式；本项目 `clash_dns.yaml` 是规则段，**不是**可直接订阅的 rule-provider 源。

## 7. Git 提交规范

**【强制】** 提交信息采用 Conventional Commits：`type: 描述`；`type` 仅限下表 9 种，与 `.github/CONTRIBUTING.md` 保持一致。

| type | 用途 | type | 用途 |
|------|------|------|------|
| `feat` | 新功能 | `test` | 测试增删或调整 |
| `fix` | 缺陷修复 | `perf` | 性能优化 |
| `docs` | 文档变更 | `ci` | CI/CD 配置变更 |
| `chore` | 构建/工具链杂项 | `revert` | 回滚先前提交 |
| `refactor` | 不改变行为的代码重构 | `style` | 格式与样式调整（不改变逻辑） |

### 7.1 分支保留策略（2026-11-21 起）

- **仅保留 `main`（主干）与 `dev`（备份）两个分支**，本地与远程均不保留其它长期分支；历史 `fix/*` / `rebuild` 与全部 `dependabot/*` 分支已清理。
- 依赖升级（尤其 Next / TypeScript / Tailwind / ESLint 等破坏性大版本）**不在 `dev` 之外单独建长期分支**；如需评估，从 `dev` 切临时分支逐个验证后合入，验证完即删。
- `auto/aggregate-upstream` 是自动化域名聚合分支：其提交只改 `public/domains.txt`，由 `aggregate.yml` 创建；合并后应删除远程分支（2026-11-21 已合并至 `main` 并删除）。
- 分支合并前须区分「真更新」与「回退」：`ahead>0` 不等于可合并——`rebuild` 分支虽 ahead=1 但把版本回退到 v3.9.10 并引入已废弃的 `edgeone.json`，禁止直接合入 `main`。

### 7.2 协作流程与提交前门禁（2026-11-22 起）

**流程**：改动 → 本地门禁全绿 → 提交（Conventional Commits）→ 推送 → CI 自动跑 `rootclean`/lint/typecheck/test/build → 全绿后 `Deploy` 自动部署 → `Release` 自动按 `package.json` 版本打 tag 发版（无需手动打 tag）。

**提交前必跑门禁**（缺一不得提交）：

```bash
node scripts/check-root-clean.mjs      # 根目录临时文件洁净度
node scripts/sync-facts.mjs --check    # 12 处文档版本展示位
npm run check:locales                     # 16 语 / 214 键一致
node scripts/count-domains.mjs         # 域名计数（改动 domains.txt 时）
npm run lint && npx tsc --noEmit && npm run test
```

**发布前另需**：`node scripts/sync-facts.mjs`（写回展示位）、`npm run build:formats`（重建 11 个产物头部）、`CHANGELOG.md` 新增对应版本小节与比较锚点（正文小节与底部链接定义区**必须成对**，缺锚点即失效链接）。

**评审要点**：PR 需说明变更内容、影响的格式/语言/产物、测试情况；涉及 `public/` 产物、`docs/` 展示位、`src/locales/` 键集、Worker 入口或 `scripts/` 硬编码路径的改动，须在描述中点名，避免下游断链。

**临时文件**：完整规范见 [TEMP-FILES.md](./TEMP-FILES.md)——唯一合法位置为根目录 `.tmp/`（已 gitignore，含 `scripts/`/`logs/`/`cache/`/`downloads/`/`test-output/` 子目录，由 `npm run tmp:init` 自动创建、`npm run tmp:clean` 一键清理）；一次性脚本、探针、运行日志、缓存、下载文件、测试输出均归此目录，会话结束即清理；长期证据写入 `docs/` 或固化为测试断言。根目录散落由 `check-root-clean.mjs` 拦截（被 ignore 不等于被允许）。例外：`src/utils/scriptGenerator.ts` 生成的路由器 Shell 脚本中的 `/tmp/` 是目标设备运行时路径，不属仓库临时文件。

**锁文件**：`package-lock.json` 与 `.npmrc` **必须入库**。`.github/actions/setup/action.yml` 在 CI 中以 `npm ci` 安装并显式断言锁文件存在，缺失即失败；`.npmrc` 的 `engine-strict=true` 使 `engines.node >=24.15.0 <25` 与 `engines.npm >=11` 在安装期生效（`package-manager-strict` 属 pnpm 选项，npm 不适用）。二者均已就位并通过 Node 24.15+ / npm 11 实机验证（T-BUILD-01 / T-COMPAT-01，2026-11-26 归档）；历史 BLOCKER 见 `docs/AUDIT-REPORT-v3.19.0.md` B-01（冻结快照，不维护当前状态）。


## 8. 版本管理

使用 [SemVer](https://semver.org/) 格式: `v1.1.2`

| 版本类型 | 说明 |
|----------|------|
| 主版本号 (MAJOR) | 重大规则变更/格式变化 |
| 次版本号 (MINOR) | 新增功能/规则 |
| 修订号 (PATCH) | 规则修正/优化 |

### 8.1 页脚版本号与构建编号（展示规范）

应用页脚（`src/components/Footer.tsx`）**必须**同时展示「版本号」与「构建编号」，格式为：

```
V{APP_VERSION}· build {NEXT_PUBLIC_BUILD_ID}
```

- **版本号**：取自 `src/config/version.ts` 的 `APP_VERSION`（单一来源，派生自 `package.json`），与 `next.config.js` 的 `env.version` 一致。
- **构建编号（build）**：格式 **`yymmddhhmm`（2 位年 + 月日时分）**，例如 `2611061430`；由 `next.config.js` 的 `buildTimeId()` 在构建时生成并注入客户端环境变量 `NEXT_PUBLIC_BUILD_ID`。CI 可覆盖该值以反映真实构建时间。
- **回退**：`NEXT_PUBLIC_BUILD_ID` 缺失时（如静态导出场景），页脚回退为版本号，保证始终有可识别标识。
- **发版核验**：页脚内容由 `env.version` + 运行时 `NEXT_PUBLIC_BUILD_ID` 驱动，**无需手改版本号**；但 `docs/tasks.md` 第五章「版本发布清单」**包含**页脚核验项（`V{APP_VERSION}· build {2 位年编号}`），发版时须逐项勾选。改动 `next.config.js` 的 `buildTimeId()` 或 `Footer.tsx` 展示格式时，须保持三者一致并同步本节与发布清单。

### 8.2 自动发布（CI 全绿后自动发版）

GitHub Release 由 CI 自动发布，不要求手动打 tag。当 `main` 分支的 `push → CI → Deploy` 门禁链路全部成功后，`release.yml` 读取 `package.json` 版本号创建轻量 tag `vX.Y.Z` 并发布（含规则产物资产）；tag 已存在则跳过，仅版本号升级时才发版。开发者只需本地 `npm version patch|minor|major` 并 `git push`。

## 9. 依赖关系

### 9.1 核心依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| next | ^14.2.25 | Next.js 框架（已固定至含安全补丁的版本） |
| react | ^18 | React 核心库 |
| react-dom | ^18 | React DOM 库 |
| sonner | ^2.0.7 | Toast 通知 |
| @radix-ui/react-checkbox | ^1.0.4 | Checkbox 组件 |
| @radix-ui/react-dropdown-menu | ^2.0.6 | 下拉菜单组件 |
| @radix-ui/react-label | ^2.0.2 | Label 组件 |
| @radix-ui/react-select | ^2.0.0 | Select 组件 |
| @radix-ui/react-slot | ^1.0.2 | Slot 组件 |
| lucide-react | ^0.312.0 | 图标库 |
| tailwind-merge | ^2.2.0 | Tailwind 类合并 |
| class-variance-authority | ^0.7.0 | 组件变体管理 |
| clsx | ^2.1.0 | 条件类名 |

### 9.2 开发依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| @types/node | ^24.0.0 | Node.js 类型定义（匹配运行环境 Node 24） |
| @types/react | ^18 | React 类型定义 |
| @types/react-dom | ^18 | React DOM 类型定义 |
| @vitest/coverage-v8 | ^3.2.7 | Vitest v8 覆盖率 provider（门禁数据来源） |
| autoprefixer | ^10.4.19 | CSS 自动前缀 |
| eslint | ^8 | 代码质量检查 |
| eslint-config-next | ^14 | Next.js ESLint 配置 |
| jsdom | ^30.1.2 | hooks 测试用 DOM 环境（逐文件 `@vitest-environment jsdom`） |
| postcss | ^8.4.38 | CSS 处理工具 |
| tailwindcss | ^3.4.3 | 实用优先 CSS 框架 |
| tailwindcss-animate | ^1.0.7 | Tailwind 动画插件 |
| typescript | ^5 | TypeScript 语言 |
| vitest | ^3.2.7 | 单元测试框架（T-P4-01 升级，覆盖率 v8 provider 已修复 Windows 盘符重复统计） |

### 9.3 预设源 URL

| 预设源 | URL |
|--------|-----|
| 内置数据 | https://raw.githubusercontent.com/sutchan/DNS_Shield/main/public/domains.txt |
| AdGuard DNS Filter | https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_15_DnsFilter/filter.txt |
| EasyList | https://easylist-downloads.adblockplus.org/easylist.txt |
| NeoHosts | https://raw.githubusercontent.com/neoHosts/neoHosts/master/data/adblock.txt |

## 10. 浏览器兼容性

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 11. 已知限制

> **【强制】事实清单**：本节描述的是**当前真实状态**（截至 v3.22.4），不是目标能力。任何文档或代码若声称下列项「已生效」，即视为漂移，须以本节为准修正。

- 部分广告域名使用 HTTPS 硬编码，需配合 Pi-hole 或广告屏蔽插件
- 部分设备可能有 hosts 文件大小限制
- 需要定期更新规则以应对新广告形式
- **锁文件与 `.npmrc`（原 BLOCKER，v3.19.0 审计 B-01，2026-11-25 已修复）**：`package-lock.json` 为唯一锁文件（`pnpm-lock.yaml` 已删除，统一 npm）；`.npmrc` 已恢复并启用 `engine-strict=true`（npm 场景不适用 `package-manager-strict`）。CI 以 `npm ci` 安装并在 setup 复合动作中显式断言锁文件存在。历史问题证据见 `docs/AUDIT-REPORT-v3.19.0.md`（冻结快照）；当前状态以本节为准。
- **Service Worker 注册（原未启用，2026-11-25 已修复）**：`src/components/ServiceWorkerRegistrar.tsx` 在生产环境注册 `/service-worker.js`（dev 跳过以免 HMR 命中旧缓存），缓存白名单仍由 SW 自管；§12.2 的策略现为已生效行为。
- **`public/category-index.txt`（原未入库，2026-11-25 已修复）**：已从真实聚合分支恢复该文件，`aggregate.yml` 的 `add-paths` 显式列出、`release.yml` 资产清单与 zip 均包含，CI data job 增非空断言；线上分类筛选不再 404。

## 12. 安全规范

### 12.1 HTTP 安全头部

| 头部 | 值 | 说明 |
|------|-----|------|
| Content-Security-Policy | default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; img-src 'self' data: https: blob: https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://raw.githubusercontent.com https://cdn.jsdelivr.net https://easylist-downloads.adblockplus.org https://www.google-analytics.com; frame-src 'none'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; worker-src 'self' blob:; upgrade-insecure-requests | 内容安全策略，防止 XSS 和数据注入。**【强制·单一来源】** `next.config.js` 是唯一安全头定义处（`vercel.json` 已删除，双源差异不复存在）；`require-trusted-types-for 'script'` 的评估已闭环（T-SEC-01，结论为暂不启用，见 `docs/05-security-assessment-csp.md`），当前生产 CSP **不含**该指令。`next.config.js` 头部注释中「改一处必须同步另一处 / CI 安全头一致性检查」为失效的历史表述。**【约定】** dev（`NODE_ENV !== 'production'`）为 `script-src` 追加 `'unsafe-eval'`、为 `object-src` 放行 `data:`，生产构建均不含；上表 `connect-src` 为生产枚举值，由 `src/config/fetchHosts.ts` 的默认 host + 环境变量预设 host 派生，`edgeone.json` 由 `check-security-headers.mjs` 校验同值（禁止 `'https:'` 通配）。 |
| Strict-Transport-Security | max-age=63072000; includeSubDomains; preload | HSTS，强制 HTTPS |
| Cross-Origin-Opener-Policy | same-origin | 防止跨窗口攻击 |
| Cross-Origin-Resource-Policy | same-origin | 限制跨域资源加载 |
| X-Content-Type-Options | nosniff | 防止 MIME 嗅探 |
| X-Frame-Options | DENY | 防止点击劫持 |
| Referrer-Policy | strict-origin-when-cross-origin | 控制 Referrer 信息泄露 |

### 12.2 Service Worker 安全

> 以下为 `public/service-worker.js` **自身策略**；生产环境已由 `ServiceWorkerRegistrar` 注册（dev 跳过，见 §11），这些策略在生产环境生效。

- 仅缓存同源 GET 请求
- 按文件扩展名白名单过滤（.js/.css/.png/.jpg/.svg/.woff2 等）
- 不缓存跨域资源或 API 请求
- 缓存名称包含版本号，便于版本更新时清理

### 12.3 文件操作安全

- `sanitizeFilename()` 函数过滤危险字符（路径分隔符、控制字符等）
- 限制文件名最大长度（255 字符）
- 防止路径遍历攻击（../、..\\）
- 文件名仅允许字母、数字、点、下划线、连字符

## 13. 版本历史

> 下表仅列关键节点；逐版完整变更以 `CHANGELOG.md` 为准，本节不回填近期版本，避免两处维护同一事实。

| 版本 | 日期 | 变更 |
|------|------|------|
| v3.7.12 | 2026-08-09 | 文档同步与完善：统一全项目版本号至 v3.7.12；修正 openspec/config.yaml 版本、README.en 域名数与预设源、DEPLOYMENT Dockerfile(pnpm)、CONTRIBUTING 开发命令(pnpm)；对齐各文档与实际代码 |
| v3.7.10 | 2026-08-09 | 修复 AdGuard 输出 IPv6 通配符前缀、Service Worker 缓存键改用 env.version、补充 fileUtils 流式读取单测；统一全项目版本号至 v3.7.10 |
| v3.7.0 | 2026-07-21 | 安全与性能加固：fetchFromUrl 增加 10MB 响应体积上限（流式读取防大响应 DoS）、fetchFromUrls 改为并发抓取（Promise.allSettled）；补充 fileUtils 单元测试（体积上限/非法 URL/HTTP 错误/并发容错）；i18n 16 语言键 100% 覆盖验证；统一全项目版本号至 v3.7.0 |
| v3.6.1 | 2026-07-21 | 全项目代码审查与质量对齐：TypeScript 严格类型检查、ESLint、Vitest(31 项) 全部通过；i18n 16 种语言键全覆盖并验证多语言切换；parser.sortDomains 性能优化（Schwartzian 变换）；新增 rulesGenerator 单元测试覆盖核心规则生成；对齐 openspec/prototype 规范；统一全项目版本号至 v3.6.1 |
| v3.6.0 | 2026-07-21 | 增量版本对齐：代码与文档版本号统一至 v3.6.0（未单独记录变更日志） |
| v3.5.0 | 2026-07-17 | 安全加固：Service Worker 缓存策略优化（同源+扩展名白名单）、CSP 增强（frame-ancestors/worker-src）、新增 HSTS/COOP/CORP 安全头部、文件名安全验证（sanitizeFilename）；Badge 组件新增 success/warning 变体、Button 组件新增 loading 状态；设计系统文档同步更新（HSL 色彩空间修正）；README/CHANGELOG/openspec 规范文档全面同步更新；全项目版本号统一至 v3.5.0 |
| v3.4.0 | 2026-07-03 | 项目目录整理：移除冗余文件，shadcn/ 归入 prototype/ 统一管理；完善 GitHub Issue 模板配置；根目录新增 CHANGELOG.md |
| v3.3.0 | 2026-07-03 | 完成 4 个超过 200 行文件的模块拆分；新增 SettingsPanel/UrlSection/useSettings/useLoading 模块；移除所有 i18n 翻译中的 emoji 图标；版本统一 v3.4.0 |
| v3.2.0 | 2026-07-03 | 新增 domainValidator.ts/InputEditor.tsx 模块拆分；清理废弃 i18n 键；版本统一 v3.2.0 |
| v3.1.0 | 2026-06-30 | 添加 Accordion 组件，完善按钮点击缩放和面板悬停浮起动效 |
| v3.0.0 | 2026-06-30 | 设计系统全面重构：oklch 色彩空间、Swiss Precision 排版、Apple 风格动效曲线 |
| v2.3.2 | 2024-06-19 | 添加缺失国际化翻译键，创建 openspec 规范文档 |
| v2.3.0 | 2024-06-19 | 合并 trae/solo-agent 分支，添加 shadcn/ui，安全加固 |
