// 技能树UI组件
import React, { useState } from 'react';
import { useGameStore } from '@store/gameStore';
import type { Skill } from '@/types/skills';
import { getAllFireSkills } from '@/data/skills/fireSkills';
import { getAllWaterSkills } from '@/data/skills/waterSkills';
import { getAllWindSkills } from '@/data/skills/windSkills';
import { getAllEarthSkills } from '@/data/skills/earthSkills';

type ElementTab = 'fire' | 'water' | 'wind' | 'earth';

export const SkillTree: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ElementTab>('fire');
  const player = useGameStore((state) => state.player);
  const skillPoints = player.level; // 简化：等级=技能点

  const elementSkills = {
    fire: getAllFireSkills(),
    water: getAllWaterSkills(),
    wind: getAllWindSkills(),
    earth: getAllEarthSkills(),
  };

  const currentSkills = elementSkills[activeTab];

  const elementColors = {
    fire: '#ff4400',
    water: '#00aaff',
    wind: '#88ff88',
    earth: '#996633',
  };

  const elementIcons = {
    fire: '🔥',
    water: '💧',
    wind: '🌪️',
    earth: '🪨',
  };

  const handleLearnSkill = (skill: Skill) => {
    // TODO: 实现技能学习逻辑
    console.log('学习技能:', skill.name);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
         style={{ imageRendering: 'pixelated' }}>
      <div className="w-[90%] h-[90%] bg-gray-900 border-4 border-yellow-400"
           style={{ boxShadow: '0 8px 0 #ca8a04' }}>
        
        {/* 标题栏 */}
        <div className="bg-gray-800 border-b-4 border-yellow-400 p-4 flex justify-between items-center">
          <h2 className="text-3xl font-black text-yellow-400" style={{ fontFamily: 'monospace' }}>
            ◆ SKILL TREE ◆
          </h2>
          <div className="flex gap-4 items-center">
            <span className="text-white text-xl" style={{ fontFamily: 'monospace' }}>
              SKILL POINTS: <span className="text-yellow-400 font-bold">{skillPoints}</span>
            </span>
            <button className="px-4 py-2 bg-red-600 border-2 border-white text-white font-bold hover:bg-red-700"
                    style={{ fontFamily: 'monospace', boxShadow: '2px 2px 0 #000' }}>
              ✕ CLOSE
            </button>
          </div>
        </div>

        {/* 元素标签页 */}
        <div className="flex border-b-4 border-gray-700">
          {(['fire', 'water', 'wind', 'earth'] as ElementTab[]).map((element) => (
            <button
              key={element}
              onClick={() => setActiveTab(element)}
              className={`flex-1 py-3 border-r-2 border-gray-700 font-bold text-lg transition-colors ${
                activeTab === element
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
              }`}
              style={{
                fontFamily: 'monospace',
                backgroundColor: activeTab === element ? elementColors[element] : undefined,
              }}
            >
              {elementIcons[element]} {element.toUpperCase()}
            </button>
          ))}
        </div>

        {/* 技能列表 */}
        <div className="p-6 h-[calc(100%-140px)] overflow-y-auto">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((tier) => (
              <div key={tier} className="space-y-3">
                <div className="text-center mb-4">
                  <div className="inline-block bg-gray-800 border-2 border-gray-600 px-4 py-2">
                    <span className="text-yellow-400 font-bold text-lg" style={{ fontFamily: 'monospace' }}>
                      TIER {tier}
                    </span>
                  </div>
                </div>

                {currentSkills
                  .filter((skill) => skill.tier === tier)
                  .map((skill) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      elementColor={elementColors[activeTab]}
                      onLearn={handleLearnSkill}
                      canLearn={skillPoints >= skill.cost && player.level >= skill.requiredLevel}
                    />
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface SkillCardProps {
  skill: Skill;
  elementColor: string;
  onLearn: (skill: Skill) => void;
  canLearn: boolean;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, elementColor, onLearn, canLearn }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className="relative bg-gray-800 border-2 border-gray-600 p-3 cursor-pointer transition-all hover:border-yellow-400"
      style={{ boxShadow: '2px 2px 0 #000' }}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      {/* 技能图标 */}
      <div
        className="w-16 h-16 mx-auto mb-2 flex items-center justify-center text-4xl border-2 border-gray-600"
        style={{ backgroundColor: elementColor + '40' }}
      >
        {skill.icon}
      </div>

      {/* 技能名称 */}
      <div className="text-center text-white font-bold text-sm mb-1" style={{ fontFamily: 'monospace' }}>
        {skill.name}
      </div>

      {/* 技能等级 */}
      <div className="text-center text-gray-400 text-xs mb-2" style={{ fontFamily: 'monospace' }}>
        Lv {skill.currentLevel}/{skill.maxLevel}
      </div>

      {/* 消耗 */}
      <div className="flex justify-between text-xs" style={{ fontFamily: 'monospace' }}>
        <span className="text-yellow-400">{skill.cost} SP</span>
        <span className="text-blue-400">{skill.manaCost} MP</span>
      </div>

      {/* 学习按钮 */}
      {canLearn && skill.currentLevel < skill.maxLevel && (
        <button
          onClick={() => onLearn(skill)}
          className="w-full mt-2 py-1 bg-green-600 border border-white text-white text-xs font-bold hover:bg-green-700"
          style={{ fontFamily: 'monospace' }}
        >
          LEARN
        </button>
      )}

      {/* 详情提示 */}
      {showDetails && (
        <div
          className="absolute left-full ml-2 top-0 w-64 bg-black border-2 border-yellow-400 p-3 z-10"
          style={{ boxShadow: '4px 4px 0 #000' }}
        >
          <div className="text-yellow-400 font-bold mb-2" style={{ fontFamily: 'monospace' }}>
            {skill.name}
          </div>
          <div className="text-gray-300 text-sm mb-2" style={{ fontFamily: 'monospace' }}>
            {skill.description}
          </div>
          <div className="text-xs text-gray-400 space-y-1" style={{ fontFamily: 'monospace' }}>
            <div>Damage: {skill.damage || 0}</div>
            <div>Cooldown: {(skill.cooldown / 1000).toFixed(1)}s</div>
            <div>Mana: {skill.manaCost}</div>
            {skill.radius && <div>Radius: {skill.radius}</div>}
            {skill.duration && <div>Duration: {(skill.duration / 1000).toFixed(1)}s</div>}
          </div>
          {skill.prerequisites.length > 0 && (
            <div className="mt-2 text-red-400 text-xs" style={{ fontFamily: 'monospace' }}>
              Requires: {skill.prerequisites.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
