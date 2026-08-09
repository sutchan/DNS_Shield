# DNS Shield 高保真原型 v3.7.3
> 基于 DNS Shield Design System v3.7.3 (Swiss Modernism 2.0 × Apple Precision)

## 交付物

### 1. `prototype.canvas.tsx` — React 高保真原型
- 完整的双栏布局应用界面（输入面板 + 输出面板）
- 深色/浅色主题切换、有数据 / 空状态切换
- 格式切换（Dnsmasq / Hosts / AdGuard / 白名单）
- 行号编辑器（可编辑输入 + 只读输出）
- 统计信息栏、URL 导入、预设标签
- 纯 SVG 图标（Lucide 风格，无 emoji）
- TypeScript + React Hooks，主题和数据状态管理
- 响应式布局（移动端单栏 → 桌面端双栏）

### 2. `shadcn/` — 设计规范文档
详情见各子文档：
- `design-system.md` — 色彩/字体/间距/圆角/阴影/动效/z-index/响应式断点
- `component-library.md` — 基础/复合/业务组件的 TS 代码规范
- `interaction-standards.md` — 操作层级/反馈/加载/错误/空状态/键盘导航/ARIA
- `design-polish-report.md` — 设计打磨复盘报告

## 设计规范遵循

- [x] 色彩系统：精确匹配 Design System v3.7.3 色板
- [x] 字体系统：Inter，严格使用 Display/H1/H2/H3/Body/Small/Caption
- [x] 间距系统：4px 基数（space-1 ~ space-12）
- [x] 圆角系统：sm=6px, md=8px, lg=12px, xl=16px
- [x] 阴影系统：Light / Dark 不同阴影值
- [x] 动效系统：ease-out 缓动，prefers-reduced-motion 支持
- [x] 无障碍：focus-visible 环形，aria-label, role 属性
- [x] 无 emoji 图标：全部使用 Lucide 风格 SVG 图标
