# DNS Shield Component Library

> Design system specification for DNS Shield v2.3.0

## Design Tokens

### Color Palette (OKLCH)

```css
:root {
  /* Primary Brand */
  --color-primary: oklch(55% 0.2 250);        /* #6B5CE7 - Primary actions */
  --color-primary-hover: oklch(48% 0.2 250);  /* Hover state */
  
  /* Semantic Colors */
  --color-success: oklch(65% 0.2 145);         /* #22C55E - Success states */
  --color-danger: oklch(60% 0.22 25);          /* #EF4444 - Errors, destructive */
  --color-warning: oklch(75% 0.18 80);         /* #F59E0B - Warnings */
  
  /* Text Hierarchy */
  --text-primary: oklch(15% 0 0);             /* Main content */
  --text-secondary: oklch(50% 0 0);           /* Secondary content */
  --text-tertiary: oklch(70% 0 0);            /* Muted, disabled */
  
  /* Backgrounds */
  --bg-base: oklch(99% 0 0);                  /* Page background */
  --bg-elevated: oklch(100% 0 0);             /* Cards, panels */
  --bg-muted: oklch(97% 0 0);                 /* Input backgrounds */
  --bg-code: oklch(20% 0 0);                  /* Code blocks */
  
  /* Borders */
  --border-subtle: oklch(92% 0 0);            /* Subtle separators */
  --border-default: oklch(88% 0 0);            /* Default borders */
  
  /* Shadows */
  --shadow-sm: 0 1px 2px oklch(0% 0 0 / 0.04);
  --shadow-md: 0 4px 12px oklch(0% 0 0 / 0.08);
}

[data-theme="dark"] {
  --text-primary: oklch(98% 0 0);
  --text-secondary: oklch(70% 0 0);
  --text-tertiary: oklch(50% 0 0);
  --bg-base: oklch(12% 0 0);
  --bg-elevated: oklch(18% 0 0);
  --bg-muted: oklch(22% 0 0);
  --bg-code: oklch(8% 0 0);
  --border-subtle: oklch(25% 0 0);
  --border-default: oklch(30% 0 0);
  --shadow-sm: 0 1px 2px oklch(0% 0 0 / 0.3);
  --shadow-md: 0 4px 12px oklch(0% 0 0 / 0.4);
}
```

### Typography

| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| Hero | Geist | 4rem (clamp 2.5-4rem) | 700 | 1.05 |
| H1 | Geist | 2rem | 700 | 1.1 |
| H2 | Geist | 1.5rem | 600 | 1.2 |
| Body | Geist | 15px | 400 | 1.6 |
| Small | Geist | 13px | 400 | 1.5 |
| Caption | Geist | 11px | 500 | 1.4 |
| Code | Geist Mono | 12px | 400 | 1.7 |

### Spacing Scale (4px Base)

```
--space-1: 4px   --space-6: 24px   --space-12: 48px
--space-2: 8px   --space-8: 32px   --space-16: 64px
--space-3: 12px  --space-10: 40px
--space-4: 16px  --space-12: 48px
--space-5: 20px
```

### Border Radius

```
--radius-sm: 4px    --radius-lg: 12px   --radius-full: 9999px
--radius-md: 8px   --radius-xl: 16px
```

### Motion

```
--duration-fast: 100ms
--duration-normal: 200ms
--ease-out: cubic-bezier(0.16, 1, 0.3, 1)
```

---

## Foundation Components

### Button

#### Variants

| Variant | Use Case | Background | Border | Text |
|---------|----------|------------|--------|------|
| `primary` | Primary actions | `--color-primary` | none | white |
| `secondary` | Secondary actions | `--bg-muted` | `--border-subtle` | `--text-primary` |
| `ghost` | Subtle actions | transparent | `--border-subtle` | `--text-secondary` |
| `destructive` | Danger actions | `--color-danger` | none | white |

#### Sizes

| Size | Height | Padding | Font | Border Radius |
|------|--------|---------|------|---------------|
| `sm` | 32px | 0 12px | 12px | `--radius-md` |
| `default` | 40px | 0 16px | 13px | `--radius-md` |
| `lg` | 48px | 0 20px | 15px | `--radius-lg` |
| `icon` | 36px | 0 | - | `--radius-md` |

#### States

- **Default**: Base styles
- **Hover**: Slight opacity/brightness shift
- **Active**: Scale 0.98, darker shade
- **Disabled**: 50% opacity, cursor not-allowed
- **Loading**: Spinner icon, disabled interaction

#### Code Example

```tsx
import { Button } from '@/components/ui/Button';
import { DownloadIcon } from 'lucide-react';

// Primary action
<Button variant="primary">
  Generate Rules
</Button>

// Secondary action with icon
<Button variant="secondary">
  <DownloadIcon className="h-4 w-4" />
  Download
</Button>

// Icon button
<Button variant="ghost" size="icon">
  <SettingsIcon className="h-4 w-4" />
</Button>
```

---

### Input

#### Variants

| Variant | Background | Border | Use Case |
|---------|------------|--------|----------|
| `default` | `--bg-muted` | `--border-subtle` | Standard input |
| `error` | `--bg-muted` | `--color-danger` | Validation error |
| `mono` | `--bg-muted` | `--border-subtle` | Code/URL input |

#### Sizes

| Size | Height | Padding | Font |
|------|--------|---------|------|
| `sm` | 32px | 0 12px | 12px |
| `default` | 40px | 0 16px | 13px |
| `lg` | 48px | 0 20px | 15px |

#### States

- **Default**: Base styles
- **Focus**: `--color-primary` border, `--bg-elevated` background
- **Error**: `--color-danger` border, error message below
- **Disabled**: 50% opacity, cursor not-allowed
- **Readonly**: `--bg-muted` background

#### Code Example

```tsx
import { Input } from '@/components/ui/Input';

// URL input
<Input
  type="url"
  placeholder="https://example.com/blocklist.txt"
  className="font-mono"
/>

// With error state
<div className="space-y-1">
  <Input
    type="text"
    state="error"
    aria-invalid="true"
  />
  <p className="text-sm text-destructive">Invalid URL format</p>
</div>
```

---

### Badge

#### Variants

| Variant | Background | Text | Use Case |
|---------|------------|------|----------|
| `default` | `--color-primary` | white | Active state |
| `secondary` | `--bg-muted` | `--text-secondary` | Inactive state |
| `outline` | transparent | `--text-secondary` | Tags |
| `success` | success/15 | `--color-success` | Success |
| `warning` | warning/15 | `--color-warning` | Warning |
| `destructive` | danger/15 | `--color-danger` | Error |

#### Sizes

| Size | Padding | Font | Border Radius |
|------|---------|------|---------------|
| `sm` | 2px 6px | 11px | `--radius-sm` |
| `default` | 4px 10px | 12px | `--radius-full` |

#### Code Example

```tsx
import { Badge } from '@/components/ui/Badge';

// Stat badge
<Badge variant="secondary">
  <span className="stat-value">10</span>
  <span className="stat-label">Domains</span>
</Badge>

// Tag badge
<Badge variant="outline" className="cursor-pointer">
  EasyList
</Badge>
```

---

### Card

#### Structure

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    {/* Footer actions */}
  </CardFooter>
</Card>
```

#### Variants

| Variant | Background | Border |
|---------|------------|--------|
| `default` | `--bg-elevated` | `--border-subtle` |
| `muted` | `--bg-muted` | none |

#### Code Example

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

<Card>
  <CardHeader>
    <CardTitle>DNS Configuration</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Panel content */}
  </CardContent>
</Card>
```

---

## Composite Components

### Toast (via Sonner)

Sonner provides production-ready toast notifications.

#### Usage

```tsx
import { toast } from 'sonner';

// Success toast
toast.success('Parsed', {
  description: '10 domains ready',
});

// Error toast
toast.error('Parse failed', {
  description: 'Please enter at least one domain',
});

// Info toast
toast.info('Loading...');
```

#### Positioning

Default: top-right position with `richColors` enabled.

---

### Accordion

Collapsible content sections with smooth animations.

#### Structure

```tsx
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Title</AccordionTrigger>
    <AccordionContent>
      {/* Content */}
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

#### Variants

| Variant | Behavior |
|---------|----------|
| `single` | Only one item open at a time |
| `multiple` | Multiple items can be open |

#### Code Example

```tsx
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/Accordion';

<Accordion type="single" collapsible>
  <AccordionItem value="guide">
    <AccordionTrigger>Getting Started</AccordionTrigger>
    <AccordionContent>
      Step-by-step instructions...
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

---

### Tabs

Format/filter selection tabs with pill-style design.

#### Structure

```tsx
<Tabs defaultValue="dnsmasq">
  <TabsList>
    <TabsTrigger value="dnsmasq">Dnsmasq</TabsTrigger>
    <TabsTrigger value="hosts">Hosts</TabsTrigger>
    <TabsTrigger value="adguard">AdGuard</TabsTrigger>
  </TabsList>
  <TabsContent value="dnsmasq">
    {/* Content */}
  </TabsContent>
</Tabs>
```

#### Code Example

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

<Tabs defaultValue="dnsmasq" onValueChange={(v) => setFormat(v)}>
  <TabsList>
    <TabsTrigger value="dnsmasq">Dnsmasq</TabsTrigger>
    <TabsTrigger value="hosts">Hosts</TabsTrigger>
    <TabsTrigger value="adguard">AdGuard</TabsTrigger>
  </TabsList>
</Tabs>
```

---

### Switch

Toggle controls for boolean settings.

#### Structure

```tsx
<Switch
  id="wildcard"
  checked={wildcard}
  onCheckedChange={setWildcard}
/>
```

#### Code Example

```tsx
import { Switch } from '@/components/ui/Switch';

<div className="flex items-center justify-between">
  <div>
    <label htmlFor="wildcard" className="font-medium">Wildcard Support</label>
    <p className="text-sm text-muted-foreground">
      Add *. prefix to match subdomains
    </p>
  </div>
  <Switch
    id="wildcard"
    checked={wildcard}
    onCheckedChange={setWildcard}
  />
</div>
```

---

### Dialog

Modal overlays for confirmations and detailed views.

#### Structure

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant="secondary" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleConfirm}>
        Confirm
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## Business Components

### DomainEditor

Multi-line domain input with line numbers.

#### Props

```tsx
interface DomainEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}
```

#### Features

- Line number gutter synchronized with scroll
- Monospace font for domain display
- Auto-resize based on content
- Touch-friendly on mobile

#### Code Example

```tsx
import { DomainEditor } from '@/components/DomainEditor';

<DomainEditor
  value={sourceInput}
  onChange={handleSourceInput}
  placeholder="Enter domains..."
  minHeight="240px"
/>
```

---

### FormatTabs

Format selection component with Dnsmasq/Hosts/AdGuard options.

#### Props

```tsx
interface FormatTabsProps {
  value: 'dnsmasq' | 'hosts' | 'adguard';
  onChange: (value: 'dnsmasq' | 'hosts' | 'adguard') => void;
}
```

#### Code Example

```tsx
import { FormatTabs } from '@/components/FormatTabs';

<FormatTabs
  value={format}
  onChange={setFormat}
/>
```

---

### CodePreview

Syntax-highlighted code output display.

#### Props

```tsx
interface CodePreviewProps {
  code: string;
  language?: 'dnsmasq' | 'hosts' | 'adguard';
  filename?: string;
  maxHeight?: string;
}
```

#### Code Example

```tsx
import { CodePreview } from '@/components/CodePreview';

<CodePreview
  code={generatedRules}
  language="dnsmasq"
  filename="dnsmasq.conf"
  maxHeight="320px"
/>
```

---

### StatsBar

Domain statistics display component.

#### Props

```tsx
interface Stats {
  domainCount: number;
  validCount: number;
  commentCount: number;
  blacklistCount: number;
  whitelistCount: number;
}

interface StatsBarProps {
  stats: Stats;
  locale?: 'zh' | 'en';
}
```

#### Code Example

```tsx
import { StatsBar } from '@/components/StatsBar';

<StatsBar
  stats={{
    domainCount: 473,
    validCount: 452,
    commentCount: 21,
    blacklistCount: 452,
    whitelistCount: 21,
  }}
/>
```

---

## Utility Patterns

### cn() Utility

Merge Tailwind classes conditionally.

```tsx
import { cn } from '@/lib/utils';

// Basic merge
cn('base-class', 'additional-class')

// Conditional classes
cn(
  'flex items-center',
  isActive && 'bg-primary text-white',
  isDisabled && 'opacity-50'
)

// With conflicting classes
cn(
  'text-red-500',
  isDark && 'text-blue-500'  // wins when true
)
```

---

### i18n Pattern

Translation hook for multilingual support.

```tsx
import { useTranslation } from '@/hooks/useTranslation';

// In component
const { t } = useTranslation();

<Button>{t('parseBtn')}</Button>

// Translation file structure
{
  "parseBtn": {
    "zh": "生成规则",
    "en": "Generate"
  }
}
```

---

### Accessibility Patterns

#### Focus Management

```tsx
// Trap focus in modal
<Dialog>
  <DialogContent>
    <h2 ref={focusRef} tabIndex={-1}>Title</h2>
    {/* Content */}
  </DialogContent>
</Dialog>

// Restore focus on close
const handleOpenChange = (open) => {
  if (!open && triggerRef.current) {
    triggerRef.current.focus();
  }
};
```

#### Screen Reader Support

```tsx
// Live region for dynamic content
<div role="status" aria-live="polite">
  {statusMessage}
</div>

// Descriptive labels
<input
  type="url"
  aria-describedby="url-help"
/>
<div id="url-help" className="sr-only">
  Enter a URL to fetch domain list
</div>
```

---

## Interaction Standards

### Hover States

- All interactive elements have visible hover states
- Duration: 100ms
- Easing: ease-out

### Click/Tap Feedback

- Scale to 0.98 on active state
- Duration: 100ms

### Loading States

- Spinner for button loading
- Skeleton for content loading
- Progress for file operations

### Error States

- Red border on inputs
- Error message below field
- Toast notification for action errors

### Empty States

- Helpful illustration or icon
- Clear message explaining the state
- Call-to-action button when applicable

---

## Responsive Breakpoints

| Breakpoint | Layout | Target |
|------------|--------|--------|
| < 640px | Single column, compact spacing | Mobile |
| 640-1023px | Single column, standard spacing | Tablet |
| >= 1024px | Two-column layout | Desktop |

### Mobile Considerations

- Touch targets: minimum 44x44px
- Font sizes: minimum 12px for labels
- Padding: generous touch-friendly spacing
- No hover-only interactions

---

## Implementation Checklist

- [ ] Button component with all variants
- [ ] Input component with validation states
- [ ] Badge component with semantic variants
- [ ] Card component with header/content/footer
- [ ] Toast integration via Sonner
- [ ] Accordion for collapsible sections
- [ ] Tabs for format selection
- [ ] Switch for boolean settings
- [ ] Dialog for confirmations
- [ ] DomainEditor with line numbers
- [ ] CodePreview with syntax highlighting
- [ ] StatsBar for domain statistics
