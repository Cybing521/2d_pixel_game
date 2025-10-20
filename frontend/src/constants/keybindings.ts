// 按键绑定配置

export const DEFAULT_KEYBINDINGS = {
  // 移动
  MOVE_UP: 'W',
  MOVE_DOWN: 'S',
  MOVE_LEFT: 'A',
  MOVE_RIGHT: 'D',
  
  // 技能
  SKILL_1: '1',
  SKILL_2: '2',
  SKILL_3: '3',
  SKILL_4: '4',
  
  // 交互
  INTERACT: 'E',
  ATTACK: 'SPACE',
  
  // UI
  INVENTORY: 'I',
  SKILL_TREE: 'K',
  QUEST_LOG: 'J',
  MAP: 'M',
  
  // 系统
  PAUSE: 'ESC',
  MENU: 'ESC',
} as const;

export type KeyBinding = keyof typeof DEFAULT_KEYBINDINGS;
