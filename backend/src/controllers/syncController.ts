import { Request, Response } from 'express';
import { syncService } from '../services/syncService.js';
import { userService } from '../services/userService.js';
import type { ApiResponse } from '../models/types.js';

/**
 * 云同步控制器
 */
export class SyncController {
  /**
   * 上传存档到云端
   * POST /api/sync/:username/:slotNumber/upload
   */
  async uploadToCloud(req: Request, res: Response) {
    try {
      const { username, slotNumber } = req.params;
      const { gameData } = req.body;

      if (!gameData) {
        const response: ApiResponse = {
          success: false,
          error: 'Game data is required',
        };
        return res.status(400).json(response);
      }

      const user = userService.getOrCreateUser(username);
      const slot = parseInt(slotNumber, 10);

      const cloudSync = await syncService.uploadToCloud(user.id, slot, gameData);

      const response: ApiResponse = {
        success: true,
        data: {
          version: cloudSync.sync_version,
          syncedAt: cloudSync.synced_at,
        },
        message: 'Game uploaded to cloud successfully',
      };

      res.json(response);
    } catch (error: any) {
      console.error('上传到云端失败:', error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Failed to upload to cloud',
      };
      res.status(500).json(response);
    }
  }

  /**
   * 从云端下载存档
   * GET /api/sync/:username/:slotNumber/download
   */
  async downloadFromCloud(req: Request, res: Response) {
    try {
      const { username, slotNumber } = req.params;
      const { version } = req.query;

      const user = userService.getUserByUsername(username);
      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found',
        };
        return res.status(404).json(response);
      }

      const slot = parseInt(slotNumber, 10);
      const ver = version ? parseInt(version as string, 10) : undefined;

      const gameData = await syncService.downloadFromCloud(user.id, slot, ver);

      const response: ApiResponse = {
        success: true,
        data: gameData,
      };

      res.json(response);
    } catch (error: any) {
      console.error('从云端下载失败:', error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Failed to download from cloud',
      };
      res.status(500).json(response);
    }
  }

  /**
   * 获取同步历史
   * GET /api/sync/:username/:slotNumber/history
   */
  async getSyncHistory(req: Request, res: Response) {
    try {
      const { username, slotNumber } = req.params;
      const { limit } = req.query;

      const user = userService.getUserByUsername(username);
      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found',
        };
        return res.status(404).json(response);
      }

      const slot = parseInt(slotNumber, 10);
      const lim = limit ? parseInt(limit as string, 10) : 10;

      const history = syncService.getSyncHistory(user.id, slot, lim);

      const response: ApiResponse = {
        success: true,
        data: history,
      };

      res.json(response);
    } catch (error: any) {
      console.error('获取同步历史失败:', error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Failed to get sync history',
      };
      res.status(500).json(response);
    }
  }

  /**
   * 检查冲突
   * POST /api/sync/:username/:slotNumber/check-conflict
   */
  async checkConflict(req: Request, res: Response) {
    try {
      const { username, slotNumber } = req.params;
      const { localVersion, localTimestamp } = req.body;

      if (localVersion === undefined || localTimestamp === undefined) {
        const response: ApiResponse = {
          success: false,
          error: 'Local version and timestamp are required',
        };
        return res.status(400).json(response);
      }

      const user = userService.getUserByUsername(username);
      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found',
        };
        return res.status(404).json(response);
      }

      const slot = parseInt(slotNumber, 10);

      const conflict = syncService.checkConflict(
        localVersion,
        localTimestamp,
        user.id,
        slot
      );

      const response: ApiResponse = {
        success: true,
        data: conflict,
      };

      res.json(response);
    } catch (error: any) {
      console.error('检查冲突失败:', error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Failed to check conflict',
      };
      res.status(500).json(response);
    }
  }

  /**
   * 清理旧的同步记录
   * POST /api/sync/:username/:slotNumber/cleanup
   */
  async cleanupOldSyncs(req: Request, res: Response) {
    try {
      const { username, slotNumber } = req.params;
      const { keepCount } = req.body;

      const user = userService.getUserByUsername(username);
      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found',
        };
        return res.status(404).json(response);
      }

      const slot = parseInt(slotNumber, 10);
      const keep = keepCount || 10;

      const deletedCount = syncService.cleanupOldSyncs(user.id, slot, keep);

      const response: ApiResponse = {
        success: true,
        data: { deletedCount },
        message: `Cleaned up ${deletedCount} old sync records`,
      };

      res.json(response);
    } catch (error: any) {
      console.error('清理同步记录失败:', error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Failed to cleanup old syncs',
      };
      res.status(500).json(response);
    }
  }
}

export const syncController = new SyncController();
