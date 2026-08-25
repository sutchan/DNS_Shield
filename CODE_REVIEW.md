# DNS_Shield 代码审查标准与流程

> 适用范围：`E:\Github\DNS_Shield`（DNS_Shield，Next.js 14 + React 18 + TypeScript 5 + Tailwind + Radix + Vitest）
> 文档定位：团队统一执行的代码审查规范与可操作清单
> 配套文件：`.github/PULL_REQUEST_TEMPLATE.md`（提交前自查）、`.github/workflows/ci.yml`（质量门禁）

---

## 一、审查目标与范围

**目标**：在合并前拦截缺陷、统一代码风格、保障安全与性能基线，使团队交付质量可预期、可度量。

**审查范围**：
- 所有进入 `main` 分支的 PR（无论大小）
- 审查对象：新增/修改的 `.ts` / `.tsx` / 配置文件 / 脚本
- 重点维度：命名、结构、可读性、错误处理、安全性、性能、测试覆盖、类型安全、可访问性、日志规范

**不审查**：第三方依赖内部实现、自动生成文件（lockfile、构建产物 `.next/`）

---

## 二、审查角色与职责

| 角色 | 职责 |
|------|------|
| **Author（作者）** | 提交前按本规范自查（见 PR 模板清单）；确保 lint/test/build 通过；回应评审意见 |
| **Reviewer（审查者）** | 按问题分级给出结论；重点核查安全/错误处理/性能；在 1 个工作日内完成首轮评审 |
| **Maintainer（维护者）** | 终审合并；对 🔴 Blocker 拥有一票否决权；保障门禁配置有效 |
| **Bot（自动化）** | CI 自动执行 lint + 测试 + 覆盖率 + 构建（见 `ci.yml`）；不替代人工评审，仅作基线拦截 |

---

## 三、审查触发时机

| 时机 | 触发条件 | 执行方 | 说明 |
|------|----------|--------|------|
| **Pre-commit** | 本地提交前 | Author + 本地钩子 | 运行 `npm run lint` 与 `npm test` |
| **Pre-merge** | PR 发起 / 推送到分支 | Reviewer + CI | 人工评审 + `ci.yml` 质量门禁必须通过 |
| **Periodic（定期）** | 每个版本迭代 / 月度 | Maintainer | 针对技术债务、架构演进做专项复审 |
| **Release** | 发版前 | Maintainer | 安全审计、依赖漏洞扫描（`npm audit`）、CHANGELOG 核对 |

---

## 四、代码质量评定标准

### 4.1 命名规范
- 变量/函数采用语义化驼峰；组件用 PascalCase；常量用 UPPER_SNAKE
- 禁用无意义命名（`data1`、`tmp`、`foo`）；布尔变量加 `is`/`has`/`should` 前缀

### 4.2 代码结构
- 单一职责：纯逻辑（无 React/DOM）归入 `src/utils/`；含 React/DOM 的视图辅助归入 `hooks/` 或 `components/`
- 避免超过 3 层嵌套；函数长度建议 ≤ 60 行，超长需拆分

### 4.3 可读性
- 复杂分支/算法附精简注释；避免逐行注释噪音
- 禁止提交大段调试代码与 `console.*`

### 4.4 错误处理
- 外部输入（URL、文件名、用户文本）必须校验（`isValidHttpUrl`、`sanitizeFilename` 等）
- 异常需 `try/catch` 捕获，并以 toast / UI 错误态反馈；**禁止**把原始错误栈直接 `console` 透出到生产

### 4.5 安全性（高优先级）
- 输出渲染使用 React 文本节点，**禁用** `dangerouslySetInnerHTML`（结构化数据 JSON-LD 等可信静态内容除外）
- 无硬编码密钥 / Token；敏感配置走环境变量（`NEXT_PUBLIC_*`）
- 远端拉取设体积上限（10MB）与超时，防 DoS
- CSP（见 `next.config.js`）保持严格；放宽 `connect-src` 前需评估是否破坏"用户自定义 URL 拉取"等功能

### 4.6 性能
- 传给 `React.memo` 组件的回调必须 `useCallback` 稳定，避免 props 身份抖动导致 memo 失效
- 耗时计算（解析、生成）加防抖或 `useMemo` 缓存
- 大列表渲染评估 `content-visibility` / 虚拟滚动

### 4.7 测试覆盖
- 目标：**核心逻辑层（`src/utils`）≥ 80% 行覆盖**
- 新增/修改逻辑须同步补充单测；hooks / 组件层逐步补齐（React Testing Library）

### 4.8 类型安全
- `tsconfig` 开启 `strict`，禁止用 `any` 绕过；`tsc --noEmit` 必须通过

### 4.9 可访问性
- 交互元素具备 `aria-*` 与 `label`；表单字段与 `<label>` 正确关联；折叠区使用 `aria-hidden`

### 4.10 日志规范
- 生产路径**不得**出现 `console.*`；调试日志统一经 `src/utils/logger`（生产环境经 `NODE_ENV` 自动抑制）

---

## 五、问题分级与处理机制

| 级别 | 含义 | 处理要求 |
|------|------|----------|
| 🔴 **Blocker** | 阻断性缺陷（安全漏洞、数据丢失、构建失败） | 必须修复并复验后方可合并；Maintainer 可一票否决 |
| 🟡 **Suggestion** | 应修复（明显可改进、潜在隐患、规范偏离） | Reviewer 提出，Author 需回应（修复或说明理由）；争议由 Maintainer 裁决 |
| 💭 **Nit** | 可选优化（风格、命名偏好、锦上添花） | 鼓励采纳，不阻塞合并 |

**处理流程**：
1. Reviewer 在 PR 中按分级留评，关联对应标准条款（如「4.5 安全性」）
2. Author 修订后 `@` 提醒 Reviewer 复验；🔴/🟡 必须标记「已解决」
3. 全部 🔴 解决 + CI 门禁通过 + 至少 1 名 Reviewer Approval → Maintainer 合并

---

## 六、审查反馈与持续改进

- **反馈闭环**：每次评审结论沉淀至 PR 评论；共性问题在迭代复盘会上同步
- **规范演进**：本文件随项目演进由 Maintainer 修订，重大变更需团队评审
- **度量**：以 CI 覆盖率报告、PR 平均评审轮次、🔴 漏出率为质量度量指标
- **知识沉淀**：典型缺陷与优化案例写入团队 wiki / 本仓库 `openspec/`

---

## 七、CI 集成（质量门禁）

`.github/workflows/ci.yml` 在 PR / 推送 `main` 时自动执行：

```bash
npm ci            # 安装依赖（含 @vitest/coverage-v8）
npm run lint      # ESLint（next lint）
npm run test:coverage   # Vitest + 覆盖率，产物上传至 artifacts
npm run build     # 生产构建
```

> 覆盖率当前仅覆盖 `src/utils`；hooks / 组件层测试补齐后，建议在 `vitest.config.ts` 引入 `coverage.thresholds` 强制 ≥ 80% 门禁。

---

## 八、提交前自查清单（速查）

见 `.github/PULL_REQUEST_TEMPLATE.md` 的「代码审查自查清单」段落（10 类标准逐项勾选）。
