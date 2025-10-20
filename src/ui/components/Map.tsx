// 增强版地图组件 - 支持缩放、拖拽、敌人显示等
import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '@store/gameStore';

export const Map: React.FC = () => {
  const isVisible = useGameStore((state) => state.ui.showMap);
  const toggleUI = useGameStore((state) => state.toggleUI);
  const progress = useGameStore((state) => state.progress);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const enemies = useGameStore((state) => state.enemies);
  const questMarkers = useGameStore((state) => state.questMarkers);

  // 地图状态
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 地图配置
  const mapWidth = 600;
  const mapHeight = 600;
  const worldWidth = 2000;
  const baseScale = mapWidth / worldWidth;

  if (!isVisible) return null;

  // 绘制地图到Canvas（性能优化）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, mapWidth, mapHeight);
    ctx.save();

    // 应用变换（缩放和平移）
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    // 绘制背景网格
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1 / zoom;
    for (let x = 0; x <= mapWidth; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, mapHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= mapHeight; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(mapWidth, y);
      ctx.stroke();
    }

    // 绘制世界边界
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 2 / zoom;
    ctx.strokeRect(0, 0, mapWidth, mapHeight);

    // 绘制探索区域
    ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = 1 / zoom;
    progress.exploredAreas.forEach((area) => {
      const [tileX, tileY] = area.split('-').map(Number);
      const x = (tileX * 64 + 32) * baseScale - 6.4;
      const y = (tileY * 64 + 32) * baseScale - 6.4;
      ctx.fillRect(x, y, 12.8, 12.8);
      ctx.strokeRect(x, y, 12.8, 12.8);
    });

    // 绘制村庄（起始村庄）
    const villageX = 400 * baseScale;
    const villageY = 300 * baseScale;
    
    // 村庄光圈
    ctx.fillStyle = 'rgba(234, 179, 8, 0.2)';
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.8)';
    ctx.lineWidth = 2 / zoom;
    ctx.beginPath();
    ctx.arc(villageX, villageY, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // 村庄中心点
    ctx.fillStyle = 'rgba(234, 179, 8, 1)';
    ctx.beginPath();
    ctx.arc(villageX, villageY, 4, 0, Math.PI * 2);
    ctx.fill();

    // 绘制敌人位置
    ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
    enemies.forEach((enemy) => {
      const x = enemy.x * baseScale;
      const y = enemy.y * baseScale;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // 绘制任务标记
    ctx.fillStyle = 'rgba(251, 146, 60, 1)';
    ctx.strokeStyle = 'rgba(251, 146, 60, 1)';
    ctx.lineWidth = 2 / zoom;
    questMarkers.forEach((marker) => {
      const x = marker.x * baseScale;
      const y = marker.y * baseScale;
      
      // 绘制菱形标记
      ctx.beginPath();
      ctx.moveTo(x, y - 5);
      ctx.lineTo(x + 5, y);
      ctx.lineTo(x, y + 5);
      ctx.lineTo(x - 5, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // 绘制玩家位置
    const playerX = playerPosition.x * baseScale;
    const playerY = playerPosition.y * baseScale;
    
    // 玩家光圈
    ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
    ctx.beginPath();
    ctx.arc(playerX, playerY, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // 玩家中心点
    ctx.fillStyle = 'rgba(34, 197, 94, 1)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
    ctx.lineWidth = 2 / zoom;
    ctx.beginPath();
    ctx.arc(playerX, playerY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }, [playerPosition, progress.exploredAreas, enemies, questMarkers, zoom, offset]);

  // 鼠标拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  // 重置视图
  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
      <div className="bg-gray-900 border-4 border-gray-700 rounded-lg p-6 max-w-4xl">
        {/* 标题栏 */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">世界地图</h2>
            <p className="text-xs text-gray-400 mt-1">
              滚轮缩放 | 拖拽移动 | 当前缩放: {(zoom * 100).toFixed(0)}%
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetView}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
            >
              重置视图
            </button>
            <button
              onClick={() => toggleUI('showMap')}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 地图画布 */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={mapWidth}
            height={mapHeight}
            className="bg-gray-950 border-2 border-gray-600 rounded cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />
          
          {/* 区域名称标签（覆盖层） */}
          <div className="absolute inset-0 pointer-events-none">
            {/* 起始区域 */}
            <div
              className="absolute text-yellow-400 text-xs font-bold bg-black/50 px-2 py-1 rounded"
              style={{
                left: `${(400 * baseScale * zoom + offset.x)}px`,
                top: `${(300 * baseScale * zoom + offset.y - 25)}px`,
              }}
            >
              起始村庄
            </div>
            
            {/* 其他区域可以继续添加 */}
          </div>
        </div>

        {/* 图例 */}
        <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full border border-white" />
            <span className="text-gray-300">玩家</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-gray-300">敌人 ({enemies.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500/50 border border-blue-400" />
            <span className="text-gray-300">已探索</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full border border-yellow-400" />
            <span className="text-gray-300">村庄</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rotate-45" />
            <span className="text-gray-300">任务 ({questMarkers.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-red-500/50" />
            <span className="text-gray-300">世界边界</span>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="mt-3 flex justify-between text-xs text-gray-400">
          <span>探索进度: {progress.exploredAreas.length} 个区域</span>
          <span>玩家位置: ({Math.floor(playerPosition.x)}, {Math.floor(playerPosition.y)})</span>
        </div>

        {/* 提示 */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          按 <kbd className="px-2 py-1 bg-gray-700 rounded">M</kbd> 关闭地图 | 
          滚轮缩放 | 拖拽移动
        </div>
      </div>
    </div>
  );
};
