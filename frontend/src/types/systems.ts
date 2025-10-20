// 系统类型定义
import { ElementType, Position } from './game';

export interface Skill {
  id: string;
  name: string;
  description: string;
  element: ElementType;
  manaCost: number;
  cooldown: number;
  damage?: number;
  radius?: number;
  duration?: number;
  effect?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'main' | 'side' | 'daily';
  status: 'available' | 'active' | 'completed' | 'failed';
  objectives: QuestObjective[];
  rewards: QuestReward[];
  prerequisites?: string[];
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'kill' | 'collect' | 'explore' | 'talk';
  target: string;
  current: number;
  required: number;
  completed: boolean;
}

export interface QuestReward {
  type: 'exp' | 'item' | 'skill';
  value: string | number;
  quantity: number;
}

export interface FogCell {
  x: number;
  y: number;
  explored: boolean;
  visible: boolean;
}

export interface SaveData {
  version: string;
  timestamp: number;
  player: any;
  inventory: any;
  quests: Quest[];
  progress: ProgressData;
  settings: SettingsData;
}

export interface ProgressData {
  exploredAreas: string[];
  killedBosses: string[];
  unlockedSkills: string[];
  completedQuests: string[];
  discoveredItems: string[];
  // 等级成长系统
  exp: number;
  expToNextLevel: number;
  unallocatedPoints: number;
  recentChoices: string[];  // 最近5次选择的属性ID
}

export interface SettingsData {
  volume: {
    master: number;
    music: number;
    sfx: number;
  };
  graphics: {
    fullscreen: boolean;
    vsync: boolean;
  };
  controls: {
    [key: string]: string;
  };
  // 新增设置
  resolution?: '1280x720' | '1600x900' | '1920x1080';
  miniMapSize?: 'small' | 'medium' | 'large';
  showFPS?: boolean;
  soundEnabled?: boolean;
}
