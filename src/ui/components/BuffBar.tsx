// 增益/减益条组件
import React, { useEffect, useState } from 'react';
import { ElementalEffects } from '@/game/effects/ElementalEffects';

export const BuffBar: React.FC = () => {
  const [effects, setEffects] = useState(ElementalEffects.getActiveEffects('player'));

  useEffect(() => {
    // 每秒更新一次效果列表
    const interval = setInterval(() => {
      setEffects(ElementalEffects.getActiveEffects('player'));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  if (effects.length === 0) return null;

  // 分类效果
  const buffs = effects.filter(e => ['buff', 'shield', 'heal'].includes(e.type));
  const debuffs = effects.filter(e => ['debuff', 'burn', 'freeze', 'slow', 'stun'].includes(e.type));

  return (
    <div className="fixed top-24 right-4 z-40 space-y-2">
      {/* 增益效果 */}
      {buffs.length > 0 && (
        <div className="space-y-1">
          {buffs.map(effect => (
            <BuffIcon key={effect.id} effect={effect} isPositive={true} />
          ))}
        </div>
      )}

      {/* 减益效果 */}
      {debuffs.length > 0 && (
        <div className="space-y-1">
          {debuffs.map(effect => (
            <BuffIcon key={effect.id} effect={effect} isPositive={false} />
          ))}
        </div>
      )}
    </div>
  );
};

interface BuffIconProps {
  effect: any;
  isPositive: boolean;
}

const BuffIcon: React.FC<BuffIconProps> = ({ effect, isPositive }) => {
  const icon = getEffectIcon(effect.type);
  const timeLeft = Math.ceil(effect.remainingTime);
  const progress = effect.remainingTime / effect.duration;

  return (
    <div
      className={`
        relative w-12 h-12 rounded-lg border-2 transition-all
        ${isPositive
          ? 'border-green-500 bg-green-900/80'
          : 'border-red-500 bg-red-900/80'
        }
      `}
      title={ElementalEffects.getEffectDescription(effect)}
    >
      {/* 图标 */}
      <div className="absolute inset-0 flex items-center justify-center text-2xl">
        {icon}
      </div>

      {/* 时间进度条 */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
        <div
          className={`h-full transition-all ${
            isPositive ? 'bg-green-400' : 'bg-red-400'
          }`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* 剩余时间 */}
      <div className="absolute top-0 right-0 bg-black/70 rounded-bl px-1">
        <span className="text-white text-xs font-bold">{timeLeft}</span>
      </div>

      {/* 层数（如果可叠加） */}
      {effect.stackable && (
        <div className="absolute top-0 left-0 bg-black/70 rounded-br px-1">
          <span className="text-yellow-400 text-xs font-bold">×1</span>
        </div>
      )}
    </div>
  );
};

function getEffectIcon(type: string): string {
  const icons: Record<string, string> = {
    burn: '🔥',
    freeze: '❄️',
    slow: '🐌',
    stun: '💫',
    heal: '💚',
    shield: '🛡️',
    buff: '⬆️',
    debuff: '⬇️',
  };
  return icons[type] || '❓';
}
