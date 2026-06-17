# DNS Shield 设计系统规范

> 版本: v2.3.0 | 最后更新: 2024-06-17 | 基于 Apple Human Interface Guidelines

---

## 目录

1. [设计原则](#1-设计原则)
2. [设计系统规范](#2-设计系统规范)
3. [组件库规范](#3-组件库规范)
4. [交互标准](#4-交互标准)

---

## 1. 设计原则

### 1.1 核心价值观

DNS Shield 采用 **Apple 设计语言**，追求简洁、优雅、高效的用户体验。

| 原则 | 说明 | 实践 |
|------|------|------|
| **清晰性** | 内容为核心，信息层次分明 | 高对比度文字，适当留白，语义化布局 |
| **一致性** | 视觉与交互保持统一 | 统一的组件样式，一致的交互反馈 |
| **深度** | 利用视觉层次传达关系 | 阴影层级、玻璃态效果、微妙的动效 |
| **响应性** | 设备自适应，体验流畅 | 响应式布局，流畅的动画过渡 |

### 1.2 设计哲学

```
┌─────────────────────────────────────────────────────────┐
│                   Apple 设计哲学                        │
├─────────────────────────────────────────────────────────┤
│  "技术真正的才华在于让复杂的事物变得简单。"              │
│  "Great design is achieved not when there's nothing      │
│   more to add, but when there's nothing left to take    │
│   away."                                                │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 设计系统规范

### 2.1 色彩系统

#### 2.1.1 主色调

| 语义名称 | 变量名 | 浅色模式 | 深色模式 | 使用场景 |
|---------|--------|---------|---------|---------|
| Primary | `--color-primary` | `#007AFF` | `#0A84FF` | 主按钮、重要链接 |
| Success | `--color-success` | `#34C759` | `#30D158` | 成功提示、正向指标 |
| Warning | `--color-warning` | `#FF9500` | `#FF9F0A` | 警告提示、注意事项 |
| Danger | `--color-danger` | `#FF3B30` | `#FF453A` | 错误提示、危险操作 |
| Info | `--color-info` | `#5AC8FA` | `#64D2FF` | 信息提示、辅助说明 |

#### 2.1.2 文本色

| 语义名称 | 变量名 | 浅色模式 | 深色模式 | 使用场景 |
|---------|--------|---------|---------|---------|
| Primary Text | `--text-primary` | `#1D1D1F` | `#F5F5F7` | 主标题、重要内容 |
| Secondary Text | `--text-secondary` | `#86868B` | `#A1A1A6` | 次要说明、辅助信息 |
| Tertiary Text | `--text-tertiary` | `#C7C7CC` | `#636366` | 禁用状态、占位符 |
| Inverse Text | `--text-inverse` | `#FFFFFF` | `#FFFFFF` | 深色背景上的文字 |

#### 2.1.3 背景色

| 语义名称 | 变量名 | 浅色模式 | 深色模式 | 使用场景 |
|---------|--------|---------|---------|---------|
| Background | `--bg-primary` | `#FFFFFF` | `#000000` | 主背景（OLED友好） |
| Secondary Background | `--bg-secondary` | `#F5F5F7` | `#1D1D1F` | 卡片、面板背景 |
| Tertiary Background | `--bg-tertiary` | `#E5E5EA` | `#2C2C2E` | 输入框、代码块 |
| Elevated Background | `--bg-elevated` | `#FFFFFF` | `#3A3A3C` | 弹出层、模态框 |

#### 2.1.4 边框与分割线

| 语义名称 | 变量名 | 浅色模式 | 深色模式 | 使用场景 |
|---------|--------|---------|---------|---------|
| Border | `--border-default` | `#D1D1D6` | `#38383A` | 默认边框 |
| Strong Border | `--border-strong` | `#C7C7CC` | `#48484A` | 强调边框 |
| Separator | `--border-separator` | `#C6C6C8` | `#38383A` | 分隔线 |

#### 2.1.5 Gray 色阶

| 变量名 | 浅色模式 | 深色模式 |
|--------|---------|---------|
| `--gray-50` | `#F9FAFB` | `#1F2937` |
| `--gray-100` | `#F3F4F6` | `#2D3748` |
| `--gray-200` | `#E5E7EB` | `#374151` |
| `--gray-300` | `#D1D5DB` | `#4B5563` |
| `--gray-400` | `#9CA3AF` | `#6B7280` |
| `--gray-500` | `#6B7280` | `#4B5563` |
| `--gray-600` | `#4B5563` | `#374151` |
| `--gray-700` | `#374151` | `#2D3748` |
| `--gray-800` | `#1F2937` | `#1F2937` |
| `--gray-900` | `#111827` | `#111827` |

#### 2.1.6 语义色彩映射

```css
/* 状态色彩 */
--color-info: #5AC8FA;
--color-success: #34C759;
--color-warning: #FF9500;
--color-error: #FF3B30;

/* 品牌渐变 */
--gradient-primary: linear-gradient(135deg, #007AFF, #0056CC);
--gradient-success: linear-gradient(135deg, #34C759, #248A3D);
--gradient-warning: linear-gradient(135deg, #FF9500, #C93400);
--gradient-danger: linear-gradient(135deg, #FF3B30, #D70015);
--gradient-brand: linear-gradient(135deg, #007AFF, #34C759, #FF9500, #007AFF);

/* 装饰性渐变 */
--gradient-background: linear-gradient(180deg, #F5F5F7 0%, #FFFFFF 100%);
```

---

### 2.2 字体规范

#### 2.2.1 字体族

```css
/* 系统字体栈 - Apple 平台优先 */
--font-system: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif;

/* 等宽字体栈 - 代码与数字 */
--font-mono: 'SF Mono', Monaco, Menlo, Consolas, 'Liberation Mono', monospace;

/* 应用字体变量 */
--font-primary: var(--font-system);
--font-secondary: var(--font-system);
--font-accent: var(--font-system);
```

#### 2.2.2 字体层级

| 层级 | CSS变量 | 字号 | 字重 | 行高 | 字间距 | 使用场景 |
|------|--------|------|------|------|--------|---------|
| Display | `--text-display` | clamp(2.5rem, 5vw, 3.5rem) | 700 | 1.1 | -0.025em | 页面主标题 |
| H1 | `--text-h1` | clamp(1.75rem, 3vw, 2.25rem) | 600 | 1.2 | -0.02em | 区块标题 |
| H2 | `--text-h2` | 1.5rem | 600 | 1.3 | -0.01em | 子标题 |
| H3 | `--text-h3` | 1.125rem | 600 | 1.4 | 0 | 卡片标题 |
| Body | `--text-body` | 1rem | 400 | 1.6 | 0 | 正文文本 |
| Body Small | `--text-body-sm` | 0.875rem | 400 | 1.5 | 0 | 辅助说明 |
| Caption | `--text-caption` | 0.75rem | 400 | 1.4 | 0.03em | 标签、徽章 |
| Overline | `--text-overline` | 0.625rem | 500 | 1.2 | 0.1em | 分类标签 |

#### 2.2.3 字号响应式断点

```css
/* 移动端 (< 640px) */
--text-display: 2rem;
--text-h1: 1.5rem;
--text-h2: 1.25rem;
--text-h3: 1.125rem;

/* 平板 (640px - 1023px) */
--text-display: 2.5rem;
--text-h1: 1.75rem;
--text-h2: 1.375rem;
--text-h3: 1.125rem;

/* 桌面端 (≥ 1024px) */
--text-display: 3rem;
--text-h1: 2rem;
--text-h2: 1.5rem;
--text-h3: 1.25rem;
```

---

### 2.3 间距与布局规范

#### 2.3.1 间距系统

基于 **4px** 基础单位的间距系统：

| 名称 | CSS变量 | 像素值 | 使用场景 |
|------|--------|--------|---------|
| 0 | `--spacing-0` | 0 | 元素间距为0 |
| 0.5 | `--spacing-0-5` | 2px | 紧凑间距 |
| 1 | `--spacing-1` | 4px | 微调间距 |
| 2 | `--spacing-2` | 8px | 小元素间距 |
| 3 | `--spacing-3` | 12px | 标准间距 |
| 4 | `--spacing-4` | 16px | 组件内间距 |
| 5 | `--spacing-5` | 20px | 卡片内间距 |
| 6 | `--spacing-6` | 24px | 区块间距 |
| 8 | `--spacing-8` | 32px | 大区块间距 |
| 10 | `--spacing-10` | 40px | 页面边距 |
| 12 | `--spacing-12` | 48px | 大间距 |
| 16 | `--spacing-16` | 64px | 巨大间距 |
| 20 | `--spacing-20` | 80px | 页面级间距 |
| 24 | `--spacing-24` | 96px | 超大间距 |

#### 2.3.2 布局网格

```css
/* 基础网格 */
--grid-columns: 12;
--grid-gutter: 24px;
--grid-margin: 16px;

/* 响应式网格 */
@media (min-width: 640px) {
  --grid-gutter: 24px;
  --grid-margin: 24px;
}

@media (min-width: 1024px) {
  --grid-gutter: 32px;
  --grid-margin: 48px;
}
```

#### 2.3.3 容器宽度

| 容器类型 | CSS变量 | 最大宽度 | 使用场景 |
|---------|--------|---------|---------|
| Container XS | `--container-xs` | 320px | 移动端完整布局 |
| Container SM | `--container-sm` | 640px | 紧凑布局 |
| Container MD | `--container-md` | 768px | 平板布局 |
| Container LG | `--container-lg` | 1024px | 桌面布局 |
| Container XL | `--container-xl` | 1280px | 宽屏布局 |
| Container 2XL | `--container-2xl` | 1536px | 超宽屏布局 |

---

### 2.4 圆角规范

| 名称 | CSS变量 | 像素值 | 使用场景 |
|------|--------|--------|---------|
| None | `--radius-none` | 0 | 技术性元素 |
| SM | `--radius-sm` | 6px | 小按钮、内联元素 |
| Default | `--radius-md` | 8px | 输入框、标签 |
| MD | `--radius-lg` | 12px | 按钮、卡片 |
| LG | `--radius-xl` | 16px | 面板、对话框 |
| XL | `--radius-2xl` | 20px | 大卡片 |
| 2XL | `--radius-3xl` | 24px | 主要容器 |
| Full | `--radius-full` | 9999px | 圆形头像、药丸按钮 |

---

### 2.5 阴影规范

#### 2.5.1 阴影层级

| 层级 | CSS变量 | 值 | 使用场景 |
|------|--------|-----|---------|
| None | `--shadow-none` | none | 无阴影 |
| XS | `--shadow-xs` | `0 2px 8px rgba(0, 0, 0, 0.04)` | 细微装饰 |
| SM | `--shadow-sm` | `0 4px 20px rgba(0, 0, 0, 0.08)` | 卡片、面板 |
| MD | `--shadow-md` | `0 8px 40px rgba(0, 0, 0, 0.12)` | 模态框、浮动组件 |
| LG | `--shadow-lg` | `0 20px 60px rgba(0, 0, 0, 0.15)` | 重点强调 |
| XL | `--shadow-xl` | `0 32px 80px rgba(0, 0, 0, 0.2)` | 弹窗、通知 |

#### 2.5.2 深色模式阴影

```css
/* 深色模式阴影 - 使用彩色阴影增加深度感 */
--shadow-sm: 0 4px 20px rgba(0, 0, 0, 0.25);
--shadow-md: 0 8px 40px rgba(0, 0, 0, 0.35);
--shadow-lg: 0 20px 60px rgba(0, 0, 0, 0.45);
```

---

### 2.6 图标规范

#### 2.6.1 图标库

使用 **Lucide Icons** 作为主要图标库：

```bash
# 安装
npm install lucide-react
```

#### 2.6.2 图标尺寸

| 名称 | CSS变量 | 像素值 | 使用场景 |
|------|--------|--------|---------|
| Icon XS | `--icon-xs` | 12px | 徽章内图标 |
| Icon SM | `--icon-sm` | 16px | 按钮内图标 |
| Icon MD | `--icon-md` | 20px | 标准图标 |
| Icon LG | `--icon-lg` | 24px | 强调图标 |
| Icon XL | `--icon-xl` | 32px | 大图标 |
| Icon 2XL | `--icon-2xl` | 48px | 装饰图标 |

#### 2.6.3 图标使用规范

```tsx
// ✅ 正确用法
<button className="btn btn-primary">
  <DownloadIcon className="icon-sm" />
  <span>下载</span>
</button>

// ❌ 错误用法 - 不要在组件内硬编码图标尺寸
<button className="btn btn-primary">
  <DownloadIcon className="w-4 h-4" />
  <span>下载</span>
</button>
```

---

### 2.7 动效规范

#### 2.7.1 动画曲线

| 曲线名称 | CSS变量 | 值 | 使用场景 |
|---------|--------|-----|---------|
| 标准曲线 | `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | 页面过渡、面板展开 |
| 进入曲线 | `--ease-enter` | `cubic-bezier(0, 0, 0.2, 1)` | 元素进入 |
| 退出曲线 | `--ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | 元素退出 |
| 弹性曲线 | `--ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 按钮点击、悬停反馈 |
| 快速曲线 | `--ease-sharp` | `cubic-bezier(0.32, 0.72, 0, 1)` | 菜单出现、提示显示 |
| 强调曲线 | `--ease-emphasized` | `cubic-bezier(0.2, 0, 0, 1)` | 强调动效 |

#### 2.7.2 动画时长

| 动效类型 | CSS变量 | 时长 | 使用场景 |
|---------|--------|------|---------|
| 瞬时 | `--duration-instant` | 0ms | 状态切换 |
| 快速 | `--duration-fast` | 100ms | 微交互、hover |
| 正常 | `--duration-normal` | 200ms | 按钮点击 |
| 适中 | `--duration-moderate` | 300ms | 过渡动画 |
| 缓慢 | `--duration-slow` | 400ms | 页面切换 |
| 惰性 | `--duration-slower` | 500ms | 大型动效 |

#### 2.7.3 微交互动效

```css
/* 悬停状态 - 2px上浮 + 阴影增强 */
.hover-lift {
  transition: transform var(--duration-normal) var(--ease-bounce),
              box-shadow var(--duration-normal) var(--ease-standard);
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 点击状态 - 向下按压 */
.hover-press:active {
  transform: scale(0.97);
  transition: transform var(--duration-instant) var(--ease-sharp);
}

/* 聚焦状态 - 轮廓线 */
.focus-ring:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 4px;
}
```

---

### 2.8 玻璃态效果

```css
/* 玻璃态背景 */
.glass {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
}

/* 深色模式玻璃态 */
.glass-dark {
  background: rgba(30, 30, 30, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

---

### 2.9 可访问性规范

| 规范 | 要求 | 实现 |
|------|------|------|
| 颜色对比度 | ≥ 4.5:1 | 所有文本满足 WCAG AA 标准 |
| 触控目标 | ≥ 44×44px | 移动端按钮最小尺寸 |
| 最小间距 | ≥ 12px | 元素间保持足够距离 |
| 语义化 HTML | ✓ | 使用正确的 HTML5 标签 |
| ARIA 属性 | ✓ | 必要时添加 ARIA 标签 |
| 键盘导航 | ✓ | 支持 Tab、Enter、Escape |
| 减少动画 | ✓ | 尊重 `prefers-reduced-motion` |

---

## 3. 组件库规范

### 3.1 基础组件

#### 3.1.1 按钮 (Button)

**变体 (Variants)**:

| 变体 | CSS类 | 使用场景 |
|------|-------|---------|
| Primary | `btn-primary` | 主要操作 |
| Secondary | `btn-secondary` | 次要操作 |
| Outline | `btn-outline` | 中性操作 |
| Ghost | `btn-ghost` | 辅助操作 |
| Destructive | `btn-destructive` | 危险操作 |

**尺寸 (Sizes)**:

| 尺寸 | CSS类 | 高度 | 内边距 |
|------|-------|------|--------|
| Small | `btn-sm` | 32px | 12px 16px |
| Default | `btn-default` | 40px | 16px 20px |
| Large | `btn-lg` | 48px | 20px 24px |
| Icon | `btn-icon` | 40px 40px | - |

**状态**:

```css
.btn {
  /* 默认状态 */
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  transition: all var(--duration-normal) var(--ease-standard);

  /* 悬停状态 */
  &:hover:not(:disabled) {
    background: color-mix(in srgb, var(--color-primary) 85%, black);
    transform: translateY(-1px);
  }

  /* 点击状态 */
  &:active:not(:disabled) {
    transform: scale(0.97);
  }

  /* 禁用状态 */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* 聚焦状态 */
  &:focus-visible {
    outline: 3px solid var(--color-primary);
    outline-offset: 2px;
  }

  /* 加载状态 */
  &.is-loading {
    position: relative;
    color: transparent;
    pointer-events: none;
  }
}
```

#### 3.1.2 输入框 (Input)

**结构**:

```tsx
<div className="input-wrapper">
  <label htmlFor="input-id" className="input-label">
    标签文字
  </label>
  <input
    id="input-id"
    type="text"
    placeholder="请输入..."
    className="input"
    disabled={false}
    aria-invalid={false}
  />
  <p className="input-description">辅助说明文字</p>
</div>
```

**状态样式**:

| 状态 | 样式 | 实现 |
|------|------|------|
| Default | 浅色背景、灰色边框 | `border: 1px solid var(--border-default)` |
| Hover | 边框加深 | `border-color: var(--border-strong)` |
| Focus | 蓝色边框、阴影 | `border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1)` |
| Disabled | 半透明背景 | `background: var(--bg-tertiary); opacity: 0.5` |
| Error | 红色边框 | `border-color: var(--color-danger)` |
| Success | 绿色边框 | `border-color: var(--color-success)` |

#### 3.1.3 选择器 (Select)

```tsx
<div className="select-wrapper">
  <label htmlFor="select-id" className="select-label">
    选择语言
  </label>
  <select id="select-id" className="select">
    <option value="zh">中文</option>
    <option value="en">English</option>
  </select>
</div>
```

#### 3.1.4 复选框 (Checkbox)

```tsx
<div className="checkbox-wrapper">
  <input
    type="checkbox"
    id="checkbox-id"
    className="checkbox"
  />
  <label htmlFor="checkbox-id" className="checkbox-label">
    启用 IPv6 阻止
  </label>
</div>
```

#### 3.1.5 开关 (Switch)

```tsx
<div className="switch-wrapper">
  <label htmlFor="switch-id" className="switch-label">
    深色模式
  </label>
  <input
    type="checkbox"
    id="switch-id"
    role="switch"
    className="switch"
  />
</div>
```

#### 3.1.6 徽章 (Badge)

| 变体 | CSS类 | 用途 |
|------|-------|------|
| Default | `badge-default` | 默认标签 |
| Primary | `badge-primary` | 主要信息 |
| Success | `badge-success` | 成功状态 |
| Warning | `badge-warning` | 警告状态 |
| Danger | `badge-danger` | 错误状态 |
| Outline | `badge-outline` | 轮廓样式 |

---

### 3.2 复合组件

#### 3.2.1 表单 (Form)

```tsx
<form className="form">
  <div className="form-group">
    <label htmlFor="domain" className="form-label">
      域名列表
      <span className="form-required">*</span>
    </label>
    <textarea
      id="domain"
      className="form-textarea"
      rows={10}
      placeholder="每行一个域名..."
    />
    <p className="form-hint">支持批量输入，每行一个域名</p>
  </div>

  <div className="form-actions">
    <button type="button" className="btn btn-secondary">
      重置
    </button>
    <button type="submit" className="btn btn-primary">
      生成规则
    </button>
  </div>
</form>
```

#### 3.2.2 卡片 (Card)

```tsx
<div className="card">
  <div className="card-header">
    <h3 className="card-title">卡片标题</h3>
    <p className="card-description">卡片描述文字</p>
  </div>
  <div className="card-content">
    卡片内容区域
  </div>
  <div className="card-footer">
    <button className="btn btn-primary">操作按钮</button>
  </div>
</div>
```

#### 3.2.3 对话框 (Dialog)

```tsx
<dialog className="dialog" open>
  <div className="dialog-backdrop" />
  <div className="dialog-container">
    <div className="dialog-header">
      <h2 className="dialog-title">确认删除</h2>
      <button className="dialog-close" aria-label="关闭">
        <XIcon className="icon-md" />
      </button>
    </div>
    <div className="dialog-content">
      确定要删除选中的域名吗？
    </div>
    <div className="dialog-footer">
      <button className="btn btn-secondary">取消</button>
      <button className="btn btn-destructive">确认删除</button>
    </div>
  </div>
</dialog>
```

#### 3.2.4 标签页 (Tabs)

```tsx
<div className="tabs">
  <div className="tabs-list" role="tablist">
    <button
      role="tab"
      aria-selected="true"
      className="tabs-trigger active"
    >
      Dnsmasq
    </button>
    <button
      role="tab"
      aria-selected="false"
      className="tabs-trigger"
    >
      Hosts
    </button>
    <button
      role="tab"
      aria-selected="false"
      className="tabs-trigger"
    >
      AdGuard
    </button>
  </div>
  <div className="tabs-content" role="tabpanel">
    内容区域
  </div>
</div>
```

---

### 3.3 业务组件

#### 3.3.1 域名列表组件 (DomainList)

```tsx
<div className="domain-list">
  <div className="domain-list-header">
    <div className="domain-stats">
      <span className="stat-item">
        <strong>473</strong> 个域名
      </span>
      <span className="stat-item">
        <strong>452</strong> 黑名单
      </span>
      <span className="stat-item">
        <strong>21</strong> 白名单
      </span>
    </div>
    <div className="domain-actions">
      <button className="btn btn-sm btn-ghost">
        <SortIcon className="icon-sm" />
        排序
      </button>
      <button className="btn btn-sm btn-ghost">
        <DedupeIcon className="icon-sm" />
        去重
      </button>
    </div>
  </div>
  <div className="domain-list-content">
    <!-- 域名列表内容 -->
  </div>
</div>
```

#### 3.3.2 规则预览组件 (RulePreview)

```tsx
<div className="rule-preview">
  <div className="rule-preview-header">
    <h4 className="rule-preview-title">Dnsmasq 规则预览</h4>
    <button className="btn btn-sm btn-ghost">
      <CopyIcon className="icon-sm" />
      复制
    </button>
  </div>
  <pre className="rule-preview-code">
    <code>
      address=/ad.example.com/0.0.0.0
      address=/ad2.example.com/0.0.0.0
    </code>
  </pre>
</div>
```

#### 3.3.3 主题切换器 (ThemeToggle)

```tsx
<div className="theme-toggle">
  <button
    className="theme-toggle-item active"
    data-theme="light"
    aria-label="浅色模式"
  >
    <SunIcon className="icon-md" />
    <span>浅色</span>
  </button>
  <button
    className="theme-toggle-item"
    data-theme="dark"
    aria-label="深色模式"
  >
    <MoonIcon className="icon-md" />
    <span>深色</span>
  </button>
  <button
    className="theme-toggle-item"
    data-theme="system"
    aria-label="跟随系统"
  >
    <MonitorIcon className="icon-md" />
    <span>自动</span>
  </button>
</div>
```

#### 3.3.4 语言选择器 (LanguageSelector)

```tsx
<div className="language-selector">
  <button
    className="language-selector-trigger"
    aria-expanded="false"
    aria-haspopup="listbox"
  >
    <GlobeIcon className="icon-md" />
    <span>中文</span>
    <ChevronDownIcon className="icon-sm" />
  </button>
  <ul className="language-selector-dropdown" role="listbox">
    <li role="option" className="active">中文</li>
    <li role="option">English</li>
    <li role="option">日本語</li>
    <!-- 更多语言 -->
  </ul>
</div>
```

---

### 3.4 组件使用规则

#### 3.4.1 命名规范

```
组件类型        | 命名格式        | 示例
----------------|-----------------|------------------
React 组件      | PascalCase      | InputPanel.tsx
工具函数        | camelCase       | generateLineNumbers
CSS 类          | kebab-case      | btn-primary
CSS 变量        | kebab-case      | --color-primary
组件目录        | kebab-case      | /src/components/input-panel
```

#### 3.4.2 文件结构

```
src/
├── components/
│   ├── ui/                    # 基础 UI 组件
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   └── index.ts
│   ├── domain/               # 业务组件
│   │   ├── DomainList.tsx
│   │   ├── RulePreview.tsx
│   │   └── index.ts
│   └── layout/               # 布局组件
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── index.ts
└── styles/
    └── components/           # 组件样式
        ├── button.css
        └── input.css
```

#### 3.4.3 Props 规范

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'start' | 'end';
  children: ReactNode;
  className?: string;
  onClick?: (event: MouseEvent) => void;
}
```

---

## 4. 交互标准

### 4.1 交互模式库

#### 4.1.1 点击交互

| 操作 | 反馈 | 时长 |
|------|------|------|
| 按钮点击 | 缩放至 0.97 + 颜色变化 | 100ms |
| 链接点击 | 颜色加深 + 下划线 | 150ms |
| 图标点击 | 背景色变化 + 缩放 | 100ms |

#### 4.1.2 悬停交互

| 元素类型 | 悬停效果 | 时长 |
|---------|---------|------|
| 按钮 | 背景加深 + 上浮 2px | 200ms |
| 卡片 | 阴影增强 + 上浮 4px | 200ms |
| 链接 | 下划线显示 | 150ms |
| 表格行 | 背景色变化 | 100ms |

#### 4.1.3 拖拽交互

```css
.draggable {
  cursor: grab;
  transition: transform var(--duration-normal) var(--ease-standard);
}

.draggable:active {
  cursor: grabbing;
  transform: scale(1.02);
  box-shadow: var(--shadow-lg);
}

.drag-over {
  background: var(--bg-secondary);
  border: 2px dashed var(--color-primary);
}
```

---

### 4.2 交互反馈规范

#### 4.2.1 加载状态

| 类型 | 实现 | 示例 |
|------|------|------|
| 骨架屏 | `Skeleton` 组件 | 数据列表加载 |
| 旋转器 | `Spinner` 组件 | 按钮内加载 |
| 进度条 | `Progress` 组件 | 文件上传 |
| 文字提示 | "加载中..." | 操作反馈 |

```tsx
// 骨架屏示例
<div className="domain-list">
  <div className="skeleton skeleton-title" />
  <div className="skeleton skeleton-line" />
  <div className="skeleton skeleton-line short" />
  <div className="skeleton skeleton-line" />
</div>

// 按钮加载状态
<button className="btn btn-primary is-loading" disabled>
  <SpinnerIcon className="icon-sm animate-spin" />
  生成中...
</button>
```

#### 4.2.2 成功反馈

| 类型 | 实现 | 时长 |
|------|------|------|
| Toast 提示 | `Toast` 组件 | 3秒后自动消失 |
| 成功图标 | 绿色对勾 + 文字 | 即时 |
| 颜色变化 | 绿色边框/背景 | 即时 |

```tsx
// 成功 Toast 示例
<Toast variant="success" message="规则已成功生成！" />

// 内联成功反馈
<div className="success-message">
  <CheckCircleIcon className="icon-success" />
  <span>域名已添加</span>
</div>
```

#### 4.2.3 错误反馈

| 类型 | 实现 | 示例 |
|------|------|------|
| Toast 提示 | 红色错误提示 | 网络错误 |
| 输入框错误 | 红色边框 + 错误文字 | 表单验证 |
| 对话框确认 | 警告对话框 | 危险操作确认 |

```tsx
// 错误 Toast 示例
<Toast variant="error" message="网络连接失败，请重试" />

// 表单错误示例
<div className="form-field error">
  <label htmlFor="domain">域名列表</label>
  <input
    id="domain"
    className="input error"
    aria-invalid="true"
  />
  <p className="form-error">请输入有效的域名格式</p>
</div>
```

---

### 4.3 错误处理规范

#### 4.3.1 网络错误

```tsx
// 网络错误处理流程
async function fetchDomains() {
  try {
    const response = await fetch(config.domainsUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    return text;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // 网络连接错误
      showToast('error', 'networkError');
    } else {
      // 其他错误
      showToast('error', 'unknownError');
    }
    // 回退到本地数据
    return fetchLocalDomains();
  }
}
```

#### 4.3.2 表单验证错误

```tsx
// 表单验证规则
const validationRules = {
  domain: {
    required: true,
    pattern: /^[a-zA-Z0-9][a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}$/,
    message: '请输入有效的域名格式'
  },
  url: {
    required: true,
    pattern: /^https?:\/\/.+/,
    message: '请输入有效的 URL 地址'
  }
};

// 验证执行
function validateDomain(input: string): ValidationResult {
  if (!input.trim()) {
    return { valid: false, message: '域名不能为空' };
  }
  if (!validationRules.domain.pattern.test(input)) {
    return { valid: false, message: validationRules.domain.message };
  }
  return { valid: true };
}
```

#### 4.3.3 危险操作确认

```tsx
// 危险操作对话框
<AlertDialog
  title="确认删除"
  description="此操作不可撤销。确定要删除选中的域名吗？"
  cancelText="取消"
  confirmText="确认删除"
  variant="destructive"
  onConfirm={handleDelete}
/>
```

---

### 4.4 空状态设计规范

#### 4.4.1 空状态类型

| 类型 | 场景 | 设计建议 |
|------|------|---------|
| 初始空状态 | 首次使用 | 引导性插图 + 操作提示 |
| 筛选空状态 | 无匹配结果 | 筛选条件 + 清除建议 |
| 错误空状态 | 数据加载失败 | 错误说明 + 重试按钮 |
| 权限空状态 | 无访问权限 | 权限说明 + 申请入口 |

#### 4.4.2 空状态组件示例

```tsx
<div className="empty-state">
  <div className="empty-state-icon">
    <FileTextIcon className="icon-2xl text-muted" />
  </div>
  <h3 className="empty-state-title">暂无域名</h3>
  <p className="empty-state-description">
    添加您的第一个域名，开始生成广告过滤规则
  </p>
  <div className="empty-state-actions">
    <button className="btn btn-primary">
      <PlusIcon className="icon-sm" />
      添加域名
    </button>
    <button className="btn btn-outline">
      导入预设源
    </button>
  </div>
</div>
```

#### 4.4.3 空状态样式

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12) var(--spacing-6);
  text-align: center;
}

.empty-state-icon {
  margin-bottom: var(--spacing-6);
  color: var(--text-tertiary);
}

.empty-state-title {
  margin-bottom: var(--spacing-2);
  font-size: var(--text-h3);
  font-weight: 600;
  color: var(--text-primary);
}

.empty-state-description {
  max-width: 320px;
  margin-bottom: var(--spacing-6);
  font-size: var(--text-body);
  color: var(--text-secondary);
}

.empty-state-actions {
  display: flex;
  gap: var(--spacing-3);
}
```

---

### 4.5 页面过渡规范

#### 4.5.1 页面进入动画

```css
/* 页面淡入 + 上滑 */
.page-enter {
  opacity: 0;
  transform: translateY(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity var(--duration-moderate) var(--ease-enter),
              transform var(--duration-moderate) var(--ease-enter);
}

/* 子元素依次进入 - 使用 animation-delay */
.page-content:nth-child(1) { animation-delay: 0ms; }
.page-content:nth-child(2) { animation-delay: 100ms; }
.page-content:nth-child(3) { animation-delay: 200ms; }
```

#### 4.5.2 面板切换动画

```css
/* 面板展开 */
.panel-expand {
  animation: panelExpand var(--duration-moderate) var(--ease-bounce);
}

@keyframes panelExpand {
  from {
    opacity: 0;
    transform: scaleY(0.95);
  }
  to {
    opacity: 1;
    transform: scaleY(1);
  }
}
```

#### 4.5.3 减少动画偏好

```css
/* 尊重用户减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 附录 A: CSS 变量完整列表

```css
/* 颜色 - 主色调 */
--color-primary: #007AFF;
--color-primary-hover: #0056CC;
--color-success: #34C759;
--color-warning: #FF9500;
--color-danger: #FF3B30;
--color-info: #5AC8FA;

/* 颜色 - 文本 */
--text-primary: #1D1D1F;
--text-secondary: #86868B;
--text-tertiary: #C7C7CC;
--text-inverse: #FFFFFF;

/* 颜色 - 背景 */
--bg-primary: #FFFFFF;
--bg-secondary: #F5F5F7;
--bg-tertiary: #E5E5EA;
--bg-elevated: #FFFFFF;

/* 颜色 - 边框 */
--border-default: #D1D1D6;
--border-strong: #C7C7CC;
--border-separator: #C6C6C8;

/* 字体 */
--font-primary: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
--font-mono: 'SF Mono', Monaco, Menlo, monospace;

/* 字号 */
--text-display: clamp(2.5rem, 5vw, 3.5rem);
--text-h1: clamp(1.75rem, 3vw, 2.25rem);
--text-h2: 1.5rem;
--text-h3: 1.125rem;
--text-body: 1rem;
--text-body-sm: 0.875rem;
--text-caption: 0.75rem;

/* 间距 */
--spacing-0: 0;
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
--shadow-xs: 0 2px 8px rgba(0, 0, 0, 0.04);
--shadow-sm: 0 4px 20px rgba(0, 0, 0, 0.08);
--shadow-md: 0 8px 40px rgba(0, 0, 0, 0.12);
--shadow-lg: 0 20px 60px rgba(0, 0, 0, 0.15);

/* 动画 */
--duration-instant: 0ms;
--duration-fast: 100ms;
--duration-normal: 200ms;
--duration-moderate: 300ms;
--duration-slow: 400ms;

--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
--ease-enter: cubic-bezier(0, 0, 0.2, 1);
--ease-exit: cubic-bezier(0.4, 0, 1, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-sharp: cubic-bezier(0.32, 0.72, 0, 1);
```

---

## 附录 B: 组件状态速查表

| 组件 | Default | Hover | Active | Focus | Disabled | Loading |
|------|---------|-------|--------|-------|----------|---------|
| Button | 主色背景 | 颜色加深 | 缩放0.97 | 轮廓线 | 半透明 | 旋转图标 |
| Input | 灰色边框 | 边框加深 | 蓝色边框 | 蓝色+阴影 | 半透明背景 | - |
| Link | 主色文字 | 下划线 | 颜色加深 | 轮廓线 | 半透明 | - |
| Card | 白色背景 | 上浮+阴影 | - | - | - | 骨架屏 |
| Checkbox | 灰色边框 | 边框加深 | 蓝色填充 | 轮廓线 | 半透明 | - |
| Switch | 灰色滑块 | 滑块加深 | 滑块移动 | 轮廓线 | 禁用颜色 | - |

---

*本文档遵循 Apple Human Interface Guidelines 和 DNS Shield 项目设计理念*
