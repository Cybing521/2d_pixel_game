# 🎮 Forgotten Realm Backend Server

轻量级游戏后端服务，支持多存档槽位和云同步功能。

## 🛠️ 技术栈

- **运行时**: Node.js 20+
- **框架**: Express 4
- **语言**: TypeScript 5
- **数据库**: SQLite 3 (Better-SQLite3)
- **压缩**: zlib (Node.js内置)

## 📦 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置必要的环境变量
```

### 3. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

### 4. 构建生产版本

```bash
npm run build
npm start
```

## 📡 API文档

### 健康检查

```http
GET /health
```

**响应**:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": 1697000000000,
  "env": "development"
}
```

---

### 存档管理

#### 获取存档槽位

```http
GET /api/saves/:username
```

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "slot_number": 1,
      "save_name": "我的存档",
      "has_data": true,
      "progress": {
        "level": 5,
        "playTime": 3600,
        "exploredCount": 150,
        "questsCompleted": 3,
        "lastPlayed": 1697000000000
      },
      "updated_at": 1697000000000
    },
    {
      "slot_number": 2,
      "save_name": "存档槽位 2",
      "has_data": false,
      "updated_at": 0
    },
    {
      "slot_number": 3,
      "save_name": "存档槽位 3",
      "has_data": false,
      "updated_at": 0
    }
  ]
}
```

#### 保存游戏

```http
POST /api/saves/:username/:slotNumber
Content-Type: application/json

{
  "gameData": { /* 游戏数据对象 */ },
  "saveName": "我的存档"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "slot": { /* 存档信息 */ },
    "stats": {
      "totalSize": 150000,
      "compressedSize": 45000,
      "compressionRatio": 70,
      "formattedSize": "43.95 KB"
    }
  },
  "message": "Game saved successfully"
}
```

#### 加载游戏

```http
GET /api/saves/:username/:slotNumber/load
```

**响应**:
```json
{
  "success": true,
  "data": { /* 游戏数据对象 */ }
}
```

#### 删除存档

```http
DELETE /api/saves/:username/:slotNumber
```

#### 重命名存档

```http
PATCH /api/saves/:username/:slotNumber/rename
Content-Type: application/json

{
  "newName": "新的存档名称"
}
```

---

### 云同步

#### 上传到云端

```http
POST /api/sync/:username/:slotNumber/upload
Content-Type: application/json

{
  "gameData": { /* 游戏数据对象 */ }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "version": 5,
    "syncedAt": 1697000000000
  },
  "message": "Game uploaded to cloud successfully"
}
```

#### 从云端下载

```http
GET /api/sync/:username/:slotNumber/download?version=5
```

可选参数 `version` 用于获取特定版本，不提供则获取最新版本。

#### 获取同步历史

```http
GET /api/sync/:username/:slotNumber/history?limit=10
```

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "slot_number": 1,
      "sync_version": 5,
      "sync_hash": "sha256hash",
      "synced_at": 1697000000000
    }
  ]
}
```

#### 检查冲突

```http
POST /api/sync/:username/:slotNumber/check-conflict
Content-Type: application/json

{
  "localVersion": 4,
  "localTimestamp": 1697000000000
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "hasConflict": true,
    "cloudVersion": 5,
    "cloudTimestamp": 1697000001000
  }
}
```

#### 清理旧同步记录

```http
POST /api/sync/:username/:slotNumber/cleanup
Content-Type: application/json

{
  "keepCount": 10
}
```

---

## 🗄️ 数据库结构

### users表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 用户ID (UUID) |
| username | TEXT | 用户名 (唯一) |
| email | TEXT | 邮箱 (可选) |
| created_at | INTEGER | 创建时间 (时间戳) |
| updated_at | INTEGER | 更新时间 (时间戳) |

### save_slots表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 存档ID (UUID) |
| user_id | TEXT | 用户ID |
| slot_number | INTEGER | 槽位号 (1-3) |
| save_name | TEXT | 存档名称 |
| save_data | TEXT | 存档数据 (可能压缩) |
| is_compressed | INTEGER | 是否压缩 (0/1) |
| data_size | INTEGER | 原始大小 (字节) |
| compressed_size | INTEGER | 压缩后大小 (字节) |
| game_progress | TEXT | 游戏进度摘要 (JSON) |
| created_at | INTEGER | 创建时间 |
| updated_at | INTEGER | 更新时间 |

### cloud_sync表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 同步记录ID (UUID) |
| user_id | TEXT | 用户ID |
| slot_number | INTEGER | 槽位号 |
| sync_version | INTEGER | 同步版本号 |
| sync_data | TEXT | 同步数据 (压缩) |
| sync_hash | TEXT | 数据哈希 (SHA-256) |
| synced_at | INTEGER | 同步时间 |

---

## 🔧 配置说明

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| PORT | 3000 | 服务器端口 |
| NODE_ENV | development | 运行环境 |
| DB_PATH | ./database/sqlite/game.db | 数据库路径 |
| CORS_ORIGIN | http://localhost:5173 | CORS允许的源 |
| COMPRESSION_THRESHOLD | 102400 | 压缩阈值 (100KB) |
| RATE_LIMIT_WINDOW_MS | 900000 | 限流窗口 (15分钟) |
| RATE_LIMIT_MAX_REQUESTS | 100 | 限流最大请求数 |

### 数据压缩

- 超过 100KB 的数据自动使用 gzip 压缩
- 压缩级别: 6 (平衡速度和压缩率)
- 预期压缩率: 70-80%

### 性能优化

- SQLite WAL模式 (Write-Ahead Logging)
- 64MB缓存
- 同步操作 (Better-SQLite3)
- 请求限流保护

---

## 📝 开发命令

```bash
# 开发模式 (热重载)
npm run dev

# 构建
npm run build

# 生产模式
npm start

# 数据库迁移
npm run db:migrate

# 测试
npm test
```

---

## 🔒 安全性

- Helmet.js 安全头部
- CORS跨域保护
- 请求限流
- 数据完整性校验 (SHA-256)
- SQL注入防护 (参数化查询)

---

## 📊 存储容量

- SQLite数据库: 无限制
- 单个存档: 建议 < 10MB (压缩前)
- 同步历史: 默认保留最近10个版本

---

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License
