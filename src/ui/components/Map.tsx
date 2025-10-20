// 增强版地图组件 - 支持缩放、拖拽、敌人显示、路径规划等
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useGameStore } from '@store/gameStore';
import { astar, simplifyPath, type Point } from '@utils/pathfinding';

// 区域合并算法 - 合并相邻探索区域
function mergeAdjacentAreas(areas: string[]): Array<{ x: number; y: number; width: number; height: number }> {
  if (areas.length === 0) return [];
  
  // 将字符串坐标转换为数字坐标
  const areaSet = new Set(areas);
  const areaCoords = areas.map(area => {
    const [x, y] = area.split('-').map(Number);
    return { x, y };
  });
  
  const merged: Array<{ x: number; y: number; width: number; height: number }> = [];
  const processed = new Set<string>();
  
  // 对每个区域尝试合并
  for (const area of areaCoords) {
    const key = `${area.x}-${area.y}`;
    if (processed.has(key)) continue;
    
    // 尝试水平合并
    let width = 1;
    while (areaSet.has(`${area.x + width}-${area.y}`)) {
      width++;
    }
    
    // 尝试垂直合并（对整个水平条）
    let height = 1;
    let canMergeRow = true;
    while (canMergeRow) {
      for (let i = 0; i < width; i++) {
        if (!areaSet.has(`${area.x + i}-${area.y + height}`)) {
          canMergeRow = false;
          break;
        }
      }
      if (canMergeRow) height++;
    }
    
    // 标记所有被合并的区域
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        processed.add(`${area.x + dx}-${area.y + dy}`);
      }
    }
    
    merged.push({ x: area.x, y: area.y, width, height });
  }
  
  return merged;
}

// 区域名称配置
const AREA_LABELS = [
  { x: 400, y: 300, name: '起始村庄', color: 'text-yellow-400' },
  { x: 800, y: 300, name: '东部森林', color: 'text-green-400' },
  { x: 400, y: 700, name: '南部平原', color: 'text-blue-400' },
  { x: 1200, y: 300, name: '远东山脉', color: 'text-gray-400' },
  { x: 400, y: 1100, name: '南方沼泽', color: 'text-emerald-600' },
  { x: 100, y: 300, name: '西部荒野', color: 'text-orange-400' },
];

// 传送点配置（村庄）
const TELEPORT_POINTS = [
  { x: 400, y: 300, name: '起始村庄', unlocked: true },
  // 未来可以添加更多村庄
];

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
  const [hoveredEnemy, setHoveredEnemy] = useState<{ id: string; name: string; x: number; y: number } | null>(null);
  
  // 路径规划状态
  const [targetPoint, setTargetPoint] = useState<Point | null>(null);
  const [pathPoints, setPathPoints] = useState<Point[]>([]);
  const [isCalculatingPath, setIsCalculatingPath] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cacheCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cacheValidRef = useRef(false);
  
  // 地图配置
  const mapWidth = 600;
  const mapHeight = 600;
  const worldWidth = 2000;
  const baseScale = mapWidth / worldWidth;

  // 合并探索区域（优化渲染）
  const mergedAreas = useMemo(() => {
    return mergeAdjacentAreas(progress.exploredAreas);
  }, [progress.exploredAreas]);

  if (!isVisible) return null;

  // 创建缓存Canvas（静态内容）
  const getCacheCanvas = () => {
    if (!cacheCanvasRef.current) {
      cacheCanvasRef.current = document.createElement('canvas');
      cacheCanvasRef.current.width = mapWidth;
      cacheCanvasRef.current.height = mapHeight;
    }
    return cacheCanvasRef.current;
  };

  // 绘制静态内容到缓存Canvas
  const drawStaticContent = () => {
    const cacheCanvas = getCacheCanvas();
    const ctx = cacheCanvas.getContext('2d');
    if (!ctx) return;

    // 清空缓存
    ctx.clearRect(0, 0, mapWidth, mapHeight);

    // 绘制背景网格
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
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
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, mapWidth, mapHeight);

    cacheValidRef.current = true;
  };

  // 当探索区域改变时，重新生成缓存
  useEffect(() => {
    cacheValidRef.current = false;
  }, [progress.exploredAreas]);

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

    // 绘制缓存的静态内容
    if (!cacheValidRef.current) {
      drawStaticContent();
    }
    const cacheCanvas = getCacheCanvas();
    ctx.drawImage(cacheCanvas, 0, 0);

    // 绘制迷雾战争（未探索区域黑色遮罩）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, mapWidth, mapHeight);
    
    // 清除已探索区域的遮罩（使用合并算法）
    ctx.globalCompositeOperation = 'destination-out';
    mergedAreas.forEach((area) => {
      const x = (area.x * 64 + 32) * baseScale - 6.4;
      const y = (area.y * 64 + 32) * baseScale - 6.4;
      const w = area.width * 64 * baseScale;
      const h = area.height * 64 * baseScale;
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fillRect(x, y, w, h);
    });
    ctx.globalCompositeOperation = 'source-over';
    
    // 绘制探索区域（蓝色边框）
    ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = 1 / zoom;
    mergedAreas.forEach((area) => {
      const x = (area.x * 64 + 32) * baseScale - 6.4;
      const y = (area.y * 64 + 32) * baseScale - 6.4;
      const w = area.width * 64 * baseScale;
      const h = area.height * 64 * baseScale;
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
    });

    // 绘制传送点（村庄）
    TELEPORT_POINTS.forEach((point) => {
      const x = point.x * baseScale;
      const y = point.y * baseScale;
      
      // 传送门外圈（旋转效果）
      const rotation = (Date.now() / 2000) * Math.PI * 2;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      // 绘制六边形传送门
      ctx.strokeStyle = point.unlocked ? 'rgba(59, 130, 246, 0.8)' : 'rgba(100, 100, 100, 0.5)';
      ctx.lineWidth = 2 / zoom;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const px = Math.cos(angle) * 15;
        const py = Math.sin(angle) * 15;
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.stroke();
      
      // 填充
      ctx.fillStyle = point.unlocked ? 'rgba(59, 130, 246, 0.2)' : 'rgba(100, 100, 100, 0.2)';
      ctx.fill();
      
      ctx.restore();
      
      // 传送门中心图标（上箭头）
      ctx.fillStyle = point.unlocked ? 'rgba(59, 130, 246, 1)' : 'rgba(100, 100, 100, 1)';
      ctx.beginPath();
      ctx.moveTo(x, y - 6);
      ctx.lineTo(x + 4, y + 2);
      ctx.lineTo(x, y);
      ctx.lineTo(x - 4, y + 2);
      ctx.closePath();
      ctx.fill();
      
      // 下箭头
      ctx.beginPath();
      ctx.moveTo(x, y + 6);
      ctx.lineTo(x + 4, y - 2);
      ctx.lineTo(x, y);
      ctx.lineTo(x - 4, y - 2);
      ctx.closePath();
      ctx.fill();
    });

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

    // 绘制路径线（如果有）
    if (pathPoints.length > 1) {
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
      ctx.lineWidth = 3 / zoom;
      ctx.setLineDash([10 / zoom, 5 / zoom]);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      const firstPoint = pathPoints[0];
      ctx.moveTo(firstPoint.x * baseScale, firstPoint.y * baseScale);
      
      for (let i = 1; i < pathPoints.length; i++) {
        const point = pathPoints[i];
        ctx.lineTo(point.x * baseScale, point.y * baseScale);
      }
      
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // 绘制目标点（如果有）
    if (targetPoint) {
      const tx = targetPoint.x * baseScale;
      const ty = targetPoint.y * baseScale;
      
      // 目标点光圈（脉动效果）
      const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(255, 215, 0, ${pulse * 0.3})`;
      ctx.beginPath();
      ctx.arc(tx, ty, 12, 0, Math.PI * 2);
      ctx.fill();
      
      // 目标点标记（星形）
      ctx.fillStyle = 'rgba(255, 215, 0, 1)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
      ctx.lineWidth = 2 / zoom;
      
      // 绘制五角星
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const x = tx + Math.cos(angle) * 6;
        const y = ty + Math.sin(angle) * 6;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }, [playerPosition, progress.exploredAreas, enemies, questMarkers, zoom, offset, pathPoints, targetPoint]);

  // 鼠标拖拽和悬停检测
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 获取鼠标在canvas中的位置
    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    // 拖拽
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    // 检测鼠标是否悬停在敌人上
    const worldX = (canvasX - offset.x) / zoom;
    const worldY = (canvasY - offset.y) / zoom;

    let foundEnemy = null;
    for (const enemy of enemies) {
      const enemyX = enemy.x * baseScale;
      const enemyY = enemy.y * baseScale;
      const distance = Math.sqrt(
        Math.pow(worldX - enemyX, 2) + Math.pow(worldY - enemyY, 2)
      );
      
      if (distance < 5) { // 5像素的检测范围
        foundEnemy = {
          id: enemy.id,
          name: enemy.name,
          x: canvasX,
          y: canvasY,
        };
        break;
      }
    }

    setHoveredEnemy(foundEnemy);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // 处理地图右键点击（设置目标点）
  const handleMapRightClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // 获取点击位置
    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    
    // 转换为世界坐标
    const worldX = (canvasX - offset.x) / zoom;
    const worldY = (canvasY - offset.y) / zoom;
    const targetX = worldX / baseScale;
    const targetY = worldY / baseScale;
    
    // 检查目标点是否在已探索区域
    const targetTile = `${Math.floor(targetX / 64)}-${Math.floor(targetY / 64)}`;
    if (!progress.exploredAreas.includes(targetTile)) {
      alert('目标点未探索，无法设置路径！');
      return;
    }
    
    // 设置目标点
    const target: Point = { x: targetX, y: targetY };
    setTargetPoint(target);
    setIsCalculatingPath(true);
    
    // 异步计算路径（避免阻塞主线程）
    setTimeout(() => {
      const path = astar(
        playerPosition,
        target,
        progress.exploredAreas
      );
      
      if (path.length > 0) {
        // 简化路径
        const simplified = simplifyPath(path);
        setPathPoints(simplified);
        console.log(`路径计算完成：${path.length}点 -> ${simplified.length}点`);
      } else {
        alert('无法找到到达目标的路径！');
        setTargetPoint(null);
      }
      setIsCalculatingPath(false);
    }, 10);
  };
  
  // 清除路径
  const clearPath = () => {
    setTargetPoint(null);
    setPathPoints([]);
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
            onContextMenu={handleMapRightClick}
            title="右键点击设置目标点"
          />
          
          {/* 区域名称标签（覆盖层） */}
          <div className="absolute inset-0 pointer-events-none">
            {AREA_LABELS.map((label, index) => {
              const x = label.x * baseScale * zoom + offset.x;
              const y = label.y * baseScale * zoom + offset.y - 25;
              
              // 只显示在可视范围内的标签
              if (x < -100 || x > mapWidth + 100 || y < -50 || y > mapHeight + 50) {
                return null;
              }
              
              return (
                <div
                  key={index}
                  className={`absolute ${label.color} text-xs font-bold bg-black/60 px-2 py-1 rounded shadow-lg`}
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  {label.name}
                </div>
              );
            })}
          </div>

          {/* 敌人悬停提示 */}
          {hoveredEnemy && (
            <div
              className="absolute bg-gray-900 border-2 border-red-500 text-white text-xs px-3 py-2 rounded-lg shadow-xl pointer-events-none z-10"
              style={{
                left: `${hoveredEnemy.x + 10}px`,
                top: `${hoveredEnemy.y - 30}px`,
              }}
            >
              <div className="font-bold text-red-400">{hoveredEnemy.name}</div>
              <div className="text-gray-400 text-[10px] mt-0.5">敌对单位</div>
            </div>
          )}
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
            <div className="w-3 h-3 bg-blue-500 border-2 border-blue-400" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
            <span className="text-gray-300">传送点</span>
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
          <span>探索进度: {progress.exploredAreas.length} 个区域（合并后: {mergedAreas.length}）</span>
          <span>玩家位置: ({Math.floor(playerPosition.x)}, {Math.floor(playerPosition.y)})</span>
        </div>

        {/* 路径规划控制 */}
        {(targetPoint || isCalculatingPath) && (
          <div className="mt-3 flex items-center justify-between bg-gray-800 px-4 py-2 rounded">
            <div className="flex items-center gap-2">
              {isCalculatingPath ? (
                <>
                  <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-yellow-400 text-sm">计算路径中...</span>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 bg-yellow-400 rounded-full" />
                  <span className="text-yellow-400 text-sm">
                    目标: ({Math.floor(targetPoint!.x)}, {Math.floor(targetPoint!.y)})
                  </span>
                  <span className="text-gray-400 text-xs ml-2">
                    {pathPoints.length} 个路径点
                  </span>
                </>
              )}
            </div>
            <button
              onClick={clearPath}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
            >
              取消路径
            </button>
          </div>
        )}
        
        {/* 提示 */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          按 <kbd className="px-2 py-1 bg-gray-700 rounded">M</kbd> 关闭地图 | 
          滚轮缩放 | 拖拽移动 | 悬停敌人查看名称 | 
          <span className="text-yellow-400">右键设置路径</span>
        </div>
      </div>
    </div>
  );
};
