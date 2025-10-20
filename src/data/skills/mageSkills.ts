// 法师职业技能数据
import type { Skill } from '@/types/skills';

export const MAGE_SKILLS: Skill[] = [
  // ========== 第1层：基础技能 ==========
  {
    id: 'mage_arcane_missile',
    name: 'Arcane Missile',
    description: '奥术飞弹：快速发射魔法飞弹',
    icon: '✨',
    classType: 'mage',
    tier: 1,
    cost: 0,  // 初始技能
    manaCost: 10,
    cooldown: 1.5,
    damage: 35,
    range: 400,
    prerequisites: [],
    requiredLevel: 1,
    currentLevel: 1,
    maxLevel: 5,
  },

  {
    id: 'mage_frost_nova',
    name: 'Frost Nova',
    description: '冰霜新星：冻结周围敌人',
    icon: '❄️',
    classType: 'mage',
    tier: 1,
    cost: 1,
    manaCost: 25,
    cooldown: 10,
    damage: 30,
    radius: 120,
    duration: 3,
    prerequisites: [],
    requiredLevel: 5,
    currentLevel: 0,
    maxLevel: 5,
    effects: [
      {
        type: 'freeze',
        value: 1,
        duration: 3,
      },
    ],
  },

  {
    id: 'mage_teleport',
    name: 'Teleport',
    description: '传送：瞬移到目标位置',
    icon: '🌀',
    classType: 'mage',
    tier: 1,
    cost: 1,
    manaCost: 30,
    cooldown: 15,
    range: 300,
    prerequisites: [],
    requiredLevel: 5,
    currentLevel: 0,
    maxLevel: 5,
  },

  // ========== 第2层：进阶技能 ==========
  {
    id: 'mage_arcane_explosion',
    name: 'Arcane Explosion',
    description: '奥术爆炸：以自身为中心释放魔法冲击波',
    icon: '💥',
    classType: 'mage',
    tier: 2,
    cost: 2,
    manaCost: 40,
    cooldown: 12,
    damage: 60,
    radius: 150,
    prerequisites: ['mage_arcane_missile'],
    requiredLevel: 10,
    currentLevel: 0,
    maxLevel: 5,
  },

  {
    id: 'mage_mana_shield',
    name: 'Mana Shield',
    description: '魔法护盾：吸收伤害的护盾',
    icon: '🛡️',
    classType: 'mage',
    tier: 2,
    cost: 2,
    manaCost: 50,
    cooldown: 25,
    duration: 15,
    prerequisites: ['mage_frost_nova'],
    requiredLevel: 10,
    currentLevel: 0,
    maxLevel: 5,
    effects: [
      {
        type: 'shield',
        value: 100,  // 吸收100点伤害
        duration: 15,
      },
    ],
  },

  {
    id: 'mage_time_warp',
    name: 'Time Warp',
    description: '时间扭曲：创造减速区域',
    icon: '⏱️',
    classType: 'mage',
    tier: 2,
    cost: 2,
    manaCost: 45,
    cooldown: 20,
    range: 300,
    radius: 150,
    duration: 8,
    prerequisites: ['mage_teleport'],
    requiredLevel: 10,
    currentLevel: 0,
    maxLevel: 5,
    effects: [
      {
        type: 'slow',
        value: 50,  // 减速50%
        duration: 8,
      },
    ],
  },

  // ========== 第3层：高级技能 ==========
  {
    id: 'mage_arcane_power',
    name: 'Arcane Power',
    description: '奥术强化：大幅提升魔法伤害',
    icon: '⚡',
    classType: 'mage',
    tier: 3,
    cost: 3,
    manaCost: 60,
    cooldown: 30,
    duration: 10,
    prerequisites: ['mage_arcane_explosion'],
    requiredLevel: 20,
    currentLevel: 0,
    maxLevel: 5,
    effects: [
      {
        type: 'buff',
        value: 50,  // +50%魔法伤害
        duration: 10,
      },
    ],
  },

  // ========== 第4层：终极技能 ==========
  {
    id: 'mage_meteor',
    name: 'Meteor',
    description: '陨石术：召唤陨石造成巨额伤害',
    icon: '☄️',
    classType: 'mage',
    tier: 4,
    cost: 5,
    manaCost: 100,
    cooldown: 40,
    damage: 200,
    range: 500,
    radius: 200,
    prerequisites: ['mage_arcane_power', 'mage_time_warp'],
    requiredLevel: 30,
    currentLevel: 0,
    maxLevel: 5,
    effects: [
      {
        type: 'burn',
        value: 20,
        duration: 5,
        tickInterval: 1,
      },
    ],
  },
];

// 法师融合技能
export const MAGE_FUSION_SKILLS: Skill[] = [
  // 火法师融合技
  {
    id: 'mage_fire_doom',
    name: 'Doom Judgment',
    description: '末日审判：超大范围火焰风暴',
    icon: '🔥🔮',
    classType: 'mage',
    elementType: 'fire',
    tier: 3,
    cost: 3,
    manaCost: 80,
    cooldown: 35,
    damage: 120,
    range: 400,
    radius: 250,
    prerequisites: ['mage_meteor'],
    requiredLevel: 25,
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: true,
    fusionRequirements: {
      classType: 'mage',
      elementType: 'fire',
      elementLevel: 5,
    },
    effects: [
      {
        type: 'burn',
        value: 25,
        duration: 6,
        tickInterval: 1,
      },
    ],
  },

  // 水法师融合技
  {
    id: 'mage_ice_prison',
    name: 'Ice Prison',
    description: '寒冰禁锢：冻结敌人5秒',
    icon: '💧🔮',
    classType: 'mage',
    elementType: 'water',
    tier: 3,
    cost: 3,
    manaCost: 70,
    cooldown: 30,
    damage: 50,
    range: 300,
    prerequisites: ['mage_frost_nova'],
    requiredLevel: 15,
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: true,
    fusionRequirements: {
      classType: 'mage',
      elementType: 'water',
      elementLevel: 3,
    },
    effects: [
      {
        type: 'freeze',
        value: 1,
        duration: 5,
      },
    ],
  },

  // 风法师融合技
  {
    id: 'mage_arcane_storm',
    name: 'Arcane Storm',
    description: '奥术风暴：超快速连续施法',
    icon: '🌪️🔮',
    classType: 'mage',
    elementType: 'wind',
    tier: 3,
    cost: 3,
    manaCost: 50,
    cooldown: 20,
    damage: 40,
    range: 350,
    prerequisites: ['mage_arcane_missile'],
    requiredLevel: 15,
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: true,
    fusionRequirements: {
      classType: 'mage',
      elementType: 'wind',
      elementLevel: 3,
    },
  },

  // 土法师融合技
  {
    id: 'mage_stone_golem',
    name: 'Stone Golem',
    description: '岩石召唤：召唤石头人协同作战',
    icon: '🪨🔮',
    classType: 'mage',
    elementType: 'earth',
    tier: 3,
    cost: 3,
    manaCost: 80,
    cooldown: 45,
    duration: 30,
    prerequisites: ['mage_mana_shield'],
    requiredLevel: 20,
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: true,
    fusionRequirements: {
      classType: 'mage',
      elementType: 'earth',
      elementLevel: 4,
    },
  },
];

export function getAllMageSkills(): Skill[] {
  return [...MAGE_SKILLS, ...MAGE_FUSION_SKILLS];
}

export function getMageSkillsByTier(tier: number): Skill[] {
  return getAllMageSkills().filter(skill => skill.tier === tier);
}
