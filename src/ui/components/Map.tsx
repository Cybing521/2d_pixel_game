// 地图组件
import React from 'react';
import { useGameStore } from '@store/gameStore';

export const Map: React.FC = () => {
  const isVisible = useGameStore((state) => state.ui.showMap);
  const toggleUI = useGameStore((state) => state.toggleUI);
  const progress = useGameStore((state) => state.progress);

  if (!isVisible) return null;

  // 地图尺寸（游戏世界2000x2000，缩小到400x400显示）
  const mapWidth = 400;
  const mapHeight = 400;
  const worldWidth = 2000;
  const scale = mapWidth / worldWidth;

  // 模拟玩家位置（中心点）
  const playerX = 400 * scale;
  const playerY = 300 * scale;

  // 探索区域示例（这里先用静态数据，实际应该从游戏状态获取）
  const exploredAreas = progress.exploredAreas.map((area) => {
    // 解析区域坐标（格式如 "x-y"）
    const [x, y] = area.split('-').map(Number);
    return { x: x * scale, y: y * scale };
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
      <div className="bg-gray-900 border-4 border-gray-700 rounded-lg p-6 max-w-2xl">
        {/* 标题栏 */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">地图</h2>
          <button
            onClick={() => toggleUI('showMap')}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* 地图画布 */}
        <div className="relative bg-gray-950 border-2 border-gray-600 rounded" style={{ width: mapWidth, height: mapHeight }}>
          {/* 背景网格 */}
          <svg className="absolute inset-0" width={mapWidth} height={mapHeight}>
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width={mapWidth} height={mapHeight} fill="url(#grid)" />
          </svg>

          {/* 已探索区域 */}
          {exploredAreas.map((area, index) => (
            <div
              key={index}
              className="absolute bg-blue-500/30 border border-blue-400/50"
              style={{
                left: area.x - 10,
                top: area.y - 10,
                width: 20,
                height: 20,
              }}
            />
          ))}

          {/* 玩家位置 */}
          <div
            className="absolute w-4 h-4 bg-green-500 rounded-full border-2 border-white"
            style={{
              left: playerX - 8,
              top: playerY - 8,
              boxShadow: '0 0 10px rgba(34, 197, 94, 0.8)',
            }}
          >
            {/* 脉动效果 */}
            <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
          </div>

          {/* 世界边界 */}
          <div className="absolute inset-0 border-2 border-red-500/50 pointer-events-none" />

          {/* 起始村庄标记 */}
          <div
            className="absolute"
            style={{ left: 400 * scale - 16, top: 300 * scale - 16 }}
            title="起始村庄"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-2xl">🏘️</span>
            </div>
          </div>
        </div>

        {/* 图例 */}
        <div className="mt-4 flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full border border-white" />
            <span className="text-gray-300">玩家位置</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500/50 border border-blue-400" />
            <span className="text-gray-300">已探索区域</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl leading-none">🏘️</span>
            <span className="text-gray-300">村庄</span>
          </div>
        </div>

        {/* 探索进度 */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            探索进度: {progress.exploredAreas.length} 个区域
          </p>
        </div>

        {/* 提示 */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          按 <kbd className="px-2 py-1 bg-gray-700 rounded">M</kbd> 关闭地图
        </div>
      </div>
    </div>
  );
};
