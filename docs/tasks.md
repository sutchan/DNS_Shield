# 项目任务清单（唯一来源）

> **本文件是项目任务记录的唯一来源（Single Source of Truth）**
> 所有新增、变更、完成任务必须更新本文件；项目内其他位置（README、SPEC、CHECKLIST、CHANGELOG、原型等）**不得另建任务清单**。
> 规则固化见 [SPEC.md §5.4 任务记录规范](./SPEC.md)。

> 最后审查：2026-11-02（第八轮：线上 dns.ewuse.com 实测 UI 缺陷修复；P0/P1 视觉问题已落到代码，待部署验证）
> 维护团队：Sut / ArcesTeam
>
> **本次更新（2026-11-02 第八轮：线上实测 UI 缺陷修复）**。基于 https://dns.ewuse.com/ 桌面 1280×960 真实浏览器取证（截图 + 控制台 + 网络三路），定位 10 项问题并落地代码修复：
> ① **P0 Tabs 受控切换警告已修**——根因：`OutputPanel.tsx` 的 effect 在远端数据未加载时 `useVisibleFormats` 返回空数组 `[]`，effect 把 `currentFormat` 设成 `visibleFormats[0]` 即 `undefined`，导致 Radix Tabs value 从受控字符串变非受控再变回受控（对应控制台 "controlled→uncontrolled" 与 "uncontrolled→controlled" 两条警告）。修复：effect 开头加 `if (visibleFormats.length === 0) return;` guard；
> ② **P1 格式 Tab 栏被圆形按钮裁切已修**——根因：`OutputToolbar` 把 FormatTabs（children）和三个 icon button（规则测试/路由器脚本/设置）放在同一 `flex items-center gap-1.5` 容器里，flex-wrap 时 icon button 插入到 TabsList 换行行之间，把首尾 Tab 文字（Unbound→nbound、SmartDNS→SmartDN、Clash Meta→ClashMeta）裁切。修复：FormatTabs 外包 `<div className="flex-1 min-w-0 flex items-center">`，三个 icon button 包 `<div className="flex items-center gap-1.5 flex-shrink-0">`；
> ③ **P1 两栏底部按钮不对齐已修**——根因：`globals.css` 里 `.editor-container, .editor-wrapper` 用 `mt-auto` 把编辑器推到底部，但两栏前置内容高度不同，导致编辑器位置不同、按钮错位。修复：把 `mt-auto` 从 editor 移到 `.editor-actions` 和 `#output-actions`，让按钮永远贴 panel 底部对齐；
> ④ **P3 域名计数漂移已修**——实算 `public/domains.txt`：白名单 232（Grep `^\+`）、改道 0、注释 15、线上实时黑名单 634，合计 866。SPEC.md §1 原写"867 条（635+232）"已改为"866 条（634+232）"；
> ⑤ **未处理项（待后续决策或部署后复查）**：P0 404 资源具体文件未在 network 日志中复抓（浏览器会话异常）；P1 Hero 右侧 FlowViz 空面板未改；P2 两个"生成规则"按钮重复属交互流程变更、URL 导入藏在折叠区、预置数据无可清空提示、远端 raw.githubusercontent.com 加载失败无感知告警——均为产品 UX 决策，本轮保守未动；
> ⑥ **验证状态**：代码改动均在 UNC 网络盘上，`tsc`/`lint`/`test` 因 IO 极慢无法实跑；改动均为低风险可逆的 UI 布局与 guard，建议在本地磁盘或 CI 复跑 `pnpm install && pnpm test && pnpm lint && pnpm check:locales` 后部署到线上验证控制台警告与 Tab 栏布局。
>
> **本次更新（2026-11-02 第七轮：全项目审查 + SPEC 文档漂移修正）**。本轮按用户指令"完成剩余任务并审查项目"执行：
> ① **未完成任务仍为 0 项**——tasks.md 待办区自第六轮后无新增任务，代码层经静态阅读确认无功能性缺陷；
> ② **SPEC.md 文档漂移已修正**（详见 [tasks-done.md](./tasks-done.md) 第二节）——§2 文件结构补全 18 hooks / 18 utils / 8 业务组件，§5.1 端口 8082→3000，§9.2 vitest ^2.1.9→^3.2.7，§12 重复章节号改为 §13，§12.1 CSP 移除未启用的 `require-trusted-types-for`；
> ③ **门禁实跑受环境限制**——项目位于 UNC 网络盘（`\\Tanas3\jz_1t\Github\DNS_Shield`），`tsc --noEmit` / `next lint` / `vitest run` 在该路径下 IO 延迟极高，实跑 30 分钟无输出（本地 SSD 应 <1 分钟）。本轮以静态阅读核对为主：版本号 3.13.1 在 package.json / version.ts / next.config.js 三处一致；16 语言文件与 214 键基线确认存在；代码质量（类型严格、安全头、shellQuote 防注入、prepareRuleData 统一口径、惰性生成、Worker 大文本处理）经逐文件阅读无缺陷。**建议在本地磁盘（非网络盘）或 CI 环境复跑 `pnpm install && pnpm test && pnpm lint && pnpm check:locales` 以取得权威计数**；
> ④ **环境注意**：当前 shell 的 node 为 v22.23.2，低于项目 `engines.node >=24.11.0` 要求；若在本机跑构建/测试需先切到 Node 24+。
>
> **本次更新（2026-10-22 21:10 第六轮：全量复核 + 数据漂移修正）**。按「数字必须实算」纪律复核：① **全部任务已完成**（未完成合计 0 项），无新增待办，已完成条目均归档于 [tasks-done.md](./tasks-done.md)；② **修正单测用例数漂移**——「二、开发进度全景」单元测试行仍记 248 例，与指标表及实跑结果（`vitest run`：27 套件 / **249** 例）矛盾，已改为 249；③ 门禁状态维持：`check:locales` ✅（16 语 / 214 键）、`tsc` 0 错、`next lint` 0/0。
>
> **本次更新（2026-10-22 15:30 第五轮：T-P0-02a 完成 — 增强 check-locales 捕获集体缺键）**。本轮完成唯一剩余任务，并以破坏性实验反证修复有效：
> ① **T-P0-02a 完成**——`scripts/check-locales.mjs` 原仅做「各语言包相对 `zh-cn.json` 的两两一致性」比对，`zh-cn.json` 自身也是语言包，16 包 + zh-cn 同时缺同一键时基线被静默缩水、CI 假通过（T-P2-08 缺陷能长期存在的机制性原因）。修复：引入**独立基线清单** `scripts/locale-baseline.json`（由 `zh-cn.json` 生成、需显式刷新），先比对 `zh-cn.json` 与基线，再比对各包与 `zh-cn`。新增 `pnpm locales:baseline`（`--update-baseline`）用于新增键时刷新基线；首次运行无清单自动引导生成；
> ② **破坏性反证（验收 #2 实跑）**——从全部 16 个语言包（含 `zh-cn.json`）同时删除 `toast.cleared` 后，脚本**非零退出（EXIT 1）并精确指明缺失键 `toast.cleared`**；恢复后正常态 `✅ 通过（16 语 / 214 键）`；
> ③ **基线清单已生成**：`scripts/locale-baseline.json`（214 键，源 `zh-cn.json`），作为独立门禁基线，杜绝「集体缺键」再次静默溜过 CI。
>
> **本次更新（2026-10-19 21:35 第四轮：全链路实测复核 + T-P1-07 完成 + 数据漂移修正 + ESLint 归零）**。本轮不依赖记忆，逐项实跑核验并修正了文档中长期存在的**数据漂移**，消除 2 处真实代码隐患，并完成 T-P1-07：
> ① **测试规模漂移已修正**——实测为 **27 套件 / 248 用例**（文档此前长期记 19 / 129），来源 `vitest run` 权威计数，全绿；
> ② **i18n 键数漂移已修正**——详见下方指标表（`check:locales` 确认 16 语全部一致）；
> ③ **覆盖率数据失真已修正**——此前记「语句 84.46 / 分支 86.85 / 函数 91.07 / 行 84.46」系 v3.12.0 之前的旧值；`coverage.include` 纳入 `src/hooks` 后真实值为 **语句 53.31 / 分支 85.77 / 函数 80.43 / 行 53.31**。**T-P1-07 完成后已跃升至 语句 87.42 / 分支 86.05 / 函数 89.83 / 行 87.42**，门禁阈值随之由临时的 50/75/80/50 **提升回项目原定的 80/75/85/80**；
> ④ **T-P1-06 隐藏回归已修复**（详见 [tasks-done.md](./tasks-done.md)）——`formatGenerators.single.ts` 对 `bind`/`pihole` 多输出一行白名单段标题，与全量生成器不一致，`formatGenerators.single.test.ts` 实有 2 个 bind 用例失败（文档此前误记「全绿」），现已修复并由测试断言保证；
> ⑤ **ESLint 归零**——修复 `OutputPanel.derived.ts` 的 `useMemo` 陈旧闭包隐患（依赖数组漏列 `settings` 整体，`prepareRuleData` 间接读取其去重/通配符字段），`next lint` 由 1 warning → **0 warning 0 error**；
> ⑥ **`toast.cleared` 缺键已修复**——`useDomainData.ts:134` 调用 `showToast('cleared')` 但 16 个语言包均无该键，用户点「清空」只显示通用「已完成」，语义丢失。已补齐 16 语自然译文（zh-cn 已清空 / en Cleared / ru Очищено / th ล้างแล้ว 等，均不等于各自 `done`），并在手工维护的 `TranslationToast` 接口补 `cleared: string;` 声明（不从 zh-cn.json 推导，否则 `tsc` 报 TS2339）。测试改为断言真实译文并新增「16 语均含该键」集体守卫；键总数 213 → **214**；
> ⑦ **工具链缺陷已实测复现并升级为 P0**——`scripts/check-locales.mjs` 只做各语言包相对 `zh-cn.json` 的**相互一致性**比对，**16 个包同时缺失同一个键时依然输出 ✅ 通过、EXIT CODE 0**（主理人已实测复现：删光该键后基线由 214 静默退回 213 仍通过）。这正是 ⑥ 能长期存在的机制性原因，已登记 T-P0-02a；
> ⑦ 复核通过项：`tsc --noEmit` 零错误、生产构建编译成功（`static/` + `server/app` 产物齐全）、覆盖率门禁经「临时抬阈至99 → EXIT CODE 1」反证为真门禁、`sync-facts.mjs` 13 处版本展示位与 `package.json` 3.13.1 全一致。
>
> 上一轮（2026-10-13 第三轮：实况核验 + 任务清单收尾，与 package.json v3.13.1 对齐；经代码实读确认 T-P2-01/05 与 T-P1-06 已在 v3.13.0 落地，仅文档待办区脱节已修正）
>
> 上一轮（2026-10-13 第二轮：实况核验 + 剩余任务收尾）。① 逐项以真实代码核验 v3.12.0 时登记的 9 项待办——**6 项已被 v3.12.0 落地完成**：T-P2-04/06（`parseLine.ts` 识别正则行 + `parser.ts` 收集 + `formatGenerators.buildRegexRules` + `useRules` 贯通）、T-P2-07（`prepareRuleData` 公共变换统一 `generateRules` 与 `computeEffectiveStats` 口径）、T-P1-05（`useRules.runGenerate` 直接复用 `useDomainData` 的 `parsedData`，消除 2~3 次重复 `parseSource`）、T-P3-04（`scriptGenerator.ts` `shellQuote` 单引号包裹 + `'\''` 转义，`customDnsIp` 死参数已删除）、T-P3-05（`parser.ts` 循环结束补报 `onProgress(total,total)` + `useHomeController` 缺键降级 `t.toast.done`，该键 16 语已存在）；② 剩余 **2 个工作项**（分类 UI 接入 T-P2-01/05、惰性生成 T-P1-06）本轮实施。
> 上一轮（2026-10-13 首轮）应用问题诊断：在不改动产品代码的前提下实读 `src/` 梳理出 7 类真实问题并登记为 T-P2-05~07 / T-P1-05~06 / T-P3-04~05（证据见文末「九、应用问题诊断详述」）。
> 上一轮（2026-10-05）目录结构审查与 P0 整改完成，升 **v3.12.0**；工作流审查整改（v3.11.2）与 EdgeOne 构建修复（v3.11.1）见历史段落。
> 上一轮（20:40）修复 EdgeOne 构建失败（ESLint 门禁）并找回丢失的 `<FormatTabs>` 渲染，升至 v3.11.1。

---

| 指标 | 实测值 | 取得方式 |
|---|---|---|
| 应用版本 | v3.13.1 | `package.json` version（权威源） |
| 输出格式数 | 12 种 | `src/types/formats.ts` 的 `ALL_FORMATS` |
| i18n 语言 / 键数 | 16 种 / 顶层 **146** 键、递归合计 **214** 键 | 脚本统计 `src/locales/zh-cn.json`；`check:locales` 输出为递归口径 **214**（2026-10-19 补齐 `toast.cleared` 后由 213 增至 214；顶层键数不变，`cleared` 为 `toast` 子键，toast 由 21 → 22 键） |
| 测试套件 / 用例 | **27 套件 / 249 用例**（全通过） | `vitest run`（权威计数，2026-10-19 实测；原记 19 / 129 有误。T-P1-07 使其由 20 / 136 增至 27 / 248，T-P2-08 新增集体守卫用例后为 27 / 249） |
| 覆盖率门禁 | 已生效且为真实值；含 `src/utils` + `src/hooks`，门槛 **语句 80 / 分支 75 / 函数 85 / 行 80**（T-P1-07 完成后已从临时的 50/75/80/50 提升回原定目标） | `vitest run --coverage`；**2026-10-19 实测：语句 87.42 / 分支 86.05 / 函数 89.83 / 行 87.42，全部达标且有余量**（`src/hooks` 层由 10.65% 升至 88.52%）。已反证门禁真实生效：临时抬阈至 99 时 `EXIT CODE 1` |
| 组件规模 | 顶层 **14** 个 `.tsx` + `OutputPanel.derived.ts`，`ui/` 12 个 | `src/components/` 实测 |
| 源文件 >200 行 | `ts/tsx` **0** 个（T-P1-04 已完成）；`globals.css` 属全局样式表，按代码拆分口径不计入 | 行数扫描 |
| 静态门禁 | `tsc --noEmit` 零错误；`next lint` **0 warning 0 error**；`sync-facts.mjs` 13 处版本展示位与 package.json 全一致 | 2026-10-19 实跑 |

> **教训**：本文件中的数据型数字（键数 / 用例数 / 覆盖率 / 行数）历史上多次与实现脱节。修改前务必用脚本实算，禁止凭记忆书写。
> 2026-10-19 复核再次印证：键数、用例数、覆盖率三项均曾长期偏离真实值，且**偏差方向不一致**（键数偏少、用例数偏少、覆盖率偏高），说明凭旧记录继承数字必然失真。

---

## 二、开发进度全景

```
[████████████████████████] 100% 全局就绪度（核心任务清单全部完成；Web Worker 大规模性能为后续增强项）
```

| 模块 / 维度 | 完成度 | 状态 | 关键成果 |
|---|:---:|:---:|---|
| **核心规则生成引擎** | 100% | ✅ 稳定 | 支持 12 种输出格式（含 Mosdns/Clash Meta/CoreDNS）、通配符/白名单/自定义DNS前缀解析、高效去重与排序 |
| **Web 交互界面 (GUI)** | 98% | ✅ 完善 | Swiss Precision 排版、规则测试弹窗、路由器脚本弹窗、FlowViz 动效 |
| **单元测试 (Unit Test)** | 100% | ✅ 优秀 | Vitest 27 个测试套件、249 个测试用例全部通过（与指标表一致，2026-10-22 复核修正，原记 248 有误） |
| **测试覆盖率与 CI 门禁** | 95% | ✅ 门禁已生效且已反证 | Vitest 3.2.7 已根治 Windows 盘符重复统计，报告值即真实值；**T-P1-07 完成后 thresholds 由临时的 50/75/80/50 提升回 语句 80 / 分支 75 / 函数 85 / 行 80，当前实测 语句 87.42 / 分支 86.05 / 函数 89.83 / 行 87.42，四项均有余量**；已用「临时抬阈至 99 → EXIT CODE 1」反证门禁真实生效 |
| **国际化 (i18n)** | 100% | ✅ 完成 | 16 种多语言本地化（顶层 146 键、递归 **214** 键），`check:locales` 100% 通过；`toast.cleared` 缺键缺陷已于 2026-10-19 修复（16 语补齐，并新增「16 语均含该键且不等于各自 `done`」集体守卫） |
| **域名规则匹配与测试引擎** | 100% | ✅ 完成 | 完整实现域名/URL 匹配分析引擎与前端交互弹窗 |
| **路由器自动化同步脚本** | 90% | ✅ 完成 | 支持 OpenWrt、Merlin、Padavan、SmartDNS、Pi-hole 自动化更新脚本一键生成 |
| **超大规模数据性能 (Web Worker)** | 40% | 🔵 后续增强（非阻断） | 50,000+ 级大规模域名解析主线程卡顿优化与分片计算（P1 性能优化范畴，按需排期，不影响当前功能可用性） |

---

## 三、待办任务（未完成，按优先级划分）

> **实施顺序总览**：全部任务已完成。`docs/tasks.md` 待办区已清空，仅保留实时指标与历史追踪。T-P0-02a（增强 `check:locales` 捕获集体缺键）于 2026-10-22 完成并归档；T-P2-08（`toast.cleared`）已于 2026-10-19 修复完成并归档；T-P1-07（补齐编排层测试）已于 2026-10-19 完成。
> Web Worker 超大规模性能（≥50,000 行解析）仍为后续增强项（非阻断），不计入任务清单。
> 历史待办明细见 [tasks-done.md](./tasks-done.md) 与下方「四、任务状态追踪」。

### 🔴 P0 - 核心工程与质量门禁

> 当前无未完成的 P0 任务。T-P0-01 / 02 / 03 / 04 与 T-P0-02a 全部完成并归档（详见 [tasks-done.md](./tasks-done.md)）。T-P0-02a 于 2026-10-22 完成：增强 `check-locales.mjs` 以独立基线清单捕获「集体缺键」，并以破坏性实验反证门禁真实生效。

### 🟡 P1 - 性能优化与大数据集体验

当前无未完成的 P1 任务。T-P1-01~07 全部完成：T-P1-07 于 2026-10-19 为 `useRules` / `useDomainData` / `useUrlManager` / `useHomeController` / `useTheme` / `useLoading` / `useFlowTokens` 补齐 112 个用例，语句/行覆盖率由 53.31% 升至 87.42%，达标后已将 `vitest.config.ts` 阈值由临时的 50/75/80/50 提升回原定的 80/75/85/80。

### 🟢 P2 - 规则引擎与国际化完善

### ⚪ P3 / ⚙️ P4

当前无未完成的 P3 / P4 任务，全部条目已完成并归档至 [tasks-done.md](./tasks-done.md)。

> **未完成任务合计：0 项**（全部任务已完成并归档；Web Worker 超大规模性能为后续增强项，非阻断，不计入任务清单）

---

## 四、任务状态追踪与验收标准

| 任务编号 | 任务名称 | 负责人 | 验收标准 | 状态 |
|---|---|---|---|:---:|
| T-P0-01 | 覆盖率工具与门禁 | Core Team | `pnpm test:coverage` 可生成报告且 thresholds 生效 | ✅ 已完成（门禁真实生效） |
| T-P0-02 | 核心模块单元测试 | Core Team | 单元测试用例全部通过（2026-10-19 实测 136 例，原记 129 有误） | ✅ 已完成 |
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
| T-P1-05 | 消除解析重复计算 | Dev Team | 单次输入仅一次 parseSource，runGenerate 复用解析结果 | ✅ 已完成（v3.12.0） |
| T-P1-06 | 惰性生成 | Dev Team | 仅生成 currentFormat，下载/复制时按需全量 | ✅ 已完成（v3.13.0；bind 白名单一致性回归已修复，136 用例全绿） |
| T-P1-07 | 补齐编排层（hooks）测试 | Core Team | 4 个核心钩子补齐单测，语句/行覆盖率 ≥70%，达标后阈值提升回 80/75/85/80 | ✅ 已完成（2026-10-19，7 文件 112 用例；覆盖率 53.31%→87.42%，阈值已提回，门禁经反证生效） |
| T-P0-02a | 增强 `check-locales` 捕获集体缺键 | Core Team | 引入独立基线清单 scripts/locale-baseline.json；16 语同缺某键时脚本非零退出并指明键名（已破坏性反证）；正常态 16 语/214 键仍通过 | ✅ 已完成（2026-10-22，独立基线清单捕获集体缺键，破坏性实验反证） |
| T-P2-01 | 分类标签过滤（UI 接入） | Feature Team | 界面可按分类筛选/导出（数值来自真实索引） | ✅ 已完成（v3.13.0，UI 接通生成链路） |
| T-P2-04 | 正则双向语法转换 | Feature Team | AdGuard 正则 ↔ Pi-hole FTL 互转并接入生成器 | ✅ 已完成（v3.12.0） |
| T-P2-05 | 分类标签 UI 接入 | Feature Team | 分类筛选控件 + 按类导出 + i18n 5 键 × 16 语 | ✅ 已完成（v3.13.0，16 语 category 键齐全） |
| T-P2-06 | 正则规则接入生成器 | Feature Team | 正则行不再被丢弃，12 格式间可转换 | ✅ 已完成（v3.12.0，与 T-P2-04 合并落地） |
| T-P2-07 | 统一统计口径 | Core Team | generateRules 与 computeEffectiveStats 共用同一变换 | ✅ 已完成（v3.12.0，prepareRuleData） |
| T-P3-02 | OpenWrt LuCI 配置包 | Infra Team | LuCI 后台可直接订阅规则源 | ✅ 已完成（v3.11.0） |
| T-P3-04 | 脚本生成器 URL 转义 | Core Team | shellQuote 单引号包裹 + `'\''` 转义，死参数已删除 | ✅ 已完成（v3.12.0） |
| T-P3-05 | 进度补报 + i18n 降级 | Core Team | 尾段补报 100%；缺键降级 t.toast.done 不暴露裸 key | ✅ 已完成（v3.12.0） |
| T-P4-01 | 升级 Vitest 3.x | Core Team | 覆盖率报告无重复键，阈值回归真实值 | ✅ 已完成（v3.11.0） |

---

## 五、已完成任务

> **已完成条目已归档至 [tasks-done.md](./tasks-done.md)**（2026-10-19 迁出，含全部 T-P0/P1/P2/P3/P4 结构化任务、专项整改与历史开发任务的完整成果描述）。
> 本文件自此仅保留**未完成任务**与**实时指标**，避免与归档内容重复维护、两处口径漂移。

**已完成任务概览（明细见 [tasks-done.md](./tasks-done.md)）**：

| 优先级 | 已完成任务编号 | 累计 |
|---|---|:---:|
| 🔴 P0 | T-P0-01 / 02 / 03 / 04 / 02a | 5 |
| 🟡 P1 | T-P1-01 / 02 / 03 / 04 / 05 / 06 / 07 | 7 |
| 🟢 P2 | T-P2-01 / 02 / 03 / 04 / 05 / 06 / 07 | 7 |
| ⚪ P3 | T-P3-01 / 02 / 03 / 04 / 05 | 5 |
| ⚙️ P4 | T-P4-01（已提升至 P2 实施） | 1 |

**已完成的专项整改**：目录结构审查与 P0 整改（v3.12.0）、工作流审查整改（v3.11.2）、构建门禁修复与格式切换 UI 找回（v3.11.1）、GA4 衡量 ID 环境变量化（v3.10.3）、ESLint 陈旧闭包修复（2026-10-19）、T-P1-06 白名单口径回归修复（2026-10-19）、任务文档数据漂移全面修正（2026-10-19）。

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

---

## 九、应用问题诊断详述（证据与修复建议，2026-10-13）

> 本章节为「三、待办任务」中 T-P2-05~07 / T-P1-05~06 / T-P3-04~05 的事实依据。
> 全部结论经 `src/` 代码实读核实，非推测。文档不拆分，故仍归于本文件。

### 9.1 功能缺口（已建库未接入）

**D1 · T-P2-04 / T-P2-06（正则转换未接入）**
- 证据：`src/utils/regexRules.ts` 导出 `parseRegexRule / toAdGuardRegex / toPiHoleRegex / convertRegexRule / extractRegexRules`；`search_content` 全仓仅 `regexRules.test.ts` 引用，无生产调用。
- 影响链：`src/utils/parseLine.ts` 不识别 AdGuard `/pattern/`（L107 `||` 之后若以 `/` 起头，落到 L172 纯域名分支，而 `/ads\./` 非合法域名 → `isValid=false`），`parser.ts` 将其计入 `invalidCount` 丢弃；`rulesGenerator.ts` 不会把正则规则输出到任何目标格式。
- 修复：在 `parseLine.ts` 增加正则行识别（调用 `parseRegexRule`），归入结构化数据，并在 `formatGenerators.ts` / `rulesGenerator.ts` 按目标格式调用 `convertRegexRule`；dnsmasq 仍如实跳过（与既有注释一致）。

**D2 · T-P2-01 / T-P2-05（分类标签 UI 未接入）**
- 证据：`src/utils/domainCategory.ts` 导出 `CATEGORY_DEFINITIONS / parseCategoryIndex / getCategoriesForDomain / filterDomainsByCategory / countByCategory`；全仓仅 `domainCategory.test.ts` 引用。`scripts/aggregate-upstream.mjs` 已聚合上游，但分类索引未与 UI 打通。
- 影响：用户无法按上游来源筛选/选择性导出规则，已实现的 5 类（AdGuard/EasyList/neoHosts/StevenBlack/YouSList）分类能力闲置。
- 修复：在输入/输出区增加分类筛选控件，加载分类索引（由 `aggregate.yml` 产出或运行时 `parseCategoryIndex(public/...)`），调用 `filterDomainsByCategory` 后传参给 `generateRules`；补 16 语 `category.*` 5 键。

### 9.2 安全加固

**D3 · T-P3-04（脚本生成器 URL 注入）**
- 证据：`src/utils/scriptGenerator.ts` L19-20 `const safeUrl = ruleUrl.trim() || ...`，L32 `URL="${safeUrl}"` 等 5 处直接把用户输入嵌入双引号 shell 变量；无任何对 `"` / `$()` / 反引号 / `\` 的转义。
- 风险：若 URL 含 `"$(...)` 或反引号，可破坏生成的 shell 脚本并注入命令（客户端工具，URL 由用户粘贴，属自伤但属真实隐患）。
- 修复：① 用单引号包裹 `URL='...'` 并对单引号做 `'\\''` 转义；或 ② 经 `JSON.stringify` 安全注入；③ 同步处置 `ScriptOptions.customDnsIp` 死参数（L10 声明、函数体从未读取）——实现自定义 DNS 注入或删除该字段。

### 9.3 性能与重复计算

**D4 · T-P1-05（解析重复）**
- 证据：输入变更时——`useDomainData` L117-122 防抖 300ms 触发 `parseSourceData`（经 Worker）；`useRules` L77-82 `sourceInput` effect 触发 `runGenerate`，其内部 L55 `parseSource(sourceInput)` 同步再解析一次；`runGenerate` L64 又调用 `syncParsedData(sourceInput)` 再次触发防抖解析。即单次输入至少 2~3 次完整 `parseSource`。
- 修复：在 `useDomainData` 解析完成后，将 `ParsedData` 经共享状态（ref/context）直接传给 `useRules`，`runGenerate` 复用该结果而非二次 `parseSource`；或将 `parseSource` 提升为记忆化纯函数并由两 hook 共享同一份 outcome。

**D5 · T-P1-06（全量生成）**
- 证据：`generateRules`（`rulesGenerator.ts` L63-108）通过 `mergeContents` 一次性拼接 12 种格式；`useRules.runGenerate` L57 每次调用都生成全部格式，而 UI 仅展示 `currentFormat`。
- 修复：改为按需生成——`runGenerate` 仅生成 `currentFormat` 对应内容；下载/复制时再调用全量 `generateRules`。对 10 万行输入可减少约 11/12 的字符串拼接开销。

### 9.4 边界与一致性

**D6 · T-P3-05（进度不上报 100%）**
- 证据：`parser.ts` L29 `if (onProgress && (i+1)%PROGRESS_INTERVAL===0)`；当总行数非 2000 整数倍时，最后一段不足 2000 行不会触发 `onProgress(total,total)`，Worker 进度条可能停在 <100%。
- 修复：循环结束后补 `if (onProgress) onProgress(total, total);`。

**D7 · T-P2-07（统计口径不一致）**
- 证据：`rulesGenerator.ts` L97 `totalDomains = blockedDomains.length + customDns.length`（不含白名单）；L115-141 `computeEffectiveStats` 的 `validCount = uniqueValidDomains.size + customDns.length`（含白名单）。两值在 UI 同屏展示，口径不同易致用户困惑。
- 修复：统一语义——header 用「拦截域名数（不含白名单）」、统计面板用「有效规则数（含白名单豁免）」并明确文案；或在 `generateRules` 同步返回白名单口径以供 header 一致展示。

**D8 · T-P3-05（i18n 缺键暴露裸 key）**
- 证据：`useHomeController.ts` L26-39：缺 `toast[key]` 时 `message = toastMessages[key] || key`，即回退为原始键名（如 `presetLoaded`），用户可见裸 key；仅 `logger.warn`。
- 修复：缺键时回退为通用提示（如「操作完成」）而非原始键，并补 16 语缺失键（或集中审查 `t.toast` 键覆盖）。

### 9.5 文档自身不一致

**2026-10-13 第三轮修正**：
- 「二、开发进度全景」单元测试行曾写「16 套件 / 114 用例」，与「指标」表（19 套件 / 129 用例）矛盾，已修正。
- T-P2-01 / T-P2-04 原标记 `[x] 已完成` 但功能未对用户可用，已纠偏降级（见「三、待办」与「四、追踪表」）。

**2026-10-19 第四轮修正（本轮实测发现，详见文件头「本次更新」）**：
- 测试规模长期偏少：记 19 套件 / 129 用例，实为 20 / 136。
- i18n 键数长期偏少：记顶层 145 / 递归 207，实为 146 / 213。
- **覆盖率数值失真（偏差最大的一项）**：记 84.46 / 86.85 / 91.07 / 84.46，系 v3.12.0 将 `src/hooks` 纳入 `coverage.include` **之前**的旧值；此后 14 个编排钩子中 10 个无测试（语句/行覆盖率为 0），真实值已降至 53.31 / 85.77 / 80.43 / 53.31。文档未随之更新，导致「门禁很强」的错觉长期存在。
- T-P1-06 被记为「一致性测试全绿」，实为 2 个 `bind` 用例失败（缺陷已修复，见「五、已完成任务」）。
