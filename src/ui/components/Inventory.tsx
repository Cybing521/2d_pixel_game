// 背包界面组件
import React from 'react';
import { useGameStore } from '@store/gameStore';
import { Item } from '@/types/entities';
import { RARITY_COLORS } from '@constants/gameConfig';

export const Inventory: React.FC = () => {
  const inventory = useGameStore((state) => state.inventory);
  const toggleUI = useGameStore((state) => state.toggleUI);
  const isVisible = useGameStore((state) => state.ui.showInventory);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-gray-900 border-4 border-gray-700 rounded-lg p-6 w-[600px]">
        {/* 标题栏 */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">背包</h2>
          <button
            onClick={() => toggleUI('showInventory')}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* 背包格子 */}
        <div className="grid grid-cols-5 gap-2">
          {inventory.items.map((item, index) => (
            <InventorySlot key={index} item={item} index={index} />
          ))}
        </div>

        {/* 底部信息 */}
        <div className="mt-4 text-sm text-gray-400 text-center">
          {inventory.items.filter(i => i !== null).length} / {inventory.maxSlots} 格子已使用
        </div>
      </div>
    </div>
  );
};

const InventorySlot: React.FC<{ item: Item | null; index: number }> = ({ item, index }) => {
  return (
    <div
      className="w-20 h-20 bg-gray-800 border-2 border-gray-600 rounded
                 flex items-center justify-center cursor-pointer
                 hover:border-gray-400 transition-colors"
      title={item ? `${item.name}\n${item.description}` : '空格子'}
    >
      {item ? (
        <div className="text-center">
          <div className="text-2xl mb-1">📦</div>
          <div 
            className="text-xs font-bold"
            style={{ color: RARITY_COLORS[item.rarity] }}
          >
            {item.name}
          </div>
        </div>
      ) : (
        <span className="text-gray-600 text-2xl">+</span>
      )}
    </div>
  );
};
