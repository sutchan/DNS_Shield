# DNS Shield — 交互标准 v3.7.31
## 1. 交互模式

### 1.1 操作层级

| 层级 | 视觉表现 | 使用场景 |
|------|----------|----------|
| Primary | 实色按钮（bg-primary） | 主要操作：生成规则、下载、确认 |
| Secondary | 边框按钮（border-input） | 次要操作：排序、去重、复制 |
| Tertiary | 文字按钮 / 幽灵按钮 | 辅助操作：清空、设置、高级选项 |
| Destructive | 红色按钮（bg-destructive） | 危险操作：删除、重置 |

### 1.2 按钮布局

- **模态框/弹窗**: Primary 右对齐，Secondary 左对齐
- **表单底部**: Primary 右对齐，Secondary 紧邻左侧
- **工具栏**: 所有按钮平铺，Primary 最右侧
- **卡片内部**: 按钮右对齐或底部居中

---

## 2. 反馈系统

### 2.1 Toast 通知

| 类型 | 颜色 | 持续时间 | 图标 | 使用场景 |
|------|------|----------|------|----------|
| Success | Green | 3 秒 | CheckCircle | 操作成功 |
| Error | Red | 5 秒 | XCircle | 操作失败 |
| Warning | Orange | 4 秒 | AlertTriangle | 警告提示 |
| Info | Blue | 3 秒 | Info | 信息提示 |

```typescript
// Toast 使用规范
import { toast } from 'sonner';

toast.success('规则已生成', { duration: 3000 });
toast.error('生成失败，请重试', { duration: 5000 });
toast.warning('部分域名无效', { duration: 4000 });
toast.info('正在加载数据...', { duration: 3000 });
```

### 2.2 加载状态

| 场景 | 组件 | 位置 | 说明 |
|------|------|------|------|
| 页面加载 | Skeleton 脉冲 | 内容区域 | 保持布局稳定 |
| 按钮提交 | Button isLoading | 按钮内部 | 显示 Spinner，禁用按钮 |
| 异步获取 | 全屏 Loading | 页面中央 | 半透明遮罩 + 旋转器 |
| 数据流式 | 进度条 | 顶部 | 线性进度指示 |

### 2.3 加载组件实现

```tsx
// Loading Overlay
export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex items-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        {message && <span className="ml-3 text-sm text-foreground">{message}</span>}
      </div>
    </div>
  );
}

// Skeleton
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-muted', className)} />
  );
}
```

---

## 3. 错误处理

### 3.1 错误类型

| 类型 | 表现 | 修复方式 |
|------|------|----------|
| 输入错误 | 输入框红边框 + 错误文字 | 用户修正输入 |
| 网络错误 | Toast 错误 + 重试按钮 | 点击重试 |
| 解析错误 | 行号高亮 + 错误提示 | 检查语法 |
| 权限错误 | 错误页面 + 引导 | 按引导操作 |

### 3.2 输入验证错误

```tsx
// Input with error
<div className="space-y-2">
  <Label htmlFor="url">URL 地址</Label>
  <Input
    id="url"
    value={url}
    onChange={handleChange}
    className={cn(error && 'border-red-500 focus-visible:ring-red-500')}
    aria-invalid={!!error}
    aria-describedby={error ? 'url-error' : undefined}
  />
  {error && (
    <p id="url-error" className="text-xs text-red-500 flex items-center gap-1">
      <AlertCircle className="h-3 w-3" />
      {error}
    </p>
  )}
</div>
```

### 3.3 网络错误重试

```tsx
// Error with retry
toast.error(
  <div className="flex items-center gap-2">
    <span>获取失败</span>
    <Button size="sm" variant="outline" onClick={retryFetch}>
      <RefreshCw className="h-3 w-3 mr-1" />
      重试
    </Button>
  </div>,
  { duration: 5000 }
);
```

---

## 4. 空状态

### 4.1 空状态类型

| 场景 | 标题 | 描述 | 操作 |
|------|------|------|------|
| 无域名输入 | 暂无域名 | 输入域名或从 URL 导入开始 | 导入示例 |
| 无输出 | 暂无规则 | 点击"生成规则"开始 | 生成规则 |
| 无 URL | 暂无 URL | 添加 URL 以批量导入 | 添加 URL |
| 无预设 | 暂无预设 | 选择预设源加载数据 | 选择预设 |

### 4.2 空状态组件

```tsx
<EmptyState
  icon={<FileText className="h-12 w-12" />}
  title={t.emptyTitle}
  description={t.emptyDescription}
  action={{
    label: t.loadExample,
    onClick: loadExampleDomains,
  }}
/>
```

---

## 5. 键盘导航

### 5.1 快捷键

| 快捷键 | 功能 | 范围 |
|--------|------|------|
| Ctrl/Cmd + Enter | 生成规则 | 全局 |
| Ctrl/Cmd + S | 保存域名 | 全局 |
| Ctrl/Cmd + D | 下载输出 | 全局 |
| Ctrl/Cmd + Shift + C | 复制输出 | 全局 |
| Tab | 焦点切换 | 全局 |
| Enter | 激活按钮 | 焦点在按钮上 |
| Space | 切换开关 | 焦点在 Checkbox/Switch |
| Escape | 关闭弹窗 | 弹窗打开时 |

### 5.2 焦点管理

```tsx
// 焦点环样式
const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

// 按钮焦点
<Button className={focusRing}>操作</Button>

// 输入焦点
<Input className={focusRing} />

// 自定义焦点
<div
  tabIndex={0}
  className={cn('cursor-pointer', focusRing)}
  role="button"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  可点击区域
</div>
```

---

## 6. 动效规范

### 6.1 过渡原则

| 场景 | 时长 | 缓动 | 属性 |
|------|------|------|------|
| 按钮悬停 | 150ms | ease-out | background-color, border-color |
| 卡片悬停 | 200ms | ease-out | box-shadow, transform |
| 面板展开 | 300ms | ease-out | max-height, opacity |
| 模态框进入 | 200ms | ease-out | opacity, transform |
| 页面切换 | 300ms | ease-in-out | opacity |
| Toast 进入 | 300ms | ease-out | opacity, translateY |
| Toast 退出 | 200ms | ease-in | opacity, translateY |

### 6.2 动画实现

```tsx
// 面板展开/收起
const panelVariants = {
  open: { height: 'auto', opacity: 1 },
  closed: { height: 0, opacity: 0 },
};

// 模态框
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

// 列表项进入
const listItemVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05 },
  }),
};
```

---

## 7. 无障碍（a11y）

### 7.1 必须实现

1. **语义化 HTML** — 使用 `<header>`, `<main>`, `<section>`, `<footer>`
2. **ARIA 标签** — 所有图标按钮有 `aria-label`
3. **表单关联** — 所有输入有 `label` 或 `aria-labelledby`
4. **颜色对比** — 文字对比度 >= 4.5:1
5. **键盘可达** — 所有交互元素可通过 Tab 聚焦
6. **焦点可见** — 焦点环清晰可见
7. **减少动画** — 尊重 `prefers-reduced-motion`

### 7.2 ARIA 模式

```tsx
// Tabs
<div role="tablist" aria-label="输出格式">
  <button role="tab" aria-selected={true} id="tab-dnsmasq">Dnsmasq</button>
  <button role="tab" aria-selected={false} id="tab-hosts">Hosts</button>
</div>
<div role="tabpanel" aria-labelledby="tab-dnsmasq">...</div>

// 折叠面板
<button aria-expanded={isOpen} aria-controls="panel-id">
  展开/收起
</button>
<div id="panel-id" hidden={!isOpen}>...</div>

// 统计区域
<div role="region" aria-label="统计信息">
  <span aria-live="polite">...</span>
</div>
```

---

## 8. 响应式交互

### 8.1 触摸适配

| 元素 | 最小触控尺寸 | 间距 |
|------|-------------|------|
| 按钮 | 44×44px | >= 8px |
| 输入框 | 44px 高度 | >= 12px |
| 标签/徽章 | 32px 高度 | >= 4px |
| 列表项 | 48px 高度 | >= 0 |

### 8.2 移动端交互

- 按钮宽度：移动端全宽或自适应
- 底部固定栏：主要操作固定在底部
- 手势：左滑删除 URL 列表项
- 下拉刷新：URL 列表支持下拉刷新

---

## 9. 状态机

### 9.1 按钮状态

```
Idle -> Hover -> Active -> Loading -> Success/Error -> Idle
```

### 9.2 页面状态

```
Empty -> Loading -> Loaded -> Processing -> Output -> Empty
```

### 9.3 面板状态

```
Collapsed -> Expanding -> Expanded -> Collapsing -> Collapsed
```
