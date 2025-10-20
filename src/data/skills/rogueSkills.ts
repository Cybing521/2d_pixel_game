// 盗贼职业技能数据
import type { Skill } from '@/types/skills';

export const ROGUE_SKILLS: Skill[] = [
  // ========== 第1层：基础技能 ==========
  {
    id: 'rogue_backstab',
    name: 'Backstab',
    description: '背刺：从背后攻击造成高额伤害',
    icon: '🗡️',
    classType: 'rogue',
    tier: 1,
    cost: 0,  // 初始技能
    manaCost: 15,
    cooldown: 2,
    damage: 60,  // 背后攻击×2
    range: 50,
    prerequisites: [],
    requiredLevel: 1,
    currentLevel: 1,
    maxLevel: 5,
  },

  {
    id: 'rogue_poison_blade',
    name: 'Poison Blade',
    description: '毒刃：攻击附加持续毒伤',
    icon: '🧪',
    classType: 'rogue',
    tier: 1,
    cost: 1,
    manaCost: 20,
    cooldown: 8,
    damage: 35,
    range: 50,
    prerequisites: [],
    requiredLevel: 5,
    currentLevel: 0,
    maxLevel: 5,
    effects: [
      {
        type: 'debuff',
        value: 12,  // 每秒12点毒伤
        duration: 6,
        tickInterval: 1,
      },
    ],
  },

  {
    id: 'rogue_shadow_step',
    name: 'Shadow Step',
    description: '暗影步：短距离瞬移',
    icon: '👤',
    classType: 'rogue',
    tier: 1,
    cost: 1,
    manaCost: 25,
    cooldown: 10,
    range: 200,
    prerequisites: [],
    requiredLevel: 5,
    currentLevel: 0,
    maxLevel: 5,
  },

  // ========== 第2层：进阶技能 ==========
  {
    id: 'rogue_blade_flurry',
    name: 'Blade Flurry',
    description: '刀扇：快速多次攻击',
    icon: '🌪️',
    classType: 'rogue',
    tier: 2,
    cost: 2,
    manaCost: 30,
    cooldown: 12,
    damage: 25,  // 5次攻击
    range: 50,
    prerequisites: ['rogue_backstab'],
    requiredLevel: 10,
    currentLevel: 0,
    maxLevel: 5,
  },

  {
    id: 'rogue_stealth',
    name: 'Stealth',
    description: '潜行：隐身状态，首次攻击必暴击',
    icon: '🌑',
    classType: 'rogue',
    tier: 2,
    cost: 2,
    manaCost: 40,
    cooldown: 25,
    duration: 10,
    prerequisites: ['rogue_shadow_step'],
    requiredLevel: 10,
    currentLevel: 0,
    maxLevel: 5,
    effects: [
      {
        type: 'buff',
        value: 100,  // 下次攻击+100%伤害
        duration: 10,
      },
    ],
  },

  {
    id: 'rogue_kidney_shot',
    name: 'Kidney Shot',
    description: '肾击：晕眩敌人',
    icon: '💫',
    classType: 'rogue',
    tier: 2,
    cost: 2,
    manaCost: 35,
    cooldown: 15,
    damage: 30,
    range: 50,
    prerequisites: ['rogue_backstab'],
    requiredLevel: 10,
    currentLevel: 0,
    maxLevel: 5,
    effects: [
      {
        type: 'stun',
        value: 1,
        duration: 4,
      },
    ],
  },

  // ========== 第3层：高级技能 ==========
  {
    id: 'rogue_sprint',
    name: 'Sprint',
    description: '疾跑：大幅提升移动速度',
    icon: '💨',
    classType: 'rogue',
    tier: 3,
    cost: 3,
    manaCost: 30,
    cooldown: 20,
    duration: 8,
    prerequisites: ['rogue_shadow_step'],
    requiredLevel: 20,
    currentLevel: 0,
    maxLevel: 5,
    effects: [
      {
        type: 'buff',
        value: 70,  // +70%移动速度
        duration: 8,
      },
    ],
  },

  // ========== 第4层：终极技能 ==========
  {
    id: 'rogue_eviscerate',
    name: 'Eviscerate',
    description: '刺杀：消耗连击点的终结技',
    icon: '⚔️',
    classType: 'rogue',
    tier: 4,
    cost: 5,
    manaCost: 50,
    cooldown: 15,
    damage: 180,
    range: 50,
    prerequisites: ['rogue_blade_flurry', 'rogue_kidney_shot'],
    requiredLevel: 30,
    currentLevel: 0,
    maxLevel: 5,
  },
];

// 盗贼融合技能
export const ROGUE_FUSION_SKILLS: Skill[] = [
  // 火盗贼融合技
  {
    id: 'rogue_fire_assassination',
    name: 'Fire Assassination',
    description: '烈焰刺杀：背刺附带爆炸',
    icon: '🔥🗡️',
    classType: 'rogue',
    elementType: 'fire',
    tier: 3,
    cost: 3,
    manaCost: 45,
    cooldown: 12,
    damage: 100,
    range: 50,
    radius: 80,
    prerequisites: ['rogue_backstab'],
    requiredLevel: 15,
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: true,
    fusionRequirements: {
      classType: 'rogue',
      elementType: 'fire',
      elementLevel: 3,
    },
    effects: [
      {
        type: 'burn',
        value: 18,
        duration: 4,
        tickInterval: 1,
      },
    ],
  },

  // 水盗贼融合技
  {
    id: 'rogue_frost_blade',
    name: 'Frost Blade',
    description: '寒霜之刃：持续冻伤效果',
    icon: '💧🗡️',
    classType: 'rogue',
    elementType: 'water',
    tier: 3,
    cost: 3,
    manaCost: 40,
    cooldown: 10,
    damage: 50,
    range: 50,
    prerequisites: ['rogue_poison_blade'],
    requiredLevel: 15,
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: true,
    fusionRequirements: {
      classType: 'rogue',
      elementType: 'water',
      elementLevel: 3,
    },
    effects: [
      {
        type: 'slow',
        value: 60,  // 减速60%
        duration: 5,
      },
    ],
  },

  // 风盗贼融合技
  {
    id: 'rogue_wind_combo',
    name: 'Wind Combo',
    description: '风暴连击：瞬间打出5次攻击',
    icon: '🌪️🗡️',
    classType: 'rogue',
    elementType: 'wind',
    tier: 3,
    cost: 3,
    manaCost: 50,
    cooldown: 15,
    damage: 35,  // ×5次
    range: 50,
    prerequisites: ['rogue_blade_flurry'],
    requiredLevel: 15,
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: true,
    fusionRequirements: {
      classType: 'rogue',
      elementType: 'wind',
      elementLevel: 3,
    },
  },

  // 土盗贼融合技
  {
    id: 'rogue_earth_shatter',
    name: 'Earth Shatter',
    description: '碎岩之刃：背刺额外破甲',
    icon: '🪨🗡️',
    classType: 'rogue',
    elementType: 'earth',
    tier: 3,
    cost: 3,
    manaCost: 40,
    cooldown: 10,
    damage: 80,
    range: 50,
    prerequisites: ['rogue_backstab'],
    requiredLevel: 15,
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: true,
    fusionRequirements: {
      classType: 'rogue',
      elementType: 'earth',
      elementLevel: 3,
    },
    effects: [
      {
        type: 'debuff',
        value: 50,  // 降低50%防御
        duration: 6,
      },
    ],
  },
];

export function getAllRogueSkills(): Skill[] {
  return [...ROGUE_SKILLS, ...ROGUE_FUSION_SKILLS];
}

export function getRogueSkillsByTier(tier: number): Skill[] {
  return getAllRogueSkills().filter(skill => skill.tier === tier);
}
