// src/hooks/useRules.generate.test.ts v3.15.0
// @vitest-environment jsdom
// T-P1-06 惰性生成契约：只生成 currentFormat 一种格式的文本，不同步生成全部 12 种；
// 内容/格式变化时自动重新生成，确保预览始终反映当前数据。
// （原 useRules.test.ts 按关注点拆分，本文件承接「惰性生成」分组）
import { describe, it, expect, afterEach, vi } from 'vitest';
import { act, useState } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useRules } from './useRules';
import { ALL_FORMATS } from '../types/formats';
import type { ParsedData } from '../types';
import { generateSingleFormat } from '../utils/formatGenerators.single';
import { generateRules } from '../utils/rulesGenerator';
import { t, baseSettings, parsedData, makeStableToast } from '../test-utils/rulesTestKit';

// generateSingleFormat / generateRules 保留真实实现（spy 透传），
// 使断言既校验调用契约又不丢失输出语义校验。
vi.mock('../utils/formatGenerators.single', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/formatGenerators.single')>();
  return { ...actual, generateSingleFormat: vi.fn(actual.generateSingleFormat) };
});

vi.mock('../utils/rulesGenerator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/rulesGenerator')>();
  return { ...actual, generateRules: vi.fn(actual.generateRules) };
});

// parser 在 useRules 中本不应被触碰（T-P1-05）；此处注册间谍作为回归守卫：
// 一旦有人把二次解析塞进 useRules，本文件立即失败。
vi.mock('../utils/parser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/parser')>();
  return { ...actual, parseSource: vi.fn(actual.parseSource) };
});

// download/copy 属副作用（Blob、剪贴板），仅断言调用契约，故替换为纯间谍
vi.mock('../utils/fileUtils', () => ({
  downloadOutput: vi.fn(),
  copyToClipboard: vi.fn()
}));

const generateSingleFormatMock = vi.mocked(generateSingleFormat);
const generateRulesMock = vi.mocked(generateRules);

afterEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = '';
});


describe('useRules · T-P1-06 惰性生成', () => {
  it('挂载后只生成当前格式一种，不调用全量 generateRules', () => {
    const showToast = makeStableToast();
    const { result, unmount } = renderHook(() =>
      useRules(parsedData, baseSettings, t, showToast)
    );

    expect(result.current.currentFormat).toBe('dnsmasq');
    // 关键断言：generateSingleFormat 仅被调用 1 次（而非 12 次）
    expect(generateSingleFormatMock).toHaveBeenCalledTimes(1);
    expect(generateSingleFormatMock.mock.calls[0][0]).toBe('dnsmasq');
    // 全量 12 格式生成器完全未被触碰
    expect(generateRulesMock).not.toHaveBeenCalled();

    // 输出的正是 generateSingleFormat('dnsmasq', ...) 的结果
    expect(result.current.currentOutput).toBe(
      generateSingleFormat('dnsmasq', parsedData.domains, parsedData.whitelist, parsedData.customDns, baseSettings, t, [])
    );
    unmount();
  });

  it('每次生成的首参恒为当时的 currentFormat，累计不等于 12 种格式', () => {
    const showToast = makeStableToast();
    const { result, unmount } = renderHook(() =>
      useRules(parsedData, baseSettings, t, showToast)
    );

    // 依次切换 3 种格式：每次恰好新增 1 次「当前格式」生成
    for (const format of ['adguard', 'hosts', 'whitelist'] as const) {
      act(() => {
        result.current.setFormat(format);
      });
    }

    expect(result.current.currentFormat).toBe('whitelist');
    // 挂载 1 次 + 切换 3 次 = 4 次
    expect(generateSingleFormatMock).toHaveBeenCalledTimes(4);
    // 逐次调用的格式序列严格等于切换序列 —— 没有任何"顺手多生成"的格式
    expect(generateSingleFormatMock.mock.calls.map((c) => c[0])).toEqual([
      'dnsmasq',
      'adguard',
      'hosts',
      'whitelist'
    ]);
    // 关键断言：生成过的格式种类数远小于 12，证明未同步全量生成
    const generatedFormats = new Set(generateSingleFormatMock.mock.calls.map((c) => c[0]));
    expect(generatedFormats.size).toBe(4);
    expect(generatedFormats.size).toBeLessThan(ALL_FORMATS.length);
    expect(generateRulesMock).not.toHaveBeenCalled();

    unmount();
  });

  it('currentOutput 随 currentFormat 切换而更新为对应格式文本', () => {
    const showToast = makeStableToast();
    const { result, unmount } = renderHook(() =>
      useRules(parsedData, baseSettings, t, showToast)
    );

    expect(result.current.currentOutput).toContain('address=/ad.example.com/127.0.0.1');

    act(() => {
      result.current.setFormat('hosts');
    });
    expect(result.current.currentOutput).toContain('127.0.0.1 ad.example.com');
    expect(result.current.currentOutput).not.toContain('address=/ad.example.com/');

    act(() => {
      result.current.setFormat('adguard');
    });
    expect(result.current.currentOutput).toContain('||ad.example.com^');
    expect(result.current.currentOutput).not.toContain('127.0.0.1 ad.example.com');

    unmount();
  });

  it('parsedData 内容变化时自动重新生成（预览始终反映当前数据）', () => {
    const showToast = makeStableToast();
    const { result, unmount } = renderHook(() => {
      const [data, setData] = useState<ParsedData>(parsedData);
      return { ...useRules(data, baseSettings, t, showToast), setData };
    });
    const before = result.current.currentOutput;

    act(() => {
      result.current.setData({ ...parsedData, domains: ['new.example.com'] });
    });

    expect(generateSingleFormatMock).toHaveBeenCalledTimes(2);
    expect(result.current.currentOutput).toContain('new.example.com');
    expect(result.current.currentOutput).not.toContain('ad.example.com');
    expect(result.current.currentOutput).not.toBe(before);
    unmount();
  });

  it('无可生成内容时清空输出且不触发生成', () => {
    const showToast = makeStableToast();
    const empty: ParsedData = { domains: [], whitelist: [], customDns: [], regexRules: [] };
    const { result, unmount } = renderHook(() =>
      useRules(empty, baseSettings, t, showToast)
    );
    expect(result.current.currentOutput).toBe('');
    expect(generateSingleFormatMock).not.toHaveBeenCalled();
    unmount();
  });

  it('仅含正则规则时也视为可生成内容', () => {
    const showToast = makeStableToast();
    const regexOnly: ParsedData = {
      domains: [],
      whitelist: [],
      customDns: [],
      regexRules: [{ pattern: '/ads\\./', source: 'adguard', isException: false, originalLine: '/ads\\./' }]
    };
    const { result, unmount } = renderHook(() =>
      useRules(regexOnly, baseSettings, t, showToast)
    );
    expect(generateSingleFormatMock).toHaveBeenCalledTimes(1);
    expect(result.current.currentOutput.length).toBeGreaterThan(0);
    unmount();
  });
});
