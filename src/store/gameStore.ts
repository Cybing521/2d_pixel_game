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
    }),
    version: 1, // 版本号，用于数据迁移
  }
)
);
