# 质量检查清单

## 代码质量

- [ ] 代码格式符合项目规范
- [ ] 无硬编码敏感信息
- [ ] 文件编码为 UTF-8
- [ ] HTML/CSS/JS 语法正确
- [ ] 文件头注释格式正确

## 文档完整性

- [ ] `README.md` 存在且内容完整
- [ ] `README.en.md` 存在且英文内容完整
- [ ] `README.md` 与 `README.en.md` 互相链接正确
- [ ] `CHANGELOG.md` 变更记录完整
- [ ] `CONTRIBUTING.md` 贡献指南完整
- [ ] `DEPLOYMENT.md` 部署指南完整
- [ ] `SECURITY.md` 安全指南完整
- [ ] `openspec/SPEC.md` 规范文档完整
- [ ] `openspec/TASKS.md` 任务清单完整
- [ ] `openspec/CHECKLIST.md` 检查清单完整
- [ ] `openspec/config.yaml` 配置文件完整

## 文件结构

- [ ] 根目录文件结构符合 SPEC.md 定义
- [ ] `domains.txt` 存在且格式正确
- [ ] `adguard.txt` 存在且格式正确
- [ ] `adguard_whitelist.txt` 存在且格式正确
- [ ] `dnsmasq.conf` 存在且格式正确
- [ ] `hosts.txt` 存在且格式正确
- [ ] `src/app/page.tsx` 存在且功能完整
- [ ] `src/app/Home.tsx` 存在且逻辑完整
- [ ] `src/app/Home.test.tsx` 存在且测试完整
- [ ] `src/app/globals.css` 存在且样式完整
- [ ] `src/app/layout.tsx` 存在且布局完整
- [ ] `src/setupTests.ts` 存在且配置完整
- [ ] `package.json` 配置正确且依赖完整
- [ ] `next.config.js` 配置正确
- [ ] `next-env.d.ts` 配置正确
- [ ] `tsconfig.json` 配置正确
- [ ] `tailwind.config.js` 配置正确
- [ ] `postcss.config.js` 配置正确
- [ ] `jest.config.js` 配置正确
- [ ] `manifest.json` 配置正确
- [ ] 生成的文件格式正确

## 功能验证

- [ ] Dnsmasq 规则格式正确 (`address=/domain/IP`)
- [ ] Hosts 文件格式正确 (`IP domain`)
- [ ] AdGuard 规则格式正确 (`||domain^`)
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
