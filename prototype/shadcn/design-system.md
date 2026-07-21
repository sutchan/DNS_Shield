# DNS Shield — 设计系统规范 v3.6.0
> 基于 shadcn/ui + Tailwind CSS + Radix UI 的完整设计系统
> 色彩空间：oklch | 设计哲学：Swiss Modernism 2.0 × Apple Precision

---

## 1. 色彩系统

### 1.1 CSS 变量（HSL 格式，兼容 Tailwind hsl() 函数）

```css
:root {
  /* Background */
  --background: 0 0% 98.5%;
  --foreground: 240 8% 12%;

  /* Card */
  --card: 0 0% 100%;
  --card-foreground: 240 8% 12%;

  /* Popover */
  --popover: 0 0% 100%;
  --popover-foreground: 240 8% 12%;

  /* Primary — Apple Blue */
  --primary: 217 89% 47%;
  --primary-foreground: 0 0% 100%;

  /* Secondary */
  --secondary: 220 6% 90%;
  --secondary-foreground: 240 4% 16%;

  /* Muted */
  --muted: 220 8% 94%;
  --muted-foreground: 240 3% 46%;

  /* Accent */
  --accent: 217 70% 94%;
  --accent-foreground: 217 89% 47%;

  /* Destructive */
  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 100%;

  /* Success / Warning / Info */
  --success: 142 71% 45%;
  --warning: 38 92% 50%;
  --info: 217 89% 47%;

  /* Border / Input / Ring */
  --border: 220 6% 88%;
  --input: 220 6% 88%;
  --ring: 217 89% 47%;

  /* Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.625rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
}

.dark {
  --background: 240 6% 7%;
  --foreground: 0 0% 95%;

  --card: 240 4% 10%;
  --card-foreground: 0 0% 95%;

  --popover: 240 4% 10%;
  --popover-foreground: 0 0% 95%;

  --primary: 217 85% 55%;
  --primary-foreground: 0 0% 100%;

  --secondary: 240 3% 18%;
  --secondary-foreground: 0 0% 90%;

  --muted: 240 3% 14%;
  --muted-foreground: 240 2% 55%;

  --accent: 217 40% 20%;
  --accent-foreground: 217 85% 60%;

  --destructive: 0 62% 35%;
  --destructive-foreground: 0 0% 100%;

  --success: 142 70% 40%;
  --warning: 38 90% 45%;
  --info: 217 85% 55%;

  --border: 240 3% 20%;
  --input: 240 3% 20%;
  --ring: 217 85% 55%;
}
```

### 1.2 颜色语义映射

| 语义 | Light 色值 | Dark 色值 | Tailwind |
|------|-----------|-----------|----------|
| 页面背景 | #FAFAFA | #111114 | bg-background |
| 卡片背景 | #FFFFFF | #1A1A20 | bg-card |
| 浮层背景 | #FFFFFF | #1A1A20 | bg-popover |
| 主按钮 | #0D6EFD | #3B82F6 | bg-primary |
| 次按钮 | #E4E5E9 | #2D2D36 | bg-secondary |
| 主文字 | #1C1D21 | #F2F2F2 | text-foreground |
| 次文字 | #71717A | #8C8C95 | text-muted-foreground |
| 边框 | #DEE0E6 | #33333D | border-border |
| 成功 | #16A34A | #16A34A | text-success |
| 警告 | #F59E0B | #CA8A04 | text-warning |
| 错误 | #DC2626 | #991B1B | text-destructive |

---

## 2. 字体系统

### 2.1 字体栈

```css
font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', sans-serif;
```

### 2.2 字体规格

| 级别 | 大小 | 行高 | 字重 | 字间距 | Tailwind |
|------|------|------|------|--------|----------|
| Display | 32px | 1.2 | 700 | -0.02em | text-3xl font-bold |
| H1 | 24px | 1.3 | 600 | -0.01em | text-2xl font-semibold |
| H2 | 18px | 1.4 | 600 | -0.01em | text-lg font-semibold |
| H3 | 14px | 1.4 | 500 | 0 | text-sm font-medium |
| Body | 14px | 1.5 | 400 | 0 | text-sm |
| Small | 12px | 1.5 | 400 | 0.01em | text-xs |
| Caption | 11px | 1.4 | 500 | 0.02em | text-[11px] |
| Mono | 13px | 1.6 | 400 | 0 | font-mono text-[13px] |

---

## 3. 间距系统

### 3.1 间距 Token

| Token | 值 | Tailwind |
|-------|-----|----------|
| 1 | 4px | p-1 / gap-1 |
| 2 | 8px | p-2 / gap-2 |
| 3 | 12px | p-3 / gap-3 |
| 4 | 16px | p-4 / gap-4 |
| 5 | 20px | p-5 / gap-5 |
| 6 | 24px | p-6 / gap-6 |
| 8 | 32px | p-8 / gap-8 |
| 10 | 40px | p-10 / gap-10 |
| 12 | 48px | p-12 / gap-12 |
| 16 | 64px | p-16 / gap-16 |

---

## 4. 圆角系统

| Token | 值 | Tailwind | 用途 |
|-------|-----|----------|------|
| sm | 6px | rounded-sm | 小按钮、标签 |
| md | 8px | rounded-md | 按钮、输入框 |
| lg | 10px | rounded-lg | 卡片、面板 |
| xl | 12px | rounded-xl | 大卡片、模态框 |
| 2xl | 16px | rounded-2xl | 超大卡片 |
| full | 9999px | rounded-full | 药丸按钮 |

---

## 5. 阴影系统

| Token | Light | Dark | Tailwind |
|-------|-------|------|----------|
| sm | 0 1px 2px rgba(0,0,0,0.04) | 0 1px 2px rgba(0,0,0,0.2) | shadow-sm |
| md | 0 4px 12px rgba(0,0,0,0.06) | 0 4px 12px rgba(0,0,0,0.3) | shadow-md |
| lg | 0 8px 24px rgba(0,0,0,0.08) | 0 8px 24px rgba(0,0,0,0.4) | shadow-lg |
| xl | 0 16px 48px rgba(0,0,0,0.12) | 0 16px 48px rgba(0,0,0,0.5) | shadow-xl |

---

## 6. 动效系统

### 6.1 缓动函数

```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### 6.2 持续时间

| Token | 值 | Tailwind | 用途 |
|-------|-----|----------|------|
| instant | 75ms | duration-75 | 微交互 |
| fast | 150ms | duration-150 | 按钮悬停 |
| normal | 200ms | duration-200 | 状态切换 |
| slow | 300ms | duration-300 | 面板展开 |
| slower | 500ms | duration-500 | 页面过渡 |

### 6.3 动画模式

```css
/* 进入 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 脉冲 */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 旋转 */
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## 7. z-index 层级

| 层级 | 值 | 用途 |
|------|-----|------|
| Base | 0 | 默认内容 |
| Sticky | 10 | 粘性头部 |
| Dropdown | 50 | 下拉菜单 |
| Modal | 100 | 模态框 |
| Toast | 200 | 通知 toast |
| Tooltip | 300 | 工具提示 |
| Loading | 500 | 全屏加载 |

---

## 8. 响应式断点

| 名称 | 宽度 | Tailwind | 布局 |
|------|------|----------|------|
| Mobile | < 640px | default | 单列，堆叠 |
| Tablet | 640px+ | sm: | 单列，扩展 |
| Desktop | 768px+ | md: | 双栏开始 |
| Large | 1024px+ | lg: | 双栏固定 |
| XL | 1280px+ | xl: | 最大宽度限制 |
| 2XL | 1536px+ | 2xl: | 超大屏适配 |
