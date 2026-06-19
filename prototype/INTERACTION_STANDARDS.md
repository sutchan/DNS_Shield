# DNS Shield 交互标准规范

> 版本: v2.3.0 | 最后更新: 2024-06-19

---

## 目录

1. [模式库](#1-模式库)
2. [反馈系统](#2-反馈系统)
3. [空状态设计](#3-空状态设计)
4. [页面过渡](#4-页面过渡)

---

## 1. 模式库

### 1.1 点击交互

| 操作 | 反馈 | 时长 |
|------|------|------|
| 按钮点击 | 缩放至 0.98 + 颜色变化 | 100ms |
| 链接点击 | 颜色加深 | 150ms |
| 图标点击 | 背景色变化 | 100ms |

**按钮点击涟漪效果**:

```css
/* 涟漪效果 */
.btn-ripple {
  position: relative;
  overflow: hidden;
}

.btn-ripple::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at var(--ripple-x, 50%) var(--ripple-y, 50%),
    rgba(255, 255, 255, 0.3) 0%,
    transparent 70%
  );
  opacity: 0;
  transform: scale(0);
  transition: transform 0.5s ease-out, opacity 0.3s ease-out;
}

.btn-ripple:active::after {
  opacity: 1;
  transform: scale(2);
  transition: transform 0s, opacity 0s;
}
```

**图标按钮缩放**:

```css
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
}

.icon-btn:hover {
  background: var(--bg-secondary);
  transform: scale(1.05);
}

.icon-btn:active {
  transform: scale(0.95);
}
```

### 1.2 悬停交互

| 元素类型 | 悬停效果 | 时长 |
|---------|---------|------|
| 按钮 | 背景加深 | 200ms |
| 卡片 | 上浮 2px + 阴影增强 | 200ms |
| 链接 | 下划线显示 | 150ms |
| 表格行 | 背景色变化 | 100ms |

**Hover Lift 效果**:

```css
.hover-lift {
  transition: transform var(--transition-normal) var(--ease-out),
              box-shadow var(--transition-normal) var(--ease-out);
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

**颜色变化**:

```css
/* 悬停时颜色加深 */
.color-shift {
  transition: color var(--transition-fast) var(--ease-out),
              background-color var(--transition-fast) var(--ease-out);
}

.color-shift:hover {
  background-color: var(--gray-100);
}
```

### 1.3 聚焦交互

**Focus Ring**:

```css
.focus-ring:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* 自定义 focus ring */
.focus-ring-custom:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.3);
}
```

### 1.4 拖拽交互

| 状态 | 样式 |
|------|------|
| Default | `cursor: grab` |
| Dragging | `cursor: grabbing`, `transform: scale(1.02)`, 阴影增强 |
| Drag Over | 虚线边框, 背景色变化 |

**拖拽样式**:

```css
.draggable {
  cursor: grab;
  transition: transform var(--transition-normal) var(--ease-out),
              box-shadow var(--transition-normal) var(--ease-out);
}

.draggable:active {
  cursor: grabbing;
}

.dragging {
  transform: scale(1.02);
  box-shadow: var(--shadow-lg);
  opacity: 0.9;
}

.drag-over {
  background: var(--bg-secondary);
  border: 2px dashed var(--color-primary);
}
```

### 1.5 键盘交互

| 按键 | 操作 | 反馈 |
|------|------|------|
| Tab | 切换焦点 | Focus ring 显示 |
| Enter | 激活按钮/链接 | 点击效果 |
| Escape | 关闭弹窗/菜单 | 淡出消失 |

**键盘导航样式**:

```css
/* 可见焦点 */
:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* 跳跃导航 */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  padding: var(--spacing-2) var(--spacing-4);
  background: var(--color-primary);
  color: white;
  z-index: 100;
  transition: top var(--transition-fast);
}

.skip-link:focus {
  top: 0;
}
```

---

## 2. 反馈系统

### 2.1 加载状态

| 类型 | 实现 | 使用场景 |
|------|------|---------|
| Skeleton | 骨架屏组件 | 数据列表加载 |
| Spinner | 旋转图标 | 按钮内加载 |
| Progress | 进度条 | 文件上传、长时间操作 |
| Inline | "加载中..." 文字 | 操作反馈 |

**Skeleton 示例**:

```tsx
<div className="domain-list">
  <div className="skeleton skeleton-title" />
  <div className="skeleton skeleton-line" />
  <div className="skeleton skeleton-line short" />
  <div className="skeleton skeleton-line" />
</div>
```

**按钮加载状态**:

```tsx
<button className="btn btn-primary" disabled>
  <Loader2 className="icon-sm animate-spin" />
  生成中...
</button>
```

**CSS**:

```css
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### 2.2 成功反馈

| 类型 | 实现 | 时长 |
|------|------|------|
| Toast | 绿色提示消息 | 3秒后自动消失 |
| Inline | 绿色对勾 + 文字 | 即时 |
| Color | 绿色边框/背景 | 即时 |

**成功 Toast 示例**:

```tsx
<div className="toast toast-success">
  <CheckCircleIcon className="icon-sm" />
  <span>规则已成功生成！</span>
</div>
```

**内联成功反馈**:

```tsx
<div className="success-message">
  <CheckCircleIcon className="icon-success" />
  <span>域名已添加</span>
</div>
```

**CSS**:

```css
.toast-success {
  border-left: 3px solid var(--color-success);
}

.toast-success svg {
  color: var(--color-success);
}

.success-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  color: var(--color-success);
}

.icon-success {
  color: var(--color-success);
}
```

### 2.3 错误反馈

| 类型 | 实现 | 示例 |
|------|------|------|
| Toast | 红色错误提示 | 网络错误 |
| Inline | 红色边框 + 错误文字 | 表单验证 |
| Dialog | 警告对话框 | 危险操作确认 |

**错误 Toast 示例**:

```tsx
<div className="toast toast-error">
  <XCircleIcon className="icon-sm" />
  <span>网络连接失败，请重试</span>
</div>
```

**表单错误示例**:

```tsx
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

**CSS**:

```css
.toast-error {
  border-left: 3px solid var(--color-danger);
}

.toast-error svg {
  color: var(--color-danger);
}

.input.error {
  border-color: var(--color-danger);
}

.form-error {
  font-size: var(--text-small);
  color: var(--color-danger);
}
```

### 2.4 确认反馈

**危险操作确认对话框**:

```tsx
<dialog className="dialog" open>
  <div className="dialog-backdrop" />
  <div className="dialog-container">
    <div className="dialog-header">
      <h2 className="dialog-title">确认删除</h2>
    </div>
    <div className="dialog-content">
      此操作不可撤销。确定要删除选中的域名吗？
    </div>
    <div className="dialog-footer">
      <button className="btn btn-secondary">取消</button>
      <button className="btn btn-destructive">确认删除</button>
    </div>
  </div>
</dialog>
```

---

## 3. 空状态设计

### 3.1 空状态类型

| 类型 | 场景 | 设计建议 |
|------|------|---------|
| 初始空状态 | 首次使用 | 引导性插图 + 操作提示 |
| 筛选空状态 | 无匹配结果 | 筛选条件 + 清除建议 |
| 错误空状态 | 数据加载失败 | 错误说明 + 重试按钮 |
| 权限空状态 | 无访问权限 | 权限说明 + 申请入口 |

### 3.2 初始空状态

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

**CSS**:

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

.empty-state-icon .icon-2xl {
  width: 64px;
  height: 64px;
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

### 3.3 筛选空状态

```tsx
<div className="empty-state">
  <div className="empty-state-icon">
    <SearchIcon className="icon-2xl text-muted" />
  </div>
  <h3 className="empty-state-title">未找到匹配结果</h3>
  <p className="empty-state-description">
    没有域名符合当前的筛选条件
  </p>
  <div className="empty-state-actions">
    <button className="btn btn-outline">
      清除筛选
    </button>
  </div>
</div>
```

### 3.4 错误空状态

```tsx
<div className="empty-state">
  <div className="empty-state-icon error">
    <AlertCircleIcon className="icon-2xl" />
  </div>
  <h3 className="empty-state-title">加载失败</h3>
  <p className="empty-state-description">
    无法加载域名列表，请检查网络连接后重试
  </p>
  <div className="empty-state-actions">
    <button className="btn btn-primary">
      <RefreshCwIcon className="icon-sm" />
      重试
    </button>
  </div>
</div>
```

**CSS**:

```css
.empty-state-icon.error {
  color: var(--color-danger);
}
```

---

## 4. 页面过渡

### 4.1 淡入淡出

**CSS**:

```css
/* 淡入 */
.fade-in {
  animation: fadeIn var(--transition-normal) var(--ease-out);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 淡出 */
.fade-out {
  animation: fadeOut var(--transition-fast) var(--ease-out);
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

### 4.2 滑入滑出

**CSS**:

```css
/* 向上滑入 */
.slide-up {
  animation: slideUp var(--transition-normal) var(--ease-out);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 向下滑出 */
.slide-down {
  animation: slideDown var(--transition-normal) var(--ease-out);
}

@keyframes slideDown {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
}

/* 向右滑入 */
.slide-right {
  animation: slideRight var(--transition-normal) var(--ease-out);
}

@keyframes slideRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### 4.3 页面过渡

**CSS**:

```css
/* 页面进入 */
.page-enter {
  opacity: 0;
  transform: translateY(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity var(--transition-slow) var(--ease-out),
              transform var(--transition-slow) var(--ease-out);
}

/* 子元素依次进入 */
.page-content:nth-child(1) { animation-delay: 0ms; }
.page-content:nth-child(2) { animation-delay: 100ms; }
.page-content:nth-child(3) { animation-delay: 200ms; }
```

### 4.4 面板展开

**CSS**:

```css
.panel-expand {
  animation: panelExpand var(--transition-normal) var(--ease-out);
}

@keyframes panelExpand {
  from {
    opacity: 0;
    transform: scaleY(0.95);
    transform-origin: top;
  }
  to {
    opacity: 1;
    transform: scaleY(1);
  }
}
```

### 4.5 减少动画偏好

**重要**: 必须尊重用户的 `prefers-reduced-motion` 设置。

```css
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

**React 示例**:

```tsx
import { useReducedMotion } from 'hooks/useReducedMotion';

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <div className={shouldReduceMotion ? '' : 'fade-in'}>
      内容
    </div>
  );
}

// 或使用 CSS 媒体查询
// 见上面的 @media (prefers-reduced-motion: reduce)
```

---

## 附录: 交互状态速查表

| 交互类型 | 反馈 | 时长 |
|---------|------|------|
| 点击 | 缩放 0.98 | 100ms |
| 悬停 | 上浮 2px | 200ms |
| 聚焦 | 2px 轮廓线 | - |
| 拖拽 | scale 1.02 | 200ms |
| 加载 | Spinner 显示 | - |
| 成功 | Toast 3s | 300ms |
| 错误 | Toast 显示 | 300ms |
| 页面进入 | 淡入+上滑 | 300ms |
| 页面退出 | 淡出 | 200ms |

---

*DNS Shield 交互标准 - 流畅、一致、可预期*
