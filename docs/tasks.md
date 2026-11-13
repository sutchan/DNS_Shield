# 项目任务清单（未完成任务唯一来源 + 实时指标）

> **本文件是项目「未完成任务」与「实时指标」的唯一来源（Single Source of Truth）**。
> 已完成任务条目、历轮变更详情与开发进度全景已归档至 [tasks-done.md](./tasks-done.md)（含全部 T-P0/P1/P2/P3/P4 结构化任务、专项整改、验收标准与诊断证据、完成度快照），本文件不再重复维护已完成条目与历史叙述，避免两处口径漂移。
> 规则固化见 [SPEC.md §5.3 任务记录规范](./SPEC.md)。

> 最后审查：2026-11-13（与 package.json v3.18.1 对齐；待办区保持清零）。
> 维护团队：Sut / ArcesTeam
>
> **本轮整理（2026-11-13）**：依 SPEC §5.3 任务记录规范，将第十四~十八轮冗长的「本次更新」历史叙述统一归档至 [tasks-done.md](./tasks-done.md)，本文件仅保留未完成清单、实时指标、遗留疑问与维护清单；版本与指标经实算与代码实况对齐（v3.18.1 / 12 格式 / 16 语 140·209 键 / 51 套件 324 用例 / 17 组件 / >200 行源文件 1 个）。
>
> **遗留疑问**（从第十六/十八轮收敛，待拍板）：
> - `vercel.json` 的 CSP 含 `require-trusted-types-for 'script'` 而 `next.config.js` 不含，统一方案仍待定（当前状态见 SPEC §12.1）。

---

## 一、实时指标

| 指标 | 实测值 | 取得方式 |
|---|---|---|
| 应用版本 | v3.18.1 | `package.json` version（权威源） |
| 输出格式数 | 12 种 | `src/types/formats.ts` 的 `ALL_FORMATS` |
| i18n 语言 / 键数 | 16 种 / 顶层 **140** 键、递归合计 **209** 键 | 脚本统计 `src/locales/zh-cn.json`（flatten 叶子口径，与 `check:locales` 输出及 `scripts/locale-baseline.json` keyCount 一致；v3.15.5 移除 `moreFormats` 死键，2026-11-07 实算） |
| 测试套件 / 用例 | **51 套件 / 324 用例**（2026-11-13 `vitest run` 实跑：51 个 `*.test.ts` 文件全部通过；v3.18.1 新增 `workerPoolFinalize.test.ts` / `useAsyncRuleProcessing.fallback.test.ts` 2 套件 7 用例，`useLanguage.test.ts` 追加 4 用例） | `vitest run` 为权威计数，本轮已实跑复核 |
| 覆盖率门禁 | 已生效且为真实值；含 `src/utils` + `src/hooks`，门槛 **语句 80 / 分支 75 / 函数 85 / 行 80**；`vitest.config.ts` 显式声明 `all: false` | `vitest run --coverage`；2026-11-13 实测：语句 88.01 / 分支 86.18 / 函数 89.55 / 行 88.01，全部达标且有余量；2026-11-05 第十二轮实测为 88.85 / 85.45 / 91.74 / 88.85；曾以「临时抬阈至 99 → EXIT CODE 1」反证门禁真实生效 |
| 组件规模 | 顶层 **17** 个 `.tsx`（含 `OutputPanel.parts.tsx` / `OutputPanel.formatSelect.tsx` / 新增 `SeoContent.tsx`）+ `OutputPanel.derived.ts` / `InputPanel.types.ts`，`ui/` 8 个（v3.18.0 清理 4 个未被引用的孤儿组件 `Card` / `Loading` / `Switch` / `Tabs`） | `src/components/` 实测（2026-11-12 实算） |
| 源文件 >200 行 | `ts/tsx/css` **1** 个：`src/hooks/useWorkerPool.ts`（并行会话 v3.17.4 引入，待拆分）；`globals.css` 已于 v3.13.6 拆为 `src/styles/*.css` 8 模块（v3.18.0 新增 `seo.css`） | 行数扫描（2026-11-12 实算） |
| 静态门禁 | `sync-facts.mjs --check` 13 处版本展示位与 package.json 全一致；`check-locales.mjs` 16 语 / 209 键一致；`check-root-clean.mjs` 根目录临时文件洁净度（`rootclean` job） | 2026-11-12 实跑（`sync-facts --check` / `check:locales`）；本机已安装 `node_modules`，`tsc` / `next lint` / `vitest` 待实跑复核 |

> **教训**：本文件中的数据型数字（键数 / 用例数 / 覆盖率 / 行数）历史上多次与实现脱节。修改前务必用脚本实算，禁止凭记忆书写。
> 2026-10-19 复核再次印证：键数、用例数、覆盖率三项均曾长期偏离真实值，且偏差方向不一致，说明凭旧记录继承数字必然失真。

---

## 二、待办任务（未完成，按优先级划分）

> **未完成任务合计：0 项**（2026-11-07 第十四轮复核）。全部 T-P0/P1/P2/P3/P4 编号任务（含 v3.16.0 落地的 T-P1-18「Web Worker 分片并行化」）均已完成并归档至 [tasks-done.md](./tasks-done.md)，无剩余可推进任务。历史任务明细（含验收标准与状态追踪）见 [tasks-done.md](./tasks-done.md) 第四章；应用问题诊断证据见该文件第六章。

### 🔴 P0 - 核心工程与质量门禁
> 当前无未完成的 P0 任务。T-P0-01 / 02 / 03 / 04 与 T-P0-02a 全部完成并归档（详见 [tasks-done.md](./tasks-done.md)）。

### 🟡 P1 - 性能优化与大数据集体验
> 当前无未完成的 P1 任务。T-P1-01 ~ T-P1-18（含 v3.16.0 的 T-P1-18「Web Worker 分片并行化：多核并行求值」）全部完成并归档至 [tasks-done.md](./tasks-done.md)。

### 🟢 P2 - 规则引擎与国际化完善
> 当前无未完成的 P2 任务（T-P2-07 / T-P2-08 / T-P2-09 / T-P2-11 已于 2026-11-05 第十二轮完成并归档至 [tasks-done.md](./tasks-done.md)）。

### ⚪ P3 / ⚙️ P4
> 当前无未完成的 P3 / P4 任务，全部条目已完成并归档至 [tasks-done.md](./tasks-done.md)。

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
