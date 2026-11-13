// src/hooks/useTheme.ts v3.19.0
// 主题切换：通过在 <html> 上增删 Tailwind 的 .dark 类驱动明暗主题（shadcn/ui 约定）。
// v3.19.0：首屏由 layout.tsx 内联脚本提前应用主题（消除 FOUC）；hook 初始化
// 不再写回 localStorage，避免把「跟随系统」固化成显式 light（T-UI-02）。
import { useState, useEffect, useRef } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const isFirstRender = useRef(true);

  // 1) 初始化主题（先读 localStorage → 浏览器偏好），只更新状态不落盘
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let savedTheme = '';
    try { savedTheme = localStorage.getItem('theme') ?? ''; } catch { /* 隐私模式不可用 */ }
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // 2) 只同步 DOM class：首轮跳过，避免用默认 light 抹掉首屏脚本已应用的主题
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // 3) 仅用户显式切换时持久化，保留「跟随系统」语义
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try { localStorage.setItem('theme', next); } catch { /* 隐私模式不可用 */ }
  };

  return { theme, toggleTheme };
};





