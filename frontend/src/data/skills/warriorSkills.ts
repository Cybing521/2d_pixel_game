// 战士职业技能数据
import type { Skill } from '@/types/skills';

export const WARRIOR_SKILLS: Skill[] = [
  // ========== 第1层：基础技能 ==========
  {
    id: 'warrior_basic_attack',
    name: '基础攻击',
    description: '基础近战攻击',
    icon: '⚔️',
    classType: 'warrior',
    elementType: null,
    tier: 1,
    cost: 0,
    manaCost: 0,
    cooldown: 1000,
    damage: 30,
    radius: 50,
    prerequisites: [],
    requiredLevel: 1,
    currentLevel: 1,
    maxLevel: 5,
    isFusionSkill: false,
    effects: [],
  },

  {
    id: 'warrior_whirlwind',
    name: '旋风斩',
    description: '360度范围攻击，对周围所有敌人造成伤害',
    icon: '🌀',
    classType: 'warrior',
    elementType: null,
    tier: 2,
    cost: 2,
    manaCost: 20,
    cooldown: 8000,
    damage: 50,
    radius: 100,
    prerequisites: ['warrior_basic_attack'],
    requiredLevel: 5,
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: false,
    effects: [],
  },

  {
    id: 'warrior_charge',
    name: '冲锋',
    description: '突进到目标位置并晕眩敌人',
    icon: '💨',
    classType: 'warrior',
    elementType: null,
    tier: 2,
    cost: 2,
    manaCost: 15,
    cooldown: 10000,
    damage: 40,
    radius: 30,
    prerequisites: ['warrior_basic_attack'],
    requiredLevel: 5,
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: false,
    effects: [
      {
        type: 'stun',
        value: 1,
        duration: 1500,
      },
    ],
  },

  // ========== 第2层：进阶技能 ==========
  {
    id: 'warrior_shield_wall',
    name: 'Shield Wall',
    description: '盾墙：大幅提升防御力，减少受到的伤害',
    icon: '🛡️',
    classType: 'warrior',
    tier: 2,
    cost: 2,
    manaCost: 30,
    cooldown: 30,
    duration: 8,  // 持续8秒
    prerequisites: ['warrior_basic_attack'],
    requiredLevel: 10,
    currentLevel: 0,
    maxLevel: 5,
    effects: [
      {
        type: 'buff',
        value: 50,  // +50%防御
        duration: 8,
      },
    ],
  },

  {
    id: 'warrior_rend',
    name: 'Rend',
    description: '撕裂：造成伤害并施加流血效果',
    icon: '🩸',
    classType: 'warrior',
    tier: 2,
    cost: 2,
    manaCost: 25,
    cooldown: 10,
    damage: 40,
    range: 50,
    prerequisites: ['warrior_whirlwind'],
    requiredLevel: 10,
    currentLevel: 0,
    maxLevel: 5,
    effects: [
      {
        type: 'debuff',
        value: 10,  // 每秒10点流血伤害
        duration: 6,
        tickInterval: 1,
      },
    ],
  },

  {
    id: 'warrior_battle_cry',
    name: 'Battle Cry',
    description: '战吼：提升自身攻击力和速度',
    icon: '📢',
    classType: 'warrior',
    tier: 2,
    cost: 2,
    manaCost: 20,
    cooldown: 20,
    duration: 10,
    prerequisites: ['warrior_charge'],
    requiredLevel: 10,
    currentLevel: 0,
    maxLevel: 5,
    effects: [
      {
        type: 'buff',
        value: 30,  // +30%攻击和速度
        duration: 10,
      },
    ],
  },

  // ========== 第3层：高级技能 ==========
  {
    id: 'warrior_shield_bash',
    name: 'Shield Bash',
    description: '盾击：用盾牌猛击敌人，造成伤害并打断施法',
    icon: '💢',
    classType: 'warrior',
    tier: 3,
    cost: 3,
    manaCost: 35,
    cooldown: 15,
    damage: 60,
    range: 50,
    prerequisites: ['warrior_shield_wall'],
    requiredLevel: 20,
    currentLevel: 0,
    maxLevel: 5,
    effects: [
      {
        type: 'stun',
        value: 1,
        duration: 3,
      },
    ],
  },

  // ========== 第4层：终极技能 ==========
  {
    id: 'warrior_execute',
    name: 'Execute',
    description: '斩杀：对低血量敌人造成巨额伤害',
    icon: '⚡',
    classType: 'warrior',
    tier: 4,
    cost: 5,
    manaCost: 50,
    cooldown: 20,
    damage: 150,  // 基础伤害，低血量目标额外伤害
    range: 50,
    prerequisites: ['warrior_shield_bash', 'warrior_rend'],
    requiredLevel: 30,
    currentLevel: 0,
    maxLevel: 5,
  },
];

// 战士融合技能（职业+元素）
export const WARRIOR_FUSION_SKILLS: Skill[] = [
  // 火战士融合技
  {
    id: 'warrior_fire_blade',
    name: 'Flame Blade',
    description: '烈焰之刃：旋风斩附加火焰伤害和燃烧效果',
    icon: '🔥⚔️',
    classType: 'warrior',
    elementType: 'fire',
    tier: 3,
    cost: 3,
    manaCost: 40,
    cooldown: 10,
    damage: 80,
    radius: 120,
    prerequisites: ['warrior_whirlwind'],
    requiredLevel: 15,
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: true,
    fusionRequirements: {
      classType: 'warrior',
      elementType: 'fire',
      elementLevel: 3,
    },
    effects: [
      {
        type: 'burn',
        value: 15,  // 每秒15点燃烧伤害
        duration: 5,
        tickInterval: 1,
      },
    ],
  },

  // 水战士融合技
  {
    id: 'warrior_ice_armor',
    name: 'Ice Armor',
    description: '冰甲护盾：盾墙附加冰冻反伤效果',
    icon: '💧🛡️',
    classType: 'warrior',
    elementType: 'water',
    tier: 3,
    cost: 3,
    manaCost: 40,
    cooldown: 35,
    duration: 10,
    prerequisites: ['warrior_shield_wall'],
    requiredLevel: 15,
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: true,
    fusionRequirements: {
      classType: 'warrior',
      elementType: 'water',
      elementLevel: 3,
    },
    effects: [
      {
        type: 'buff',
        value: 60,  // +60%防御
        duration: 10,
      },
      {
        type: 'freeze',
        value: 1,
        duration: 1,  // 攻击者被冻结1秒
      },
    ],
  },

  // 风战士融合技
  {
    id: 'warrior_wind_assault',
    name: 'Wind Assault',
    description: '疾风突袭：冲锋可连续使用3次',
    icon: '🌪️💨',
    classType: 'warrior',
    elementType: 'wind',
    tier: 3,
    cost: 3,
    manaCost: 35,
    cooldown: 15,
    damage: 25,
    range: 250,
    prerequisites: ['warrior_charge'],
    requiredLevel: 15,
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: true,
    fusionRequirements: {
      classType: 'warrior',
      elementType: 'wind',
      elementLevel: 3,
    },
  },

  // 土战士融合技
  {
    id: 'warrior_earth_rage',
    name: 'Earth Rage',
    description: '大地之怒：旋风斩附加晕眩效果',
    icon: '🪨🌀',
    classType: 'warrior',
    elementType: 'earth',
    tier: 3,
    cost: 3,
    manaCost: 45,
    cooldown: 12,
    damage: 70,
    radius: 100,
    prerequisites: ['warrior_whirlwind'],
    requiredLevel: 15,
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: true,
    fusionRequirements: {
      classType: 'warrior',
      elementType: 'earth',
      elementLevel: 3,
    },
    effects: [
      {
        type: 'stun',
        value: 1,
        duration: 2,
      },
    ],
  },
];

// 获取所有战士技能
export function getAllWarriorSkills(): Skill[] {
  return [...WARRIOR_SKILLS, ...WARRIOR_FUSION_SKILLS];
}

// 根据层级获取技能
export function getWarriorSkillsByTier(tier: number): Skill[] {
  return getAllWarriorSkills().filter(skill => skill.tier === tier);
}
