# DNS Shield 组件库规范 v3.4.0
## 1. 组件架构

```
components/
├── ui/                    # shadcn/ui 基础组件（原子组件）
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   ├── badge.tsx
│   ├── tabs.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── tooltip.tsx
│   ├── toast.tsx
│   ├── skeleton.tsx
│   ├── select.tsx
│   ├── checkbox.tsx
│   ├── switch.tsx
│   ├── label.tsx
│   └── separator.tsx
├── composite/             # 复合组件（业务通用）
│   ├── code-editor.tsx    # 代码编辑器（行号+文本区）
│   ├── stat-card.tsx      # 统计卡片
│   ├── format-tabs.tsx    # 格式切换标签
│   ├── url-manager.tsx    # URL 管理器
│   ├── preset-selector.tsx # 预设选择器
│   └── empty-state.tsx    # 空状态组件
├── layout/                # 布局组件
│   ├── header.tsx
│   ├── footer.tsx
│   └── container.tsx
└── sections/              # 页面区块
    ├── input-panel.tsx
    └── output-panel.tsx
```

## 2. 基础组件（UI Primitives）

### 2.1 Button

```typescript
interface ButtonProps {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

- 默认使用 `cva` (class-variance-authority) 管理变体
- 所有变体支持 `disabled` 和 `isLoading`
- Loading 时显示 Spinner 并禁用交互

### 2.2 Card

```typescript
interface CardProps {
  variant?: 'default' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
```

### 2.3 Input / Textarea

```typescript
interface InputProps {
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  label?: string;
}
```

### 2.4 Badge

```typescript
interface BadgeProps {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}
```

### 2.5 Tabs

```typescript
interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  items: { value: string; label: string; icon?: React.ReactNode }[];
}
```

## 3. 复合组件（Composite Components）

### 3.1 CodeEditor

带行号的代码编辑器，用于域名输入和规则预览。

```typescript
interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  language?: 'domains' | 'dnsmasq' | 'hosts' | 'adguard';
}
```

### 3.2 StatCard

统计信息卡片。

```typescript
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}
```

### 3.3 FormatTabs

输出格式切换标签组。

```typescript
interface FormatTabsProps {
  value: FormatType;
  onChange: (format: FormatType) => void;
  formats: { value: FormatType; label: string; icon: React.ReactNode }[];
}
```

### 3.4 EmptyState

空状态展示。

```typescript
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}
```

## 4. 业务组件（Business Components）

### 4.1 InputPanel

域名输入面板，包含：
- 统计栏 (StatCard × 5)
- URL 管理器
- 预设选择器
- 代码编辑器
- 操作按钮组

### 4.2 OutputPanel

规则输出面板，包含：
- 格式切换 (FormatTabs)
- 合并信息
- 代码编辑器（只读）
- 操作按钮组
- 设置面板（可折叠）

## 5. 组件使用规范

### 5.1 禁止事项

- [x] 不使用 emoji 作为 UI 图标
- [x] 不硬编码颜色值（使用 CSS 变量）
- [x] 不直接使用 `style` prop
- [x] 不过度使用 `any` 类型
- [x] 不创建过大组件（>300 行需拆分）

### 5.2 必须事项

- [x] 所有交互元素添加 `cursor-pointer`
- [x] 所有按钮/链接有 `aria-label`
- [x] 表单输入有 `label` 关联
- [x] 加载状态提供反馈
- [x] 错误状态提供修复建议
- [x] 使用 `cn()` 合并 Tailwind 类名
- [x] 使用 `forwardRef` 传递 ref
