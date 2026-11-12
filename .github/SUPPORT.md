<!-- 最后审查：2026-11-12（与 package.json v3.17.4 对齐；第十八轮全量文档核查） -->

# 支持指南

## 常见问题

### 1. 如何使用生成的过滤列表？

根据您的设备类型，选择合适的文件格式：
- **路由器 (Dnsmasq)**：使用 `dnsmasq.conf`
- **通用设备**：使用 `hosts.txt`
- **AdGuard 扩展/软件**：使用 `adguard.txt`
- **AdGuard 白名单**：使用 `whitelist.txt`

详细使用方法请参考 [README.md](../README.md)。

### 2. 如何添加自定义域名到黑名单？

1. 编辑 `public/domains.txt` 文件，每行添加一个域名（`+` 前缀表示白名单，`@` 前缀表示自定义 DNS，`#` 表示注释）
2. 运行 `node scripts/gen-format-files.mjs`（或 `pnpm build:formats`）重新生成全部 11 种格式产物文件（`domains` 格式即数据源 `domains.txt` 本身，无需重建）
3. 部署更新后的文件到您的设备

### 3. 如何添加域名到白名单？

在 `public/domains.txt` 中以 `+域名` 形式添加；`public/whitelist.txt` 是生成产物，请勿直接编辑。

### 4. 过滤列表更新频率是多少？

我们会定期更新域名列表，建议每周至少更新一次以获得最佳防护效果。

## 技术支持

### 报告问题

如果您遇到任何问题，请在 [GitHub Issues](https://github.com/ArcesTeam/DNS_Shield/issues) 中报告，包括：
- 问题描述
- 设备类型和操作系统
- 错误日志（如果有）
- 重现步骤

### 贡献代码

欢迎提交 Pull Request 来改进项目。请确保：
- 遵循项目的代码风格
- 测试您的更改
- 提供清晰的提交信息

### 联系我们

- **GitHub**：[https://github.com/ArcesTeam/DNS_Shield](https://github.com/ArcesTeam/DNS_Shield)
- **Issues**：[提交问题](https://github.com/ArcesTeam/DNS_Shield/issues)

## 故障排除

### 过滤列表不生效

1. 确保您使用了正确的文件格式
2. 重启您的设备或服务
3. 清除 DNS 缓存
4. 检查文件路径是否正确

### 误屏蔽正常网站

1. 在 `public/domains.txt` 中以 `+域名` 形式添加白名单（`public/whitelist.txt` 是生成产物，请勿直接编辑）
2. 运行 `node scripts/gen-format-files.mjs` 重新生成过滤列表
3. 部署更新后的文件

### 性能问题

- 确保您的设备有足够的资源运行过滤服务
- 对于低配置设备，建议使用简化版的过滤列表
- 定期清理过期的域名条目

## 资源

- [部署指南](../DEPLOYMENT.md)
- [贡献指南](CONTRIBUTING.md)
- [安全指南](SECURITY.md)
- [变更日志](../CHANGELOG.md)