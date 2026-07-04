// src/components/ui/Loading.tsx v3.4.0
import React from 'react';

interface LoadingProps {
  isLoading: boolean;
  loadingText: string;
}

const Loading: React.FC<LoadingProps> = ({ isLoading, loadingText }) => {
  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
      <span className="loading-text">{loadingText}</span>
    </div>
  );
};

export default Loading;