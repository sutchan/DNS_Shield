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
- [ ] `openspec/SPEC.md` 规范文档完整
- [ ] `openspec/TASKS.md` 任务清单完整
- [ ] `openspec/CHECKLIST.md` 检查清单完整

## 文件结构

- [ ] 根目录文件结构符合 SPEC.md 定义
- [ ] `domains.txt` 存在且格式正确
- [ ] `manager.html` 存在且功能完整
- [ ] `assets/js/i18n.js` 存在且翻译完整
- [ ] `assets/js/utils.js` 存在且工具函数完整
- [ ] `assets/js/core.js` 存在且状态管理完整
- [ ] `assets/js/parser.js` 存在且域名解析完整
- [ ] `assets/js/generator.js` 存在且规则生成完整
- [ ] `assets/js/app.js` 存在且入口逻辑完整
- [ ] `assets/js/ui-urls.js` 存在且 URL 管理交互完整
- [ ] `assets/js/ui-editor.js` 存在且编辑器交互完整
- [ ] `assets/js/ui-controls.js` 存在且控件交互完整
- [ ] `assets/css/styles.css` 存在（样式入口）
- [ ] `assets/css/variables.css` 存在（CSS 变量）
- [ ] `assets/css/layout.css` 存在（布局样式）
- [ ] `assets/css/components.css` 存在（组件样式）
- [ ] `assets/css/editor.css` 存在（编辑器样式）
- [ ] `assets/css/utilities.css` 存在（工具类）
- [ ] 生成的文件格式正确

## 功能验证

- [ ] Dnsmasq 规则格式正确 (`address=/domain/IP`)
- [ ] Hosts 文件格式正确 (`IP domain`)
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
