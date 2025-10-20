// 升级选项数据定义
import type { EntityStats } from '@/types/entities';

export interface LevelUpOption {
  id: string;
  type: 'basic' | 'special' | 'advanced';
  statType: keyof EntityStats;
  value: number;
  displayName: string;
  icon: string;
  description: string;
  requiredLevel: number;
  weight: number;  // 权重，用于随机选择
}

// 所有可用的升级选项
export const LEVEL_UP_OPTIONS: LevelUpOption[] = [
  // ========== 基础属性 (60%权重) ==========
  {
    id: 'hp_boost',
    type: 'basic',
    statType: 'maxHealth',
    value: 20,
    displayName: '最大生命值',
    icon: '❤️',
    description: '增加20点最大生命值',
    requiredLevel: 1,
    weight: 60,
  },
  {
    id: 'mp_boost',
    type: 'basic',
    statType: 'maxMana',
    value: 15,
    displayName: '最大魔力值',
    icon: '💧',
    description: '增加15点最大魔力值',
    requiredLevel: 1,
    weight: 60,
  },
  {
    id: 'atk_boost',
    type: 'basic',
    statType: 'attack',
    value: 5,
    displayName: '攻击力',
    icon: '⚔️',
    description: '增加5点攻击力',
    requiredLevel: 1,
    weight: 60,
  },
  {
    id: 'mag_boost',
    type: 'basic',
    statType: 'magic',
    value: 5,
    displayName: '魔法强度',
    icon: '🔮',
    description: '增加5点魔法强度',
    requiredLevel: 1,
    weight: 60,
  },
  {
    id: 'def_boost',
    type: 'basic',
    statType: 'defense',
    value: 3,
    displayName: '防御力',
    icon: '🛡️',
    description: '增加3点防御力',
    requiredLevel: 1,
    weight: 60,
  },
  {
    id: 'spd_boost',
    type: 'basic',
    statType: 'speed',
    value: 10,
    displayName: '移动速度',
    icon: '👟',
    description: '增加10点移动速度',
    requiredLevel: 1,
    weight: 60,
  },
  
  // ========== 特殊属性 (30%权重) ==========
  {
    id: 'crit_rate',
    type: 'special',
    statType: 'critRate',
    value: 3,
    displayName: '暴击率',
    icon: '⚡',
    description: '增加3%暴击率',
    requiredLevel: 1,
    weight: 30,
  },
  {
    id: 'crit_damage',
    type: 'special',
    statType: 'critDamage',
    value: 15,
    displayName: '暴击伤害',
    icon: '💥',
    description: '暴击伤害提升15%',
    requiredLevel: 1,
    weight: 30,
  },
  {
    id: 'cooldown_reduction',
    type: 'special',
    statType: 'cooldownReduction',
    value: 5,
    displayName: '技能冷却',
    icon: '⏱️',
    description: '减少5%技能冷却时间',
    requiredLevel: 1,
    weight: 30,
  },
  {
    id: 'exp_bonus',
    type: 'special',
    statType: 'expBonus',
    value: 10,
    displayName: '经验加成',
    icon: '📚',
    description: '获得经验增加10%',
    requiredLevel: 1,
    weight: 30,
  },
  {
    id: 'health_regen',
    type: 'special',
    statType: 'healthRegen',
    value: 2,
    displayName: '生命恢复',
    icon: '💚',
    description: '每秒恢复2点生命值',
    requiredLevel: 1,
    weight: 30,
  },
  {
    id: 'mana_regen',
    type: 'special',
    statType: 'manaRegen',
    value: 1,
    displayName: '魔力恢复',
    icon: '💙',
    description: '每秒恢复1点魔力值',
    requiredLevel: 1,
    weight: 30,
  },
  
  // ========== 高级属性 (10%权重，15级+) ==========
  {
    id: 'life_steal',
    type: 'advanced',
    statType: 'lifeSteal',
    value: 5,
    displayName: '吸血',
    icon: '🩸',
    description: '造成伤害的5%转化为生命值',
    requiredLevel: 15,
    weight: 10,
  },
  {
    id: 'thorns',
    type: 'advanced',
    statType: 'thorns',
    value: 10,
    displayName: '反伤',
    icon: '🔄',
    description: '受到伤害的10%反弹给敌人',
    requiredLevel: 15,
    weight: 10,
  },
  {
    id: 'dodge',
    type: 'advanced',
    statType: 'dodge',
    value: 3,
    displayName: '闪避',
    icon: '💨',
    description: '增加3%闪避几率',
    requiredLevel: 20,
    weight: 10,
  },
  {
    id: 'penetration',
    type: 'advanced',
    statType: 'penetration',
    value: 5,
    displayName: '穿透',
    icon: '🎯',
    description: '无视5%敌人防御',
    requiredLevel: 20,
    weight: 10,
  },
  {
    id: 'multi_hit',
    type: 'advanced',
    statType: 'multiHit',
    value: 1,
    displayName: '多重打击',
    icon: '🌟',
    description: '攻击额外命中1次',
    requiredLevel: 25,
    weight: 10,
  },
];

// 根据等级获取可用选项
export function getAvailableOptions(level: number): LevelUpOption[] {
  return LEVEL_UP_OPTIONS.filter(option => level >= option.requiredLevel);
}

// 根据类型获取选项权重
export function getTypeWeight(type: LevelUpOption['type']): number {
  switch (type) {
    case 'basic': return 60;
    case 'special': return 30;
    case 'advanced': return 10;
    default: return 0;
  }
}
