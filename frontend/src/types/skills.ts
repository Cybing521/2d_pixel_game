// 技能和职业系统类型定义

// 职业类型
export type ClassType = 'warrior' | 'mage' | 'rogue' | 'priest';

// 元素类型
export type ElementType = 'fire' | 'water' | 'wind' | 'earth';

// 技能效果类型
export type SkillEffectType = 
  | 'burn'          // 燃烧
  | 'freeze'        // 冰冻
  | 'slow'          // 减速
  | 'stun'          // 晕眩
  | 'heal'          // 治疗
  | 'shield'        // 护盾
  | 'buff'          // 增益
  | 'debuff'        // 减益
  | 'knockback'     // 击退
  | 'pull'          // 拉取
  | 'dodge_buff'    // 闪避增益
  | 'defense_buff'  // 防御增益
  | 'terrain_block';// 地形阻挡

// 技能层级
export type SkillTier = 1 | 2 | 3 | 4;

// 技能效果
export interface SkillEffect {
  type: SkillEffectType;
  value: number;        // 效果数值
  duration: number;     // 持续时间（秒）
  tickInterval?: number; // DoT间隔
}

// 技能定义
export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  
  // 分类
  classType: ClassType | null;     // 所属职业
  elementType?: ElementType | null; // 元素类型（职业技能可能没有）
  tier: SkillTier;          // 技能层级
  
  // 消耗
  cost: number;             // 学习消耗的技能点
  manaCost: number;         // 释放消耗的魔力
  cooldown: number;         // 冷却时间（秒）
  
  // 伤害/治疗
  damage?: number;          // 基础伤害
  healing?: number;         // 治疗量
  
  // 范围
  range?: number;           // 作用距离
  radius?: number;          // AOE半径
  
  // 持续
  duration?: number;        // 持续时间
  
  // 前置条件
  prerequisites: string[];  // 前置技能ID
  requiredLevel: number;    // 需要的玩家等级
  
  // 升级
  currentLevel: number;     // 当前等级 0-5
  maxLevel: number;         // 最大等级
  
  // 特殊效果
  effects?: SkillEffect[];
  
  // 是否为融合技能（职业+元素）
  isFusionSkill?: boolean;
  fusionRequirements?: {
    classType: ClassType;
    elementType: ElementType;
    elementLevel: number;   // 需要的元素精通等级
  };
}

// 职业数据
export interface ClassData {
  id: ClassType;
  name: string;
  nameZh: string;
  description: string;
  icon: string;
  
  // 基础属性加成
  baseStats: {
    healthBonus: number;
    manaBonus: number;
    attackBonus: number;
    defenseBonus: number;
    speedBonus: number;
  };
  
  // 特殊机制
  specialMechanic: {
    name: string;
    description: string;
    resourceType?: 'rage' | 'combo' | 'energy' | 'holy_power';
    maxResource?: number;
  };
  
  // 职业技能列表
  skills: string[];  // 技能ID数组
}

// 元素精通数据
export interface ElementMastery {
  element: ElementType;
  level: number;        // 1-10级
  experience: number;   // 当前经验
  expToNextLevel: number;
  
  // 加成效果
  bonuses: {
    damageBonus: number;      // 伤害加成百分比
    effectDuration: number;   // 效果持续时间加成
    cooldownReduction: number; // 冷却减少
  };
}

// 技能树状态
export interface SkillTreeState {
  // 职业
  selectedClass: ClassType | null;
  classLevel: number;  // 职业等级
  
  // 技能点
  availablePoints: number;
  totalPointsSpent: number;
  
  // 元素精通
  fireMastery: ElementMastery;
  waterMastery: ElementMastery;
  windMastery: ElementMastery;
  earthMastery: ElementMastery;
  
  // 已学习的技能
  learnedSkills: Map<string, Skill>;
  
  // 装备的技能（快捷栏）
  equippedSkills: [string?, string?, string?, string?];
  
  // 技能冷却状态（运行时）
  skillCooldowns: Map<string, number>;
}

// 融合技能数据
export interface FusionSkill extends Skill {
  baseSkillId: string;      // 基础职业技能ID
  fusionBonuses: {
    damageMultiplier?: number;
    additionalEffect?: SkillEffect;
    cooldownReduction?: number;
  };
}
