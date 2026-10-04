// src/utils/analytics.test.ts v3.10.3
import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  GA_MEASUREMENT_ID_ENV,
  buildGtagScriptUrl,
  buildGtagSnippet,
  isValidGaMeasurementId,
  normalizeGaMeasurementId,
  readGaMeasurementIdFromEnv,
  resolveGaMeasurementId,
} from './analytics';

// 测试夹具使用虚构 ID（形如 GA4 但非真实属性），真实衡量 ID 只允许存在于部署环境变量中
const VALID_ID = 'G-TESTID0001';
const ORIGINAL_ENV = process.env[GA_MEASUREMENT_ID_ENV];

afterEach(() => {
  if (ORIGINAL_ENV === undefined) delete process.env[GA_MEASUREMENT_ID_ENV];
  else process.env[GA_MEASUREMENT_ID_ENV] = ORIGINAL_ENV;
  vi.restoreAllMocks();
});

describe('normalizeGaMeasurementId', () => {
  it('trims surrounding whitespace and uppercases', () => {
    expect(normalizeGaMeasurementId('  g-abcdefghij  ')).toBe('G-ABCDEFGHIJ');
  });
});

describe('isValidGaMeasurementId', () => {
  it('accepts well-formed GA4 measurement IDs', () => {
    expect(isValidGaMeasurementId(VALID_ID)).toBe(true);
    expect(isValidGaMeasurementId('G-ABCD')).toBe(true);
    expect(isValidGaMeasurementId(' g-testid0001 ')).toBe(true);
  });

  it('rejects missing, malformed, and wrong-prefix values', () => {
    expect(isValidGaMeasurementId(undefined)).toBe(false);
    expect(isValidGaMeasurementId(null)).toBe(false);
    expect(isValidGaMeasurementId('')).toBe(false);
    expect(isValidGaMeasurementId('   ')).toBe(false);
    expect(isValidGaMeasurementId('UA-12345-1')).toBe(false); // 旧版 Universal Analytics
    expect(isValidGaMeasurementId('ABCDEFGHIJ')).toBe(false); // 缺 G- 前缀
    expect(isValidGaMeasurementId('G-')).toBe(false); // 前缀后为空
    expect(isValidGaMeasurementId('G-AB')).toBe(false); // 主体过短
    expect(isValidGaMeasurementId('G-ABC;alert(1)')).toBe(false); // 含非法字符
    expect(isValidGaMeasurementId("G-ABC');alert(1)//")).toBe(false); // 注入尝试
  });
});

describe('resolveGaMeasurementId', () => {
  it('disables analytics when the env value is absent or blank', () => {
    for (const raw of [undefined, null, '', '   ']) {
      const result = resolveGaMeasurementId(raw);
      expect(result.enabled).toBe(false);
      expect(result.measurementId).toBeNull();
      expect(result.reason).toBe('missing');
    }
  });

  it('disables analytics and reports diagnostics when the value is malformed', () => {
    const result = resolveGaMeasurementId('UA-12345-1');
    expect(result.enabled).toBe(false);
    expect(result.measurementId).toBeNull();
    expect(result.reason).toBe('invalid');
    expect(result.detail).toContain('G-');
  });

  it('never echoes the raw value back in diagnostics', () => {
    const result = resolveGaMeasurementId('G-SECRET;drop()');
    expect(JSON.stringify(result)).not.toContain('drop()');
  });

  it('enables analytics with a normalized ID when configured correctly', () => {
    const result = resolveGaMeasurementId(' g-testid0001 ');
    expect(result).toEqual({ enabled: true, measurementId: VALID_ID, reason: 'env' });
  });
});

describe('readGaMeasurementIdFromEnv', () => {
  it('reads the measurement ID from process.env', () => {
    process.env[GA_MEASUREMENT_ID_ENV] = VALID_ID;
    expect(readGaMeasurementIdFromEnv()).toEqual({
      enabled: true,
      measurementId: VALID_ID,
      reason: 'env',
    });
  });

  it('falls back to disabled when the env variable is missing', () => {
    delete process.env[GA_MEASUREMENT_ID_ENV];
    expect(readGaMeasurementIdFromEnv().enabled).toBe(false);
  });

  it('falls back to disabled when the env variable is invalid', () => {
    process.env[GA_MEASUREMENT_ID_ENV] = 'not-a-ga-id';
    const result = readGaMeasurementIdFromEnv();
    expect(result.enabled).toBe(false);
    expect(result.reason).toBe('invalid');
  });
});

describe('gtag script builders', () => {
  it('builds the loader URL carrying the encoded measurement ID', () => {
    expect(buildGtagScriptUrl(VALID_ID)).toBe(
      `https://www.googletagmanager.com/gtag/js?id=${VALID_ID}`
    );
  });

  it('builds an init snippet that boots dataLayer and configures the ID', () => {
    const snippet = buildGtagSnippet(VALID_ID);
    expect(snippet).toContain('window.dataLayer=window.dataLayer||[]');
    expect(snippet).toContain("gtag('js',new Date())");
    expect(snippet).toContain(`gtag('config',"${VALID_ID}")`);
  });

  it('escapes quotes so a tampered ID cannot break out of the inline script', () => {
    const snippet = buildGtagSnippet('G-ABC");alert(1);//');
    // 引号被转义为 \"，攻击载荷整体落在字符串字面量内，无法闭合字符串执行脚本
    expect(snippet).toContain('gtag(\'config\',"G-ABC\\");alert(1);//")');
    expect(snippet.endsWith('//");')).toBe(true);
  });
});
