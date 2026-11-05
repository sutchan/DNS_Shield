// src/hooks/useLineNumbers.test.ts v3.15.0
// @vitest-environment jsdom
// 行号槽位生成契约（T-P2-01）：按文本行数输出连续行号；行数未变化时跳过重绘，
// 避免在超长文本中编辑时每次按键都重新生成数十万字符。
import { describe, it, expect, beforeEach } from 'vitest';
import { generateLineNumbers } from './useLineNumbers';

let slot: HTMLDivElement;

beforeEach(() => {
  slot = document.createElement('div');
  document.body.appendChild(slot);
});

describe('generateLineNumbers', () => {
  it('按行数输出连续行号', () => {
    const ref = { current: slot };
    generateLineNumbers('a.example.com\nb.example.com\nc.example.com', ref);
    expect(slot.textContent).toBe('1\n2\n3');
  });

  it('空文本仍显示 1 行行号（与既有行为一致）', () => {
    const ref = { current: slot };
    generateLineNumbers('', ref);
    expect(slot.textContent).toBe('1');
  });

  it('结尾换行按行数计（a\\nb\\n → 3 行）', () => {
    const ref = { current: slot };
    generateLineNumbers('a\nb\n', ref);
    expect(slot.textContent).toBe('1\n2\n3');
  });

  it('行数未变化时跳过重绘（避免重复大字符串分配）', () => {
    const ref = { current: slot };
    generateLineNumbers('a\nb', ref);
    expect(slot.textContent).toBe('1\n2');

    // 模拟外部改写槽位后再次以相同行数渲染：应保持不变
    slot.textContent = 'sentinel';
    generateLineNumbers('c\nd', ref);
    expect(slot.textContent).toBe('sentinel');
  });

  it('行数变化时重新渲染', () => {
    const ref = { current: slot };
    generateLineNumbers('a\nb', ref);
    generateLineNumbers('a\nb\nc', ref);
    expect(slot.textContent).toBe('1\n2\n3');
  });

  it('ref 无挂载节点时不抛错', () => {
    const ref = { current: null };
    expect(() => generateLineNumbers('a\nb', ref)).not.toThrow();
  });
});
