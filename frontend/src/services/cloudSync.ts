/**
 * 云同步服务
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface SyncConfig {
  username: string;
  apiUrl?: string;
}

/**
 * 云同步客户端
 */
export class CloudSyncClient {
  private username: string;
  private apiUrl: string;

  constructor(config: SyncConfig) {
    this.username = config.username;
    this.apiUrl = config.apiUrl || API_BASE_URL;
  }

  /**
   * 上传存档到云端
   */
  async uploadToCloud(slotNumber: number, gameData: any): Promise<{
    version: number;
    syncedAt: number;
  }> {
    const response = await fetch(
      `${this.apiUrl}/sync/${this.username}/${slotNumber}/upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameData }),
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to upload to cloud');
    }

    console.log(`✅ 存档已上传到云端 (版本 ${result.data.version})`);
    return result.data;
  }

  /**
   * 从云端下载存档
   */
  async downloadFromCloud(
    slotNumber: number,
    version?: number
  ): Promise<any> {
    const url = version
      ? `${this.apiUrl}/sync/${this.username}/${slotNumber}/download?version=${version}`
      : `${this.apiUrl}/sync/${this.username}/${slotNumber}/download`;

    const response = await fetch(url);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to download from cloud');
    }

    console.log(`✅ 从云端下载存档成功`);
    return result.data;
  }

  /**
   * 检查冲突
   */
  async checkConflict(
    slotNumber: number,
    localVersion: number,
    localTimestamp: number
  ): Promise<{
    hasConflict: boolean;
    cloudVersion: number;
    cloudTimestamp: number;
  }> {
    const response = await fetch(
      `${this.apiUrl}/sync/${this.username}/${slotNumber}/check-conflict`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ localVersion, localTimestamp }),
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to check conflict');
    }

    return result.data;
  }

  /**
   * 获取同步历史
   */
  async getSyncHistory(
    slotNumber: number,
    limit: number = 10
  ): Promise<any[]> {
    const response = await fetch(
      `${this.apiUrl}/sync/${this.username}/${slotNumber}/history?limit=${limit}`
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to get sync history');
    }

    return result.data;
  }

  /**
   * 同步存档（智能合并）
   */
  async syncSave(
    slotNumber: number,
    localData: any,
    localVersion: number,
    localTimestamp: number
  ): Promise<{
    action: 'uploaded' | 'downloaded' | 'no-change';
    data?: any;
  }> {
    // 检查冲突
    const conflict = await this.checkConflict(
      slotNumber,
      localVersion,
      localTimestamp
    );

    if (!conflict.hasConflict) {
      // 无冲突，上传本地数据
      await this.uploadToCloud(slotNumber, localData);
      return { action: 'uploaded' };
    }

    // 有冲突，比较时间戳
    if (conflict.cloudTimestamp > localTimestamp) {
      // 云端更新，下载云端数据
      const cloudData = await this.downloadFromCloud(slotNumber);
      return { action: 'downloaded', data: cloudData };
    } else {
      // 本地更新，上传本地数据
      await this.uploadToCloud(slotNumber, localData);
      return { action: 'uploaded' };
    }
  }

  /**
   * 清理旧的同步记录
   */
  async cleanupOldSyncs(
    slotNumber: number,
    keepCount: number = 10
  ): Promise<number> {
    const response = await fetch(
      `${this.apiUrl}/sync/${this.username}/${slotNumber}/cleanup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keepCount }),
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to cleanup syncs');
    }

    return result.data.deletedCount;
  }
}

/**
 * 保存API客户端
 */
export class SaveAPI {
  private username: string;
  private apiUrl: string;

  constructor(username: string, apiUrl?: string) {
    this.username = username;
    this.apiUrl = apiUrl || API_BASE_URL;
  }

  /**
   * 获取所有存档槽位
   */
  async getSaveSlots(): Promise<any[]> {
    const response = await fetch(`${this.apiUrl}/saves/${this.username}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to get save slots');
    }

    return result.data;
  }

  /**
   * 保存游戏到服务器
   */
  async saveGame(
    slotNumber: number,
    gameData: any,
    saveName?: string
  ): Promise<any> {
    const response = await fetch(
      `${this.apiUrl}/saves/${this.username}/${slotNumber}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameData, saveName }),
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to save game');
    }

    return result.data;
  }

  /**
   * 从服务器加载游戏
   */
  async loadGame(slotNumber: number): Promise<any> {
    const response = await fetch(
      `${this.apiUrl}/saves/${this.username}/${slotNumber}/load`
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to load game');
    }

    return result.data;
  }

  /**
   * 删除存档
   */
  async deleteSave(slotNumber: number): Promise<void> {
    const response = await fetch(
      `${this.apiUrl}/saves/${this.username}/${slotNumber}`,
      {
        method: 'DELETE',
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete save');
    }
  }

  /**
   * 重命名存档
   */
  async renameSave(slotNumber: number, newName: string): Promise<void> {
    const response = await fetch(
      `${this.apiUrl}/saves/${this.username}/${slotNumber}/rename`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newName }),
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to rename save');
    }
  }
}
