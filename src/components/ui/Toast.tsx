'use client';

import * as React from 'react';

interface ToastProps {
  message: string;
}

const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;
  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-4 right-4 z-50 px-4 py-3 rounded-md bg-primary text-primary-foreground text-sm shadow-lg"
    >
      {message}
    </div>
  );
};

export default Toast;
