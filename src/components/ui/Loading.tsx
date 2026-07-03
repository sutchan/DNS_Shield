// src/components/ui/Loading.tsx v3.2.0
import React from 'react';

interface LoadingProps {
  isLoading: boolean;
  isLangZh: boolean;
}

const Loading: React.FC<LoadingProps> = ({ isLoading, isLangZh }) => {
  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
      <span className="loading-text">{isLangZh ? '加载中...' : 'Loading...'}</span>
    </div>
  );
};

export default Loading;