// src/utils/i18n.test.ts v3.9.0
import { describe, it, expect } from 'vitest';
import { getTranslation } from './i18n';

describe('getTranslation', () => {
  it('zh-cn 返回基准翻译', () => {
    const t = getTranslation('zh-cn');
    expect(t).toBeTruthy();
    expect(typeof t.inputTitle).toBe('string');
  });

  it('未知语言回退到 zh-cn 基准', () => {
    const zh = getTranslation('zh-cn');
    const unknown = getTranslation('not-a-lang');
    expect(unknown.inputTitle).toBe(zh.inputTitle);
  });

  it('已知语言深合并后不缺失嵌套键', () => {
    const en = getTranslation('en');
    // toast 为嵌套对象，深合并应保证其存在
    expect(en.toast).toBeTruthy();
    expect(typeof en.toast.loading).toBe('string');
  });
});




