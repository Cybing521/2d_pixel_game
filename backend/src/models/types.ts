// 用户类型
export interface User {
  id: string;
  username: string;
  email?: string;
  created_at: number;
  updated_at: number;
}

// 存档槽位类型
export interface SaveSlot {
  id: string;
  user_id: string;
  slot_number: number; // 1, 2, 3
  save_name: string;
  save_data: string; // JSON string (可能是压缩的)
  is_compressed: boolean;
  data_size: number; // 原始大小
  compressed_size: number; // 压缩后大小
  game_progress?: string; // JSON string，包含游戏进度摘要
  created_at: number;
  updated_at: number;
}

// 游戏进度摘要（用于快速显示）
export interface GameProgressSummary {
  level: number;
  playTime: number; // 游戏时长（秒）
  exploredCount: number; // 探索区域数量
  questsCompleted: number; // 完成任务数量
  lastPlayed: number; // 最后游玩时间
}

// 云同步记录
export interface CloudSync {
  id: string;
  user_id: string;
  slot_number: number;
  sync_version: number;
  sync_data: string; // 压缩的JSON数据
  sync_hash: string; // 数据校验哈希
  synced_at: number;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 存档列表项
export interface SaveSlotListItem {
  slot_number: number;
  save_name: string;
  has_data: boolean;
  progress?: GameProgressSummary;
  updated_at: number;
}

// 压缩数据接口
export interface CompressedData {
  compressed: boolean;
  data: string; // base64 encoded if compressed
  originalSize: number;
  compressedSize: number;
}
