# 项目任务清单（未完成任务唯一来源 + 实时指标）

> **本文件是项目「未完成任务」与「实时指标」的唯一来源（Single Source of Truth）**。
> 已完成任务条目、历轮变更详情与开发进度全景已归档至 [tasks-done.md](./tasks-done.md)（含全部 T-P0/P1/P2/P3/P4 结构化任务、专项整改、验收标准与诊断证据、完成度快照），本文件不再重复维护已完成条目与历史叙述，避免两处口径漂移。
> 规则固化见 [SPEC.md §5.3 任务记录规范](./SPEC.md)。

> 最后审查：2026-11-25（与 package.json v3.21.0 对齐；第二十一轮：建立文档中心与 01/03/04/05/06/07 六大模块文档、OpenAPI 3.1 定义，任务清单补齐责任人与计划完成时间并重排为 18 项；第二十轮：域名计数实算 127188、i18n 键数校正（当前 213）；第十九轮审计 11 项已并入第二节）
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
| 应用版本 | v3.21.0 | `package.json` version（权威源） |
| 输出格式数 | 12 种 | `src/types/formats.ts` 的 `ALL_FORMATS` |
| i18n 语言 / 键数 | 16 种 / 递归合计 **213** 键（`check:locales` 与 `scripts/locale-baseline.json` keyCount 口径） | `node scripts/check-locales.mjs` 2026-11-25 实跑输出「213 键」；早期记录的 209 / 212 键已过时，禁止沿用旧值 |
| 测试套件 / 用例 | **51 套件 / 335 用例**（2026-11-25 `vitest run` 实跑全绿；较 2026-11-13 的 326 例增加 9 例，系 v3.20.x 诊断修复补测） | `vitest run` 为权威计数，本轮已实跑复核 |
| 覆盖率门禁 | 已生效且为真实值；含 `src/utils` + `src/hooks`，门槛 **语句 80 / 分支 75 / 函数 85 / 行 80**；`vitest.config.ts` 显式声明 `all: false` | `vitest run --coverage`；2026-11-25 实测：语句 87.91 / 分支 87.26 / 函数 90.78 / 行 87.91，全部达标且有余量；曾以「临时抬阈至 99 → EXIT CODE 1」反证门禁真实生效 |
| 组件规模 | 顶层 **17** 个 `.tsx`（含 `OutputPanel.parts.tsx` / `OutputPanel.formatSelect.tsx` / 新增 `SeoContent.tsx`）+ `OutputPanel.derived.ts` / `InputPanel.types.ts`，`ui/` 8 个（v3.18.0 清理 4 个未被引用的孤儿组件 `Card` / `Loading` / `Switch` / `Tabs`） | `src/components/` 实测（2026-11-12 实算） |
| 源文件 >200 行 | **0** 个（v3.18.1 已将 `src/hooks/useWorkerPool.ts` 由 213 行拆分降回 200 行内；`globals.css` 已于 v3.13.6 拆为 `src/styles/*.css` 8 模块）；2026-11-13 实扫确认 | 行数扫描（2026-11-13 实算） |
| 静态门禁 | `sync-facts.mjs --check` 13 处版本展示位与 package.json(3.21.0) 全一致；`check-locales.mjs` 16 语 / 213 键一致；`check-root-clean.mjs` 根目录临时文件洁净度（`rootclean` job）；文档内链断链 0 | 2026-11-25 实跑（`sync-facts --check` / `check:locales` / `check-root-clean`）；`tsc` / `eslint` / `vitest` 同日实跑全绿 |
| 拦截域名 | **127188** 条（黑名单 127188 + 白名单 0） | `node scripts/count-domains.mjs` 2026-11-22 实跑；2026-11-21 合并 `auto/aggregate-upstream` 后由 877 条变为 127188 条，纯域名形态、无注释/白名单/改道行 |

> **教训**：本文件中的数据型数字（键数 / 用例数 / 覆盖率 / 行数）历史上多次与实现脱节。修改前务必用脚本实算，禁止凭记忆书写。
> 2026-10-19 复核再次印证：键数、用例数、覆盖率三项均曾长期偏离真实值，且偏差方向不一致，说明凭旧记录继承数字必然失真。

---

## 二、待办任务（未完成，按优先级排序）

> **未完成任务合计：18 项**（2026-11-25 第二十一轮文档体系完善后重排）。
> 每条均含「目标 / 责任人 / 计划完成时间（绝对日期）/ 影响范围 / 验收标准」。
> 本轮已完成的文档完善工作（文档索引 + 01/03/04/05/06/07 + OpenAPI）见 [CHANGELOG](../CHANGELOG.md) 对应版本小节，不在此重复。
> 历史 T-P0~P4 编号任务已归档至 [tasks-done.md](./tasks-done.md)。

### 优先级 / 责任人 / 计划完成时间总表

| 优先级 | 编号 | 任务 | 责任人 | 计划完成 | 来源 |
|:------:|------|------|--------|----------|------|
| 🔴 P1 | T-DOC-01 | 修正 SPEC 锁文件 / CSP 过时描述 | Docs Team | 2026-12-02 | 审计 O-03 |
| 🔴 P1 | T-DOC-02 | CHANGELOG 补记内存 5GB 根因修复 | Docs Team | 2026-12-02 | 历史遗留 |
| 🔴 P1 | T-TEST-01 | 内存根因端到端回归（loadDomainData 单飞） | QA / Dev Team | 2026-12-02 | 历史遗留 |
| 🔴 P1 | T-CI-01 | 验证 CI→Deploy→Release 全绿与自动发版 | CI Owner | 2026-12-02 | 历史遗留 |
| 🔴 P1 | T-SEC-02 | 修复根目录清洁脚本 shell 注入（O-04） | Dev Team | 2026-12-02 | 审计 H-01 |
| 🔴 P1 | T-BUILD-01 | 恢复 .npmrc 使 engine-strict 生效（O-05） | CI Owner | 2026-12-02 | 本轮文档核查 |
| 🟡 P2 | T-VER-01 | 消除 next.config.js 硬编码版本 | Dev Team | 2026-12-16 | 历史遗留 |
| 🟡 P2 | T-VERIFY-01 | OpenAPI 3.1 定义规范校验（待验证技术细节） | Docs Team | 2026-12-16 | 本轮新增 |
| 🟡 P2 | T-SEC-01 | 评估启用 Trusted Types / 收敛 unsafe-inline（O-08） | Dev Team | 2026-12-16 | 历史遗留 + 本轮 |
| 🟡 P2 | T-A11Y-01 | 无障碍自动化回归（axe / Playwright，O-09） | QA | 2026-12-16 | 历史遗留 + 本轮 |
| 🟡 P2 | T-PERF-01 | 大输入分片与全量 split 内存优化（O-01） | Dev Team | 2026-12-23 | 历史遗留 + 本轮 |
| 🟡 P2 | T-PERF-02 | 行号重复生成收敛到单一派生（O-02） | Dev Team | 2026-12-16 | 本轮新增 |
| 🟡 P2 | T-COMPAT-01 | Node 24 / pnpm 11 强约束兼容验证 | CI Owner | 2026-12-16 | 历史遗留 |
| 🟡 P2 | T-PWA-01 | 评估并启用 Service Worker 注册（O-06） | Dev Team | 2026-12-23 | 本轮文档核查 |
| 🟡 P2 | T-REL-01 | category-index.txt 纳入发布路径（O-07） | Release Owner | 2026-12-23 | 本轮文档核查 |
| ⚪ P3 | T-FEAT-01 | 扩展路由器兼容列表（O-10） | Docs Team | 2027-01-13 | 历史遗留 + 本轮 |
| ⚪ P3 | T-VER-02 | 修正 layout.tsx「React 19」注释漂移 | Dev Team | 2027-01-13 | 本轮代码评估 |
| ⚪ P4 | T-SEO-01 | sitemap / robots 多语言 hreflang | SEO Owner | 2027-02-10 | 历史遗留 |

### 🔴 P1 - 正确性 · 发布链路 · 安全护栏

- **T-DOC-01 · 修正 SPEC 锁文件 / CSP 过时描述**（责任人：Docs Team；计划：2026-12-02）
  - 目标：`docs/SPEC.md:242,461,555` 仍写「`pnpm-lock.yaml` / `.npmrc` 缺失属 BLOCKER」，但锁文件已由 `a9eceb1` 恢复；`.npmrc` 仍缺失应单列并指向 T-BUILD-01。§11 双源 CSP 描述亦需与 `next.config.js` 单一来源对齐。
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
  - 验收标准：Actions 全绿、存在对应 tag 与 Release；若红则定位（重点：setup 缓存 / pnpm 11 frozen-lockfile）。
- **T-SEC-02 · 修复根目录清洁脚本 shell 注入**（责任人：Dev Team；计划：2026-12-02）
  - 目标：`scripts/check-root-clean.mjs:41` 的 `cp.execSync(`git check-ignore ...`)` 改为 `spawnSync` 参数数组；排查其他 `execSync` 拼接。
  - 验收标准：含 shell 元字符的文件名 fixture 不再执行命令；审计 H-01 闭环。
- **T-BUILD-01 · 恢复 `.npmrc`**（责任人：CI Owner；计划：2026-12-02）
  - 目标：恢复 `engine-strict=true` / `package-manager-strict=true`，使 `engines.node >=24.11.0 <25` 与 `pnpm@11.24.0` 真正生效。
  - 验收标准：Node 24 / pnpm 11 下 `pnpm install --frozen-lockfile` 通过；不满足约束时安装期失败；DEPLOYMENT 与 SPEC 描述同步。

### 🟡 P2 - 代码质量 · 文档 · 性能 · 兼容性增强

- **T-VER-01 · 消除 next.config.js 硬编码版本**（责任人：Dev Team；计划：2026-12-16）：改为构建期读取 `package.json` 或纳入 `sync-facts --check`；`pnpm version` 后门禁可检出漂移。
- **T-VERIFY-01 · OpenAPI 3.1 定义规范校验**（责任人：Docs Team；计划：2026-12-16）：本轮新增 `docs/openapi.yaml` 尚未跑规范校验器；用 `@redocly/cli lint` 或等价工具校验并修复告警，把校验加入 CI。验收：lint 0 error，CI 增对应 job。
- **T-SEC-01 · 评估 Trusted Types（O-08）**（责任人：Dev Team；计划：2026-12-16）：把首屏内联脚本改 nonce / hash，评估 `require-trusted-types-for 'script'` 对 3 处 `dangerouslySetInnerHTML` 的影响；先灰度再合入。验收：产出评估结论，灰度无违规。
- **T-A11Y-01 · 无障碍自动化回归（O-09）**（责任人：QA；计划：2026-12-16）：引入 `axe-core` + Playwright，对 `/`、`/about/` 与弹窗扫描，CI 阻断 critical 违规。验收：基线修复后 critical = 0。
- **T-PERF-01 · 大输入内存优化（O-01）**（责任人：Dev Team；计划：2026-12-23）：`parser.ts` / `sortDedupe.ts` 全量 `split` 改 `iterateLines`；`parseAggregate.ts` 分片改偏移记录、`push(...arr)` 改循环；增加 50MB 基准。验收：主线程峰值约 3× → 1×，无栈溢出。
- **T-PERF-02 · 行号重复生成（O-02）**（责任人：Dev Team；计划：2026-12-16）：收敛 `useRules.ts:34,59` 到 `useLineNumbers` 单一派生。验收：同输入行号函数仅调用一次。
- **T-COMPAT-01 · Node 24 / pnpm 11 兼容验证**（责任人：CI Owner；计划：2026-12-16）：在 Node 24 下验证 `frozen-lockfile`；与 T-BUILD-01 联动。
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
- [ ] 启动开发服务器：`pnpm dev`（端口 3000，由 `package.json` 的 `next dev -p 3000 -H 0.0.0.0` 固定）
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
- [ ] 运行构建确保功能正常（`pnpm build`）

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
