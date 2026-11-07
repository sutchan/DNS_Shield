# DNS Shield 项目规范

> 最后审查：2026-11-06（与 package.json v3.15.5 对齐；全量文档核查：修 §1 表格列数与域名口径、补全 §2 结构树 docs/scripts/public/components/config/types/workers、§5.3 任务记录规范按 tasks.md / tasks-done.md 分工重写、§9.2 补齐开发依赖；端口统一 3000）

## 1. 项目概述

| 属性 | 值 |
|------|-----|
| 项目名称 | DNS Shield |
| 项目类型 | DNS 广告过滤规则库 + Web 管理工具 |
| 核心功能 | 基于 dnsmasq/hosts 的路由器全局广告防护 |
| 目标用户 | 使用梅林/OpenWrt/小米/华硕/TP-Link 等路由器的用户 |
| 项目地址（主页/治理） | https://github.com/ArcesTeam/DNS_Shield |
| 运行时数据源（历史 fork 托管） | https://github.com/sutchan/DNS_Shield（raw 预设源，见 §9.3，勿改） |
| 演示地址 | https://dns.ewuse.com/ |
| 当前版本 | v3.15.5 |
| 拦截域名 | 规则 877 条（黑名单 645 + 白名单 232；`public/domains.txt` 非空 897 行，含注释 20 行、改道 0 行，以 `node scripts/count-domains.mjs` 实算为准） |
| 技术栈 | Next.js 14 + React 18 + TypeScript 5 + Tailwind CSS 3.4 |
| UI 框架 | shadcn/ui + Radix UI + Lucide Icons |
| 通知组件 | sonner |
| 国际化 | 16 种语言 |

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
├── docs/                            # 项目规范文档
│   ├── SPEC.md                     # 项目规范（本文件）
│   ├── tasks.md                    # 未完成任务清单（唯一来源）+ 实时指标
│   ├── tasks-done.md               # 已完成任务归档（含第七章开发进度全景）
│   ├── CHECKLIST.md                # 质量检查清单
│   ├── STRUCTURE-REVIEW.md         # 结构审查快照（v3.12.0 起冻结，不再回填）
│   └── config.yaml                 # 规范配置
├── scripts/                        # 构建/校验脚本
│   ├── check-locales.mjs           # 国际化键覆盖校验（pnpm check:locales）
│   ├── sync-facts.mjs              # 版本号写入 13 处文档展示位（--check 为 CI 门禁）
│   ├── gen-format-files.mjs        # 生成 12 种规则产物（pnpm build:formats）
│   ├── count-domains.mjs           # 域名计数实算（pnpm count:domains）
│   ├── aggregate-upstream.mjs      # 上游规则聚合（aggregate.yml 调用）
│   ├── gen-icons.mjs               # PWA 图标生成
│   ├── locale-baseline.json        # i18n 独立基线清单（防「集体缺键」）
│   └── lib/                        # 共享脚本模块
│       ├── domainSource.mjs        # 域名源读取
│       ├── formatHeaders.mjs       # 各格式头部（与运行时对齐）
│       └── formatRules.mjs         # 规则文本生成
├── public/                         # 静态资源
│   ├── assets/icons/               # PWA 图标（72x72 ~ 512x512）
│   ├── domains.txt                 # 域名单一来源（含 + 白名单 / @ 改道 / # 注释）
│   ├── manifest.json               # Web 应用清单
│   ├── service-worker.js           # Service Worker
│   ├── brand-banner.svg / logo.svg / logo-mono.svg / favicon.svg # 品牌资源
│   ├── brand-colors.md             # 品牌色板（冻结快照）
│   ├── adguard.txt / dnsmasq.conf / hosts.txt / unbound.conf / pihole.txt
│   ├── whitelist.txt / rpz.db / smartdns.conf
│   └── mosdns_domain_set.txt / clash_dns.yaml / coredns_hosts.txt  # 12 种规则产物
├── src/                            # Next.js 源代码
│   ├── app/                        # App Router 目录
│   │   ├── page.tsx                # 主页面入口
│   │   ├── Home.tsx                # 主组件（组合各业务组件与 hook）
│   │   ├── globals.css             # 全局样式入口（Tailwind 指令 + 基础层 design tokens）
│   │   ├── layout.tsx              # 根布局（Metadata + SEO + 安全头部接入，按序导入 src/styles/*.css）
│   │   ├── (seo)/                  # <head> 注入类关注点（元数据、GA 脚本）
│   │   │   ├── site-meta.ts        # 站点元数据与 JSON-LD 常量
│   │   │   └── ga-scripts.tsx      # GA4 脚本注入（衡量 ID 取自环境变量，缺失/非法则不注入）
│   │   ├── robots.ts               # 自动生成 robots.txt（含 sitemap 索引）
│   │   └── sitemap.ts              # 自动生成 sitemap.xml
│   ├── components/                 # 业务组件
│   │   ├── ui/                     # shadcn/ui 基础组件（12 个）
│   │   ├── Header.tsx              # 页头（Shield 图标 + 语言/主题切换）
│   │   ├── Footer.tsx              # 页脚（链接 + 使用说明）
│   │   ├── InputEditor.tsx         # 域名编辑器子组件
│   │   ├── InputPanel.tsx          # 输入面板（域名编辑 + URL 导入）
│   │   ├── InputPanel.types.ts     # 输入面板 props 接口与统计常量（v3.13.6 拆分）
│   │   ├── OutputPanel.tsx        # 输出面板（规则预览 + 设置）
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
│   │   └── FlowViz.tsx            # 流程动效
│   ├── config/
│   │   ├── defaults.json           # 默认设置单一来源（v3.12.0 收敛）
│   │   ├── index.ts                # 应用配置（预设源 URL、多镜像）
│   │   └── version.ts              # 版本号单一来源（APP_VERSION，派生自 package.json）
│   ├── workers/
│   │   └── ruleProcessor.worker.ts # 大文本解析 Worker（分片 + 进度上报）
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
│   │   ├── useRuleWorker.ts        # Web Worker 封装与阈值
│   │   ├── useAutosave.ts          # 草稿自动保存编排
│   │   ├── autosaveStorage.ts      # localStorage 草稿读写
│   │   ├── useCategoryFilter.ts    # 分类筛选 UI 状态
│   │   ├── useCategoryIndex.ts     # 上游分类索引加载
│   │   ├── useModalA11y.ts         # 弹窗无障碍焦点管理
│   │   ├── useModalEscape.ts       # 弹窗栈 Escape 管理（仅栈顶响应，T-P1-16）
│   │   └── useVirtualList.ts      # 虚拟滚动（超大规模预览）
│   ├── lib/
│   │   └── utils.ts                # 工具函数（cn 等）
│   ├── locales/                    # 国际化翻译文件（16 种语言）
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
│   │   └── hero.css                # Hero/FlowViz / 预览统计 / 动效降级
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
│       ├── parser.ts               # 域名解析器（行级解析、提取域名）
│       ├── sortDedupe.ts           # 域名排序与去重（纯函数）
│       ├── rulesGenerator.ts       # 规则生成核心（12 格式编排 + prepareRuleData 统一口径）
│       ├── formatGenerators.ts     # 全量格式拼接（blocked/customDns/whitelist/regex/header）
│       ├── formatGenerators.single.ts # 惰性单格式生成（T-P1-06，与全量逐字节一致）
│       ├── headerConfigs.ts         # 各格式头部注释配置（HEADER_CONFIGS）
│       ├── fileUtils.ts            # 文件操作（下载、复制、URL 获取、sanitizeFilename）
│       ├── i18n.ts                 # 国际化配置
│       ├── uiUtils.ts              # UI 工具（行号生成、滚动同步）
│       ├── parseLine.ts            # 单行多格式识别（hosts/dnsmasq/adguard/regex）
│       ├── domainCategory.ts       # 上游分类索引解析与筛选（T-P2-01/05）
│       ├── regexRules.ts           # AdGuard/Pi-hole 正则双向转换（T-P2-04/06）
│       ├── scriptGenerator.ts       # 路由器一键同步 Shell 脚本生成（shellQuote 防注入 T-P3-04）
│       ├── ruleMatcher.ts          # 域名匹配测试器引擎
│       ├── idb.ts                  # IndexedDB 持久化（T-P1-03）
│       ├── httpCache.ts / cachedFetch.ts # ETag 条件请求 + 离线缓存
│       ├── buildFlowPool.ts        # FlowViz 动画令牌池
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
├── .eslintrc.json                  # ESLint 配置
├── .gitignore                      # Git 忽略配置
├── components.json                 # shadcn/ui 配置
├── next.config.js                  # Next.js 配置（安全头部）
├── next-env.d.ts                   # Next.js 环境类型定义
├── package.json                    # 项目配置和依赖
├── postcss.config.js               # PostCSS 配置
├── tailwind.config.js              # Tailwind CSS 配置
├── tsconfig.json                   # TypeScript 配置
├── vitest.config.ts                # Vitest 单元测试配置
└── pnpm-lock.yaml                  # pnpm 锁定文件
```

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
| 版本号 | 3.15.5 |
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
| 设置联动 | 设置项（IP、项目名、去通配/去重开关）与界面语言变更后必须重新生成预览与导出内容，避免预览停留在旧口径 |

## 5. 维护流程

### 5.1 新增规则

1. 编辑 `public/domains.txt`，添加新域名
2. 启动开发服务器：`pnpm dev`
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
   - `docs/tasks.md` — **未完成任务**清单（当前 0 项）+ 实时指标 + 日常/定期/版本发布维护清单
   - `docs/tasks-done.md` — **已完成任务**归档（结构化任务、专项整改、验收标准、诊断证据、开发进度全景）
   - `docs/CHECKLIST.md` — 发布/验收前的**质量核验清单**（非任务跟踪，不含排期与优先级）
   - `docs/SPEC.md` — 规范定义（不含任务状态）
   - `CHANGELOG.md` — 已发布版本的历史变更记录（不可篡改）
4. **更新时机**：新增任务、完成任务、任务状态或优先级变更、发现新缺陷时，**必须**同步更新 `docs/tasks.md`，并在其「最后审查」时间戳中记录更新时间；任务完成后将条目移入 `docs/tasks-done.md`，使 `tasks.md` 仅保留未完成项。
5. **数据准确性**：`docs/tasks.md` 中的数据型数字（i18n 键数、测试用例数、覆盖率、文件行数、格式数量等）**必须用脚本实算**后填写，禁止凭记忆书写；修改前先实查 `package.json` 等权威源。无法实跑时沿用最近一次实测值并注明，不得凭静态计数臆改。
6. **删除冗余**：若发现其他文档存在任务清单内容，须按「未完成 → `docs/tasks.md`、已完成 → `docs/tasks-done.md`」迁移，并删除冗余文档。
7. **CHECKLIST 例外**：`docs/CHECKLIST.md` 是**发布验收清单**（每次发版逐项核验），允许使用 `- [ ]` 复选框，不受第 2 条「禁止 `- [ ]`」约束；但严禁在其中记录任务状态或新增任务条目。

## 6. 路由器兼容列表

| 路由器/固件 | 支持格式 | 说明 |
|-------------|----------|------|
| Merlin (华硕) | Dnsmasq | 软件中心 → DNS 设置 |
| OpenWrt | Dnsmasq | 服务 → DHCP 和 DNS |
| 小米路由器 | Hosts | 广告拦截设置 |
| 华硕路由器 | Hosts | 自定义 hosts |
| TP-Link | Hosts | 自定义 hosts |

## 7. Git 提交规范

```
feat:     添加 xx 域名过滤
fix:      修复 xx 规则
docs:     更新文档
chore:    更新 Web 管理工具
refactor: 优化规则生成逻辑
```

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
- **发版无需手动同步**：页脚内容由 `env.version` + 运行时 `NEXT_PUBLIC_BUILD_ID` 驱动，[tasks.md 第五章]发布清单无需单独登记页脚项；改动 `next.config.js` 的 `buildTimeId()` 或 `Footer.tsx` 展示格式时，须保持两者一致并同步本规范。

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
| @radix-ui/react-switch | ^1.0.3 | Switch 组件 |
| @radix-ui/react-tabs | ^1.0.4 | Tabs 组件 |
| @radix-ui/react-toast | ^1.1.5 | Toast 组件 |
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

- 部分广告域名使用 HTTPS 硬编码，需配合 Pi-hole 或广告屏蔽插件
- 部分设备可能有 hosts 文件大小限制
- 需要定期更新规则以应对新广告形式

## 12. 安全规范

### 12.1 HTTP 安全头部

| 头部 | 值 | 说明 |
|------|-----|------|
| Content-Security-Policy | default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; img-src 'self' data: https: blob: https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https:; frame-src 'none'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; worker-src 'self' blob:; upgrade-insecure-requests | 内容安全策略，防止 XSS 和数据注入（与 `next.config.js` 实际配置一致；`require-trusted-types-for` 暂未启用） |
| Strict-Transport-Security | max-age=63072000; includeSubDomains; preload | HSTS，强制 HTTPS |
| Cross-Origin-Opener-Policy | same-origin | 防止跨窗口攻击 |
| Cross-Origin-Resource-Policy | same-origin | 限制跨域资源加载 |
| X-Content-Type-Options | nosniff | 防止 MIME 嗅探 |
| X-Frame-Options | DENY | 防止点击劫持 |
| Referrer-Policy | strict-origin-when-cross-origin | 控制 Referrer 信息泄露 |

### 12.2 Service Worker 安全

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
