// 地图加载进度提示组件
import React, { useEffect, useState } from 'react';

interface LoadingState {
  isLoading: boolean;
  message: string;
  progress: number;
}

export const LoadingProgress: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: '',
    progress: 0,
  });

  useEffect(() => {
    // 监听chunk加载事件
    const handleChunkLoad = (event: CustomEvent) => {
      const { message, progress } = event.detail;
      setLoadingState({
        isLoading: true,
        message,
        progress,
      });

      // 加载完成后2秒隐藏
      if (progress >= 100) {
        setTimeout(() => {
          setLoadingState((prev) => ({ ...prev, isLoading: false }));
        }, 2000);
      }
    };

    window.addEventListener('chunk-loading' as any, handleChunkLoad);
    return () => window.removeEventListener('chunk-loading' as any, handleChunkLoad);
  }, []);

  if (!loadingState.isLoading) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div 
        className="bg-black border-2 border-cyan-400 px-4 py-2"
        style={{ 
          fontFamily: 'monospace', 
          imageRendering: 'pixelated',
          boxShadow: '4px 4px 0 #000'
        }}
      >
        <div className="text-cyan-400 text-sm font-bold mb-1">
          {loadingState.message}
        </div>
        
        {/* 像素风格进度条 */}
        <div className="w-48 h-4 bg-gray-800 border-2 border-gray-600">
          <div
            className="h-full bg-cyan-500 transition-all duration-300"
            style={{ width: `${loadingState.progress}%` }}
          />
        </div>
        
        <div className="text-cyan-300 text-xs text-center mt-1">
          {Math.floor(loadingState.progress)}%
        </div>
      </div>
    </div>
  );
};
