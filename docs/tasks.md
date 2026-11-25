# 项目任务清单（未完成任务唯一来源 + 实时指标）

> **本文件是项目「未完成任务」与「实时指标」的唯一来源（Single Source of Truth）**。
> 已完成任务条目、历轮变更详情与开发进度全景已归档至 [tasks-done.md](./tasks-done.md)（含全部 T-P0/P1/P2/P3/P4 结构化任务、专项整改、验收标准与诊断证据、完成度快照），本文件不再重复维护已完成条目与历史叙述，避免两处口径漂移。
> 规则固化见 [SPEC.md §5.3 任务记录规范](./SPEC.md)。

> 最后审查：2026-11-25（与 package.json v3.22.0 对齐；**第二十二轮 2026-11-25：两轮复核共闭环 37 项，活跃任务 11 项；实测 54 套件 / 349 用例、覆盖率 87.72/87.15/89.17/87.72、构建与全部静态门禁通过**；第二十一轮：建立文档中心与 01/03/04/05/06/07 六大模块文档、OpenAPI 3.1 定义，任务清单补齐责任人与计划完成时间并重排为 18 项（后增 T-DATA-01 与 2026-11-25 审计迁移项，当前合计以 §二 声明为准）；第二十轮：域名计数曾实算 127188、i18n 键数校正；随后主线数据源回退至 644 条并登记 T-DATA-01，本轮已从 af976b8 恢复至 127188 条、i18n 键数实算 214；第十九轮审计 11 项已并入第二节）
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
| i18n 语言 / 键数 | 16 种 / 递归合计 **214** 键（`check:locales` 与 `scripts/locale-baseline.json` keyCount 口径） | `node scripts/check-locales.mjs` 2026-11-25 实跑输出「214 键」（新增 `toast.autosaveFailed`）；早期记录的 209 / 212 / 213 键已过时，禁止沿用旧值 |
| 测试套件 / 用例 | **54 套件 / 349 用例**（2026-11-25 `vitest run` 实跑全绿；较上轮 51 套件 / 335 例增加 3 套件 14 例，系本轮审计闭环补测） | `vitest run` 为权威计数，本轮已实跑复核 |
| 覆盖率门禁 | 已生效且为真实值；含 `src/utils` + `src/hooks`，全局门槛 **语句 80 / 分支 75 / 函数 85 / 行 80**，并按 glob 加设 hooks 80/75/80/80、utils 85/85/85/85；`vitest.config.ts` 显式声明 `all: false` | `vitest run --coverage`；2026-11-25 实测：语句 87.72 / 分支 87.15 / 函数 89.17 / 行 87.72（hooks 86.01/80.37/83.63/86.01，utils 89.23/91.57/92.15/89.23），全部达标 |
| 组件规模 | 顶层 **17** 个 `.tsx`（含 `OutputPanel.parts.tsx` / `OutputPanel.formatSelect.tsx` / 新增 `SeoContent.tsx`）+ `OutputPanel.derived.ts` / `InputPanel.types.ts`，`ui/` 8 个（v3.18.0 清理 4 个未被引用的孤儿组件 `Card` / `Loading` / `Switch` / `Tabs`） | `src/components/` 实测（2026-11-12 实算） |
| 源文件 >200 行 | **0** 个（v3.18.1 已将 `src/hooks/useWorkerPool.ts` 由 213 行拆分降回 200 行内；`globals.css` 已于 v3.13.6 拆为 `src/styles/*.css` 8 模块）；2026-11-13 实扫确认 | 行数扫描（2026-11-13 实算） |
| 静态门禁 | `sync-facts.mjs --check` 13 处版本展示位与 package.json(3.21.0) 全一致；`check-locales.mjs` 16 语 / 214 键一致；`check-root-clean.mjs` 根目录临时文件洁净度（`rootclean` job）；文档内链断链 0 | 2026-11-25 实跑（`sync-facts --check` / `check:locales` / `check-root-clean`）；`tsc` / `eslint` / `vitest` 同日实跑全绿 |
| 拦截域名 | **127188** 条（黑名单 127188 + 白名单 0），2026-11-25 从 `af976b8` 恢复后实算 | `node scripts/count-domains.mjs` 实跑；回退原因与恢复决策见 T-DATA-01；`origin/auto/aggregate-upstream` 上 7fac633 的 129348 条未合入主线，不采用 |

> **教训**：本文件中的数据型数字（键数 / 用例数 / 覆盖率 / 行数）历史上多次与实现脱节。修改前务必用脚本实算，禁止凭记忆书写。
> 2026-10-19 复核再次印证：键数、用例数、覆盖率三项均曾长期偏离真实值，且偏差方向不一致，说明凭旧记录继承数字必然失真。

---

## 二、待办任务（未完成，按优先级排序）

> **任务合计：11 项**（2026-11-25 15:00 复核：原 48 项＝19 项 + 审计报告迁移 29 项，已归档 4 项闭环任务至 tasks-done.md §八，另 33 项于同日二次归档至 §九，当前条目均未完成）。
> 每条均含「目标 / 责任人 / 计划完成时间（绝对日期）/ 影响范围 / 验收标准」（审计迁移项的详细问题与统一验收标准见 §六）。
> **唯一来源纪律**：任何位置的任务型表述（审计报告「修：」、优化方案 O-xx、FAQ「待评估/待验证」、源码 TODO 等）必须在本文件登记；原位置只保留证据与方案，不维护第二份状态（见 SPEC §5.3）。
> 本轮已完成的文档完善工作（文档索引 + 01/03/04/05/06/07 + OpenAPI）见 [CHANGELOG](../CHANGELOG.md) 对应版本小节，不在此重复。
> 历史 T-P0~P4 编号任务已归档至 [tasks-done.md](./tasks-done.md)。
>
> **状态重评（2026-11-25 实查）**：本轮再闭环 33 项并迁入 tasks-done.md §九，当前 11 项未完成：T-CI-01 / T-SEC-01 / T-A11Y-01 / T-PERF-01 / T-COMPAT-01 / T-AUD-M02 / T-AUD-M04 / T-AUD-M15 / T-FEAT-01 / T-AUD-L02 / T-AUD-L05。剩余项均为需外部条件（GitHub Actions 实跑、Node 24 本机环境、第三方 Action SHA、浏览器 axe 扫描/官方路由器文档核实）或较大重构（大输入内存、出站白名单、规则模块去重）的任务。

### 优先级 / 责任人 / 计划完成时间总表

| 优先级 | 编号 | 任务 | 责任人 | 计划完成 | 来源 |
|:------:|------|------|--------|----------|------|
| 🔴 P1 | T-CI-01 | 验证 CI→Deploy→Release 全绿与自动发版 | CI Owner | 2026-12-02 | 历史遗留 |
| 🟡 P2 | T-SEC-01 | 评估启用 Trusted Types / 收敛 unsafe-inline（O-08） | Dev Team | 2026-12-16 | 历史遗留 + 本轮 |
| 🟡 P2 | T-A11Y-01 | 无障碍自动化回归（axe / Playwright，O-09） | QA | 2026-12-16 | 历史遗留 + 本轮 |
| 🟡 P2 | T-PERF-01 | 大输入分片与全量 split 内存优化（O-01） | Dev Team | 2026-12-23 | 历史遗留 + 本轮 |
| 🟡 P2 | T-COMPAT-01 | Node 24 / npm 11 强约束兼容验证 | CI Owner | 2026-12-16 | 历史遗留 |
| 🟡 P2 | T-AUD-M02 | 限制出站 host 与 connect-src，防客户端请求伪造 | Dev Team | 2026-12-23 | 审计 M-02 |
| 🟡 P2 | T-AUD-M04 | 第三方 Action 固定到 commit SHA，Dependabot 推进 SHA | CI Owner | 2026-12-23 | 审计 M-04 |
| 🟡 P2 | T-AUD-M15 | 规则行 / 头部重复实现抽为框架无关共用模块 | Dev Team | 2026-12-23 | 审计 M-15 |
| ⚪ P3 | T-FEAT-01 | 扩展路由器兼容列表（O-10） | Docs Team | 2027-01-13 | 历史遗留 + 本轮 |
| ⚪ P3 | T-AUD-L02 | 聚合 fetch 加体积上限与重定向校验 | Dev Team | 2027-01-13 | 审计 L-02 |
| ⚪ P3 | T-AUD-L05 | autosave 恢复竞态检查 ref 非空并跳过空白草稿 | Dev Team | 2027-01-13 | 审计 L-05 |

### 🔴 P1 - 正确性 · 发布链路 · 安全护栏

- **T-CI-01 · 验证 CI→Deploy→Release 全绿与自动发版**（责任人：CI Owner；计划：2026-12-02）
  - 目标：确认最新版本已在 GitHub 产生 Release / tag，发布链路真实跑通。
  - 验收标准：Actions 全绿、存在对应 tag 与 Release；若红则定位（重点：setup 缓存 / npm ci 锁文件安装）。
- **T-SEC-01 · 评估 Trusted Types（O-08）**（责任人：Dev Team；计划：2026-12-16）：把首屏内联脚本改 nonce / hash，评估 `require-trusted-types-for 'script'` 对 3 处 `dangerouslySetInnerHTML` 的影响；先灰度再合入。验收：产出评估结论，灰度无违规。
- **T-A11Y-01 · 无障碍自动化回归（O-09）**（责任人：QA；计划：2026-12-16）：引入 `axe-core` + Playwright，对 `/`、`/about/` 与弹窗扫描，CI 阻断 critical 违规。验收：基线修复后 critical = 0。
- **T-PERF-01 · 大输入内存优化（O-01）**（责任人：Dev Team；计划：2026-12-23）：`parser.ts` / `sortDedupe.ts` 全量 `split` 改 `iterateLines`；`parseAggregate.ts` 分片改偏移记录、`push(...arr)` 改循环；增加 50MB 基准。验收：主线程峰值约 3× → 1×，无栈溢出。
- **T-COMPAT-01 · Node 24 / npm 11 兼容验证**（责任人：CI Owner；计划：2026-12-16）：在 Node 24 下验证 `npm ci`；与 T-BUILD-01 联动。
- **T-FEAT-01 · 扩展路由器兼容列表（O-10）**（责任人：Docs Team；计划：2027-01-13）：基于官方文档补充 OpenClash / mihomo / 华为 / 中兴的映射，不写未经证实的兼容性声明。

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

> 来源：[`docs/AUDIT-REPORT-v3.19.0.md`](./AUDIT-REPORT-v3.19.0.md)（v3.19.0 冻结快照，2026-11-18）。该报告 `:141` 明确「当前待办未含本轮深层发现」；本章将其中带「修：」建议、且未在 §二 其他任务中登记的 29 条统一迁移到本文件，使任务状态只有一个维护位置。2026-11-25 两轮复核闭环 24 条（M-11 / L-09 / L-10 及 M-02 以外全部 MEDIUM、L01/L03/L04/L06~L12）迁出，现余 5 条（M-02 / M-04 / M-15 / L-02 / L-05）。
> **原报告为历史证据快照，不再维护任务状态**；状态、责任人与完成情况只看本文件。已登记映射（不在本章重复）：H-01 → T-SEC-02、B-01 / H-05 的 `.npmrc` 部分 → T-BUILD-01（锁文件已恢复）、M-01 → T-SEC-01 / T-DOC-01、M-14 / L-08 → T-VER-01、M-16 的重复行号部分 → T-PERF-02、O-01~O-10 → 对应 T-PERF-01 / T-PERF-02 / T-DOC-01 / T-SEC-02 / T-BUILD-01 / T-PWA-01 / T-REL-01 / T-SEC-01 / T-A11Y-01 / T-FEAT-01。

### HIGH（3 项）

- **T-AUD-M02** 出站 host 仅校验协议、CSP `connect-src https:` 全放开 → 强制 https + 内置源白名单 + 自定义源显式确认。
- **T-AUD-M04** 第三方 Action 用可变 major tag → 固定 40 位 commit SHA，Dependabot 推进 SHA。
- **T-AUD-M15** 规则行 / 头部 3+2 份重复实现（运行时 + 构建脚本）→ 抽框架无关纯 TS 模块共用。

### LOW（10 项）

`T-AUD-L02` ｜ `T-AUD-L05`。详细位置与修复方向见审计报告 §五（冻结快照），本文件只维护状态。

### 统一验收标准（适用于本章全部条目）

1. 对照当前代码核实问题是否仍存在，在条目下附证据（文件:行号或实跑输出）；
2. 仍存在则按上述方向修复，补对应回归测试，并跑 `npm run lint && npx tsc --noEmit && npm run test` 全绿；
3. 若已在 v3.20 / v3.21 等后续版本修复，附提交或测试证据后在本文件标记完成并移入 [`tasks-done.md`](./tasks-done.md)，**不重复实施**。
