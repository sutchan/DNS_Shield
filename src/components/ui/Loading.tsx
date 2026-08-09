// src/components/ui/Loading.tsx v3.7.8
import React from 'react';

interface LoadingProps {
  isLoading: boolean;
  loadingText: string;
}

const Loading: React.FC<LoadingProps> = ({ isLoading, loadingText }) => {
  if (!isLoading) return null;

  return (
    <div className="loading-overlay" role="status" aria-live="polite" aria-busy="true">
      <div className="loading-content">
        <div className="loading-spinner" aria-hidden="true"></div>
        <span className="loading-text">{loadingText}</span>
      </div>
    </div>
  );
};

export default Loading;