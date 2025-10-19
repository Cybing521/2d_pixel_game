// 数值平衡配置

export const LEVEL_CONFIG = {
  EXP_BASE: 100,
  EXP_MULTIPLIER: 1.5,
  MAX_LEVEL: 50,
} as const;

export const SKILL_UNLOCK_LEVELS = {
  fireball: 1,
  frostnova: 5,
  lightning: 10,
  earthquake: 15,
  meteor: 20,
} as const;

export const ENEMY_SCALING = {
  HEALTH_PER_LEVEL: 10,
  DAMAGE_PER_LEVEL: 2,
  SPEED_INCREASE: 0.05,
} as const;

export const ITEM_DROP_RATES = {
  common: 0.6,
  uncommon: 0.25,
  rare: 0.10,
  epic: 0.04,
  legendary: 0.01,
} as const;
