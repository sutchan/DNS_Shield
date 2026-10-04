// src/utils/regexRules.ts v3.11.0
// 正则规则的双向语法转换。
// 技术事实（避免生成无法生效的规则）：
//   - AdGuard 以 /pattern/ 表达正则过滤，@@/pattern/ 为例外（白名单）；
//   - Pi-hole FTL（v5.7+）以 regex:pattern 表达正则阻断；
//   - dnsmasq 本身不支持正则过滤（仅精确 / 后缀 / 通配），
//     故不提供 dnsmasq 正则输出，避免生成无法生效的配置。

/** 正则规则的源语法 */
export type RegexSource = 'adguard' | 'pihole';

/** 已识别的正则规则 */
export interface RegexRule {
  /** 正则表达式本体（不含分隔符与前缀） */
  pattern: string;
  source: RegexSource;
  /** 是否为白名单例外 */
  isException: boolean;
  originalLine: string;
}

const ADGUARD_PATTERN = /^\/(.+)\/$/;
const PIHOLE_PATTERN = /^regex:(.+)$/i;

/** 解析单行是否为正则规则；非正则行返回 null */
export const parseRegexRule = (line: string): RegexRule | null => {
  const content = line.trim();
  if (!content) return null;

  const isException = content.startsWith('@@');
  const body = isException ? content.slice(2).trim() : content;

  const adguard = body.match(ADGUARD_PATTERN);
  if (adguard) {
    return { pattern: adguard[1], source: 'adguard', isException, originalLine: line };
  }

  const pihole = body.match(PIHOLE_PATTERN);
  if (pihole) {
    return { pattern: pihole[1], source: 'pihole', isException, originalLine: line };
  }

  return null;
};

/** 转为 AdGuard 正则语法（例外加 @@ 前缀） */
export const toAdGuardRegex = (pattern: string, isException = false): string =>
  (isException ? '@@' : '') + '/' + pattern + '/';

/** 转为 Pi-hole FTL regex 语法（需 Pi-hole v5.7+ 且启用 regex 阻断） */
export const toPiHoleRegex = (pattern: string): string => 'regex:' + pattern;

/**
 * 双向转换：把已解析的正则规则输出为目标语法。
 * 例外语义仅 AdGuard 原生支持，Pi-hole 侧以注释标注，不生成无效规则。
 */
export const convertRegexRule = (rule: RegexRule, target: RegexSource): string => {
  if (target === 'adguard') {
    return toAdGuardRegex(rule.pattern, rule.isException);
  }
  return rule.isException ? '# ' + toPiHoleRegex(rule.pattern) : toPiHoleRegex(rule.pattern);
};

/** 提取文本中全部正则规则（跳过注释与空行） */
export const extractRegexRules = (text: string): RegexRule[] => {
  const rules: RegexRule[] = [];
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('!')) continue;
    const rule = parseRegexRule(trimmed);
    if (rule) rules.push(rule);
  }
  return rules;
};
