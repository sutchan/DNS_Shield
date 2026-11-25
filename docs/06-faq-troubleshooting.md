# 06 FAQ 与故障排除

> 文档集版本：v3.21.0 · 最后审查：2026-11-25 · 适用产品版本：v3.21.0
> FAQ 事实源：`src/config/seo-content.ts` 的 `FAQ_ITEMS`（页面可见文本 / JSON-LD / `llms.txt` 共用）。本文与之保持一致，新增技术问题解答。

## 1. 常见问题（FAQ）

### Q1：DNS Shield 会上传我的域名清单吗？

不会。域名解析、去重、排序与规则生成全部在浏览器本地完成（大文本由 Web Worker 并行处理），本站没有接收域名清单的服务端接口。只有主动点击「获取」时，浏览器才会抓取你自己填写的 URL。

### Q2：支持哪些路由器和 DNS 软件？

支持梅林固件、小米路由器、OpenWrt、AdGuard Home、Pi-hole、Unbound、SmartDNS、Mosdns、Clash Meta、CoreDNS 与 BIND RPZ，共 **12 种导出格式**：Dnsmasq、Hosts、AdGuard 黑名单、AdGuard 白名单、纯域名列表、Unbound、Pi-hole、BIND RPZ、SmartDNS、Mosdns、Clash Meta、CoreDNS。

### Q3：是否免费？源码在哪里？

完全免费、开源，采用 MIT 许可证。源码与更新日志托管在 GitHub（`github.com/sutchan/DNS_Shield`），也可以直接在本站生成规则后复制或下载，无需注册。

### Q4：如何输入白名单和自定义 DNS 改道？

每行一个域名；`#` 开头为注释，`+example.com` 表示白名单放行，`@example.com=192.168.1.1` 表示自定义 DNS 改道。也支持 hosts / dnsmasq / AdGuard 混合格式粘贴，以及 URL 批量导入。

### Q5：预生成的规则文件可以直接订阅吗？

可以。`/domains.txt` 是单一数据源，构建时由它生成 11 个格式的规则文件（如 `/dnsmasq.conf`、`/adguard.txt`、`/hosts.txt`、`/whitelist.txt`），可作为订阅 URL 或直接用脚本拉取。

---

## 2. 故障排除

排查顺序建议：**先看浏览器控制台与 toast → 再看生成结果 → 最后看部署 / CI**。

### 2.1 规则导入路由器后不生效

| 现象 | 可能原因 | 处理 |
|------|----------|------|
| 完全无拦截 | 文件格式与设备不匹配 | 对照 [05 用户指南 §3](./05-user-guide.md#3-首次使用下载并部署规则) 选择格式 |
| AdGuard Home 报规则非法 | 头部 usage 行未加注释符（旧版本产物） | 升级到 v3.15.0+ 产物；头部每行必须以 `#` / `!` / `;` 开头 |
| dnsmasq 启动失败 | 配置混入裸文本行 | 用 `head -n 20 dnsmasq.conf` 检查；重新下载最新产物 |
| 部分域名仍可访问 | 白名单放行或缓存未刷新 | 检查 `+` 行；清设备 DNS 缓存或重启服务 |
| hosts 文件超限 | 设备对 hosts 大小有限制 | 改用 dnsmasq / AdGuard 格式 |

### 2.2 URL 导入失败

- **提示「域名源加载失败」**：远端与同源 `domains.txt` 兜底均失败。检查网络、URL 是否为 http/https、长度 ≤2048；单响应上限 10MB、每批上限 50MB / 5 个 URL。
- **部分 URL 成功、部分失败**：仍视为成功，失败项需单独核对；toast 会给出失败提示。
- **跨域失败**：目标服务器未开放 CORS 时浏览器会拒绝读取；可先手动下载后粘贴。

### 2.3 大清单解析慢或内存高

- 阈值：<5000 行主线程，5000–19999 行单 Worker，≥20000 行最多 8 个 Worker 分片。
- 若浏览器内存占用高：减少单次输入规模、关闭不必要的浏览器标签；已知优化点（全量 `split`、分片复制）见 [07 优化建议](./07-improvements.md) O-01/O-02。
- 不要反复点击「生成规则」：解析任务已单飞，但重复输入会触发新的解析。

### 2.4 本地安装 / 构建失败

| 报错 | 原因 | 处理 |
|------|------|------|
| `engine-strict` / Node 版本不匹配 | 要求 `>=24.11.0 <25` | 切换 Node 24；注意当前工作树**缺失 `.npmrc`**，`engine-strict` 未实际生效（见 [07 O-05](./07-improvements.md)） |
| `pnpm install --frozen-lockfile` 失败 | 锁文件与 `package.json` 不一致 | 先本地 `pnpm install` 更新并提交 `pnpm-lock.yaml` |
| `next build` 取字体失败 | 使用 `next/font/google` 的外部字体 | 本项目已统一系统字体栈，不应出现；若出现请检查是否误引入外部字体依赖 |
| `vitest --coverage` 清理 `coverage/` 卡死 | IDE safe-delete shim 超时（环境限制） | 改用 `--coverage.reportsDirectory=.tmp/coverage`；CI 不受影响 |
| 根目录清洁度门禁失败 | `_*.mjs` 临时脚本散落在 `scripts/` 或根目录 | 移入根目录 `.tmp/`（已 gitignore） |

### 2.5 CI / 发布异常

- **CI 红在 setup**：检查 `pnpm-lock.yaml` 是否入库、`setup` 复合动作缓存是否命中。历史 BLOCKER（锁文件缺失）已修复，但 `.npmrc` 仍缺失，见 [07 O-05](./07-improvements.md)。
- **Release 未生成**：Release 工作流由 Deploy 成功后触发；需确认 `main` 的 CI → Deploy 全绿。
- **规则文件未更新**：改动 `domains.txt` 后必须运行 `pnpm build:formats` 并提交 11 个派生文件。

### 2.6 已知产品限制（非故障）

| 限制 | 状态 | 跟踪 |
|------|------|------|
| PWA 离线缓存未启用：`public/service-worker.js` 存在但无 `register` 调用 | 待评估 | [07 O-06](./07-improvements.md) |
| `category-index.txt` 未纳入发布路径，分类筛选可能降级隐藏 | 待修复 | [07 O-07](./07-improvements.md) |
| 生产 CSP `script-src` 含 `'unsafe-inline'`（首屏脚本所需） | 待评估 | [07 O-08](./07-improvements.md) |
| 部分设备对 hosts 文件大小有限制 | 产品限制 | 建议改用 dnsmasq / AdGuard 格式 |

## 3. 仍未解决的问题

任何本文未覆盖、或按上述步骤仍无法解决的问题，请附以下信息提交 issue：

1. 使用路径（直接下载 / 自定义清单 / URL 导入）与目标设备型号；
2. 浏览器与版本、是否开启深色 / RTL；
3. 控制台报错与 toast 文案；
4. 复现步骤与期望结果。

相关待验证项统一记录在 [任务清单](./tasks.md)，不在本文私下维护状态。
