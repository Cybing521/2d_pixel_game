// 元素属性数据定义
import type { ElementType, ElementMastery } from '@/types/skills';

// 元素基础信息
export interface ElementInfo {
  id: ElementType;
  name: string;
  nameZh: string;
  description: string;
  icon: string;
  color: string;  // 用于UI显示
  
  // 克制关系
  strongAgainst: ElementType;  // 克制
  weakAgainst: ElementType;    // 被克制
}

// 元素信息配置
export const ELEMENTS: Record<ElementType, ElementInfo> = {
  fire: {
    id: 'fire',
    name: 'Fire',
    nameZh: '火',
    description: '高伤害、持续燃烧、范围爆发',
    icon: '🔥',
    color: '#ff4500',
    strongAgainst: 'wind',
    weakAgainst: 'water',
  },
  
  water: {
    id: 'water',
    name: 'Water',
    nameZh: '水',
    description: '治疗辅助、控制减速、持续恢复',
    icon: '💧',
    color: '#1e90ff',
    strongAgainst: 'fire',
    weakAgainst: 'earth',
  },
  
  wind: {
    id: 'wind',
    name: 'Wind',
    nameZh: '风',
    description: '移动速度、多段攻击、控制位移',
    icon: '🌪️',
    color: '#87ceeb',
    strongAgainst: 'earth',
    weakAgainst: 'fire',
  },
  
  earth: {
    id: 'earth',
    name: 'Earth',
    nameZh: '土',
    description: '防御护盾、控制晕眩、持久战斗',
    icon: '🪨',
    color: '#8b4513',
    strongAgainst: 'water',
    weakAgainst: 'wind',
  },
};

// 元素克制伤害倍数
export const ELEMENT_COUNTER_MULTIPLIER = 1.3; // +30%伤害

// 初始元素精通状态
export function createInitialMastery(element: ElementType): ElementMastery {
  return {
    element,
    level: 0,
    experience: 0,
    expToNextLevel: 100,
    bonuses: {
      damageBonus: 0,
      effectDuration: 0,
      cooldownReduction: 0,
    },
  };
}

// 计算元素精通等级加成
export function calculateMasteryBonuses(level: number) {
  return {
    damageBonus: level * 5,         // 每级+5%伤害
    effectDuration: level * 3,      // 每级+3%持续时间
    cooldownReduction: level * 2,   // 每级+2%冷却减少
  };
}

// 计算升级所需经验
export function calculateMasteryExpRequired(level: number): number {
  if (level === 0) return 100;
  if (level >= 10) return 0; // 满级
  return Math.floor(100 * Math.pow(1.5, level));
}

// 检查元素克制关系
export function checkElementCounter(
  attackElement: ElementType,
  targetElement: ElementType
): boolean {
  const attacker = ELEMENTS[attackElement];
  return attacker.strongAgainst === targetElement;
}

// 计算元素伤害（包含克制）
export function calculateElementDamage(
  baseDamage: number,
  attackElement: ElementType,
  targetElement?: ElementType,
  masteryLevel: number = 0
): number {
  let damage = baseDamage;
  
  // 应用精通加成
  const bonuses = calculateMasteryBonuses(masteryLevel);
  damage *= (1 + bonuses.damageBonus / 100);
  
  // 应用克制加成
  if (targetElement && checkElementCounter(attackElement, targetElement)) {
    damage *= ELEMENT_COUNTER_MULTIPLIER;
  }
  
  return Math.floor(damage);
}

// 元素协同效果
export interface ElementCombo {
  elements: [ElementType, ElementType];
  name: string;
  nameZh: string;
  description: string;
  effect: string;
}

// 元素协同组合
export const ELEMENT_COMBOS: ElementCombo[] = [
  {
    elements: ['fire', 'wind'],
    name: 'Firestorm',
    nameZh: '火焰风暴',
    description: '燃烧范围扩大，伤害提升',
    effect: '范围+50%，伤害+20%',
  },
  {
    elements: ['water', 'wind'],
    name: 'Freeze',
    nameZh: '冰冻效果',
    description: '敌人被冻结，无法移动',
    effect: '定身2秒',
  },
  {
    elements: ['fire', 'water'],
    name: 'Steam',
    nameZh: '蒸汽爆炸',
    description: '造成混合伤害',
    effect: '额外伤害+30%',
  },
  {
    elements: ['earth', 'water'],
    name: 'Mud',
    nameZh: '泥沼陷阱',
    description: '大幅减速',
    effect: '减速70%，持续5秒',
  },
  {
    elements: ['fire', 'earth'],
    name: 'Lava',
    nameZh: '熔岩地狱',
    description: '持续伤害+减速',
    effect: '每秒10伤害，减速40%',
  },
  {
    elements: ['wind', 'earth'],
    name: 'Sandstorm',
    nameZh: '沙尘暴',
    description: '降低命中率',
    effect: '命中率-30%',
  },
];

// 检查是否有元素协同
export function checkElementCombo(
  element1: ElementType,
  element2: ElementType
): ElementCombo | null {
  return ELEMENT_COMBOS.find(
    combo =>
      (combo.elements[0] === element1 && combo.elements[1] === element2) ||
      (combo.elements[0] === element2 && combo.elements[1] === element1)
  ) || null;
}

// 获取元素信息
export function getElementInfo(element: ElementType): ElementInfo {
  return ELEMENTS[element];
}

// 获取所有元素
export function getAllElements(): ElementInfo[] {
  return Object.values(ELEMENTS);
}
