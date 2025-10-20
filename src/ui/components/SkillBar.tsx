// 技能快捷栏
import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { CooldownManager } from '@/game/skills/CooldownManager';

export const SkillBar: React.FC = () => {
  const skillTree = useGameStore(state => state.skillTree);
  const player = useGameStore(state => state.player);

  if (!skillTree) return null;

  const slots = [0, 1, 2, 3] as const;

  const getSkillInSlot = (slot: number) => {
    const skillId = skillTree.equippedSkills[slot];
    if (!skillId) return null;
    return skillTree.learnedSkills.get(skillId);
  };

  const handleSkillClick = (slot: number) => {
    const skill = getSkillInSlot(slot);
    if (!skill) return;

    // 检查是否可以使用
    const canUse = CooldownManager.canUseSkill(skill.id, skill.manaCost);
    if (!canUse.canUse) {
      console.log(canUse.reason);
      return;
    }

    // 释放技能（这里需要与游戏引擎集成）
    console.log(`释放技能：${skill.name}`);
  };

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40">
      <div className="flex gap-2">
        {slots.map(slot => {
          const skill = getSkillInSlot(slot);
          const isOnCooldown = skill ? CooldownManager.isOnCooldown(skill.id) : false;
          const cooldownProgress = skill ? CooldownManager.getCooldownProgress(skill.id) : 0;
          const remainingTime = skill ? CooldownManager.getRemainingTime(skill.id) : 0;
          const canAfford = skill ? player.mana >= skill.manaCost : true;

          return (
            <div
              key={slot}
              className={`
                relative w-16 h-16 rounded-lg border-2 transition-all
                ${skill
                  ? isOnCooldown || !canAfford
                    ? 'border-gray-600 bg-gray-800/80 cursor-not-allowed'
                    : 'border-yellow-600 bg-gray-800/80 cursor-pointer hover:border-yellow-400 hover:scale-110'
                  : 'border-gray-600 bg-gray-900/50'
                }
              `}
              onClick={() => handleSkillClick(slot)}
            >
              {skill ? (
                <>
                  {/* 技能图标 */}
                  <div className={`
                    absolute inset-0 flex items-center justify-center text-3xl
                    ${isOnCooldown || !canAfford ? 'opacity-40' : ''}
                  `}>
                    {skill.icon}
                  </div>

                  {/* 冷却遮罩 */}
                  {isOnCooldown && (
                    <>
                      <div
                        className="absolute inset-0 bg-black/60 rounded-lg"
                        style={{
                          clipPath: `polygon(50% 50%, 50% 0%, ${
                            cooldownProgress >= 0.875 ? '100%' :
                            cooldownProgress >= 0.625 ? `100% ${(1 - (cooldownProgress - 0.625) * 4) * 100}%` :
                            cooldownProgress >= 0.375 ? `${(1 - (cooldownProgress - 0.375) * 4) * 100}% 100%` :
                            cooldownProgress >= 0.125 ? `0% ${(cooldownProgress - 0.125) * 4 * 100}%` :
                            `${cooldownProgress * 8 * 100}% 0%`
                          })`,
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-bold text-sm drop-shadow-lg">
                          {Math.ceil(remainingTime)}
                        </span>
                      </div>
                    </>
                  )}

                  {/* 魔力不足提示 */}
                  {!canAfford && !isOnCooldown && (
                    <div className="absolute inset-0 bg-blue-900/60 rounded-lg flex items-center justify-center">
                      <span className="text-blue-300 text-xs font-bold">MP不足</span>
                    </div>
                  )}

                  {/* 技能等级 */}
                  <div className="absolute bottom-0 right-0 bg-black/70 rounded-tl px-1">
                    <span className="text-yellow-400 text-xs font-bold">
                      {skill.currentLevel}
                    </span>
                  </div>

                  {/* 快捷键提示 */}
                  <div className="absolute top-0 left-0 bg-black/70 rounded-br px-1">
                    <span className="text-gray-300 text-xs font-bold">
                      {slot + 1}
                    </span>
                  </div>

                  {/* 魔力消耗 */}
                  <div className="absolute bottom-0 left-0 bg-black/70 rounded-tr px-1">
                    <span className="text-blue-400 text-xs font-bold">
                      {skill.manaCost}
                    </span>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-600 text-xs text-center">
                    未装备<br/>按{slot + 1}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 提示文本 */}
      <div className="text-center mt-2">
        <p className="text-gray-400 text-xs">
          按 K 打开技能树 • 按 1-4 使用技能
        </p>
      </div>
    </div>
  );
};
