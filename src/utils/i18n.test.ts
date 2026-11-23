// src/utils/i18n.test.ts v3.19.1
import { describe, it, expect } from 'vitest';
import { getTranslation, loadTranslation, isLanguageLoaded, supportedLanguages } from './i18n';

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

  it('未加载语言同步回退基准（v3.19.1 按需加载契约）', () => {
    // 任一非基准语言在 loadTranslation 之前，同步 API 必须回退 zh-cn 而非抛错
    const zh = getTranslation('zh-cn');
    const before = getTranslation('fi');
    expect(before.inputTitle).toBe(zh.inputTitle);
  });

  it('异步加载后深合并生效且嵌套键不缺失', async () => {
    await loadTranslation('en');
    const en = getTranslation('en');
    expect(typeof en.toast.loading).toBe('string');
    expect(en.toast.loading).not.toBe(getTranslation('zh-cn').toast.loading);
  });

  it('loadTranslation 重复调用返回同一缓存实例', async () => {
    const first = await loadTranslation('vi');
    const second = await loadTranslation('vi');
    expect(second).toBe(first);
  });

  it('未知码 loadTranslation 安全回退基准', async () => {
    const fallback = await loadTranslation('not-a-lang');
    expect(fallback.inputTitle).toBe(getTranslation('zh-cn').inputTitle);
  });

  // v3.20.1：加载失败时文档语言须回退简中，用 isLanguageLoaded 判定
  it('isLanguageLoaded 区分已加载与加载失败的语言', async () => {
    expect(isLanguageLoaded('zh-cn')).toBe(true);
    // 未知码永不进入缓存
    expect(isLanguageLoaded('not-a-lang')).toBe(false);
    // 已加载语言（前面用例已加载 en）返回 true
    expect(isLanguageLoaded('en')).toBe(true);
    // 加载未知码后仍为 false（回退基准不写入缓存）
    await loadTranslation('not-a-lang');
    expect(isLanguageLoaded('not-a-lang')).toBe(false);
  });

  it('16 语全部可异步加载且 toast 嵌套键完整', async () => {
    for (const lang of supportedLanguages) {
      const loaded = await loadTranslation(lang.code);
      expect(loaded.toast, `${lang.code} 缺少 toast 表`).toBeTruthy();
      expect(typeof loaded.toast.loading).toBe('string');
    }
  });
});
