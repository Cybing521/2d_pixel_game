// 未分配属性点提示图标
import React from 'react';
import { useGameStore } from '@store/gameStore';

export const UnallocatedPointsIndicator: React.FC = () => {
  const unallocatedPoints = useGameStore((state) => state.progress.unallocatedPoints);
  const toggleUI = useGameStore((state) => state.toggleUI);

  if (unallocatedPoints <= 0) {
    return null;
  }

  return (
    <div 
      className="fixed top-24 right-4 z-40 cursor-pointer hover:scale-110 transition-transform"
      onClick={() => {
        // TODO: 打开角色面板
        console.log('打开角色面板分配属性');
      }}
      title={`你有${unallocatedPoints}点属性未分配，点击分配`}
    >
      <div className="relative">
        {/* 主图标 - 闪烁动画 */}
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-400 animate-pulse">
          <span className="text-2xl">⭐</span>
        </div>
        
        {/* 点数显示 */}
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-lg animate-bounce">
          {unallocatedPoints}
        </div>
        
        {/* 光晕效果 */}
        <div className="absolute inset-0 bg-orange-400 rounded-full opacity-50 animate-ping" />
      </div>
      
      {/* 提示文字 */}
      <div className="mt-2 text-center">
        <div className="bg-black/80 text-orange-400 text-xs px-2 py-1 rounded font-medium">
          未分配
        </div>
      </div>
    </div>
  );
};
