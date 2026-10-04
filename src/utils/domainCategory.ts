// src/utils/domainCategory.ts v3.11.0
// 域名分类与标签过滤：分类完全依据「该域名真实出现在哪些上游规则源中」推导，
// 不引入任何虚构类别或估算数据。上游清单见 scripts/aggregate-upstream.mjs。
// 每个上游源对应一个可解释的语义分类，用户可据此打标、筛选与选择性导出。

/** 分类键：与上游源一一对应 */
export type CategoryKey = 'adguard' | 'easylist' | 'neohosts' | 'stevenblack' | 'youslist';

/** 分类定义（labelKey 为 i18n 键，由 UI 层翻译） */
export interface CategoryDefinition {
  key: CategoryKey;
  labelKey: string;
  /** 语义说明（对应上游源真实定位） */
  note: string;
}

/** 全部可选分类（顺序稳定） */
export const CATEGORY_DEFINITIONS: readonly CategoryDefinition[] = [
  { key: 'adguard', labelKey: 'category.adguard', note: 'AdGuard DNS 过滤列表' },
  { key: 'easylist', labelKey: 'category.easylist', note: 'EasyList 广告与跟踪规则' },
  { key: 'neohosts', labelKey: 'category.neohosts', note: 'neoHosts 广告域名库' },
  { key: 'stevenblack', labelKey: 'category.stevenblack', note: 'StevenBlack 统一广告 hosts' },
  { key: 'youslist', labelKey: 'category.youslist', note: 'YouSList 主机与广告列表' }
] as const;

/** 分类键集合 */
export type CategoryKeySet = ReadonlySet<CategoryKey>;

/** 域名 → 命中的分类集合 */
export type CategoryIndex = ReadonlyMap<string, CategoryKeySet>;

/** 校验字符串是否为合法分类键 */
export const isCategoryKey = (value: string): value is CategoryKey =>
  CATEGORY_DEFINITIONS.some((def) => def.key === value);

/** 归一化域名（小写、去协议与路径、去通配与前导点） */
export const normalizeCategoryDomain = (domain: string): string => {
  let value = domain.trim().toLowerCase();
  const schemeIndex = value.indexOf('://');
  if (schemeIndex >= 0) {
    value = value.slice(schemeIndex + 3);
  }
  return value.split('/')[0].split(':')[0].replace(/^\*\./, '').replace(/^\.+/, '');
};

/** 解析分类索引文本：每行格式为 "<source> <domain>"（首个空白分隔） */
export const parseCategoryIndex = (text: string): Map<string, Set<CategoryKey>> => {
  const index = new Map<string, Set<CategoryKey>>();
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith('!')) continue;
    const separator = line.search(/\s/);
    if (separator <= 0) continue;
    const source = line.slice(0, separator);
    const domain = normalizeCategoryDomain(line.slice(separator + 1));
    if (!domain || !isCategoryKey(source)) continue;
    const bucket = index.get(domain);
    if (bucket) {
      bucket.add(source);
    } else {
      index.set(domain, new Set<CategoryKey>([source]));
    }
  }
  return index;
};

/** 查询单个域名命中的分类；未收录返回空集合 */
export const getCategoriesForDomain = (
  index: CategoryIndex,
  domain: string
): ReadonlySet<CategoryKey> => index.get(normalizeCategoryDomain(domain)) ?? new Set<CategoryKey>();

/**
 * 按分类筛选域名：
 *   - categories 为空时返回全部（保持原顺序）；
 *   - 否则仅保留命中任一所选分类的域名。
 */
export const filterDomainsByCategory = (
  domains: string[],
  index: CategoryIndex,
  categories: ReadonlySet<CategoryKey>
): string[] => {
  if (categories.size === 0) return [...domains];
  return domains.filter((domain) => {
    const hit = index.get(normalizeCategoryDomain(domain));
    if (!hit) return false;
    for (const key of hit) {
      if (categories.has(key)) return true;
    }
    return false;
  });
};

/** 统计各分类命中的域名数（供 UI 展示分布，数值来自真实索引） */
export const countByCategory = (index: CategoryIndex): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const def of CATEGORY_DEFINITIONS) {
    counts[def.key] = 0;
  }
  for (const hits of index.values()) {
    for (const key of hits) {
      counts[key] = (counts[key] ?? 0) + 1;
    }
  }
  return counts;
};
