# 项目任务清单（未完成任务唯一来源 + 实时指标）

> **本文件是项目「未完成任务」与「实时指标」的唯一来源（Single Source of Truth）**。
> 已完成任务条目、历轮变更详情与开发进度全景已归档至 [tasks-done.md](./tasks-done.md)（含全部 T-P0/P1/P2/P3/P4 结构化任务、专项整改、验收标准与诊断证据、完成度快照），本文件不再重复维护已完成条目与历史叙述，避免两处口径漂移。
> 规则固化见 [SPEC.md §5.3 任务记录规范](./SPEC.md)。

> 最后审查：2026-11-25（与 package.json v3.22.0 对齐；**第二十二轮 2026-11-25 15:00**：逐条复核 48 项任务实证，T-SEC-02 / T-AUD-M11 / T-AUD-L09 / T-AUD-L10 已闭环并迁入 tasks-done.md，剩余 44 项按优先级重排；第二十一轮：建立文档中心与 01/03/04/05/06/07 六大模块文档、OpenAPI 3.1 定义，任务清单补齐责任人与计划完成时间并重排为 18 项（后增 T-DATA-01 与 2026-11-25 审计迁移项，当前合计以 §二 声明为准）；第二十轮：域名计数曾实算 127188、i18n 键数校正（当前 213）；本轮发现主线数据源回退至 644 条，已登记 T-DATA-01 待核实；第十九轮审计 11 项已并入第二节）
> 维护团队：Sut / ArcesTeam
>
> **本轮整理（2026-11-13）**：依 SPEC §5.3 任务记录规范，将第十四~十八轮冗长的「本次更新」历史叙述统一归档至 [tasks-done.md](./tasks-done.md)，本文件仅保留未完成清单、实时指标、遗留疑问与维护清单；版本与指标经实算与代码实况对齐（v3.19.2 / 12 格式 / 16 语 212 键 / 51 套件 326 用例 / 17 组件 / >200 行源文件 0 个 / 拦截域名 127188 条）；2026-11-22 第二十轮校正键数与域名计数并补记分支整理。
>
> **遗留疑问 / 审计结论**（2026-11-13 第十九轮）：
> - ~~`vercel.json` 双源 CSP 差异~~：**已解决**——`vercel.json` 文件已删除，安全响应头现为 `next.config.js` 单一来源（见 §11 与 T-DOC-01）；是否启用 `require-trusted-types-for` 转为安全增强评估项（T-SEC-01）。
> - `NEXT_PUBLIC_APP_VERSION` 环境变量：已在 v3.18.1 从代码/文档移除（DEPLOYMENT.md 改为 `APP_VERSION` 单一来源），不属遗留项。
> - 第十九轮审计新增 11 项待办见第二节（文档漂移 / 版本硬编码 / 根因回归 / 发布链路验证 / 兼容性）。

---

## 一、实时指标

| 指标 | 实测值 | 取得方式 |
|---|---|---|
| 应用版本 | v3.22.0 | `package.json` version（权威源） |
| 输出格式数 | 12 种 | `src/types/formats.ts` 的 `ALL_FORMATS` |
| i18n 语言 / 键数 | 16 种 / 递归合计 **213** 键（`check:locales` 与 `scripts/locale-baseline.json` keyCount 口径） | `node scripts/check-locales.mjs` 2026-11-25 实跑输出「213 键」；早期记录的 209 / 212 键已过时，禁止沿用旧值 |
| 测试套件 / 用例 | **51 套件 / 335 用例**（2026-11-25 `vitest run` 实跑全绿；较 2026-11-13 的 326 例增加 9 例，系 v3.20.x 诊断修复补测） | `vitest run` 为权威计数，本轮已实跑复核 |
| 覆盖率门禁 | 已生效且为真实值；含 `src/utils` + `src/hooks`，门槛 **语句 80 / 分支 75 / 函数 85 / 行 80**；`vitest.config.ts` 显式声明 `all: false` | `vitest run --coverage`；2026-11-25 实测：语句 87.91 / 分支 87.26 / 函数 90.78 / 行 87.91，全部达标且有余量；曾以「临时抬阈至 99 → EXIT CODE 1」反证门禁真实生效 |
| 组件规模 | 顶层 **17** 个 `.tsx`（含 `OutputPanel.parts.tsx` / `OutputPanel.formatSelect.tsx` / 新增 `SeoContent.tsx`）+ `OutputPanel.derived.ts` / `InputPanel.types.ts`，`ui/` 8 个（v3.18.0 清理 4 个未被引用的孤儿组件 `Card` / `Loading` / `Switch` / `Tabs`） | `src/components/` 实测（2026-11-12 实算） |
| 源文件 >200 行 | **0** 个（v3.18.1 已将 `src/hooks/useWorkerPool.ts` 由 213 行拆分降回 200 行内；`globals.css` 已于 v3.13.6 拆为 `src/styles/*.css` 8 模块）；2026-11-13 实扫确认 | 行数扫描（2026-11-13 实算） |
| 静态门禁 | `sync-facts.mjs --check` 13 处版本展示位与 package.json(3.21.0) 全一致；`check-locales.mjs` 16 语 / 213 键一致；`check-root-clean.mjs` 根目录临时文件洁净度（`rootclean` job）；文档内链断链 0 | 2026-11-25 实跑（`sync-facts --check` / `check:locales` / `check-root-clean`）；`tsc` / `eslint` / `vitest` 同日实跑全绿 |
| 拦截域名 | **644** 条（黑名单 644 + 白名单 0），2026-11-25 实算 | `node scripts/count-domains.mjs` 实跑；历史上主线曾为 127188 条（af976b8），`origin/auto/aggregate-upstream` 上 7fac633 有 129348 条未合入；主线回退原因待查（T-DATA-01，P1） |

> **教训**：本文件中的数据型数字（键数 / 用例数 / 覆盖率 / 行数）历史上多次与实现脱节。修改前务必用脚本实算，禁止凭记忆书写。
> 2026-10-19 复核再次印证：键数、用例数、覆盖率三项均曾长期偏离真实值，且偏差方向不一致，说明凭旧记录继承数字必然失真。

---

## 二、待办任务（未完成，按优先级排序）

> **任务合计：44 项**（2026-11-25 15:00 复核：原 48 项＝19 项 + 审计报告迁移 29 项，已归档 4 项闭环任务 T-SEC-02 / T-AUD-M11 / T-AUD-L09 / T-AUD-L10 至 [tasks-done.md](./tasks-done.md) §八，当前 44 项均未完成）。
> 每条均含「目标 / 责任人 / 计划完成时间（绝对日期）/ 影响范围 / 验收标准」（审计迁移项的详细问题与统一验收标准见 §六）。
> **唯一来源纪律**：任何位置的任务型表述（审计报告「修：」、优化方案 O-xx、FAQ「待评估/待验证」、源码 TODO 等）必须在本文件登记；原位置只保留证据与方案，不维护第二份状态（见 SPEC §5.3）。
> 本轮已完成的文档完善工作（文档索引 + 01/03/04/05/06/07 + OpenAPI）见 [CHANGELOG](../CHANGELOG.md) 对应版本小节，不在此重复。
> 历史 T-P0~P4 编号任务已归档至 [tasks-done.md](./tasks-done.md)。
>
> **状态重评（2026-11-25 15:00 实查）**：① 已闭环并归档 4 项（T-SEC-02 / T-AUD-M11 / T-AUD-L09 / T-AUD-L10）；② 部分完成待收尾 12 项：T-DOC-01 / T-DOC-02 / T-TEST-01 / T-CI-01 / T-DATA-01 / T-VERIFY-01 / T-PERF-02 / T-COMPAT-01 / T-REL-01 / T-AUD-M05 / T-AUD-M15 / T-AUD-L05；③ 其余 32 项未启动。优先级维持 P1/P2/P3/P4 原分级：安全投毒（H02）、TLS 降级（H03）、静默丢数据（H04）与域名数据回退（T-DATA-01）为最高处理批次；T-DATA-01 因影响全站拦截能力，计划提前至 2026-11-26 前给出决策记录。

### 优先级 / 责任人 / 计划完成时间总表

| 优先级 | 编号 | 任务 | 责任人 | 计划完成 | 来源 |
|:------:|------|------|--------|----------|------|
| 🔴 P1 | T-DOC-01 | 修正 SPEC 锁文件 / CSP 过时描述 | Docs Team | 2026-12-02 | 审计 O-03 |
| 🔴 P1 | T-DOC-02 | CHANGELOG 补记内存 5GB 根因修复 | Docs Team | 2026-12-02 | 历史遗留 |
| 🔴 P1 | T-TEST-01 | 内存根因端到端回归（loadDomainData 单飞） | QA / Dev Team | 2026-12-02 | 历史遗留 |
| 🔴 P1 | T-CI-01 | 验证 CI→Deploy→Release 全绿与自动发版 | CI Owner | 2026-12-02 | 历史遗留 |
| 🔴 P1 | T-BUILD-01 | 恢复 .npmrc 使 engine-strict 生效（O-05） | CI Owner | 2026-12-02 | 本轮文档核查 |
| 🔴 P1 | T-DATA-01 | 核实域名数据源 127188 → 644 回退并决定是否合并聚合分支 | Sut / CI Owner | 2026-11-26 | 本轮数据核对 |
| 🔴 P1 | T-AUD-H02 | 修复 workflow_run 投毒：限定同仓库 push 触发、密钥入受保护 environment | CI Owner | 2026-12-09 | 审计 H-02 |
| 🔴 P1 | T-AUD-H03 | 移除路由器同步脚本的 TLS 校验降级（curl -k 等） | Dev Team | 2026-12-09 | 审计 H-03 |
| 🔴 P1 | T-AUD-H04 | 自动保存失败显式返回与告警，消除 >5MB 静默丢数据 | Dev Team | 2026-12-09 | 审计 H-04 |
| 🟡 P2 | T-VER-01 | 消除 next.config.js 硬编码版本 | Dev Team | 2026-12-16 | 历史遗留 |
| 🟡 P2 | T-VERIFY-01 | OpenAPI 3.1 定义规范校验（待验证技术细节） | Docs Team | 2026-12-16 | 本轮新增 |
| 🟡 P2 | T-SEC-01 | 评估启用 Trusted Types / 收敛 unsafe-inline（O-08） | Dev Team | 2026-12-16 | 历史遗留 + 本轮 |
| 🟡 P2 | T-A11Y-01 | 无障碍自动化回归（axe / Playwright，O-09） | QA | 2026-12-16 | 历史遗留 + 本轮 |
| 🟡 P2 | T-PERF-01 | 大输入分片与全量 split 内存优化（O-01） | Dev Team | 2026-12-23 | 历史遗留 + 本轮 |
| 🟡 P2 | T-PERF-02 | 行号重复生成收敛到单一派生（O-02） | Dev Team | 2026-12-16 | 本轮新增 |
| 🟡 P2 | T-COMPAT-01 | Node 24 / npm 11 强约束兼容验证 | CI Owner | 2026-12-16 | 历史遗留 |
| 🟡 P2 | T-PWA-01 | 评估并启用 Service Worker 注册（O-06） | Dev Team | 2026-12-23 | 本轮文档核查 |
| 🟡 P2 | T-REL-01 | category-index.txt 纳入发布路径（O-07） | Release Owner | 2026-12-23 | 本轮文档核查 |
| 🟡 P2 | T-AUD-M02 | 限制出站 host 与 connect-src，防客户端请求伪造 | Dev Team | 2026-12-23 | 审计 M-02 |
| 🟡 P2 | T-AUD-M03 | IndexedDB 缓存读取加类型守卫 / etag 正则 / TTL | Dev Team | 2026-12-23 | 审计 M-03 |
| 🟡 P2 | T-AUD-M04 | 第三方 Action 固定到 commit SHA，Dependabot 推进 SHA | CI Owner | 2026-12-23 | 审计 M-04 |
| 🟡 P2 | T-AUD-M05 | 部署令牌改步骤级 env 传值，避免进入 argv | CI Owner | 2026-12-23 | 审计 M-05 |
| 🟡 P2 | T-AUD-M06 | 修复 IPv6 正则拒绝大量合法地址（压缩形式 / 内嵌 IPv4） | Dev Team | 2026-12-23 | 审计 M-06 |
| 🟡 P2 | T-AUD-M07 | 并行 Worker 入口设置 isProcessing，完成 / 失败统一复位 | Dev Team | 2026-12-23 | 审计 M-07 |
| 🟡 P2 | T-AUD-M08 | IDB 连接失败重置 dbPromise，区分 onerror / onblocked | Dev Team | 2026-12-23 | 审计 M-08 |
| 🟡 P2 | T-AUD-M09 | Worker 聚合进度改用固定全局 total，避免倒退 | Dev Team | 2026-12-23 | 审计 M-09 |
| 🟡 P2 | T-AUD-M10 | push(...arr) 改循环 / concat，避免大数组静默降级 | Dev Team | 2026-12-23 | 审计 M-10 |
| 🟡 P2 | T-AUD-M12 | AppContext value 用 useMemo 稳定，避免 13 消费者全量重渲染 | Dev Team | 2026-12-23 | 审计 M-12 |
| 🟡 P2 | T-AUD-M13 | 补缓存层测试，按 glob 分设覆盖率 thresholds | QA | 2026-12-23 | 审计 M-13 |
| 🟡 P2 | T-AUD-M15 | 规则行 / 头部重复实现抽为框架无关共用模块 | Dev Team | 2026-12-23 | 审计 M-15 |
| 🟡 P2 | T-AUD-M17 | 移除 3 个零引用依赖并重生锁文件 | Dev Team | 2026-12-23 | 审计 M-17 |
| ⚪ P3 | T-FEAT-01 | 扩展路由器兼容列表（O-10） | Docs Team | 2027-01-13 | 历史遗留 + 本轮 |
| ⚪ P3 | T-VER-02 | 修正 layout.tsx「React 19」注释漂移 | Dev Team | 2027-01-13 | 本轮代码评估 |
| ⚪ P4 | T-SEO-01 | sitemap / robots 多语言 hreflang | SEO Owner | 2027-02-10 | 历史遗留 |
| ⚪ P3 | T-AUD-L01 | vars/inputs 直插 shell 改走 env: | CI Owner | 2027-01-13 | 审计 L-01 |
| ⚪ P3 | T-AUD-L02 | 聚合 fetch 加体积上限与重定向校验 | Dev Team | 2027-01-13 | 审计 L-02 |
| ⚪ P3 | T-AUD-L03 | 首屏内联脚本 lang 共用语言白名单 | Dev Team | 2027-01-13 | 审计 L-03 |
| ⚪ P3 | T-AUD-L04 | JSON-LD stringify 转义 `<` | Dev Team | 2027-01-13 | 审计 L-04 |
| ⚪ P3 | T-AUD-L05 | autosave 恢复竞态检查 ref 非空并跳过空白草稿 | Dev Team | 2027-01-13 | 审计 L-05 |
| ⚪ P3 | T-AUD-L06 | 空输入 totalLines 返回 0 而非 1 | Dev Team | 2027-01-13 | 审计 L-06 |
| ⚪ P3 | T-AUD-L07 | 产物白名单注释与运行时 i18n 对齐 | Docs Team | 2027-01-13 | 审计 L-07 |
| ⚪ P3 | T-AUD-L08 | APP_VERSION 一致性纳入自动断言 | CI Owner | 2027-01-13 | 审计 L-08 |
| ⚪ P3 | T-AUD-L11 | .gitignore 重复条目去重 | Dev Team | 2027-01-13 | 审计 L-11 |
| ⚪ P3 | T-AUD-L12 | useVirtualList 滚动改 rAF 节流 | Dev Team | 2027-01-13 | 审计 L-12 |

### 🔴 P1 - 正确性 · 发布链路 · 安全护栏

- **T-DATA-01 · 核实域名数据源回退**（责任人：Sut / CI Owner；计划：2026-11-26）
  - 目标：本轮文档核对发现主线 `public/domains.txt` 当前仅 644 条（888 行），而历史提交 `af976b8` 为 127188 条、`origin/auto/aggregate-upstream` 的 `7fac633` 为 129348 条且未合入主线；需定位回退发生在哪次提交 / 工作流，并决定是恢复聚合结果还是确认 644 为有意状态。
  - 影响范围：全站拦截能力（127188 → 644 是数量级下降）、文档事实数字、订阅用户。
  - 验收标准：给出回退原因与决策记录；若恢复则从确认的权威提交重建 11 个产物并重算 `count-domains`，同步 SPEC / tasks / CHANGELOG；若维持 644 则说明原因并关闭本任务。
- **T-DOC-01 · 修正 SPEC 锁文件 / CSP 过时描述**（责任人：Docs Team；计划：2026-12-02）
  - 目标：`docs/SPEC.md:242,461,555` 仍写「`package-lock.json` / `.npmrc` 缺失属 BLOCKER」，但锁文件已由 `a9eceb1` 恢复；`.npmrc` 仍缺失应单列并指向 T-BUILD-01。§11 双源 CSP 描述亦需与 `next.config.js` 单一来源对齐。
  - 影响范围：文档准确性、贡献者排障。
  - 验收标准：SPEC 三处与工作树一致；审计报告按冻结快照保留历史原文；`docs/07-improvements.md` O-03 标注实施结果。
- **T-DOC-02 · CHANGELOG 补记内存 5GB 根因修复**（责任人：Docs Team；计划：2026-12-02）
  - 目标：登记 `a57f1f3` / `da0f2af` / `dc0f4b4`（`useWorkerPool` 引用 `useMemo` + 任务单飞 + 回归测试）修复的「引用抖动 → `loadDomainData` 每帧执行 → 堆积克隆大文本」根因。
  - 验收标准：CHANGELOG 含该根因与修复条目，文件名 / 行数与 `git log` 一致。
- **T-TEST-01 · 内存根因端到端回归**（责任人：QA / Dev Team；计划：2026-12-02）
  - 目标：新增 `useDomainData` 测试，直接断言挂载后 `loadDomainData` 仅执行一次，锁定引用抖动根因。
  - 验收标准：新增用例落入 hooks 套件并全绿。
- **T-CI-01 · 验证 CI→Deploy→Release 全绿与自动发版**（责任人：CI Owner；计划：2026-12-02）
  - 目标：确认最新版本已在 GitHub 产生 Release / tag，发布链路真实跑通。
  - 验收标准：Actions 全绿、存在对应 tag 与 Release；若红则定位（重点：setup 缓存 / npm ci 锁文件安装）。
- **T-BUILD-01 · 恢复 `.npmrc`**（责任人：CI Owner；计划：2026-12-02）
  - 目标：恢复 `engine-strict=true` / `package-manager-strict=true`，使 `engines.node >=24.11.0 <25` 与 `engines.npm >=11` 真正生效。
  - 验收标准：Node 24 / npm 11 下 `npm ci` 通过；不满足约束时安装期失败；DEPLOYMENT 与 SPEC 描述同步。

### 🟡 P2 - 代码质量 · 文档 · 性能 · 兼容性增强

- **T-VER-01 · 消除 next.config.js 硬编码版本**（责任人：Dev Team；计划：2026-12-16）：改为构建期读取 `package.json` 或纳入 `sync-facts --check`；`npm version` 后门禁可检出漂移。
- **T-VERIFY-01 · OpenAPI 3.1 定义规范校验**（责任人：Docs Team；计划：2026-12-16）：本轮新增 `docs/openapi.yaml` 尚未跑规范校验器；用 `@redocly/cli lint` 或等价工具校验并修复告警，把校验加入 CI。验收：lint 0 error，CI 增对应 job。
- **T-SEC-01 · 评估 Trusted Types（O-08）**（责任人：Dev Team；计划：2026-12-16）：把首屏内联脚本改 nonce / hash，评估 `require-trusted-types-for 'script'` 对 3 处 `dangerouslySetInnerHTML` 的影响；先灰度再合入。验收：产出评估结论，灰度无违规。
- **T-A11Y-01 · 无障碍自动化回归（O-09）**（责任人：QA；计划：2026-12-16）：引入 `axe-core` + Playwright，对 `/`、`/about/` 与弹窗扫描，CI 阻断 critical 违规。验收：基线修复后 critical = 0。
- **T-PERF-01 · 大输入内存优化（O-01）**（责任人：Dev Team；计划：2026-12-23）：`parser.ts` / `sortDedupe.ts` 全量 `split` 改 `iterateLines`；`parseAggregate.ts` 分片改偏移记录、`push(...arr)` 改循环；增加 50MB 基准。验收：主线程峰值约 3× → 1×，无栈溢出。
- **T-PERF-02 · 行号重复生成（O-02）**（责任人：Dev Team；计划：2026-12-16）：收敛 `useRules.ts:34,59` 到 `useLineNumbers` 单一派生。验收：同输入行号函数仅调用一次。
- **T-COMPAT-01 · Node 24 / npm 11 兼容验证**（责任人：CI Owner；计划：2026-12-16）：在 Node 24 下验证 `npm ci`；与 T-BUILD-01 联动。
- **T-PWA-01 · 评估并启用 Service Worker（O-06）**（责任人：Dev Team；计划：2026-12-23）：客户端注册 `/service-worker.js`，明确缓存白名单；验收：生产离线可打开工具外壳。
- **T-REL-01 · category-index.txt 纳入发布路径（O-07）**（责任人：Release Owner；计划：2026-12-23）：更新聚合 / 发布工作流路径清单，增加 `GET /category-index.txt` 200 断言。

### ⚪ P3 / ⚪ P4 - 低优先 / 可选

- **T-FEAT-01 · 扩展路由器兼容列表（O-10）**（责任人：Docs Team；计划：2027-01-13）：基于官方文档补充 OpenClash / mihomo / 华为 / 中兴的映射，不写未经证实的兼容性声明。
- **T-VER-02 · 修正 React 19 注释漂移**（责任人：Dev Team；计划：2027-01-13）：`src/app/layout.tsx:39` 注释称 React 19，实际依赖 React 18 / Next 14；核实历史原因后改为准确表述。
- **T-SEO-01 · sitemap / robots 多语言 hreflang**（责任人：SEO Owner；计划：2027-02-10）：完善多语言 `hreflang` 与 robots 声明，`seo.test.ts` 覆盖。
---

## 三、日常维护清单

- [ ] 检查现有规则有效性
- [ ] 测试新广告域名
- [ ] 更新 `public/domains.txt` 原始域名
- [ ] 启动开发服务器：`npm run dev`（端口 3000，由 `package.json` 的 `next dev -p 3000 -H 0.0.0.0` 固定）
- [ ] 访问本地开发地址（http://localhost:3000）生成新规则
- [ ] 更新 `public/dnsmasq.conf`（或直接运行 `node scripts/gen-format-files.mjs` 一次性重建全部格式）
- [ ] 更新 `public/hosts.txt`
- [ ] 更新 `public/adguard.txt`
- [ ] 更新 `public/whitelist.txt`

## 四、定期任务

- [ ] 每 2 周检查一次规则有效性
- [ ] 清理无效 / 过期域名
- [ ] 优化规则匹配效率
- [ ] 合并上游更新（AdGuard / EasyList / NeoHosts）— 现已由 `aggregate.yml` 每周自动聚合
- [ ] 检查并更新依赖版本
- [ ] 运行构建确保功能正常（`npm run build`）

## 五、版本发布清单

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
- [ ] 页脚版本号/build 编号展示正确（`Footer.tsx` 输出 `V{APP_VERSION}· build {NEXT_PUBLIC_BUILD_ID}`，2 位年，规范见 SPEC §8.1）
- [ ] 更新 `CHANGELOG.md` 变更记录（新增 `## [x.y.z]` 小节，分类 feat/fix/docs/...）
- [ ] 推送后由 `release.yml` 自动发布 GitHub Release：CI→Deploy 全绿后按 `package.json` 版本打 `vX.Y.Z` tag 并发布（tag 已存在则跳过，无需手动打 tag）

---

## 六、审计报告未闭环项详情（2026-11-25 迁移）

> 来源：[`docs/AUDIT-REPORT-v3.19.0.md`](./AUDIT-REPORT-v3.19.0.md)（v3.19.0 冻结快照，2026-11-18）。该报告 `:141` 明确「当前待办未含本轮深层发现」；本章将其中带「修：」建议、且未在 §二 其他任务中登记的 29 条统一迁移到本文件，使任务状态只有一个维护位置。2026-11-25 复核后已闭环 3 条（M-11 / L-09 / L-10）迁出，现余 26 条。
> **原报告为历史证据快照，不再维护任务状态**；状态、责任人与完成情况只看本文件。已登记映射（不在本章重复）：H-01 → T-SEC-02、B-01 / H-05 的 `.npmrc` 部分 → T-BUILD-01（锁文件已恢复）、M-01 → T-SEC-01 / T-DOC-01、M-14 / L-08 → T-VER-01、M-16 的重复行号部分 → T-PERF-02、O-01~O-10 → 对应 T-PERF-01 / T-PERF-02 / T-DOC-01 / T-SEC-02 / T-BUILD-01 / T-PWA-01 / T-REL-01 / T-SEC-01 / T-A11Y-01 / T-FEAT-01。

### HIGH（3 项）

- **T-AUD-H02 · workflow_run 投毒**：fork PR 可将源分支命名为 `main` 并通过 `workflow_run.branches`，检出 `head_sha` 执行其中脚本、携带 secrets 部署/发版（deploy.yml / release.yml）。修：job 限定 `head_repository.full_name == github.repository && event == 'push'`，密钥入受保护 environment。
- **T-AUD-H03 · 路由器同步脚本关闭 TLS**：`src/utils/scriptGenerator.ts` 的 curl `-k` / wget `--no-check-certificate` 以 root 下载并覆盖 dnsmasq 配置。修：去掉校验降级，依赖系统 CA（`ca-bundle`）。
- **T-AUD-H04 · 自动保存静默丢数据**：`autosaveStorage.ts` 在 IDB 写失败且草稿 >5MB 时既不写 IDB 也不写 localStorage，且不返回失败；`useDomainData` 无条件弹成功 toast。修：返回写入结果，失败向上传播并弹失败提示。

### MEDIUM（13 项）

- **T-AUD-M02** 出站 host 仅校验协议、CSP `connect-src https:` 全放开 → 强制 https + 内置源白名单 + 自定义源显式确认。
- **T-AUD-M03** IDB 缓存零运行时校验（`as T`）→ 读取时类型守卫 + etag 正则 + TTL。
- **T-AUD-M04** 第三方 Action 用可变 major tag → 固定 40 位 commit SHA，Dependabot 推进 SHA。
- **T-AUD-M05** 部署令牌进入 argv（`/proc/<pid>/cmdline` 可读）→ 步骤级 `env:` + OIDC 优先。
- **T-AUD-M06** IPv6 正则拒绝 `2001:db8::8a2e:370:7334` 等合法地址 → 按 `::` 拆组计数 + 内嵌 IPv4。
- **T-AUD-M07** 并行 Worker 分支从不 `setIsProcessing(true)`，≥20000 行进度条不显示 → 并行入口置 true，终态统一复位。
- **T-AUD-M08** IDB `onerror` / `onblocked` 后 `dbPromise` 永久 resolve(null) → 失败时重置并区分原因。
- **T-AUD-M09** 聚合进度 `total += shard.total` 用已上报分片之和 → 可到 100% 后倒退；派发前算固定全局 total。
- **T-AUD-M10** `push(...arr)` 在 126000 元素起 RangeError → 静默降级串行且内存翻倍；改循环 / concat。
- **T-AUD-M12** `<AppProvider value={{t:c.t}}>` 每次渲染新 value → 13 个 `useT()` 消费者全量重渲染；用 useMemo。
- **T-AUD-M13** 覆盖率门禁仅覆盖 utils/hooks，functions 余量 3.23 → 补缓存层测试 + 按 glob 分设 thresholds（保留 `all:false`）。
- **T-AUD-M15** 规则行 / 头部 3+2 份重复实现（运行时 + 构建脚本）→ 抽框架无关纯 TS 模块共用。
- **T-AUD-M17** `@radix-ui/react-{switch,tabs,toast}` 零引用 → 移除并重生锁文件。

### LOW（10 项）

`T-AUD-L01` shell 变量改 `env:` ｜ `T-AUD-L02` 聚合 fetch 体积上限 + 重定向校验 ｜ `T-AUD-L03` 内联脚本 `lang` 共用白名单 ｜ `T-AUD-L04` JSON-LD 转义 `<` ｜ `T-AUD-L05` autosave 恢复竞态 ｜ `T-AUD-L06` 空输入 `totalLines=0` ｜ `T-AUD-L07` 产物注释与 i18n 对齐 ｜ `T-AUD-L08` 版本一致性断言 ｜ `T-AUD-L11` `.gitignore` 去重 ｜ `T-AUD-L12` 虚拟列表 rAF 节流。详细位置与修复方向见审计报告 §五（冻结快照），本文件只维护状态。

### 统一验收标准（适用于本章全部条目）

1. 对照当前代码核实问题是否仍存在，在条目下附证据（文件:行号或实跑输出）；
2. 仍存在则按上述方向修复，补对应回归测试，并跑 `npm run lint && npx tsc --noEmit && npm run test` 全绿；
3. 若已在 v3.20 / v3.21 等后续版本修复，附提交或测试证据后在本文件标记完成并移入 [`tasks-done.md`](./tasks-done.md)，**不重复实施**。
