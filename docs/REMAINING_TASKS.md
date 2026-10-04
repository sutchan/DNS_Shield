# DNS Shield 剩余开发任务清单 (Remaining Development Tasks)

> 版本对齐：v3.10.0
> 审查时间：2026-10-04（本次更新）
> 维护团队：Sut / ArcesTeam

> **最近更新时间戳**：2026-10-04 — 核对代码真实状态后更新文档：T-P0 全完成（覆盖率门禁 / 核心模块单测 / 生产日志收敛均已落地）、T-P2-02（规则测试器）/ T-P3-01（路由器脚本）已落地。剩余 7 项为 P1 性能（Web Worker / 虚拟滚动 / IndexedDB）、P2 进阶（分类标签 / 多格式扩展）、P3 生态（LuCI 包 / 定时聚合 Action），详见下方状态。

---

## 📊 一、当前开发进度全景

```
[███████████████████████░] 94% 全局就绪度
```

| 模块 / 维度 | 完成度 | 状态 | 关键成果 |
|---|:---:|:---:|---|
| **核心规则生成引擎** | 100% | ✅ 稳定 | 支持 12 种输出格式（含 Mosdns/Clash Meta/CoreDNS）、通配符/白名单/自定义DNS前缀解析、高效去重与排序 |
| **Web 交互界面 (GUI)** | 98% | ✅ 完善 | Swiss Precision 排版、规则测试弹窗、路由器脚本弹窗、FlowViz 动效 |
| **国际化 (i18n)** | 100% | ✅ 完成 | 16 种多语言本地化 (195 键完整覆盖)，自动校验脚本 `check:locales` 100% 通过 |
| **单元测试 (Unit Test)** | 98% | ✅ 优秀 | Vitest 13 个测试套件、82 个测试用例全部通过 |
| **测试覆盖率与 CI 门禁** | 95% | ✅ 完成 | 已配置 `@vitest/coverage-v8` 门禁，全工程语句覆盖率 91.9%，函数 92.68% |
| **域名规则匹配与测试引擎** | 100% | ✅ 完成 | 完整实现域名/URL匹配分析引擎与前端交互弹窗 |
| **路由器自动化同步脚本** | 90% | ✅ 完成 | 支持 OpenWrt、Merlin、Padavan、SmartDNS、Pi-hole 自动化更新脚本一键生成 |
| **超大规模数据性能 (Web Worker)** | 40% | ⏳ 待开发 | 50,000+ 级大规模域名解析主线程卡顿优化与分片计算 |

---

## 🎯 二、剩余开发任务清单 (按优先级划分)

### 🔴 P0 - 核心工程与质量门禁 (已完成)

- [x] **T-P0-01: 补充测试覆盖率工具链与阈值门禁**
  - 安装并配置 `@vitest/coverage-v8`
  - 在 `vitest.config.ts` 中设定覆盖率门禁（行覆盖率 ≥ 80%，分支覆盖率 ≥ 75%）
  - 实测达到 91.9% 行覆盖率与 87.16% 分支覆盖率
- [x] **T-P0-02: 补充关键工具与核心模块单元测试**
  - 为 `ruleMatcher.ts`、`scriptGenerator.ts`、`statsAggregator.ts`、`buildFlowPool.ts` 等增加全覆盖单元测试
- [x] **T-P0-03: 规范生产环境日志输出**
  - 统一收敛 `console.error` 与 `console.warn` 到 `src/utils/logger.ts`，基于 `NODE_ENV` 实现生产环境日志静默

---

### 🟡 P1 - 性能优化与大数据集体验 (重要特性 / 持续迭代)

- [ ] **T-P1-01: 引入 Web Worker 实现异步规则解析与去重**
  - 将大文本解析 (`parser.ts`)、排序去重 (`sortDedupe.ts`) 与格式转换移入 Web Worker
  - 避免在导入 100,000+ 条域名时造成主线程 UI 卡顿
  - 增加流式处理进度条与处理耗时统计
- [ ] **T-P1-02: 编辑器与预览区域虚拟滚动 (Virtual Scrolling)**
  - 针对大文本预览，集成虚拟渲染机制，降低超长 DOM 节点的内存占用与渲染延迟
- [ ] **T-P1-03: 离线与增量存储优化 (IndexedDB)**
  - 使用 IndexedDB 替代 LocalStorage 存储超长自定义规则列表，突破 LocalStorage 5MB 限制
  - 实现预设源与远程 URL 规则的增量缓存与 ETag 校验

---

### 🟢 P2 - 规则引擎进阶功能与工具链 (持续迭代)

- [x] **T-P2-02: 在线 DNS 拦截规则匹配测试器 (Rule Tester)**
  - 在 Web 界面提供「测试特定域名」输入弹窗 (`RuleTesterModal.tsx`)
  - 实时分析输入域名是否命中当前白名单、黑名单或通配符规则，并高亮匹配的具体行
- [ ] **T-P2-01: 域名分类与标签过滤系统**
  - 增加按类别（广告/跟踪分析/恶意软件/遥测收集/成人内容）标记与一键过滤功能
- [x] **T-P2-03: 规则格式扩展（Mosdns / Clash Meta / CoreDNS 导出）**
  - ✅ 已实现：生成器新增 Mosdns（domain-set `domain:`）、Clash Meta（`DOMAIN-SUFFIX,域名,reject`）、CoreDNS（hosts `0.0.0.0 域名`）三种格式，纳入 `ALL_FORMATS` / 输出 Tab / 下载复制链路与 16 语言 i18n
  - ⏳ 待办：AdGuard 正则 ↔ Dnsmasq regex/server 的双向智能语法转换（高级子项，未纳入本次）

---

### ⚪ P3 - 路由器自动化与生态拓展 (持续迭代)

- [x] **T-P3-01: 路由器一键同步脚本 (Router One-Click Sync Scripts)**
  - 开发适用于 AsusWRT-Merlin / OpenWrt / Padavan / SmartDNS / Pi-hole 的 Shell 定时拉取并自动重启 dnsmasq 的脚本生成器
  - 在 Web 端提供「复制路由器专用脚本」弹窗与一键复制功能 (`ScriptGeneratorModal.tsx`)
- [ ] **T-P3-02: OpenWrt LuCI 界面配置包**
  - 构建轻量级 OpenWrt LuCI 界面插件，支持在路由器后台直接订阅 DNS Shield 规则源
- [x] **T-P3-03: 定时自动抓取与上游规则聚合 GitHub Action**
  - ✅ 已实现：新增 `.github/workflows/aggregate.yml`（每周一 03:17 UTC 运行）+ `scripts/aggregate-upstream.mjs`，聚合 AdGuard / EasyList / NeoHosts / StevenBlack / YousList 上游，去重合并后自动发起 PR 供人工审核

---

## 📋 三、任务状态追踪与验收标准

| 任务编号 | 任务名称 | 负责人 | 验收标准 | 状态 |
|---|---|---|---|:---:|
| T-P0-01 | 覆盖率工具与门禁 | Core Team | `npm run test:coverage` 可正常生成报告，覆盖率 ≥ 80% | ✅ 已完成 (91.9%) |
| T-P0-02 | 核心模块单元测试 | Core Team | 82 个单元测试用例全部通过 | ✅ 已完成 |
| T-P0-03 | 生产日志收敛 | Core Team | 生产构建控制台无未受控报错，logger 工具全覆盖 | ✅ 已完成 |
| T-P2-02 | 域名匹配测试器 | Feature Team | 输入测试域名即时展示命中规则与拦截原因 | ✅ 已完成 |
| T-P3-01 | 路由器同步脚本 | Infra Team | 脚本在主流固件实测有效，支持一键生成与复制 | ✅ 已完成 |
| T-P1-01 | Web Worker 解析 | Dev Team | 10万行域名解析处理不阻塞 UI 渲染，有进度反馈 | 规划中 |
| T-P1-02 | 虚拟滚动 | Dev Team | 超大规则预览流畅（60fps 滚动） | 规划中 |
| T-P1-03 | IndexedDB 存储 | Dev Team | 大容量规则持久化保存，页面刷新无缝恢复 | 规划中 |
| T-P2-01 | 分类标签过滤 | Feature Team | 支持多维度分类标签与选择性导出 | 规划中 |
| T-P2-03 | 多格式扩展 | Feature Team | 支持 Mosdns / Clash Meta / CoreDNS 新格式导出 | ✅ 已完成（双向语法转换待办） |
| T-P3-03 | 上游聚合 Action | Infra Team | 定时聚合上游并自动发起 PR | ✅ 已完成 |
