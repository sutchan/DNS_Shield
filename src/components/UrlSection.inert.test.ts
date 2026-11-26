// @vitest-environment jsdom
// v3.20.2 回归：React 18 下 inert 必须以字符串传递，布尔 true 会触发
// "Received `true` for a non-boolean attribute" 运行时告警。
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import React from 'react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

const renderDiv = (inert: string | undefined) => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => {
    root.render(React.createElement('div', { id: 'target', inert }, 'x'));
  });
  return { host, unmount: () => { act(() => root.unmount()); host.remove(); } };
};

describe('React 18 inert 属性兼容写法', () => {
  afterEach(() => { vi.restoreAllMocks(); document.body.innerHTML = ''; });

  it('传空字符串不触发非布尔属性告警，且 DOM 上 inert 存在', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { host, unmount } = renderDiv('');
    const target = host.querySelector('#target')!;
    expect(target.hasAttribute('inert')).toBe(true);
    expect(spy.mock.calls.flat().join(' ')).not.toMatch(/non-boolean attribute.*inert|inert.*non-boolean/);
    unmount();
  });

  it('传 undefined 不渲染 inert 属性且不告警', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { host, unmount } = renderDiv(undefined);
    expect(host.querySelector('#target')!.hasAttribute('inert')).toBe(false);
    expect(spy).not.toHaveBeenCalled();
    unmount();
  });

  it('反例：布尔 true 确实触发告警（锁定根因）', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    act(() => {
      // React 18 运行期对 boolean inert 告警（类型定义已放宽，故无需 ts-expect-error）
      root.render(React.createElement('div', { inert: true }, 'x'));
    });
    expect(spy.mock.calls.flat().join(' ')).toMatch(/non-boolean attribute/);
    act(() => root.unmount());
    host.remove();
  });
});
