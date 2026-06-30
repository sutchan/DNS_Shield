# DNS Shield Design System v3.0

## 1. 设计哲学

**Swiss Modernism 2.0 × Apple Precision**
- 信息至上：内容即设计，无冗余装饰
- 功能驱动：每个元素都有明确目的
- 高对比度：黑白为主，单一强调色
- 数学间距：4px 基数系统，严格对齐
- 隐形技术：技术存在但不可见

---

## 2. 色彩系统

### 2.1 主色调（Primitive Colors）

| 名称 | Light | Dark | 用途 |
|------|-------|------|------|
| Background | `#FFFFFF` | `#0A0A0F` | 页面背景 |
| Surface | `#F5F5F7` | `#141419` | 卡片/面板背景 |
| Elevated | `#FFFFFF` | `#1C1C24` | 浮层面板 |
| Primary | `#007AFF` | `#0A84FF` | 主要按钮/链接 |
| Primary Hover | `#0056D3` | `#4DA3FF` | 悬停状态 |
| Text Primary | `#1D1D1F` | `#F5F5F7` | 主标题/正文 |
| Text Secondary | `#6E6E73` | `#98989D` | 辅助文字 |
| Text Tertiary | `#A1A1A6` | `#6E6E73` | 禁用/提示 |
| Border | `#D2D2D7` | `#2C2C3A` | 边框/分割线 |
| Border Hover | `#86868B` | `#3A3A4A` | 悬停边框 |
| Success | `#34C759` | `#30D158` | 成功状态 |
| Warning | `#FF9500` | `#FF9F0A` | 警告状态 |
| Error | `#FF3B30` | `#FF453A` | 错误状态 |

### 2.2 CSS 变量（shadcn/ui 兼容）

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 6% 10%;
  --card: 0 0% 100%;
  --card-foreground: 240 6% 10%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 6% 10%;
  --primary: 211 100% 50%;
  --primary-foreground: 0 0% 100%;
  --secondary: 240 5% 96%;
  --secondary-foreground: 240 6% 10%;
  --muted: 240 5% 96%;
  --muted-foreground: 240 4% 46%;
  --accent: 240 5% 96%;
  --accent-foreground: 240 6% 10%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --border: 240 6% 90%;
  --input: 240 6% 90%;
  --ring: 211 100% 50%;
  --radius: 0.5rem;
}

.dark {
  --background: 240 14% 4%;
  --foreground: 0 0% 96%;
  --card: 240 14% 7%;
  --card-foreground: 0 0% 96%;
  --popover: 240 14% 7%;
  --popover-foreground: 0 0% 96%;
  --primary: 211 100% 52%;
  --primary-foreground: 0 0% 100%;
  --secondary: 240 6% 12%;
  --secondary-foreground: 0 0% 96%;
  --muted: 240 6% 12%;
  --muted-foreground: 240 5% 65%;
  --accent: 240 6% 12%;
  --accent-foreground: 0 0% 96%;
  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 100%;
  --border: 240 6% 15%;
  --input: 240 6% 15%;
  --ring: 211 100% 52%;
}
```

---

## 3. 字体系统

### 3.1 字体栈

```css
font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
```

### 3.2 字体规格

| 级别 | 大小 | 行高 | 字重 | 字间距 | 用途 |
|------|------|------|------|--------|------|
| Display | 32px | 1.2 | 700 | -0.02em | 页面标题 |
| H1 | 24px | 1.3 | 600 | -0.01em | 面板标题 |
| H2 | 18px | 1.4 | 600 | -0.01em | 分区标题 |
| H3 | 14px | 1.4 | 500 | 0 | 小标题 |
| Body | 14px | 1.5 | 400 | 0 | 正文 |
| Small | 12px | 1.5 | 400 | 0.01em | 辅助文字 |
| Caption | 11px | 1.4 | 500 | 0.02em | 标签/状态 |
| Mono | 13px | 1.6 | 400 | 0 | 代码编辑器 |

---

## 4. 间距系统

### 4.1 基础单位：4px

| Token | 值 | 用途 |
|-------|-----|------|
| space-1 | 4px | 图标间距 |
| space-2 | 8px | 元素内间距 |
| space-3 | 12px | 按钮内边距 |
| space-4 | 16px | 卡片内边距 |
| space-5 | 20px | 面板间距 |
| space-6 | 24px | 区块间距 |
| space-8 | 32px | 大区块间距 |
| space-10 | 40px | 页面间距 |
| space-12 | 48px | 大页面间距 |

### 4.2 布局网格

- 移动端：单列，padding 16px
- 平板 (md: 768px+)：双栏，padding 24px，gap 16px
- 桌面 (lg: 1024px+)：max-width 960px，居中，padding 24px
- 大屏 (xl: 1280px+)：max-width 1120px

---

## 5. 圆角系统

| Token | 值 | 用途 |
|-------|-----|------|
| radius-sm | 6px | 小按钮、标签 |
| radius-md | 8px | 按钮、输入框 |
| radius-lg | 12px | 卡片、面板 |
| radius-xl | 16px | 大卡片、模态框 |
| radius-full | 9999px | 药丸按钮 |

---

## 6. 阴影系统

### 6.1 Light Mode

| Token | 值 |
|-------|-----|
| shadow-sm | 0 1px 2px rgba(0,0,0,0.04) |
| shadow-md | 0 4px 12px rgba(0,0,0,0.06) |
| shadow-lg | 0 8px 24px rgba(0,0,0,0.08) |
| shadow-xl | 0 16px 48px rgba(0,0,0,0.12) |

### 6.2 Dark Mode

| Token | 值 |
|-------|-----|
| shadow-sm | 0 1px 2px rgba(0,0,0,0.2) |
| shadow-md | 0 4px 12px rgba(0,0,0,0.3) |
| shadow-lg | 0 8px 24px rgba(0,0,0,0.4) |
| shadow-xl | 0 16px 48px rgba(0,0,0,0.5) |

---

## 7. 动效系统

### 7.1 缓动函数

| 名称 | 值 | 用途 |
|------|-----|------|
| ease-default | cubic-bezier(0.4, 0, 0.2, 1) | 通用过渡 |
| ease-in | cubic-bezier(0.4, 0, 1, 1) | 退出动画 |
| ease-out | cubic-bezier(0, 0, 0.2, 1) | 进入动画 |
| ease-spring | cubic-bezier(0.34, 1.56, 0.64, 1) | 弹性交互 |

### 7.2 持续时间

| Token | 值 | 用途 |
|-------|-----|------|
| duration-instant | 75ms | 微交互 |
| duration-fast | 150ms | 按钮悬停 |
| duration-normal | 200ms | 状态切换 |
| duration-slow | 300ms | 面板展开 |
| duration-slower | 500ms | 页面过渡 |

### 7.3  prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 8. 组件规范

### 8.1 Button

| 变体 | 背景 | 文字 | 边框 | 悬停 | 用途 |
|------|------|------|------|------|------|
| Primary | Primary | White | none | Primary Hover | 主要操作 |
| Secondary | Surface | Text Primary | Border | Border Hover | 次要操作 |
| Ghost | Transparent | Text Primary | none | Muted | 文字按钮 |
| Destructive | Error | White | none | Error (darken) | 删除/危险 |

- 高度：32px (sm), 36px (md), 40px (lg)
- 内边距：12px 16px (md)
- 圆角：radius-md (8px)
- 过渡：background-color 150ms ease-out

### 8.2 Input / Textarea

- 背景：Surface
- 边框：1px solid Border
- 圆角：radius-md (8px)
- 高度：36px (Input), 200px+ (Textarea)
- 内边距：10px 12px
- 聚焦：border Primary, ring 2px Primary/20%
- 字体：Mono (代码编辑器)

### 8.3 Card / Panel

- 背景：Surface
- 边框：1px solid Border
- 圆角：radius-lg (12px)
- 内边距：16px-20px
- 阴影：shadow-sm (可选)

### 8.4 Badge / Tag

- 背景：Muted
- 文字：Muted Foreground
- 圆角：radius-sm (6px) 或 radius-full
- 内边距：4px 10px
- 字体：Caption

### 8.5 Tabs

- 背景：Muted
- 圆角：radius-md (8px)
- 间距：2px
- 激活项：Surface, shadow-sm
- 非激活：Transparent
- 过渡：all 150ms ease-out

---

## 9. 图标规范

- 图标库：Lucide React
- 尺寸：16px (sm), 20px (md), 24px (lg)
- 线条粗细：2px
- 颜色：继承 Text Secondary
- 禁止：使用 emoji 作为 UI 图标

---

## 10. 交互标准

### 10.1 模式

- **Primary Action**: 蓝色按钮，右对齐或底部
- **Secondary Action**: 灰色边框按钮，左对齐
- **Tertiary Action**: 文字链接，带下划线

### 10.2 反馈

- **加载**: Skeleton 脉冲或旋转 Spinner
- **成功**: 绿色 toast，持续 3s
- **错误**: 红色 toast，带重试按钮，持续 5s
- **警告**: 橙色 toast，持续 4s

### 10.3 空状态

- 图标：相关 Lucide 图标，48px，Text Tertiary
- 标题：H2，"暂无数据"
- 描述：Body，操作建议
- 操作：Primary Button（如适用）

### 10.4 错误状态

- 边框：Error 颜色
- 图标：AlertCircle，Error 颜色
- 文字：Small，Error 颜色
- 提示：修复建议

---

## 11. 响应式断点

| 断点 | 宽度 | 布局变化 |
|------|------|----------|
| Mobile | < 768px | 单列，堆叠布局，全宽按钮 |
| Tablet | 768px - 1023px | 双栏，侧边栏可收起 |
| Desktop | 1024px - 1279px | 双栏固定，max-width 960px |
| Large | >= 1280px | 双栏，max-width 1120px |

---

## 12. z-index 层级

| 层级 | 值 | 用途 |
|------|-----|------|
| Base | 0 | 默认内容 |
| Sticky | 10 | 粘性头部 |
| Dropdown | 50 | 下拉菜单 |
| Modal | 100 | 模态框 |
| Toast | 200 | 通知 toast |
| Tooltip | 300 | 工具提示 |
| Loading | 500 | 全屏加载 |
