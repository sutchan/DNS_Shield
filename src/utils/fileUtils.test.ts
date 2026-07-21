// src/utils/fileUtils.test.ts v3.6.1
import { describe, it, expect } from 'vitest';
import { isValidHttpUrl } from './fileUtils';

describe('isValidHttpUrl', () => {
  it('接受 http/https', () => {
    expect(isValidHttpUrl('http://example.com')).toBe(true);
    expect(isValidHttpUrl('https://example.com/list.txt')).toBe(true);
  });

  it('拒绝非 http 协议与畸形输入', () => {
    expect(isValidHttpUrl('ftp://example.com')).toBe(false);
    expect(isValidHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isValidHttpUrl('not a url')).toBe(false);
    expect(isValidHttpUrl('')).toBe(false);
  });

  it('拒绝超长 URL', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(2100);
    expect(isValidHttpUrl(longUrl)).toBe(false);
  });
});
