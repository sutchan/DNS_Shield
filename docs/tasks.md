# 项目任务清单（未完成任务唯一来源 + 实时指标）

> **本文件是项目「未完成任务」与「实时指标」的唯一来源（Single Source of Truth）**。
> 已完成任务条目、历轮变更详情与开发进度全景已归档至 [tasks-done.md](./tasks-done.md)（含全部 T-P0/P1/P2/P3/P4 结构化任务、专项整改、验收标准与诊断证据、完成度快照），本文件不再重复维护已完成条目与历史叙述，避免两处口径漂移。
> 规则固化见 [SPEC.md §5.3 任务记录规范](./SPEC.md)。

> 最后审查：2026-11-13（与 package.json v3.19.0 对齐；第十九轮审计新增 11 项待办，见第二节）。
> 维护团队：Sut / ArcesTeam
>
> **本轮整理（2026-11-13）**：依 SPEC §5.3 任务记录规范，将第十四~十八轮冗长的「本次更新」历史叙述统一归档至 [tasks-done.md](./tasks-done.md)，本文件仅保留未完成清单、实时指标、遗留疑问与维护清单；版本与指标经实算与代码实况对齐（v3.18.1 / 12 格式 / 16 语 140·209 键 / 51 套件 326 用例 / 17 组件 / >200 行源文件 0 个）。
>
> **遗留疑问 / 审计结论**（2026-11-13 第十九轮）：
> - ~~`vercel.json` 双源 CSP 差异~~：**已解决**——`vercel.json` 文件已删除，安全响应头现为 `next.config.js` 单一来源（见 §11 与 T-DOC-01）；是否启用 `require-trusted-types-for` 转为安全增强评估项（T-SEC-01）。
> - `NEXT_PUBLIC_APP_VERSION` 环境变量：已在 v3.18.1 从代码/文档移除（DEPLOYMENT.md 改为 `APP_VERSION` 单一来源），不属遗留项。
> - 第十九轮审计新增 11 项待办见第二节（文档漂移 / 版本硬编码 / 根因回归 / 发布链路验证 / 兼容性）。

---

## 一、实时指标

| 指标 | 实测值 | 取得方式 |
|---|---|---|
| 应用版本 | v3.19.0 | `package.json` version（权威源） |
| 输出格式数 | 12 种 | `src/types/formats.ts` 的 `ALL_FORMATS` |
| i18n 语言 / 键数 | 16 种 / 顶层 **140** 键、递归合计 **209** 键 | 脚本统计 `src/locales/zh-cn.json`（flatten 叶子口径，与 `check:locales` 输出及 `scripts/locale-baseline.json` keyCount 一致；v3.15.5 移除 `moreFormats` 死键，2026-11-07 实算） |
| 测试套件 / 用例 | **51 套件 / 326 用例**（2026-11-13 `vitest run` 实跑：51 个 `*.test.ts` 文件全部通过；v3.18.1 新增 `workerPoolFinalize.test.ts` / `useAsyncRuleProcessing.fallback.test.ts` 2 套件 7 用例，`useLanguage.test.ts` 追加 4 用例） | `vitest run` 为权威计数，本轮已实跑复核 |
| 覆盖率门禁 | 已生效且为真实值；含 `src/utils` + `src/hooks`，门槛 **语句 80 / 分支 75 / 函数 85 / 行 80**；`vitest.config.ts` 显式声明 `all: false` | `vitest run --coverage`；2026-11-13 实测：语句 88.01 / 分支 86.18 / 函数 89.55 / 行 88.01，全部达标且有余量；2026-11-05 第十二轮实测为 88.85 / 85.45 / 91.74 / 88.85；曾以「临时抬阈至 99 → EXIT CODE 1」反证门禁真实生效 |
| 组件规模 | 顶层 **17** 个 `.tsx`（含 `OutputPanel.parts.tsx` / `OutputPanel.formatSelect.tsx` / 新增 `SeoContent.tsx`）+ `OutputPanel.derived.ts` / `InputPanel.types.ts`，`ui/` 8 个（v3.18.0 清理 4 个未被引用的孤儿组件 `Card` / `Loading` / `Switch` / `Tabs`） | `src/components/` 实测（2026-11-12 实算） |
| 源文件 >200 行 | **0** 个（v3.18.1 已将 `src/hooks/useWorkerPool.ts` 由 213 行拆分降回 200 行内；`globals.css` 已于 v3.13.6 拆为 `src/styles/*.css` 8 模块）；2026-11-13 实扫确认 | 行数扫描（2026-11-13 实算） |
| 静态门禁 | `sync-facts.mjs --check` 13 处版本展示位与 package.json 全一致；`check-locales.mjs` 16 语 / 209 键一致；`check-root-clean.mjs` 根目录临时文件洁净度（`rootclean` job） | 2026-11-12 实跑（`sync-facts --check` / `check:locales`）；本机已安装 `node_modules`，`tsc` / `next lint` / `vitest` 待实跑复核 |

> **教训**：本文件中的数据型数字（键数 / 用例数 / 覆盖率 / 行数）历史上多次与实现脱节。修改前务必用脚本实算，禁止凭记忆书写。
> 2026-10-19 复核再次印证：键数、用例数、覆盖率三项均曾长期偏离真实值，且偏差方向不一致，说明凭旧记录继承数字必然失真。

---

## 二、待办任务（未完成，按优先级划分）

> **未完成任务合计：11 项**（2026-11-13 第十九轮审计）：代码质量基线良好——无 >200 行源文件、0 处 `any`、0 处游离 `console.*`、51 套件 326 用例全绿、CI 官方 action 已升 v5/v6；但存在文档漂移、版本硬编码漂移、根因级回归缺口与发布链路验证待办。历史 T-P0~P4 编号任务已归档至 [tasks-done.md](./tasks-done.md)。
> 本清单每条含「目标 / 影响范围 / 验收标准」，覆盖功能、代码质量、性能与兼容性。

### 🔴 P1 - 正确性 · 发布链路 · 安全护栏
- **T-DOC-02 · CHANGELOG 补记内存 5GB 根因修复**
  - 目标：登记 commit `a57f1f3` / `da0f2af` / `dc0f4b4`（useWorkerPool 引用 `useMemo` + 任务单飞 + 回归测试），其修复「引用抖动 → `loadDomainData` 每帧执行 → `runParallel` 堆积克隆大文本」的根因尚未在 3.19.0 变更说明中登记（Unreleased 为空）。
  - 影响范围：变更可追溯性、复盘依据。
  - 验收标准：CHANGELOG 含该根因与修复条目，文件名/行数准确，与 `git log` 一致。
- **T-TEST-01 · 内存根因端到端回归**
  - 目标：新增 `useDomainData` 测试，直接断言挂载后 `loadDomainData` 仅执行一次、无重渲染重入（锁定引用抖动根因），与现有 `useWorkerPool.singleflight.test.ts` 互补。
  - 影响范围：防止 5GB 类回归；`src/hooks` 测试套件。
  - 验收标准：新增用例落入 hooks 套件并全绿；明确断言 effect 不为每帧重入触发解析。
- **T-CI-01 · 验证 CI→Deploy→Release 全绿与自动发版**
  - 目标：确认 v3.19.0 已在 GitHub 产生 Release / `v3.19.0` tag（CI 官方 action 已升 v5/v6），发布链路真实跑通。
  - 影响范围：发布可靠性。
  - 验收标准：Actions 全绿、存在 `v3.19.0` tag 与 Release；若仍红则定位（重点：setup 缓存 / pnpm 11 `frozen-lockfile`）。

### 🟡 P2 - 代码质量 · 文档 · 兼容性增强
- **T-DOC-01 · SPEC §11 文档漂移修正**
  - 目标：`vercel.json` 已删除，但 SPEC §11（line 444）仍描述「vercel.json 额外启用 `require-trusted-types-for` 而 `next.config.js` 不含」的双源 CSP 差异——与现状（单一来源 `next.config.js`）不符。
  - 影响范围：文档准确性、后续安全头修改的误导。
  - 验收标准：SPEC §11 不再引用 `vercel.json`，改为单一来源说明，与 `next.config.js` 实际内容一致。
- **T-VER-01 · 消除 next.config.js 硬编码版本**
  - 目标：`next.config.js` 的 `env.version: '3.19.0'` 为硬编码字符串（非读取 `package.json`），存在 bump 后漂移风险。
  - 影响范围：版本号一致性（页脚 / 构建）。
  - 验收标准：改为构建期从 `package.json` 注入，或纳入 `sync-facts --check` 13 处校验；`pnpm version` 后门禁能检出不一致。
- **T-SEC-01 · 评估启用 `require-trusted-types-for 'script'`**
  - 目标：当前 CSP 未启用 Trusted Types（历史上仅 vercel.json 有、已随文件删除消失）。评估是否启用以增强 XSS 防护。
  - 影响范围：安全头、全部动态 HTML 注入路径。
  - 验收标准：产出评估结论；若启用须确保全部内联/动态 HTML 注入走 TT 策略并提供回归，否则不强行开启。
- **T-A11Y-01 · 无障碍自动化回归**
  - 目标：v3.19.0 已做大量 a11y 改进（lang/dir 同步、对比度、aria-live 收敛、语义化 id），但缺自动化检查（仅单元 + 人工）。
  - 影响范围：WCAG AA 合规可持续性。
  - 验收标准：CI 引入 axe-core / Playwright a11y 检查，关键页面无 critical 违规。

### 🟢 P3 - 性能 · 功能扩展 · 兼容性验证
- **T-PERF-01 · 并行解析主线程切片优化**
  - 目标：`splitIntoShards` 在主线程产生整块文本 + 行数组 + N 份 shard 字符串（峰值 ~3× 文本）；改为 Worker 内按索引切片，主线程峰值降至 ~1×。
  - 影响范围：超大输入（>20000 行）内存；`parseShard.worker.ts` / `useWorkerPool.ts`。
  - 验收标准：单测/基准证明主线程不预切分多份完整副本；50MB 护栏保持不变。
- **T-COMPAT-01 · Node 24 / pnpm 11 强约束兼容**
  - 目标：`engines.node >=24.11.0` + `pnpm@11.24.0` 强约束，需确认贡献者/CI 环境可达且 `pnpm install --frozen-lockfile` 在 Node 24 下无误（历史上 pnpm 11 曾因拒旧 lockfile 致 CI 红）。
  - 影响范围：可构建性、协作门槛。
  - 验收标准：CI 在 Node 24 下 frozen-lockfile 通过；README/DEPLOYMENT 明确 Node 版本要求。
- **T-FEAT-01 · 扩展路由器兼容列表**
  - 目标：SPEC §6 仅列 4 款路由器（Merlin/OpenWrt/小米/华硕/TP-Link）；扩展覆盖 OpenClash/mihomo/华为/中兴等并补对应格式说明。
  - 影响范围：功能覆盖、文档。
  - 验收标准：SPEC §6 更新 + 对应导出格式文档齐备。

### ⚪ P4 - 低优先 / 可选
- **T-SEO-01 · sitemap/robots 多语言 hreflang**
  - 目标：完善 `sitemap` 多语言 `hreflang` 完整性与 `robots.txt` 多语言声明（当前 SEO/GEO 已建）。
  - 影响范围：GEO 抓取。
  - 验收标准：`seo.test.ts` 覆盖多语言 hreflang 一致性与 robots 声明。

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
