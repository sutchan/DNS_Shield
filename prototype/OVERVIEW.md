# DNS Shield 高保真原型 v3.6.0
> 基于 DNS Shield Design System v3.6.0 (Swiss Modernism 2.0 × Apple Precision)

## 交付物

### 1. `prototype.html` — 主应用原型
- 完整的双栏布局应用界面（输入面板 + 输出面板）
- 深色/浅色主题切换
- 有数据 / 空状态切换
- 格式切换（Dnsmasq / Hosts / AdGuard / 白名单）
- 行号编辑器（可编辑输入 + 只读输出）
- 统计信息栏、URL 导入、预设标签
- 高级设置面板（可折叠）
- Toast 通知组件（成功 / 失败）
- 组件展示区域（按钮、输入框、徽标、标签组、Tabs、骨架屏等）
- 响应式布局（移动端单栏 → 桌面端双栏）

### 2. `components-showcase.html` — 组件库展示
- 所有组件变体和状态一览
- Button: 5 种变体 × 4 种尺寸 × 5 种状态
- Input: Default / Focused / Error / Success / Disabled
- Card: Default / Elevated / Bordered
- Badge: 5 种语义 + Pill + 图标
- Tabs (Segmented Control) + Tags (预设选择器)
- Switch 开关组件
- Code Editor（可编辑 + 只读语法高亮）
- Empty State 空状态
- Skeleton 骨架屏
- Toast 通知

### 3. `prototype.canvas.tsx` — React 组件
- 与 HTML 原型同步更新的 React 组件
- 纯 SVG 图标（无 emoji）
- TypeScript + React Hooks
- 主题和数据状态管理

## 设计规范遵循

- [x] 色彩系统：精确匹配 Design System v3.6.0 色板
- [x] 字体系统：Inter，严格使用 Display/H1/H2/H3/Body/Small/Caption
- [x] 间距系统：4px 基数（space-1 ~ space-12）
- [x] 圆角系统：sm=6px, md=8px, lg=12px, xl=16px
- [x] 阴影系统：Light / Dark 不同阴影值
- [x] 动效系统：ease-out 缓动，prefers-reduced-motion 支持
- [x] 无障碍：focus-visible 环形，aria-label, role 属性
- [x] 无 emoji 图标：全部使用 Lucide 风格 SVG 图标
