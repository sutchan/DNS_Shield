# DNS Shield 组件库规范

> 版本: v2.3.0 | 最后更新: 2024-06-19

---

## 目录

1. [基础组件](#1-基础组件)
2. [复合组件](#2-复合组件)
3. [业务组件](#3-业务组件)
4. [组件使用规则](#4-组件使用规则)

---

## 1. 基础组件

### 1.1 Button

**变体 (Variants)**:

| 变体 | 说明 | 使用场景 |
|------|------|---------|
| `primary` | 主要按钮 | 主操作 |
| `secondary` | 次要按钮 | 次要操作 |
| `outline` | 轮廓按钮 | 中性操作 |
| `ghost` | 幽灵按钮 | 辅助操作 |
| `destructive` | 危险按钮 | 危险操作 |

**尺寸 (Sizes)**:

| 尺寸 | 高度 | 内边距 | 使用场景 |
|------|------|--------|---------|
| `sm` | 32px | 8px 12px | 紧凑布局 |
| `default` | 40px | 12px 16px | 默认 |
| `lg` | 48px | 16px 24px | 强调操作 |
| `icon` | 40px 40px | - | 图标按钮 |

**状态**:

| 状态 | 样式 |
|------|------|
| Default | 主色背景，白色文字 |
| Hover | 颜色加深至 `--color-primary-hover` |
| Active | 缩放至 0.98 |
| Focus | 2px 主色轮廓线，offset 2px |
| Disabled | opacity 0.5，cursor not-allowed |
| Loading | 显示 spinner，文字变透明 |

**代码示例 (React TSX)**:

```tsx
import { Loader2 } from 'lucide-react';

// Primary Button
<button className="btn btn-primary">
  主要操作
</button>

// Secondary Button
<button className="btn btn-secondary">
  次要操作
</button>

// Outline Button
<button className="btn btn-outline">
  中性操作
</button>

// Ghost Button
<button className="btn btn-ghost">
  辅助操作
</button>

// Destructive Button
<button className="btn btn-destructive">
  删除
</button>

// Loading State
<button className="btn btn-primary" disabled>
  <Loader2 className="icon-sm animate-spin" />
  生成中...
</button>
```

**CSS 样式**:

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  font-family: var(--font-sans);
  font-weight: 500;
  border-radius: var(--radius-md);
  transition: all var(--transition-normal) var(--ease-out);
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

---

### 1.2 Input

**类型**:

| 类型 | 说明 |
|------|------|
| `text` | 普通文本 |
| `password` | 密码输入 |
| `url` | URL 输入 |
| `email` | 邮箱输入 |
| `search` | 搜索输入 |

**状态**:

| 状态 | 样式 |
|------|------|
| Default | 灰色边框 `--border-default` |
| Hover | 边框加深至 `--border-strong` |
| Focus | 蓝色边框，3px 淡蓝色阴影 |
| Disabled | 半透明背景 `--bg-secondary` |
| Error | 红色边框 `--color-danger` |
| Success | 绿色边框 `--color-success` |

**代码示例 (React TSX)**:

```tsx
// Text Input
<div className="input-wrapper">
  <label htmlFor="domain" className="input-label">
    域名列表
  </label>
  <input
    id="domain"
    type="text"
    placeholder="每行一个域名..."
    className="input"
  />
</div>

// Password Input
<div className="input-wrapper">
  <label htmlFor="password" className="input-label">
    密码
  </label>
  <input
    id="password"
    type="password"
    placeholder="请输入密码"
    className="input"
  />
</div>

// URL Input
<div className="input-wrapper">
  <label htmlFor="url" className="input-label">
    规则 URL
  </label>
  <input
    id="url"
    type="url"
    placeholder="https://example.com/rules.txt"
    className="input"
  />
</div>

// Error State
<div className="input-wrapper">
  <label htmlFor="error" className="input-label">
    域名
  </label>
  <input
    id="error"
    type="text"
    className="input error"
    aria-invalid="true"
  />
  <p className="input-error">请输入有效的域名格式</p>
</div>
```

**CSS 样式**:

```css
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.input-label {
  font-size: var(--text-small);
  font-weight: 500;
  color: var(--text-primary);
}

.input {
  width: 100%;
  height: 40px;
  padding: 0 var(--spacing-3);
  font-family: var(--font-sans);
  font-size: var(--text-body);
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast) var(--ease-out);
}

.input:hover:not(:disabled) {
  border-color: var(--border-strong);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.input:disabled {
  background: var(--bg-secondary);
  opacity: 0.5;
  cursor: not-allowed;
}

.input.error {
  border-color: var(--color-danger);
}

.input.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-error {
  font-size: var(--text-small);
  color: var(--color-danger);
}
```

---

### 1.3 Select

**代码示例 (React TSX)**:

```tsx
<div className="select-wrapper">
  <label htmlFor="format" className="select-label">
    输出格式
  </label>
  <select id="format" className="select">
    <option value="dnsmasq">Dnsmasq</option>
    <option value="hosts">Hosts</option>
    <option value="adguard">AdGuard Home</option>
  </select>
</div>
```

**CSS 样式**:

```css
.select-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.select-label {
  font-size: var(--text-small);
  font-weight: 500;
  color: var(--text-primary);
}

.select {
  width: 100%;
  height: 40px;
  padding: 0 var(--spacing-8) 0 var(--spacing-3);
  font-family: var(--font-sans);
  font-size: var(--text-body);
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371717A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.select:hover:not(:disabled) {
  border-color: var(--border-strong);
}

.select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}
```

---

### 1.4 Checkbox

**代码示例 (React TSX)**:

```tsx
<div className="checkbox-wrapper">
  <input
    type="checkbox"
    id="ipv6"
    className="checkbox"
  />
  <label htmlFor="ipv6" className="checkbox-label">
    启用 IPv6 阻止
  </label>
</div>
```

**CSS 样式**:

```css
.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.checkbox {
  width: 18px;
  height: 18px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  cursor: pointer;
  appearance: none;
  transition: all var(--transition-fast) var(--ease-out);
}

.checkbox:checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
}

.checkbox:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.checkbox-label {
  font-size: var(--text-body);
  color: var(--text-primary);
  cursor: pointer;
}
```

---

### 1.5 Switch

**代码示例 (React TSX)**:

```tsx
<div className="switch-wrapper">
  <label htmlFor="dark-mode" className="switch-label">
    深色模式
  </label>
  <input
    type="checkbox"
    id="dark-mode"
    role="switch"
    className="switch"
  />
</div>
```

**CSS 样式**:

```css
.switch-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-4);
}

.switch-label {
  font-size: var(--text-body);
  color: var(--text-primary);
}

.switch {
  position: relative;
  width: 44px;
  height: 24px;
  background: var(--gray-300);
  border-radius: var(--radius-full);
  cursor: pointer;
  appearance: none;
  transition: background var(--transition-normal) var(--ease-out);
}

.switch::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform var(--transition-normal) var(--ease-out);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.switch:checked {
  background: var(--color-primary);
}

.switch:checked::before {
  transform: translateX(20px);
}

.switch:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

---

### 1.6 Badge

**变体 (Variants)**:

| 变体 | 说明 |
|------|------|
| `default` | 默认标签 |
| `primary` | 主要信息 |
| `success` | 成功状态 |
| `warning` | 警告状态 |
| `danger` | 错误状态 |

**代码示例 (React TSX)**:

```tsx
// Default Badge
<span className="badge badge-default">默认</span>

// Primary Badge
<span className="badge badge-primary">主要</span>

// Success Badge
<span className="badge badge-success">成功</span>

// Warning Badge
<span className="badge badge-warning">警告</span>

// Danger Badge
<span className="badge badge-danger">错误</span>
```

**CSS 样式**:

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: var(--text-caption);
  font-weight: 500;
  border-radius: var(--radius-full);
}

.badge-default {
  background: var(--gray-100);
  color: var(--text-secondary);
}

.badge-primary {
  background: rgba(0, 122, 255, 0.1);
  color: var(--color-primary);
}

.badge-success {
  background: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
}

.badge-warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
}

.badge-danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
}
```

---

### 1.7 Card

**代码示例 (React TSX)**:

```tsx
<div className="card">
  <div className="card-header">
    <h3 className="card-title">域名统计</h3>
  </div>
  <div className="card-content">
    <div className="stat-item">
      <strong>473</strong> 个域名
    </div>
    <div className="stat-item">
      <strong>452</strong> 黑名单
    </div>
    <div className="stat-item">
      <strong>21</strong> 白名单
    </div>
  </div>
  <div className="card-footer">
    <button className="btn btn-primary">生成规则</button>
  </div>
</div>
```

**CSS 样式**:

```css
.card {
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-normal) var(--ease-out);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.card-header {
  padding: var(--spacing-4) var(--spacing-4) 0;
}

.card-title {
  font-size: var(--text-h3);
  font-weight: 600;
  color: var(--text-primary);
}

.card-content {
  padding: var(--spacing-4);
}

.card-footer {
  padding: 0 var(--spacing-4) var(--spacing-4);
  display: flex;
  gap: var(--spacing-2);
}
```

---

## 2. 复合组件

### 2.1 Tabs

**代码示例 (React TSX)**:

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

**CSS 样式**:

```css
.tabs-list {
  display: flex;
  gap: var(--spacing-1);
  border-bottom: 1px solid var(--border-default);
}

.tabs-trigger {
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--text-body);
  font-weight: 500;
  color: var(--text-secondary);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
  margin-bottom: -1px;
}

.tabs-trigger:hover {
  color: var(--text-primary);
}

.tabs-trigger.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tabs-content {
  padding: var(--spacing-4) 0;
}
```

---

### 2.2 Dialog/Modal

**代码示例 (React TSX)**:

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
      确定要删除选中的域名吗？此操作不可撤销。
    </div>
    <div className="dialog-footer">
      <button className="btn btn-secondary">取消</button>
      <button className="btn btn-destructive">确认删除</button>
    </div>
  </div>
</dialog>
```

**CSS 样式**:

```css
.dialog {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);
  border: none;
  background: transparent;
}

.dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}

.dialog-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  animation: dialog-enter var(--transition-normal) var(--ease-out);
}

@keyframes dialog-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--border-default);
}

.dialog-title {
  font-size: var(--text-h3);
  font-weight: 600;
}

.dialog-close {
  padding: var(--spacing-2);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--text-secondary);
  transition: all var(--transition-fast) var(--ease-out);
}

.dialog-close:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.dialog-content {
  padding: var(--spacing-4);
  color: var(--text-secondary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-2);
  padding: var(--spacing-4);
  border-top: 1px solid var(--border-default);
}
```

---

### 2.3 Dropdown Menu

**代码示例 (React TSX)**:

```tsx
<div className="dropdown">
  <button className="dropdown-trigger" aria-expanded="false">
    <span>操作</span>
    <ChevronDownIcon className="icon-sm" />
  </button>
  <ul className="dropdown-menu" role="menu">
    <li className="dropdown-item" role="menuitem">
      <CopyIcon className="icon-sm" />
      复制规则
    </li>
    <li className="dropdown-item" role="menuitem">
      <DownloadIcon className="icon-sm" />
      下载文件
    </li>
    <li className="dropdown-divider" role="separator" />
    <li className="dropdown-item danger" role="menuitem">
      <TrashIcon className="icon-sm" />
      删除
    </li>
  </ul>
</div>
```

**CSS 样式**:

```css
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 180px;
  margin-top: var(--spacing-2);
  padding: var(--spacing-2);
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  list-style: none;
  animation: dropdown-enter var(--transition-fast) var(--ease-out);
}

@keyframes dropdown-enter {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--text-body);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast) var(--ease-out);
}

.dropdown-item:hover {
  background: var(--bg-secondary);
}

.dropdown-item.danger {
  color: var(--color-danger);
}

.dropdown-divider {
  height: 1px;
  margin: var(--spacing-2) 0;
  background: var(--border-default);
}
```

---

### 2.4 Toast

**代码示例 (React TSX)**:

```tsx
// Success Toast
<div className="toast toast-success">
  <CheckCircleIcon className="icon-sm" />
  <span>规则已成功生成！</span>
</div>

// Error Toast
<div className="toast toast-error">
  <XCircleIcon className="icon-sm" />
  <span>网络连接失败</span>
</div>

// Warning Toast
<div className="toast toast-warning">
  <AlertCircleIcon className="icon-sm" />
  <span>域名格式可能有误</span>
</div>
```

**CSS 样式**:

```css
.toast {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  animation: toast-enter var(--transition-normal) var(--ease-out);
}

@keyframes toast-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.toast-success {
  border-left: 3px solid var(--color-success);
}

.toast-success svg {
  color: var(--color-success);
}

.toast-error {
  border-left: 3px solid var(--color-danger);
}

.toast-error svg {
  color: var(--color-danger);
}

.toast-warning {
  border-left: 3px solid var(--color-warning);
}

.toast-warning svg {
  color: var(--color-warning);
}
```

---

### 2.5 Skeleton

**代码示例 (React TSX)**:

```tsx
<div className="skeleton-list">
  <div className="skeleton skeleton-title" />
  <div className="skeleton skeleton-line" />
  <div className="skeleton skeleton-line short" />
  <div className="skeleton skeleton-line" />
</div>
```

**CSS 样式**:

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--gray-100) 0%,
    var(--gray-200) 50%,
    var(--gray-100) 100%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-md);
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-title {
  width: 60%;
  height: 24px;
  margin-bottom: var(--spacing-4);
}

.skeleton-line {
  width: 100%;
  height: 16px;
  margin-bottom: var(--spacing-2);
}

.skeleton-line.short {
  width: 40%;
}
```

---

### 2.6 Tooltip

**代码示例 (React TSX)**:

```tsx
<div className="tooltip-wrapper">
  <button className="btn btn-icon" aria-describedby="tooltip-copy">
    <CopyIcon className="icon-md" />
  </button>
  <span id="tooltip-copy" className="tooltip" role="tooltip">
    复制到剪贴板
  </span>
</div>
```

**CSS 样式**:

```css
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: var(--spacing-2) var(--spacing-3);
  margin-bottom: var(--spacing-2);
  font-size: var(--text-small);
  color: white;
  background: var(--gray-800);
  border-radius: var(--radius-md);
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all var(--transition-fast) var(--ease-out);
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: var(--gray-800);
}

.tooltip-wrapper:hover .tooltip {
  opacity: 1;
  visibility: visible;
}
```

---

## 3. 业务组件

### 3.1 DomainList

**代码示例 (React TSX)**:

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
    <div className="domain-item">
      <span className="domain-name">ad.example.com</span>
      <span className="badge badge-default">黑名单</span>
    </div>
  </div>
</div>
```

---

### 3.2 RulePreview

**代码示例 (React TSX)**:

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
{`# Dnsmasq 规则
address=/ad.example.com/0.0.0.0
address=/ad2.example.com/0.0.0.0`}
    </code>
  </pre>
</div>
```

**CSS 样式**:

```css
.rule-preview {
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
}

.rule-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--border-default);
}

.rule-preview-title {
  font-size: var(--text-body);
  font-weight: 600;
}

.rule-preview-code {
  padding: var(--spacing-4);
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-small);
  line-height: 1.8;
  overflow-x: auto;
}

.rule-preview-code code {
  color: var(--text-primary);
}
```

---

### 3.3 ThemeToggle

**代码示例 (React TSX)**:

```tsx
<div className="theme-toggle">
  <button
    className="theme-toggle-item active"
    data-theme="light"
    aria-label="浅色模式"
  >
    <SunIcon className="icon-md" />
  </button>
  <button
    className="theme-toggle-item"
    data-theme="dark"
    aria-label="深色模式"
  >
    <MoonIcon className="icon-md" />
  </button>
  <button
    className="theme-toggle-item"
    data-theme="system"
    aria-label="跟随系统"
  >
    <MonitorIcon className="icon-md" />
  </button>
</div>
```

**CSS 样式**:

```css
.theme-toggle {
  display: inline-flex;
  padding: var(--spacing-1);
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
}

.theme-toggle-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
}

.theme-toggle-item:hover {
  color: var(--text-primary);
}

.theme-toggle-item.active {
  background: var(--bg-primary);
  color: var(--text-primary);
  box-shadow: var(--shadow-xs);
}
```

---

### 3.4 LanguageSelector

**代码示例 (React TSX)**:

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
    <li role="option">한국어</li>
  </ul>
</div>
```

---

### 3.5 StatsDisplay

**代码示例 (React TSX)**:

```tsx
<div className="stats-display">
  <div className="stat-card">
    <div className="stat-icon">
      <ShieldIcon className="icon-lg" />
    </div>
    <div className="stat-content">
      <span className="stat-value">473</span>
      <span className="stat-label">域名总数</span>
    </div>
  </div>
  <div className="stat-card">
    <div className="stat-icon success">
      <CheckCircleIcon className="icon-lg" />
    </div>
    <div className="stat-content">
      <span className="stat-value">452</span>
      <span className="stat-label">黑名单</span>
    </div>
  </div>
  <div className="stat-card">
    <div className="stat-icon warning">
      <AlertCircleIcon className="icon-lg" />
    </div>
    <div className="stat-content">
      <span className="stat-value">21</span>
      <span className="stat-label">白名单</span>
    </div>
  </div>
</div>
```

**CSS 样式**:

```css
.stats-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(0, 122, 255, 0.1);
  border-radius: var(--radius-lg);
  color: var(--color-primary);
}

.stat-icon.success {
  background: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
}

.stat-icon.warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: var(--text-h2);
  font-weight: 600;
  color: var(--text-primary);
}

.stat-label {
  font-size: var(--text-small);
  color: var(--text-secondary);
}
```

---

### 3.6 URLInputGroup

**代码示例 (React TSX)**:

```tsx
<div className="url-input-group">
  <div className="input-wrapper">
    <label htmlFor="rule-url" className="input-label">
      规则 URL
    </label>
    <div className="url-input-container">
      <input
        id="rule-url"
        type="url"
        placeholder="https://example.com/rules.txt"
        className="input url-input"
      />
      <button className="btn btn-primary url-fetch-btn">
        <DownloadIcon className="icon-sm" />
        获取
      </button>
    </div>
  </div>
  <div className="url-presets">
    <span className="url-preset-label">预设源：</span>
    <button className="url-preset-btn">EasyList</button>
    <button className="url-preset-btn">AdGuard DNS</button>
    <button className="url-preset-btn">Hosts 文件</button>
  </div>
</div>
```

**CSS 样式**:

```css
.url-input-container {
  display: flex;
  gap: var(--spacing-2);
}

.url-input {
  flex: 1;
}

.url-fetch-btn {
  flex-shrink: 0;
}

.url-presets {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-top: var(--spacing-3);
}

.url-preset-label {
  font-size: var(--text-small);
  color: var(--text-secondary);
}

.url-preset-btn {
  padding: var(--spacing-1) var(--spacing-3);
  font-size: var(--text-small);
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
}

.url-preset-btn:hover {
  color: var(--text-primary);
  border-color: var(--border-strong);
}
```

---

## 4. 组件使用规则

### 4.1 命名规范

```
组件类型        | 命名格式        | 示例
----------------|-----------------|------------------
React 组件      | PascalCase      | InputPanel.tsx
工具函数        | camelCase       | generateLineNumbers
CSS 类          | kebab-case      | btn-primary
CSS 变量        | kebab-case      | --color-primary
组件目录        | kebab-case      | /src/components/input-panel
```

### 4.2 文件结构

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

### 4.3 Props 规范

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

interface InputProps {
  type?: 'text' | 'password' | 'url' | 'email' | 'search';
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}
```

---

*DNS Shield 组件库 - 统一、一致、可复用*
