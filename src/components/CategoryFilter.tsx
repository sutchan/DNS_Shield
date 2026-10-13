// src/components/CategoryFilter.tsx v3.12.0
// 域名分类筛选：按上游来源（真实命中关系）多选过滤域名列表。
// 索引不可用时整个控件不渲染，避免呈现无效交互。

import type { FC } from 'react';
import {
  CATEGORY_DEFINITIONS,
  countByCategory,
  type CategoryIndex,
  type CategoryKey
} from '../utils/domainCategory';
import { useT } from '../context/AppContext';

interface CategoryFilterProps {
  index: CategoryIndex;
  selected: ReadonlySet<CategoryKey>;
  onToggle: (key: CategoryKey) => void;
  onClear: () => void;
  clearLabel: string;
}

export const CategoryFilter: FC<CategoryFilterProps> = ({
  index,
  selected,
  onToggle,
  onClear,
  clearLabel
}) => {
  const t = useT();
  const counts = countByCategory(index);
  const labels = (t as unknown as { category?: Record<string, string> }).category;

  return (
    <div className="category-filter" id="category-filter" role="group" aria-label={t.inputTitle}>
      {CATEGORY_DEFINITIONS.map((def) => {
        const active = selected.has(def.key);
        const label = labels?.[def.key] ?? def.key;
        return (
          <button
            key={def.key}
            type="button"
            id={`category-${def.key}-btn`}
            className={`category-chip${active ? ' active' : ''}`}
            aria-pressed={active}
            onClick={() => onToggle(def.key)}
          >
            <span>{label}</span>
            <span className="category-chip-count">{counts[def.key] ?? 0}</span>
          </button>
        );
      })}
      {selected.size > 0 && (
        <button
          type="button"
          id="category-clear-btn"
          className="category-chip clear"
          onClick={onClear}
        >
          {clearLabel}
        </button>
      )}
    </div>
  );
};
