# DNS Shield 目录结构与可维护性审查报告

> 审查日期：2026-10-05 ｜ 审查版本：v3.12.0 ｜ 审查范围：全仓（219 文件 / 39594 行）
> 方法：脚本实测（目录树 + 行数 + 引用关系 grep）+ 子代理交叉核验，结论均以实际文件为证据。
> 结论摘要：**结构整体健康**（App Router 惯例清晰、200 行规则达标、无冗余嵌套），
> 真正的风险集中在**「事实副本」与「文档漂移」**，而非目录布局本身。

## 一、整体布局

标准 Next.js 14 App Router 单体应用，非 monorepo。配置集中根目录，文档分三处。

```
根目录   19 项配置/文档 + 9 个顶层目录
src/     app(8) components(27) hooks(16) utils(38) types(4) locales(16)
         config(2) context(1) lib(1) workers(1) test-utils(1)
docs/    SPEC / tasks / CHECKLIST / config.yaml
prototype/  3 个 HTML（设计快照，已冻结）+ 4 个 md
scripts/ 9 个 .mjs + lib/ 3 个    public/ 12 产物 + 图标 + SW
.github/ 4 workflow + composite action + 6 社区文件 + 3 issue 模板
openwrt-package/  LuCI 包（Makefile / lua / root / usr）
```

## 二、顶层目录用途与评价

| 目录 | 用途 | 评价 |
|---|---|---|
| `src/app` | 路由 + 布局 + 全局样式 + `(seo)/` 组 | 清晰；`Home.tsx` 是组件却留在 app/（P2，待迁移） |
| `src/components` | 业务组件 + `ui/`（12 个 shadcn） | 清晰，`ui/` 已用目录区分 |
| `src/hooks` | 14 个 `use*` | 混入非 hook：`autosaveStorage.ts`（存储层）、`useLineNumbers.ts`（纯函数） |
| `src/utils` | 30 个 `.ts`（16 个测试） | 承担三类职责：纯逻辑 / 存储层(idb,httpCache,cachedFetch) / 集成配置(analytics) |
| `src/types` | 4 文件，`index.ts` 为 barrel | 清晰 |
| `src/locales` | 16 语言 JSON | 清晰 |
| `src/config` | 预设源 + `version.ts` + `defaults.json` | 清晰 |
| `src/workers` | Web Worker 入口 | 清晰 |
| `src/test-utils` | 测试辅助（renderHook） | 清晰，已排除出覆盖率统计 |
| `scripts` + `scripts/lib` | 生成/校验脚本，已按 200 行规则拆分 | 清晰 |
| `public` | 12 产物 + 图标 + `service-worker.js` + `brand-colors.md` | 文档混入（`brand-colors.md`） |
| `docs` | 4 文件，职责不重叠 | 清晰 |
| `prototype` | 设计留档 | **已冻结为快照**（v3.12.0 起不再回填） |
| `openwrt-package` | LuCI 包 | `po/zh_Hans/` 为空占位目录 |

## 三、文件命名规范

一致度较高：组件 PascalCase、hooks `use*`、utils camelCase、脚本 kebab-case `.mjs`、配置 camelCase。

例外与说明：

- 点号后缀表达「拆分自谁」：`OutputPanel.parts.tsx`、`OutputPanel.derived.ts`、`translation.parts.ts`、`rulesGenerator.extra.test.ts`（社区非惯例，但意图清晰，保留）
- `docs/tasks.md` 小写是 SPEC 固化的例外（任务唯一来源规则）

## 四、模块划分

**清晰**：`useHomeController`（197 行）编排 + `Home.tsx`（94 行）渲染；`OutputPanel` 三件套拆分；worker 独立目录；脚本按 200 行规则拆分。

**待收敛（本轮未做，见第八节）**：`utils/` 混合层（纯逻辑 / 存储层 / 配置）、`parseLine.ts`·`domainValidator.ts`·`domainPrimitives.ts` 职责交叠、`app/Home.tsx` 位置。

## 五、冗余与不合理嵌套（2026-10-05 实测）

| 项 | 判定 | 处置 |
|---|---|---|
| `src/utils/statsAggregator.ts` | 生产零引用；其统计语义（原始条目）与 `parser.ts` 内联统计（过滤后结果）**不同**，属投机实现 | **已删除**（含其测试） |
| 根目录 `{const`（0 字节）、`_pnpm_err.txt`、`_yaml_out.txt`、`tsconfig.tsbuildinfo` | shell / 构建残留 | **已删除** |
| `metadata.json` | AI Studio 元数据格式（含 `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`），全仓零引用 | **已删除** |
| `pnpm-workspace.yaml` | `allowBuilds` 值为字面占位串 `set this to true or false`，且无 `packages:` 字段 | **已删除** |
| `docs/CHECKLIST.md` 与 SPEC §5.3 冲突 | 用 `- [ ]` 但被规范禁止 | 已在 SPEC 增加豁免条款 |
| `README.md` 幻影文件（`uiUtils.ts`/`manifest.ts`/`sw.js`/`sw-register.ts`） | 文档列出但文件不存在 | **已更正**为真实路径 |
| `README.md` 社区文件链接指向根目录 | 实际在 `.github/`，4 处链接失效 | **已更正** |
| `public/brand-colors.md` | 文档混入静态资源目录 | 保留（品牌色板随资源分发），登记为已知例外 |

## 六、配置与源码分离

分离良好（配置集中根目录），但**同一事实存在多份副本**，本轮已处理真冲突：

| 事实 | 处置 |
|---|---|
| CSP 安全头 `next.config.js`（4 头）vs `vercel.json`（8 头） | **已统一**：以 `vercel.json` 为准回写 `next.config.js`（补 HSTS/COOP/CORP/X-Frame-Options，`frame-ancestors` 由 `*` 收紧为 `none`，移除生产不需要的 `unsafe-eval`） |
| settings 默认值两份且 `ipv4` 冲突（`127.0.0.1` vs `0.0.0.0`） | **已收敛**为 `src/config/defaults.json`（TS 与 Node 脚本双端可读） |
| 版本号 40+ 处手工同步 | **已脚本化**：`scripts/sync-facts.mjs`（13 处展示位）+ CI 硬门禁；脚本故意不覆盖 `CHANGELOG`（历史）与 `prototype/`（快照） |
| `scripts/count-domains.mjs --write` 硬编码 `版本:: 3.7.34` | **已修**：改读 `package.json`（此前一次执行就会把 3 个产物头部写回旧版本） |
| 格式数量 12 / 域名计数 4 个不同值 | 产物清单已单一来源（`--list-files`）；文档中的数字仍为人工维护，登记为已知债务 |

## 七、测试与文档目录

**测试**：16 个 `.test.ts` 原集中在 `src/utils/`；本轮新增 4 个 hooks 测试（`useSettings`/`useLanguage`/`useModalA11y`/`useVirtualList`），`coverage.include` 扩至 `src/utils` + `src/hooks`。环境策略：默认 `node`，hooks 用例以 `// @vitest-environment jsdom` 逐文件声明。
未覆盖：`components/`、`app/`（缺真实渲染断言，属已知债务）。

**文档**：`docs/` 职责清晰（SPEC 规范 / tasks 唯一任务源 / CHECKLIST 发布验收 / config.yaml）。
已修：CHECKLIST 豁免条款、原型冻结标注、README 幻影与失效链接。
遗留：`docs/SPEC.md` 结构树仍不全（未收录 `workers/`、`(seo)/`、`types/formats.ts`、`test-utils/`），本次未逐项补齐。

## 八、可改进点（按严重度，供后续排期）

| 级别 | 改进点 | 理由 |
|---|---|---|
| P1 | hooks 层仅 4 个钩子有测试，`useHomeController`/`useDomainData`/`useRules`/`useUrlManager` 等编排层仍无自动化保护 | 竞态与守卫逻辑最密集处，改动风险最高 |
| P1 | 文档中的数据型数字（格式数量、域名计数、组件数、依赖版本表）仍人工维护，`docs/SPEC.md` 依赖表已与 `package.json` 漂移 | 事实漂移是本仓最大长期成本 |
| P2 | `utils/` 混合层未拆 `storage/`、`domain/`；`hooks/` 混有非 hook；`app/Home.tsx` 未归位 | 结构清晰度 |
| P2 | `docs/SPEC.md` 结构树补齐（`workers/`、`(seo)/`、`types/formats.ts`、`test-utils/`） | 文档准确性 |
| P3 | 交互测试（组件级）需引入真实渲染断言 | 当前 200 行规则与 hooks 门禁已够，优先级低 |
| P3 | `openwrt-package/po/zh_Hans/` 空目录、`public/brand-colors.md` 位置 | 轻微整洁度 |

## 九、方法论沉淀

- 审查前先跑脚本取事实（目录树 + 行数 + 引用 grep），子代理结论一律回读文件核实
- 发现 unused import 时**先查历史**确认是否丢了 JSX（v3.11.1 曾因此找回丢失的格式切换 UI）
- 修复「事实副本」优先脚本化 / 单一来源，而非再加一处手工同步
