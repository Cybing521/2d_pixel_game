// 职业选择界面
import React, { useState } from 'react';
import type { ClassType } from '@/types/skills';
import { getAllClasses } from '@/data/classes';
import { SkillTreeSystem } from '@/systems/SkillTreeSystem';
import { useGameStore } from '@/store/gameStore';

export const ClassSelectionPanel: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);
  const [hoveredClass, setHoveredClass] = useState<ClassType | null>(null);
  const player = useGameStore(state => state.player);
  const skillTree = useGameStore(state => state.skillTree);

  const classes = getAllClasses();

  // 检查是否可以选择职业
  const canSelectClass = player.level >= 5 && !skillTree;

  const handleSelectClass = () => {
    if (!selectedClass || !canSelectClass) return;

    // 选择职业
    SkillTreeSystem.selectClass(selectedClass);
    
    // 关闭面板（通过父组件控制）
    useGameStore.getState().toggleUI('showSkillTree');
  };

  const displayClass = hoveredClass || selectedClass;
  const classData = displayClass ? classes.find(c => c.id === displayClass) : null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-8 max-w-6xl w-full mx-4 border-4 border-yellow-600">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-yellow-400 mb-2">选择职业</h2>
          <p className="text-gray-300">Lv5 解锁 • 职业选择后无法更改</p>
          {!canSelectClass && (
            <p className="text-red-400 mt-2">
              {player.level < 5 ? `需要等级5（当前Lv${player.level}）` : '已选择职业'}
            </p>
          )}
        </div>

        {/* 职业卡片 */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {classes.map(cls => (
            <div
              key={cls.id}
              className={`
                relative cursor-pointer rounded-lg p-6 border-4 transition-all
                ${selectedClass === cls.id ? 'border-yellow-400 bg-yellow-900/30' : 'border-gray-600 bg-gray-800/50'}
                ${hoveredClass === cls.id ? 'scale-105 shadow-lg shadow-yellow-500/50' : ''}
                ${!canSelectClass ? 'opacity-50 cursor-not-allowed' : 'hover:border-yellow-500'}
              `}
              onClick={() => canSelectClass && setSelectedClass(cls.id)}
              onMouseEnter={() => setHoveredClass(cls.id)}
              onMouseLeave={() => setHoveredClass(null)}
            >
              {/* 职业图标 */}
              <div className="text-6xl text-center mb-4">{cls.icon}</div>
              
              {/* 职业名称 */}
              <h3 className="text-2xl font-bold text-center text-yellow-300 mb-2">
                {cls.nameZh}
              </h3>
              <p className="text-sm text-gray-400 text-center">{cls.name}</p>

              {/* 选中标记 */}
              {selectedClass === cls.id && (
                <div className="absolute top-2 right-2">
                  <span className="text-yellow-400 text-2xl">✓</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 职业详情 */}
        {classData && (
          <div className="bg-gray-800/80 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-6">
              {/* 左侧：描述和特殊机制 */}
              <div>
                <h3 className="text-xl font-bold text-yellow-400 mb-3">职业介绍</h3>
                <p className="text-gray-300 mb-4">{classData.description}</p>

                <h4 className="text-lg font-bold text-yellow-400 mb-2">
                  特殊机制：{classData.specialMechanic.name}
                </h4>
                <p className="text-gray-300 text-sm">
                  {classData.specialMechanic.description}
                </p>
              </div>

              {/* 右侧：属性加成 */}
              <div>
                <h3 className="text-xl font-bold text-yellow-400 mb-3">属性加成</h3>
                <div className="space-y-2">
                  {classData.baseStats.healthBonus !== 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">❤️ 最大生命值</span>
                      <span className={classData.baseStats.healthBonus > 0 ? 'text-green-400' : 'text-red-400'}>
                        {classData.baseStats.healthBonus > 0 ? '+' : ''}{classData.baseStats.healthBonus}
                      </span>
                    </div>
                  )}
                  {classData.baseStats.manaBonus !== 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">💧 最大魔力值</span>
                      <span className={classData.baseStats.manaBonus > 0 ? 'text-green-400' : 'text-red-400'}>
                        {classData.baseStats.manaBonus > 0 ? '+' : ''}{classData.baseStats.manaBonus}
                      </span>
                    </div>
                  )}
                  {classData.baseStats.attackBonus !== 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">⚔️ 攻击力</span>
                      <span className={classData.baseStats.attackBonus > 0 ? 'text-green-400' : 'text-red-400'}>
                        {classData.baseStats.attackBonus > 0 ? '+' : ''}{classData.baseStats.attackBonus}
                      </span>
                    </div>
                  )}
                  {classData.baseStats.defenseBonus !== 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">🛡️ 防御力</span>
                      <span className={classData.baseStats.defenseBonus > 0 ? 'text-green-400' : 'text-red-400'}>
                        {classData.baseStats.defenseBonus > 0 ? '+' : ''}{classData.baseStats.defenseBonus}
                      </span>
                    </div>
                  )}
                  {classData.baseStats.speedBonus !== 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">👟 移动速度</span>
                      <span className={classData.baseStats.speedBonus > 0 ? 'text-green-400' : 'text-red-400'}>
                        {classData.baseStats.speedBonus > 0 ? '+' : ''}{classData.baseStats.speedBonus}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 按钮 */}
        <div className="flex justify-center gap-4">
          <button
            className="px-8 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-bold transition-colors"
            onClick={() => useGameStore.getState().toggleUI('showSkillTree')}
          >
            取消
          </button>
          <button
            className={`
              px-8 py-3 rounded-lg font-bold transition-colors
              ${selectedClass && canSelectClass
                ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
            onClick={handleSelectClass}
            disabled={!selectedClass || !canSelectClass}
          >
            确认选择
          </button>
        </div>
      </div>
    </div>
  );
};
