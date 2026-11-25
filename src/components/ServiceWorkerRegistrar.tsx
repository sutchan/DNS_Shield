// src/components/ServiceWorkerRegistrar.tsx v3.22.0
// 生产环境注册同源 Service Worker：缓存白名单由 public/service-worker.js 自管（T-PWA-01）。
// dev 不注册：webpack HMR 资源会被 SW 旧缓存拦截，导致预览出现陈旧页面。
'use client';
import { useEffect } from 'react';
import { logger } from '../utils/logger';

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    let cancelled = false;
    void navigator.serviceWorker
      .register('/service-worker.js', { scope: '/' })
      .then((registration) => {
        if (!cancelled) logger.info('Service worker registered:', registration.scope);
      })
      .catch((error) => {
        if (!cancelled) logger.warn('Service worker registration failed:', error);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
