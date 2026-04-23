// src/components/ui/Loading.tsx v2.2.1
import React from 'react';

interface LoadingProps {
  isLoading: boolean;
  isLangZh: boolean;
}

const Loading: React.FC<LoadingProps> = ({ isLoading, isLangZh }) => {
  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <span>{isLangZh ? '加载中...' : 'Loading...'}</span>
      </div>
    </div>
  );
};

export default Loading;