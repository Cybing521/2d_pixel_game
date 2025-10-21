// 风元素技能数据
import type { Skill } from '@/types/skills';

export const WIND_SKILLS: Skill[] = [
  {
    id: 'wind_blade',
    name: '疾风刃',
    description: '快速多段风刃攻击',
    elementType: 'wind',
    classType: null,
    tier: 1,
    cost: 1,
    manaCost: 12,
    cooldown: 1500,
    damage: 25,
    radius: 40,
    icon: '💨',
    requiredLevel: 1,
    prerequisites: [],
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: false,
    effects: [],
  },
  
  {
    id: 'tornado',
    name: '龙卷风',
    description: '召唤龙卷风击退敌人',
    elementType: 'wind',
    classType: null,
    tier: 2,
    cost: 2,
    manaCost: 35,
    cooldown: 8000,
    damage: 45,
    radius: 70,
    duration: 4000,
    icon: '🌪️',
    requiredLevel: 5,
    prerequisites: ['wind_blade'],
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: false,
    effects: [
      {
        type: 'knockback',
        value: 100,
        duration: 1000,
      },
    ],
  },
  
  {
    id: 'wind_shield',
    name: '风之庇护',
    description: '提升闪避率',
    elementType: 'wind',
    classType: null,
    tier: 2,
    cost: 2,
    manaCost: 25,
    cooldown: 12000,
    damage: 0,
    radius: 0,
    duration: 8000,
    icon: '🌬️',
    requiredLevel: 5,
    prerequisites: ['wind_blade'],
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: false,
    effects: [
      {
        type: 'dodge_buff',
        value: 30,
        duration: 8000,
      },
    ],
  },
  
  {
    id: 'storm',
    name: '暴风眼',
    description: '创造暴风眼，持续控制和伤害',
    elementType: 'wind',
    classType: null,
    tier: 3,
    cost: 3,
    manaCost: 55,
    cooldown: 15000,
    damage: 50,
    radius: 120,
    duration: 6000,
    icon: '🌀',
    requiredLevel: 10,
    prerequisites: ['tornado'],
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: false,
    effects: [
      {
        type: 'pull',
        value: 50,
        duration: 6000,
      },
    ],
  },
  
  {
    id: 'hurricane',
    name: '飓风',
    description: '终极风暴，毁灭一切',
    elementType: 'wind',
    classType: null,
    tier: 4,
    cost: 5,
    manaCost: 90,
    cooldown: 30000,
    damage: 150,
    radius: 180,
    duration: 8000,
    icon: '🌬️',
    requiredLevel: 20,
    prerequisites: ['storm'],
    currentLevel: 0,
    maxLevel: 3,
    isFusionSkill: false,
    effects: [
      {
        type: 'knockback',
        value: 200,
        duration: 2000,
      },
    ],
  },
];

export function getAllWindSkills(): Skill[] {
  return WIND_SKILLS;
}

export function getWindSkillById(id: string): Skill | undefined {
  return WIND_SKILLS.find((skill) => skill.id === id);
}
