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

  const classSkills = skillTree.selectedClass ? SkillTreeSystem.getClassSkills(skillTree.selectedClass) : [];
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" style={{ imageRendering: 'pixelated' }}>
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 w-full max-w-7xl h-[90vh] flex flex-col border-8 border-yellow-400" 
           style={{ boxShadow: '8px 8px 0 #000, inset 0 0 0 4px #1f2937' }}>
        {/* 标题栏 - 像素风格 */}
        <div className="flex items-center justify-between p-6 border-b-4 border-yellow-400 bg-black/50">
          <div>
            <h2 className="text-3xl font-black text-yellow-400" 
                style={{ fontFamily: 'monospace', textShadow: '3px 3px 0 #000' }}>
              ◆ SKILL TREE ◆
            </h2>
            <p className="text-gray-300" style={{ fontFamily: 'monospace' }}>
              POINTS: <span className="text-yellow-400 font-bold">{skillTree.availablePoints}</span>
            </p>
          </div>
          <button
            className="w-12 h-12 bg-red-600 border-4 border-white hover:bg-red-500 text-white font-black text-xl"
            style={{ fontFamily: 'monospace', boxShadow: '4px 4px 0 #000' }}
            onClick={() => useGameStore.getState().toggleUI('showSkillTree')}
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* 标签栏 - 像素风格 */}
          <div className="w-48 bg-gray-900/80 border-r-4 border-yellow-400 p-4">
            <div className="space-y-2">
              <button
                className={`w-full px-4 py-3 border-4 font-black text-left transition-all ${
                  activeTab === 'class'
                    ? 'bg-yellow-600 border-yellow-300 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
                style={{ fontFamily: 'monospace', boxShadow: '3px 3px 0 #000' }}
                onClick={() => setActiveTab('class')}
              >
                💼 CLASS
              </button>
              
              <div className="border-t-4 border-yellow-400/30 my-4"></div>
              
              <p className="text-yellow-400 text-xs font-black px-2 mb-2" style={{ fontFamily: 'monospace' }}>ELEMENTS</p>
              {elements.map(elem => (
                <button
                  key={elem.id}
                  className={`w-full px-4 py-3 border-4 font-black text-left transition-all ${
                    activeTab === elem.id
                      ? 'bg-yellow-600 border-yellow-300 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                  style={{ fontFamily: 'monospace', boxShadow: '3px 3px 0 #000' }}
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
                      <h3 className="text-xl font-black text-yellow-400 mb-4 border-b-4 border-yellow-400/50 pb-2" 
                          style={{ fontFamily: 'monospace', textShadow: '2px 2px 0 #000' }}>
                        TIER {tier} - {tier === 1 ? 'BASIC' : tier === 2 ? 'ADVANCED' : tier === 3 ? 'ELITE' : 'ULTIMATE'}
                      </h3>
                      <div className="grid grid-cols-4 gap-4">
                        {groupedSkills[tier]?.map(skill => {
                          const status = getSkillStatus(skill);
                          const learned = skillTree.learnedSkills.get(skill.id);
                          
                          return (
                            <div
                              key={skill.id}
                              className={`
                                relative p-4 border-4 cursor-pointer transition-all
                                ${status === 'locked' ? 'border-gray-600 bg-gray-800/50 opacity-50' : ''}
                                ${status === 'available' ? 'border-green-400 bg-green-900/50 hover:border-green-300' : ''}
                                ${status === 'learned' ? 'border-blue-400 bg-blue-900/50' : ''}
                                ${status === 'maxed' ? 'border-yellow-400 bg-yellow-900/50' : ''}
                              `}
                              style={{ boxShadow: '3px 3px 0 #000', imageRendering: 'pixelated' }}
                              onClick={() => setSelectedSkill(skill)}
                            >
                              {/* 技能图标 */}
                              <div className="text-4xl text-center mb-2">{skill.icon}</div>
                              
                              {/* 技能名称 */}
                              <h4 className="text-sm font-black text-center text-white mb-1" style={{ fontFamily: 'monospace' }}>
                                {skill.name}
                              </h4>
                              
                              {/* 等级 */}
                              <p className="text-xs text-center text-gray-300" style={{ fontFamily: 'monospace' }}>
                                {learned 
                                  ? `Lv ${learned.currentLevel}/${skill.maxLevel}`
                                  : `消耗 ${skill.cost}点`
                                }
                              </p>

                              {/* 状态标记 - 像素风格 */}
                              {status === 'maxed' && (
                                <div className="absolute -top-2 -right-2 w-10 h-6 bg-yellow-400 border-2 border-black flex items-center justify-center text-xs font-black" 
                                     style={{ fontFamily: 'monospace' }}>
                                  MAX
                                </div>
                              )}
                              {status === 'locked' && (
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-700 border-2 border-gray-500 flex items-center justify-center">
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

            {/* 技能详情区域 - 像素风格 */}
            {selectedSkill && (
              <div className="w-96 bg-gray-900/90 border-l-4 border-yellow-400 p-6 overflow-y-auto">
                <div className="space-y-4">
                  {/* 技能头部 - 像素风格 */}
                  <div className="text-center bg-black/50 border-4 border-yellow-400 p-4" style={{ boxShadow: '4px 4px 0 #000' }}>
                    <div className="text-6xl mb-2">{selectedSkill.icon}</div>
                    <h3 className="text-2xl font-black text-yellow-400" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0 #000' }}>
                      {selectedSkill.name}
                    </h3>
                    <p className="text-gray-300 text-sm mt-2" style={{ fontFamily: 'monospace' }}>
                      {selectedSkill.description}
                    </p>
                  </div>

                  <div className="border-t-4 border-yellow-400/50 my-4"></div>

                  {/* 技能属性 - 像素风格 */}
                  <div className="space-y-2 bg-gray-800/50 border-4 border-gray-700 p-4" style={{ boxShadow: '3px 3px 0 #000' }}>
                    {selectedSkill.damage && (
                      <div className="flex justify-between border-b-2 border-gray-700 pb-1" style={{ fontFamily: 'monospace' }}>
                        <span className="text-gray-300 font-bold">💥 DMG</span>
                        <span className="text-red-400 font-black">{selectedSkill.damage}</span>
                      </div>
                    )}
                    {selectedSkill.healing && (
                      <div className="flex justify-between border-b-2 border-gray-700 pb-1" style={{ fontFamily: 'monospace' }}>
                        <span className="text-gray-300 font-bold">💚 HEAL</span>
                        <span className="text-green-400 font-black">{selectedSkill.healing}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-b-2 border-gray-700 pb-1" style={{ fontFamily: 'monospace' }}>
                      <span className="text-gray-300 font-bold">💧 MANA</span>
                      <span className="text-blue-400 font-black">{selectedSkill.manaCost}</span>
                    </div>
                    <div className="flex justify-between border-b-2 border-gray-700 pb-1" style={{ fontFamily: 'monospace' }}>
                      <span className="text-gray-300 font-bold">⏱️ CD</span>
                      <span className="text-purple-400 font-black">{selectedSkill.cooldown}s</span>
                    </div>
                    {selectedSkill.range && (
                      <div className="flex justify-between" style={{ fontFamily: 'monospace' }}>
                        <span className="text-gray-300 font-bold">📏 RANGE</span>
                        <span className="text-yellow-400 font-black">{selectedSkill.range}</span>
                      </div>
                    )}
                  </div>

                  {/* 按钮 - 像素风格 */}
                  <div className="space-y-2 pt-4">
                    {!skillTree.learnedSkills.has(selectedSkill.id) ? (
                      <button
                        className={`w-full px-4 py-3 border-4 font-black transition-all ${
                          SkillTreeSystem.canLearnSkill(selectedSkill.id)
                            ? 'bg-green-600 border-green-300 hover:bg-green-500 text-white active:translate-y-1'
                            : 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                        }`}
                        style={{ 
                          fontFamily: 'monospace', 
                          boxShadow: SkillTreeSystem.canLearnSkill(selectedSkill.id) ? '4px 4px 0 #000' : '2px 2px 0 #000'
                        }}
                        onClick={() => handleLearnSkill(selectedSkill.id)}
                        disabled={!SkillTreeSystem.canLearnSkill(selectedSkill.id)}
                      >
                        ► LEARN ({selectedSkill.cost} PT)
                      </button>
                    ) : (
                      <button
                        className={`w-full px-4 py-3 border-4 font-black transition-all ${
                          SkillTreeSystem.canUpgradeSkill(selectedSkill.id)
                            ? 'bg-blue-600 border-blue-300 hover:bg-blue-500 text-white active:translate-y-1'
                            : 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                        }`}
                        style={{ 
                          fontFamily: 'monospace', 
                          boxShadow: SkillTreeSystem.canUpgradeSkill(selectedSkill.id) ? '4px 4px 0 #000' : '2px 2px 0 #000'
                        }}
                        onClick={() => handleUpgradeSkill(selectedSkill.id)}
                        disabled={!SkillTreeSystem.canUpgradeSkill(selectedSkill.id)}
                      >
                        ▲ UPGRADE ({skillTree.learnedSkills.get(selectedSkill.id)?.currentLevel || 1} PT)
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
