# 质量检查清单

> 最后审查：2026-08-23（与 package.json v3.8.8 对齐）

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

## shadcn/ui 组件规范

- [ ] `src/components/ui/button.tsx` 使用 cva 管理变体
- [ ] `src/components/ui/button.tsx` 支持 isLoading 状态
- [ ] `src/components/ui/card.tsx` 使用圆角 2xl
- [ ] `src/components/ui/badge.tsx` 支持 success/warning/error 变体
- [ ] `src/components/ui/tabs.tsx` 使用圆角 lg
- [ ] `src/components/ui/input.tsx` 支持 ref 传递
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
- [ ] `openspec/SPEC.md` 规范文档完整
- [ ] `openspec/TASKS.md` 任务清单完整
- [ ] `openspec/CHECKLIST.md` 检查清单完整
- [ ] `openspec/config.yaml` 配置文件完整且 version 与 package.json 一致

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
