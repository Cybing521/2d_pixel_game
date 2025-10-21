// 土元素技能数据
import type { Skill } from '@/types/skills';

export const EARTH_SKILLS: Skill[] = [
  {
    id: 'rock_armor',
    name: '岩石护甲',
    description: '增加防御力和伤害减免',
    elementType: 'earth',
    classType: null,
    tier: 1,
    cost: 1,
    manaCost: 20,
    cooldown: 5000,
    damage: 0,
    radius: 0,
    duration: 10000,
    icon: '🪨',
    requiredLevel: 1,
    prerequisites: [],
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: false,
    effects: [
      {
        type: 'defense_buff',
        value: 20,
        duration: 10000,
      },
    ],
  },
  
  {
    id: 'earth_spike',
    name: '地刺术',
    description: '从地面召唤尖刺攻击',
    elementType: 'earth',
    classType: null,
    tier: 2,
    cost: 2,
    manaCost: 30,
    cooldown: 6000,
    damage: 55,
    radius: 40,
    icon: '⛰️',
    requiredLevel: 5,
    prerequisites: ['rock_armor'],
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
  
  {
    id: 'stone_wall',
    name: '岩壁术',
    description: '创造石墙阻挡敌人',
    elementType: 'earth',
    classType: null,
    tier: 2,
    cost: 2,
    manaCost: 35,
    cooldown: 10000,
    damage: 0,
    radius: 80,
    duration: 8000,
    icon: '🧱',
    requiredLevel: 5,
    prerequisites: ['rock_armor'],
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: false,
    effects: [
      {
        type: 'terrain_block',
        value: 1,
        duration: 8000,
      },
    ],
  },
  
  {
    id: 'earth_rage',
    name: '大地之怒',
    description: '震动大地，晕眩所有敌人',
    elementType: 'earth',
    classType: null,
    tier: 3,
    cost: 3,
    manaCost: 60,
    cooldown: 15000,
    damage: 70,
    radius: 120,
    icon: '💢',
    requiredLevel: 10,
    prerequisites: ['earth_spike', 'stone_wall'],
    currentLevel: 0,
    maxLevel: 5,
    isFusionSkill: false,
    effects: [
      {
        type: 'stun',
        value: 1,
        duration: 3000,
      },
    ],
  },
  
  {
    id: 'earthquake',
    name: '地震术',
    description: '引发大地震，持续伤害和减速',
    elementType: 'earth',
    classType: null,
    tier: 4,
    cost: 5,
    manaCost: 100,
    cooldown: 30000,
    damage: 180,
    radius: 200,
    duration: 10000,
    icon: '🌍',
    requiredLevel: 20,
    prerequisites: ['earth_rage'],
    currentLevel: 0,
    maxLevel: 3,
    isFusionSkill: false,
    effects: [
      {
        type: 'slow',
        value: 80,
        duration: 10000,
      },
      {
        type: 'stun',
        value: 1,
        duration: 2000,
      },
    ],
  },
];

export function getAllEarthSkills(): Skill[] {
  return EARTH_SKILLS;
}

export function getEarthSkillById(id: string): Skill | undefined {
  return EARTH_SKILLS.find((skill) => skill.id === id);
}
