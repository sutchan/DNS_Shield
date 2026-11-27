# CSP / Trusted Types 启用评估结论（T-SEC-01 / O-08）

> 最后审查：2026-11-27（与 package.json v3.22.5 对齐） · 文档集版本：v3.22.5
> 权威级别：评估结论交付物 · 评估日期：2026-11-25 · 评估对象：`next.config.js` 生产 CSP、`src/app/layout.tsx` 与 `src/app/about/page.tsx` 的内联脚本。
> 本文是 **T-SEC-01 的交付物**（任务为「评估启用」而非强制启用）；任务已归档至 [tasks-done T-SEC-01](./tasks-done.md)，本文只保留结论与证据，不维护状态。

## 现状取证

1. 生产 `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com`（`next.config.js` 的 `securityHeaders`，约 `:43`；dev 额外追加 `'unsafe-eval'`）。
2. 共 3 处 `dangerouslySetInnerHTML`：
   - `src/app/layout.tsx:39`：首屏 lang/dir/主题初始化脚本，必须同步内联以避免 FOUC 与 RTL 跳动。
   - `src/app/layout.tsx:46`：站点级 JSON-LD（`<script type="application/ld+json">`）。
   - `src/app/about/page.tsx:35`：关于页 FAQPage / HowTo JSON-LD（同上）。
3. `vercel.json` 已删除，CSP 为 `next.config.js` 单一来源（历史遗留疑问已关闭）。

## 逐项评估

### 首屏初始化脚本 → 可加 hash，收益有限

- 脚本内容由 `LANGUAGE_CODE_PATTERN` 静态派生，编译期字节稳定（实测 SHA-256：`sha256-aREAFAIWUILcsubyAvUkgWEt60elZoaS8Db6+0Ps/DA=`）。
- 但 Next.js 渲染可能改写内联脚本（空白/转义），hash 需与实际传输字节严格一致，CI 需加「构建产物 CSP hash 断言」防漂移；否则一旦语言清单调整（16→17 语）hash 失配会导致首屏脚本被拦截、语言/主题回退。
- 结论：**技术上可行，但需配套 hash 同步机制**，不宜在评估任务内直接合入。

### JSON-LD 脚本 → 不适合 hash/nonce

- `application/ld+json` 内容随数据（域名计数、FAQ、JSON-LD 实体）动态变化，无法静态 hash。
- 非 JS MIME 类型不进入 `require-trusted-types-for 'script'` 的执行路径，Trusted Types 对其无实际收益。
- 结论：**保持内联**，是 SEO/GEO 首屏可抓取性的必要设计。

### Trusted Types → 暂不启用

- 3 处写入均为受控静态内容（无用户输入拼接），当前 `'unsafe-inline'` 的攻击面主要来自 XSS 注入点；项目已对 JSON-LD 做序列化转义（`serializeJsonLd`），对 URL 做白名单校验。
- 启用 `require-trusted-types-for 'script'` 后，Next/React 自身运行时与第三方脚本（GA）可能触发违规，需 staging 灰度验证；当前无 staging 环境。
- 结论：**条件不成熟**，待具备 staging 灰度与 CSP 违规上报后再评估。

## 最终结论

- **不在本轮移除 `'unsafe-inline'`**：动态 JSON-LD 是硬约束，首屏脚本 hash 需配套同步机制，Trusted Types 缺灰度环境。
- 已落地的安全面收敛（与本评估同属 CSP 强化）：出站聚合 fetch 加 host 白名单与体积上限（T-AUD-L02，已闭环）；`frame-src/frame-ancestors 'none'`、`object-src 'none'`（生产）、HSTS/COOP/CORP（既有）；客户端 `connect-src` 已由 `'https:'` 通配收敛为枚举 host，与 `edgeone.json` 由 `check-security-headers.mjs` 保持一致（T-AUD-M02，已归档）。
- **再评估触发条件**：(1) 具备 staging 灰度；(2) 引入 CSP Report-Only 违规上报；(3) 语言清单稳定且可接受 hash 同步成本。满足后按 [SPEC §5.3](./SPEC.md#53-任务记录规范强制) 登记新任务，不在已归档的 T-SEC-01 下继续挂起。

## 复用资源

- 首屏脚本 hash 计算方式：`createHash('sha256').update(scriptSource).digest('base64')`，`s` 为 `src/app/layout.tsx:39` 的模板字符串实际渲染字节（含 `LANGUAGE_CODE_PATTERN` 展开值）。
