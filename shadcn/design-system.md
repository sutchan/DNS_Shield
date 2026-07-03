# DNS Shield — 设计系统规范 v3.3.0
> 基于 shadcn/ui + Tailwind CSS + Radix UI 的完整设计系统

---

## 1. 色彩系统

### 1.1 CSS 变量（HSL 格式）

```css
:root {
  /* Background */
  --background: 0 0% 100%;
  --foreground: 240 6% 10%;

  /* Card */
  --card: 0 0% 100%;
  --card-foreground: 240 6% 10%;

  /* Popover */
  --popover: 0 0% 100%;
  --popover-foreground: 240 6% 10%;

  /* Primary — Apple Blue */
  --primary: 211 100% 50%;
  --primary-foreground: 0 0% 100%;

  /* Secondary */
  --secondary: 240 5% 96%;
  --secondary-foreground: 240 6% 10%;

  /* Muted */
  --muted: 240 5% 96%;
  --muted-foreground: 240 4% 46%;

  /* Accent */
  --accent: 240 5% 96%;
  --accent-foreground: 240 6% 10%;

  /* Destructive */
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;

  /* Border / Input / Ring */
  --border: 240 6% 90%;
  --input: 240 6% 90%;
  --ring: 211 100% 50%;

  /* Radius */
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

### 1.2 颜色语义映射

| 语义 | Light 色值 | Dark 色值 | Tailwind |
|------|-----------|-----------|----------|
| 页面背景 | #FFFFFF | #0A0A0F | bg-background |
| 卡片背景 | #F5F5F7 | #141419 | bg-card |
| 浮层背景 | #FFFFFF | #1C1C24 | bg-popover |
| 主按钮 | #007AFF | #0A84FF | bg-primary |
| 次按钮 | #F5F5F7 | #1C1C24 | bg-secondary |
| 主文字 | #1D1D1F | #F5F5F7 | text-foreground |
| 次文字 | #6E6E73 | #98989D | text-muted-foreground |
| 边框 | #D2D2D7 | #2C2C3A | border-border |
| 成功 | #34C759 | #30D158 | text-green-500 |
| 警告 | #FF9500 | #FF9F0A | text-orange-500 |
| 错误 | #FF3B30 | #FF453A | text-red-500 |

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
| sm | 6px | rounded-md | 小按钮、标签 |
| md | 8px | rounded-lg | 按钮、输入框 |
| lg | 12px | rounded-xl | 卡片、面板 |
| xl | 16px | rounded-2xl | 大卡片、模态框 |
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
