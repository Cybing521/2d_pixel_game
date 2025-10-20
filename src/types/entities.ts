// 实体类型定义
import { ElementType } from './game';

export interface EntityStats {
  health: number;
  maxHealth: number;
  mana?: number;
  maxMana?: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface PlayerData extends EntityStats {
  level: number;
  exp: number;
  expToNextLevel: number;
  skills: string[];
  equippedItems: EquippedItems;
}

export interface EquippedItems {
  weapon?: Item;
  armor?: Item;
  accessory?: Item;
}

export interface EnemyData extends EntityStats {
  id: string;
  name: string;
  type: string;
  aiType: 'patrol' | 'aggressive' | 'defensive';
  dropTable: DropItem[];
  expReward: number;
}

export interface DropItem {
  itemId: string;
  chance: number;
  quantity: number;
}

export interface NPCData {
  id: string;
  name: string;
  dialogue: string[];
  questId?: string;
  shopItems?: string[];
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'material' | 'quest';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  stats?: Partial<EntityStats>;
  stackable: boolean;
  maxStack: number;
}

export interface InventorySlot {
  item: Item | null;
  quantity: number;
}
