import { Router } from 'express';
import { saveController } from '../controllers/saveController.js';

const router = Router();

// 获取用户的所有存档槽位
router.get('/:username', (req, res) => saveController.getSaveSlots(req, res));

// 保存游戏
router.post('/:username/:slotNumber', (req, res) => saveController.saveGame(req, res));

// 加载游戏
router.get('/:username/:slotNumber/load', (req, res) => saveController.loadGame(req, res));

// 删除存档
router.delete('/:username/:slotNumber', (req, res) => saveController.deleteSave(req, res));

// 重命名存档
router.patch('/:username/:slotNumber/rename', (req, res) => saveController.renameSave(req, res));

export default router;
