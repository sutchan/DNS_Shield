# DNS Shield 文档中心

> 文档集版本：v3.22.4 · 最后审查：2026-11-26 · 适用产品版本：v3.22.4
> 权威版本源：`package.json` 的 `version` 字段；`next.config.js` 的 `env.version` 在构建期由它派生；`src/config/version.ts` 的 `APP_VERSION` 为运行时展示常量，由 `src/config/version.test.ts` 断言与权威源一致。
> 本文档集随产品版本演进；每次变更按 [§4 版本控制](#4-版本控制) 更新头部信息。

## 目录

- [1. 文档导航](#1-文档导航)
- [2. 阅读路径建议](#2-阅读路径建议)
- [3. 术语表（全文统一用词）](#3-术语表全文统一用词)
- [4. 版本控制](#4-版本控制)
- [5. 文档维护规则](#5-文档维护规则)

## 1. 文档导航

| 编号 | 文档 | 覆盖范围 | 权威级别 |
|------|------|----------|----------|
| 00 | [文档中心（本文）](./README.md) | 目录、索引、术语表、版本控制 | 索引 |
| 01 | [项目概述](./01-overview.md) | 背景、目标、技术栈选型、架构设计 | 权威 |
| 02 | [安装与部署](../DEPLOYMENT.md) | 环境依赖、配置、多环境部署、验证方法 | 权威 |
| 03 | [功能模块说明](./03-modules.md) | 模块划分、流程图、关键逻辑 | 权威 |
| 04 | [API 接口文档](./04-api.md) + [OpenAPI 3.1 定义](./openapi.yaml) | HTTP 接口、参数、返回、错误码、调用示例 | 权威 |
| 05 | [用户操作指南](./05-user-guide.md) | 角色权限、操作流程图、详细步骤 | 权威 |
| 06 | [FAQ 与故障排除](./06-faq-troubleshooting.md) | 常见问题、诊断路径、恢复方法 | 权威 |
| 07 | [优化建议与未来展望](./07-improvements.md) | 代码/架构/性能/UX 改进建议 | 规划 |
| — | [系统规范 SPEC](./SPEC.md) | 需求与实现约束（规则级权威） | 规范 |
| — | [发布检查清单](./CHECKLIST.md) | 发版逐项验收 | 规范 |
| — | [临时文件管理规范](./TEMP-FILES.md) | `.tmp/` 唯一合法临时目录、自动创建/清理、门禁判定 | 规范 |
| — | [任务清单](./tasks.md) / [已完成任务](./tasks-done.md) | 未完成 / 已完成工作 | 管理 |
| — | [变更日志](../CHANGELOG.md) | 版本发布历史 | 历史 |
| — | [审计报告 v3.19.0](./AUDIT-REPORT-v3.19.0.md) / [结构审查](./STRUCTURE-REVIEW.md) | 阶段审计证据 | 历史 |

层级约定：`SPEC.md`（约束）> 本索引所列各模块文档（说明）> `prototype/`（冻结的设计快照，`prototype/README.md` 已声明）。文档之间出现冲突时，以代码与 `SPEC.md` 为准，并把冲突登记到 `docs/tasks.md`。

## 2. 阅读路径建议

- **终端用户**：[05 用户操作指南](./05-user-guide.md) → [06 FAQ 与故障排除](./06-faq-troubleshooting.md)
- **部署 / 运维人员**：[01 项目概述](./01-overview.md) → [02 安装与部署](../DEPLOYMENT.md) → [04 API](./04-api.md)
- **开发者 / 贡献者**：[01 项目概述](./01-overview.md) → [03 功能模块](./03-modules.md) → [SPEC](./SPEC.md) → [07 优化建议](./07-improvements.md)
- **审计 / 版本管理**：[本索引](#4-版本控制) → [发布检查清单](./CHECKLIST.md) → [变更日志](../CHANGELOG.md)

## 3. 术语表（全文统一用词）

| 术语 | 定义 | 代码中对应 |
|------|------|-----------|
| 域名数据源 | 唯一事实来源，含黑名单、白名单与改道行 | `public/domains.txt` |
| 规则产物 | 由数据源派生的 12 种格式文件 | `public/*.conf` / `*.txt` / `*.db` / `*.yaml` |
| 输出格式 | 规则的目标语法（共 12 种） | `src/types/formats.ts` 的 `ALL_FORMATS` |
| 黑名单 | 需要拦截的域名条目 | 普通域名行 |
| 白名单 | 放行条目，`+domain` 前缀 | `+` 前缀行 / `@@\|\|domain^` |
| 改道 / 自定义解析 | 把域名指向指定 IP，`@domain=ip` | `@` 前缀行 / `address=/domain/ip` |
| 解析 | 把任意格式输入转为统一域名条目的过程 | `parseDomainLine` / `parser.ts` |
| Worker 分片 | 大输入按行边界切分后由 Web Worker 并行解析 | `useWorkerPool.ts` / `parseShard.worker.ts` |
| 单飞 | 相同输入复用同一解析任务，避免重复派发 | `useWorkerPool.ts` 内容键 |
| 草稿 | 用户本地未导出的编辑内容，优先于远端清单 | `src/hooks/useAutosave.ts` |
| 端点 | 本项目仅指真实存在的 HTTP 路由（见 [04 API](./04-api.md)） | `src/app/**/route.ts` |

术语规则：中文正文首次出现术语时给出英文或代码标识；格式名称保留官方写法（AdGuard Home、Pi-hole、BIND RPZ、Clash Meta、Mosdns、CoreDNS）；版本写作 `v3.20.1`，文件写作 `path/to/file.ts`。

## 4. 版本控制

| 项 | 约定 |
|----|------|
| 产品版本 | SemVer，唯一权威源 `package.json`；`src/config/version.ts` 与 `next.config.js` 的 `env.version` 在构建期由其派生，`sync-facts.mjs` 仅同步 12 处文档展示位（不覆盖这两个源码文件） |
| 文档版本 | 每篇文档头部标注「文档集版本 / 最后审查 / 适用产品版本」；产品 bump 时只更新头部与展示位，历史小节不回填 |
| 变更记录 | 用户可见变更写入 `CHANGELOG.md`；规范约束变更写入 `SPEC.md`；未完成工作写入 `tasks.md` |
| 校验门禁 | `node scripts/sync-facts.mjs --check`（版本展示位一致）、`node scripts/check-locales.mjs`（16 语 / 214 递归键，zh-cn 顶层 144 键）、`node scripts/check-root-clean.mjs`（根目录洁净） |
| 冻结快照 | `prototype/` 为设计留档，除语义化 id 外不回填功能；`docs/AUDIT-REPORT-v3.19.0.md` 等审计报告按当时状态保留 |

## 5. 文档维护规则

1. 事实性数字（域名数、键数、用例数、覆盖率、格式数、文件行数）必须脚本实算后填写，禁止凭记忆。
2. 与代码冲突的描述先修代码或文档，并把待验证项写入 `docs/tasks.md`，不得在两处各留一个版本。
3. 新增文档须在本索引登记编号、覆盖范围与权威级别；禁止在仓库根目录分散新建说明文件。
4. 文档文件（`.md`）不按 200 行规则拆分，优先保证章节连贯；代码文件仍按 ≤200 行规则拆分。
5. 流程图统一使用 Mermaid，节点 id 使用 kebab-case 语义命名，与代码中的 DOM id 约定一致。
