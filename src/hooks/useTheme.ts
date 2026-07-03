// src/hooks/useTheme.ts v3.4.0
// - 支持 Tailwind 的 .dark 类（供 shadcn/ui 使用）
// - 保持 data-theme 属性（供旧 CSS 变量使用）
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

  // 2) 同步到 HTML 属性 —— 同时维护 .dark 类（Tailwind）和 data-theme（旧变量）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
};
