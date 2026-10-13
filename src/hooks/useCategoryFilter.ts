// src/hooks/useCategoryFilter.ts v3.12.0
// 域名分类筛选：加载真实分类索引，按用户选中的上游来源过滤域名列表。
// 索引不可用（未运行聚合脚本）时 selected 恒为空、filteredData 等于原数据，
// 主流程完全不受影响。

import { useCallback, useMemo, useState } from 'react';
import { useCategoryIndex } from './useCategoryIndex';
import { filterDomainsByCategory, type CategoryKey } from '../utils/domainCategory';
import type { ParsedData } from '../types';

export interface UseCategoryFilterResult {
  index: ReturnType<typeof useCategoryIndex>['index'];
  available: boolean;
  selected: ReadonlySet<CategoryKey>;
  toggle: (key: CategoryKey) => void;
  clear: () => void;
  filteredData: ParsedData;
}

export const useCategoryFilter = (parsedData: ParsedData): UseCategoryFilterResult => {
  const { index, available } = useCategoryIndex();
  const [selected, setSelected] = useState<ReadonlySet<CategoryKey>>(new Set());

  const toggle = useCallback((key: CategoryKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  // 按分类过滤域名；自定义 DNS（改道）无上游来源信息，原样保留。
  const filteredData = useMemo<ParsedData>(() => {
    if (!available || selected.size === 0) return parsedData;
    return {
      ...parsedData,
      domains: filterDomainsByCategory(parsedData.domains, index, selected),
      whitelist: filterDomainsByCategory(parsedData.whitelist, index, selected)
    };
  }, [parsedData, index, available, selected]);

  return { index, available, selected, toggle, clear, filteredData };
};
