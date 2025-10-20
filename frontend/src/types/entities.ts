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
  // 特殊属性
  magic?: number;          // 魔法强度
  critRate?: number;       // 暴击率 (0-100)
  critDamage?: number;     // 暴击伤害倍数 (100 = 1x, 150 = 1.5x)
  cooldownReduction?: number; // 技能冷却减少 (0-100)
  expBonus?: number;       // 经验加成 (0-100)
  healthRegen?: number;    // 生命恢复/秒
  manaRegen?: number;      // 魔力恢复/秒
  // 高级属性
  lifeSteal?: number;      // 吸血 (0-100)
  thorns?: number;         // 反伤 (0-100)
  dodge?: number;          // 闪避 (0-100)
  penetration?: number;    // 穿透 (0-100)
  multiHit?: number;       // 多重打击次数
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
