# 07 优化建议与未来展望

> 文档集版本：v3.22.4 · 最后审查：2026-11-26 · 适用产品版本：v3.22.4
> 来源：2026-11-25 代码 / 架构 / 性能 / 安全 / UX 全面评估 + `docs/AUDIT-REPORT-v3.19.0.md` 未闭环项。
> 每条建议统一包含：**问题背景 → 实施方案（技术选型 + 步骤）→ 预期效果（量化优先）→ 实施优先级**。
> 所有条目的执行状态与责任安排见 [任务清单](./tasks.md)；本文只描述方案，不维护任务状态。

## 目录

- [1. 建议总览](#1-建议总览)
- [2. P1 建议](#2-p1-建议)
- [3. P2 建议](#3-p2-建议)
- [4. P3 建议](#4-p3-建议)
- [5. 未来展望（非排期项）](#5-未来展望非排期项)

## 1. 建议总览

| 编号 | 领域 | 一句话问题 | 优先级 |
|------|------|-----------|:------:|
| O-01 | 性能 | 超大输入解析存在约 3× 文本内存峰值 | P1 |
| O-02 | 性能 | 行号在生成路径中被重复计算 | P2 |
| O-03 | 文档 | SPEC 仍称锁文件缺失，与实际不符 | P1 |
| O-04 | 安全 | 根目录清洁度脚本用字符串拼接执行 shell | P1 |
| O-05 | 工程 | `.npmrc` 缺失，`engine-strict` 未生效 | P1 |
| O-06 | PWA | Service Worker 文件存在但未注册 | P2 |
| O-07 | 发布 | `category-index.txt` 曾未纳入发布路径（已闭环） | P2 |
| O-08 | 安全 | 生产 CSP 含 `'unsafe-inline'`，无 Trusted Types | P2 |
| O-09 | 可访问性 | 无自动化 a11y 回归 | P2 |
| O-10 | 兼容性 | 路由器兼容列表覆盖不足 | P3 |
| O-11 | 文档工程 | 文档数字与代码事实靠人工核查，反复漂移 | P1 |
| O-12 | API 文档 | OpenAPI 离线校验仅覆盖结构，缺语义与示例校验 | P3 |
| O-13 | 架构 | 5 个源文件超过 200 行规则，历史「0 个超限」指标已失真 | P2 |

---

## 2. P1 建议

### O-01 超大输入解析的主线程内存峰值

**问题背景（2026-11-26 复核）**：`parser.ts` 已改用 `iterateLines.ts` 逐行迭代，`parseAggregate.ts` 的 `push(...arr)` 已改逐项 push，两处高风险点已闭环；**剩余** `src/utils/sortDedupe.ts` 仍以 `split('\n')` 物化完整行数组（排序算法依赖随机访问），分片仍生成 N 份 shard 字符串。20000 行 / 约 10MB 输入峰值仍可达约 2×；50MB 基准尚未实测。这与项目「大清单可用」目标存在张力。

**实施方案**：
1. 技术选型：复用已有 `countLines`（`src/utils/lineCount.ts`）的迭代思路，新增 `iterateLines(text, cb)` 零分配迭代器；不引入新依赖。
2. 把 `sortDedupe.ts` 的 `split('\n')` 改为可流式排序（外部排序 / 分块归并），需要随机访问时再局部材料化。
3. `splitIntoShards` 改为「记录字节/行偏移」而不是生成 N 份字符串，由 Worker 内部按偏移读取。
4. 已完成项保留回归测试（`iterateLines` 契约 + 130000 元素聚合），不再重复实施。
5. 增加基准测试：50MB 输入下主线程峰值分配与解析耗时，作为回归门禁。

**预期效果**：主线程峰值内存由约 3× 文本降至约 1×；50MB 输入不再因 `push(...arr)` 抛栈溢出；解析耗时保持现有水平（不回退）。

**优先级**：P1 — 直接影响大清单可用性与崩溃风险。

---

### O-03 修正 SPEC 中锁文件缺失的过时描述

**问题背景**：`docs/SPEC.md:242,461,555` 仍写「`package-lock.json` / `.npmrc` 缺失属 BLOCKER」，并指向 `docs/AUDIT-REPORT-v3.19.0.md` B-01。但提交 `a9eceb1` 已恢复 `package-lock.json`（当前工作树存在），`.npmrc` 仍未恢复（见 O-05）。文档与事实不一致会误导贡献者与 CI 排障。

**状态（2026-11-25 更新）**：✅ 已实施——`docs/SPEC.md` §7 锁文件段与 §11 已知限制均已更新为「锁文件已入库、`.npmrc` 已恢复并生效」，审计报告按冻结快照保留历史原文；下方实施方案保留作历史记录。

**实施方案**：
1. 更新 SPEC 三处描述：`package-lock.json` 已入库；`.npmrc` 缺失单列（引用 O-05）。
2. 审计报告按冻结快照约定保留历史原文，不回填。
3. 在 `scripts/sync-facts.mjs` 增加轻量校验（若未来再出现「锁文件缺失」措辞而文件存在则告警），可选。

**预期效果**：SPEC 与工作树事实一致；因「锁文件缺失」产生的误报 issue 降为 0（定性目标）。

**优先级**：P1 — 文档准确性是本次系统性完善的核心目标。

---

### O-04 根目录清洁度脚本的命令注入风险

**问题背景**：`scripts/check-root-clean.mjs` 曾使用 `cp.execSync(\`git check-ignore -q ${JSON.stringify(rel)}\`)` 拼接 shell 命令。文件名若包含 shell 元字符（如反引号、`$(...)`），在双引号内仍可能被解释。审计 `docs/AUDIT-REPORT-v3.19.0.md` H-01 已记录。

**状态（2026-11-25 更新）**：✅ 已修复——现改用 `cp.spawnSync('git', ['check-ignore', '-q', rel], …)` 参数数组传递，不经 shell；本轮同时扩展临时文件拦截范围并新增 `scripts/manage-tmp.mjs` 管理工具（规范见 [TEMP-FILES.md](./TEMP-FILES.md)）。下方实施方案保留作历史记录。

**实施方案**：
1. 技术选型：改用 `spawnSync('git', ['check-ignore', '-q', rel], { cwd: ROOT, stdio: 'ignore' })`，参数数组传递，不经 shell。
2. 保留现有门禁语义与退出码；新增一个含特殊字符的文件名 fixture 测试注入不再执行。
3. 同步检查 `scripts/` 下其他 `execSync` 字符串拼接（如有）。

**预期效果**：消除 fork PR 在 runner 上执行任意命令的路径；安全审计高危项从 1 降为 0。

**优先级**：P1 — 供应链 / CI 安全。

---

### O-05 恢复 `.npmrc` 使 Node/npm 强约束生效

**问题背景（历史）**：`package.json` 声明 `engines.node >=24.11.0 <25` 与 `engines.npm >=11`，但历史工作树曾**不存在 `.npmrc`**，`engine-strict=true` 未生效；`DEPLOYMENT.md` 与 SPEC 的描述一度偏向「已生效」。历史提交 `e102610` 删除了该文件，`a9eceb1` 只恢复了锁文件。

**状态（2026-11-25 更新）**：✅ 已实施——根目录 `.npmrc` 已恢复，仅设置 npm 支持的 `engine-strict=true`；Node 24 / npm 11 为本仓 CI 与本地开发的唯一合规组合，Node 26 下安装应失败。下方实施方案保留作历史记录。

**实施方案**：
1. 新增 `.npmrc`，内容为 `engine-strict=true`（`package-manager-strict` 是 pnpm 专属选项，npm 不适用，移除 pnpm 后无需该项）。
2. 在 Node 24 / npm 11 下分别验证 `npm ci`、Node 26 下应失败。
3. 同步修正 `DEPLOYMENT.md` 与 SPEC 的描述为「恢复后生效」。

**预期效果**：不满足 Node/npm 约束的安装 100% 在安装期失败；避免「本地能跑、CI 红」的环境漂移。

**优先级**：P1 — 可复现构建与协作门槛。

---

### O-11 文档数字与代码事实的自动化门禁

**问题背景**：2026-11-26 全量核查发现，同一事实在活跃文档中存在多套数字：测试套件 / 用例在 `CHANGELOG.md` 为 59/376、`docs/tasks.md` 为 57/364（实跑为 59/376）；版本同步展示位文档写 13 处、脚本实为 12 处；`.npmrc` 与主题入口状态在 FAQ / SPEC 中仍保留已修复前的描述。这类漂移依赖人工逐轮发现，成本高且必然复发。

**实施方案**：
1. 技术选型：不引入新依赖，扩展现有 `scripts/sync-facts.mjs --check` 或新增 `scripts/check-doc-facts.mjs`，以 Node 内置 `fs`/`child_process` 读取权威源。
2. 权威源映射：套件 / 用例数取 `vitest run --json` 输出（CI 产物），语言 / 键数取 `check-locales.mjs` 输出，域名数取 `count-domains.mjs`，展示位数取 `sync-facts.mjs` 的 `RULES.length`，文件路径 / DOM id 取源码搜索断言。
3. 在 `docs/tasks.md` 实时指标表与活跃文档中只保留由脚本生成的数字块，人工叙述不得硬编码数字。
4. 新增 CI job（可并入现有 `data` job）执行断言，失败即阻断合入；历史冻结快照按声明豁免。
5. 为文档维护者提供 `npm run check:doc-facts` 本地命令，输出「文件:行号 + 期望值 + 实际值」。

**预期效果**：活跃文档数字漂移从「每轮人工发现 3~5 处」降为 0（CI 阻断）；版本 bump 后的文档同步核查耗时下降约 50%（定性估计，以实际 PR 返工次数复测）。

**优先级**：P1 — 文档准确性是本次系统性完善的核心目标，且漂移已经反复发生。

---

## 3. P2 建议

### O-02 行号重复生成

**问题背景**：`src/hooks/useRules.ts:34` 与 `:59` 两处分别生成行号，且 `useLineNumbers` 已有 WeakMap 跳重绘缓存，重复生成仍带来额外遍历。

**实施方案**：把行号派生收敛到 `useLineNumbers` 的单一 memo 结果，通过 Context 或派生 props 传给生成路径；删除重复调用。增加断言「同一次输入行号函数仅调用一次」。

**预期效果**：大输入生成路径减少 1 次 O(n) 遍历；重复渲染时行号计算次数由 2 降为 1。

**优先级**：P2。

---

### O-13 拆分超过 200 行的源文件

**问题背景**：2026-11-26 按真实换行数实扫 `src/` 与 `scripts/`，发现 5 个超限文件：`src/components/OutputPanel.tsx`（203）、`src/hooks/useDomainData.ts`（214）、`src/hooks/useRuleWorker.ts`（208）、`src/hooks/useDomainData.autosave.test.ts`（229）、`scripts/aggregate-upstream.mjs`（202）。`docs/tasks.md` 与 `docs/SPEC.md` 中「当前 0 个超限」为 2026-11-13 的历史快照；规则要求代码文件单文件 ≤200 行，文档不拆分。

**实施方案**：
1. 按职责拆分：`OutputPanel.tsx` 抽出统计 / 格式选择派生逻辑到 `OutputPanel.derived.ts`；`useDomainData.ts` 把自动保存与远端加载编排拆为 `useDomainData.autosave.ts`；`useRuleWorker.ts` 抽出 Worker 生命周期管理；聚合脚本把上游解析与去重写入拆到 `scripts/lib/`。
2. 测试文件按关注点拆为多套，共享装置移入 `src/test-utils/`，不降低用例数（当前 376）。
3. 公开导出契约保持不变，拆分后逐一跑 `npm run lint`、`node node_modules/typescript/bin/tsc --noEmit`、`npm test` 与 `npm run build`。
4. 在 CI `data` job 增加行数扫描门禁（含 `scripts/`），超限直接失败，防止再次漂移。

**预期效果**：5 个超限文件全部降至 ≤200 行，门禁长期保持 0 超限；单文件认知负荷下降，Code Review 定位时间预计减少（定性目标，以 PR 评论往返次数复测）；测试套件数可能由 59 增至 60+，用例数不低于 376。

**优先级**：P2 — 不阻塞功能，但直接影响长期可维护性与规范可信度。

---

### O-06 启用 PWA 离线缓存

**问题背景**：`public/service-worker.js` 已实现同源缓存策略，但全仓无 `navigator.serviceWorker.register` 调用，实际离线能力未启用；README 的「PWA 离线缓存」表述与事实有落差。

**状态（2026-11-26 更新）**：✅ 已实施——`ServiceWorkerRegistrar` 在生产环境注册同源 SW（dev 跳过），下方实施方案保留作历史记录；待补离线回归实测。

**实施方案**：
1. 技术选型：保留现有 SW，不引入 Workbox（避免新增依赖与构建复杂度）。
2. 在 `layout.tsx` 客户端 effect 中按 `process.env.NODE_ENV === 'production'` 注册 `/service-worker.js`，失败静默并记录到 `logger`。
3. 增加离线回归：首次加载后断网刷新，页面外壳与规则文件可访问。
4. 明确缓存白名单（同源 + 扩展名白名单），避免缓存用户输入。

**预期效果**：生产环境离线可打开工具外壳；首次加载后重复访问静态资源请求下降（具体数值待 Lighthouse 实测）。

**优先级**：P2。

---

### O-07 将 `category-index.txt` 纳入发布路径

**问题背景（历史）**：`public/category-index.txt` 由 `.github/workflows/aggregate.yml` 生成，但发布工作流的 `add-paths` 曾未包含该文件，线上分类筛选控件可能 404 后降级隐藏。

**状态（2026-11-26 更新）**：✅ 已闭环——该文件已纳入 `aggregate.yml` 的 `add-paths`、`release.yml` 的资产 / ZIP 清单与 `ci.yml` 的硬门禁断言；下方实施方案保留作历史记录。

**实施方案**：检查 `aggregate.yml` 的 PR 路径与 `deploy.yml` 的上传清单，把 `category-index.txt` 加入；同时在 `scripts/gen-format-files.mjs` 生成清单中登记，避免遗漏。增加端点可达性断言（`GET /category-index.txt` 返回 200）。

**预期效果**：分类筛选控件 404 率降为 0；聚合结果可被线上使用。

**优先级**：P2。

---

### O-08 CSP Trusted Types 评估

**问题背景**：`next.config.js:19` 的生产 `script-src` 含 `'unsafe-inline'`，用于 `layout.tsx:37` 的首屏 lang/dir/主题内联脚本；Trusted Types 未启用。历史 `vercel.json` 曾有 `require-trusted-types-for` 但已随文件删除。

**实施方案**：
1. 把首屏内联脚本改为 nonce 或 hash（Next.js 中间件注入 nonce 更稳妥），CSP 移除 `'unsafe-inline'`。
2. 评估 `require-trusted-types-for 'script'` 对现有 3 处 `dangerouslySetInnerHTML`（均为静态 / 受控内容）的影响。
3. 先在上游（staging）灰度，确认无控制台违规后再合入。

**预期效果**：CSP 严格度提升；XSS 面收敛；若误报导致功能异常则回滚并保留评估结论。

**优先级**：P2 — 需谨慎验证，不能为合规牺牲功能。

---

### O-09 无障碍自动化回归

**问题背景**：v3.19.0 已完成 lang/dir 同步、对比度提升、`aria-live` 收敛、语义化 id 等改进，但只有单元测试与人工检查，缺少自动化门禁，改进成果易回退。

**实施方案**：技术选型可选 `axe-core` + Playwright（或 `@axe-core/playwright`）；对 `/`、`/about/` 与主要弹窗执行扫描，CI 中禁止 critical 违规。先把现有已知可访问问题修复为基线，再开启门禁。

**预期效果**：关键页面 critical 违规数 = 0；每次 PR 自动拦截回归。

**优先级**：P2。

---

## 4. P3 建议

### O-10 扩展路由器兼容列表

**问题背景**：`SPEC.md §6` 仅列 Merlin / OpenWrt / 小米 / 华硕 / TP-Link 等少数设备，而输出格式已覆盖 12 种；OpenClash / mihomo / 华为 / 中兴等用户缺乏明确格式指引。

**实施方案**：先确认各设备实际支持的语法（优先官方文档），再补充 `SPEC.md §6` 与 [05 用户指南](./05-user-guide.md) 的映射表；不扩写未经证实的兼容性声明。

**预期效果**：常见设备查询命中率提升；因格式选错导致的 issue 减少（定性目标）。

**优先级**：P3。

---

### O-12 OpenAPI 语义校验与示例覆盖增强

**问题背景**：`scripts/check-openapi.mjs` 为无依赖轻量校验，仅检查 OpenAPI 版本、版本一致性、`operationId` 唯一与本地 `$ref` 可解析；不校验 `parameters` 与路径模板匹配、`example` 与 `schema` 一致、响应 `Content-Type` 与静态文件实际类型一致。本轮虽补齐 `/category-index.txt`、403/429/5XX 响应与全部端点 `curl` 示例，后续仍可能无声漂移。

**实施方案**：
1. 短期：在现有脚本内追加规则——每个 `parameters.in: path` 名必须在路径模板中出现；每个 `$ref` 目标必须存在；`servers` 与 `docs/04-api.md` 示例域名一致。
2. 中期：CI 可选引入 `redocly lint docs/openapi.yaml`（作为独立 job，离线缓存依赖），启用 `operation-operationId` / `no-unused-components` / `spec` 规则集。
3. 增加契约冒烟测试：对 `paths` 中每个真实端点发本地请求，断言状态码 200 且 `Content-Type` 与规范一致（页面、元数据与静态规则文件）。
4. 示例统一由 `docs/04-api.md` 维护，`openapi.yaml` 的 `example` 通过脚本核对，禁止两处手写不同域名。

**预期效果**：OpenAPI 语义缺陷检出从 0 提升到覆盖 path 参数 / $ref / 示例一致性三类；端点契约回归可在 CI 首次失败时拦截，避免线上 404 类问题。

**优先级**：P3 — 当前轻量校验已满足基本合规，语义增强可在发布链路稳定后实施。

---

## 5. 未来展望（非排期项）

- **规则质量闭环**：建立上游域名变更的自动回归集，聚合 PR 合并前验证「白名单不被误拦截、改道目标合法」。
- **可视化规则诊断**：把规则测试器扩展为批量命中分析，输出被拦截 / 放行 / 改道的分布。
- **导出模板市场**：允许用户保存常用的 IP、头部注释与格式组合为模板（仅本地存储）。
- **国际化覆盖度**：16 语已完备，后续可评估小语种与 RTL 文案的本地化质量，而非仅键数一致。

以上展望不纳入当前任务清单；若决定实施，先在 [任务清单](./tasks.md) 登记编号、责任人与计划时间。
