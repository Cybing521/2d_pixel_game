import { Router } from 'express';
import { syncController } from '../controllers/syncController.js';

const router = Router();

// 上传到云端
router.post('/:username/:slotNumber/upload', (req, res) => 
  syncController.uploadToCloud(req, res)
);

// 从云端下载
router.get('/:username/:slotNumber/download', (req, res) => 
  syncController.downloadFromCloud(req, res)
);

// 获取同步历史
router.get('/:username/:slotNumber/history', (req, res) => 
  syncController.getSyncHistory(req, res)
);

// 检查冲突
router.post('/:username/:slotNumber/check-conflict', (req, res) => 
  syncController.checkConflict(req, res)
);

// 清理旧记录
router.post('/:username/:slotNumber/cleanup', (req, res) => 
  syncController.cleanupOldSyncs(req, res)
);

export default router;
