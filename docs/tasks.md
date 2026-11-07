# 项目任务清单（未完成任务唯一来源 + 实时指标）

> **本文件是项目「未完成任务」与「实时指标」的唯一来源（Single Source of Truth）**。
> 已完成任务条目、历轮变更详情与开发进度全景已归档至 [tasks-done.md](./tasks-done.md)（含全部 T-P0/P1/P2/P3/P4 结构化任务、专项整改、验收标准与诊断证据、完成度快照），本文件不再重复维护已完成条目与历史叙述，避免两处口径漂移。
> 规则固化见 [SPEC.md §5.4 任务记录规范](./SPEC.md)。

> 最后审查：2026-11-06（与 package.json v3.15.6 对齐；待办区清零，历史叙述与进度全景已迁移至 tasks-done.md；全项目文档完成一次实算核查与勘误）
> 维护团队：Sut / ArcesTeam
>
> **本次更新（2026-11-06 全项目文档核查）**：以代码实况为权威源，实算并统一全部活跃文档——核查基线 v3.15.0（收尾发布 v3.15.1）/ 12 格式 / 16 语 146 顶层键 215 递归键 / 47 测试套件 / `src` 无 >200 行源文件 / `public/domains.txt` 非空 882 行（15 注释 + 规则 867 条 = 黑名单 635 + 白名单 232）。修正项：端口 8082 → 3000（README / DEPLOYMENT / config.yaml）、失效链接（README×2 品牌图、README.en 全部 raw 下载链接、SUPPORT 相对链接）、路径与命令（CONTRIBUTING 域名源、SUPPORT 生成命令与白名单语法、CHECKLIST ui PascalCase、PR 模板失效引用）、SPEC 结构树与 §5.3 任务记录规范、config.yaml 格式清单、README.en 格式图（9 列 → 显式 12 格式）、CHANGELOG 勘误段收编为 `[3.15.1]` 发布说明。冻结快照（CHANGELOG 历史段 / prototype / public/brand-colors.md / STRUCTURE-REVIEW.md / tasks-done.md 历史实测值）按各自声明未改。**注**：本机无 `node_modules`，`vitest` / `lint` 未能实跑；下表 282 用例与覆盖率为 2026-11-05 实测值，按「数字必须实算」纪律沿用并注明，未凭静态计数臆改。
>
> **本次更新（2026-11-06 第十三轮：任务文档彻底精简）**。按用户指令「tasks.md 仅保存未完成任务清单，已完成任务与历史叙述迁移至 tasks-done.md」执行：
> ① **待办区状态**：「未完成任务合计：0 项」（自 2026-11-05 第十二轮后维持）；所有 T-P0-01~04/02a、T-P1-01~17、T-P2-01~13、T-P3-01~05、T-P4-01 均已完成并归档；
> ② **迁移历史叙述**：移除顶部第十二轮及更早的各轮「本次更新」冗长历史块，改为指向 [tasks-done.md](./tasks-done.md) 的指针，避免两处重复维护；
> ③ **迁移开发进度全景**：原「二、开发进度全景」完成度表整体迁入 [tasks-done.md](./tasks-done.md) 第七章，使本文件仅聚焦未完成清单；
> ④ **保留**：实时指标表、待办区（0 项）、日常 / 定期 / 版本发布维护清单；
> ⑤ **剩余任务**：编号任务清单已清零，无编号任务可推进；`Web Worker 分片并行化（多核并行求值）`仍为后续增强项（非阻断，不计入清单）。

---

## 一、实时指标

| 指标 | 实测值 | 取得方式 |
|---|---|---|
| 应用版本 | v3.15.6 | `package.json` version（权威源） |
| 输出格式数 | 12 种 | `src/types/formats.ts` 的 `ALL_FORMATS` |
| i18n 语言 / 键数 | 16 种 / 顶层 **140** 键、递归合计 **209** 键 | 脚本统计 `src/locales/zh-cn.json`（flatten 叶子口径，与 `check:locales` 输出及 `scripts/locale-baseline.json` keyCount 一致；v3.15.5 移除 `moreFormats` 死键，2026-11-07 实算） |
| 测试套件 / 用例 | **47 套件 / 282 用例**（全通过） | `vitest run`（权威计数，2026-11-05 第十二轮实测；由 27 / 250 增至 47 / 282） |
| 覆盖率门禁 | 已生效且为真实值；含 `src/utils` + `src/hooks`，门槛 **语句 80 / 分支 75 / 函数 85 / 行 80**；`vitest.config.ts` 显式声明 `all: false` | `vitest run --coverage`；2026-11-05 第十二轮实测：语句 88.85 / 分支 85.45 / 函数 91.74 / 行 88.85，全部达标且有余量；曾以「临时抬阈至 99 → EXIT CODE 1」反证门禁真实生效 |
| 组件规模 | 顶层 **15** 个 `.tsx`（含 `OutputPanel.parts.tsx`）+ `OutputPanel.derived.ts` / `InputPanel.types.ts`，`ui/` 12 个 | `src/components/` 实测（2026-11-06 实算，v3.15.0 后由 14 修正为 15） |
| 源文件 >200 行 | `ts/tsx/css` **0** 个（含测试文件）；`globals.css` 已于 v3.13.6 拆为 `src/styles/*.css` 7 模块 | 行数扫描 |
| 静态门禁 | `tsc --noEmit` 零错误；`next lint` **0 warning 0 error**；`sync-facts.mjs` 13 处版本展示位与 package.json 全一致 | 2026-10-19 实跑 |

> **教训**：本文件中的数据型数字（键数 / 用例数 / 覆盖率 / 行数）历史上多次与实现脱节。修改前务必用脚本实算，禁止凭记忆书写。
> 2026-10-19 复核再次印证：键数、用例数、覆盖率三项均曾长期偏离真实值，且偏差方向不一致，说明凭旧记录继承数字必然失真。

---

## 二、待办任务（未完成，按优先级划分）

> **未完成任务合计：0 项**。所有 T-P0/P1/P2/P3/P4 编号任务均已完成并归档至 [tasks-done.md](./tasks-done.md)；Web Worker 分片并行化（多核并行求值）为后续增强项（非阻断，不计入任务清单）。历史任务明细（含验收标准与状态追踪）见 [tasks-done.md](./tasks-done.md) 第四章；应用问题诊断证据见该文件第六章。

### 🔴 P0 - 核心工程与质量门禁
> 当前无未完成的 P0 任务。T-P0-01 / 02 / 03 / 04 与 T-P0-02a 全部完成并归档（详见 [tasks-done.md](./tasks-done.md)）。

### 🟡 P1 - 性能优化与大数据集体验
> 当前无未完成的 P1 任务。T-P1-01 ~ T-P1-17 全部完成并归档至 [tasks-done.md](./tasks-done.md)。

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
- [ ] 页脚版本号/build 编号展示正确（`Footer.tsx` 输出 `V{version}· build{yymmddhhmm}`，2 位年，规范见 SPEC §8.1）
- [ ] 更新 `CHANGELOG.md` 变更记录（新增 `## [x.y.z]` 小节，分类 feat/fix/docs/...）
- [ ] 创建 GitHub Release（含 tag `vX.Y.Z` 与 release 锚点）
