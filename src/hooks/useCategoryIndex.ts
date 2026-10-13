// src/hooks/useCategoryIndex.ts v3.12.0
// 分类索引加载：从 public/category-index.txt 拉取「<source> <domain>」索引并解析。
// 该文件由 scripts/aggregate-upstream.mjs 依据真实上游命中关系产出。
// 索引缺失（未运行聚合）时静默降级为空索引，分类控件自动隐藏，不影响主流程。

import { useEffect, useState } from 'react';
import { parseCategoryIndex, type CategoryIndex } from '../utils/domainCategory';

export interface UseCategoryIndexResult {
  index: CategoryIndex;
  /** 索引是否可用（有真实数据） */
  available: boolean;
  loading: boolean;
}

export const useCategoryIndex = (): UseCategoryIndexResult => {
  const [index, setIndex] = useState<CategoryIndex>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/category-index.txt');
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const text = await res.text();
        if (cancelled) return;
        setIndex(parseCategoryIndex(text));
      } catch {
        // 索引缺失或拉取失败：分类功能不可用，但不阻断其他功能
        if (!cancelled) setIndex(new Map());
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { index, available: index.size > 0, loading };
};
