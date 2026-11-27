# 项目任务清单（未完成任务唯一来源 + 实时指标）

> **本文件是项目「未完成任务」与「实时指标」的唯一来源（Single Source of Truth）**。
> 已完成任务条目、历轮变更详情与开发进度全景已归档至 [tasks-done.md](./tasks-done.md)（含全部 T-P0/P1/P2/P3/P4 结构化任务、专项整改、验收标准与诊断证据、完成度快照），本文件不再重复维护已完成条目与历史叙述，避免两处口径漂移。
> 规则固化见 [SPEC.md §5.3 任务记录规范](./SPEC.md)。
> **本次同步时间戳：2026-11-27T09:09:31+08:00**。迁移核查结果：T-CI-01 已完成并归档至 `tasks-done.md`；本文件未完成任务归零，仅保留实时指标与日常维护清单。两份文档均已标注本次更新时间戳。

> 最后审查：2026-11-27（与 package.json v3.22.4 对齐；**第二十八轮 2026-11-26 发版链路闭环**：CI / Deploy / Release 全绿，v3.22.4 tag 与 Release（14 资产）已生成，T-CI-01 归档；**第二十七轮 2026-11-26 发版链路取证与修复**：定位 CI 三项失败、Deploy「假成功」与 Release 事件判定缺陷并落地修复；**第二十六轮 2026-11-26 任务治理与门禁收口**：修复出站 host 白名单引入的 7 个遗留测试失败（全量 61 套件 / 381 用例全绿），扩展路由器兼容映射（三级分级 + 产品边界），新增 axe + Playwright 无障碍门禁，版本三源与 11 个产物统一至 v3.22.4；**第二十五轮**文档系统性标准化、OpenAPI 语义校验与 `/category-index.txt` 端点、任务台账集中化；**第二十四轮**全量文档核查；**第二十三轮**任务闭环专项；历史轮次摘要见 [tasks-done.md](./tasks-done.md)）
> 维护团队：Sut / ArcesTeam

> **遗留疑问 / 审计结论**（2026-11-13 第十九轮）：
> - ~~`vercel.json` 双源 CSP 差异~~：**已解决**——`vercel.json` 文件已删除，安全响应头现为 `next.config.js` 单一来源（见 §11 与 T-DOC-01）；是否启用 `require-trusted-types-for` 转为安全增强评估项（T-SEC-01，评估已闭环）。
> - `NEXT_PUBLIC_APP_VERSION` 环境变量：已在 v3.18.1 从代码/文档移除（DEPLOYMENT.md 改为 `APP_VERSION` 单一来源），不属遗留项。
> - 第十九轮审计新增 11 项待办已全部闭环并归档，见 [tasks-done.md](./tasks-done.md)。

---

## 一、实时指标

| 指标 | 实测值 | 取得方式 |
|---|---|---|
| 应用版本 | v3.22.4 | `package.json` version（权威源），2026-11-26 三源同步 |
| 输出格式数 | 12 种 | `src/types/formats.ts` 的 `ALL_FORMATS` |
| i18n 语言 / 键数 | 16 种 / 递归合计 **214** 键（`check:locales` 与 `scripts/locale-baseline.json` keyCount 口径） | `node scripts/check-locales.mjs` 实跑「214 键」；早期 209 / 212 / 213 已过时 |
| 测试套件 / 用例 | **61 套件 / 381 用例**（2026-11-26 `vitest run --reporter=json` 实跑全绿，381/381） | `vitest run` 为权威计数，由 `scripts/check-doc-facts.mjs` 从 JSON 报告自动读取；59/376、57/364、54/349 为历史快照 |
| 覆盖率门禁 | 已生效且为真实值；含 `src/utils` + `src/hooks`，全局门槛 **语句 80 / 分支 75 / 函数 85 / 行 80**，并按 glob 加设 hooks 80/75/80/80、utils 85/85/85/85；`vitest.config.ts` 显式声明 `all: false` | `vitest run --coverage`；2026-11-25 实测：语句 87.72 / 分支 87.15 / 函数 89.17 / 行 87.72（hooks 86.01/80.37/83.63/86.01，utils 89.23/91.57/92.15/89.23），全部达标 |
| 组件规模 | 顶层 **17** 个 `.tsx`（含 `OutputPanel.parts.tsx` / `OutputPanel.formatSelect.tsx` / `SeoContent.tsx`）+ `OutputPanel.derived.ts` / `InputPanel.types.ts`，`ui/` 8 个 | `src/components/` 实测；v3.18.0 已清理 4 个孤儿组件 |
| 源文件 >200 行 | **0 个**（2026-11-26 按真实换行数实扫 `src/` + `scripts/`） | `scripts/check-doc-facts.mjs` 权威指标；T-REFACTOR-01 已拆分全部超行文件 |
| 静态门禁 | `sync-facts.mjs --check` **12 处**版本展示位与 package.json(3.22.4) 全一致；`check-locales.mjs` 16 语 / 214 递归键一致；`check-openapi.mjs` 7 路径 / 7 操作通过；`check-root-clean.mjs` 根目录洁净；`check:doc-facts` 数字一致；`tsc --noEmit` / `npm run lint` 全绿 | 2026-11-26 实跑 |
| 无障碍门禁 | `npm run check:a11y` 已接入 CI build job：`e2e/a11y.spec.ts` 用 axe-core 扫描首页 / 关于页 / 设置弹窗 / 路由器脚本弹窗，阻断 critical 违规 | CI run 45852491146 实跑 4/4 通过；本机用 Chrome channel 复验 4/4 通过 |
| 拦截域名 | **127188** 条（黑名单 127188 + 白名单 0），2026-11-25 从 `af976b8` 恢复后实算 | `node scripts/count-domains.mjs` 实跑；回退原因与恢复决策见 T-DATA-01；`origin/auto/aggregate-upstream` 上 7fac633 的 129348 条未合入主线，不采用 |

> **教训**：本文件中的数据型数字（键数 / 用例数 / 覆盖率 / 行数）历史上多次与实现脱节。修改前务必用脚本实算，禁止凭记忆书写。
> 2026-10-19 复核再次印证：键数、用例数、覆盖率三项均曾长期偏离真实值，且偏差方向不一致，说明凭旧记录继承数字必然失真。

---

## 二、待办任务（未完成，按优先级排序）

> **任务合计：0 项**（2026-11-27 任务治理：T-CI-01 已完成并归档，此前 T-SEC-01 / T-DOC-03 / T-COMPAT-01 / T-PERF-01 / T-AUD-M02 / T-DOC-04 / T-REFACTOR-01 / T-AUD-M15 / T-FEAT-01 / T-A11Y-01 均已归档；本文件仅保留实时指标与日常维护清单）。
> 若后续新增任务，每条仍须含「目标 / 责任人 / 计划完成时间（绝对日期）/ 影响范围 / 验收标准」。
> **唯一来源纪律**：任何位置的任务型表述（审计报告「修：」、优化方案 O-xx、FAQ「待评估/待验证」、源码 TODO 等）必须在本文件登记；原位置只保留证据与方案，不维护第二份状态（见 SPEC §5.3）。

> **状态重评（2026-11-27T09:09:31+08:00）**：全部已登记任务均已完成并归档，本文件无未完成任务；发布链路已实测闭环（CI / Deploy / Release 全绿，`v3.22.4` tag 与 Release 已生成）。

> **当前无未完成任务**；T-CI-01 的完整取证链与闭环实证已归档至 [`tasks-done.md`](./tasks-done.md)。

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

> 来源：[`docs/AUDIT-REPORT-v3.19.0.md`](./AUDIT-REPORT-v3.19.0.md)（v3.19.0 冻结快照，2026-11-18）。该报告 `:141` 明确「当前待办未含本轮深层发现」；本章将其中带「修：」建议的 29 条统一迁移到本文件，使任务状态只有一个维护位置。**29 条现已全部闭环并归档至 [tasks-done.md](./tasks-done.md)**（含 HIGH 全部条目与 LOW 全部条目）；原报告为历史证据快照，不再维护任务状态，状态与完成情况只看 `tasks-done.md`。
> 已登记映射（不在本章重复）：H-01 → T-SEC-02、B-01 / H-05 的 `.npmrc` 部分 → T-BUILD-01、M-01 → T-SEC-01 / T-DOC-01、M-14 / L-08 → T-VER-01、M-16 的重复行号部分 → T-PERF-02、M-02 → T-AUD-M02、M-15 → T-AUD-M15、O-01~O-10 → 对应优化任务。

### HIGH（0 项）

审计报告 HIGH 类条目已全部闭环（T-SEC-02 / T-AUD-H02~H04 / T-AUD-M02 / T-AUD-M15 等，见 `tasks-done.md`）。

### LOW（0 项）

审计报告 LOW 类条目已全部闭环（见 `tasks-done.md` §十）。

### 统一验收标准（适用于已归档条目）

1. 对照当前代码核实问题是否仍存在，在条目下附证据（文件:行号或实跑输出）；
2. 仍存在则按上述方向修复，补对应回归测试，并跑 `npm run lint && npx tsc --noEmit && npm run test` 全绿；
3. 若已在后续版本修复，附提交或测试证据后移入 [`tasks-done.md`](./tasks-done.md)，**不重复实施**。
