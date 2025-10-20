/**
 * 统一存储管理器
 * 整合 LocalStorage、IndexedDB 和云同步功能
 */

import { compressData, decompressData } from './compression';
import {
  initIndexedDB,
  saveToIndexedDB,
  loadFromIndexedDB,
  getAllSaveSlots,
  deleteFromIndexedDB,
  renameSaveInIndexedDB,
  getStorageUsage,
} from './indexedDB';
import { CloudSyncClient, SaveAPI } from './cloudSync';

export type StorageMode = 'local' | 'indexeddb' | 'cloud';

export interface StorageConfig {
  mode: StorageMode;
  username?: string;
  enableCompression?: boolean;
  enableCloudSync?: boolean;
  apiUrl?: string;
}

export interface SaveSlotInfo {
  slotNumber: number;
  saveName: string;
  hasData: boolean;
  updatedAt: number;
  preview?: {
    level: number;
    exploredCount: number;
  };
}

/**
 * 存储管理器类
 */
export class StorageManager {
  private mode: StorageMode;
  private username: string;
  private enableCompression: boolean;
  private enableCloudSync: boolean;
  private cloudClient?: CloudSyncClient;
  private saveAPI?: SaveAPI;

  constructor(config: StorageConfig) {
    this.mode = config.mode || 'indexeddb';
    this.username = config.username || 'Player';
    this.enableCompression = config.enableCompression ?? true;
    this.enableCloudSync = config.enableCloudSync ?? false;

    if (this.enableCloudSync && this.username) {
      this.cloudClient = new CloudSyncClient({
        username: this.username,
        apiUrl: config.apiUrl,
      });
      this.saveAPI = new SaveAPI(this.username, config.apiUrl);
    }

    // 初始化IndexedDB
    if (this.mode === 'indexeddb') {
      initIndexedDB().catch(err => {
        console.error('IndexedDB初始化失败:', err);
        console.log('降级到LocalStorage模式');
        this.mode = 'local';
      });
    }
  }

  /**
   * 保存游戏数据
   */
  async save(slotNumber: number, data: any, saveName?: string): Promise<void> {
    try {
      // 压缩数据（如果启用）
      let saveData = data;
      if (this.enableCompression) {
        const compressed = compressData(data);
        console.log(
          `📦 数据压缩: ${compressed.originalSize} -> ${compressed.compressedSize} bytes (${((compressed.originalSize - compressed.compressedSize) / compressed.originalSize * 100).toFixed(1)}%)`
        );
        saveData = compressed;
      }

      // 保存到本地存储
      switch (this.mode) {
        case 'indexeddb':
          await saveToIndexedDB(slotNumber, saveData, saveName);
          break;

        case 'local':
          this.saveToLocalStorage(slotNumber, saveData, saveName);
          break;

        case 'cloud':
          if (this.saveAPI) {
            await this.saveAPI.saveGame(slotNumber, saveData, saveName);
          }
          break;
      }

      // 云同步（如果启用）
      if (this.enableCloudSync && this.cloudClient) {
        try {
          await this.cloudClient.uploadToCloud(slotNumber, data);
          console.log('☁️ 已同步到云端');
        } catch (error) {
          console.warn('云同步失败（将在后台重试）:', error);
        }
      }

      console.log(`✅ 游戏已保存到槽位 ${slotNumber}`);
    } catch (error) {
      console.error('保存失败:', error);
      throw error;
    }
  }

  /**
   * 加载游戏数据
   */
  async load(slotNumber: number): Promise<any> {
    try {
      let saveData: any;

      // 从存储加载
      switch (this.mode) {
        case 'indexeddb':
          saveData = await loadFromIndexedDB(slotNumber);
          break;

        case 'local':
          saveData = this.loadFromLocalStorage(slotNumber);
          break;

        case 'cloud':
          if (this.saveAPI) {
            saveData = await this.saveAPI.loadGame(slotNumber);
          }
          break;
      }

      if (!saveData) {
        throw new Error(`槽位 ${slotNumber} 没有存档`);
      }

      // 解压数据（如果需要）
      if (this.enableCompression && saveData.compressed) {
        saveData = decompressData(saveData);
      }

      console.log(`✅ 从槽位 ${slotNumber} 加载游戏`);
      return saveData;
    } catch (error) {
      console.error('加载失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有存档槽位
   */
  async getSaveSlots(): Promise<SaveSlotInfo[]> {
    switch (this.mode) {
      case 'indexeddb':
        return await getAllSaveSlots();

      case 'local':
        return this.getLocalSaveSlots();

      case 'cloud':
        if (this.saveAPI) {
          return await this.saveAPI.getSaveSlots();
        }
        return [];

      default:
        return [];
    }
  }

  /**
   * 删除存档
   */
  async deleteSave(slotNumber: number): Promise<void> {
    switch (this.mode) {
      case 'indexeddb':
        await deleteFromIndexedDB(slotNumber);
        break;

      case 'local':
        this.deleteFromLocalStorage(slotNumber);
        break;

      case 'cloud':
        if (this.saveAPI) {
          await this.saveAPI.deleteSave(slotNumber);
        }
        break;
    }

    console.log(`✅ 槽位 ${slotNumber} 已删除`);
  }

  /**
   * 重命名存档
   */
  async renameSave(slotNumber: number, newName: string): Promise<void> {
    switch (this.mode) {
      case 'indexeddb':
        await renameSaveInIndexedDB(slotNumber, newName);
        break;

      case 'local':
        this.renameLocalSave(slotNumber, newName);
        break;

      case 'cloud':
        if (this.saveAPI) {
          await this.saveAPI.renameSave(slotNumber, newName);
        }
        break;
    }

    console.log(`✅ 槽位 ${slotNumber} 已重命名为: ${newName}`);
  }

  /**
   * 获取存储使用情况
   */
  async getStorageInfo(): Promise<any> {
    if (this.mode === 'indexeddb') {
      return await getStorageUsage();
    }

    // LocalStorage
    const total = Object.keys(localStorage)
      .filter(key => key.startsWith('save-slot-'))
      .reduce((sum, key) => sum + localStorage.getItem(key)!.length, 0);

    return {
      usage: total,
      quota: 5 * 1024 * 1024, // 5MB估计值
      usagePercent: (total / (5 * 1024 * 1024)) * 100,
      formattedUsage: this.formatSize(total),
      formattedQuota: '~5 MB',
    };
  }

  // ========== LocalStorage 方法 ==========

  private saveToLocalStorage(slotNumber: number, data: any, saveName?: string): void {
    const key = `save-slot-${slotNumber}`;
    const saveData = {
      slotNumber,
      saveName: saveName || `存档 ${slotNumber}`,
      gameData: data,
      updatedAt: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(saveData));
  }

  private loadFromLocalStorage(slotNumber: number): any {
    const key = `save-slot-${slotNumber}`;
    const data = localStorage.getItem(key);
    
    if (!data) {
      return null;
    }

    const saveData = JSON.parse(data);
    return saveData.gameData;
  }

  private getLocalSaveSlots(): SaveSlotInfo[] {
    const slots: SaveSlotInfo[] = [];

    for (let i = 1; i <= 3; i++) {
      const key = `save-slot-${i}`;
      const data = localStorage.getItem(key);

      if (data) {
        const saveData = JSON.parse(data);
        slots.push({
          slotNumber: i,
          saveName: saveData.saveName,
          hasData: true,
          updatedAt: saveData.updatedAt,
          preview: {
            level: saveData.gameData?.player?.level || 1,
            exploredCount: saveData.gameData?.progress?.exploredAreas?.length || 0,
          },
        });
      } else {
        slots.push({
          slotNumber: i,
          saveName: `存档槽位 ${i}`,
          hasData: false,
          updatedAt: 0,
        });
      }
    }

    return slots;
  }

  private deleteFromLocalStorage(slotNumber: number): void {
    const key = `save-slot-${slotNumber}`;
    localStorage.removeItem(key);
  }

  private renameLocalSave(slotNumber: number, newName: string): void {
    const key = `save-slot-${slotNumber}`;
    const data = localStorage.getItem(key);
    
    if (!data) {
      throw new Error(`槽位 ${slotNumber} 不存在`);
    }

    const saveData = JSON.parse(data);
    saveData.saveName = newName;
    saveData.updatedAt = Date.now();
    localStorage.setItem(key, JSON.stringify(saveData));
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  /**
   * 切换存储模式
   */
  switchMode(newMode: StorageMode): void {
    this.mode = newMode;
    console.log(`🔄 存储模式切换为: ${newMode}`);
  }

  /**
   * 导出存档（用于备份）
   */
  async exportSave(slotNumber: number): Promise<string> {
    const data = await this.load(slotNumber);
    return JSON.stringify(data, null, 2);
  }

  /**
   * 导入存档（从备份恢复）
   */
  async importSave(slotNumber: number, jsonString: string, saveName?: string): Promise<void> {
    try {
      const data = JSON.parse(jsonString);
      await this.save(slotNumber, data, saveName);
      console.log('✅ 存档导入成功');
    } catch (error) {
      console.error('导入存档失败:', error);
      throw new Error('Invalid save data');
    }
  }
}

// 创建默认实例
export const storageManager = new StorageManager({
  mode: 'indexeddb',
  enableCompression: true,
  enableCloudSync: false,
});
