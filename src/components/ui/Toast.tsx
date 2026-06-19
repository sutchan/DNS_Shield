// src/components/ui/Toast.tsx
// 简单的 Toast 组件 - 兼容 Home.tsx 的原有 API
'use client';

import React from 'react';

interface ToastProps {
  message: string;
}

const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div 
      className="toast" 
      role="alert"
      aria-live="polite"
    >
      {message}
    </div>
  );
};

export default Toast;
