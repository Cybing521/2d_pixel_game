// 水元素技能数据
import type { Skill } from '@/types/skills';

export const WATER_SKILLS: Skill[] = [
  // 第1层：入门技能
  {
    id: 'heal',
    name: '治疗术',
    description: '恢复自身或友军生命值',
    elementType: 'water',
    classType: null,
    tier: 1,
    cost: 1,
    manaCost: 20,
    cooldown: 3000,
    damage: 0,
    radius: 30,
    icon: '💚',
    requiredLevel: 1,
    prerequisites: [],
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: false,
    effects: [
      {
        type: 'heal',
        value: 40,
        duration: 0,
      },
    ],
  },
  
  // 第2层：进阶技能
  {
    id: 'water_shield',
    name: '水盾术',
    description: '创造水盾吸收伤害',
    elementType: 'water',
    classType: null,
    tier: 2,
    cost: 2,
    manaCost: 30,
    cooldown: 10000,
    damage: 0,
    radius: 0,
    duration: 6000,
    icon: '💧',
    requiredLevel: 5,
    prerequisites: ['heal'],
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: false,
    effects: [
      {
        type: 'shield',
        value: 50,
        duration: 6000,
      },
    ],
  },
  
  {
    id: 'ice_arrow',
    name: '冰霜箭',
    description: '发射冰箭，减速敌人',
    elementType: 'water',
    classType: null,
    tier: 2,
    cost: 2,
    manaCost: 25,
    cooldown: 4000,
    damage: 35,
    radius: 20,
    icon: '❄️',
    requiredLevel: 5,
    prerequisites: ['heal'],
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: false,
    effects: [
      {
        type: 'slow',
        value: 50,
        duration: 3000,
      },
    ],
  },
  
  // 第3层：精通技能
  {
    id: 'ice_storm',
    name: '寒冰风暴',
    description: '召唤冰霜风暴，冻结敌人',
    elementType: 'water',
    classType: null,
    tier: 3,
    cost: 3,
    manaCost: 60,
    cooldown: 15000,
    damage: 60,
    radius: 100,
    duration: 5000,
    icon: '🌨️',
    requiredLevel: 10,
    prerequisites: ['ice_arrow'],
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: false,
    effects: [
      {
        type: 'freeze',
        value: 1,
        duration: 2000,
      },
      {
        type: 'slow',
        value: 70,
        duration: 5000,
      },
    ],
  },
  
  // 第4层：终极技能
  {
    id: 'frozen_prison',
    name: '冰封牢狱',
    description: '将目标冰封，完全无法行动',
    elementType: 'water',
    classType: null,
    tier: 4,
    cost: 5,
    manaCost: 80,
    cooldown: 25000,
    damage: 100,
    radius: 80,
    icon: '🧊',
    requiredLevel: 20,
    prerequisites: ['ice_storm'],
    currentLevel: 0,
    maxLevel: 3,
    isFusionSkill: false,
    effects: [
      {
        type: 'freeze',
        value: 1,
        duration: 5000,
      },
    ],
  },
];

export function getAllWaterSkills(): Skill[] {
  return WATER_SKILLS;
}

export function getWaterSkillById(id: string): Skill | undefined {
  return WATER_SKILLS.find((skill) => skill.id === id);
}
