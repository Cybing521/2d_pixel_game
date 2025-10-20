// 技能树面板
import React, { useState } from 'react';
import type { Skill, ElementType } from '@/types/skills';
import { useGameStore } from '@/store/gameStore';
import { SkillTreeSystem } from '@/systems/SkillTreeSystem';
import { getAllElements } from '@/data/elements';

export const SkillTreePanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'class' | ElementType>('class');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  
  const skillTree = useGameStore(state => state.skillTree);
  const player = useGameStore(state => state.player);

  if (!skillTree) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">未选择职业</h2>
          <p className="text-gray-300 mb-4">
            需要达到Lv5并选择职业后才能打开技能树
          </p>
          <button
            className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold"
            onClick={() => useGameStore.getState().toggleUI('showSkillTree')}
          >
            关闭
          </button>
        </div>
      </div>
    );
  }

  const classSkills = SkillTreeSystem.getClassSkills(skillTree.selectedClass);
  const elements = getAllElements();

  // 按层级分组技能
  const groupedSkills = classSkills
    .filter(s => !s.isFusionSkill)
    .reduce((acc, skill) => {
      if (!acc[skill.tier]) acc[skill.tier] = [];
      acc[skill.tier].push(skill);
      return acc;
    }, {} as Record<number, Skill[]>);

  const handleLearnSkill = (skillId: string) => {
    if (SkillTreeSystem.canLearnSkill(skillId)) {
      SkillTreeSystem.learnSkill(skillId);
    }
  };

  const handleUpgradeSkill = (skillId: string) => {
    if (SkillTreeSystem.canUpgradeSkill(skillId)) {
      SkillTreeSystem.upgradeSkill(skillId);
    }
  };

  const getSkillStatus = (skill: Skill): 'locked' | 'available' | 'learned' | 'maxed' => {
    const learned = skillTree.learnedSkills.get(skill.id);
    if (!learned) {
      return SkillTreeSystem.canLearnSkill(skill.id) ? 'available' : 'locked';
    }
    return learned.currentLevel >= learned.maxLevel ? 'maxed' : 'learned';
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg w-full max-w-7xl h-[90vh] flex flex-col border-4 border-yellow-600">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-700">
          <div>
            <h2 className="text-3xl font-bold text-yellow-400">技能树</h2>
            <p className="text-gray-400">
              可用技能点: <span className="text-yellow-400 font-bold">{skillTree.availablePoints}</span>
            </p>
          </div>
          <button
            className="text-gray-400 hover:text-white text-3xl"
            onClick={() => useGameStore.getState().toggleUI('showSkillTree')}
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* 标签栏 */}
          <div className="w-48 bg-gray-900/50 border-r-2 border-gray-700 p-4">
            <div className="space-y-2">
              <button
                className={`w-full px-4 py-3 rounded-lg font-bold text-left transition-colors ${
                  activeTab === 'class'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setActiveTab('class')}
              >
                💼 职业技能
              </button>
              
              <div className="border-t-2 border-gray-700 my-4"></div>
              
              <p className="text-gray-500 text-sm font-bold px-2 mb-2">元素精通</p>
              {elements.map(elem => (
                <button
                  key={elem.id}
                  className={`w-full px-4 py-3 rounded-lg font-bold text-left transition-colors ${
                    activeTab === elem.id
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => setActiveTab(elem.id)}
                >
                  {elem.icon} {elem.nameZh}
                </button>
              ))}
            </div>
          </div>

          {/* 主内容区 */}
          <div className="flex-1 flex overflow-hidden">
            {/* 技能树区域 */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'class' ? (
                <div className="space-y-8">
                  {[1, 2, 3, 4].map(tier => (
                    <div key={tier}>
                      <h3 className="text-xl font-bold text-yellow-400 mb-4">
                        第{tier}层 - {tier === 1 ? '基础' : tier === 2 ? '进阶' : tier === 3 ? '高级' : '终极'}技能
                      </h3>
                      <div className="grid grid-cols-4 gap-4">
                        {groupedSkills[tier]?.map(skill => {
                          const status = getSkillStatus(skill);
                          const learned = skillTree.learnedSkills.get(skill.id);
                          
                          return (
                            <div
                              key={skill.id}
                              className={`
                                relative p-4 rounded-lg border-2 cursor-pointer transition-all
                                ${status === 'locked' ? 'border-gray-600 bg-gray-800/50 opacity-50' : ''}
                                ${status === 'available' ? 'border-green-500 bg-green-900/30 hover:scale-105' : ''}
                                ${status === 'learned' ? 'border-blue-500 bg-blue-900/30' : ''}
                                ${status === 'maxed' ? 'border-yellow-500 bg-yellow-900/30' : ''}
                              `}
                              onClick={() => setSelectedSkill(skill)}
                            >
                              {/* 技能图标 */}
                              <div className="text-4xl text-center mb-2">{skill.icon}</div>
                              
                              {/* 技能名称 */}
                              <h4 className="text-sm font-bold text-center text-white mb-1">
                                {skill.name}
                              </h4>
                              
                              {/* 等级 */}
                              <p className="text-xs text-center text-gray-400">
                                {learned 
                                  ? `Lv ${learned.currentLevel}/${skill.maxLevel}`
                                  : `消耗 ${skill.cost}点`
                                }
                              </p>

                              {/* 状态标记 */}
                              {status === 'maxed' && (
                                <div className="absolute top-1 right-1 text-yellow-400 text-xs font-bold">
                                  MAX
                                </div>
                              )}
                              {status === 'locked' && (
                                <div className="absolute top-1 right-1 text-gray-500">
                                  🔒
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <h3 className="text-2xl font-bold text-yellow-400 mb-6">
                    {elements.find(e => e.id === activeTab)?.nameZh}元素精通
                  </h3>
                  <div className="bg-gray-800/50 rounded-lg p-6">
                    <p className="text-gray-300">元素精通界面（待实现）</p>
                  </div>
                </div>
              )}
            </div>

            {/* 技能详情区域 */}
            {selectedSkill && (
              <div className="w-96 bg-gray-900/80 border-l-2 border-gray-700 p-6 overflow-y-auto">
                <div className="space-y-4">
                  {/* 技能头部 */}
                  <div className="text-center">
                    <div className="text-6xl mb-2">{selectedSkill.icon}</div>
                    <h3 className="text-2xl font-bold text-yellow-400">{selectedSkill.name}</h3>
                    <p className="text-gray-400 text-sm">{selectedSkill.description}</p>
                  </div>

                  <div className="border-t-2 border-gray-700 my-4"></div>

                  {/* 技能属性 */}
                  <div className="space-y-2">
                    {selectedSkill.damage && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">💥 伤害</span>
                        <span className="text-red-400 font-bold">{selectedSkill.damage}</span>
                      </div>
                    )}
                    {selectedSkill.healing && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">💚 治疗</span>
                        <span className="text-green-400 font-bold">{selectedSkill.healing}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-300">💧 魔力消耗</span>
                      <span className="text-blue-400 font-bold">{selectedSkill.manaCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">⏱️ 冷却</span>
                      <span className="text-purple-400 font-bold">{selectedSkill.cooldown}秒</span>
                    </div>
                    {selectedSkill.range && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">📏 范围</span>
                        <span className="text-yellow-400 font-bold">{selectedSkill.range}</span>
                      </div>
                    )}
                  </div>

                  {/* 按钮 */}
                  <div className="space-y-2 pt-4">
                    {!skillTree.learnedSkills.has(selectedSkill.id) ? (
                      <button
                        className={`w-full px-4 py-3 rounded-lg font-bold ${
                          SkillTreeSystem.canLearnSkill(selectedSkill.id)
                            ? 'bg-green-600 hover:bg-green-500 text-white'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                        onClick={() => handleLearnSkill(selectedSkill.id)}
                        disabled={!SkillTreeSystem.canLearnSkill(selectedSkill.id)}
                      >
                        学习 (消耗 {selectedSkill.cost} 点)
                      </button>
                    ) : (
                      <button
                        className={`w-full px-4 py-3 rounded-lg font-bold ${
                          SkillTreeSystem.canUpgradeSkill(selectedSkill.id)
                            ? 'bg-blue-600 hover:bg-blue-500 text-white'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                        onClick={() => handleUpgradeSkill(selectedSkill.id)}
                        disabled={!SkillTreeSystem.canUpgradeSkill(selectedSkill.id)}
                      >
                        升级 (消耗 {skillTree.learnedSkills.get(selectedSkill.id)?.currentLevel || 1} 点)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
