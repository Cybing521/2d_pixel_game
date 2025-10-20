// 职业数据定义
import type { ClassData, ClassType } from '@/types/skills';

export const CLASSES: Record<ClassType, ClassData> = {
  warrior: {
    id: 'warrior',
    name: 'Warrior',
    nameZh: '战士',
    description: '近战物理输出，高生命值和防御力，可以承受大量伤害',
    icon: '⚔️',
    baseStats: {
      healthBonus: 50,    // +50 HP
      manaBonus: 0,       // +0 MP
      attackBonus: 10,    // +10 ATK
      defenseBonus: 8,    // +8 DEF
      speedBonus: -5,     // -5 SPD（重甲慢）
    },
    specialMechanic: {
      name: '怒气',
      description: '受到伤害和攻击积累怒气，消耗怒气释放强力技能',
      resourceType: 'rage',
      maxResource: 100,
    },
    skills: [
      'warrior_basic_attack',
      'warrior_whirlwind',
      'warrior_shield_wall',
      'warrior_charge',
      'warrior_execute',
      'warrior_battle_cry',
      'warrior_rend',
      'warrior_shield_bash',
    ],
  },

  mage: {
    id: 'mage',
    name: 'Mage',
    nameZh: '法师',
    description: '远程魔法输出，高魔法伤害和AOE能力，但防御脆弱',
    icon: '🔮',
    baseStats: {
      healthBonus: -20,   // -20 HP（脆皮）
      manaBonus: 80,      // +80 MP
      attackBonus: 0,     // +0 ATK
      defenseBonus: -5,   // -5 DEF
      speedBonus: 0,      // +0 SPD
    },
    specialMechanic: {
      name: '法力流动',
      description: '连续施法增加伤害（最多5层），每层+10%伤害',
      resourceType: 'energy',
      maxResource: 5,
    },
    skills: [
      'mage_arcane_missile',
      'mage_teleport',
      'mage_time_warp',
      'mage_arcane_power',
      'mage_mana_shield',
      'mage_meteor',
      'mage_frost_nova',
      'mage_arcane_explosion',
    ],
  },

  rogue: {
    id: 'rogue',
    name: 'Rogue',
    nameZh: '盗贼',
    description: '高机动性刺客，暴击和背刺专家，灵活的位移能力',
    icon: '🗡️',
    baseStats: {
      healthBonus: 0,     // +0 HP
      manaBonus: -20,     // -20 MP
      attackBonus: 8,     // +8 ATK
      defenseBonus: 0,    // +0 DEF
      speedBonus: 15,     // +15 SPD（最快）
    },
    specialMechanic: {
      name: '连击点',
      description: '攻击积累连击点（最多5点），消耗释放终结技',
      resourceType: 'combo',
      maxResource: 5,
    },
    skills: [
      'rogue_backstab',
      'rogue_poison_blade',
      'rogue_shadow_step',
      'rogue_eviscerate',
      'rogue_stealth',
      'rogue_blade_flurry',
      'rogue_kidney_shot',
      'rogue_sprint',
    ],
  },

  priest: {
    id: 'priest',
    name: 'Priest',
    nameZh: '牧师',
    description: '治疗辅助职业，强大的治疗和增益能力，团队支援核心',
    icon: '✨',
    baseStats: {
      healthBonus: 10,    // +10 HP
      manaBonus: 60,      // +60 MP
      attackBonus: -5,    // -5 ATK
      defenseBonus: 3,    // +3 DEF
      speedBonus: 0,      // +0 SPD
    },
    specialMechanic: {
      name: '神圣能量',
      description: '治疗和辅助技能积累神圣能量，消耗释放强力技能',
      resourceType: 'holy_power',
      maxResource: 100,
    },
    skills: [
      'priest_flash_heal',
      'priest_holy_word',
      'priest_holy_nova',
      'priest_resurrection',
      'priest_power_word_shield',
      'priest_renew',
      'priest_dispel',
      'priest_divine_hymn',
    ],
  },
};

// 获取职业数据
export function getClassData(classType: ClassType): ClassData {
  return CLASSES[classType];
}

// 获取所有职业
export function getAllClasses(): ClassData[] {
  return Object.values(CLASSES);
}

// 职业选择时的初始属性加成
export function applyClassBonuses(classType: ClassType, baseStats: any) {
  const classData = getClassData(classType);
  return {
    ...baseStats,
    maxHealth: baseStats.maxHealth + classData.baseStats.healthBonus,
    maxMana: baseStats.maxMana + classData.baseStats.manaBonus,
    attack: baseStats.attack + classData.baseStats.attackBonus,
    defense: baseStats.defense + classData.baseStats.defenseBonus,
    speed: baseStats.speed + classData.baseStats.speedBonus,
  };
}
