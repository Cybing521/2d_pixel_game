// 游戏全局状态管理
import { create } from 'zustand';
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
  updatePlayerStats: (stats: Partial<PlayerData>) => void;
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
    
    updatePlayerStats: (stats) => set((state) => {
      Object.assign(state.player, stats);
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
  }))
);
