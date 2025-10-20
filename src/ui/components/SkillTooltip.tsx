// 技能提示组件
import React from 'react';
import type { Skill } from '@/types/skills';

interface SkillTooltipProps {
  skill: Skill;
  position?: { x: number; y: number };
  showComparison?: boolean;
}

export const SkillTooltip: React.FC<SkillTooltipProps> = ({
  skill,
  position,
  showComparison = false,
}) => {
  const style: React.CSSProperties = position
    ? {
        position: 'fixed',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -105%)',
      }
    : {};

  return (
    <div
      className="bg-gradient-to-b from-gray-900 to-black border-2 border-yellow-600 rounded-lg p-4 shadow-2xl z-50 max-w-sm"
      style={style}
    >
      {/* 技能头部 */}
      <div className="flex items-center gap-3 mb-3">
        <div className="text-4xl">{skill.icon}</div>
        <div>
          <h3 className="text-xl font-bold text-yellow-400">{skill.name}</h3>
          {skill.currentLevel > 0 && (
            <p className="text-sm text-gray-400">
              Lv {skill.currentLevel}/{skill.maxLevel}
            </p>
          )}
        </div>
      </div>

      {/* 描述 */}
      <p className="text-gray-300 text-sm mb-3">{skill.description}</p>

      <div className="border-t border-gray-700 my-3"></div>

      {/* 技能属性 */}
      <div className="space-y-1 text-sm">
        {skill.damage && (
          <div className="flex justify-between">
            <span className="text-gray-400">💥 伤害:</span>
            <span className="text-red-400 font-bold">
              {skill.damage}
              {skill.currentLevel > 1 && (
                <span className="text-green-400 text-xs ml-1">
                  (+{Math.floor(skill.damage * (skill.currentLevel - 1) * 0.2)})
                </span>
              )}
            </span>
          </div>
        )}

        {skill.healing && (
          <div className="flex justify-between">
            <span className="text-gray-400">💚 治疗:</span>
            <span className="text-green-400 font-bold">
              {skill.healing}
              {skill.currentLevel > 1 && (
                <span className="text-green-400 text-xs ml-1">
                  (+{Math.floor(skill.healing * (skill.currentLevel - 1) * 0.2)})
                </span>
              )}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-400">💧 魔力消耗:</span>
          <span className="text-blue-400 font-bold">{skill.manaCost}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">⏱️ 冷却时间:</span>
          <span className="text-purple-400 font-bold">{skill.cooldown}秒</span>
        </div>

        {skill.range && (
          <div className="flex justify-between">
            <span className="text-gray-400">📏 施法距离:</span>
            <span className="text-yellow-400 font-bold">{skill.range}</span>
          </div>
        )}

        {skill.radius && (
          <div className="flex justify-between">
            <span className="text-gray-400">🎯 作用范围:</span>
            <span className="text-orange-400 font-bold">{skill.radius}</span>
          </div>
        )}

        {skill.duration && (
          <div className="flex justify-between">
            <span className="text-gray-400">⏳ 持续时间:</span>
            <span className="text-cyan-400 font-bold">{skill.duration}秒</span>
          </div>
        )}
      </div>

      {/* 特殊效果 */}
      {skill.effects && skill.effects.length > 0 && (
        <>
          <div className="border-t border-gray-700 my-3"></div>
          <div className="space-y-1">
            <p className="text-yellow-400 text-xs font-bold mb-1">特殊效果:</p>
            {skill.effects.map((effect, index) => (
              <div key={index} className="text-xs text-gray-300 flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <span>
                  {getEffectDescription(effect.type, effect.value, effect.duration)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 融合技能标记 */}
      {skill.isFusionSkill && skill.fusionRequirements && (
        <>
          <div className="border-t border-gray-700 my-3"></div>
          <div className="bg-purple-900/30 rounded p-2 border border-purple-500">
            <p className="text-purple-300 text-xs font-bold mb-1">⚡ 融合技能</p>
            <p className="text-purple-200 text-xs">
              需要 {getElementName(skill.fusionRequirements.elementType)} 精通 Lv{skill.fusionRequirements.elementLevel}
            </p>
          </div>
        </>
      )}

      {/* 学习要求 */}
      {skill.currentLevel === 0 && (
        <>
          <div className="border-t border-gray-700 my-3"></div>
          <div className="space-y-1 text-xs">
            <p className="text-gray-400">学习要求:</p>
            <div className="text-gray-300">
              • 需要等级: <span className="text-yellow-400">Lv{skill.requiredLevel}</span>
            </div>
            <div className="text-gray-300">
              • 消耗技能点: <span className="text-yellow-400">{skill.cost}</span>
            </div>
            {skill.prerequisites.length > 0 && (
              <div className="text-gray-300">
                • 前置技能: <span className="text-red-400">需要学习前置技能</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* 升级信息 */}
      {skill.currentLevel > 0 && skill.currentLevel < skill.maxLevel && showComparison && (
        <>
          <div className="border-t border-gray-700 my-3"></div>
          <div className="bg-blue-900/30 rounded p-2 border border-blue-500">
            <p className="text-blue-300 text-xs font-bold mb-1">⬆️ 下一级</p>
            <div className="text-xs text-blue-200 space-y-1">
              {skill.damage && (
                <div>
                  伤害: {skill.damage} → <span className="text-green-400">
                    {Math.floor(skill.damage * (1 + skill.currentLevel * 0.2))}
                  </span>
                </div>
              )}
              {skill.healing && (
                <div>
                  治疗: {skill.healing} → <span className="text-green-400">
                    {Math.floor(skill.healing * (1 + skill.currentLevel * 0.2))}
                  </span>
                </div>
              )}
              <div>
                消耗技能点: <span className="text-yellow-400">{skill.currentLevel}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 满级标记 */}
      {skill.currentLevel >= skill.maxLevel && (
        <>
          <div className="border-t border-gray-700 my-3"></div>
          <div className="bg-yellow-900/30 rounded p-2 border border-yellow-500 text-center">
            <p className="text-yellow-400 text-sm font-bold">✨ 已达最高等级 ✨</p>
          </div>
        </>
      )}
    </div>
  );
};

// 辅助函数
function getEffectDescription(type: string, value: number, duration: number): string {
  switch (type) {
    case 'burn':
      return `造成燃烧效果，每秒${value}点火焰伤害，持续${duration}秒`;
    case 'freeze':
      return `冻结目标，持续${duration}秒`;
    case 'slow':
      return `减速${value}%，持续${duration}秒`;
    case 'stun':
      return `晕眩目标，持续${duration}秒`;
    case 'heal':
      return `每秒恢复${value}点生命值，持续${duration}秒`;
    case 'shield':
      return `获得${value}点护盾，持续${duration}秒`;
    case 'buff':
      return `提升${value}%属性，持续${duration}秒`;
    case 'debuff':
      return `削弱目标，每秒${value}点伤害，持续${duration}秒`;
    default:
      return '未知效果';
  }
}

function getElementName(element: string): string {
  const names: Record<string, string> = {
    fire: '火',
    water: '水',
    wind: '风',
    earth: '土',
  };
  return names[element] || element;
}
