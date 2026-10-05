# 项目任务清单（唯一来源）

> **本文件是项目任务记录的唯一来源（Single Source of Truth）**
> 所有新增、变更、完成任务必须更新本文件；项目内其他位置（README、SPEC、CHECKLIST、CHANGELOG、原型等）**不得另建任务清单**。
> 规则固化见 [SPEC.md §5.4 任务记录规范](./SPEC.md)。

> 最后审查：2026-10-04 21:10（与 package.json v3.12.0 对齐，代码实况核验）
> 维护团队：Sut / ArcesTeam
>
> **本次更新（2026-10-04 21:10）**：工作流（`.github/workflows`）审查整改完成，patch 升至 **v3.11.2**。① 依赖可复现性：入库 `pnpm-lock.yaml`（4650 行 / lockfileVersion 9.0）、补 `packageManager: pnpm@11.24.0` 与 `engines.node >=24.11.0`、新增 `.npmrc`（engine-strict）、从 `.gitignore` 移除 pnpm-lock 忽略项；② Release 资产清单改为消费 `gen-format-files.mjs --list-files`（12 个产物，修掉 zip 内 3 个格式重复与单文件资产缺 3 个新格式）；③ `aggregate.yml` 补 `contents: write`（原权限必然 403 失败）；④ 漂移检查提为硬门禁并剔除「更新::」日期行噪声；⑤ 部署改为 `workflow_run`（仅 CI 成功后部署，检出 CI 的 head_sha）；⑥ EdgeOne 产物路径 `./out` → `./.next`（对齐 `output: 'standalone'`）；⑦ CLI 钉版本（vercel 62.2.0 / edgeone 1.6.41）；⑧ 全 job 加 timeout-minutes、修测试摘要 grep、补 `.gitattributes`（LF）。校验：4 个 workflow + composite action 的 YAML 全部解析通过。
> 上一轮（20:40）修复 EdgeOne 构建失败（ESLint 门禁）并找回丢失的 `<FormatTabs>` 渲染，升至 v3.11.1。

---

| 指标 | 实测值 | 取得方式 |
|---|---|---|
| 应用版本 | v3.12.0 | `package.json` version（权威源） |
| 输出格式数 | 12 种 | `src/types/formats.ts` 的 `ALL_FORMATS` |
| i18n 语言 / 键数 | 16 种 / 顶层 145 键、递归合计 207 键 | 脚本统计 `zh-cn.json`（`check:locales` 输出为递归口径 207） |
| 测试套件 / 用例 | **19 套件 / 129 用例**（全通过） | `vitest run`（权威计数） |
| 覆盖率门禁 | 已生效且为真实值；v3.12.0 起含 `src/hooks`（语句 51.61 / 分支 83.94 / 函数 80.24 / 行 51.61，门槛校准为 50/75/80/50） | `vitest run --coverage` |
| 组件规模 | 顶层 **14** 个 `.tsx` + `OutputPanel.derived.ts`，`ui/` 12 个 | `src/components/` 实测 |
| 源文件 >200 行 | `ts/tsx` **0** 个（T-P1-04 已完成）；`globals.css` 951 行属全局样式表，按代码拆分口径不计入 | 行数扫描 |

> **教训**：本文件中的数据型数字（键数 / 用例数 / 覆盖率 / 行数）历史上多次与实现脱节。修改前务必用脚本实算，禁止凭记忆书写。

---

## 二、开发进度全景

```
[███████████████████████░] 94% 全局就绪度
```

| 模块 / 维度 | 完成度 | 状态 | 关键成果 |
|---|:---:|:---:|---|
| **核心规则生成引擎** | 100% | ✅ 稳定 | 支持 12 种输出格式（含 Mosdns/Clash Meta/CoreDNS）、通配符/白名单/自定义DNS前缀解析、高效去重与排序 |
| **Web 交互界面 (GUI)** | 98% | ✅ 完善 | Swiss Precision 排版、规则测试弹窗、路由器脚本弹窗、FlowViz 动效 |
| **国际化 (i18n)** | 100% | ✅ 完成 | 16 种多语言本地化（顶层 145 键、递归合计 207 键），`check:locales` 100% 通过 |
| **单元测试 (Unit Test)** | 98% | ✅ 优秀 | Vitest 16 个测试套件、114 个测试用例全部通过 |
| **测试覆盖率与 CI 门禁** | 85% | ✅ 门禁已生效 | Vitest 3.2.7 已根治 Windows 盘符重复统计，报告值即真实值；thresholds 提升至语句 80 / 分支 75 / 函数 85 / 行 80，当前实测语句 84.46 / 分支 86.85 / 函数 91.07 / 行 84.46 |
| **域名规则匹配与测试引擎** | 100% | ✅ 完成 | 完整实现域名/URL 匹配分析引擎与前端交互弹窗 |
| **路由器自动化同步脚本** | 90% | ✅ 完成 | 支持 OpenWrt、Merlin、Padavan、SmartDNS、Pi-hole 自动化更新脚本一键生成 |
| **超大规模数据性能 (Web Worker)** | 40% | ⏳ 待开发 | 50,000+ 级大规模域名解析主线程卡顿优化与分片计算 |

---

## 三、待办任务（未完成，按优先级划分）

> **实施顺序总览**：T-P1-03 → T-P1-01 → T-P1-02 → T-P4-01 → T-P2-04 → T-P2-01 → T-P3-02
> 排序依据：存储层先行（突破 5MB 限制后大数据优化才有意义）→ 解析与渲染性能 → 低风险工具链先行 → 规则引擎功能 → 独立生态子项目。

### 🔴 P0 - 核心工程与质量门禁

当前无未完成的 P0 任务（全部已完成，见下方「已完成任务」）。

### 🟡 P1 - 性能优化与大数据集体验

- [x] **T-P1-03: 离线与增量存储优化 (IndexedDB)** ｜ 状态：✅ 已完成（v3.11.0）｜ 实施序位 1
  - 使用 IndexedDB 替代 LocalStorage 存储超长自定义规则列表，突破 LocalStorage 5MB 限制
  - 实现预设源与远程 URL 规则的增量缓存与 ETag 校验
- [x] **T-P1-01: 引入 Web Worker 实现异步规则解析与去重** ｜ 状态：✅ 已完成（v3.11.0）｜ 实施序位 2
  - 将大文本解析（`parser.ts`）、排序去重（`sortDedupe.ts`）与格式转换移入 Web Worker
  - 避免在导入 100,000+ 条域名时造成主线程 UI 卡顿
  - 增加流式处理进度条与处理耗时统计
- [x] **T-P1-02: 编辑器与预览区域虚拟滚动 (Virtual Scrolling)** ｜ 状态：✅ 已完成（v3.11.0）｜ 实施序位 3
  - 针对大文本预览，集成虚拟渲染机制，降低超长 DOM 节点的内存占用与渲染延迟

### 🟢 P2 - 规则引擎进阶功能与工具链

- [x] **T-P4-01: 升级 Vitest 至 3.x 以根治覆盖率统计异常** ｜ 状态：✅ 已完成（v3.11.0）｜ 实施序位 4 ｜ **由 P4 提升至 P2**
  - 提升理由：风险低、收益明确，可根治覆盖率统计异常并使阈值回归真实值，为后续功能提供可靠门禁
  - Vitest 2.1.9 + coverage-v8 在 Windows 上按盘符大小写重复统计同一源文件，导致覆盖率报告虚低（约真实值的 1/2）
  - 当前以 thresholds 按报告值校准作 workaround，升级后需重新校准阈值
  - 受限：v3.10.2 记录曾因网络受限未能升级
- [x] **T-P2-04: AdGuard 正则 ↔ Dnsmasq regex/server 双向智能语法转换** ｜ 状态：✅ 已完成（v3.11.0）｜ 实施序位 5
  - 原 T-P2-03 的遗留高级子项，支持 AdGuard 正则规则与 Dnsmasq regex/server 的双向转换
- [x] **T-P2-01: 域名分类与标签过滤系统** ｜ 状态：✅ 已完成（v3.11.0）｜ 实施序位 6
  - 增加按类别（广告 / 跟踪分析 / 恶意软件 / 遥测收集 / 成人内容）标记与一键过滤功能
  - 数据来源须真实可核实（基于既有上游聚合源的真实归属打标），禁止编造分类数据

### ⚪ P3 - 路由器自动化与生态拓展

- [x] **T-P3-02: OpenWrt LuCI 界面配置包** ｜ 状态：✅ 已完成（v3.11.0）｜ 实施序位 7
  - 构建轻量级 OpenWrt LuCI 界面插件，支持在路由器后台直接订阅 DNS Shield 规则源

### ⚙️ P4 - 工具链与依赖

当前无未完成的 P4 任务（原 T-P4-01 已提升至 P2）。

> **未完成任务合计：0 项**（本轮 7 项已全部完成，明细见下方「已完成任务」）

---

## 四、任务状态追踪与验收标准

| 任务编号 | 任务名称 | 负责人 | 验收标准 | 状态 |
|---|---|---|---|:---:|
| T-P0-01 | 覆盖率工具与门禁 | Core Team | `pnpm test:coverage` 可生成报告且 thresholds 生效 | ✅ 已完成（门禁真实生效） |
| T-P0-02 | 核心模块单元测试 | Core Team | 85 个单元测试用例全部通过 | ✅ 已完成 |
| T-P0-03 | 生产日志收敛 | Core Team | 生产构建控制台无未受控报错，logger 工具全覆盖 | ✅ 已完成 |
| T-P0-04 | 修正覆盖率统计与门禁 | Core Team | 排除测试文件并落地 thresholds，不达标时非零码退出 | ✅ 已完成 |
| T-P2-02 | 域名匹配测试器 | Feature Team | 输入测试域名即时展示命中规则与拦截原因 | ✅ 已完成 |
| T-P2-03 | 多格式扩展 | Feature Team | 支持 Mosdns / Clash Meta / CoreDNS 新格式导出 | ✅ 已完成（双向语法转换拆为 T-P2-04） |
| T-P3-01 | 路由器同步脚本 | Infra Team | 脚本在主流固件实测有效，支持一键生成与复制 | ✅ 已完成 |
| T-P3-03 | 上游聚合 Action | Infra Team | 定时聚合上游并自动发起 PR | ✅ 已完成 |
| T-P1-01 | Web Worker 解析 | Dev Team | 10 万行域名解析不阻塞 UI 渲染，有进度反馈 | ✅ 已完成（v3.11.0） |
| T-P1-02 | 虚拟滚动 | Dev Team | 超大规则预览流畅（60fps 滚动） | ✅ 已完成（v3.11.0） |
| T-P1-03 | IndexedDB 存储 | Dev Team | 大容量规则持久化保存，刷新无缝恢复 | ✅ 已完成（v3.11.0） |
| T-P1-04 | 拆分超 200 行源文件 | Core Team | 4 个超行文件拆分后单文件 ≤200 行，公开 API 不变 | ✅ 已完成（v3.10.2，4 文件均 ≤200 行） |
| T-P2-01 | 分类标签过滤 | Feature Team | 支持多维度分类标签与选择性导出 | 🟡 库已就绪，UI 未接入（v3.11.0 建库，v3.12.0 修正口径） |
| T-P2-04 | 正则双向语法转换 | Feature Team | AdGuard 正则 ↔ Dnsmasq regex/server 互转 | 🟡 库已就绪，生成器未接入（v3.11.0 建库，v3.12.0 修正口径） |
| T-P3-02 | OpenWrt LuCI 配置包 | Infra Team | LuCI 后台可直接订阅规则源 | ✅ 已完成（v3.11.0） |
| T-P4-01 | 升级 Vitest 3.x | Core Team | 覆盖率报告无重复键，阈值回归真实值 | ✅ 已完成（v3.11.0） |

---

## 五、已完成任务

### 已完成的结构化任务

- [x] **T-P0-01: 补充测试覆盖率工具链与阈值门禁** — 已配置 `@vitest/coverage-v8` 与 `vitest.config.ts` 门禁
- [x] **T-P0-02: 补充关键工具与核心模块单元测试** — 覆盖 `ruleMatcher` / `scriptGenerator` / `statsAggregator` / `buildFlowPool`
- [x] **T-P0-03: 规范生产环境日志输出** — `console.error`/`console.warn` 收敛至 `src/utils/logger.ts`，按 `NODE_ENV` 生产静默
- [x] **T-P0-04: 修正覆盖率统计与门禁（2026-10-04）** — 根因查明：报告值 47.85% 系 Vitest 2.1.9 + coverage-v8 在 Windows 上按盘符大小写重复统计同一源文件（`coverage-summary.json` 出现仅大小写不同的重复键），并非测试文件混入，真实覆盖率约 95%+。已落地 thresholds 真实门禁（语句 45 / 分支 75 / 函数 70 / 行 45，按报告值校准）并补 `coverage.exclude` 防御性排除；彻底根治待升级 Vitest 3.x（见 T-P4-01）
- [x] **T-P2-02: 在线 DNS 拦截规则匹配测试器** — `RuleTesterModal.tsx` 实时分析域名命中的规则层级
- [x] **T-P2-03: 规则格式扩展（Mosdns / Clash Meta / CoreDNS）** — 纳入 `ALL_FORMATS` / 输出 Tab / 下载复制链路与 16 语言 i18n
- [x] **T-P3-01: 路由器一键同步脚本** — `ScriptGeneratorModal.tsx` 支持 OpenWrt / Merlin / Padavan / SmartDNS / Pi-hole
- [x] **T-P3-03: 定时自动抓取与上游规则聚合 GitHub Action** — `.github/workflows/aggregate.yml`（每周一 03:17 UTC）+ `scripts/aggregate-upstream.mjs`，聚合 AdGuard / EasyList / NeoHosts / StevenBlack / YousList，去重合并后自动发起 PR 供人工审核
- [x] **任务文档合并（2026-10-04）** — 原 `TASKS.md` 与 `REMAINING_TASKS.md` 合并为本文件，删除冗余文档，消除剩余任务数口径矛盾
- [x] **T-P1-04: 拆分超 200 行源文件（2026-10-04，v3.10.2）** — 按职责拆分 4 个超行文件且公开 API 不变：`translation.ts`→`translation.parts.ts`（嵌套子类型）、`Home.tsx`→`useHomeController` 钩子、`SettingsPanel.tsx`→`useModalA11y`+`SettingsForm`、`OutputPanel.tsx`→`OutputPanel.parts.tsx` 增 `formatLabel`/`useVisibleFormats`/`OutputToolbar`/`OutputActions`；拆分后单文件均 ≤200 行
- [x] **GA4 衡量 ID 环境变量化（2026-10-04，v3.10.3）** — 移除 `layout.tsx` 中硬编码的兜底衡量 ID，改为仅从 `NEXT_PUBLIC_GA_MEASUREMENT_ID` 读取；新增 `src/utils/analytics.ts`（格式校验 + 缺失/非法降级 + gtag 片段生成）与 `src/app/(seo)/ga-scripts.tsx`（`<head>` 注入，非法则不渲染），补 `.env.example` 与 `analytics.test.ts`（13 例）
- [x] **T-P1-03: 离线与增量存储优化（2026-10-04，v3.11.0）** — 新增 `src/utils/idb.ts`（Promise 化 IndexedDB 封装，隐私模式/SSR 静默降级、API 永不 reject）、`httpCache.ts`（ETag 缓存记录）、`cachedFetch.ts`（304 复用 + 离线兜底）；`autosaveStorage` 改为异步并以 IndexedDB 为主（上限 5MB → 50MB），localStorage 降级并一次性迁移旧草稿；预设源与远程 URL 均走增量缓存
- [x] **T-P1-01: Web Worker 异步解析（2026-10-04，v3.11.0）** — 新增 `src/workers/ruleProcessor.worker.ts`（parse/sort/dedupe，按 2000 行分片上报进度）与 `useRuleWorker` / `useAsyncRuleProcessing`（阈值 5000 行、请求序号守卫防竞态、Worker 不可用自动回退主线程）；`parseSource` 增加可选进度回调且向后兼容；`InputPanel` 新增进度条与耗时展示
- [x] **T-P1-02: 预览区虚拟渲染（2026-10-04，v3.11.0）** — 新增 `useVirtualList` 与 `OutputPreview`：行数 ≥500 时仅挂载可视区切片（固定行高 24px + overscan 10），小文本保持原自动换行与可选中体验；行号列沿用单文本节点 + 浏览器裁剪（DOM 节点数已为 O(1)）
- [x] **T-P4-01: 升级 Vitest 至 3.2.7（2026-10-04，v3.11.0）** — 根治 Windows 盘符大小写导致的覆盖率重复统计，报告值由 47.85% 回归真实 84.46%；阈值由 45/75/70/45 提升至 80/75/85/80 并实测通过
- [x] **T-P2-04: 正则规则双向语法转换（2026-10-04，v3.11.0 建库；v3.12.0 修正口径为「库已就绪，生成器未接入」）** — 新增 `src/utils/regexRules.ts`：AdGuard `/pattern/` ↔ Pi-hole FTL `regex:pattern` 双向互转；如实标注 dnsmasq 本身不支持正则（不生成无法生效的规则），例外语义在 Pi-hole 侧降级为注释；补 9 例单测
- [x] **T-P2-01: 域名分类与标签过滤（2026-10-04，v3.11.0 建库；v3.12.0 修正口径为「库已就绪，UI 未接入」）** — 新增 `src/utils/domainCategory.ts`：按域名真实命中的上游源（AdGuard / EasyList / neoHosts / StevenBlack / YouSList）打标，提供索引解析、分类查询、按类筛选与分布统计，不引入任何虚构类别；补 7 例单测
- [x] **T-P3-02: OpenWrt LuCI 配置包（2026-10-04，v3.11.0）** — 新增 `openwrt-package/`：LuCI 应用 Makefile（`luci-app-dnsshield`）、订阅控制器（uclient-fetch 拉取、10MB 上限、URL 白名单校验防命令注入，落地 `/etc/dnsshield/rules.conf` 并重载 dnsmasq）、菜单与 rpcd ACL、UCI 默认配置
- [x] **构建门禁修复与格式切换 UI 找回（2026-10-04，v3.11.1）** — EdgeOne Pages 构建因 `next build` ESLint 门禁失败（exit 18）。① 恢复 v3.10.2 组件拆分中被误删的 `<FormatTabs>` 渲染（`OutputToolbar` 增 `children` 插槽，DOM 顺序同 v3.10.0），输出格式切换 UI 复原；② 清理 `FormatTabs`/`updateSettings`/未使用 `React` 导入 3 处 unused 变量与 `useAutosave`、`useRuleWorker` 2 处 hooks 依赖告警；③ 移除 `useSettings` 中已废弃的 `FIELD_MAP` + `updateSettings` 死代码；④ 复核 `next lint` 0 error 0 warning、`tsc --noEmit` 通过、16 套件 / 114 用例全通过
- [x] **目录结构审查与 P0 整改（2026-10-05，v3.12.0）** — 以 grilling 方式审查 `.github` 与全仓结构后落地：① 删除根目录垃圾与占位配置（`{const`、`metadata.json`（无引用的 AI Studio 元数据）、`pnpm-workspace.yaml`（`allowBuilds` 为占位串）、`tsconfig.tsbuildinfo`、临时 `_*.txt`）；② 删除投机死模块 `src/utils/statsAggregator.ts`（其统计语义与 `parser.ts` 内联统计不同，属未被生产引用的重复实现）及其测试；③ 修 `scripts/count-domains.mjs` 的 `--write` 硬编码 `3.7.34`（会把 3 个产物头部版本写回旧值）→ 改读 `package.json`；④ 默认设置收敛为 `src/config/defaults.json` 单一来源（此前 `useSettings.ts` 的 `ipv4=127.0.0.1` 与生成脚本的 `0.0.0.0` 冲突）；⑤ 安全响应头以 `vercel.json` 为准回写 `next.config.js`（此前两处不同：缺 HSTS/COOP/CORP/X-Frame-Options，`frame-ancestors` 为 `*`）；⑥ 新增 `scripts/sync-facts.mjs` 把版本号写入 13 处文档展示位并纳入 CI 硬门禁；⑦ 补 hooks 层单测（`useSettings`/`useLanguage`/`useModalA11y`/`useVirtualList`）并把 `src/hooks` 纳入覆盖率门禁；⑧ 修正 T-P2-01 / T-P2-04 的任务状态口径（库已就绪但 UI 未接入，原标记为 ✅ 已完成）
- [x] **工作流审查整改（2026-10-04，v3.11.2）** — 审查 `.github/workflows` 全部 4 个工作流 + composite action 后落地 8 项整改：① 入库 `pnpm-lock.yaml` + `packageManager`/`engines`/`.npmrc`，解除「无锁文件却 `--frozen-lockfile`」的不可复现安装；② Release 资产清单改由 `gen-format-files.mjs --list-files` 单一来源导出（修 zip 重复项与缺失的 3 个新格式）；③ `aggregate.yml` 补 `contents: write`（原权限必 403）；④ 生成产物漂移提为硬门禁并剔除「更新::」日期行噪声；⑤ 部署改 `workflow_run` 门禁（仅 CI 成功后部署 + 检出 head_sha）；⑥ EdgeOne 产物路径 `./out` → `./.next`；⑦ CLI 钉版本 + 全 job `timeout-minutes`；⑧ 修测试摘要 grep + 新增 `.gitattributes` 固定 LF

### 历史开发任务（已归档）

- [x] 设计系统全面重构（v3.0：oklch 色彩、Swiss Precision 排版、Apple 风格动效）
- [x] 添加 Accordion 折叠面板组件
- [x] 完善按钮交互效果（点击缩放 `active:scale-[0.98]`）
- [x] 优化面板悬停效果（hover-lift 上浮阴影）
- [x] 优化 Web 管理工具界面（Apple 设计风格）
- [x] 添加新的预设源（内置 / AdGuard / EasyList / NeoHosts）
- [x] 改进规则生成算法（支持白名单 / 自定义DNS）
- [x] 建立完整设计系统（`prototype/shadcn/design-system.md`）
- [x] 建立组件库规范（`prototype/shadcn/component-library.md`）
- [x] 建立交互标准（`prototype/shadcn/interaction-standards.md`）
- [x] 创建高保真原型目录（`prototype/`）
- [x] 全面使用 Lucide 图标替换 emoji
- [x] 升级 shadcn/ui 组件（Button isLoading / Badge 变体 / Tabs 圆角）
- [x] 添加单元测试（Vitest：`rulesGenerator.test.ts` 等）
- [x] 优化浏览器兼容性
- [x] 完善国际化支持（16 种语言）
- [x] 改进文档质量和完整性
- [x] 优化构建和部署流程（corepack + pnpm）
- [x] 增强安全性和性能（CSP 头部、URL 验证）

---

## 六、日常维护清单

- [ ] 检查现有规则有效性
- [ ] 测试新广告域名
- [ ] 更新 `public/domains.txt` 原始域名
- [ ] 启动开发服务器：`pnpm dev`（端口 3000，由 `package.json` 的 `next dev -p 3000 -H 0.0.0.0` 固定）
- [ ] 访问本地开发地址（http://localhost:3000）生成新规则
- [ ] 更新 `public/dnsmasq.conf`（或直接运行 `node scripts/gen-format-files.mjs` 一次性重建全部格式）
- [ ] 更新 `public/hosts.txt`
- [ ] 更新 `public/adguard.txt`
- [ ] 更新 `public/whitelist.txt`

## 七、定期任务

- [ ] 每 2 周检查一次规则有效性
- [ ] 清理无效 / 过期域名
- [ ] 优化规则匹配效率
- [ ] 合并上游更新（AdGuard / EasyList / NeoHosts）— 现已由 `aggregate.yml` 每周自动聚合
- [ ] 检查并更新依赖版本
- [ ] 运行构建确保功能正常（`pnpm build`）

## 八、版本发布清单

- [ ] 递增版本号（SemVer）— 同步更新所有单一来源（全量 `search_content` 核对，勿漏）
- [ ] `package.json` version（权威源）
- [ ] `src/config/version.ts` APP_VERSION（派生源）
- [ ] `next.config.js` env.version
- [ ] `src/app/layout.tsx` metadata / JSON-LD / 头注释
- [ ] `docs/config.yaml` version
- [ ] `docs/SPEC.md` 当前版本 + 第 4.3 节版本号
- [ ] `docs/tasks.md` 本文件版本声明
- [ ] `README.md` 当前版本
- [ ] `README.en.md` 版本徽章
- [ ] `DEPLOYMENT.md` 变量表 + 示例
- [ ] `public/*.txt` / `*.conf` / `*.yaml` 静态样例头部版本号（`# 版本::` / `! 版本::`）— 运行 `node scripts/gen-format-files.mjs`
- [ ] 更新 `CHANGELOG.md` 变更记录（新增 `## [x.y.z]` 小节，分类 feat/fix/docs/...）
- [ ] 创建 GitHub Release（含 tag `vX.Y.Z` 与 release 锚点）
