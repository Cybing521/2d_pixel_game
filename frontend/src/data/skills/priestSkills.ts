// 牧师职业技能数据
import type { Skill } from '@/types/skills';

export const PRIEST_SKILLS: Skill[] = [
  // ========== 第1层：基础技能 ==========
  {
    id: 'priest_flash_heal',
    name: 'Flash Heal',
    description: '快速治疗：单体快速恢复',
    icon: '✨',
    classType: 'priest',
    tier: 1,
    cost: 0,  // 初始技能
    manaCost: 20,
    cooldown: 2,
    healing: 50,
    range: 250,
    prerequisites: [],
    requiredLevel: 1,
    currentLevel: 1,
    maxLevel: 5,
  },

  {
    id: 'priest_power_word_shield',
    name: 'Power Word: Shield',
    description: '真言术：盾：为目标提供护盾',
    icon: '🛡️',
    classType: 'priest',
    tier: 1,
    cost: 1,
    manaCost: 30,
    cooldown: 12,
    range: 250,
    duration: 15,
    prerequisites: [],
    requiredLevel: 5,
    currentLevel: 0,
    maxLevel: 5,
    effects: [
      {
        type: 'shield',
        value: 80,
        duration: 15,
      },
    ],
  },

  {
    id: 'priest_dispel',
    name: 'Dispel',
    description: '驱散：移除负面状态',
    icon: '✋',
    classType: 'priest',
    tier: 1,
    cost: 1,
    manaCost: 25,
    cooldown: 8,
    range: 250,
    prerequisites: [],
    requiredLevel: 5,
    currentLevel: 0,
    maxLevel: 5,
  },

  // ========== 第2层：进阶技能 ==========
  {
    id: 'priest_renew',
    name: 'Renew',
    description: '恢复：持续治疗效果',
    icon: '💚',
    classType: 'priest',
    tier: 2,
    cost: 2,
    manaCost: 35,
    cooldown: 10,
    healing: 15,  // 每秒15
    range: 250,
    duration: 10,
    prerequisites: ['priest_flash_heal'],
    requiredLevel: 10,
    currentLevel: 0,
    maxLevel: 5,
    effects: [
      {
        type: 'heal',
        value: 15,
        duration: 10,
        tickInterval: 1,
      },
    ],
  },

  {
    id: 'priest_holy_nova',
    name: 'Holy Nova',
    description: '神圣新星：范围伤害+治疗',
    icon: '🌟',
    classType: 'priest',
    tier: 2,
    cost: 2,
    manaCost: 45,
    cooldown: 15,
    damage: 40,
    healing: 40,
    radius: 150,
    prerequisites: ['priest_flash_heal'],
    requiredLevel: 10,
    currentLevel: 0,
    maxLevel: 5,
  },

  {
    id: 'priest_resurrection',
    name: 'Resurrection',
    description: '复活：复活倒地队友',
    icon: '⚱️',
    classType: 'priest',
    tier: 2,
    cost: 2,
    manaCost: 80,
    cooldown: 60,
    range: 200,
    prerequisites: ['priest_dispel'],
    requiredLevel: 10,
    currentLevel: 0,
    maxLevel: 5,
  },

  // ========== 第3层：高级技能 ==========
  {
    id: 'priest_holy_word',
    name: 'Holy Word',
    description: '圣言术：强力群体治疗',
    icon: '📖',
    classType: 'priest',
    tier: 3,
    cost: 3,
    manaCost: 60,
    cooldown: 20,
    healing: 100,
    radius: 200,
    prerequisites: ['priest_holy_nova'],
    requiredLevel: 20,
    currentLevel: 0,
    maxLevel: 5,
  },

  // ========== 第4层：终极技能 ==========
  {
    id: 'priest_divine_hymn',
    name: 'Divine Hymn',
    description: '神圣赞歌：持续群体治疗',
    icon: '🎵',
    classType: 'priest',
    tier: 4,
    cost: 5,
    manaCost: 100,
    cooldown: 45,
    healing: 30,  // 每秒30
    radius: 250,
    duration: 8,
    prerequisites: ['priest_holy_word', 'priest_renew'],
    requiredLevel: 30,
    currentLevel: 0,
    maxLevel: 5,
    effects: [
      {
        type: 'heal',
        value: 30,
        duration: 8,
        tickInterval: 1,
      },
    ],
  },
];

// 牧师融合技能
export const PRIEST_FUSION_SKILLS: Skill[] = [
  // 火牧师融合技
  {
    id: 'priest_holy_fire',
    name: 'Holy Fire',
    description: '神圣烈焰：范围伤害+群疗',
    icon: '🔥✨',
    classType: 'priest',
    elementType: 'fire',
    tier: 3,
    cost: 3,
    manaCost: 55,
    cooldown: 18,
    damage: 70,
    healing: 50,
    radius: 180,
    prerequisites: ['priest_holy_nova'],
    requiredLevel: 15,
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: true,
    fusionRequirements: {
      classType: 'priest',
      elementType: 'fire',
      elementLevel: 3,
    },
    effects: [
      {
        type: 'burn',
        value: 15,
        duration: 5,
        tickInterval: 1,
      },
    ],
  },

  // 水牧师融合技
  {
    id: 'priest_life_spring',
    name: 'Life Spring',
    description: '生命之泉：持续群体恢复',
    icon: '💧✨',
    classType: 'priest',
    elementType: 'water',
    tier: 3,
    cost: 3,
    manaCost: 70,
    cooldown: 25,
    healing: 25,  // 每秒25
    radius: 200,
    duration: 12,
    prerequisites: ['priest_renew'],
    requiredLevel: 15,
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: true,
    fusionRequirements: {
      classType: 'priest',
      elementType: 'water',
      elementLevel: 3,
    },
    effects: [
      {
        type: 'heal',
        value: 25,
        duration: 12,
        tickInterval: 1,
      },
    ],
  },

  // 风牧师融合技
  {
    id: 'priest_wind_blessing',
    name: 'Wind Blessing',
    description: '疾风祝福：全队速度提升',
    icon: '🌪️✨',
    classType: 'priest',
    elementType: 'wind',
    tier: 3,
    cost: 3,
    manaCost: 50,
    cooldown: 30,
    radius: 300,
    duration: 15,
    prerequisites: ['priest_power_word_shield'],
    requiredLevel: 15,
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: true,
    fusionRequirements: {
      classType: 'priest',
      elementType: 'wind',
      elementLevel: 3,
    },
    effects: [
      {
        type: 'buff',
        value: 40,  // +40%移动速度
        duration: 15,
      },
    ],
  },

  // 土牧师融合技
  {
    id: 'priest_earth_sanctuary',
    name: 'Earth Sanctuary',
    description: '大地庇护：全队获得护盾',
    icon: '🪨✨',
    classType: 'priest',
    elementType: 'earth',
    tier: 3,
    cost: 3,
    manaCost: 65,
    cooldown: 35,
    radius: 250,
    duration: 20,
    prerequisites: ['priest_power_word_shield'],
    requiredLevel: 15,
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: true,
    fusionRequirements: {
      classType: 'priest',
      elementType: 'earth',
      elementLevel: 3,
    },
    effects: [
      {
        type: 'shield',
        value: 120,
        duration: 20,
      },
    ],
  },
];

export function getAllPriestSkills(): Skill[] {
  return [...PRIEST_SKILLS, ...PRIEST_FUSION_SKILLS];
}

export function getPriestSkillsByTier(tier: number): Skill[] {
  return getAllPriestSkills().filter(skill => skill.tier === tier);
}
