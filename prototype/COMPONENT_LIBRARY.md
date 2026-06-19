# DNS Shield 组件库规范

> 版本: v2.3.0 | 最后更新: 2024-06-19 | 状态: 已发布

---

## 目录

1. [设计原则](#1-设计原则)
2. [基础组件](#2-基础组件)
   - [2.1 Button](#21-button)
   - [2.2 Input](#22-input)
   - [2.3 Textarea](#23-textarea)
   - [2.4 Select](#24-select)
   - [2.5 Checkbox](#25-checkbox)
   - [2.6 Switch](#26-switch)
   - [2.7 Badge](#27-badge)
   - [2.8 Card](#28-card)
   - [2.9 Tabs](#29-tabs)
3. [复合组件](#3-复合组件)
   - [3.1 Toast](#31-toast)
   - [3.2 Dropdown Menu](#32-dropdown-menu)
   - [3.3 Accordion](#33-accordion)
   - [3.4 Stats Bar](#34-stats-bar)
   - [3.5 Code Preview](#35-code-preview)
   - [3.6 Tooltip](#36-tooltip)
4. [业务组件](#4-业务组件)
   - [4.1 Domain Editor](#41-domain-editor)
   - [4.2 Preset Tags](#42-preset-tags)
   - [4.3 Format Tabs](#43-format-tabs)
   - [4.4 Theme Toggle](#44-theme-toggle)
5. [组件使用规则](#5-组件使用规则)
   - [5.1 按钮使用规则](#51-按钮使用规则)
   - [5.2 颜色使用规则](#52-颜色使用规则)
   - [5.3 响应式规则](#53-响应式规则)
   - [5.4 可访问性检查清单](#54-可访问性检查清单)
6. [附录 A: CSS 变量汇总](#6-附录-a-css-变量汇总)

---

## 1. 设计原则

### 1.1 四大核心原则

| 原则 | 说明 | 实施方式 |
|------|------|---------|
| **一致性 Consistency** | 全产品视觉与交互保持统一 | 使用统一的 CSS 变量与组件变体系统 |
| **可访问性 Accessibility** | 人人可用，不分能力 | WCAG 2.1 AA 标准，44×44px 触控目标 |
| **语义化 Semantic** | HTML 即文档结构而非视觉表达 | 使用正确的语义标签（button/nav/section），ARIA 属性完整 |
| **性能 Performance** | 轻量、快速、可预测 | CSS 优先，避免不必要的 JS，动画使用 transform/opacity |

### 1.2 设计哲学

> "Simple is not the absence of complexity, but the ability to simplify."

所有组件遵循 **Less is More** 原则：充足留白、清晰层次、微妙动效。

---

## 2. 基础组件

---

### 2.1 Button

**说明：** 用于触发操作的主要交互组件。

#### 变体 (Variants)

| 变体 | 说明 | 使用场景 |
|------|------|---------|
| `primary` | 主色实心按钮 | 主要操作（生成、保存、确认） |
| `secondary` | 次级实心按钮 | 次重要操作（次要确认） |
| `outline` | 描边按钮 | 中性操作（取消、返回） |
| `ghost` | 幽灵按钮（透明底） | 工具栏操作、辅助功能 |
| `destructive` | 危险色实心按钮 | 删除、重置等破坏性操作 |

#### 尺寸 (Sizes)

| 尺寸 | 高度 | 内边距 | 使用场景 |
|------|------|--------|---------|
| `sm` | 32px | 8px 12px | 紧凑布局、行内操作 |
| `default` | 40px | 12px 16px | 标准操作 |
| `lg` | 48px | 16px 24px | Hero 区主操作、强调 |
| `icon` | 40×40px | 8px | 纯图标按钮 |

#### 状态 (States)

| 状态 | 视觉表现 |
|------|---------|
| Default | 主色背景 `#007AFF`，白色文字 |
| Hover | 背景色加深 10% → `#0056CC` |
| Active | `transform: scale(0.98)`，轻微收缩 |
| Focus | `outline: 2px solid #007AFF; outline-offset: 2px;` |
| Disabled | `opacity: 0.5; cursor: not-allowed;` |
| Loading | 显示 spinner，文字颜色透明 |

#### React TSX 示例

```tsx
import { Loader2 } from 'lucide-react';

// Primary Button
<button className="btn btn-primary">
  生成规则
</button>

// Secondary Button
<button className="btn btn-secondary">
  次要操作
</button>

// Outline Button
<button className="btn btn-outline">
  取消
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

// Icon Button
<button className="btn btn-icon" aria-label="复制">
  <Copy className="icon-sm" />
</button>
```

#### CSS 样式

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  font-family: var(--font-sans);
  font-size: var(--text-body);
  font-weight: 500;
  line-height: 1;
  padding: 12px 16px;
  height: 40px;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  transition: all var(--transition-normal) var(--ease-out);
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
}

.btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Variants */
.btn-primary {
  background: var(--color-primary);
  color: #FFFFFF;
  border-color: var(--color-primary);
}
.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}
.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--border-default);
}
.btn-secondary:hover:not(:disabled) {
  background: var(--gray-200);
}
.btn-secondary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-outline {
  background: transparent;
  color: var(--text-primary);
  border-color: var(--border-strong);
}
.btn-outline:hover:not(:disabled) {
  background: var(--bg-secondary);
  border-color: var(--gray-400);
}
.btn-outline:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border-color: transparent;
}
.btn-ghost:hover:not(:disabled) {
  background: var(--bg-secondary);
  color: var(--text-primary);
}
.btn-ghost:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-destructive {
  background: var(--color-danger);
  color: #FFFFFF;
  border-color: var(--color-danger);
}
.btn-destructive:hover:not(:disabled) {
  background: #DC2626;
  border-color: #DC2626;
}
.btn-destructive:active:not(:disabled) {
  transform: scale(0.98);
}

/* Sizes */
.btn-sm {
  height: 32px;
  padding: 8px 12px;
  font-size: var(--text-small);
}

.btn-lg {
  height: 48px;
  padding: 16px 24px;
  font-size: 1rem;
}

.btn-icon {
  width: 40px;
  height: 40px;
  padding: 0;
}

/* Loading animation helper */
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

### 2.2 Input

**说明：** 单行文本输入组件，用于收集用户输入。

#### 变体 (Variants)

| 变体 | 说明 |
|------|------|
| default | 默认文本输入 |
| with-icon | 带左侧图标 |

#### 状态 (States)

| 状态 | 视觉表现 |
|------|---------|
| Default | 灰色边框 `#E4E4E7` |
| Hover | 边框加深至 `#D4D4D8` |
| Focus | 蓝色边框 `#007AFF` + 蓝色阴影 |
| Disabled | 半透明背景，不可交互 |
| Error | 红色边框 `#EF4444` + 错误提示 |
| Success | 绿色边框 `#22C55E` |

#### React TSX 示例

```tsx
// Default Input
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

// With Icon Input
<div className="input-wrapper">
  <label htmlFor="search" className="input-label">
    搜索
  </label>
  <div className="input-with-icon">
    <Search className="input-icon" />
    <input
      id="search"
      type="search"
      placeholder="输入搜索关键词..."
      className="input"
    />
  </div>
</div>

// Error State
<div className="input-wrapper">
  <label htmlFor="url" className="input-label">
    规则 URL
  </label>
  <input
    id="url"
    type="url"
    className="input is-invalid"
    aria-invalid="true"
    value="invalid-url"
  />
  <p className="input-error">请输入有效的 URL 地址</p>
</div>

// Disabled State
<div className="input-wrapper">
  <label htmlFor="disabled" className="input-label">
    禁用字段
  </label>
  <input
    id="disabled"
    type="text"
    className="input"
    disabled
    value="不可编辑"
  />
</div>
```

#### CSS 样式

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
  line-height: 1;
}

.input {
  width: 100%;
  height: 40px;
  padding: 0 var(--spacing-3);
  font-family: var(--font-sans);
  font-size: var(--text-body);
  color: var(--text-primary);
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast) var(--ease-out);
  box-sizing: border-box;
}

.input::placeholder {
  color: var(--text-tertiary);
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
  color: var(--text-tertiary);
  cursor: not-allowed;
}

/* Icon input */
.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon .input {
  padding-left: 40px;
}

.input-icon {
  position: absolute;
  left: var(--spacing-3);
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
  pointer-events: none;
}

/* Error state */
.input.is-invalid {
  border-color: var(--color-danger);
}
.input.is-invalid:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-error {
  font-size: var(--text-small);
  color: var(--color-danger);
  line-height: 1.4;
}
```

---

### 2.3 Textarea

**说明：** 多行文本输入组件，用于大段文本内容输入。

#### 特性

- 支持显示行号
- 支持自动调整高度（auto-resize）
- 使用等宽字体适合代码类内容

#### 状态 (States)

| 状态 | 视觉表现 |
|------|---------|
| Default | 灰色边框 `#E4E4E7` |
| Hover | 边框加深 |
| Focus | 蓝色边框 + 蓝色阴影 |
| Error | 红色边框 + 错误提示 |

#### React TSX 示例

```tsx
// Default Textarea
<div className="input-wrapper">
  <label htmlFor="domains" className="input-label">
    域名列表（每行一个）
  </label>
  <textarea
    id="domains"
    className="textarea"
    rows={8}
    placeholder="ad.example.com&#10;tracker.example.org&#10;analytics.example.net"
  />
</div>

// Textarea with Line Numbers
<div className="textarea-wrapper">
  <div className="textarea-line-numbers" aria-hidden="true">
    <span>1</span>
    <span>2</span>
    <span>3</span>
    <span>4</span>
    <span>5</span>
  </div>
  <textarea
    className="textarea textarea-with-linenum"
    rows={5}
    value={`ad.example.com
tracker.example.org
analytics.example.net
banner.example.io
ads.example.tv`}
  />
</div>

// Error State
<div className="input-wrapper">
  <label htmlFor="content" className="input-label">
    内容
  </label>
  <textarea
    id="content"
    className="textarea is-invalid"
    rows={4}
    aria-invalid="true"
  />
  <p className="input-error">内容不能为空</p>
</div>
```

#### CSS 样式

```css
.textarea {
  width: 100%;
  min-height: 120px;
  padding: var(--spacing-3);
  font-family: var(--font-sans);
  font-size: var(--text-body);
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  resize: vertical;
  transition: all var(--transition-fast) var(--ease-out);
  box-sizing: border-box;
}

.textarea::placeholder {
  color: var(--text-tertiary);
}

.textarea:hover:not(:disabled) {
  border-color: var(--border-strong);
}

.textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.textarea.is-invalid {
  border-color: var(--color-danger);
}

/* Line Numbers Container */
.textarea-wrapper {
  position: relative;
  display: flex;
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.textarea-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.textarea-line-numbers {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: var(--spacing-3) var(--spacing-2);
  font-family: var(--font-mono);
  font-size: var(--text-body);
  line-height: 1.6;
  color: var(--text-tertiary);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-default);
  user-select: none;
  min-width: 32px;
}

.textarea-line-numbers span {
  height: 1.6em;
  line-height: 1.6;
}

.textarea-with-linenum {
  border: none;
  border-radius: 0;
  min-height: auto;
  flex: 1;
  font-family: var(--font-mono);
  background: transparent;
}

.textarea-with-linenum:focus {
  box-shadow: none;
}
```

---

### 2.4 Select

**说明：** 下拉选择组件，原生 select + 自定义样式。

#### 变体 (Variants)

| 变体 | 说明 |
|------|------|
| default | 默认下拉选择 |
| small | 紧凑下拉 |

#### React TSX 示例

```tsx
// Default Select
<div className="select-wrapper">
  <label htmlFor="format" className="select-label">
    输出格式
  </label>
  <select id="format" className="select">
    <option value="dnsmasq">Dnsmasq</option>
    <option value="hosts">Hosts 文件</option>
    <option value="adguard">AdGuard Home</option>
  </select>
</div>

// Small Select
<select className="select select-sm">
  <option>全部</option>
  <option>黑名单</option>
  <option>白名单</option>
</select>
```

#### CSS 样式

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
  line-height: 1;
}

.select {
  position: relative;
  width: 100%;
  height: 40px;
  padding: 0 var(--spacing-8) 0 var(--spacing-3);
  font-family: var(--font-sans);
  font-size: var(--text-body);
  color: var(--text-primary);
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  transition: all var(--transition-fast) var(--ease-out);
  box-sizing: border-box;
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

.select:disabled {
  background: var(--bg-secondary);
  color: var(--text-tertiary);
  cursor: not-allowed;
}

.select-sm {
  height: 32px;
  padding: 0 28px 0 var(--spacing-2);
  font-size: var(--text-small);
}
```

---

### 2.5 Checkbox

**说明：** 方形复选框，用于二元选择。

#### 状态 (States)

| 状态 | 视觉表现 |
|------|---------|
| Unchecked | 灰色边框 18×18px |
| Checked | 蓝色背景 `#007AFF` + 白色对勾 |
| Disabled | 半透明 + 不可交互 |
| Focus | 2px 主色轮廓线 |

#### React TSX 示例

```tsx
// Single Checkbox
<label className="checkbox-wrapper">
  <input type="checkbox" className="checkbox" />
  <span className="checkbox-label">启用 IPv6 阻止</span>
</label>

// Checkbox Group
<div className="checkbox-group">
  <label className="checkbox-wrapper">
    <input type="checkbox" className="checkbox" defaultChecked />
    <span className="checkbox-label">广告域名</span>
  </label>
  <label className="checkbox-wrapper">
    <input type="checkbox" className="checkbox" defaultChecked />
    <span className="checkbox-label">追踪域名</span>
  </label>
  <label className="checkbox-wrapper">
    <input type="checkbox" className="checkbox" />
    <span className="checkbox-label">恶意软件域名</span>
  </label>
</div>

// Disabled Checkbox
<label className="checkbox-wrapper">
  <input type="checkbox" className="checkbox" disabled defaultChecked />
  <span className="checkbox-label" style={{ opacity: 0.5 }}>
    基础保护（已启用）
  </span>
</label>
```

#### CSS 样式

```css
.checkbox-wrapper {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-3);
  cursor: pointer;
  user-select: none;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.checkbox {
  position: relative;
  width: 18px;
  height: 18px;
  margin: 0;
  border: 1.5px solid var(--border-strong);
  border-radius: var(--radius-sm);
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  transition: all var(--transition-fast) var(--ease-out);
  flex-shrink: 0;
}

.checkbox:hover:not(:disabled) {
  border-color: var(--gray-400);
}

.checkbox:checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
}

.checkbox:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.checkbox:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.checkbox-label {
  font-size: var(--text-body);
  color: var(--text-primary);
  line-height: 1.4;
}

.checkbox-wrapper:has(.checkbox:disabled) {
  cursor: not-allowed;
}
```

---

### 2.6 Switch

**说明：** iOS 风格开关，用于启用/禁用功能的二元切换。

**重要：** Switch 应仅用于立即生效的设置切换，不应用于提交操作。

#### 状态 (States)

| 状态 | 视觉表现 |
|------|---------|
| Off | 灰色背景 `#D4D4D8`，白色滑块 |
| On | 蓝色背景 `#007AFF`，白色滑块滑到右侧 |
| Disabled | opacity 0.5，不可交互 |

#### 动画规范

- 滑块滑动时间：**200ms**
- 缓动曲线：`cubic-bezier(0.16, 1, 0.3, 1)`
- 背景色过渡：200ms，相同缓动

#### React TSX 示例

```tsx
// Simple Switch
<label className="switch-wrapper">
  <span className="switch-label">深色模式</span>
  <input type="checkbox" role="switch" className="switch" />
</label>

// Switch Group in Settings Panel
<div className="switch-panel">
  <label className="switch-wrapper">
    <div>
      <span className="switch-label">启用广告阻止</span>
      <p className="switch-description">屏蔽已知广告域名</p>
    </div>
    <input type="checkbox" role="switch" className="switch" defaultChecked />
  </label>

  <label className="switch-wrapper">
    <div>
      <span className="switch-label">启用追踪阻止</span>
      <p className="switch-description">保护您的隐私</p>
    </div>
    <input type="checkbox" role="switch" className="switch" defaultChecked />
  </label>

  <label className="switch-wrapper">
    <div>
      <span className="switch-label">自动更新规则</span>
      <p className="switch-description">每日自动同步最新规则</p>
    </div>
    <input type="checkbox" role="switch" className="switch" />
  </label>
</div>
```

#### CSS 样式

```css
.switch-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-4);
  padding: var(--spacing-3) 0;
  cursor: pointer;
  user-select: none;
}

.switch-label {
  font-size: var(--text-body);
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
}

.switch-description {
  font-size: var(--text-small);
  color: var(--text-secondary);
  margin: 2px 0 0 0;
  line-height: 1.4;
}

.switch {
  position: relative;
  width: 44px;
  height: 24px;
  margin: 0;
  background: var(--gray-300);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  transition: background 200ms cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
}

.switch::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: #FFFFFF;
  border-radius: 50%;
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
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

.switch:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.switch-panel {
  display: flex;
  flex-direction: column;
}

.switch-panel .switch-wrapper {
  border-bottom: 1px solid var(--border-default);
}

.switch-panel .switch-wrapper:last-child {
  border-bottom: none;
}
```

---

### 2.7 Badge

**说明：** Pill 样式标签，用于状态标识和分类。

#### 变体 (Variants)

| 变体 | 背景色 | 文字色 | 使用场景 |
|------|--------|--------|---------|
| `default` | `#F4F4F5` | `#71717A` | 默认状态、普通标签 |
| `success` | `rgba(34, 197, 94, 0.1)` | `#22C55E` | 成功、完成、有效 |
| `warning` | `rgba(245, 158, 11, 0.1)` | `#F59E0B` | 警告、待处理 |
| `danger` | `rgba(239, 68, 68, 0.1)` | `#EF4444` | 错误、危险、被阻 |

#### React TSX 示例

```tsx
<span className="badge badge-default">默认</span>
<span className="badge badge-success">已启用</span>
<span className="badge badge-warning">待更新</span>
<span className="badge badge-danger">错误</span>

// Inline usage in a list item
<div className="list-item">
  <span>ad.example.com</span>
  <span className="badge badge-danger">已拦截</span>
</div>
```

#### CSS 样式

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  font-family: var(--font-sans);
  font-size: var(--text-caption);
  font-weight: 500;
  line-height: 1.6;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.badge-default {
  background: var(--gray-100);
  color: var(--text-secondary);
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

### 2.8 Card

**说明：** 通用容器组件，用于组织内容块。

#### 变体 (Variants)

| 变体 | 说明 |
|------|------|
| default | 白色背景，1px 边框 |
| elevated | 带阴影的浮层卡片 |

#### 结构

```
.card
├── .card-header (可选)
│   └── .card-title
├── .card-content
└── .card-footer (可选)
```

#### React TSX 示例

```tsx
// Basic Card
<div className="card">
  <div className="card-header">
    <h3 className="card-title">域名统计</h3>
  </div>
  <div className="card-content">
    <p>当前已配置 473 个域名</p>
  </div>
  <div className="card-footer">
    <button className="btn btn-primary">查看详情</button>
  </div>
</div>

// Elevated Card (Modal/Popup)
<div className="card card-elevated" style={{ width: '320px' }}>
  <div className="card-content">
    <h3 className="card-title" style={{ marginBottom: '8px' }}>
      规则已生成
    </h3>
    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
      共处理 473 个域名，生成 Dnsmasq 规则。
    </p>
  </div>
  <div className="card-footer" style={{ justifyContent: 'flex-end' }}>
    <button className="btn btn-ghost">关闭</button>
    <button className="btn btn-primary">复制</button>
  </div>
</div>
```

#### CSS 样式

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

.card-elevated {
  border: none;
  box-shadow: var(--shadow-md);
}

.card-header {
  padding: var(--spacing-4) var(--spacing-4) var(--spacing-2);
}

.card-title {
  font-size: var(--text-h3);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
  margin: 0;
  letter-spacing: -0.02em;
}

.card-content {
  padding: var(--spacing-4);
  font-size: var(--text-body);
  color: var(--text-primary);
  line-height: 1.6;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4) var(--spacing-4);
}
```

---

### 2.9 Tabs

**说明：** 标签页切换组件，用于在多个视图之间切换。

#### 结构

```
.tabs
├── .tabs-list (role="tablist")
│   ├── .tabs-trigger (role="tab", aria-selected)
│   ├── .tabs-trigger.active
│   └── ...
└── .tabs-content (role="tabpanel")
```

#### React TSX 示例

```tsx
<div className="tabs">
  <div className="tabs-list" role="tablist">
    <button
      role="tab"
      aria-selected="true"
      aria-controls="tab-dnsmasq"
      id="tab-trigger-dnsmasq"
      className="tabs-trigger active"
    >
      Dnsmasq
    </button>
    <button
      role="tab"
      aria-selected="false"
      aria-controls="tab-hosts"
      id="tab-trigger-hosts"
      className="tabs-trigger"
    >
      Hosts
    </button>
    <button
      role="tab"
      aria-selected="false"
      aria-controls="tab-adguard"
      id="tab-trigger-adguard"
      className="tabs-trigger"
    >
      AdGuard
    </button>
  </div>

  <div
    className="tabs-content"
    role="tabpanel"
    id="tab-dnsmasq"
    aria-labelledby="tab-trigger-dnsmasq"
  >
    <pre className="code-block">
      <code>{`address=/ad.example.com/0.0.0.0
address=/tracker.example.com/0.0.0.0`}</code>
    </pre>
  </div>
</div>
```

#### CSS 样式

```css
.tabs {
  width: 100%;
}

.tabs-list {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  border-bottom: 1px solid var(--border-default);
  padding: 0 var(--spacing-1);
}

.tabs-trigger {
  position: relative;
  padding: var(--spacing-3) var(--spacing-4);
  font-family: var(--font-sans);
  font-size: var(--text-body);
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
  margin-bottom: -1px;
  line-height: 1;
}

.tabs-trigger:hover {
  color: var(--text-primary);
}

.tabs-trigger.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tabs-trigger:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

.tabs-content {
  padding: var(--spacing-4) 0;
}

/* Code block helper for tabs content */
.code-block {
  margin: 0;
  padding: var(--spacing-4);
  font-family: var(--font-mono);
  font-size: var(--text-small);
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  overflow-x: auto;
}
```

---

## 3. 复合组件

---

### 3.1 Toast

**说明：** 右下角弹出通知，用于非阻塞的系统反馈。3 种类型，自动消失（默认 3 秒）。

#### 变体 (Variants)

| 变体 | 主题色 | 使用场景 |
|------|--------|---------|
| `success` | `#22C55E` | 操作成功、规则生成完成 |
| `info` | `#007AFF` | 信息提示、通知 |
| `error` | `#EF4444` | 操作失败、错误提示 |

#### 动画规范

- 入场：`translateX(100%)` → `translateX(0)`，**300ms ease-out**
- 出场：`opacity: 1` → `opacity: 0`，**300ms**
- 多条 Toast 垂直堆叠，间距 8px

#### React TSX 示例

```tsx
// Toast Container (positioned at bottom-right)
<div className="toast-container" role="region" aria-live="polite">

  {/* Success Toast */}
  <div className="toast toast-success" role="status">
    <CheckCircle2 className="toast-icon" />
    <div className="toast-content">
      <p className="toast-title">规则已生成</p>
      <p className="toast-message">共处理 473 个域名</p>
    </div>
    <button className="toast-close" aria-label="关闭通知">
      <X className="icon-sm" />
    </button>
  </div>

  {/* Info Toast */}
  <div className="toast toast-info" role="status">
    <Info className="toast-icon" />
    <div className="toast-content">
      <p className="toast-title">正在更新规则</p>
      <p className="toast-message">自动同步中...</p>
    </div>
    <button className="toast-close" aria-label="关闭通知">
      <X className="icon-sm" />
    </button>
  </div>

  {/* Error Toast */}
  <div className="toast toast-error" role="alert">
    <AlertCircle className="toast-icon" />
    <div className="toast-content">
      <p className="toast-title">网络连接失败</p>
      <p className="toast-message">无法获取规则，请检查网络</p>
    </div>
    <button className="toast-close" aria-label="关闭通知">
      <X className="icon-sm" />
    </button>
  </div>

</div>
```

#### CSS 样式

```css
.toast-container {
  position: fixed;
  bottom: var(--spacing-4);
  right: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  z-index: 9999;
  max-width: 360px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border-left: 3px solid transparent;
  pointer-events: auto;
  animation: toast-enter 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes toast-enter {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes toast-exit {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(20px);
  }
}

.toast.toast-exit {
  animation: toast-exit 300ms ease forwards;
}

.toast-success {
  border-left-color: var(--color-success);
}
.toast-success .toast-icon {
  color: var(--color-success);
}

.toast-info {
  border-left-color: var(--color-primary);
}
.toast-info .toast-icon {
  color: var(--color-primary);
}

.toast-error {
  border-left-color: var(--color-danger);
}
.toast-error .toast-icon {
  color: var(--color-danger);
}

.toast-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: var(--text-body);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 2px 0;
  line-height: 1.4;
}

.toast-message {
  font-size: var(--text-small);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.toast-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-tertiary);
  flex-shrink: 0;
  transition: all var(--transition-fast) var(--ease-out);
}

.toast-close:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.toast-close:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

---

### 3.2 Dropdown Menu

**说明：** 下拉菜单，用于展示更多操作选项，支持子菜单与分隔线。

#### 结构

```
.dropdown
├── .dropdown-trigger (按钮)
└── .dropdown-menu (role="menu")
    ├── .dropdown-item (role="menuitem")
    ├── .dropdown-divider
    └── .dropdown-item.danger
```

#### React TSX 示例

```tsx
// Language Selector Dropdown
<div className="dropdown">
  <button
    className="dropdown-trigger"
    aria-haspopup="listbox"
    aria-expanded="false"
  >
    <Globe className="icon-sm" />
    <span>语言</span>
    <ChevronDown className="icon-sm" />
  </button>

  <ul className="dropdown-menu" role="menu" style={{ minWidth: '160px' }}>
    <li className="dropdown-item active" role="menuitem">
      <span>简体中文</span>
      <Check className="icon-sm" />
    </li>
    <li className="dropdown-item" role="menuitem">
      <span>English</span>
    </li>
    <li className="dropdown-item" role="menuitem">
      <span>日本語</span>
    </li>
    <li className="dropdown-item" role="menuitem">
      <span>한국어</span>
    </li>
  </ul>
</div>

// Action Dropdown
<div className="dropdown">
  <button className="dropdown-trigger" aria-haspopup="menu" aria-expanded="false">
    <MoreHorizontal className="icon-sm" />
  </button>

  <ul className="dropdown-menu" role="menu">
    <li className="dropdown-item" role="menuitem">
      <Copy className="icon-sm" />
      <span>复制规则</span>
    </li>
    <li className="dropdown-item" role="menuitem">
      <Download className="icon-sm" />
      <span>下载文件</span>
    </li>
    <li className="dropdown-item" role="menuitem">
      <Share2 className="icon-sm" />
      <span>分享</span>
    </li>
    <li className="dropdown-divider" role="separator" />
    <li className="dropdown-item danger" role="menuitem">
      <Trash2 className="icon-sm" />
      <span>删除</span>
    </li>
  </ul>
</div>
```

#### CSS 样式

```css
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: 8px 12px;
  font-family: var(--font-sans);
  font-size: var(--text-body);
  font-weight: 500;
  color: var(--text-primary);
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
}

.dropdown-trigger:hover {
  border-color: var(--border-strong);
  background: var(--bg-secondary);
}

.dropdown-trigger:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 180px;
  margin: 0;
  padding: var(--spacing-2);
  list-style: none;
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  z-index: 100;
  animation: dropdown-enter 150ms cubic-bezier(0.16, 1, 0.3, 1);
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
  justify-content: space-between;
  gap: var(--spacing-3);
  padding: 8px 10px;
  font-size: var(--text-body);
  color: var(--text-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition-fast) var(--ease-out);
  line-height: 1.4;
}

.dropdown-item > *:first-child {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.dropdown-item:hover {
  background: var(--bg-secondary);
}

.dropdown-item.active {
  color: var(--color-primary);
  background: rgba(0, 122, 255, 0.08);
}

.dropdown-item.danger {
  color: var(--color-danger);
}

.dropdown-item.danger:hover {
  background: rgba(239, 68, 68, 0.08);
}

.dropdown-item .icon-sm {
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.dropdown-item.danger .icon-sm {
  color: var(--color-danger);
}

.dropdown-divider {
  height: 1px;
  margin: 4px -4px;
  background: var(--border-default);
}

/* Align to right for action menus */
.dropdown.menu-right .dropdown-menu {
  left: auto;
  right: 0;
}
```

---

### 3.3 Accordion

**说明：** 折叠面板，用于指南、FAQ 等大量内容的可折叠展示。

#### 结构

```
.accordion
├── .accordion-item
│   ├── .accordion-trigger (role="button", aria-expanded)
│   │   ├── .accordion-title
│   │   └── .accordion-icon
│   └── .accordion-content (role="region")
└── ...
```

#### React TSX 示例

```tsx
<div className="accordion">

  <div className="accordion-item">
    <button
      className="accordion-trigger"
      aria-expanded="true"
      aria-controls="acc-content-1"
    >
      <span className="accordion-title">什么是 DNS 过滤？</span>
      <ChevronDown className="accordion-icon" />
    </button>
    <div className="accordion-content" id="acc-content-1" role="region">
      <p>
        DNS 过滤是一种通过在 DNS 解析阶段拦截特定域名来阻止访问
        广告、追踪器和恶意网站的技术。当设备尝试访问被阻止的域名时，
        DNS 服务器会返回一个无效的 IP 地址，使连接无法建立。
      </p>
    </div>
  </div>

  <div className="accordion-item">
    <button
      className="accordion-trigger"
      aria-expanded="false"
      aria-controls="acc-content-2"
    >
      <span className="accordion-title">如何选择输出格式？</span>
      <ChevronDown className="accordion-icon" />
    </button>
    <div className="accordion-content" id="acc-content-2" role="region" hidden>
      <p>
        <strong>Dnsmasq</strong>：适用于基于 Dnsmasq 的路由器和系统。<br />
        <strong>Hosts</strong>：通用的 hosts 文件格式，适用于任何操作系统。<br />
        <strong>AdGuard</strong>：适用于 AdGuard Home 和 AdGuard DNS。
      </p>
    </div>
  </div>

  <div className="accordion-item">
    <button
      className="accordion-trigger"
      aria-expanded="false"
      aria-controls="acc-content-3"
    >
      <span className="accordion-title">规则更新频率是多少？</span>
      <ChevronDown className="accordion-icon" />
    </button>
    <div className="accordion-content" id="acc-content-3" role="region" hidden>
      <p>预设规则源每天自动更新一次。您也可以手动触发即时更新。</p>
    </div>
  </div>

</div>
```

#### CSS 样式

```css
.accordion {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--bg-primary);
}

.accordion-item {
  border-bottom: 1px solid var(--border-default);
}

.accordion-item:last-child {
  border-bottom: none;
}

.accordion-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-3);
  width: 100%;
  padding: var(--spacing-4);
  font-family: var(--font-sans);
  font-size: var(--text-body);
  font-weight: 500;
  color: var(--text-primary);
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background var(--transition-fast) var(--ease-out);
}

.accordion-trigger:hover {
  background: var(--bg-secondary);
}

.accordion-trigger:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.accordion-title {
  flex: 1;
  line-height: 1.4;
}

.accordion-icon {
  width: 18px;
  height: 18px;
  color: var(--text-secondary);
  flex-shrink: 0;
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.accordion-item:has(.accordion-trigger[aria-expanded="true"]) .accordion-icon {
  transform: rotate(180deg);
}

.accordion-content {
  padding: 0 var(--spacing-4) var(--spacing-4);
  font-size: var(--text-body);
  color: var(--text-secondary);
  line-height: 1.7;
  animation: accordion-open 250ms cubic-bezier(0.16, 1, 0.3, 1);
}

.accordion-content p {
  margin: 0;
}

.accordion-content strong {
  color: var(--text-primary);
  font-weight: 600;
}

@keyframes accordion-open {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

### 3.4 Stats Bar

**说明：** 统计数字栏，用于在 hero 区下方展示关键数据指标。

#### 结构

```
.stats-bar
├── .stat-item × N
│   ├── .stat-value
│   └── .stat-label
└── ...
```

#### React TSX 示例

```tsx
<div className="stats-bar">

  <div className="stat-item">
    <span className="stat-value">473</span>
    <span className="stat-label">域名总数</span>
  </div>

  <div className="stat-divider" />

  <div className="stat-item">
    <span className="stat-value">452</span>
    <span className="stat-label">黑名单</span>
  </div>

  <div className="stat-divider" />

  <div className="stat-item">
    <span className="stat-value">21</span>
    <span className="stat-label">白名单</span>
  </div>

  <div className="stat-divider" />

  <div className="stat-item">
    <span className="stat-value">3</span>
    <span className="stat-label">规则源</span>
  </div>

</div>
```

#### CSS 样式

```css
.stats-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-6);
  padding: var(--spacing-6) var(--spacing-4);
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);
  min-width: 80px;
}

.stat-value {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: var(--text-small);
  color: var(--text-secondary);
  line-height: 1;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--border-default);
}

/* Responsive: remove dividers on small screens */
@media (max-width: 640px) {
  .stats-bar {
    gap: var(--spacing-4);
  }
  .stat-divider {
    display: none;
  }
}
```

---

### 3.5 Code Preview

**说明：** 代码预览卡片，Mac 风格编辑器外观，用于展示生成的规则代码。

#### 结构

```
.code-preview
├── .code-preview-header
│   ├── .code-preview-dots
│   ├── .code-preview-title
│   └── .code-preview-actions
└── .code-preview-body
    └── pre > code
```

#### React TSX 示例

```tsx
<div className="code-preview">

  <div className="code-preview-header">
    <div className="code-preview-dots" aria-hidden="true">
      <span style={{ background: '#FF5F57' }} />
      <span style={{ background: '#FEBC2E' }} />
      <span style={{ background: '#28C840' }} />
    </div>
    <span className="code-preview-title">dnsmasq.conf</span>
    <button className="btn btn-ghost btn-sm code-preview-action">
      <Copy className="icon-sm" />
      复制
    </button>
  </div>

  <div className="code-preview-body">
    <pre><code>{`# Dnsmasq 规则 - 生成于 2024-06-19
# 域名数量: 473

address=/ad.example.com/0.0.0.0
address=/tracker.example.com/0.0.0.0
address=/analytics.example.net/0.0.0.0
address=/banner.example.io/0.0.0.0
address=/ads.example.tv/0.0.0.0`}</code></pre>
  </div>

</div>
```

#### CSS 样式

```css
.code-preview {
  background: var(--gray-900);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.code-preview-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--gray-800);
  border-bottom: 1px solid var(--gray-700);
}

.code-preview-dots {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.code-preview-dots span {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
}

.code-preview-title {
  flex: 1;
  font-family: var(--font-mono);
  font-size: var(--text-small);
  color: var(--gray-400);
  text-align: center;
}

.code-preview-action {
  color: var(--gray-300);
  background: var(--gray-700);
  border: 1px solid var(--gray-600);
  height: 28px;
}

.code-preview-action:hover:not(:disabled) {
  background: var(--gray-600);
  color: #FFFFFF;
}

.code-preview-body {
  padding: var(--spacing-4);
  overflow-x: auto;
}

.code-preview-body pre {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-small);
  line-height: 1.7;
  color: #E4E4E7;
  white-space: pre;
}

.code-preview-body code {
  font-family: inherit;
  font-size: inherit;
}
```

---

### 3.6 Tooltip

**说明：** 悬停提示，用于解释图标按钮或提供额外上下文信息。

#### 变体 (Variants)

| 位置 | 类名 | 说明 |
|------|------|------|
| Top (默认) | - | 显示在元素上方 |
| Right | `tooltip-right` | 显示在元素右侧 |
| Bottom | `tooltip-bottom` | 显示在元素下方 |
| Left | `tooltip-left` | 显示在元素左侧 |

#### React TSX 示例

```tsx
// Icon Button with Tooltip
<div className="tooltip-wrapper">
  <button className="btn btn-icon" aria-label="复制">
    <Copy className="icon-sm" />
  </button>
  <span className="tooltip" role="tooltip">复制到剪贴板</span>
</div>

// Right-positioned Tooltip
<div className="tooltip-wrapper tooltip-right">
  <button className="btn btn-icon btn-ghost" aria-label="设置">
    <Settings className="icon-sm" />
  </button>
  <span className="tooltip" role="tooltip">设置</span>
</div>

// Text with Tooltip
<div className="tooltip-wrapper">
  <span className="badge badge-default" style={{ cursor: 'help' }}>
    <Info className="icon-sm" />
  </span>
  <span className="tooltip" role="tooltip">
    此功能需要管理员权限
  </span>
</div>
```

#### CSS 样式

```css
.tooltip-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 6px var(--spacing-3);
  font-family: var(--font-sans);
  font-size: var(--text-small);
  font-weight: 400;
  line-height: 1.4;
  color: #FFFFFF;
  background: var(--gray-800);
  border-radius: var(--radius-sm);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity var(--transition-fast) var(--ease-out),
              transform var(--transition-fast) var(--ease-out),
              visibility var(--transition-fast) var(--ease-out);
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: var(--gray-800);
}

.tooltip-wrapper:hover .tooltip,
.tooltip-wrapper:focus-within .tooltip {
  opacity: 1;
  visibility: visible;
}

/* Position Variants */
.tooltip-right .tooltip {
  top: 50%;
  left: calc(100% + 8px);
  bottom: auto;
  transform: translateY(-50%);
}
.tooltip-right .tooltip::after {
  top: 50%;
  left: auto;
  right: 100%;
  transform: translateY(-50%);
  border-top-color: transparent;
  border-right-color: var(--gray-800);
}

.tooltip-bottom .tooltip {
  top: calc(100% + 8px);
  bottom: auto;
  left: 50%;
  transform: translateX(-50%);
}
.tooltip-bottom .tooltip::after {
  top: auto;
  bottom: 100%;
  border-top-color: transparent;
  border-bottom-color: var(--gray-800);
}

.tooltip-left .tooltip {
  top: 50%;
  right: calc(100% + 8px);
  left: auto;
  bottom: auto;
  transform: translateY(-50%);
}
.tooltip-left .tooltip::after {
  top: 50%;
  left: 100%;
  transform: translateY(-50%);
  border-top-color: transparent;
  border-left-color: var(--gray-800);
}
```

---

## 4. 业务组件

---

### 4.1 Domain Editor

**说明：** 域名输入编辑器，结合 Textarea 与行号显示，是产品的核心输入组件。

#### 功能特点

- 左侧显示行号
- 等宽字体，每行一个域名
- 底部显示统计信息（有效行数）
- 支持粘贴、去重、排序等快捷操作

#### React TSX 示例

```tsx
<div className="domain-editor">

  <div className="domain-editor-header">
    <h3 className="card-title">域名列表</h3>
    <div className="domain-editor-actions">
      <button className="btn btn-ghost btn-sm">
        <ArrowUpDown className="icon-sm" />
        排序
      </button>
      <button className="btn btn-ghost btn-sm">
        <FilterX className="icon-sm" />
        去重
      </button>
      <button className="btn btn-ghost btn-sm">
        <Eraser className="icon-sm" />
        清空
      </button>
    </div>
  </div>

  <div className="textarea-wrapper domain-editor-body">
    <div className="textarea-line-numbers" aria-hidden="true">
      <span>1</span>
      <span>2</span>
      <span>3</span>
      <span>4</span>
      <span>5</span>
      <span>6</span>
      <span>7</span>
    </div>
    <textarea
      className="textarea textarea-with-linenum"
      rows={10}
      placeholder="每行输入一个域名..."
      defaultValue={`ad.example.com
tracker.example.org
analytics.example.net
banner.example.io
ads.example.tv
metrics.example.co
beacon.example.app`}
    />
  </div>

  <div className="domain-editor-footer">
    <span className="badge badge-default">7 行</span>
    <span className="badge badge-success">5 个有效域名</span>
    <span className="badge badge-warning">2 个重复项</span>
  </div>

</div>
```

#### CSS 样式

```css
.domain-editor {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.domain-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--border-default);
}

.domain-editor-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.domain-editor-body {
  border: none;
  border-radius: 0;
  border-bottom: 1px solid var(--border-default);
}

.domain-editor-body .textarea-with-linenum {
  min-height: 280px;
}

.domain-editor-footer {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--bg-secondary);
}
```

---

### 4.2 Preset Tags

**说明：** 预设源选择标签组，用于快速添加已知的规则源。

#### React TSX 示例

```tsx
<div className="preset-tags">

  <span className="preset-tags-label">预设源：</span>

  <div className="preset-tags-list">
    <button className="preset-tag active" aria-pressed="true">
      <Shield className="icon-sm" />
      EasyList
    </button>

    <button className="preset-tag active" aria-pressed="true">
      <Shield className="icon-sm" />
      AdGuard DNS
    </button>

    <button className="preset-tag" aria-pressed="false">
      <Shield className="icon-sm" />
      StevenBlack Hosts
    </button>

    <button className="preset-tag" aria-pressed="false">
      <Shield className="icon-sm" />
      Peter Lowe
    </button>

    <button className="preset-tag" aria-pressed="false">
      <Plus className="icon-sm" />
      添加自定义
    </button>
  </div>

</div>
```

#### CSS 样式

```css
.preset-tags {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.preset-tags-label {
  font-size: var(--text-small);
  font-weight: 500;
  color: var(--text-primary);
}

.preset-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.preset-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px var(--spacing-3);
  font-family: var(--font-sans);
  font-size: var(--text-small);
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
  line-height: 1;
}

.preset-tag:hover {
  color: var(--text-primary);
  border-color: var(--border-strong);
}

.preset-tag.active {
  color: var(--color-primary);
  background: rgba(0, 122, 255, 0.08);
  border-color: rgba(0, 122, 255, 0.3);
}

.preset-tag:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.preset-tag .icon-sm {
  width: 14px;
  height: 14px;
}
```

---

### 4.3 Format Tabs

**说明：** 输出格式选择组件，基于 Tabs 组件，专用于规则格式切换。

#### 变体 (Variants)

| 格式 | 说明 | 适用场景 |
|------|------|---------|
| Dnsmasq | `address=/domain/0.0.0.0` | 基于 Dnsmasq 的路由器 |
| Hosts | `0.0.0.0 domain` | 通用操作系统 hosts 文件 |
| AdGuard | `||domain^` | AdGuard Home / AdGuard DNS |

#### React TSX 示例

```tsx
<div className="format-tabs">

  <div className="tabs-list" role="tablist" aria-label="输出格式">
    <button
      role="tab"
      aria-selected="true"
      className="tabs-trigger format-tab active"
    >
      <FileCode className="icon-sm" />
      Dnsmasq
    </button>
    <button
      role="tab"
      aria-selected="false"
      className="tabs-trigger format-tab"
    >
      <FileText className="icon-sm" />
      Hosts
    </button>
    <button
      role="tab"
      aria-selected="false"
      className="tabs-trigger format-tab"
    >
      <Shield className="icon-sm" />
      AdGuard
    </button>
  </div>

  <div className="format-tabs-content" role="tabpanel">
    <div className="code-preview">
      <div className="code-preview-header">
        <div className="code-preview-dots" aria-hidden="true">
          <span style={{ background: '#FF5F57' }} />
          <span style={{ background: '#FEBC2E' }} />
          <span style={{ background: '#28C840' }} />
        </div>
        <span className="code-preview-title">dnsmasq.conf</span>
      </div>
      <div className="code-preview-body">
        <pre><code>{`address=/ad.example.com/0.0.0.0
address=/tracker.example.com/0.0.0.0`}</code></pre>
      </div>
    </div>
  </div>

</div>
```

#### CSS 样式

```css
.format-tabs {
  width: 100%;
}

.format-tabs .tabs-list {
  display: inline-flex;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 4px;
  border-bottom: none;
  margin-bottom: var(--spacing-4);
}

.format-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px !important;
  font-size: var(--text-small) !important;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm) !important;
  border-bottom: none !important;
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
  margin-bottom: 0 !important;
}

.format-tab:hover {
  color: var(--text-primary);
}

.format-tab.active {
  color: var(--text-primary);
  background: var(--bg-primary);
  border-bottom: none !important;
  box-shadow: var(--shadow-xs);
}

.format-tab .icon-sm {
  width: 14px;
  height: 14px;
}

.format-tabs-content {
  padding: 0;
}
```

---

### 4.4 Theme Toggle

**说明：** 主题切换按钮，浅/深色/跟随系统三态切换。

#### React TSX 示例

```tsx
<div className="theme-toggle" role="tablist" aria-label="主题模式">

  <button
    role="tab"
    aria-selected="true"
    className="theme-toggle-btn active"
    aria-label="浅色模式"
  >
    <Sun className="icon-sm" />
    <span>浅色</span>
  </button>

  <button
    role="tab"
    aria-selected="false"
    className="theme-toggle-btn"
    aria-label="深色模式"
  >
    <Moon className="icon-sm" />
    <span>深色</span>
  </button>

  <button
    role="tab"
    aria-selected="false"
    className="theme-toggle-btn"
    aria-label="跟随系统"
  >
    <Monitor className="icon-sm" />
    <span>系统</span>
  </button>

</div>
```

#### CSS 样式

```css
.theme-toggle {
  display: inline-flex;
  padding: 4px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.theme-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-family: var(--font-sans);
  font-size: var(--text-small);
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
  line-height: 1;
}

.theme-toggle-btn:hover {
  color: var(--text-primary);
}

.theme-toggle-btn.active {
  color: var(--text-primary);
  background: var(--bg-primary);
  box-shadow: var(--shadow-xs);
}

.theme-toggle-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.theme-toggle-btn .icon-sm {
  width: 16px;
  height: 16px;
}
```

---

## 5. 组件使用规则

### 5.1 按钮使用规则

| 规则 | 说明 |
|------|------|
| **主次按钮限制** | 每个视图中最多 **1 个 primary 按钮**；次要操作使用 secondary 或 ghost |
| **操作按钮排序** | 从左到右按重要性排序：主操作在最右或最突出位置 |
| **按钮尺寸统一** | 同一行的按钮使用相同尺寸（通常为 `default` 或 `sm`） |
| **危险操作确认** | 删除/重置等破坏性操作必须使用 `destructive` 按钮，并提供确认弹窗 |
| **加载状态** | 异步操作触发后必须立即进入 loading 状态，并禁用按钮 |
| **禁用时机** | 当操作条件未满足时，按钮应 disabled，并在 tooltip 中说明原因 |

#### 示例：正确 vs 错误

```tsx
// ✅ 正确：1 个 primary，其余为 secondary/outline
<div className="btn-group">
  <button className="btn btn-outline">取消</button>
  <button className="btn btn-secondary">保存草稿</button>
  <button className="btn btn-primary">生成规则</button>
</div>

// ❌ 错误：多个 primary 同时出现
<div className="btn-group">
  <button className="btn btn-primary">保存</button>
  <button className="btn btn-primary">生成</button>
</div>
```

---

### 5.2 颜色使用规则

| 语义色 | 使用场景 | 不应用于 |
|--------|---------|----------|
| `#007AFF` 主色 | 主要操作按钮、链接、当前选中项、焦点状态 | 背景大面积填充、普通文本 |
| `#22C55E` 成功色 | 成功状态徽章、启用状态标识、完成提示 | 操作按钮（除非确认删除） |
| `#F59E0B` 警告色 | 警告提示、待处理状态、轻度问题 | 普通操作按钮 |
| `#EF4444` 危险色 | 破坏性操作按钮、错误状态、阻止标识 | 普通操作按钮、链接 |

**原则：** 语义色应当克制使用，仅用于需要突出的状态或操作，不做装饰用途。

---

### 5.3 响应式规则

| 断点 | 宽度 | 布局策略 |
|------|------|---------|
| **mobile** | < 640px | 单列堆叠；按钮全宽；隐藏次要内容 |
| **tablet** | 640–1024px | 两列布局；紧凑间距 |
| **desktop** | > 1024px | 多列网格；完整内容显示 |

#### 实施要点

```css
/* 使用 CSS Grid + minmax 实现自适应网格 */
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-4);
}

/* 小屏幕：全宽按钮 */
@media (max-width: 640px) {
  .btn {
    width: 100%;
  }
  .btn-group {
    flex-direction: column;
  }
}
```

---

### 5.4 可访问性检查清单

| 检查项 | 要求 |
|--------|------|
| **颜色对比** | 文本与背景对比度 ≥ 4.5:1；大文本 ≥ 3:1 |
| **触控目标** | 所有可点击元素的最小尺寸 **44×44px** |
| **键盘导航** | 所有交互元素可通过 Tab 聚焦，Enter/Space 激活；Escape 关闭弹窗 |
| **焦点状态** | 所有可交互元素提供 `:focus-visible` 样式 |
| **ARIA 标签** | 图标按钮必须有 `aria-label`；弹窗使用 `role="dialog"` |
| **表单标签** | 每个输入框必须有 `<label>` 关联（`for` + `id`） |
| **减少动画** | 尊重 `prefers-reduced-motion` 媒体查询，对敏感用户禁用动画 |
| **语义标签** | 使用 `<button>`、`<nav>`、`<section>` 而非无意义的 `<div>` |

```css
/* 尊重减少动画偏好 */
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

## 6. 附录 A: CSS 变量汇总

### 6.1 主色与语义色

```css
--color-primary: #007AFF;
--color-primary-hover: #0056CC;
--color-success: #22C55E;
--color-warning: #F59E0B;
--color-danger: #EF4444;
```

### 6.2 灰阶系统

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

### 6.3 文本色

```css
--text-primary: #09090B;
--text-secondary: #71717A;
--text-tertiary: #A1A1AA;
```

### 6.4 背景色

```css
--bg-primary: #FFFFFF;
--bg-secondary: #F4F4F5;
--bg-elevated: #FFFFFF;
```

### 6.5 边框色

```css
--border-default: #E4E4E7;
--border-strong: #D4D4D8;
```

### 6.6 字体

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', Monaco, Consolas, monospace;
```

### 6.7 字号

```css
--text-display: clamp(2rem, 4vw, 3rem);
--text-h1: clamp(1.5rem, 3vw, 2rem);
--text-h2: 1.25rem;
--text-h3: 1rem;
--text-body: 0.875rem;
--text-small: 0.75rem;
--text-caption: 0.625rem;
```

### 6.8 间距（基于 4px）

```css
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
```

### 6.9 圆角

```css
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 24px;
--radius-full: 9999px;
```

### 6.10 阴影

```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
```

### 6.11 动效

```css
--transition-fast: 100ms ease;
--transition-normal: 200ms ease;
--transition-slow: 300ms ease-out;

--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in: cubic-bezier(0.7, 0, 0.84, 0);
--ease-in-out: cubic-bezier(0.45, 0, 0.55, 1);
```

---

*DNS Shield 组件库 v2.3.0 — 可直接交付前端工程师实现*
