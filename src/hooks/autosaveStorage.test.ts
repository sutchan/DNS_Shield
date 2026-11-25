// src/hooks/autosaveStorage.test.ts v3.22.0
// @vitest-environment jsdom
// 自动保存存储层契约：合法草稿校验（含 T-AUD-L05 纯空白草稿拒绝）。
import { describe, it, expect } from 'vitest';
import { isValidAutosave, AUTOSAVE_MAX_LENGTH } from './autosaveStorage';

describe('isValidAutosave', () => {
  it('接受非空且长度在上限内的字符串', () => {
    expect(isValidAutosave('a.example.com')).toBe(true);
    expect(isValidAutosave('a'.repeat(AUTOSAVE_MAX_LENGTH))).toBe(true);
  });

  it('拒绝非字符串、空串与超长内容', () => {
    expect(isValidAutosave(null)).toBe(false);
    expect(isValidAutosave(123)).toBe(false);
    expect(isValidAutosave('')).toBe(false);
    expect(isValidAutosave('a'.repeat(AUTOSAVE_MAX_LENGTH + 1))).toBe(false);
  });

  // T-AUD-L05：纯空白草稿无恢复价值，且会在异步恢复时覆盖用户输入
  it('拒绝纯空白草稿（T-AUD-L05）', () => {
    expect(isValidAutosave('   ')).toBe(false);
    expect(isValidAutosave('\n\t  \n')).toBe(false);
  });
});
