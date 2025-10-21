// 技能快捷栏UI组件
import React from 'react';
import { useGameStore } from '@store/gameStore';
import type { Skill } from '@/types/skills';

interface SkillHotbarProps {
  skills: Skill[];
  onCastSkill: (skill: Skill) => void;
}

export const SkillHotbar: React.FC<SkillHotbarProps> = ({ skills, onCastSkill }) => {
  const player = useGameStore((state) => state.player);
  // TODO: 添加mp属性到PlayerData类型定义
  const currentMp = (player as any).mp || 100;

  const handleKeyPress = (index: number) => {
    const skill = skills[index];
    if (skill && currentMp >= skill.manaCost) {
      onCastSkill(skill);
    }
  };

  // 监听键盘事件
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, number> = {
        '1': 0,
        '2': 1,
        '3': 2,
        '4': 3,
        '5': 4,
        '6': 5,
      };

      const index = keyMap[e.key];
      if (index !== undefined) {
        handleKeyPress(index);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [skills]);

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 flex gap-2"
         style={{ imageRendering: 'pixelated' }}>
      {skills.slice(0, 6).map((skill, index) => (
        <SkillSlot
          key={skill?.id || index}
          skill={skill}
          hotkey={(index + 1).toString()}
          currentMana={currentMp}
          onClick={() => skill && onCastSkill(skill)}
        />
      ))}
    </div>
  );
};

interface SkillSlotProps {
  skill?: Skill;
  hotkey: string;
  currentMana: number;
  onClick: () => void;
}

const SkillSlot: React.FC<SkillSlotProps> = ({ skill, hotkey, currentMana, onClick }) => {
  if (!skill) {
    return (
      <div className="w-16 h-16 bg-gray-800 border-2 border-gray-600 flex items-center justify-center relative"
           style={{ boxShadow: '2px 2px 0 #000' }}>
        <span className="absolute top-1 left-1 text-xs text-gray-600 font-bold" style={{ fontFamily: 'monospace' }}>
          {hotkey}
        </span>
        <span className="text-gray-600 text-2xl">?</span>
      </div>
    );
  }

  const canCast = currentMana >= skill.manaCost;
  const elementColors: Record<string, string> = {
    fire: '#ff4400',
    water: '#00aaff',
    wind: '#88ff88',
    earth: '#996633',
  };
  const borderColor = elementColors[skill.elementType || ''] || '#999';

  return (
    <div
      className={`w-16 h-16 border-2 flex flex-col items-center justify-center relative cursor-pointer transition-all ${
        canCast ? 'hover:scale-110 hover:brightness-125' : 'opacity-50 cursor-not-allowed'
      }`}
      style={{
        backgroundColor: skill.elementType ? elementColors[skill.elementType] + '40' : '#444',
        borderColor: canCast ? borderColor : '#666',
        boxShadow: canCast ? `2px 2px 0 #000, 0 0 8px ${borderColor}` : '2px 2px 0 #000',
      }}
      onClick={canCast ? onClick : undefined}
    >
      {/* 快捷键 */}
      <span className="absolute top-1 left-1 text-xs text-white font-bold bg-black bg-opacity-60 px-1"
            style={{ fontFamily: 'monospace' }}>
        {hotkey}
      </span>

      {/* 技能图标 */}
      <div className="text-3xl mb-1">
        {skill.icon}
      </div>

      {/* 魔力消耗 */}
      <div className="absolute bottom-1 right-1 text-xs font-bold bg-blue-900 bg-opacity-80 px-1"
           style={{ fontFamily: 'monospace', color: '#00aaff' }}>
        {skill.manaCost}
      </div>

      {/* 冷却遮罩 - TODO: 添加冷却计时器 */}
    </div>
  );
};
