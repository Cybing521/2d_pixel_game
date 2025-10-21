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
    <div className="relative bg-black p-1" style={{ imageRendering: 'pixelated' }}>
      {/* 像素风格外边框 */}
      <div className="absolute inset-0 border-4 border-yellow-400" 
           style={{ boxShadow: 'inset 0 0 0 2px #000, 0 6px 0 #ca8a04' }} />
      
      <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 p-4">
        {/* 标题 - 像素风格 */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b-4 border-yellow-400">
          <h3 className="text-2xl font-black text-yellow-400" 
              style={{ 
                fontFamily: 'monospace', 
                textShadow: '2px 2px 0 #000'
              }}>
            ◆ STAT BOOST ◆
          </h3>
          <div className="bg-red-600 border-2 border-white px-3 py-1 text-white font-bold" 
               style={{ fontFamily: 'monospace', boxShadow: '2px 2px 0 #000' }}>
            POINTS: {progress.unallocatedPoints}
          </div>
        </div>

        {/* 提示 - 像素风格 */}
        <div className="bg-blue-900 border-2 border-blue-400 p-2 mb-4">
          <p className="text-blue-200 text-sm" style={{ fontFamily: 'monospace' }}>
            ► Select to boost (Permanent!)
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
            basic: { bg: 'bg-blue-700', border: 'border-blue-300', text: 'text-blue-200' },
            special: { bg: 'bg-purple-700', border: 'border-purple-300', text: 'text-purple-200' },
            advanced: { bg: 'bg-orange-600', border: 'border-yellow-300', text: 'text-yellow-200' },
          };
          const colors = typeColors[option.type];

          return (
            <div
              key={option.id}
              onClick={() => handleSelect(option)}
              className={`
                relative ${colors.bg} border-4 ${colors.border} p-3 cursor-pointer transition-all
                ${isSelected 
                  ? 'border-white shadow-lg' 
                  : 'hover:border-yellow-200'}
              `}
              style={{ imageRendering: 'pixelated', boxShadow: isSelected ? '4px 4px 0 #000' : '2px 2px 0 #000' }}
            >
              {/* 选中标记 */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 border-2 border-black flex items-center justify-center text-sm font-bold">
                  ✓
                </div>
              )}

              <div className="flex items-center gap-3">
                {/* 图标 */}
                <div className="text-3xl">{option.icon}</div>

                {/* 信息 */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-bold text-white" style={{ fontFamily: 'monospace' }}>
                      {option.displayName}
                    </span>
                    <span className="text-xs bg-black/50 border border-white px-1" style={{ fontFamily: 'monospace' }}>
                      {option.type === 'basic' && 'BSC'}
                      {option.type === 'special' && 'SPC'}
                      {option.type === 'advanced' && 'ADV'}
                    </span>
                  </div>
                  
                  <div className="text-xs ${colors.text} mb-1" style={{ fontFamily: 'monospace' }}>
                    {option.description}
                  </div>

                  <div className="flex items-center gap-3 text-xs" style={{ fontFamily: 'monospace' }}>
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

        {/* 确认按钮 - 像素风格 */}
        <button
          onClick={handleConfirm}
          disabled={!selectedOption}
          className={`
            w-full py-3 border-4 font-bold text-lg transition-all
            ${selectedOption
              ? 'bg-green-600 border-green-300 text-white hover:bg-green-500 active:translate-y-1'
              : 'bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed'}
          `}
          style={{ 
            fontFamily: 'monospace',
            boxShadow: selectedOption ? '4px 4px 0 #000' : '2px 2px 0 #000',
            imageRendering: 'pixelated'
          }}
        >
          {selectedOption ? `► CONFIRM: ${selectedOption.displayName}` : '► SELECT STAT FIRST'}
        </button>
      </div>
    </div>
  );
};
