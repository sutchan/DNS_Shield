# 质量检查清单

> 最后审查：2026-11-06（与 package.json v3.15.1 对齐；全量文档核查：ui 组件文件名改实际 PascalCase、任务文档检查项按 tasks.md / tasks-done.md 分工补齐）

## UI/UX 设计规范

- [ ] 无 emoji 作为 UI 图标（使用 Lucide SVG）
- [ ] 颜色使用 CSS 变量（无硬编码颜色值）
- [ ] 按钮悬停有视觉反馈
- [ ] 所有可点击元素有 cursor-pointer
- [ ] 过渡动画平滑（150-300ms）
- [ ] 响应式适配（Mobile / Tablet / Desktop）
- [ ] 深色/浅色模式切换正常
- [ ] 焦点状态可见（键盘导航）
- [ ] 空状态有统一组件
- [ ] 错误状态有清晰提示
- [ ] 加载状态有反馈

## 代码质量

- [ ] 代码格式符合项目规范
- [ ] 无硬编码敏感信息
- [ ] 文件编码为 UTF-8
- [ ] TypeScript 类型完整
- [ ] 文件头注释版本格式正确
- [ ] 单个源文件不超过 200 行（代码文件强制，文档不拆分）
- [ ] 所有可定位元素使用 kebab-case 语义 id，且无重复 id

## 导出产物正确性

- [ ] 12 种格式的头部每一非空行均以该格式注释符开头（含「使用方法」说明行）
- [ ] Bind RPZ 注释符为 `;`，其余格式按 `headerConfigs.ts` 取值
- [ ] `scripts/lib/formatHeaders.mjs` 与运行时 `generateHeader` 的注释符、usage 行保持一致
- [ ] 多 URL 合并内容有总量护栏（当前 50MB），单 URL 仍有 10MB 上限

## 状态与竞态

- [ ] 本地草稿优先于远端清单：任何网络/存储时序下用户编辑都不被覆盖
- [ ] 异步（Worker）结果落地前校验请求序号与输入快照，过期结果丢弃
- [ ] Worker 卸载时结算全部挂起任务，不让调用方 `await` 永挂
- [ ] 弹窗 Escape 仅关闭栈顶弹窗；滚动锁使用引用计数实现

## shadcn/ui 组件规范

- [ ] `src/components/ui/Button.tsx` 使用 cva 管理变体
- [ ] `src/components/ui/Button.tsx` 支持 isLoading 状态
- [ ] `src/components/ui/Card.tsx` 使用圆角 2xl
- [ ] `src/components/ui/Badge.tsx` 支持 success/warning/error 变体
- [ ] `src/components/ui/Tabs.tsx` 使用圆角 lg
- [ ] `src/components/ui/Input.tsx` 支持 ref 传递
- [ ] 所有组件使用 `cn()` 合并类名
- [ ] 所有组件使用 `forwardRef`

## 文档完整性

- [ ] `README.md` 存在且内容完整
- [ ] `README.en.md` 存在且英文内容完整
- [ ] `CHANGELOG.md` 变更记录完整
- [ ] `.github/CONTRIBUTING.md` 贡献指南完整
- [ ] `.github/SECURITY.md` 安全指南完整
- [ ] `.github/SUPPORT.md` 支持文档完整
- [ ] `.github/CODE_OF_CONDUCT.md` 行为准则完整
- [ ] `.github/PULL_REQUEST_TEMPLATE.md` PR 模板完整
- [ ] `.github/FUNDING.yml` 赞助配置完整
- [ ] `.github/ISSUE_TEMPLATE/` 含 bug_report 与 feature_request 模板
- [ ] `DEPLOYMENT.md` 部署指南完整
- [ ] `docs/SPEC.md` 规范文档完整
- [ ] `docs/tasks.md` 未完成任务清单 + 实时指标完整（未完成任务唯一来源，不得在其他文档另建任务清单）
- [ ] `docs/tasks-done.md` 已完成任务归档完整（含开发进度全景，与 tasks.md 不重复维护）
- [ ] `docs/CHECKLIST.md` 检查清单完整
- [ ] `docs/config.yaml` 配置文件完整且 version 与 package.json 一致

## 文件结构

文件结构以 **SPEC.md §2** 为权威定义，下列清单仅作存在性/正确性抽查，避免与 SPEC 重复维护导致漂移：

- [ ] 根目录文件结构符合 [SPEC.md §2](./SPEC.md#2-文件结构) 定义
- [ ] `.github/` 目录 Community Health Files 完整（见文档完整性清单）
- [ ] `public/` 静态产出（domains.txt / whitelist.txt / hosts.txt / dnsmasq.conf / adguard.txt / manifest.json / service-worker.js）存在且格式正确
- [ ] `src/app/` 路由文件（page.tsx / Home.tsx / globals.css / layout.tsx / robots.ts / sitemap.ts）存在且功能完整
- [ ] `src/components/`、`src/hooks/`、`src/utils/`、`src/types/`、`src/config/`、`src/locales/` 模块齐全
- [ ] `prototype/` 目录及 `prototype/shadcn/` 设计规范完整
- [ ] 根配置文件（`package.json` / `next.config.js` / `tsconfig.json` / `tailwind.config.js` / `postcss.config.js`）正确且依赖完整

## 功能验证

- [ ] Dnsmasq 规则格式正确 (`address=/domain/IP`)
- [ ] Hosts 文件格式正确 (`IP domain`)
- [ ] AdGuard 规则格式正确 (`||domain^`)
- [ ] 白名单格式正确 (`@@||domain^`)
- [ ] IPv4 阻止功能正常
- [ ] IPv6 阻止功能正常
- [ ] 自动去重功能正常
- [ ] 通配符处理正常
- [ ] 头部注释生成正确
- [ ] 文件下载功能正常
- [ ] 白名单功能正常（`+` 前缀）
- [ ] 注释域名功能正常（`!` 前缀）
- [ ] 自定义 DNS 功能正常（`@` 前缀）

## Web 管理工具

- [ ] URL 导入功能正常
- [ ] 预设源加载正常
- [ ] 手动编辑功能正常
- [ ] 本地文件加载正常
- [ ] 生成规则功能正常
- [ ] 预览功能正常
- [ ] 复制到剪贴板功能正常
- [ ] 下载功能正常
- [ ] 主题切换功能正常
- [ ] 语言切换功能正常
- [ ] 自动保存/恢复功能正常

## 路由器兼容性

- [ ] 梅林固件测试通过
- [ ] OpenWrt 测试通过
- [ ] 小米路由器测试通过
- [ ] 华硕路由器测试通过
- [ ] TP-Link 路由器测试通过

## Git 规范

- [ ] `.gitignore` 配置正确
- [ ] 提交信息符合规范
- [ ] 版本号已更新

## 维护检查

- [ ] 规则有效性已验证
- [ ] 无效域名已清理
- [ ] 上游更新已同步
