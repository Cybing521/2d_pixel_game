// 游戏配置常量

export const GAME_CONFIG = {
  WIDTH: 1600,  // 增加基础分辨率
  HEIGHT: 900,
  TILE_SIZE: 16,
  ZOOM: 1.5,   // 调整缩放以匹配新分辨率
  
  // 大地图配置（10倍世界）
  WORLD_WIDTH: 10000,  // 原本1000，现在10000
  WORLD_HEIGHT: 10000,
  CHUNK_SIZE: 1024,    // 每个chunk大小
} as const;

export const PLAYER_CONFIG = {
  SPEED: 100,
  STARTING_HEALTH: 100,
  STARTING_MANA: 80,
  STARTING_LEVEL: 1,
} as const;

export const COMBAT_CONFIG = {
  DAMAGE_MULTIPLIER: 1.0,
  CRIT_CHANCE: 0.1,
  CRIT_DAMAGE: 1.5,
  DODGE_CHANCE: 0.05,
} as const;

export const FOG_CONFIG = {
  INITIAL_DENSITY: 0.8,
  CLEAR_RADIUS: 100,
  REGENERATION_RATE: 0.01,
  GRID_SIZE: 16,
} as const;

export const SCENE_KEYS = {
  BOOT: 'BootScene',
  MENU: 'MenuScene',
  GAME: 'GameScene',
  UI: 'UIScene',
  BATTLE: 'BattleScene',
} as const;

export const ELEMENT_COLORS = {
  fire: 0xff4444,
  ice: 0x44ccff,
  thunder: 0xffff44,
  nature: 0x44ff44,
} as const;

export const RARITY_COLORS = {
  common: '#ffffff',
  uncommon: '#00ff00',
  rare: '#0099ff',
  epic: '#cc00ff',
  legendary: '#ff9900',
} as const;
