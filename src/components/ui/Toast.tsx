// src/components/ui/Toast.tsx v3.4.0
'use client';

import { Toaster } from 'sonner';

interface ToastProviderProps {
  children?: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps = {}) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
          className: 'toast-sonner',
        }}
        closeButton
        richColors
        theme="system"
      />
    </>
  );
}

export { toast } from 'sonner';
