// src/config/languages.test.ts v3.22.0
// T-AUD-L03 / T-AUD-L04：语言白名单单一来源 + JSON-LD 转义回归。
import { describe, it, expect } from 'vitest';
import { LANGUAGE_CODES, LANGUAGE_CODE_PATTERN, isSupportedLanguageCode } from './languages';
import { serializeJsonLd } from './jsonld';
import { supportedLanguages } from '../utils/i18n';

describe('语言代码白名单', () => {
  it('与 i18n supportedLanguages 完全一致且顺序相同', () => {
    expect([...LANGUAGE_CODES]).toEqual(supportedLanguages.map((language) => language.code));
  });

  it('白名单正则只接受支持的语言', () => {
    const pattern = new RegExp(LANGUAGE_CODE_PATTERN);
    expect(pattern.test('zh-cn')).toBe(true);
    expect(pattern.test('zh-CN')).toBe(false);
    expect(pattern.test('xx-yy')).toBe(false);
    expect(isSupportedLanguageCode('en')).toBe(true);
    expect(isSupportedLanguageCode('xx')).toBe(false);
  });
});

describe('serializeJsonLd', () => {
  it('转义 < 避免 </script> 提前闭合内联脚本', () => {
    const html = serializeJsonLd({ name: '</script><img src=x onerror=alert(1)>' });
    expect(html).not.toContain('</script>');
    expect(html).not.toContain('<img');
    expect(html).toContain('\\u003c/script>');
    expect(JSON.parse(html).name).toBe('</script><img src=x onerror=alert(1)>');
  });
});
