// 游戏全局状态管理
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { PlayerData, Item, EquippedItems } from '../types/entities';
import type { Quest, ProgressData, SettingsData } from '../types/systems';
import { PLAYER_CONFIG } from '@constants/gameConfig';

interface GameState {
  // 游戏状态
  isPlaying: boolean;
  isPaused: boolean;
  currentScene: string;
  
  // 玩家数据
  player: PlayerData;
  
  // 玩家位置（实时）
  playerPosition: {
    x: number;
    y: number;
  };
  
  // 敌人位置（实时）
  enemies: Array<{
    id: string;
    x: number;
    y: number;
    name: string;
  }>;
  
  // 任务标记
  questMarkers: Array<{
    id: string;
    x: number;
    y: number;
    name: string;
    type: 'objective' | 'npc' | 'area';
  }>;
  
  // 历史轨迹
  trajectory: Array<{
    x: number;
    y: number;
    timestamp: number;
  }>;
  
  // 地图标注
  mapMarkers: Array<{
    id: string;
    x: number;
    y: number;
    type: 'important' | 'danger' | 'treasure' | 'note';
    label: string;
    createdAt: number;
  }>;
  
  // 小地图位置
  miniMapPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  
  // 背包
  inventory: {
    items: (Item | null)[];
    maxSlots: number;
  };
  
  // 任务
  quests: Quest[];
  
  // 游戏进度
  progress: ProgressData;
  
  // 设置
  settings: SettingsData;
  
  // UI状态
  ui: {
    showInventory: boolean;
    showSkillTree: boolean;
    showQuestLog: boolean;
    showMap: boolean;
    showTrajectory: boolean;
  };
  
  // Actions
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  updatePlayerStats: (stats: Partial<PlayerData>) => void;
  updatePlayerPosition: (x: number, y: number) => void;
  addExploredArea: (x: number, y: number) => void;
  addItem: (item: Item) => boolean;
  removeItem: (itemId: string) => boolean;
  equipItem: (item: Item, slot: keyof EquippedItems) => void;
  addQuest: (quest: Quest) => void;
  updateQuest: (questId: string, updates: Partial<Quest>) => void;
  toggleUI: (uiKey: keyof GameState['ui']) => void;
  addTrajectoryPoint: (x: number, y: number) => void;
  clearTrajectory: () => void;
  addMapMarker: (x: number, y: number, type: string, label: string) => void;
  removeMapMarker: (id: string) => void;
  setMiniMapPosition: (position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left') => void;
  saveGame: () => void;
  loadGame: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    immer((set, get) => ({
      isPlaying: false,
      isPaused: false,
      currentScene: 'menu',
    
    player: {
      level: PLAYER_CONFIG.STARTING_LEVEL,
      exp: 0,
      expToNextLevel: 100,
      health: PLAYER_CONFIG.STARTING_HEALTH,
      maxHealth: PLAYER_CONFIG.STARTING_HEALTH,
      mana: PLAYER_CONFIG.STARTING_MANA,
      maxMana: PLAYER_CONFIG.STARTING_MANA,
      attack: 10,
      defense: 5,
      speed: PLAYER_CONFIG.SPEED,
      skills: ['fireball'],
      equippedItems: {},
    },
    
    playerPosition: {
      x: 400,
      y: 300,
    },
    
    enemies: [],
    
    questMarkers: [],
    
    trajectory: [],
    
    mapMarkers: [],
    
    miniMapPosition: 'top-right',
    
    inventory: {
      items: Array(20).fill(null),
      maxSlots: 20,
    },
    
    quests: [],
    
    progress: {
      exploredAreas: [],
      killedBosses: [],
      unlockedSkills: ['fireball'],
      completedQuests: [],
      discoveredItems: [],
    },
    
    settings: {
      volume: {
        master: 1.0,
        music: 0.8,
        sfx: 0.8,
      },
      graphics: {
        fullscreen: false,
        vsync: true,
      },
      controls: {},
    },
    
    ui: {
      showInventory: false,
      showSkillTree: false,
      showQuestLog: false,
      showMap: false,
      showTrajectory: true,
    },
    
    startGame: () => set((state) => {
      state.isPlaying = true;
      state.currentScene = 'game';
    }),
    
    pauseGame: () => set((state) => {
      state.isPaused = true;
    }),
    
    resumeGame: () => set((state) => {
      state.isPaused = false;
    }),
    
    resetGame: () => set((state) => {
      // 重置所有游戏数据到初始状态
      state.player = {
        level: PLAYER_CONFIG.STARTING_LEVEL,
        exp: 0,
        expToNextLevel: 100,
        health: PLAYER_CONFIG.STARTING_HEALTH,
        maxHealth: PLAYER_CONFIG.STARTING_HEALTH,
        mana: PLAYER_CONFIG.STARTING_MANA,
        maxMana: PLAYER_CONFIG.STARTING_MANA,
        attack: 10,
        defense: 5,
        speed: PLAYER_CONFIG.SPEED,
        skills: ['fireball'],
        equippedItems: {},
      };
      
      state.playerPosition = {
        x: 400,
        y: 300,
      };
      
      state.inventory = {
        items: Array(20).fill(null),
        maxSlots: 20,
      };
      
      state.quests = [];
      
      state.progress = {
        exploredAreas: [],
        killedBosses: [],
        unlockedSkills: ['fireball'],
        completedQuests: [],
        discoveredItems: [],
      };
      
      console.log('游戏已重置到初始状态');
    }),
    
    updatePlayerStats: (stats) => set((state) => {
      Object.assign(state.player, stats);
    }),
    
    updatePlayerPosition: (x, y) => set((state) => {
      state.playerPosition.x = x;
      state.playerPosition.y = y;
    }),
    
    addExploredArea: (x, y) => set((state) => {
      // 将位置转换为区域坐标（每64像素为一个区域）
      const areaX = Math.floor(x / 64);
      const areaY = Math.floor(y / 64);
      const areaKey = `${areaX}-${areaY}`;
      
      // 如果该区域未探索，则添加
      if (!state.progress.exploredAreas.includes(areaKey)) {
        state.progress.exploredAreas.push(areaKey);
      }
    }),
    
    addItem: (item) => {
      const state = get();
      const emptySlotIndex = state.inventory.items.findIndex(slot => slot === null);
      
      if (emptySlotIndex === -1) {
        console.log('背包已满');
        return false;
      }
      
      set((state) => {
        state.inventory.items[emptySlotIndex] = item;
      });
      return true;
    },
    
    removeItem: (itemId) => {
      const state = get();
      const itemIndex = state.inventory.items.findIndex(item => item?.id === itemId);
      
      if (itemIndex === -1) {
        return false;
      }
      
      set((state) => {
        state.inventory.items[itemIndex] = null;
      });
      return true;
    },
    
    equipItem: (item, slot) => set((state) => {
      state.player.equippedItems[slot] = item;
    }),
    
    addQuest: (quest) => set((state) => {
      state.quests.push(quest);
    }),
    
    updateQuest: (questId, updates) => set((state) => {
      const quest = state.quests.find(q => q.id === questId);
      if (quest) {
        Object.assign(quest, updates);
      }
    }),
    
    toggleUI: (uiKey) => set((state) => {
      state.ui[uiKey] = !state.ui[uiKey];
    }),
    
    addTrajectoryPoint: (x, y) => set((state) => {
      state.trajectory.push({
        x,
        y,
        timestamp: Date.now(),
      });
      
      // 只保留最近1000个点
      if (state.trajectory.length > 1000) {
        state.trajectory.shift();
      }
    }),
    
    clearTrajectory: () => set((state) => {
      state.trajectory = [];
    }),
    
    addMapMarker: (x, y, type, label) => set((state) => {
      // 检查标记数量限制
      if (state.mapMarkers.length >= 100) {
        console.warn('已达到标记上限（100个）');
        return;
      }
      
      state.mapMarkers.push({
        id: `marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x,
        y,
        type: type as 'important' | 'danger' | 'treasure' | 'note',
        label,
        createdAt: Date.now(),
      });
    }),
    
    removeMapMarker: (id) => set((state) => {
      state.mapMarkers = state.mapMarkers.filter(m => m.id !== id);
    }),
    
    setMiniMapPosition: (position) => set((state) => {
      state.miniMapPosition = position;
    }),
    
    saveGame: () => {
      const state = get();
      // TODO: 使用SaveSystem保存
      console.log('保存游戏', state);
    },
    
    loadGame: () => {
      // TODO: 使用SaveSystem加载
      console.log('加载游戏');
    },
  })),
  {
    name: 'forgotten-realm-storage', // LocalStorage 中的键名
    partialize: (state) => ({
      // 只持久化以下数据，不持久化临时状态
      player: state.player,
      playerPosition: state.playerPosition,
      inventory: state.inventory,
      quests: state.quests,
      progress: state.progress,
      settings: state.settings,
      trajectory: state.trajectory,
      mapMarkers: state.mapMarkers,
      miniMapPosition: state.miniMapPosition,
    }),
    version: 1, // 版本号，用于数据迁移
  }
)
);
