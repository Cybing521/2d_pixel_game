import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { compressionService } from './compressionService.js';
import type { CloudSync } from '../models/types.js';

/**
 * 云同步服务
 */
export class SyncService {
  /**
   * 计算数据哈希
   */
  private calculateHash(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * 上传存档到云端
   */
  async uploadToCloud(
    userId: string,
    slotNumber: number,
    gameData: any
  ): Promise<CloudSync> {
    const now = Date.now();
    const dataString = JSON.stringify(gameData);
    const hash = this.calculateHash(dataString);

    // 压缩数据
    const compressed = await compressionService.compress(dataString);

    // 获取当前版本号
    const currentVersion = this.getLatestSyncVersion(userId, slotNumber);
    const newVersion = currentVersion + 1;

    const id = uuidv4();

    const stmt = db.prepare(`
      INSERT INTO cloud_sync (
        id, user_id, slot_number, sync_version, sync_data, sync_hash, synced_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      userId,
      slotNumber,
      newVersion,
      compressed.data,
      hash,
      now
    );

    return {
      id,
      user_id: userId,
      slot_number: slotNumber,
      sync_version: newVersion,
      sync_data: compressed.data,
      sync_hash: hash,
      synced_at: now,
    };
  }

  /**
   * 从云端下载存档
   */
  async downloadFromCloud(
    userId: string,
    slotNumber: number,
    version?: number
  ): Promise<any> {
    let stmt;
    let sync: any;

    if (version !== undefined) {
      // 获取指定版本
      stmt = db.prepare(`
        SELECT * FROM cloud_sync
        WHERE user_id = ? AND slot_number = ? AND sync_version = ?
      `);
      sync = stmt.get(userId, slotNumber, version);
    } else {
      // 获取最新版本
      stmt = db.prepare(`
        SELECT * FROM cloud_sync
        WHERE user_id = ? AND slot_number = ?
        ORDER BY sync_version DESC
        LIMIT 1
      `);
      sync = stmt.get(userId, slotNumber);
    }

    if (!sync) {
      throw new Error('Cloud save not found');
    }

    // 解压数据
    const compressedData = {
      compressed: true, // 云端数据总是压缩的
      data: sync.sync_data,
      originalSize: 0,
      compressedSize: 0,
    };

    const dataString = await compressionService.decompress(compressedData);

    // 验证数据完整性
    const hash = this.calculateHash(dataString);
    if (hash !== sync.sync_hash) {
      throw new Error('Data integrity check failed');
    }

    return JSON.parse(dataString);
  }

  /**
   * 获取最新同步版本号
   */
  getLatestSyncVersion(userId: string, slotNumber: number): number {
    const stmt = db.prepare(`
      SELECT MAX(sync_version) as max_version
      FROM cloud_sync
      WHERE user_id = ? AND slot_number = ?
    `);
    
    const result = stmt.get(userId, slotNumber) as any;
    return result?.max_version || 0;
  }

  /**
   * 获取同步历史
   */
  getSyncHistory(userId: string, slotNumber: number, limit: number = 10): CloudSync[] {
    const stmt = db.prepare(`
      SELECT id, user_id, slot_number, sync_version, sync_hash, synced_at
      FROM cloud_sync
      WHERE user_id = ? AND slot_number = ?
      ORDER BY sync_version DESC
      LIMIT ?
    `);
    
    return stmt.all(userId, slotNumber, limit) as CloudSync[];
  }

  /**
   * 检查冲突
   * 比较本地版本和云端版本
   */
  checkConflict(
    localVersion: number,
    localTimestamp: number,
    userId: string,
    slotNumber: number
  ): {
    hasConflict: boolean;
    cloudVersion: number;
    cloudTimestamp: number;
  } {
    const stmt = db.prepare(`
      SELECT sync_version, synced_at
      FROM cloud_sync
      WHERE user_id = ? AND slot_number = ?
      ORDER BY sync_version DESC
      LIMIT 1
    `);
    
    const cloudSync = stmt.get(userId, slotNumber) as any;

    if (!cloudSync) {
      return {
        hasConflict: false,
        cloudVersion: 0,
        cloudTimestamp: 0,
      };
    }

    const hasConflict = 
      cloudSync.sync_version > localVersion &&
      cloudSync.synced_at > localTimestamp;

    return {
      hasConflict,
      cloudVersion: cloudSync.sync_version,
      cloudTimestamp: cloudSync.synced_at,
    };
  }

  /**
   * 清理旧的同步记录
   * 只保留最近N个版本
   */
  cleanupOldSyncs(userId: string, slotNumber: number, keepCount: number = 10): number {
    // 获取要保留的最小版本号
    const stmt1 = db.prepare(`
      SELECT sync_version
      FROM cloud_sync
      WHERE user_id = ? AND slot_number = ?
      ORDER BY sync_version DESC
      LIMIT 1 OFFSET ?
    `);
    
    const minVersion = stmt1.get(userId, slotNumber, keepCount - 1) as any;

    if (!minVersion) {
      return 0; // 没有需要清理的
    }

    // 删除旧版本
    const stmt2 = db.prepare(`
      DELETE FROM cloud_sync
      WHERE user_id = ? AND slot_number = ? AND sync_version < ?
    `);
    
    const result = stmt2.run(userId, slotNumber, minVersion.sync_version);
    return result.changes;
  }
}

export const syncService = new SyncService();
