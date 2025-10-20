// 小地图组件 - 常驻HUD右上角
import React, { useRef, useEffect } from 'react';
import { useGameStore } from '@store/gameStore';

export const MiniMap: React.FC = () => {
  const playerPosition = useGameStore((state) => state.playerPosition);
  const progress = useGameStore((state) => state.progress);
  const enemies = useGameStore((state) => state.enemies);
  const miniMapPosition = useGameStore((state) => state.miniMapPosition);
  const setMiniMapPosition = useGameStore((state) => state.setMiniMapPosition);
  const toggleUI = useGameStore((state) => state.toggleUI);
  const [showSettings, setShowSettings] = React.useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 小地图配置
  const miniMapSize = 150; // 小地图尺寸
  const viewRange = 400; // 显示范围（游戏坐标）
  const scale = miniMapSize / viewRange; // 缩放比例
  
  // 绘制小地图
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 清空画布
    ctx.clearRect(0, 0, miniMapSize, miniMapSize);
    
    // 绘制背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, miniMapSize, miniMapSize);
    
    // 绘制边框
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, miniMapSize, miniMapSize);
    
    // 计算可视区域中心
    const centerX = playerPosition.x;
    const centerY = playerPosition.y;
    
    // 绘制迷雾战争（未探索区域遮罩）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, miniMapSize, miniMapSize);
    
    // 绘制已探索区域（清除遮罩）
    ctx.globalCompositeOperation = 'destination-out';
    progress.exploredAreas.forEach((area) => {
      const [tileX, tileY] = area.split('-').map(Number);
      const worldX = tileX * 64;
      const worldY = tileY * 64;
      
      // 转换为小地图坐标
      const mapX = (worldX - centerX + viewRange / 2) * scale;
      const mapY = (worldY - centerY + viewRange / 2) * scale;
      const tileSize = 64 * scale;
      
      // 只绘制可见范围内的
      if (mapX >= -tileSize && mapX <= miniMapSize + tileSize && 
          mapY >= -tileSize && mapY <= miniMapSize + tileSize) {
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.fillRect(mapX, mapY, tileSize, tileSize);
      }
    });
    
    ctx.globalCompositeOperation = 'source-over';
    
    // 绘制已探索区域（蓝色）
    ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
    progress.exploredAreas.forEach((area) => {
      const [tileX, tileY] = area.split('-').map(Number);
      const worldX = tileX * 64;
      const worldY = tileY * 64;
      
      const mapX = (worldX - centerX + viewRange / 2) * scale;
      const mapY = (worldY - centerY + viewRange / 2) * scale;
      const tileSize = 64 * scale;
      
      if (mapX >= -tileSize && mapX <= miniMapSize + tileSize && 
          mapY >= -tileSize && mapY <= miniMapSize + tileSize) {
        ctx.fillRect(mapX, mapY, tileSize, tileSize);
      }
    });
    
    // 绘制传送点（村庄）
    const villages = [
      { x: 400, y: 300, name: '起始村庄', unlocked: true },
    ];
    
    villages.forEach((village) => {
      const mapX = (village.x - centerX + viewRange / 2) * scale;
      const mapY = (village.y - centerY + viewRange / 2) * scale;
      
      if (mapX >= 0 && mapX <= miniMapSize && 
          mapY >= 0 && mapY <= miniMapSize) {
        // 传送点光圈
        ctx.fillStyle = village.unlocked ? 'rgba(59, 130, 246, 0.4)' : 'rgba(100, 100, 100, 0.4)';
        ctx.beginPath();
        ctx.arc(mapX, mapY, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // 传送点中心
        ctx.fillStyle = village.unlocked ? 'rgba(59, 130, 246, 1)' : 'rgba(100, 100, 100, 1)';
        ctx.beginPath();
        ctx.arc(mapX, mapY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // 绘制附近敌人（红点）
    ctx.fillStyle = 'rgba(239, 68, 68, 1)';
    enemies.forEach((enemy) => {
      const mapX = (enemy.x - centerX + viewRange / 2) * scale;
      const mapY = (enemy.y - centerY + viewRange / 2) * scale;
      
      // 只显示可见范围内的敌人
      if (mapX >= 0 && mapX <= miniMapSize && 
          mapY >= 0 && mapY <= miniMapSize) {
        ctx.beginPath();
        ctx.arc(mapX, mapY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // 绘制玩家位置（中心绿点）
    const playerMapX = miniMapSize / 2;
    const playerMapY = miniMapSize / 2;
    
    // 玩家光圈（脉动效果）
    const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(34, 197, 94, ${pulse * 0.5})`;
    ctx.beginPath();
    ctx.arc(playerMapX, playerMapY, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // 玩家中心点
    ctx.fillStyle = 'rgba(34, 197, 94, 1)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(playerMapX, playerMapY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // 绘制坐标文字
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${Math.floor(playerPosition.x)}, ${Math.floor(playerPosition.y)}`,
      miniMapSize / 2,
      miniMapSize - 5
    );
    
  }, [playerPosition, progress.exploredAreas, enemies]);
  
  // 点击小地图打开大地图
  const handleClick = () => {
    toggleUI('showMap');
  };
  
  // 根据位置设置样式（调整顶部位置，留出空间给标题）
  const positionClass = {
    'top-right': 'top-8 right-4',
    'top-left': 'top-8 left-4',
    'bottom-right': 'bottom-28 right-4',  // 留出空间给图例和按钮
    'bottom-left': 'bottom-28 left-4',
  }[miniMapPosition];
  
  return (
    <div 
      className={`fixed ${positionClass} cursor-pointer hover:scale-105 transition-transform z-40`}
      onClick={handleClick}
      title="点击打开大地图 (M)"
    >
      {/* 小地图画布 */}
      <canvas
        ref={canvasRef}
        width={miniMapSize}
        height={miniMapSize}
        className="rounded border-2 border-gray-700 shadow-2xl"
      />
      
      {/* 小地图标题 */}
      <div className="absolute -top-6 left-0 right-0 text-center">
        <span className="text-xs text-white bg-black/60 px-2 py-1 rounded">
          小地图
        </span>
      </div>
      
      {/* 图例 */}
      <div className="absolute -bottom-16 left-0 right-0 bg-black/80 rounded p-1 text-[10px] text-white">
        <div className="flex items-center gap-1 justify-center">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span>你</span>
          <div className="w-2 h-2 bg-red-500 rounded-full ml-2" />
          <span>敌</span>
          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2" />
          <span>村</span>
        </div>
      </div>
      
      {/* 位置设置按钮 */}
      <button
        className="absolute -bottom-24 left-0 right-0 mx-auto w-20 bg-gray-800 hover:bg-gray-700 text-white text-[10px] px-2 py-1 rounded"
        onClick={(e) => {
          e.stopPropagation();
          setShowSettings(!showSettings);
        }}
        title="切换小地图位置"
      >
        位置
      </button>
      
      {/* 位置选择面板 */}
      {showSettings && (
        <div 
          className="absolute -bottom-40 left-0 bg-gray-800 border border-gray-600 rounded p-2 text-[10px] text-white z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-2 gap-1">
            {[
              { label: '左上', value: 'top-left' as const },
              { label: '右上', value: 'top-right' as const },
              { label: '左下', value: 'bottom-left' as const },
              { label: '右下', value: 'bottom-right' as const },
            ].map((pos) => (
              <button
                key={pos.value}
                onClick={() => {
                  setMiniMapPosition(pos.value);
                  setShowSettings(false);
                }}
                className={`px-2 py-1 rounded ${
                  miniMapPosition === pos.value
                    ? 'bg-blue-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
