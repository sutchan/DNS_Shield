// src/hooks/useTheme.ts v3.6.1
// 主题切换：通过在 <html> 上增删 Tailwind 的 .dark 类驱动明暗主题（shadcn/ui 约定）。
import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // 1) 初始化主题（先读 localStorage → 浏览器偏好）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // 2) 同步到 HTML：切换 .dark 类并持久化到 localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
};
