// 火元素技能数据
import type { Skill } from '@/types/skills';

export const FIRE_SKILLS: Skill[] = [
  // 第1层：入门技能
  {
    id: 'fireball',
    name: '火球术',
    description: '发射一枚火球，造成火焰伤害',
    elementType: 'fire',
    classType: null, // 通用技能
    tier: 1,
    cost: 1,
    manaCost: 15,
    cooldown: 2000,
    damage: 50,
    radius: 20,
    icon: '🔥',
    requiredLevel: 1,
    prerequisites: [],
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: false,
    effects: [
      {
        type: 'burn',
        value: 5,
        duration: 3000,
      },
    ],
  },
  
  // 第2层：进阶技能
  {
    id: 'fire_wall',
    name: '火墙术',
    description: '在指定位置召唤持续燃烧的火墙',
    elementType: 'fire',
    classType: null,
    tier: 2,
    cost: 2,
    manaCost: 30,
    cooldown: 8000,
    damage: 30,
    radius: 50,
    duration: 5000,
    icon: '🔥',
    requiredLevel: 5,
    prerequisites: ['fireball'],
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: false,
    effects: [
      {
        type: 'burn',
        value: 8,
        duration: 4000,
      },
    ],
  },
  
  {
    id: 'flame_storm',
    name: '烈焰风暴',
    description: '以自身为中心释放火焰风暴',
    elementType: 'fire',
    classType: null,
    tier: 2,
    cost: 2,
    manaCost: 35,
    cooldown: 10000,
    damage: 40,
    radius: 80,
    icon: '🔥',
    requiredLevel: 5,
    prerequisites: ['fireball'],
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: false,
    effects: [
      {
        type: 'burn',
        value: 10,
        duration: 3000,
      },
    ],
  },
  
  // 第3层：精通技能
  {
    id: 'explosion',
    name: '炎爆术',
    description: '对目标区域造成爆炸伤害',
    elementType: 'fire',
    classType: null,
    tier: 3,
    cost: 3,
    manaCost: 50,
    cooldown: 12000,
    damage: 80,
    radius: 100,
    icon: '💥',
    requiredLevel: 10,
    prerequisites: ['fire_wall'],
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: false,
    effects: [
      {
        type: 'burn',
        value: 15,
        duration: 5000,
      },
    ],
  },
  
  {
    id: 'hellfire',
    name: '地狱火',
    description: '召唤持续燃烧的地狱火柱',
    elementType: 'fire',
    classType: null,
    tier: 3,
    cost: 3,
    manaCost: 55,
    cooldown: 15000,
    damage: 60,
    radius: 70,
    duration: 8000,
    icon: '🔥',
    requiredLevel: 10,
    prerequisites: ['flame_storm'],
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: false,
    effects: [
      {
        type: 'burn',
        value: 20,
        duration: 6000,
      },
    ],
  },
  
  // 第4层：终极技能
  {
    id: 'meteor',
    name: '陨石术',
    description: '从天空召唤巨大陨石，造成毁灭性伤害',
    elementType: 'fire',
    classType: null,
    tier: 4,
    cost: 5,
    manaCost: 100,
    cooldown: 30000,
    damage: 200,
    radius: 150,
    icon: '☄️',
    requiredLevel: 20,
    prerequisites: ['explosion', 'hellfire'],
    currentLevel: 0,
    maxLevel: 3,
    isFusionSkill: false,
    effects: [
      {
        type: 'burn',
        value: 30,
        duration: 8000,
      },
      {
        type: 'stun',
        value: 1,
        duration: 2000,
      },
    ],
  },
];

/**
 * 获取所有火元素技能
 */
export function getAllFireSkills(): Skill[] {
  return FIRE_SKILLS;
}

/**
 * 根据ID获取技能
 */
export function getFireSkillById(id: string): Skill | undefined {
  return FIRE_SKILLS.find((skill) => skill.id === id);
}
