// 属性分配面板 - 在角色面板中显示
import React, { useState, useEffect } from 'react';
import { useGameStore } from '@store/gameStore';
import { LevelUpOptionsGenerator } from '@/systems/LevelUpOptionsGenerator';
import type { LevelUpOption } from '@/data/levelUpOptions';

export const AttributeAllocationPanel: React.FC = () => {
  const player = useGameStore((state) => state.player);
  const progress = useGameStore((state) => state.progress);
  const updatePlayerStats = useGameStore((state) => state.updatePlayerStats);
  const consumeUnallocatedPoint = useGameStore((state) => state.consumeUnallocatedPoint);
  
  const [options, setOptions] = useState<LevelUpOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<LevelUpOption | null>(null);

  // 生成选项
  useEffect(() => {
    if (progress.unallocatedPoints > 0 && options.length === 0) {
      const generatedOptions = LevelUpOptionsGenerator.generate(
        player.level,
        progress.recentChoices
      );
      setOptions(generatedOptions);
    }
  }, [progress.unallocatedPoints, player.level, progress.recentChoices, options.length]);

  // 如果没有未分配点数，不显示
  if (progress.unallocatedPoints <= 0) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">✓</div>
          <div>所有属性点已分配</div>
        </div>
      </div>
    );
  }

  // 处理选择
  const handleSelect = (option: LevelUpOption) => {
    setSelectedOption(option);
  };

  // 确认分配
  const handleConfirm = () => {
    if (!selectedOption) return;

    // 应用属性提升
    const newStats = LevelUpOptionsGenerator.applyOption(selectedOption, player);
    updatePlayerStats(newStats);

    // 消耗点数
    consumeUnallocatedPoint();

    // 记录选择历史
    const newRecentChoices = [selectedOption.id, ...progress.recentChoices].slice(0, 5);
    useGameStore.getState().updateProgress({ recentChoices: newRecentChoices });

    // 重置状态
    setSelectedOption(null);
    setOptions([]);

    console.log(`✨ 属性提升：${selectedOption.displayName} +${selectedOption.value}`);
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border-2 border-yellow-600 shadow-xl">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <h3 className="text-xl font-bold text-yellow-400">属性分配</h3>
        </div>
        <div className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-bold">
          剩余: {progress.unallocatedPoints} 点
        </div>
      </div>

      {/* 提示 */}
      <div className="bg-blue-900/30 border border-blue-700 rounded p-3 mb-4">
        <p className="text-blue-300 text-sm">
          💡 选择一项属性进行提升，属性将立即生效且不可撤销
        </p>
      </div>

      {/* 选项列表 */}
      <div className="space-y-3 mb-4">
        {options.map((option) => {
          const isSelected = selectedOption?.id === option.id;
          const currentValue = (player[option.statType] as number) || 0;
          const statChange = LevelUpOptionsGenerator.formatStatChange(option, currentValue);
          
          // 根据类型设置颜色
          const typeColors = {
            basic: 'from-blue-600 to-blue-800 border-blue-400',
            special: 'from-purple-600 to-purple-800 border-purple-400',
            advanced: 'from-yellow-600 to-orange-700 border-yellow-400',
          };

          return (
            <div
              key={option.id}
              onClick={() => handleSelect(option)}
              className={`
                relative bg-gradient-to-r ${typeColors[option.type]}
                border-2 rounded-lg p-4 cursor-pointer transition-all
                ${isSelected 
                  ? 'scale-105 shadow-2xl ring-4 ring-yellow-400' 
                  : 'hover:scale-102 hover:shadow-xl'}
              `}
            >
              {/* 选中标记 */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-xl border-2 border-white shadow-lg">
                  ✓
                </div>
              )}

              <div className="flex items-center gap-4">
                {/* 图标 */}
                <div className="text-4xl">{option.icon}</div>

                {/* 信息 */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-white">
                      {option.displayName}
                    </span>
                    <span className="text-sm bg-white/20 px-2 py-0.5 rounded">
                      {option.type === 'basic' && '基础'}
                      {option.type === 'special' && '特殊'}
                      {option.type === 'advanced' && '高级'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-200 mb-2">
                    {option.description}
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-green-300 font-bold">
                      +{option.value}
                      {['critRate', 'critDamage', 'cooldownReduction', 'expBonus', 
                        'lifeSteal', 'thorns', 'dodge', 'penetration'].includes(option.statType) 
                        ? '%' : ''}
                    </div>
                    <div className="text-gray-300">
                      {statChange}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 确认按钮 */}
      <button
        onClick={handleConfirm}
        disabled={!selectedOption}
        className={`
          w-full py-3 rounded-lg font-bold text-lg transition-all
          ${selectedOption
            ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-400 hover:to-orange-500 shadow-lg hover:shadow-xl'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
        `}
      >
        {selectedOption ? `确认提升 ${selectedOption.displayName}` : '请选择一个属性'}
      </button>
    </div>
  );
};
