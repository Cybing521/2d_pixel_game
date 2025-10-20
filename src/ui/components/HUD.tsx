// 游戏内HUD组件
import React from 'react';
import { useGameStore } from '@store/gameStore';
import { MiniMap } from './MiniMap';

export const HUD: React.FC = () => {
  const player = useGameStore((state) => state.player);
  const toggleUI = useGameStore((state) => state.toggleUI);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* 左上角：生命和魔力 */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <div className="bg-black/60 p-4 rounded-lg border border-white/20 backdrop-blur-sm">
          {/* 生命条 */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-red-400 text-sm font-bold">❤️ HP</span>
              <span className="text-white text-sm font-mono">
                {Math.floor(player.health)}/{player.maxHealth}
              </span>
            </div>
            <div className="w-48 h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
              />
            </div>
          </div>

          {/* 魔力条 */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-blue-400 text-sm font-bold">💧 MP</span>
              <span className="text-white text-sm font-mono">
                {Math.floor(player.mana || 0)}/{player.maxMana}
              </span>
            </div>
            <div className="w-48 h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
                style={{ width: `${((player.mana || 0) / (player.maxMana || 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* 等级和经验条 */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-yellow-400 text-sm font-bold">
                Lv.{player.level}
              </span>
              <span className="text-yellow-300 text-xs font-mono">
                {player.exp}/{player.expToNextLevel}
              </span>
            </div>
            {/* 经验条 */}
            <div className="w-48 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
              <div
                className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-500"
                style={{ width: `${(player.exp / player.expToNextLevel) * 100}%` }}
              />
            </div>
            <div className="text-center mt-1">
              <span className="text-yellow-300 text-xs">
                {Math.floor((player.exp / player.expToNextLevel) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 右上角：快捷键提示 */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <div className="bg-black/60 p-3 rounded-lg border border-white/20 backdrop-blur-sm">
          <div className="text-xs text-gray-300 space-y-1">
            <div><kbd className="px-2 py-1 bg-gray-700 rounded">I</kbd> 背包</div>
            <div><kbd className="px-2 py-1 bg-gray-700 rounded">K</kbd> 技能</div>
            <div><kbd className="px-2 py-1 bg-gray-700 rounded">J</kbd> 任务</div>
            <div><kbd className="px-2 py-1 bg-gray-700 rounded">M</kbd> 地图</div>
          </div>
        </div>
      </div>

      {/* 底部中间：技能栏 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="flex gap-2">
          {player.skills.slice(0, 4).map((skill, i) => (
            <div
              key={skill}
              className="w-14 h-14 bg-gray-900/80 rounded-lg border-2 border-gray-600
                         flex items-center justify-center cursor-pointer
                         hover:border-yellow-400 transition-colors backdrop-blur-sm"
              title={skill}
            >
              <span className="text-xs text-white font-bold">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* 小地图（右上角） */}
      <MiniMap />
    </div>
  );
};
