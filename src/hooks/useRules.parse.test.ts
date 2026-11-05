// src/hooks/useRules.parse.test.ts v3.15.0
// @vitest-environment jsdom
// T-P1-05 单一解析源契约：useRules 直接复用上层传入的 parsedData，
// 绝不二次调用 parseSource（回归守卫）。
// （原 useRules.test.ts 按关注点拆分，本文件承接「单一解析源」分组）
import { describe, it, expect, afterEach, vi } from 'vitest';
import { act } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useRules } from './useRules';
import { generateSingleFormat } from '../utils/formatGenerators.single';
import { parseSource } from '../utils/parser';
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
const parseSourceMock = vi.mocked(parseSource);

afterEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = '';
});


describe('useRules · T-P1-05 单一解析源', () => {
  it('整个生命周期内绝不调用 parseSource 二次解析', () => {
    const showToast = makeStableToast();
    const { result, unmount } = renderHook(() =>
      useRules(parsedData, baseSettings, t, showToast)
    );

    // 挂载（自动生成）
    act(() => {
      result.current.generateRules();
    });
    act(() => {
      result.current.setFormat('hosts');
    });
    act(() => {
      result.current.setFormat('adguard');
    });

    // 关键断言：解析只发生在 useDomainData，useRules 复用传入的 parsedData
    expect(parseSourceMock).not.toHaveBeenCalled();
    // 传入的 domains/whitelist 数组被原样透传给生成器（未做二次加工/再解析）
    expect(generateSingleFormatMock.mock.calls[0][1]).toBe(parsedData.domains);
    expect(generateSingleFormatMock.mock.calls[0][2]).toBe(parsedData.whitelist);
    unmount();
  });
});
