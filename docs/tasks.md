# 项目任务清单（未完成任务唯一来源 + 实时指标）

> **本文件是项目「未完成任务」与「实时指标」的唯一来源（Single Source of Truth）**。
> 已完成任务条目、历轮变更详情与开发进度全景已归档至 [tasks-done.md](./tasks-done.md)（含全部 T-P0/P1/P2/P3/P4 结构化任务、专项整改、验收标准与诊断证据、完成度快照），本文件不再重复维护已完成条目与历史叙述，避免两处口径漂移。
> 规则固化见 [SPEC.md §5.3 任务记录规范](./SPEC.md)。

> 最后审查：2026-11-12（与 package.json v3.18.0 对齐；待办区保持清零；2026-11-12 第十八轮全量文档核查：实时指标按实算更新、活跃文档统一审查锚点与仓库地址、补充新增能力与废弃标注，冻结快照按声明保留）
> 维护团队：Sut / ArcesTeam
>
> **本次更新（2026-11-12 第十八轮：全量文档核查与漂移修正）**：以代码实况为权威源复核全部活跃文档——版本 **3.17.4** / 12 格式 / 16 语 140 顶层键·209 递归键 / **48 个测试文件 293 处 `it()`** / 11 个格式产物。修正项：统一全部活跃文档头部审查锚点，仓库地址按 `git remote` 统一为 `sutchan/DNS_Shield`（原第十六轮遗留疑问至此关闭）；测试指标由 47/288 实算更新为 48/293；`SPEC.md` 结构树补 `scripts/check-root-clean.mjs`、§4 补 v3.16.1~v3.17.4 UI 与单飞内存护栏、§12.1 补双源 CSP 与开发模式 `unsafe-eval` 排障；`DEPLOYMENT.md` 补 `rootclean` job、四个工作流与 action 升级、真实 `next.config.js` 配置；`config.yaml` / `CHECKLIST.md` / README 标注 `ui/Tabs.tsx` 与 `@radix-ui/react-tabs` 已废弃；`CHANGELOG [Unreleased]` 补记 v3.17.4 之后已合入但未 bump 的内存修复与 CI 提交。冻结快照（CHANGELOG 历史段 / `prototype/` / `public/brand-colors.md` / `STRUCTURE-REVIEW.md` / `tasks-done.md`）按各自声明不回填数值，仅补冻结与废弃标注。**遗留疑问**：`vercel.json` CSP 含 `require-trusted-types-for 'script'` 而 `next.config.js` 不含，统一方案仍待定（当前状态见 SPEC §12.1）。
>
> **本次更新（2026-11-07 第十七轮：全量文档核查与漂移修正）**：以代码实况复核全部活跃文档（版本 3.17.3 / 12 种输出格式 / 16 语 140 顶层键 / 47 个测试文件 288 处 `it()` 均与实测一致）。修正项：本文件交叉引用 §5.4→§5.3（SPEC 任务记录规范实为 §5.3）；`prototype/README.md` 4 处 `public/brand/` 幽灵路径改为实际 `public/brand-colors.md`，并删除「与 `src/config/version.ts` 一致」的误导声明改为冻结快照表述；README 功能清单补「纯域名」使中英文 12 种格式口径一致；DEPLOYMENT `next.config.js` 示例补 `output: 'standalone'` 与实文一致。CHANGELOG 复核 `6fcd7da..HEAD` 仅 `dd7eefc`（CI setup 复合动作语法修复）且已入账 `[3.17.3]`。冻结快照（CHANGELOG 历史段 / prototype 设计章节 / public/brand-colors.md / STRUCTURE-REVIEW.md / tasks-done.md）按各自声明未改。
>
> **本次更新（2026-11-07 第十六轮：全量文档核查与漂移修正）**：以代码实况为权威源复核全部活跃文档。修正项：README 删除 `src/app/i18n.ts` 幽灵条目（实际位于 `src/utils/i18n.ts`）、结构树补 `src/config/`；SPEC 删除 `uiUtils.ts` / `buildFlowPool.ts` 幽灵条目（`src/utils` 实测无此二文件，系第十五轮误入）、§12.1 CSP 改为如实描述 `next.config.js` 与 `vercel.json` 双源差异；DEPLOYMENT 工作流总览 / 标准发布流程 / 漂移门禁全面同步自动发布实况（`push → CI → Deploy → Release` 自动打 tag；漂移检测为硬门禁）、删除无代码消费的 `PORT` / `NEXT_PUBLIC_APP_NAME` 环境变量行；SUPPORT 与 ci.yml 注释产物计数口径修正（11 个格式产物文件，`domains` 格式即数据源本身）；ISSUE 模板移除不存在的容器化部署；`src/types/formats.ts` 注释 Tab→下拉修正。**遗留疑问**：仓库地址 `sutchan`（README.en 链接）vs `ArcesTeam`（SPEC/SUPPORT/SECURITY）待拍板；`vercel.json` CSP 含 `require-trusted-types-for` 而 `next.config.js` 不含，统一方案待定。冻结快照（CHANGELOG 历史段 / prototype / public/brand-colors.md / STRUCTURE-REVIEW.md / tasks-done.md 历史实测值）按各自声明未改。
>
> **本次更新（2026-11-07 第十五轮：全量文档核查与漂移修正）**：以代码实况为权威源，重新实算并统一全部活跃文档——16 语 / 顶层 140 键 / 递归 209 键、47 个测试文件 / 288 处 `it()`、顶层 16 个 `.tsx`、`ui/` 12 个、`src` 无 >200 行源文件、`public/domains.txt` 非空 897 行（20 注释 + 877 条规则 = 黑名单 645 + 白名单 232）。修正项：README 项目结构树补 `workers/` / `useWorkerPool` / `parseAggregate` / `OutputPanel.formatSelect` 与 parser 两段式描述、输出格式控件 Tabs → 单一下拉；README.en 同步语言优先级与多核并行能力；DEPLOYMENT 陈旧硬编码版本号与示例死版本号改为指向单一来源；SPEC 结构树组件与 FlowViz 静态快照描述；tasks 实时指标；CHECKLIST 审查时间；SUPPORT 白名单指引自相矛盾；CONTRIBUTING 提交类型与版本发布清单；PR 模板版本单一来源；SECURITY 废弃响应头；config.yaml 上下文。冻结快照（CHANGELOG 历史段 / prototype / public/brand-colors.md / STRUCTURE-REVIEW.md / tasks-done.md 历史实测值）按各自声明未改。
>
> **本次更新（2026-11-07 第十四轮：T-P1-18 多核并行求值落地）**：推进并完成待办区唯一剩余增强项 `Web Worker 分片并行化（多核并行求值）`，编号 **T-P1-18**，随 v3.16.0（minor，新功能）发布并归档至 [tasks-done.md](./tasks-done.md)。要点：`parser.ts` 拆为 `collectLines`（可分片逐行收集）+ `finalizeParsed`（全局后处理）两段，`parseSource` 契约不变；新增 `workers/parseShard.worker.ts` / `hooks/useWorkerPool.ts` / `utils/parseAggregate.ts`；`useRuleWorker.run('parse')` 达到 20000 行阈值自动走多核并行，失败逐级回退单 Worker → 主线程同步；并行与串行结果等价契约由新增 `parseAggregate.test.ts`（1 套件 12 用例，静态计数）断言。本机无 `node_modules`，`vitest` / `tsc` / `lint` 未实跑，`read_lints` 0 诊断，待 CI 复核。

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
| 应用版本 | v3.18.0 | `package.json` version（权威源） |
| 输出格式数 | 12 种 | `src/types/formats.ts` 的 `ALL_FORMATS` |
| i18n 语言 / 键数 | 16 种 / 顶层 **140** 键、递归合计 **209** 键 | 脚本统计 `src/locales/zh-cn.json`（flatten 叶子口径，与 `check:locales` 输出及 `scripts/locale-baseline.json` keyCount 一致；v3.15.5 移除 `moreFormats` 死键，2026-11-07 实算） |
| 测试套件 / 用例 | **48 套件 / 293 用例**（2026-11-12 脚本实算：48 个 `*.test.ts` 文件、293 处 `it()` / `test()` 调用、无 `it.each`；v3.17.3 新增 `useWorkerPool.singleflight.test.ts` 1 套件 5 用例） | `vitest run` 为权威计数；本机已安装 `node_modules`，本轮为静态实算，待 CI / 本机实跑复核 |
| 覆盖率门禁 | 已生效且为真实值；含 `src/utils` + `src/hooks`，门槛 **语句 80 / 分支 75 / 函数 85 / 行 80**；`vitest.config.ts` 显式声明 `all: false` | `vitest run --coverage`；2026-11-05 第十二轮实测：语句 88.85 / 分支 85.45 / 函数 91.74 / 行 88.85，全部达标且有余量；曾以「临时抬阈至 99 → EXIT CODE 1」反证门禁真实生效 |
| 组件规模 | 顶层 **16** 个 `.tsx`（含 `OutputPanel.parts.tsx` / `OutputPanel.formatSelect.tsx`）+ `OutputPanel.derived.ts` / `InputPanel.types.ts`，`ui/` 12 个（含已废弃的 `Tabs.tsx`） | `src/components/` 实测（2026-11-07 实算，由 15 修正为 16） |
| 源文件 >200 行 | `ts/tsx/css` **0** 个（含测试文件）；`globals.css` 已于 v3.13.6 拆为 `src/styles/*.css` 7 模块 | 行数扫描 |
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
