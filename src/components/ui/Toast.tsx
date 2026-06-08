// src/components/ui/Toast.tsx v2.3.0
import React from 'react';

interface ToastProps {
  message: string;
}

const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="toast" id="toast">
      {message}
    </div>
  );
};

export default Toast;