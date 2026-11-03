// src/hooks/useHomeController.types.ts v3.13.6
// useHomeController 的返回契约类型（从 useHomeController.ts 抽离以控制主文件行数）。
// 通过各子钩子的 ReturnType 派生，避免重复声明且随子钩子变更自动同步。
import { useTheme } from './useTheme';
import { useLanguage } from './useLanguage';
import { useDomainData } from './useDomainData';
import { useRules } from './useRules';
import { useCategoryFilter } from './useCategoryFilter';
import { useUrlManager } from './useUrlManager';
import { useSettings } from './useSettings';
import type { Stats, ParsedData } from '../types';
import type { CategoryIndex, CategoryKey } from '../utils/domainCategory';
import type { RuleProgress } from './useRuleWorker';

type ThemePart = ReturnType<typeof useTheme>;
type LangPart = ReturnType<typeof useLanguage>;
type DomainPart = ReturnType<typeof useDomainData>;
type RulesPart = ReturnType<typeof useRules>;
type CatPart = ReturnType<typeof useCategoryFilter>;
type UrlPart = ReturnType<typeof useUrlManager>;
type SettingsPart = ReturnType<typeof useSettings>;

export interface UseHomeControllerReturn {
  // 主题（useTheme）
  theme: ThemePart['theme'];
  toggleTheme: ThemePart['toggleTheme'];
  // 语言（useLanguage）
  currentLang: LangPart['currentLang'];
  supportedLanguages: LangPart['supportedLanguages'];
  t: LangPart['t'];
  switchLang: LangPart['switchLang'];
  // 域名数据（useDomainData）
  sourceInput: DomainPart['sourceInput'];
  parsedData: ParsedData;
  stats: Stats;
  setStats: DomainPart['setStats'];
  lineNumbersRef: DomainPart['lineNumbersRef'];
  clearAll: DomainPart['clearAll'];
  sortDomains: DomainPart['sortDomains'];
  dedupeDomains: DomainPart['dedupeDomains'];
  handleSourceInput: DomainPart['handleSourceInput'];
  setSourceInput: DomainPart['setSourceInput'];
  parseSourceData: DomainPart['parseSourceData'];
  progress: RuleProgress | null;
  isProcessing: boolean;
  showToast: (key: string, params?: Record<string, string | number>) => void;
  // 设置（useSettings）
  settings: SettingsPart['settings'];
  setSettings: SettingsPart['setSettings'];
  // 规则生成（useRules，输入为分类过滤后数据）
  currentOutput: RulesPart['currentOutput'];
  currentFormat: RulesPart['currentFormat'];
  categoryIndex: CategoryIndex;
  categoryAvailable: boolean;
  selectedCategories: ReadonlySet<CategoryKey>;
  onToggleCategory: CatPart['toggle'];
  onClearCategories: CatPart['clear'];
  outputPreviewRef: RulesPart['outputPreviewRef'];
  outputLineNumbersRef: RulesPart['outputLineNumbersRef'];
  generateRules: RulesPart['generateRules'];
  downloadOutput: RulesPart['downloadOutput'];
  copyOutput: RulesPart['copyOutput'];
  setFormat: RulesPart['setFormat'];
  syncOutputScroll: RulesPart['syncOutputScroll'];
  // URL 管理（useUrlManager）
  urls: UrlPart['urls'];
  isLoading: UrlPart['isLoading'];
  activePreset: UrlPart['activePreset'];
  urlInput: UrlPart['urlInput'];
  setUrlInput: UrlPart['setUrlInput'];
  loadPreset: UrlPart['loadPreset'];
  fetchFromUrl: UrlPart['fetchFromUrl'];
  addUrl: UrlPart['addUrl'];
  sortUrls: UrlPart['sortUrls'];
  fetchAllUrls: UrlPart['fetchAllUrls'];
  setUrls: UrlPart['setUrls'];
  // 本地 UI 状态（useHomeController 内联）
  isUrlSectionCollapsed: boolean;
  setIsUrlSectionCollapsed: (value: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (value: boolean) => void;
  isGuideOpen: boolean;
  setIsGuideOpen: (value: boolean) => void;
  openGuide: () => void;
  sourceTextareaRef: React.RefObject<HTMLTextAreaElement>;
  syncScroll: () => void;
  toggleSection: (section: string) => void;
  openSettings: () => void;
  closeSettings: () => void;
  scrollToInput: () => void;
}
