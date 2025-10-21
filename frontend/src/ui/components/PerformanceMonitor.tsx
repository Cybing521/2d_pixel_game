// 性能监控组件 - 显示FPS、Chunks等信息
import React, { useEffect, useState } from 'react';

interface PerformanceStats {
  fps: number;
  chunks: number;
  enemies: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 0,
    chunks: 0,
    enemies: 0,
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 监听键盘F3切换显示
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F3') {
        e.preventDefault();
        setVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // 从游戏场景获取性能数据
    const interval = setInterval(() => {
      const gameInstance = (window as any).phaserGame;
      if (gameInstance && gameInstance.scene.scenes[1]) {
        const gameScene = gameInstance.scene.scenes[1];
        if (gameScene.performanceStats) {
          setStats(gameScene.performanceStats);
        }
      }
    }, 500); // 每0.5秒更新一次

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  // 根据FPS判断性能状态
  const getFpsColor = (fps: number) => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div 
      className="fixed top-4 right-4 bg-black/80 border-2 border-green-400 p-2 text-xs pointer-events-none z-50"
      style={{ fontFamily: 'monospace', imageRendering: 'pixelated' }}
    >
      <div className="text-green-400 font-bold mb-1 border-b border-green-400 pb-1">
        [PERFORMANCE]
      </div>
      
      <div className={`${getFpsColor(stats.fps)} font-bold`}>
        FPS: {stats.fps}
      </div>
      
      <div className="text-cyan-400">
        Chunks: {stats.chunks}
      </div>
      
      <div className="text-yellow-400">
        Enemies: {stats.enemies}
      </div>
      
      <div className="text-gray-400 mt-2 text-[10px] border-t border-gray-600 pt-1">
        Press F3 to toggle
      </div>
    </div>
  );
};
