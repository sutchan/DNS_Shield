// src/components/ui/EmptyState.tsx v3.19.0
// 统一空状态组件：对齐 docs/CHECKLIST.md「空状态有统一组件」。
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  /** 语义化容器 id，便于测试与无障碍定位 */
  id: string;
  icon?: ReactNode;
  title: string;
  description?: string;
  /** 代码/规则类占位文案使用等宽字体 */
  mono?: boolean;
}

export function EmptyState({ id, icon, title, description, mono = false }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center px-4 py-12 text-center"
      id={id}
      role="status"
    >
      {icon && (
        <div className="mb-4 text-muted-foreground" aria-hidden="true">
          {icon}
        </div>
      )}
      <p className={`text-sm text-foreground ${mono ? 'font-mono' : 'font-medium'}`}>{title}</p>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}
