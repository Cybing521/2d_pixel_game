// 游戏内HUD组件
import React from 'react';
import { useGameStore } from '@store/gameStore';
import { MiniMap } from './MiniMap';
import { LevelUpToast } from './LevelUpToast';
import { UnallocatedPointsIndicator } from './UnallocatedPointsIndicator';
import { PerformanceMonitor } from './PerformanceMonitor';
import { LoadingProgress } from './LoadingProgress';

export const HUD: React.FC = () => {
  const player = useGameStore((state) => state.player);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ imageRendering: 'pixelated' }}>
      {/* 左上角：生命和魔力 - 像素风格 */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <div className="bg-black border-4 border-white p-2" style={{ boxShadow: '4px 4px 0 #000' }}>
          {/* 生命条 */}
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-red-500 text-sm font-bold" style={{ fontFamily: 'monospace' }}>
                ♥ HP
              </span>
              <span className="text-white text-sm" style={{ fontFamily: 'monospace' }}>
                {Math.floor(player.health)}/{player.maxHealth}
              </span>
            </div>
            <div className="w-48 h-4 bg-gray-800 border-2 border-gray-600">
              <div
                className="h-full bg-red-600"
                style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
              />
            </div>
          </div>

          {/* 魔力条 */}
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-blue-400 text-sm font-bold" style={{ fontFamily: 'monospace' }}>
                ◆ MP
              </span>
              <span className="text-white text-sm" style={{ fontFamily: 'monospace' }}>
                {Math.floor(player.mana || 0)}/{player.maxMana}
              </span>
            </div>
            <div className="w-48 h-4 bg-gray-800 border-2 border-gray-600">
              <div
                className="h-full bg-blue-600"
                style={{ width: `${((player.mana || 0) / (player.maxMana || 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* 等级和经验条 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-yellow-400 text-sm font-bold" style={{ fontFamily: 'monospace' }}>
                LV.{player.level}
              </span>
              <span className="text-yellow-300 text-xs" style={{ fontFamily: 'monospace' }}>
                {player.exp}/{player.expToNextLevel}
              </span>
            </div>
            <div className="w-48 h-3 bg-gray-800 border-2 border-gray-600">
              <div
                className="h-full bg-yellow-600"
                style={{ width: `${(player.exp / player.expToNextLevel) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 右下角：快捷键提示 - 像素风格 */}
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <div className="bg-black border-2 border-gray-500 p-2" style={{ boxShadow: '2px 2px 0 #000' }}>
          <div className="text-xs text-gray-300 space-y-1" style={{ fontFamily: 'monospace' }}>
            <div><span className="inline-block w-6 h-6 bg-gray-700 border border-white text-center leading-6">I</span> BAG</div>
            <div><span className="inline-block w-6 h-6 bg-gray-700 border border-white text-center leading-6">K</span> SKILL</div>
            <div><span className="inline-block w-6 h-6 bg-gray-700 border border-white text-center leading-6">J</span> QUEST</div>
            <div><span className="inline-block w-6 h-6 bg-gray-700 border border-white text-center leading-6">M</span> MAP</div>
          </div>
        </div>
      </div>

      {/* 底部中间：技能栏 - 像素风格 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="flex gap-1">
          {player.skills.slice(0, 4).map((skill, i) => (
            <div
              key={skill}
              className="w-14 h-14 bg-gray-800 border-2 border-gray-600
                         flex items-center justify-center cursor-pointer
                         hover:border-yellow-400"
              style={{ boxShadow: '2px 2px 0 #000' }}
              title={skill}
            >
              <span className="text-sm text-white font-bold" style={{ fontFamily: 'monospace' }}>
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* 小地图（右上角） */}
      <MiniMap />
      
      {/* 升级Toast提示 */}
      <LevelUpToast />
      
      {/* 未分配属性点提示 */}
      <UnallocatedPointsIndicator />
      
      {/* 性能监控（F3切换） */}
      <PerformanceMonitor />
      
      {/* 加载进度提示 */}
      <LoadingProgress />
    </div>
  );
};
