// src/hooks/useRules.test.ts v3.13.1
// @vitest-environment jsdom
// 守护两条编排契约：
//   T-P1-06 惰性生成：只生成 currentFormat 一种格式的文本，不同步生成全部 12 种；
//   T-P1-05 单一解析源：直接复用上层传入的 parsedData，绝不二次调用 parseSource。
import { describe, it, expect, afterEach, vi } from 'vitest';
import { act, useState } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useRules } from './useRules';
import { getTranslation } from '../utils/i18n';
import { ALL_FORMATS } from '../types/formats';
import type { Settings, ParsedData, Translation } from '../types';
import { generateSingleFormat } from '../utils/formatGenerators.single';
import { generateRules } from '../utils/rulesGenerator';
import { parseSource } from '../utils/parser';
import { downloadOutput as downloadOutputUtil, copyToClipboard } from '../utils/fileUtils';

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
const parseSourceMock = vi.mocked(parseSource);
const downloadUtilMock = vi.mocked(downloadOutputUtil);
const copyClipboardMock = vi.mocked(copyToClipboard);

const t = getTranslation('zh-cn') as Translation;

const baseSettings: Settings = {
  projectName: 'DNS Shield',
  version: '3.13.1',
  ipv4: '127.0.0.1',
  ipv6: '::1',
  addHeader: true,
  blockIPv6: false,
  dedupDomains: true,
  removeWildcard: true,
  adguardIncludeWhitelist: true,
  showAllFormats: true,
  visibleFormats: [],
  dnsmasqFilename: 'dnsmasq.conf',
  hostsFilename: 'hosts.txt',
  adguardFilename: 'adguard.txt',
  whitelistFilename: 'whitelist.txt',
  unboundFilename: 'unbound.conf',
  piholeFilename: 'pihole.txt',
  domainsFilename: 'domains.txt',
  bindFilename: 'rpz.db',
  smartdnsFilename: 'smartdns.conf',
  mosdnsFilename: 'mosdns_domain_set.txt',
  clashFilename: 'clash_dns.yaml',
  corednsFilename: 'coredns_hosts.txt'
};

const parsedData: ParsedData = {
  domains: ['ad.example.com', 'ads.example.net'],
  whitelist: ['api.example.com'],
  customDns: [{ domain: 'cdn.example.com', ip: '10.0.0.1' }],
  regexRules: []
};

/** 稳定的 showToast：生产代码中它是 useCallback，若每次渲染新建会使
 *  runGenerate 引用抖动、effect 反复触发，掩盖真实的惰性生成次数。 */
const makeStableToast = () => {
  const fn = vi.fn();
  return fn;
};

afterEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = '';
});


/** renderHook 暴露的 ref 为只读 RefObject；测试需注入真实 DOM 节点，
 *  故按 useModalA11y.test.ts 的既有范式断言为可变引用。 */
const mutableRef = <T>(ref: { current: T }): { current: T } => ref as { current: T };

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

describe('useRules · 交互回调', () => {
  it('generateRules 按钮触发生成并提示 rulesGenerated', () => {
    const showToast = makeStableToast();
    const { result, unmount } = renderHook(() =>
      useRules(parsedData, baseSettings, t, showToast)
    );
    // 自动生成不提示
    expect(showToast).not.toHaveBeenCalled();

    act(() => {
      result.current.generateRules();
    });
    expect(generateSingleFormatMock).toHaveBeenCalledTimes(2);
    expect(showToast).toHaveBeenCalledWith('rulesGenerated');
    unmount();
  });

  it('生成后回传「生效后统计」，与导出口径一致', () => {
    const onEffectiveStats = vi.fn();
    const { unmount } = renderHook(() =>
      useRules(parsedData, baseSettings, t, makeStableToast(), onEffectiveStats)
    );
    // 2 个黑名单域名 + 1 条自定义 DNS = blacklistCount 3；白名单 1 条
    expect(onEffectiveStats).toHaveBeenCalledWith({
      blacklistCount: 3,
      whitelistCount: 1,
      validCount: 4
    });
    unmount();
  });

  it('不传 onEffectiveStats 时不影响生成（可选回调）', () => {
    const { result, unmount } = renderHook(() =>
      useRules(parsedData, baseSettings, t, makeStableToast())
    );
    expect(result.current.currentOutput).toContain('address=/ad.example.com/127.0.0.1');
    unmount();
  });

  it('downloadOutput 使用当前格式文本与对应文件名', () => {
    const showToast = makeStableToast();
    const { result, unmount } = renderHook(() =>
      useRules(parsedData, baseSettings, t, showToast)
    );

    act(() => {
      result.current.setFormat('adguard');
    });
    const expected = result.current.currentOutput;
    act(() => {
      result.current.downloadOutput();
    });

    expect(downloadUtilMock).toHaveBeenCalledWith(expected, 'adguard.txt');
    expect(showToast).toHaveBeenCalledWith('downloaded', { filename: 'adguard.txt' });
    unmount();
  });

  it('downloadOutput 的文件名随格式切换而切换', () => {
    const showToast = makeStableToast();
    const { result, unmount } = renderHook(() =>
      useRules(parsedData, baseSettings, t, showToast)
    );

    act(() => {
      result.current.setFormat('pihole');
    });
    act(() => {
      result.current.downloadOutput();
    });
    expect(downloadUtilMock).toHaveBeenLastCalledWith(
      expect.any(String),
      'pihole.txt'
    );
    unmount();
  });

  it('copyOutput 成功与失败分别提示 copied / copyFailed', async () => {
    const showToast = makeStableToast();
    copyClipboardMock.mockResolvedValueOnce(true);
    const { result, unmount } = renderHook(() =>
      useRules(parsedData, baseSettings, t, showToast)
    );

    await act(async () => {
      await result.current.copyOutput();
    });
    expect(copyClipboardMock).toHaveBeenCalledWith(result.current.currentOutput);
    expect(showToast).toHaveBeenCalledWith('copied');

    copyClipboardMock.mockResolvedValueOnce(false);
    await act(async () => {
      await result.current.copyOutput();
    });
    expect(showToast).toHaveBeenCalledWith('copyFailed');

    // 抛异常时同样降级为 copyFailed，不向外冒泡
    copyClipboardMock.mockRejectedValueOnce(new Error('boom'));
    await act(async () => {
      await result.current.copyOutput();
    });
    expect(showToast).toHaveBeenCalledWith('copyFailed');
    unmount();
  });

  it('syncOutputScroll 同步行号槽位滚动位置', () => {
    const { result, unmount } = renderHook(() =>
      useRules(parsedData, baseSettings, t, makeStableToast())
    );

    const preview = document.createElement('div');
    const lineNumbers = document.createElement('div');
    document.body.append(preview, lineNumbers);
    preview.scrollTop = 120;
    mutableRef(result.current.outputPreviewRef).current = preview;
    mutableRef(result.current.outputLineNumbersRef).current = lineNumbers;

    act(() => {
      result.current.syncOutputScroll();
    });
    expect(lineNumbers.scrollTop).toBe(120);
    unmount();
  });

  it('行号槽位随输出内容更新（generateLineNumbers 契约）', () => {
    const { result, unmount } = renderHook(() =>
      useRules(parsedData, baseSettings, t, makeStableToast())
    );

    const lineNumbers = document.createElement('div');
    document.body.appendChild(lineNumbers);
    // 挂载时 ref 尚未挂载，赋 ref 后由 currentOutput 变化触发写入
    mutableRef(result.current.outputLineNumbersRef).current = lineNumbers;
    act(() => {
      result.current.setFormat('hosts');
    });
    const lineCount = result.current.currentOutput.split('\n').length;
    expect(lineNumbers.textContent?.split('\n').length).toBe(lineCount);
    unmount();
  });
});
