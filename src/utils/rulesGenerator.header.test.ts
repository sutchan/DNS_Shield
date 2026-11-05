// src/utils/rulesGenerator.header.test.ts v3.15.0
// 导出头部注释契约（T-P1-10）：头部每一行（含 usage 说明）都必须带格式注释符。
// 历史缺陷：usage 行未加注释符，导出的 dnsmasq/unbound 配置会被判定为未知指令而
// 拒绝加载（路由器 DNS 失效），hosts/AdGuard 清单会混入非法条目，RPZ 区域文件语法报错。
import { describe, it, expect } from 'vitest';
import { generateHeader } from './rulesGenerator';
import { buildHeaders } from './formatGenerators';
import { HEADER_CONFIGS } from './headerConfigs';
import { getTranslation } from './i18n';
import { baseSettings } from '../test-utils/rulesTestKit';
import type { Translation } from '../types';

const t = getTranslation('zh-cn') as Translation;

describe('generateHeader · 头部注释前缀契约（T-P1-10）', () => {
  it('所有格式的头部非空行都以对应注释符开头', () => {
    (Object.keys(HEADER_CONFIGS) as Array<keyof typeof HEADER_CONFIGS>).forEach((format) => {
      const cfg = HEADER_CONFIGS[format];
      const header = generateHeader(format, 10, 2, '2026.11.05', baseSettings, t);

      header
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .forEach((line) => {
          expect(line.startsWith(`${cfg.commentChar} `)).toBe(true);
        });
    });
  });

  it('dnsmasq 头部的三条用法说明逐行加注释符（不再出现裸指令行）', () => {
    const header = generateHeader('dnsmasq', 10, 0, '2026.11.05', baseSettings, t);
    const lines = header.split('\n').filter((l) => l.trim().length > 0);

    expect(lines.some((l) => l.trim() === t.header.usage)).toBe(false);
    expect(lines.some((l) => l.includes(t.header.merlinUsage))).toBe(true);
    expect(lines.some((l) => l.includes(t.header.openwrtUsage))).toBe(true);
    lines.forEach((l) => expect(l.startsWith('# ')).toBe(true));
  });

  it('未开启头部注释时 buildHeaders 不产出任何头部内容', () => {
    const settings = { ...baseSettings, addHeader: false };
    const contents = buildHeaders(10, 0, '2026.11.05', settings, t);
    expect(contents.dnsmasq).toBe('');
    expect(contents.hosts).toBe('');
    expect(contents.adguard).toBe('');
  });

  it('未知格式返回空串（不抛错）', () => {
    expect(
      generateHeader('not-a-format' as never, 10, 0, '2026.11.05', baseSettings, t)
    ).toBe('');
  });
});
