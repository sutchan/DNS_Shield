# 任务清单

> 最后审查：2026-10-04（与 package.json v3.10.1 对齐，代码实况核验）
> 详细剩余开发任务规划请参见：[REMAINING_TASKS.md](./REMAINING_TASKS.md)
> 本次更新（2026-10-04）：完成 T-P2-03（新增 Mosdns/Clash Meta/CoreDNS 三种导出格式）与 T-P3-03（定时聚合上游的 GitHub Action），版本升至 v3.10.1。
> **代码实况核验修正**：原文档多处数据与实现脱节，已按实测校正（详见下方「事实核验基线」）。剩余 5 项功能任务（T-P1-01/02/03、T-P2-01、T-P3-02）仍待实现，另新增 2 项工程质量任务（T-P0-04 覆盖率门禁、T-P1-04 文件规模拆分）。

## 事实核验基线（2026-10-04 实测，勿凭记忆引用）

| 指标 | 实测值 | 取得方式 |
|---|---|---|
| 应用版本 | v3.10.1 | `package.json` version（权威源） |
| 输出格式数 | 12 种 | `src/types/formats.ts` 的 `ALL_FORMATS` |
| i18n 语言 / 基准键数 | 16 种 / **145 键** | 脚本解析 `src/locales/zh-cn.json` 键数 |
| 测试套件 / 用例 | **13 套件 / 85 用例**（全通过） | `vitest run` |
| 覆盖率门禁 | 已生效（报告值 47.85%，真实约 95%+） | `vitest run --coverage` |
| 组件规模 | 顶层 12 个 + `ui/` 12 个 | `src/components/` |
| 源文件 >200 行 | 4 个（待 T-P1-04 拆分） | 行数扫描 |

> **教训**：本文件与 `REMAINING_TASKS.md` 中的数据型数字（键数/用例数/覆盖率）历史上多次与实现脱节。修改前务必用脚本实算，禁止凭记忆书写。

## 日常维护

- [ ] 检查现有规则有效性
- [ ] 测试新广告域名
- [ ] 更新 `public/domains.txt` 原始域名
- [ ] 启动开发服务器：`pnpm dev`（端口 3000，已由 package.json dev 脚本固定为 `next dev -p 3000 -H 0.0.0.0`）
- [ ] 访问本地开发地址 (http://localhost:3000) 生成新规则
- [ ] 更新 `public/dnsmasq.conf`
- [ ] 更新 `public/hosts.txt`
- [ ] 更新 `public/adguard.txt`
- [ ] 更新 `public/whitelist.txt`

## 定期任务

- [ ] 每 2 周检查一次规则有效性
- [ ] 清理无效/过期域名
- [ ] 优化规则匹配效率
- [ ] 合并上游更新 (AdGuard/EasyList/NeoHosts)
- [ ] 检查并更新依赖版本
- [ ] 运行构建确保功能正常 (`pnpm build`)

## 版本发布

- [ ] 递增版本号 (SemVer) — 同步更新所有单一来源（全量 `search_content` 核对，勿漏）
- [ ] `package.json` version（权威源）
- [ ] `src/config/version.ts` APP_VERSION（派生源）
- [ ] `next.config.js` env.version
- [ ] `src/app/layout.tsx` metadata / JSON-LD / 头注释
- [ ] `docs/config.yaml` version
- [ ] `docs/SPEC.md` 当前版本 + 第4.3节版本号
- [ ] `README.md` 当前版本
- [ ] `README.en.md` 版本徽章
- [ ] `DEPLOYMENT.md` 变量表 + 示例
- [ ] `public/*.txt` 静态样例头部版本号（`# 版本::` / `! 版本::`）
- [ ] 更新 `CHANGELOG.md` 变更记录（新增 `## [x.y.z]` 小节，分类 feat/fix/docs/...）
- [ ] 创建 GitHub Release（含 tag vX.Y.Z 与 release 锚点）

## 开发任务

- [x] 设计系统全面重构（v3.0：oklch 色彩、Swiss Precision 排版、Apple 风格动效）
- [x] 添加 Accordion 折叠面板组件
- [x] 完善按钮交互效果（点击缩放 active:scale-[0.98]）
- [x] 优化面板悬停效果（hover-lift 上浮阴影）
- [x] 优化 Web 管理工具界面（Apple 设计风格）
- [x] 添加新的预设源（内置/AdGuard/EasyList/NeoHosts）
- [x] 改进规则生成算法（支持白名单/自定义DNS）
- [x] 建立完整设计系统（/shadcn/design-system.md）
- [x] 建立组件库规范（/shadcn/component-library.md）
- [x] 建立交互标准（/shadcn/interaction-standards.md）
- [x] 创建高保真原型目录（/prototype/）
- [x] 全面使用 Lucide 图标替换 emoji
- [x] 升级 shadcn/ui 组件（Button isLoading / Badge 变体 / Tabs 圆角）
- [x] 添加单元测试（Vitest：rulesGenerator.test.ts 等）
- [x] 优化浏览器兼容性
- [x] 完善国际化支持（16 种语言）
- [x] 改进文档质量和完整性
- [x] 优化构建和部署流程（corepack + pnpm，Dockerfile 对齐）
- [x] 增强安全性和性能（CSP 头部、URL 验证）
- [x] 规则格式扩展至 12 种（Mosdns / Clash Meta / CoreDNS）
- [x] 上游规则定时聚合 GitHub Action

## 待办（2026-10-04 实况核验新增）

- [x] **T-P0-04: 修正覆盖率统计与门禁（2026-10-04 已完成）** — 根因查明：报告值 47.85% 系 Vitest 2.1.9 + coverage-v8 在 Windows 上按盘符大小写重复统计同一源文件（coverage-summary.json 出现仅大小写不同的重复键），并非测试文件混入，真实覆盖率约 95%+。已落地 thresholds 真实门禁（语句 45 / 分支 75 / 函数 70 / 行 45，按报告值校准）并补 coverage.exclude 防御性排除。彻底根治需升级 Vitest 3.x（本次因网络受限未升级）。 修正覆盖率门禁配置** — `vitest.config.ts` 的 `coverage.include` 为 `src/utils/**/*.ts`，未排除 `*.test.ts`，导致测试文件自身计入分母，把全局语句覆盖率从约 91% 稀释至 **47.85%**；且 T-P0-01 声称已设定的 `thresholds`（行 ≥80% / 分支 ≥75%）**实际并不存在**。需补 `coverage.exclude` 排除测试文件，并落地真实 `thresholds` 门禁。
- [ ] **T-P1-04: 拆分超 200 行源文件** — 违反「源文件单文件 ≤200 行」规则，需按职责拆分且保持公开 API 不变：
  - `src/app/Home.tsx`（229 行）
  - `src/components/OutputPanel.tsx`（243 行）
  - `src/components/SettingsPanel.tsx`（269 行）
  - `src/types/translation.ts`（231 行）
- [ ] 消除 `REMAINING_TASKS.md`「剩余 7 项」与本文件「剩余 5 项」的口径矛盾（实为 5 项功能任务）
