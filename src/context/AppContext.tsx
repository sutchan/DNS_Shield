// src/context/AppContext.tsx v3.7.12
// 应用级上下文：集中提供跨层共享的只读数据（当前为 i18n 翻译 t），
// 避免将 t 逐层透传（prop drilling）到每个子组件，降低耦合。
'use client';
import * as React from 'react';
import { Translation } from '../types';

interface AppContextValue {
  /** 当前语言的翻译表 */
  t: Translation;
}

const AppContext = React.createContext<AppContextValue | null>(null);

interface AppProviderProps {
  value: AppContextValue;
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ value, children }) => (
  <AppContext.Provider value={value}>{children}</AppContext.Provider>
);

/** 读取应用上下文，未包裹 Provider 时抛错，便于早期发现使用错误 */
export const useAppContext = (): AppContextValue => {
  const ctx = React.useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext 必须在 <AppProvider> 内使用');
  }
  return ctx;
};

/** 便捷 Hook：直接获取翻译表 t */
export const useT = (): Translation => useAppContext().t;
