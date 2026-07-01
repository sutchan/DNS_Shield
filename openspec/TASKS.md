# 任务清单

## 日常维护

- [ ] 检查现有规则有效性
- [ ] 测试新广告域名
- [ ] 更新 `public/domains.txt` 原始域名
- [ ] 启动开发服务器：`pnpm dev`
- [ ] 访问本地开发地址 (http://localhost:8082) 生成新规则
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

- [ ] 递增版本号 (SemVer) — 同步更新所有文件
- [ ] 更新 `docs/CHANGELOG.md` 变更记录
- [ ] 更新输出文件头部版本号
- [ ] 更新 `docs/README.md` 版本号
- [ ] 更新 `docs/README.en.md` 版本号
- [ ] 创建 GitHub Release

## 开发任务

- [x] 设计系统全面重构（v3.0：oklch 色彩、Swiss Precision 排版、Apple 风格动效）
- [x] 添加 Accordion 折叠面板组件
- [x] 完善按钮交互效果（点击缩放 active:scale-[0.98]）
- [x] 优化面板悬停效果（hover-lift 上浮阴影）
- [x] 优化 Web 管理工具界面（Apple 设计风格）
- [x] 添加新的预设源（内置/AdGuard/EasyList/NeoHosts）
- [x] 改进规则生成算法（支持白名单/自定义DNS）
- [ ] 添加单元测试
- [x] 优化浏览器兼容性
- [x] 完善国际化支持（16 种语言）
- [ ] 改进文档质量和完整性
- [ ] 优化构建和部署流程
- [x] 增强安全性和性能（CSP 头部、URL 验证）
