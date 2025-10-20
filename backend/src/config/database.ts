import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据库路径
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../database/sqlite/game.db');

// 确保数据库目录存在
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 创建数据库连接
export const db = new Database(DB_PATH, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
});

// 启用外键约束
db.pragma('foreign_keys = ON');

// 优化性能
db.pragma('journal_mode = WAL'); // Write-Ahead Logging
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -64000'); // 64MB cache

console.log(`✅ Database connected: ${DB_PATH}`);

// 初始化数据库表
export function initDatabase() {
  // 用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  // 存档槽位表
  db.exec(`
    CREATE TABLE IF NOT EXISTS save_slots (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      slot_number INTEGER NOT NULL CHECK(slot_number BETWEEN 1 AND 3),
      save_name TEXT DEFAULT 'Untitled Save',
      save_data TEXT NOT NULL,
      is_compressed INTEGER DEFAULT 1,
      data_size INTEGER DEFAULT 0,
      compressed_size INTEGER DEFAULT 0,
      game_progress TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, slot_number)
    )
  `);

  // 云同步表
  db.exec(`
    CREATE TABLE IF NOT EXISTS cloud_sync (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      slot_number INTEGER NOT NULL,
      sync_version INTEGER NOT NULL DEFAULT 1,
      sync_data TEXT NOT NULL,
      sync_hash TEXT NOT NULL,
      synced_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_save_slots_user 
    ON save_slots(user_id);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_cloud_sync_user 
    ON cloud_sync(user_id, slot_number);
  `);

  console.log('✅ Database tables initialized');
}

// 关闭数据库连接
export function closeDatabase() {
  db.close();
  console.log('✅ Database connection closed');
}

// 在进程退出时关闭数据库
process.on('exit', () => closeDatabase());
process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});
