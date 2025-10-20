// 升级提示Toast组件 - 显示升级信息和恢复量
import React from 'react';
import { useGameStore } from '@store/gameStore';

export const LevelUpToast: React.FC = () => {
  const levelUpEffect = useGameStore((state) => state.levelUpEffect);

  if (!levelUpEffect || !levelUpEffect.show) {
    return null;
  }

  return (
    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-8 py-4 rounded-lg shadow-2xl border-2 border-yellow-400">
        {/* 升级标题 */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl animate-bounce">⭐</span>
          <div>
            <div className="text-2xl font-bold">等级提升！</div>
            <div className="text-lg">
              Lv.{levelUpEffect.level - 1} → Lv.{levelUpEffect.level}
            </div>
          </div>
          <span className="text-3xl animate-bounce">⭐</span>
        </div>

        {/* 恢复信息 */}
        <div className="space-y-2 border-t border-yellow-400 pt-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">❤️</span>
            <span className="text-lg">
              恢复 <span className="font-bold text-green-300">
                {Math.floor(levelUpEffect.healthRestore)}%
              </span> HP
              <span className="text-sm ml-2 text-green-200">
                (+{levelUpEffect.actualHealthRestore})
              </span>
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xl">💧</span>
            <span className="text-lg">
              恢复 <span className="font-bold text-blue-300">
                {Math.floor(levelUpEffect.manaRestore)}%
              </span> MP
              <span className="text-sm ml-2 text-blue-200">
                (+{levelUpEffect.actualManaRestore})
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-yellow-400">
            <span className="text-xl">📊</span>
            <span className="text-lg font-medium">
              获得 <span className="text-yellow-200">1点</span> 属性点待分配
            </span>
          </div>
        </div>

        {/* 提示文字 */}
        <div className="text-xs text-yellow-100 text-center mt-3 opacity-75">
          提示将在3秒后自动消失
        </div>
      </div>
    </div>
  );
};
