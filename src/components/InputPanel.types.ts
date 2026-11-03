// src/components/InputPanel.types.ts v3.13.6
// InputPanel 的纯类型与常量定义（从 InputPanel.tsx 抽离以控制主文件行数）。
import type { CategoryIndex, CategoryKey } from '../utils/domainCategory';
import type { Stats, Translation } from '../types';

export interface InputPanelProps {
  sourceInput: string;
  urls: string[];
  isUrlSectionCollapsed: boolean;
  stats: Stats;
  activePreset: string;
  lineNumbersRef: React.RefObject<HTMLDivElement>;
  sourceTextareaRef: React.RefObject<HTMLTextAreaElement>;
  urlInput: string;
  setUrlInput: (value: string) => void;
  toggleSection: (section: string) => void;
  handleSourceInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  syncScroll: () => void;
  clearAll: () => void;
  sortDomains: () => void;
  generateRules: () => void;
  dedupeDomains: () => void;
  loadPreset: (preset: string) => void;
  fetchFromUrl: () => void;
  addUrl: () => void;
  sortUrls: () => void;
  fetchAllUrls: () => void;
  setUrls: (urls: string[]) => void;
  isLoading: boolean;
  /** Worker 处理进度（大文本解析/排序/去重进行中非空） */
  progress: { processed: number; total: number; elapsed: number | null } | null;
  isProcessing: boolean;
  /** 分类索引是否可用（不可用时隐藏分类筛选控件） */
  categoryAvailable: boolean;
  categoryIndex: CategoryIndex;
  selectedCategories: ReadonlySet<CategoryKey>;
  onToggleCategory: (key: CategoryKey) => void;
  onClearCategories: () => void;
}

/** 统计项与彩色圆点语义映射，对齐原型 .input-panel 的 .stat-dot（block/allow/dns） */
export const STAT_ITEMS = [
  { key: 'blacklistCount' as const, labelKey: 'blacklistCount' as keyof Translation, dot: 'block' as const },
  { key: 'whitelistCount' as const, labelKey: 'whitelistCount' as keyof Translation, dot: 'allow' as const },
  { key: 'customDnsCount' as const, labelKey: 'customDnsCount' as keyof Translation, dot: 'dns' as const },
  { key: 'commentCount' as const, labelKey: 'commentCount' as keyof Translation, dot: null },
  { key: 'invalidCount' as const, labelKey: 'invalidCount' as keyof Translation, dot: null },
  { key: 'totalLines' as const, labelKey: 'totalLines' as keyof Translation, dot: null },
] as const;
