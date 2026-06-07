# DNS Shield - 路由器广告过滤工具

基于 DNS 的广告过滤规则库，通过路由器设置即可拦截广告和保护隐私。

## 功能简介

- **广告拦截** - 过滤网页广告、视频广告、App 广告
- **支付保护** - 屏蔽扫码支付跳转链接（微信、支付宝）
- **隐私防护** - 阻止追踪器和数据采集
- **多设备生效** - 路由器设置一次，所有连接设备自动生效
- **多种格式支持** - Dnsmasq、Hosts、AdGuard 等格式
- **白名单管理** - 通过网页工具管理白名单

## 快速开始

### 第一步：下载过滤规则

根据你的路由器类型下载对应文件：

| 路由器 | 下载文件 |
|--------|----------|
| 梅林/OpenWrt | [dnsmasq.conf](dnsmasq.conf) |
| 小米/华硕/TP-Link | [hosts.txt](hosts.txt) |
| AdGuard 用户 | [adguard.txt](adguard.txt) |

### 第二步：导入路由器

**梅林固件（华硕）**
- 路径：软件中心 → DNS 设置 → 自定义 dnsmasq
- 将 `dnsmasq.conf` 内容复制到配置框中

**OpenWrt**
```bash
curl -sL https://raw.githubusercontent.com/sutchan/DNS_Shield/main/dnsmasq.conf >> /etc/dnsmasq.conf
```

**小米路由器**
- 路径：设置 → 广告拦截 → 自定义 hosts
- 导入 `hosts.txt`

详细设置方法请查看 [使用指南](docs/GLOBAL_USAGE.md)。

## 在线工具

如需自定义域名列表或生成其他格式，可使用 Web 管理工具。

部署方法请查看 [部署指南](docs/DEPLOYMENT.md)。

## 文件说明

| 文件 | 用途 |
|------|------|
| `dnsmasq.conf` | Dnsmasq 路由器格式 |
| `hosts.txt` | 标准 hosts 格式 |
| `adguard.txt` | AdGuard 格式 |
| `whitelist.txt` | 白名单（需要放行的域名） |
| `domains.txt` | 统一域名数据源 |

## 常见问题

**Q: 为什么过滤规则不起效？**
- 清除浏览器缓存
- 重启路由器 DNS 缓存
- 检查路由器 DNS 设置是否生效

**Q: 如何添加白名单？**
- 使用 Web 管理工具的的白名单功能
- 或手动编辑 `whitelist.txt`，每行一个域名

**Q: 规则多久更新一次？**
- 建议定期从仓库下载最新规则

## 参与贡献

欢迎提交域名规则和问题反馈，请查看 [贡献指南](docs/CONTRIBUTING.md)。

## 许可证

MIT License
