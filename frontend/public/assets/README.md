# 🎨 游戏资源管理指南

## 📁 目录结构

```
assets/
├── sprites/              # 精灵图（角色、敌人、物件等）
│   ├── player/          # 玩家动画帧
│   ├── enemies/         # 敌人精灵
│   ├── environment/     # 环境物件（树、石头等）
│   └── effects/         # 特效（爆炸、技能等）
│
├── tilesets/            # 地图贴图集
│   ├── terrain.png      # 地形贴图
│   └── objects.png      # 物件贴图
│
├── audio/               # 音频文件
│   ├── music/          # 背景音乐（.mp3, .ogg）
│   └── sfx/            # 音效（.mp3, .wav）
│
└── ui/                  # UI 资源
    ├── buttons/         # 按钮图片
    ├── icons/          # 图标
    └── panels/         # 面板背景
```

---

## 🖼️ 如何添加精灵图

### 1. 玩家角色精灵

**推荐格式**: PNG 透明背景  
**推荐尺寸**: 16x16, 32x32, 或 64x64 像素  
**命名规范**: `player_idle.png`, `player_walk.png`, `player_attack.png`

**放置位置**: `assets/sprites/player/`

**示例**:
```
assets/sprites/player/
├── player_idle.png       # 站立动画（可以是精灵表）
├── player_walk.png       # 行走动画
├── player_run.png        # 奔跑动画
└── player_attack.png     # 攻击动画
```

### 2. 敌人精灵

**放置位置**: `assets/sprites/enemies/`

**示例**:
```
assets/sprites/enemies/
├── slime.png            # 史莱姆
├── goblin.png           # 哥布林
└── boss_dragon.png      # Boss
```

### 3. 精灵表（Sprite Sheet）

如果使用精灵表（多个动画帧在一张图上）：

**示例**: `player_walk.png` (4帧，每帧32x32)
```
[帧1][帧2][帧3][帧4]
```
总尺寸: 128x32 像素（4帧 × 32像素宽）

---

## 🎮 在 Phaser 中加载资源

### 步骤 1: 预加载资源

在 Phaser 场景的 `preload()` 方法中：

```typescript
// src/game/scenes/GameScene.ts

preload() {
  // 加载单张精灵图
  this.load.image('player', '/assets/sprites/player/player_idle.png');
  this.load.image('enemy_slime', '/assets/sprites/enemies/slime.png');
  
  // 加载精灵表（sprite sheet）
  this.load.spritesheet('player_walk', '/assets/sprites/player/player_walk.png', {
    frameWidth: 32,   // 每一帧的宽度
    frameHeight: 32,  // 每一帧的高度
  });
  
  // 加载地图贴图
  this.load.image('terrain', '/assets/tilesets/terrain.png');
  
  // 加载音频
  this.load.audio('bgm', '/assets/audio/music/main_theme.mp3');
  this.load.audio('hit', '/assets/audio/sfx/hit.wav');
}
```

### 步骤 2: 创建动画

```typescript
create() {
  // 创建行走动画
  this.anims.create({
    key: 'walk',
    frames: this.anims.generateFrameNumbers('player_walk', { start: 0, end: 3 }),
    frameRate: 10,    // 每秒10帧
    repeat: -1        // 循环播放
  });
  
  // 使用精灵
  const player = this.add.sprite(100, 100, 'player');
  player.play('walk');
}
```

---

## 🎨 免费像素艺术资源推荐

### 1. **itch.io** (推荐！)
- 网址: https://itch.io/game-assets/free/tag-pixel-art
- 大量免费像素艺术资源
- 搜索关键词: "pixel art", "sprite", "tileset"

### 2. **OpenGameArt.org**
- 网址: https://opengameart.org/
- 完全免费，多种开源协议
- 搜索: "2D sprites", "pixel art"

### 3. **Kenney.nl**
- 网址: https://kenney.nl/assets
- CC0 协议（完全免费使用）
- 高质量游戏资源包

### 4. **CraftPix**
- 网址: https://craftpix.net/freebies/
- 免费资源包
- 需要注册

### 5. **游戏开发者市场**
- **Humble Bundle** - 定期有游戏资源包特惠
- **Unity Asset Store** - 也有 2D 资源（不限 Unity 使用）

---

## 🛠️ 推荐的像素艺术工具

### 免费工具
1. **Aseprite** ($19.99，开源可自己编译)
   - 最专业的像素艺术工具
   - 支持动画和精灵表导出

2. **Piskel** (免费，在线)
   - 网址: https://www.piskelapp.com/
   - 浏览器内运行，无需安装

3. **GIMP** (免费)
   - 通用图像编辑器
   - 也可用于像素艺术

4. **LibreSprite** (免费)
   - Aseprite 的免费替代品
   - 功能类似

---

## 📐 资源规格建议

### 精灵尺寸
- **小型角色/敌人**: 16x16 或 32x32 像素
- **中型角色**: 48x48 或 64x64 像素
- **大型 Boss**: 128x128 像素以上

### 动画帧数
- **站立**: 1-4 帧
- **行走**: 4-8 帧
- **攻击**: 4-6 帧
- **受伤**: 1-2 帧

### 文件格式
- **图片**: PNG（透明背景）
- **音乐**: MP3 或 OGG
- **音效**: WAV 或 MP3

### 文件大小
- 单个精灵图: < 100KB
- 精灵表: < 500KB
- 背景音乐: < 5MB
- 音效: < 100KB

---

## 🎯 快速开始示例

### 1. 下载一个基础资源包

推荐：**Kenney - Pixel Platformer**
```bash
# 下载链接
https://kenney.nl/assets/pixel-platformer
```

### 2. 解压到对应目录

```bash
# 将角色精灵放到
frontend/public/assets/sprites/player/

# 将敌人精灵放到
frontend/public/assets/sprites/enemies/

# 将地形贴图放到
frontend/public/assets/tilesets/
```

### 3. 在代码中加载

编辑 `frontend/src/game/scenes/GameScene.ts`:

```typescript
preload() {
  // 加载你刚添加的资源
  this.load.image('player', '/assets/sprites/player/character.png');
  this.load.image('ground', '/assets/tilesets/terrain.png');
}

create() {
  // 使用资源
  const player = this.add.image(400, 300, 'player');
}
```

### 4. 重启开发服务器

```bash
npm run dev
```

---

## ⚠️ 注意事项

### 1. 路径问题
- ✅ 正确: `/assets/sprites/player.png`
- ❌ 错误: `assets/sprites/player.png` (缺少前导 `/`)

### 2. 文件命名
- 使用小写和下划线: `player_walk.png` ✅
- 避免空格和特殊字符: `Player Walk.png` ❌

### 3. 透明背景
- PNG 格式支持透明
- 确保背景是透明的，不是白色

### 4. 版权问题
- 使用前检查资源的授权协议
- 商业游戏需要商业授权
- 注明原作者（如果要求）

---

## 🔄 热重载

开发时，修改资源后：
1. Vite 会自动检测文件变化
2. 浏览器会自动刷新
3. 无需重启服务器

---

## 📚 更多资源

- **Phaser 官方文档**: https://photonstorm.github.io/phaser3-docs/
- **Phaser 示例**: https://phaser.io/examples
- **Pixel Art 教程**: https://blog.studiominiboss.com/pixelart

---

**准备好开始创作你的像素世界了吗？** 🎮✨
