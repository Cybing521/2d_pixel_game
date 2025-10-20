import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { compressionService } from './compressionService.js';
import type { SaveSlot, SaveSlotListItem, GameProgressSummary } from '../models/types.js';

/**
 * 存档服务
 */
export class SaveService {
  /**
   * 获取用户的所有存档槽位
   */
  getUserSaveSlots(userId: string): SaveSlotListItem[] {
    const slots: SaveSlotListItem[] = [];
    
    // 初始化3个槽位
    for (let i = 1; i <= 3; i++) {
      const stmt = db.prepare(`
        SELECT slot_number, save_name, save_data, game_progress, updated_at
        FROM save_slots
        WHERE user_id = ? AND slot_number = ?
      `);
      
      const slot = stmt.get(userId, i) as any;
      
      if (slot) {
        let progress: GameProgressSummary | undefined;
        if (slot.game_progress) {
          try {
            progress = JSON.parse(slot.game_progress);
          } catch (e) {
            console.error('Failed to parse game progress:', e);
          }
        }

        slots.push({
          slot_number: slot.slot_number,
          save_name: slot.save_name,
          has_data: !!slot.save_data,
          progress,
          updated_at: slot.updated_at,
        });
      } else {
        // 空槽位
        slots.push({
          slot_number: i,
          save_name: `存档槽位 ${i}`,
          has_data: false,
          updated_at: 0,
        });
      }
    }
    
    return slots;
  }

  /**
   * 保存游戏数据到指定槽位
   */
  async saveGame(
    userId: string,
    slotNumber: number,
    gameData: any,
    saveName?: string
  ): Promise<SaveSlot> {
    // 验证槽位号
    if (slotNumber < 1 || slotNumber > 3) {
      throw new Error('Invalid slot number. Must be 1, 2, or 3.');
    }

    const now = Date.now();
    const dataString = JSON.stringify(gameData);

    // 压缩数据
    const compressed = await compressionService.compress(dataString);

    // 提取游戏进度摘要
    const progress: GameProgressSummary = {
      level: gameData.player?.level || 1,
      playTime: gameData.progress?.playTime || 0,
      exploredCount: gameData.progress?.exploredAreas?.length || 0,
      questsCompleted: gameData.progress?.completedQuests?.length || 0,
      lastPlayed: now,
    };

    // 检查槽位是否已存在
    const existing = db.prepare(`
      SELECT id FROM save_slots 
      WHERE user_id = ? AND slot_number = ?
    `).get(userId, slotNumber) as any;

    if (existing) {
      // 更新现有存档
      const stmt = db.prepare(`
        UPDATE save_slots
        SET save_name = ?,
            save_data = ?,
            is_compressed = ?,
            data_size = ?,
            compressed_size = ?,
            game_progress = ?,
            updated_at = ?
        WHERE id = ?
      `);

      stmt.run(
        saveName || `存档 ${slotNumber}`,
        compressed.data,
        compressed.compressed ? 1 : 0,
        compressed.originalSize,
        compressed.compressedSize,
        JSON.stringify(progress),
        now,
        existing.id
      );

      return this.getSaveSlot(userId, slotNumber)!;
    } else {
      // 创建新存档
      const id = uuidv4();
      const stmt = db.prepare(`
        INSERT INTO save_slots (
          id, user_id, slot_number, save_name, save_data,
          is_compressed, data_size, compressed_size, game_progress,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        userId,
        slotNumber,
        saveName || `存档 ${slotNumber}`,
        compressed.data,
        compressed.compressed ? 1 : 0,
        compressed.originalSize,
        compressed.compressedSize,
        JSON.stringify(progress),
        now,
        now
      );

      return this.getSaveSlot(userId, slotNumber)!;
    }
  }

  /**
   * 加载指定槽位的游戏数据
   */
  async loadGame(userId: string, slotNumber: number): Promise<any> {
    const saveSlot = this.getSaveSlot(userId, slotNumber);
    
    if (!saveSlot) {
      throw new Error('Save slot not found');
    }

    // 解压数据
    const compressedData = {
      compressed: saveSlot.is_compressed,
      data: saveSlot.save_data,
      originalSize: saveSlot.data_size,
      compressedSize: saveSlot.compressed_size,
    };

    const dataString = await compressionService.decompress(compressedData);
    return JSON.parse(dataString);
  }

  /**
   * 获取指定槽位的存档
   */
  getSaveSlot(userId: string, slotNumber: number): SaveSlot | null {
    const stmt = db.prepare(`
      SELECT * FROM save_slots
      WHERE user_id = ? AND slot_number = ?
    `);
    
    const row = stmt.get(userId, slotNumber) as any;
    
    if (!row) return null;

    return {
      ...row,
      is_compressed: Boolean(row.is_compressed),
    };
  }

  /**
   * 删除存档
   */
  deleteSave(userId: string, slotNumber: number): boolean {
    const stmt = db.prepare(`
      DELETE FROM save_slots
      WHERE user_id = ? AND slot_number = ?
    `);
    
    const result = stmt.run(userId, slotNumber);
    return result.changes > 0;
  }

  /**
   * 重命名存档
   */
  renameSave(userId: string, slotNumber: number, newName: string): boolean {
    const stmt = db.prepare(`
      UPDATE save_slots
      SET save_name = ?, updated_at = ?
      WHERE user_id = ? AND slot_number = ?
    `);
    
    const result = stmt.run(newName, Date.now(), userId, slotNumber);
    return result.changes > 0;
  }

  /**
   * 获取存档统计信息
   */
  getSaveStats(userId: string, slotNumber: number): {
    totalSize: number;
    compressedSize: number;
    compressionRatio: number;
    formattedSize: string;
  } | null {
    const slot = this.getSaveSlot(userId, slotNumber);
    
    if (!slot) return null;

    const compressionRatio = compressionService.calculateCompressionRatio(
      slot.data_size,
      slot.compressed_size
    );

    return {
      totalSize: slot.data_size,
      compressedSize: slot.compressed_size,
      compressionRatio,
      formattedSize: compressionService.formatSize(slot.compressed_size),
    };
  }
}

export const saveService = new SaveService();
