// 成长历史面板 - 显示玩家的属性提升历史
import React from 'react';
import { useGameStore } from '@store/gameStore';

export const GrowthHistoryPanel: React.FC = () => {
  const progress = useGameStore((state) => state.progress);
  const player = useGameStore((state) => state.player);

  return (
    <div className="bg-black p-1" style={{ imageRendering: 'pixelated' }}>
      <div className="absolute inset-0 border-4 border-blue-400" 
           style={{ boxShadow: 'inset 0 0 0 2px #000, 0 6px 0 #2563eb' }} />
      
      <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 p-4">
        {/* 标题 */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b-4 border-blue-400">
          <h3 className="text-2xl font-black text-blue-400" 
              style={{ 
                fontFamily: 'monospace', 
                textShadow: '2px 2px 0 #000'
              }}>
            ◆ GROWTH LOG ◆
          </h3>
          <div className="bg-blue-600 border-2 border-white px-3 py-1 text-white font-bold" 
               style={{ fontFamily: 'monospace', boxShadow: '2px 2px 0 #000' }}>
            LV.{player.level}
          </div>
        </div>

        {/* 当前属性总览 */}
        <div className="bg-gray-900 border-2 border-gray-600 p-3 mb-4">
          <div className="text-sm text-gray-300 mb-2" style={{ fontFamily: 'monospace' }}>
            ► CURRENT STATS
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs" style={{ fontFamily: 'monospace' }}>
            <div className="flex justify-between">
              <span className="text-gray-400">HP:</span>
              <span className="text-white font-bold">{player.maxHealth}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">MP:</span>
              <span className="text-white font-bold">{player.maxMana}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ATK:</span>
              <span className="text-white font-bold">{player.attack}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">DEF:</span>
              <span className="text-white font-bold">{player.defense}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">MAG:</span>
              <span className="text-white font-bold">{player.magic || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">SPD:</span>
              <span className="text-white font-bold">{player.speed}</span>
            </div>
          </div>
        </div>

        {/* 成长历史 */}
        <div className="bg-gray-900 border-2 border-gray-600 p-3 max-h-64 overflow-y-auto">
          <div className="text-sm text-gray-300 mb-2" style={{ fontFamily: 'monospace' }}>
            ► RECENT CHOICES
          </div>
          
          {progress.recentChoices.length === 0 ? (
            <div className="text-center text-gray-500 py-8" style={{ fontFamily: 'monospace' }}>
              No growth history yet
            </div>
          ) : (
            <div className="space-y-1">
              {progress.recentChoices.map((choiceId, index) => (
                <div
                  key={`${choiceId}-${index}`}
                  className="flex items-center gap-2 p-2 bg-gray-800 border border-gray-700"
                  style={{ fontFamily: 'monospace' }}
                >
                  <span className="text-yellow-400 font-bold">#{progress.recentChoices.length - index}</span>
                  <span className="text-gray-400 text-xs">{choiceId}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 提示 */}
        <div className="mt-4 bg-blue-900 border-2 border-blue-600 p-2">
          <p className="text-blue-200 text-xs" style={{ fontFamily: 'monospace' }}>
            ► Last 5 choices affect future options
          </p>
        </div>
      </div>
    </div>
  );
};
