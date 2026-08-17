# DNS Shield — 组件库规范 v3.7.31
## 1. 组件架构

```
src/components/
├── ui/                    # shadcn/ui 基础组件（原子层，实际实现）
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Checkbox.tsx
│   ├── DropdownMenu.tsx
│   ├── Input.tsx
│   ├── Label.tsx
│   ├── Loading.tsx
│   ├── Select.tsx
│   ├── Switch.tsx
│   ├── Tabs.tsx
│   └── Toast.tsx
├── composite/             # 复合组件（分子层）
│   ├── code-editor.tsx    # 代码编辑器（行号 + 文本区）
│   ├── stat-badge.tsx     # 统计徽章
│   ├── format-tabs.tsx    # 格式切换标签
│   ├── url-input-row.tsx  # URL 输入行
│   ├── preset-tags.tsx    # 预设标签组
│   ├── empty-state.tsx    # 空状态
│   └── settings-row.tsx   # 设置项行
├── layout/                # 布局组件（有机体层）
│   ├── header.tsx         # 页头
│   ├── footer.tsx         # 页脚
│   └── container.tsx      # 容器
└── sections/              # 页面区块（页面层）
    ├── input-panel.tsx    # 输入面板
    └── output-panel.tsx   # 输出面板
```

## 2. 基础组件规范

### 2.1 Button

```typescript
// button.tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4',
        lg: 'h-10 px-5',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';
export { Button, buttonVariants };
```

### 2.2 Card

```typescript
// card.tsx
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-border bg-card text-card-foreground shadow-sm',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-5', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold leading-tight tracking-tight', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';
```

### 2.3 Input

```typescript
// input.tsx
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
```

### 2.4 Badge

```typescript
// badge.tsx
const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'text-foreground border-border',
        success: 'border-transparent bg-green-500/10 text-green-500',
        warning: 'border-transparent bg-orange-500/10 text-orange-500',
        error: 'border-transparent bg-red-500/10 text-red-500',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);
```

### 2.5 Tabs

```typescript
// tabs.tsx
const Tabs = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Root>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Root ref={ref} className={cn('w-full', className)} {...props} />
  )
);
Tabs.displayName = TabsPrimitive.Root.displayName;

const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
        className
      )}
      {...props}
    />
  )
);
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium',
        'ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        className
      )}
      {...props}
    />
  )
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
```

## 3. 复合组件规范

### 3.1 CodeEditor

```typescript
// composite/code-editor.tsx
interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  minHeight?: number;
  className?: string;
}

export function CodeEditor({
  value,
  onChange,
  readOnly = false,
  placeholder,
  minHeight = 200,
  className,
}: CodeEditorProps) {
  const lines = value.split('\n').length || 1;
  const lineNumbers = Array.from({ length: lines }, (_, i) => i + 1);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = React.useRef<HTMLDivElement>(null);

  const syncScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className={cn('relative flex rounded-lg border border-border overflow-hidden', className)}>
      {/* Line Numbers */}
      <div
        ref={lineNumbersRef}
        className="w-10 py-3 pr-2 text-right text-xs text-muted-foreground select-none bg-muted/30 font-mono overflow-hidden border-r border-border"
        aria-hidden="true"
      >
        {lineNumbers.map((num) => (
          <div key={num} className="leading-6">{num}</div>
        ))}
      </div>
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        onScroll={syncScroll}
        readOnly={readOnly}
        placeholder={placeholder}
        className="flex-1 min-h-[200px] py-3 pl-3 pr-3 text-[13px] font-mono bg-background resize-y focus:outline-none"
        style={{ minHeight }}
      />
    </div>
  );
}
```

### 3.2 StatBadge

```typescript
// composite/stat-badge.tsx
interface StatBadgeProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

export function StatBadge({ label, value, icon, variant = 'default' }: StatBadgeProps) {
  return (
    <div className={cn(
      'inline-flex flex-col items-center px-3 py-1.5 rounded-lg text-xs min-w-[72px]',
      variant === 'default' && 'bg-muted text-muted-foreground',
      variant === 'primary' && 'bg-primary/10 text-primary',
      variant === 'success' && 'bg-green-500/10 text-green-500',
      variant === 'warning' && 'bg-orange-500/10 text-orange-500',
    )}>
      <span className="text-base font-semibold text-foreground">{value}</span>
      <span className="mt-0.5 flex items-center gap-1">
        {icon}
        {label}
      </span>
    </div>
  );
}
```

### 3.3 EmptyState

```typescript
// composite/empty-state.tsx
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-muted-foreground mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-xs">{description}</p>}
      {action && (
        <Button variant="outline" size="sm" className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

## 4. 组件使用规则

### 4.1 必须遵守

1. **使用 `cn()` 合并类名** — 统一工具
2. **使用 `forwardRef` 传递 ref** — 无障碍兼容
3. **所有按钮添加 `cursor-pointer`** — 交互反馈
4. **所有图标使用 Lucide** — 禁止 emoji
5. **加载状态使用 Skeleton 或 Spinner** — 反馈及时
6. **错误状态使用红色边框 + 提示文字** — 清晰修复路径
7. **空状态使用 EmptyState 组件** — 统一体验

### 4.2 禁止事项

1. 不硬编码颜色值（使用 CSS 变量）
2. 不直接使用 `style` prop
3. 不使用 `any` 类型（strict mode）
4. 不创建超过 300 行的组件
5. 不使用 emoji 作为 UI 图标
6. 不忽略 `prefers-reduced-motion`
7. 不忽略键盘导航（Tab / Enter / Space）
