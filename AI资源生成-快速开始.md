# 🎨 AI资源生成 - 快速开始

## ✅ 已完成的工作

我已经为你创建了完整的AI图像生成工具包：

### 1. **提示词库** ✅
**位置**: `frontend/public/data/ai-prompts.json`

包含 **100+ 专业提示词**，涵盖：
- 👤 **玩家角色** - 4个职业（战士、法师、盗贼、牧师）
- 👹 **敌人** - 史莱姆、哥布林、骷髅、幽灵、Boss
- 🌳 **环境** - 树木、岩石、植物、建筑
- 💎 **物品** - 药水、武器、装备、金币
- ✨ **特效** - 攻击、魔法、治疗效果
- 🗺️ **地形** - 草地、石头、水面、泥土
- 🎮 **UI** - 图标、按钮

### 2. **在线浏览工具** ✅
**访问**: http://localhost:5173/prompt-generator.html

功能：
- 📱 可视化浏览所有提示词
- 🔍 搜索和筛选
- 📋 一键复制
- 📥 批量导出

### 3. **完整指南** ✅
**位置**: `docs/AI图像生成指南.md`

包含：
- 🤖 推荐的AI工具（Midjourney、DALL-E等）
- 📐 使用教程和优化技巧
- 💰 成本估算
- 🎯 生成优先级建议

---

## 🚀 3步快速开始

### 步骤 1: 启动浏览工具

```bash
# 确保开发服务器正在运行
npm run dev

# 打开浏览器访问
http://localhost:5173/prompt-generator.html
```

### 步骤 2: 选择并复制提示词

1. 在网页中浏览提示词
2. 使用筛选器或搜索框
3. 点击"复制提示词"按钮

### 步骤 3: 在AI工具中生成

#### 使用 Midjourney (推荐)

```
/imagine [粘贴复制的提示词] --ar 1:1 --v 6
```

#### 使用 DALL-E 3 (ChatGPT Plus)

```
直接粘贴提示词到ChatGPT
```

#### 使用 Bing Image Creator (免费)

```
访问 https://www.bing.com/create
粘贴提示词
```

---

## 📋 生成清单

### 第一批（核心游戏 - 2小时）

**玩家角色** (12张):
- [ ] player_warrior_idle.png
- [ ] player_warrior_walk.png  
- [ ] player_warrior_attack.png
- [ ] player_mage_idle.png
- [ ] player_mage_walk.png
- [ ] player_mage_cast.png
- [ ] player_rogue_idle.png
- [ ] player_rogue_walk.png
- [ ] player_rogue_attack.png
- [ ] player_priest_idle.png
- [ ] player_priest_heal.png

**基础敌人** (5张):
- [ ] enemy_slime_green.png
- [ ] enemy_slime_blue.png
- [ ] enemy_slime_red.png
- [ ] enemy_goblin_idle.png
- [ ] enemy_ghost_idle.png

**环境** (5张):
- [ ] env_tree_oak.png
- [ ] env_rock_small.png
- [ ] env_grass.png
- [ ] env_chest_closed.png
- [ ] env_chest_open.png

**UI图标** (4张):
- [ ] ui_icon_heart.png
- [ ] ui_icon_mana.png
- [ ] ui_icon_coin.png
- [ ] item_coin_gold.png

**总计**: 26张

### 第二批（扩展内容 - 3小时）

**更多敌人** (8张):
- [ ] enemy_goblin_archer.png
- [ ] enemy_goblin_shaman.png
- [ ] enemy_skeleton_idle.png
- [ ] enemy_skeleton_mage.png
- [ ] boss_dragon_idle.png
- [ ] boss_dragon_attack.png
- [ ] boss_demon_idle.png

**环境装饰** (10张):
- [ ] env_tree_pine.png
- [ ] env_tree_dead.png
- [ ] env_rock_large.png
- [ ] env_crystal.png
- [ ] env_flower.png
- [ ] env_mushroom.png
- [ ] env_sign.png
- [ ] env_torch.png

**物品道具** (15张):
- [ ] item_potion_health.png
- [ ] item_potion_mana.png
- [ ] item_food_meat.png
- [ ] item_weapon_sword.png
- [ ] item_weapon_staff.png
- [ ] item_weapon_bow.png
- [ ] item_weapon_dagger.png
- [ ] item_armor_helmet.png
- [ ] item_armor_chest.png
- [ ] item_armor_shield.png
- [ ] item_gem.png

**总计**: 33张

### 第三批（特效和地形 - 2小时）

**特效** (8张):
- [ ] fx_slash.png
- [ ] fx_explosion.png (4帧)
- [ ] fx_fireball.png
- [ ] fx_ice_shard.png
- [ ] fx_heal.png (4帧)
- [ ] fx_buff.png
- [ ] fx_teleport.png (4帧)

**地形贴图** (4张):
- [ ] tileset_grass.png
- [ ] tileset_stone.png
- [ ] tileset_water.png
- [ ] tileset_dirt.png

**UI元素** (6张):
- [ ] ui_icon_stamina.png
- [ ] ui_button_normal.png
- [ ] ui_button_hover.png
- [ ] ui_button_pressed.png

**总计**: 18张

---

## 💡 实用技巧

### 1. Midjourney 参数说明

```bash
# 基础命令
/imagine [提示词] --ar 1:1 --v 6

# 参数解释
--ar 1:1      # 1:1 宽高比（正方形）
--v 6         # 版本6（最新）
--stylize 50  # 风格化程度（可选，范围0-1000）
--quality 2   # 质量（可选，1或2）
```

### 2. 提示词优化

**让风格更像素化**:
```
添加: retro 8-bit style, sharp pixels, no anti-aliasing
```

**调整颜色**:
```
添加: vibrant colors / muted colors / dark colors
```

**改变视角**:
```
替换: top-down view → side view / isometric view
```

### 3. 批量下载

Midjourney Discord中：
1. 右键点击图片
2. 选择 "在浏览器中打开"
3. 右键保存图片
4. 按照JSON中的filename重命名

---

## 📁 文件组织

生成后的文件应放置在：

```
frontend/public/assets/
├── sprites/
│   ├── player/
│   │   ├── warrior_idle.png
│   │   ├── warrior_walk.png
│   │   └── ...
│   ├── enemies/
│   │   ├── slime_green.png
│   │   └── ...
│   └── environment/
│       ├── tree_oak.png
│       └── ...
├── effects/
│   ├── slash.png
│   └── ...
├── items/
│   ├── potion_health.png
│   └── ...
├── tilesets/
│   ├── grass.png
│   └── ...
└── ui/
    ├── icon_heart.png
    └── ...
```

---

## 🎯 完成后的下一步

### 1. 更新游戏代码

编辑 `frontend/src/game/scenes/BootScene.ts`:

```typescript
private loadAssets() {
  // 删除Canvas临时绘制代码（第61-291行）
  
  // 使用真实资源
  // 玩家
  this.load.image('player-warrior', '/assets/sprites/player/warrior_idle.png');
  this.load.spritesheet('player-warrior-walk', '/assets/sprites/player/warrior_walk.png', {
    frameWidth: 32,
    frameHeight: 32
  });
  
  // 敌人
  this.load.image('enemy-slime', '/assets/sprites/enemies/slime_green.png');
  this.load.image('enemy-goblin', '/assets/sprites/enemies/goblin_idle.png');
  
  // 环境
  this.load.image('tree', '/assets/sprites/environment/tree_oak.png');
  this.load.image('rock', '/assets/sprites/environment/rock_small.png');
  
  // 物品
  this.load.image('potion-health', '/assets/items/potion_health.png');
  this.load.image('coin', '/assets/items/coin_gold.png');
  
  // UI
  this.load.image('heart', '/assets/ui/icon_heart.png');
  this.load.image('mana', '/assets/ui/icon_mana.png');
}
```

### 2. 重启开发服务器

```bash
npm run dev
```

### 3. 测试游戏

打开 http://localhost:5173，检查所有资源是否正确加载。

---

## 🤖 推荐AI工具对比

| 工具 | 价格 | 质量 | 速度 | 推荐度 |
|------|------|------|------|--------|
| **Midjourney** | $10-30/月 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **DALL-E 3** | $20/月 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Stable Diffusion** | 免费 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Bing Creator** | 免费 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

**推荐组合**: Midjourney (主要) + Bing Creator (补充)

---

## 📞 获取帮助

### 文档
- 📖 完整指南: `docs/AI图像生成指南.md`
- 📋 提示词库: `frontend/public/data/ai-prompts.json`
- 🌐 在线工具: http://localhost:5173/prompt-generator.html

### 资源
- Midjourney Discord: https://discord.gg/midjourney
- DALL-E: https://chat.openai.com/
- Bing Creator: https://www.bing.com/create

---

## 💰 预算建议

### 经济方案 ($0-10)
- 使用 Bing Image Creator (免费)
- 使用 Stable Diffusion Web UI (免费)
- 预计时间: 10-15小时

### 推荐方案 ($10-30)
- Midjourney 基础计划 $10/月
- 可生成200+张图
- 预计时间: 7-10小时

### 专业方案 ($30-50)
- Midjourney 标准计划 $30/月
- ChatGPT Plus $20/月
- 无限生成，快速迭代
- 预计时间: 5-7小时

---

## ✅ 质量检查

生成每张图片后确认：

- [ ] 尺寸正确（32x32 或指定尺寸）
- [ ] 背景透明（PNG格式）
- [ ] 像素艺术风格一致
- [ ] 颜色不过饱和
- [ ] 细节清晰可见
- [ ] 文件命名正确

---

**开始用AI创造你的游戏世界吧！** 🎮✨

有任何问题，查看完整指南或在线浏览工具。
