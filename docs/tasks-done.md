# 已完成任务归档

> 本文件归档 DNS Shield 项目**已完成**的任务条目。
> 活跃任务清单见 [tasks.md](./tasks.md)（唯一来源，仅保留未完成任务与实时指标）。
> 归档时间：2026-10-19 20:30（自 tasks.md「五、已完成任务」迁出）
> 维护团队：Sut / ArcesTeam

---

## 一、结构化任务（T-Px-xx 编号）

| 任务编号 | 任务名称 | 负责 | 完成版本 | 关键成果 |
|---|---|---|---|---|
| T-P0-01 | 测试覆盖率工具链与阈值门禁 | Core Team | v3.9.x | 配置 `@vitest/coverage-v8` 与 `vitest.config.ts` 门禁 |
| T-P0-02 | 关键工具与核心模块单元测试 | Core Team | v3.9.x | 覆盖 `ruleMatcher` / `scriptGenerator` / `buildFlowPool` 等 |
| T-P0-03 | 生产日志收敛 | Core Team | v3.9.x | `console.error`/`warn` 收敛至 `src/utils/logger.ts`，按 `NODE_ENV` 生产静默 |
| T-P0-04 | 修正覆盖率统计与门禁 | Core Team | v3.9.x | 根因查明报告值 47.85% 系 Vitest 2.1.9 按盘符大小写重复统计同一源文件；落地真实门禁 + `coverage.exclude` 防御性排除 |
| T-P2-02 | 在线 DNS 拦截规则匹配测试器 | Feature Team | v3.10.x | `RuleTesterModal.tsx` 实时分析域名命中的规则层级 |
| T-P2-03 | 规则格式扩展（Mosdns / Clash Meta / CoreDNS） | Feature Team | v3.10.x | 纳入 `ALL_FORMATS` / 输出 Tab / 下载复制链路与 16 语 i18n |
| T-P3-01 | 路由器一键同步脚本 | Infra Team | v3.10.x | `ScriptGeneratorModal.tsx` 支持 OpenWrt / Merlin / Padavan / SmartDNS / Pi-hole |
| T-P3-03 | 上游聚合 GitHub Action | Infra Team | v3.10.x | `.github/workflows/aggregate.yml`（每周一 03:17 UTC）+ `scripts/aggregate-upstream.mjs`，聚合 5 个上游去重后自动发起 PR 供人工审核 |
| T-P1-04 | 拆分超 200 行源文件 | Core Team | v3.10.2 | 4 个超行文件按职责拆分且公开 API 不变（`translation.parts` / `useHomeController` / `useModalA11y` / `OutputPanel.parts`），拆分后单文件均 ≤200 行 |
| — | GA4 衡量 ID 环境变量化 | Core Team | v3.10.3 | 移除 `layout.tsx` 硬编码兜底 ID，改由 `NEXT_PUBLIC_GA_MEASUREMENT_ID` 驱动；新增 `analytics.ts` + `ga-scripts.tsx` + `analytics.test.ts`（13 例） |
| T-P1-03 | 离线与增量存储（IndexedDB） | Dev Team | v3.11.0 | 新增 `idb.ts` / `httpCache.ts` / `cachedFetch.ts`；存储上限 5MB → 50MB，localStorage 降级并一次性迁移旧草稿 |
| T-P1-01 | Web Worker 异步解析 | Dev Team | v3.11.0 | 新增 `ruleProcessor.worker.ts`（按 2000 行分片上报进度）与 `useRuleWorker` / `useAsyncRuleProcessing`（阈值 5000 行、请求序号守卫防竞态、Worker 不可用自动回退） |
| T-P1-02 | 预览区虚拟渲染 | Dev Team | v3.11.0 | 新增 `useVirtualList` 与 `OutputPreview`：行数 ≥500 仅挂载可视区切片，行号列 DOM 节点数保持 O(1) |
| T-P4-01 | 升级 Vitest 至 3.2.7 | Core Team | v3.11.0 | 根治 Windows 盘符大小写导致的覆盖率重复统计，报告值回归真实；阈值提升至 80/75/85/80 |
| T-P3-02 | OpenWrt LuCI 配置包 | Infra Team | v3.11.0 | 新增 `openwrt-package/`：LuCI 应用 Makefile、订阅控制器（10MB 上限 + URL 白名单校验防命令注入）、菜单与 rpcd ACL、UCI 默认配置 |
| — | 构建门禁修复与格式切换 UI 找回 | Core Team | v3.11.1 | 恢复被误删的 `<FormatTabs>` 渲染；清理 3 处 unused 变量与 2 处 hooks 依赖告警；移除 `FIELD_MAP` + `updateSettings` 死代码 |
| T-P2-04 / T-P2-06 | 正则规则双向语法转换 | Feature Team | v3.11.0 建库 / v3.12.0 接入 | 新增 `regexRules.ts`（AdGuard `/pattern/` ↔ Pi-hole FTL `regex:pattern`）；dnsmasq 不支持正则如实跳过；v3.12.0 完成 `parseLine` → `parser` → `buildRegexRules` → `useRules` 全链路贯通 |
| T-P2-01 / T-P2-05 | 域名分类与标签过滤（含 UI 接入） | Feature Team | v3.11.0 建库 / v3.13.0 接入 | 新增 `domainCategory.ts` 按真实命中的上游源打标；v3.13.0 由 `CategoryFilter` + `useCategoryIndex` + `useCategoryFilter` 接入 `InputPanel` 并接通 `useRules(filteredData)`，实现按类选择性导出；i18n 补 5 键 × 16 语 |
| T-P1-05 | 消除解析重复计算 | Dev Team | v3.12.0 | `useRules.runGenerate` 复用 `useDomainData` 的 `parsedData`（单一解析源），单次输入由 2~3 次完整解析降为 1 次 |
| T-P2-07 | 统一统计口径 | Core Team | v3.12.0 | `rulesGenerator.ts` 抽出 `prepareRuleData` 作为 `generateRules` 与 `computeEffectiveStats` 的唯一公共变换，两处口径永不漂移 |
| T-P3-04 | 脚本生成器 URL shell 转义加固 | Core Team | v3.12.0 | 新增 `shellQuote`（单引号包裹 + `'\''` 转义），5 处 `URL=` 均安全注入，彻底阻断命令注入；删除 `customDnsIp` 死参数 |
| T-P3-05 | parseSource 进度补报 + i18n 缺键降级 | Core Team | v3.12.0 | 循环结束补报 `onProgress(total, total)`；缺 toast 键时降级为 `t.toast.done`，不再向用户暴露裸 key |
| T-P1-06 | runGenerate 按当前格式惰性生成 | Dev Team | v3.13.0 | 仅生成 `currentFormat`，下载/复制按需全量（10 万行输入约省 11/12 拼接成本）；一致性由 `formatGenerators.single.test.ts` 逐字节断言 |
| T-P1-06（回归修复） | 单格式/全量生成器白名单口径对齐 | Core Team | 2026-10-19 | 修复 `bind` 格式多输出白名单段标题的不一致缺陷（详见下节） |
| T-P1-07 | 补齐编排层（`src/hooks`）单元测试 | Core Team | 2026-10-19 | 新增 **7 个测试文件 / 112 个用例**（`useRules` 15 / `useDomainData` 26 / `useHomeController` 22 / `useUrlManager` 20 / `useTheme` 9 / `useLoading` 12 / `useFlowTokens` 8）。全局覆盖率由 语句 53.31% → **87.42%**、分支 85.77% → 86.05%、函数 80.43% → **89.83%**、行 53.31% → **87.42%**；`src/hooks` 层由 10.65% → **88.52%**。达标后 `vitest.config.ts` 阈值由临时的 50/75/80/50 提升回项目原定的 **80/75/85/80**。测试总数 136 → **248**，套件 20 → **27** |
| T-P1-08 | 统一行数统计、消除重复实现与全量 `split` 分配 | Dev Team | v3.14.0 | 新增 `src/utils/lineCount.ts`（非分配 `countLines`）；`useAsyncRuleProcessing` / `useDomainData` / `useRuleWorker` 三处调用点统一收敛 |
| T-P1-09 | 域名源加载失败的用户可见告警 | Core Team | v3.14.0 | 远端 + 同源回退全失败时弹 toast `domainsLoadFailed`（16 语齐备，基线 215 键） |
| T-P1-10 | 导出头部 usage 行补格式注释符（P0 级） | Core Team | v3.15.0 | 12 种格式头部每一非空行均以注释符开头（dnsmasq 不再出现裸指令，避免路由器拒绝加载）；Bind RPZ 注释符由 `#` 修正为 `;`；`scripts/lib/formatHeaders.mjs` 与运行时对齐；新增 `rulesGenerator.header.test.ts` 逐格式断言 |
| T-P1-11 | 草稿优先契约（禁止远端清单覆盖用户草稿） | Dev Team | v3.15.0 | 草稿无条件恢复；远端加载完成后检测到草稿已恢复即放弃远端内容；「草稿先落地」「远端先落地」两种时序均有回归用例 |
| T-P1-12 | RTL 语言方向初始化同步 | Core Team | v3.15.0 | `useLanguage` 初始化即写 `<html dir>`，RTL 语言刷新后首屏按 rtl 排版 |
| T-P1-13 | 设置项/语言变更触发重新生成 | Dev Team | v3.15.0 | `useRules.runGenerate` 依赖纳入 `settings` 与 `t`；改 IP/项目名/去通配/去重开关或切换语言后预览、导出、统计同步刷新 |
| T-P1-14 | Worker 任务失败与挂起任务结算 | Dev Team | v3.15.0 | 解析失败回退主线程同步解析；Worker 卸载逐个 resolve 挂起任务；`postMessage` 异常即时结算，杜绝进度条常驻 |
| T-P1-15 | 排序/去重结果不得覆盖用户新输入 | Dev Team | v3.15.0 | 转换序号（排序/去重共用）+ 输入快照双重守卫 |
| T-P1-16 | 弹窗栈：一次 Escape 只关闭栈顶弹窗 | Core Team | v3.15.0 | 新增 `src/hooks/useModalEscape.ts` 弹窗栈，四个弹窗统一使用 |
| T-P1-17 | 共享滚动锁（叠放弹窗互不破坏） | Core Team | v3.15.0 | 新增 `src/utils/scrollLock.ts` 引用计数实现；关闭内层弹窗不解除外层锁定，全部关闭后恢复原始 `overflow` |
| T-P2-07 | AdGuard `\|\|` 边界非法切片 | Core Team | v3.15.0 | `Math.min` 空数组回退到行尾，避免 `Infinity` 切片 |
| T-P2-08 | hosts 行支持任意合法 IP 与 Tab 分隔 | Core Team | v3.15.0 | `10.0.0.1 cdn.example.com` 等均可识别为 hosts 类型；非 IP 前缀不误判 |
| T-P2-09 | 正则本体含 `#` 不被内联注释剥离截断 | Core Team | v3.15.0 | 正则识别前置于注释剥离，`/\d+#/`、`regex:/ads\/#/` 完整保留 |
| T-P2-11 | URL 全部抓取失败时不得提示「获取成功」 | Core Team | v3.15.0 | 全失败抛错走失败分支；部分失败仍视为成功 |
| — | 语义化 ID 全量规范化（kebab-case） | Core Team | v3.15.0 | 源码 154 处 id 全部统一 kebab-case（此前 28 处 camelCase）；同步 `htmlFor`/`aria-*`/JS 选择器；`prototype/` 三个 HTML 同步并校验 `$('x')` 引用全部可命中，无重复 id |
| — | 超长测试文件拆分与测试装置抽离 | Core Team | v3.15.0 | 5 个超长测试文件（558/435/392/389/215 行）按关注点拆为 18 个，共享装置抽到 `src/test-utils/` 三个 TestKit；`src` 下无超过 200 行的源文件（含测试） |

### T-P1-07 关键契约的断言方式

- **T-P1-06 惰性生成**：对 `generateSingleFormat` 与全量 `generateRules` 同时注册间谍。断言挂载只调用单格式生成器 **1 次**、4 次格式切换的序列严格等于 `['dnsmasq','adguard','hosts','whitelist']`、生成种类数 `4 < ALL_FORMATS.length`，且 **`generateRules` 一次都未被调用**；另断言 `currentOutput` 随 `currentFormat` 切换为对应格式文本。
- **T-P1-05 单一解析源**：对 `../utils/parser` 的 `parseSource` 注册透传间谍，断言全生命周期 `not.toHaveBeenCalled()`，并断言传入的 `domains`/`whitelist` 按引用原样透传、未被二次加工。将来谁把解析塞进 `useRules` 会立即失败。

| T-P2-08 | 补齐 `toast.cleared` 缺失的 i18n 键（16 语） | Feature Team | 2026-10-19 | `useDomainData.ts:134` 调用 `showToast('cleared')` 但 16 语全缺该键，点「清空」只显示通用「已完成」。补齐 16 语自然译文（每文件 1 行、16 insertions / 0 deletions），并在手工维护的 `TranslationToast` 接口补 `cleared: string;`（不从 zh-cn.json 推导，否则 TS2339）。键总数 213 → **214**，测试 248 → **249** |
| T-P0-02a | 增强 `check-locales.mjs` 捕获「集体缺键」 | Core Team | 2026-10-22 | 引入独立基线清单 `scripts/locale-baseline.json`（214 键，源 `zh-cn.json`）；先比对 `zh-cn` 与基线、再比对各包与 `zh-cn`；新增 `pnpm locales:baseline`（`--update-baseline`）刷新基线；破坏性反证：16 包同删 `toast.cleared` → EXIT 1 且指明键名，恢复后正常通过（详见下节） |
| T-P1-08 | 统一行数统计、消除重复实现与全量 `split` 分配 | Core Team | 2026-11-05 | 新增 `src/utils/lineCount.ts`（非分配换行计数，零内存开销）+ `lineCount.test.ts`（7 例，含语义一致性与 10 万行性能回归守卫）；替换 `useAsyncRuleProcessing` / `useDomainData` / `useRuleWorker` 三处重复实现，其中两处原用 `text.split('\n').length`（10 万行输入每次分配 10 万元素数组，主线程可感知卡顿） |
| T-P1-09 | 域名源加载失败的用户可见告警 | Feature Team | 2026-11-05 | `useDomainData.loadDomainData` 在远端 + 本地回退全失败时仅写 `logger.warn`（生产静默、用户无感知）；新增 `toast.domainsLoadFailed` × 16 语言 + `TranslationToast` 字段 + 基线刷新至 215 键，并补 2 例断言 toast 被调用 |

### T-P2-08 译文与守卫设计

16 语译文均与各自 `toast.done` 措辞风格一致，且**均不等于 `done`**（防止将来被填成同值而静默退化）：

`ar تم المسح` / `cs Vymazáno` / `en Cleared` / `es Borrado` / `hi साफ़ किया गया` / `id Dibersihkan` / `it Svuotato` / `nl Gewist` / `pl Wyczyszczono` / `ru Очищено` / `sv Rensat` / `th ล้างแล้ว` / `tr Temizlendi` / `vi Đã xóa` / `zh-cn 已清空` / `zh-tw 已清空`

**三层守卫**（经破坏性实验反证均真实有效）：

1. `clearAll` 后断言 toast 收到的是 `t.toast.cleared` 真实译文，并交叉断言 `cleared !== done`
2. **T-P3-05 降级守卫保留**：用 `someNonExistentKey` 断言仍降级为 `t.toast.done`、不向用户暴露裸 key
3. **集体守卫（不可替代）**：显式断言 16 个语言包均含 `toast.cleared` 且值符合预期。因 `check-locales` 仅在**部分**语言包缺键时才报错，**16 包同缺时会 ✅ 通过**（主理人已实测复现，见 T-P0-02a），故此守卫是当时唯一能拦住「集体缺键」的防线；T-P0-02a 完成后，工具层已补齐该防线。

### T-P0-02a 独立基线门禁设计（2026-10-22）

`scripts/check-locales.mjs` 原仅做「各语言包相对 `zh-cn.json` 的两两一致性」比对。但 `zh-cn.json` 自身也是语言包之一，若它（连同其余 15 包）同时缺失某键，基线会被静默缩水、CI 假通过——这正是 T-P2-08 缺陷能长期存在的机制性原因。

**修复方案**：引入**独立基线清单** `scripts/locale-baseline.json`，由 `zh-cn.json` 生成、需经 `pnpm locales:baseline`（`--update-baseline`）显式刷新并提交，构成「双源硬门禁」：
1. 先校验 `zh-cn.json` 与基线清单一致（检出「集体缺键」与「新增键未同步清单」两类偏差）；
2. 再校验各语言包相对 `zh-cn.json` 一致（既有逐包比对）；
3. 新增 `pnpm locales:baseline` 用于在**有意新增键**时刷新基线，避免合法变更被误拦；首次运行无清单时自动引导生成并提示提交。

**破坏性反证（验收 #2 实跑）**：从全部 16 个语言包（含 `zh-cn.json`）同时删除 `toast.cleared` 后，脚本 **EXIT CODE 1** 并打印 `基线有但 zh-cn 缺失（集体缺键，CI 必须拦截）(1): toast.cleared`；恢复后正常态 `✅ 通过（16 语 / 214 键）`。门禁真实生效，不再有「集体缺键」静默溜过的路径。

> 覆盖率未满 100% 的原因已查明且属环境上限：`useRuleWorker`(35%)、`autosaveStorage`(47.6%)、`idb.ts`(21%) 依赖 `Worker` / `indexedDB`，而本仓 jsdom 环境不提供，在不引入新依赖的前提下已达可达上限。`Worker` 缺失反而天然覆盖了 `useRuleWorker` 的主线程回退路径（符合项目设计意图）。

> 门禁真实性已由主理人反证：将 `statements` 阈值临时抬至 99 后实跑，`EXIT CODE 1`（CI 真实阻断），恢复 80 后通过——非「配了但从不校验」的假门禁。

### T-P1-06 隐藏回归修复（2026-10-19）

实跑 `vitest run` 时发现 `formatGenerators.single.test.ts` **实有 2 个 `bind`（RPZ）格式用例失败**（文档此前误记「逐字节一致、全绿」）。

- **根因**：`formatGenerators.single.ts` 的 `whitelistHeader()` 在 `default` 分支对 `bind` 输出了 `# 白名单` 段标题，而全量路径 `buildWhitelistRules` 明确将 `bind` / `pihole` 排除在白名单之外（RPZ 与 Pi-hole 原生无白名单语义）。
- **修复**：单格式生成器为 `pihole` / `bind` 显式返回空字符串，与全量生成器口径一致。
- **结果**：20 套件 / 136 用例全绿。
- **教训**：「测试全绿」这一结论同样必须实跑验证，不能从文档继承。

---

## 二、专项整改与审查

- [x] **目录结构审查与 P0 整改（2026-10-05，v3.12.0）** — ① 删除根目录垃圾与占位配置（`{const`、`metadata.json`、`pnpm-workspace.yaml` 占位串、`tsconfig.tsbuildinfo`、临时 `_*.txt`）；② 删除投机死模块 `src/utils/statsAggregator.ts` 及其测试；③ 修 `count-domains.mjs` 的 `--write` 硬编码 `3.7.34` → 改读 `package.json`；④ 默认设置收敛为 `src/config/defaults.json` 单一来源（此前 `ipv4` 值两处冲突）；⑤ 安全响应头以 `vercel.json` 为准回写 `next.config.js`（补 HSTS/COOP/CORP/X-Frame-Options，收紧 `frame-ancestors`）；⑥ 新增 `scripts/sync-facts.mjs` 把版本号写入 13 处文档展示位并纳入 CI 硬门禁；⑦ 补 hooks 层单测并把 `src/hooks` 纳入覆盖率门禁；⑧ 修正 T-P2-01 / T-P2-04 任务状态口径
- [x] **工作流审查整改（2026-10-04，v3.11.2）** — ① 入库 `pnpm-lock.yaml` + `packageManager`/`engines`/`.npmrc`，解除「无锁文件却 `--frozen-lockfile`」的不可复现安装；② Release 资产清单改由 `gen-format-files.mjs --list-files` 单一来源导出；③ `aggregate.yml` 补 `contents: write`（原权限必 403）；④ 生成产物漂移提为硬门禁；⑤ 部署改 `workflow_run` 门禁；⑥ EdgeOne 产物路径修正；⑦ CLI 钉版本 + 全 job `timeout-minutes`；⑧ 修测试摘要 grep + 新增 `.gitattributes` 固定 LF
- [x] **ESLint 陈旧闭包修复（2026-10-19）** — `src/components/OutputPanel.derived.ts` 的 `useMemo` 依赖数组仅列 `settings` 的 5 个字段，但回调体内经 `prepareRuleData(..., settings)` 间接读取去重/通配符等字段，构成陈旧闭包风险。修复：依赖数组收敛为 `settings` 整体 + `parsedData`。`next lint` 由 1 warning → **0 warning 0 error**
- [x] **任务文档数据漂移全面修正（2026-10-19）** — 按「数字必须实算」纪律重跑全部指标：测试 19 → **20 套件**、129 → **136 用例**；i18n 145 → **146** 顶层键、207 → **213** 递归键；覆盖率 84.46/86.85/91.07/84.46 → **53.31/85.77/80.43/53.31**（旧值为 v3.12.0 纳入 `src/hooks` 之前的数据，早已失真）。三项偏差方向不一致，再次印证凭旧记录继承数字必然失真
- [x] **任务文档合并（2026-10-04）** — 原 `TASKS.md` 与 `REMAINING_TASKS.md` 合并为 `tasks.md`，删除冗余文档，消除剩余任务数口径矛盾
- [x] **已完成任务归档拆分（2026-10-19）** — 本轮将已完成条目自 `tasks.md` 迁出至本文件，使 `tasks.md` 仅保留未完成任务与实时指标
- [x] **SPEC.md 文档漂移修正（2026-11-02）** — 全项目审查时实读 `src/` 发现 SPEC.md 长期未随代码迭代同步：① §2 文件结构补全 18 个 hooks（实际 14 个非测试，原仅列 7 个）与 18 个 utils（实际 18 个非测试，原仅列 10 个），补齐 `formatGenerators(.single)/headerConfigs/scriptGenerator/regexRules/domainCategory/parseLine/ruleMatcher/idb/httpCache/cachedFetch/buildFlowPool/logger/domainPrimitives` 及 `useFlowTokens/useHomeController/useLineNumbers/useAsyncRuleProcessing/useRuleWorker/useAutosave/autosaveStorage/useCategoryFilter/useCategoryIndex/useModalA11y/useVirtualList`；组件树补全 8 个业务组件（GuideModal/FlowViz/RuleTesterModal/ScriptGeneratorModal/SettingsForm/OutputPreview/OutputPanel.parts/CategoryFilter）；② §5.1 端口 8082 → 3000（与 `package.json` dev 脚本一致）；③ §9.2 vitest `^2.1.9` → `^3.2.7`（T-P4-01 升级后未同步）；④ §12 章节号重复（两个 §12），版本历史改为 §13；⑤ §12.1 CSP 移除实际未启用的 `require-trusted-types-for 'script'`，与 `next.config.js` 对齐
- [x] **线上 dns.ewuse.com UI 缺陷修复（2026-11-02 第八轮）** — 基于桌面 1280×960 真实浏览器取证定位 4 项问题：① **P0 Tabs 受控切换警告**——`OutputPanel.tsx` effect 在远端数据未加载时 `useVisibleFormats` 返回 `[]`，effect 把 `currentFormat` 设成 `visibleFormats[0]` 即 `undefined`，导致 Radix Tabs value 受控↔非受控双向切换；修复：effect 开头加 `if (visibleFormats.length === 0) return;` guard；② **P1 格式 Tab 栏被圆形按钮裁切**——`OutputToolbar` 把 FormatTabs 与三个 icon button 放同一 flex 容器，wrap 时 icon 插入 TabsList 行之间裁切首尾 Tab 文字；修复：FormatTabs 包 `flex-1 min-w-0` 容器、icon buttons 包 `flex-shrink-0` 容器；③ **P1 两栏底部按钮不对齐**——`globals.css` 的 `mt-auto` 加在 editor-container/wrapper 上，两栏前置内容高度不同导致编辑器位置错位；修复：`mt-auto` 移到 `.editor-actions` 和 `#output-actions`，按钮贴 panel 底部对齐；④ **P3 域名计数漂移**——实算 `public/domains.txt`：白名单 232、改道 0、注释 15、线上黑名单 634，合计 866；SPEC.md §1 原写"867 条（635+232）"改为"866 条（634+232）"。改动均为低风险可逆 UI 修复，未动规则引擎/i18n/安全头

### 测试编写经验（2026-10-19 T-P1-07 沉淀）

- **localStorage 在本仓 jsdom 中真实可用**（`typeof localStorage === 'object'`）。依赖初始语言的用例必须清理，否则语言偏好会跨用例泄漏、导致偶发失败。新增的 7 个测试文件均在 `beforeEach` 做 `localStorage.clear()` 隔离。
- **传给 hook 的 `showToast` 必须是稳定引用**（生产代码用 `useCallback`）。若在 `renderHook` 回调里内联 `vi.fn()`，`runGenerate` 的引用会抖动导致 effect 反复触发，伪装成「多次生成」，掩盖真实的惰性生成断言。
- **建间谍用 `vi.hoisted()` 挂在单一对象上**（`mocks.x` 访问）比顶层解构稳妥；`vi.mocked()` 对 `importOriginal` 型 mock 在模块顶层会踩 TDZ。
- 本仓 jsdom 缺 `Worker` / `matchMedia` / `indexedDB` / `navigator.clipboard` / `URL.createObjectURL` / `scrollIntoView`。`useTheme` / `useFlowTokens` 需 `vi.stubGlobal('matchMedia', ...)`。

---

## 三、历史开发任务（v3.0 前后，已归档）

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

## 四、任务验收标准与状态追踪（自 tasks.md 迁移，2026-11-03）

> 原 tasks.md「四、任务状态追踪与验收标准」，随任务全部完成一并归档，使活跃任务清单文件不再重复维护。

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
| T-P1-08 | 统一行数统计 | Core Team | 单一 `countLines` 工具；3 处调用点全部替换；大文本不产生 O(n) 数组分配；单测覆盖语义一致性与性能回归 | ✅ 已完成（2026-11-05，新增 `lineCount.ts` + 7 例单测，三处调用点收敛） |
| T-P1-09 | 域名源加载失败告警 | Feature Team | 全部源失败时弹出 toast；16 语言键齐备且基线同步；不再只写 logger | ✅ 已完成（2026-11-05，新增 `toast.domainsLoadFailed` × 16 语，基线 215 键，2 例单测） |
| T-P1-10 | 导出头部 usage 注释符 | Core Team | 12 种格式头部非空行全部以注释符开头；dnsmasq 无裸指令；Bind RPZ 用 `;`；脚本与运行时一致 | ✅ 已完成（2026-11-05，逐行加注释符 + `rulesGenerator.header.test.ts` 逐格式断言） |
| T-P1-11 | 草稿优先契约 | Dev Team | 草稿无条件恢复；远端检测到草稿已恢复即放弃；两种时序均有回归用例 | ✅ 已完成（2026-11-05，`useAutosave` + `useDomainData` 双向守卫） |
| T-P1-12 | RTL 方向初始化 | Core Team | 刷新后 RTL 语言首屏按 rtl 排版 | ✅ 已完成（2026-11-05，初始化即写 `<html dir>`） |
| T-P1-13 | 设置/语言变更联动 | Dev Team | 改设置或切语言后预览、导出、统计同步刷新 | ✅ 已完成（2026-11-05，`runGenerate` 依赖纳入 `settings` 与 `t` + 3 例单测） |
| T-P1-14 | Worker 失败与挂起结算 | Dev Team | 解析失败回退主线程；卸载时 resolve 挂起任务；postMessage 异常即时结算 | ✅ 已完成（2026-11-05，三处兜底） |
| T-P1-15 | 排序/去重竞态 | Dev Team | 处理期间用户新输入不被旧结果覆盖 | ✅ 已完成（2026-11-05，转换序号 + 输入快照双重守卫） |
| T-P1-16 | 弹窗栈 Escape | Core Team | 一次 Escape 只关闭栈顶弹窗 | ✅ 已完成（2026-11-05，新增 `useModalEscape` + 5 例单测） |
| T-P1-17 | 共享滚动锁 | Core Team | 叠放弹窗互不破坏锁定；全部关闭后恢复 `overflow` | ✅ 已完成（2026-11-05，新增 `utils/scrollLock` + 5 例单测） |
| T-P2-09 | 正则含 `#` 不被截断 | Core Team | `/\d+#/` 等完整保留 | ✅ 已完成（2026-11-05，正则识别前置于注释剥离） |
| T-P2-11 | URL 全失败不误报成功 | Core Team | 全失败走失败分支；部分失败仍算成功 | ✅ 已完成（2026-11-05，全失败抛错走失败提示） |
| T-P2-01 | 分类标签过滤（UI 接入） | Feature Team | 界面可按分类筛选/导出（数值来自真实索引） | ✅ 已完成（v3.13.0，UI 接通生成链路） |
| T-P2-04 | 正则双向语法转换 | Feature Team | AdGuard 正则 ↔ Pi-hole FTL 互转并接入生成器 | ✅ 已完成（v3.12.0） |
| T-P2-05 | 分类标签 UI 接入 | Feature Team | 分类筛选控件 + 按类导出 + i18n 5 键 × 16 语 | ✅ 已完成（v3.13.0，16 语 category 键齐全） |
| T-P2-06 | 正则规则接入生成器 | Feature Team | 正则行不再被丢弃，12 格式间可转换 | ✅ 已完成（v3.12.0，与 T-P2-04 合并落地） |
| T-P2-07 | 统一统计口径 | Core Team | generateRules 与 computeEffectiveStats 共用同一变换 | ✅ 已完成（v3.12.0，prepareRuleData） |
| T-P3-02 | OpenWrt LuCI 配置包 | Infra Team | LuCI 后台可直接订阅规则源 | ✅ 已完成（v3.11.0） |
| T-P3-04 | 脚本生成器 URL 转义 | Core Team | shellQuote 单引号包裹 + `'\''` 转义，死参数已删除 | ✅ 已完成（v3.12.0） |
| T-P3-05 | 进度补报 + i18n 降级 | Core Team | 尾段补报 100%；缺键降级 t.toast.done 不暴露裸 key | ✅ 已完成（v3.12.0） |
| T-P4-01 | 升级 Vitest 3.x | Core Team | 覆盖率报告无重复键，阈值回归真实值 | ✅ 已完成（v3.11.0） |

## 五、已完成任务概览与专项整改（自 tasks.md 迁移，2026-11-03）

> 原 tasks.md「五、已完成任务」。

**已完成任务概览（明细见 [tasks-done.md](./tasks-done.md) 第一、二章）**：

| 优先级 | 已完成任务编号 | 累计 |
|---|---|:---:|
| 🔴 P0 | T-P0-01 / 02 / 03 / 04 / 02a | 5 |
| 🟡 P1 | T-P1-01 / 02 / 03 / 04 / 05 / 06 / 07 / 08 / 09 / 10 / 11 / 12 / 13 / 14 / 15 / 16 / 17 | 17 |
| 🟢 P2 | T-P2-01 / 02 / 03 / 04 / 05 / 06 / 07 / 08 / 09 / 11 | 10 |
| ⚪ P3 | T-P3-01 / 02 / 03 / 04 / 05 | 5 |
| ⚙️ P4 | T-P4-01（已提升至 P2 实施） | 1 |

**已完成的专项整改**：目录结构审查与 P0 整改（v3.12.0）、工作流审查整改（v3.11.2）、构建门禁修复与格式切换 UI 找回（v3.11.1）、GA4 衡量 ID 环境变量化（v3.10.3）、ESLint 陈旧闭包修复（2026-10-19）、T-P1-06 白名单口径回归修复（2026-10-19）、任务文档数据漂移全面修正（2026-10-19）、T-P1-08 统一行数统计与分配消除（2026-11-05）、T-P1-09 域名源加载失败用户告警（2026-11-05）、第十二轮全量缺陷修复与规范化（2026-11-05：导出头部 usage 注释符、草稿优先契约、设置联动、Worker 健壮性、弹窗栈/滚动锁、语义化 ID 全量 kebab-case、超长文件拆分）。

## 六、应用问题诊断详述（历史证据，2026-10-13，自 tasks.md 迁移）

> 原 tasks.md「九、应用问题诊断详述」，为已完成任务（T-P2-04 / T-P2-01·05 / T-P3-04 / T-P1-05·06 / T-P3-05 / T-P2-07 等）的事实依据，随任务完成一并归档。
> 全部结论经 `src/` 代码实读核实，非推测。文档不拆分，故仍归于本归档文件。

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

---

> **未完成任务**：见 [tasks.md](./tasks.md)「三、待办任务」。截至 2026-11-05 全部任务已完成（第十一轮新登记的 T-P1-08 / T-P1-09 已完成并归档），`docs/tasks.md` 待办区已清空；Web Worker 分片并行化为后续增强项（非阻断）。已完成任务结构化明细见上方第一、二、四、五、六章。