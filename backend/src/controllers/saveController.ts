import { Request, Response } from 'express';
import { saveService } from '../services/saveService.js';
import { userService } from '../services/userService.js';
import type { ApiResponse } from '../models/types.js';

/**
 * 存档控制器
 */
export class SaveController {
  /**
   * 获取用户的所有存档槽位
   * GET /api/saves/:username
   */
  async getSaveSlots(req: Request, res: Response) {
    try {
      const { username } = req.params;

      const user = userService.getUserByUsername(username);
      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found',
        };
        return res.status(404).json(response);
      }

      const slots = saveService.getUserSaveSlots(user.id);

      const response: ApiResponse = {
        success: true,
        data: slots,
      };

      res.json(response);
    } catch (error: any) {
      console.error('获取存档槽位失败:', error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Failed to get save slots',
      };
      res.status(500).json(response);
    }
  }

  /**
   * 保存游戏
   * POST /api/saves/:username/:slotNumber
   */
  async saveGame(req: Request, res: Response) {
    try {
      const { username, slotNumber } = req.params;
      const { gameData, saveName } = req.body;

      if (!gameData) {
        const response: ApiResponse = {
          success: false,
          error: 'Game data is required',
        };
        return res.status(400).json(response);
      }

      const user = userService.getOrCreateUser(username);
      const slot = parseInt(slotNumber, 10);

      const saveSlot = await saveService.saveGame(
        user.id,
        slot,
        gameData,
        saveName
      );

      const stats = saveService.getSaveStats(user.id, slot);

      const response: ApiResponse = {
        success: true,
        data: {
          slot: saveSlot,
          stats,
        },
        message: 'Game saved successfully',
      };

      res.json(response);
    } catch (error: any) {
      console.error('保存游戏失败:', error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Failed to save game',
      };
      res.status(500).json(response);
    }
  }

  /**
   * 加载游戏
   * GET /api/saves/:username/:slotNumber/load
   */
  async loadGame(req: Request, res: Response) {
    try {
      const { username, slotNumber } = req.params;

      const user = userService.getUserByUsername(username);
      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found',
        };
        return res.status(404).json(response);
      }

      const slot = parseInt(slotNumber, 10);
      const gameData = await saveService.loadGame(user.id, slot);

      const response: ApiResponse = {
        success: true,
        data: gameData,
      };

      res.json(response);
    } catch (error: any) {
      console.error('加载游戏失败:', error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Failed to load game',
      };
      res.status(500).json(response);
    }
  }

  /**
   * 删除存档
   * DELETE /api/saves/:username/:slotNumber
   */
  async deleteSave(req: Request, res: Response) {
    try {
      const { username, slotNumber } = req.params;

      const user = userService.getUserByUsername(username);
      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found',
        };
        return res.status(404).json(response);
      }

      const slot = parseInt(slotNumber, 10);
      const deleted = saveService.deleteSave(user.id, slot);

      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          error: 'Save not found',
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Save deleted successfully',
      };

      res.json(response);
    } catch (error: any) {
      console.error('删除存档失败:', error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Failed to delete save',
      };
      res.status(500).json(response);
    }
  }

  /**
   * 重命名存档
   * PATCH /api/saves/:username/:slotNumber/rename
   */
  async renameSave(req: Request, res: Response) {
    try {
      const { username, slotNumber } = req.params;
      const { newName } = req.body;

      if (!newName) {
        const response: ApiResponse = {
          success: false,
          error: 'New name is required',
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
      const renamed = saveService.renameSave(user.id, slot, newName);

      if (!renamed) {
        const response: ApiResponse = {
          success: false,
          error: 'Save not found',
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Save renamed successfully',
      };

      res.json(response);
    } catch (error: any) {
      console.error('重命名存档失败:', error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Failed to rename save',
      };
      res.status(500).json(response);
    }
  }
}

export const saveController = new SaveController();
