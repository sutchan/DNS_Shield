// src/test-utils/renderHook.ts v3.12.0
// 极简 renderHook：仅依赖 react-dom/client 与 React 18.3 内置的 act()。
// 为什么不用 @testing-library/react：pnpm 隔离 node_modules 下它解析不到 peer `react`
// （Cannot find module 'react'），而引入它只为 hooks 测试并不划算。
// 仅测试用：src/test-utils/ 已在 vitest coverage.exclude 中排除，不计入覆盖率。
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

export interface RenderHookResult<T> {
  /** result.current 指向最近一次渲染的钩子返回值 */
  result: { current: T };
  /** 卸载并清理容器 */
  unmount: () => void;
}

/** 渲染一个只调用 hook、不产出 DOM 的函数组件，并返回其最新返回值 */
export function renderHook<T>(hook: () => T): RenderHookResult<T> {
  const result = { current: undefined as unknown as T };
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

  function Probe() {
    result.current = hook();
    return null;
  }

  act(() => {
    root.render(createElement(Probe));
  });

  return {
    result,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    }
  };
}
