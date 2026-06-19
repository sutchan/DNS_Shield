# DNS Shield 设计系统规范

> 版本: v2.3.0 | 最后更新: 2024-06-19 | 极简国际顶尖设计师水准

---

## 目录

1. [设计原则](#1-设计原则)
2. [色彩系统](#2-色彩系统)
3. [字体系统](#3-字体系统)
4. [间距系统](#4-间距系统)
5. [圆角规范](#5-圆角规范)
6. [阴影规范](#6-阴影规范)
7. [动效规范](#7-动效规范)
8. [可访问性规范](#8-可访问性规范)

---

## 1. 设计原则

### 1.1 核心原则

| 原则 | 说明 |
|------|------|
| **Less is More** | 极简主义，去除一切非必要元素 |
| **瑞士风格网格** | 严谨的网格系统，清晰的视觉层次 |
| **强调留白** | 充足留白，内容呼吸 |
| **微妙动效** | 细腻的动效反馈，不喧宾夺主 |

### 1.2 设计哲学

```
┌─────────────────────────────────────────────────────────┐
│                   极简设计哲学                            │
├─────────────────────────────────────────────────────────┤
│  "Simple is not the absence of complexity,              │
│   but the ability to simplify."                        │
│                                                          │
│  "Perfection is achieved not when there is nothing      │
│   more to add, but when there is nothing left to take   │
│   away."                                                │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 色彩系统

### 2.1 主色调

```css
/* 主色 - 纯净蓝 */
--color-primary: #007AFF;
--color-primary-hover: #0056CC;

/* 语义色 - 保持简洁 */
--color-success: #22C55E;  /* 绿色 - 成功 */
--color-warning: #F59E0B;  /* 琥珀 - 警告 */
--color-danger: #EF4444;   /* 红色 - 错误/危险 */
```

### 2.2 中性色 - 极简灰阶

```css
--gray-50: #FAFAFA;
--gray-100: #F4F4F5;
--gray-200: #E4E4E7;
--gray-300: #D4D4D8;
--gray-400: #A1A1AA;
--gray-500: #71717A;
--gray-600: #52525B;
--gray-700: #3F3F46;
--gray-800: #27272A;
--gray-900: #18181B;
--gray-950: #09090B;
```

### 2.3 文本色

```css
--text-primary: #09090B;    /* 主要文本 */
--text-secondary: #71717A;  /* 次要文本 */
--text-tertiary: #A1A1AA;   /* 辅助文本 */
```

### 2.4 背景色

```css
--bg-primary: #FFFFFF;     /* 主背景 */
--bg-secondary: #F4F4F5;   /* 次级背景 */
--bg-elevated: #FFFFFF;    /* 浮层背景 */
```

### 2.5 边框色

```css
--border-default: #E4E4E7;
--border-strong: #D4D4D8;
```

---

## 3. 字体系统

### 3.1 字体族

```css
/* 主字体 - Inter */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* 等宽字体 - JetBrains Mono */
--font-mono: 'JetBrains Mono', 'SF Mono', Monaco, Consolas, monospace;
```

### 3.2 字体层级

| 层级 | CSS变量 | 字号 | 字重 | 使用场景 |
|------|--------|------|------|---------|
| Display | `--text-display` | clamp(2rem, 4vw, 3rem) | 700 | 页面主标题 |
| H1 | `--text-h1` | clamp(1.5rem, 3vw, 2rem) | 600 | 区块标题 |
| H2 | `--text-h2` | 1.25rem | 600 | 子标题 |
| H3 | `--text-h3` | 1rem | 600 | 卡片标题 |
| Body | `--text-body` | 0.875rem | 400 | 正文文本 |
| Small | `--text-small` | 0.75rem | 400 | 辅助说明 |
| Caption | `--text-caption` | 0.625rem | 500 | 标签、徽章 |

### 3.3 字体规范

```css
/* 标题字体 */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-sans);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

/* 正文字体 */
body {
  font-family: var(--font-sans);
  font-weight: 400;
  line-height: 1.6;
  letter-spacing: 0;
}

/* 等宽字体 */
code, pre, .mono {
  font-family: var(--font-mono);
}
```

---

## 4. 间距系统

基于 **4px** 基础单位的间距系统：

| 名称 | CSS变量 | 像素值 |
|------|--------|--------|
| 1 | `--spacing-1` | 4px |
| 2 | `--spacing-2` | 8px |
| 3 | `--spacing-3` | 12px |
| 4 | `--spacing-4` | 16px |
| 5 | `--spacing-5` | 20px |
| 6 | `--spacing-6` | 24px |
| 8 | `--spacing-8` | 32px |
| 10 | `--spacing-10` | 40px |
| 12 | `--spacing-12` | 48px |
| 16 | `--spacing-16` | 64px |

---

## 5. 圆角规范

| 名称 | CSS变量 | 像素值 | 使用场景 |
|------|--------|--------|---------|
| sm | `--radius-sm` | 6px | 小按钮、内联元素 |
| md | `--radius-md` | 8px | 默认圆角 |
| lg | `--radius-lg` | 12px | 按钮、卡片 |
| xl | `--radius-xl` | 16px | 面板 |
| 2xl | `--radius-2xl` | 24px | 大卡片 |
| full | `--radius-full` | 9999px | 圆形头像、药丸按钮 |

---

## 6. 阴影规范

极简风格的微妙阴影：

```css
--shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
--shadow-sm: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
```

### 阴影使用场景

| 阴影 | 使用场景 |
|------|---------|
| `--shadow-xs` | 细微装饰元素 |
| `--shadow-sm` | 卡片、按钮悬停 |
| `--shadow-md` | 模态框、弹出层 |
| `--shadow-lg` | 重点强调、拖拽 |

---

## 7. 动效规范

### 7.1 动画时长

| 名称 | CSS变量 | 时长 | 使用场景 |
|------|--------|------|---------|
| 快速 | `--transition-fast` | 100ms | 微交互、hover |
| 正常 | `--transition-normal` | 200ms | 状态切换 |
| 缓慢 | `--transition-slow` | 300ms | 页面过渡 |

### 7.2 动画曲线

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);  /* 自然的减速曲线 */
--ease-in: cubic-bezier(0.7, 0, 0.84, 0);   /* 加速曲线 */
--ease-in-out: cubic-bezier(0.45, 0, 0.55, 1); /* 对称曲线 */
```

### 7.3 过渡变量

```css
--transition-fast: 100ms ease;
--transition-normal: 200ms ease;
--transition-slow: 300ms ease-out;
```

### 7.4 微交互动效

```css
/* 悬停状态 - 轻微上浮 */
.hover-lift {
  transition: transform var(--transition-normal) var(--ease-out),
              box-shadow var(--transition-normal) var(--ease-out);
}
.hover-lift:hover {
  transform: translateY(-2px);
}

/* 点击状态 - 轻微缩放 */
.hover-press:active {
  transform: scale(0.98);
}

/* 聚焦状态 - 轮廓线 */
.focus-ring:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

---

## 8. 可访问性规范

| 规范 | 要求 |
|------|------|
| 颜色对比度 | ≥ 4.5:1 (文本)、≥ 3:1 (大文本) |
| 触控目标 | ≥ 44×44px |
| 键盘导航 | 支持 Tab、Enter、Escape |
| 减少动画 | 尊重 `prefers-reduced-motion` |
| ARIA 属性 | 必要时添加 |

---

## 附录 A: CSS 变量完整列表

```css
/* 主色 */
--color-primary: #007AFF;
--color-primary-hover: #0056CC;

/* 语义色 */
--color-success: #22C55E;
--color-warning: #F59E0B;
--color-danger: #EF4444;

/* 灰阶 */
--gray-50: #FAFAFA;
--gray-100: #F4F4F5;
--gray-200: #E4E4E7;
--gray-300: #D4D4D8;
--gray-400: #A1A1AA;
--gray-500: #71717A;
--gray-600: #52525B;
--gray-700: #3F3F46;
--gray-800: #27272A;
--gray-900: #18181B;
--gray-950: #09090B;

/* 文本色 */
--text-primary: #09090B;
--text-secondary: #71717A;
--text-tertiary: #A1A1AA;

/* 背景色 */
--bg-primary: #FFFFFF;
--bg-secondary: #F4F4F5;
--bg-elevated: #FFFFFF;

/* 边框色 */
--border-default: #E4E4E7;
--border-strong: #D4D4D8;

/* 字体 */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', Monaco, monospace;

/* 字号 */
--text-display: clamp(2rem, 4vw, 3rem);
--text-h1: clamp(1.5rem, 3vw, 2rem);
--text-h2: 1.25rem;
--text-h3: 1rem;
--text-body: 0.875rem;
--text-small: 0.75rem;
--text-caption: 0.625rem;

/* 间距 */
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-5: 20px;
--spacing-6: 24px;
--spacing-8: 32px;
--spacing-10: 40px;
--spacing-12: 48px;
--spacing-16: 64px;

/* 圆角 */
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 24px;
--radius-full: 9999px;

/* 阴影 */
--shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
--shadow-sm: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);

/* 动画 */
--transition-fast: 100ms ease;
--transition-normal: 200ms ease;
--transition-slow: 300ms ease-out;

--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in: cubic-bezier(0.7, 0, 0.84, 0);
--ease-in-out: cubic-bezier(0.45, 0, 0.55, 1);
```

---

## 附录 B: 组件状态速查表

| 组件 | Default | Hover | Active | Focus | Disabled |
|------|---------|-------|--------|-------|----------|
| Button | 主色背景 | 颜色加深 | 缩放0.98 | 轮廓线 | 半透明 |
| Input | 灰边框 | 边框加深 | 蓝色边框 | 蓝色+阴影 | 半透明背景 |
| Card | 白色背景 | 上浮2px | - | - | - |
| Checkbox | 灰边框 | 边框加深 | 蓝色填充 | 轮廓线 | 半透明 |
| Switch | 灰色滑块 | 滑块加深 | 滑块移动 | 轮廓线 | 禁用颜色 |

---

*DNS Shield 设计系统 - 极简、清晰、高效*
