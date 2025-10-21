# 🎨 AI图像生成指南

## 📋 概述

本指南帮助你使用AI工具生成游戏所需的所有精灵图资源。

**提示词库位置**: `frontend/public/data/ai-prompts.json`

---

## 🤖 推荐的AI工具

### 1. **Midjourney** (最推荐)
- **官网**: https://www.midjourney.com/
- **特点**: 质量最高，像素艺术效果好
- **价格**: $10/月起
- **适合**: 所有类型的游戏资源

**使用方法**:
```
/imagine prompt: [从JSON复制提示词] --ar 1:1 --v 6
```

### 2. **DALL-E 3** (通过ChatGPT Plus)
- **官网**: https://chat.openai.com/
- **特点**: 容易上手，精确控制
- **价格**: $20/月 (ChatGPT Plus)
- **适合**: 角色、物品图标

**使用方法**:
```
直接粘贴提示词到ChatGPT对话框
```

### 3. **Stable Diffusion** (免费)
- **在线版**: https://stablediffusionweb.com/
- **特点**: 完全免费，开源
- **适合**: 大量生成，实验性尝试

**使用方法**:
```
粘贴提示词，调整参数后生成
```

### 4. **Bing Image Creator** (免费)
- **官网**: https://www.bing.com/create
- **特点**: 基于DALL-E，免费使用
- **适合**: 预算有限的选择

---

## 📚 如何使用提示词库

### 步骤 1: 读取JSON文件

```javascript
// 在浏览器中或Node.js中读取
fetch('/data/ai-prompts.json')
  .then(res => res.json())
  .then(data => {
    console.log(data.players.warrior.idle.prompt);
  });
```

### 步骤 2: 选择要生成的资源

打开 `ai-prompts.json`，找到你需要的类型：

```json
{
  "players": { ... },      // 玩家角色
  "enemies": { ... },      // 敌人
  "environment": { ... },  // 环境物件
  "items": { ... },        // 物品道具
  "effects": { ... },      // 特效
  "tilesets": { ... },     // 地形贴图
  "ui": { ... }            // UI元素
}
```

### 步骤 3: 复制提示词

例如，生成战士角色：

```json
{
  "prompt": "A brave warrior character in pixel art style, wearing blue armor and helmet, holding a sword, standing idle pose, 32x32 pixels, top-down view, transparent background, clean pixel art, retro RPG game sprite",
  "filename": "player_warrior_idle.png"
}
```

### 步骤 4: 在AI工具中生成

#### Midjourney 示例:
```
/imagine A brave warrior character in pixel art style, wearing blue armor and helmet, holding a sword, standing idle pose, 32x32 pixels, top-down view, transparent background, clean pixel art, retro RPG game sprite --ar 1:1 --v 6
```

#### DALL-E 示例:
```
直接粘贴提示词，可以添加额外说明：
"生成一个像素艺术风格的战士角色..."
```

---

## 🎯 批量生成工作流

### 方案 A: 手动批量生成

1. **创建生成清单**
   ```
   □ player_warrior_idle.png
   □ player_warrior_walk.png
   □ player_mage_idle.png
   □ enemy_slime_green.png
   □ ...
   ```

2. **分类生成**
   - 第1天: 所有玩家角色
   - 第2天: 所有敌人
   - 第3天: 环境物件
   - 第4天: 物品和UI

3. **保存和整理**
   - 按照JSON中的`filename`命名
   - 保存到对应目录

### 方案 B: 使用脚本辅助

创建一个HTML工具来快速浏览提示词：

```html
<!DOCTYPE html>
<html>
<head>
  <title>AI提示词生成器</title>
  <style>
    body { font-family: Arial; padding: 20px; }
    .prompt { 
      background: #f0f0f0; 
      padding: 15px; 
      margin: 10px 0; 
      border-radius: 5px;
    }
    button { 
      background: #4CAF50; 
      color: white; 
      padding: 10px 20px; 
      border: none; 
      cursor: pointer;
    }
  </style>
</head>
<body>
  <h1>🎨 游戏资源AI提示词</h1>
  <div id="prompts"></div>
  
  <script>
    fetch('/data/ai-prompts.json')
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById('prompts');
        
        // 遍历所有玩家角色
        Object.entries(data.players).forEach(([key, char]) => {
          Object.entries(char).forEach(([action, details]) => {
            if (details.prompt) {
              const div = document.createElement('div');
              div.className = 'prompt';
              div.innerHTML = `
                <h3>${char.name} - ${action}</h3>
                <p><strong>文件名:</strong> ${details.filename}</p>
                <p><strong>提示词:</strong> ${details.prompt}</p>
                <button onclick="navigator.clipboard.writeText('${details.prompt}')">
                  复制提示词
                </button>
              `;
              container.appendChild(div);
            }
          });
        });
      });
  </script>
</body>
</html>
```

保存为 `frontend/public/prompt-viewer.html`，然后访问 `http://localhost:5173/prompt-viewer.html`

---

## 🔧 提示词优化技巧

### 1. 调整风格

**原始提示词**:
```
A brave warrior character in pixel art style...
```

**调整为不同风格**:
```
# 更卡通
A cute chibi warrior character in kawaii pixel art style...

# 更黑暗
A dark gritty warrior character in dark pixel art style...

# 更复古
A retro 8-bit warrior character in classic NES pixel art style...
```

### 2. 调整尺寸

对于Boss或大型敌人：
```
Original: 32x32 pixels
Modified: 64x64 pixels  或  128x128 pixels
```

### 3. 添加特定细节

```
# 原始
...wearing blue armor...

# 详细
...wearing medieval blue plate armor with gold trim and red cape...
```

### 4. 修改视角

```
# 俯视图（适合ARPG）
top-down view, isometric perspective

# 侧视图（适合平台跳跃）
side view, platformer perspective

# 3/4视角
three-quarter view, diagonal perspective
```

---

## 📐 后处理指南

生成后需要的处理步骤：

### 1. 去除背景（如果AI没有生成透明背景）

**在线工具**:
- https://www.remove.bg/ (自动去背景)
- https://www.photopea.com/ (手动处理)

### 2. 调整尺寸

确保图片是正确的像素尺寸：
```bash
# 使用ImageMagick (命令行)
convert input.png -resize 32x32 output.png

# 或在线工具
https://www.iloveimg.com/resize-image
```

### 3. 优化文件

```bash
# 压缩PNG文件
pngquant input.png --output output.png
```

### 4. 检查透明度

确保背景是完全透明的，不是白色。

---

## 📊 生成优先级建议

### 第一优先级（核心游戏元素）
- [ ] 玩家角色（4个职业 × 3个动作 = 12张）
- [ ] 基础敌人（史莱姆、哥布林 = 5张）
- [ ] 基础地形（草地、石头 = 2张）
- [ ] UI图标（生命、魔法 = 4张）

**预计时间**: 2-3小时

### 第二优先级（丰富游戏内容）
- [ ] 更多敌人变种（10张）
- [ ] 环境装饰（树、花、石头 = 10张）
- [ ] 物品道具（药水、武器 = 15张）
- [ ] 特效（爆炸、魔法 = 8张）

**预计时间**: 4-5小时

### 第三优先级（锦上添花）
- [ ] Boss敌人（2-3张）
- [ ] 完整地形集（水、泥土等 = 5张）
- [ ] 完整UI套件（按钮等 = 10张）
- [ ] 动画帧（行走、攻击等）

**预计时间**: 3-4小时

**总计**: 约10-12小时完成所有资源

---

## 💰 成本估算

### Midjourney (推荐)
- **基础计划**: $10/月 (~200张图)
- **标准计划**: $30/月 (不限量)
- **预算**: $10-30 即可完成所有资源

### DALL-E 3
- **ChatGPT Plus**: $20/月
- **生成限制**: 每3小时40张
- **预算**: $20 可完成

### Stable Diffusion (免费)
- **成本**: $0
- **缺点**: 质量可能不稳定
- **建议**: 用于实验和原型

---

## 📝 质量检查清单

生成每个资源后检查：

- [ ] **尺寸正确**: 与JSON中指定的size一致
- [ ] **背景透明**: 不是白色或其他颜色
- [ ] **风格一致**: 所有资源看起来像同一个游戏
- [ ] **清晰锐利**: 像素边缘清晰，没有模糊
- [ ] **色彩合适**: 不过饱和，符合游戏整体风格
- [ ] **命名正确**: 按照JSON中的filename命名

---

## 🎨 风格参考

### 经典像素艺术游戏参考
- **最终幻想 VI** - 详细的角色精灵
- **塞尔达传说：缩小帽** - 清新的环境
- **星露谷物语** - 温暖的色调
- **泰拉瑞亚** - 丰富的物品图标

### 推荐的颜色调色板
```
# 玩家和友好单位
蓝色系: #3498db, #2980b9, #5dade2

# 敌人
红色系: #e74c3c, #c0392b
绿色系: #2ecc71, #27ae60

# 环境
草地: #27ae60, #229954, #58d68d
石头: #95a5a6, #7f8c8d, #bdc3c7
```

---

## 🔗 有用的资源

### 学习像素艺术
- **Lospec**: https://lospec.com/pixel-art-tutorials
- **PixelJoint**: https://pixeljoint.com/
- **Pixel Art Tutorial**: https://blog.studiominiboss.com/pixelart

### 调色板工具
- **Lospec Palette List**: https://lospec.com/palette-list
- **Coolors**: https://coolors.co/

### 精灵表工具
- **Piskel**: https://www.piskelapp.com/
- **Aseprite**: https://www.aseprite.org/

---

## 🚀 快速开始示例

### 10分钟快速生成测试

1. **打开Midjourney Discord**
2. **复制以下提示词生成5个核心资源**:

```
/imagine A brave warrior character in pixel art style, wearing blue armor and helmet, holding a sword, standing idle pose, 32x32 pixels, top-down view, transparent background --ar 1:1 --v 6

/imagine Cute green slime monster pixel art, blob shape with big eyes, 32x32 pixels, transparent background --ar 1:1 --v 6

/imagine Oak tree pixel art, green leafy top, brown trunk, 32x48 pixels, transparent background --ar 1:1 --v 6

/imagine Red health potion pixel art, glass bottle with red liquid, 16x16 pixels, transparent background --ar 1:1 --v 6

/imagine Heart icon pixel art, red heart shape for health display, 16x16 pixels, transparent background --ar 1:1 --v 6
```

3. **下载生成的图片**
4. **去除背景（如需要）**
5. **重命名并放到项目中**:
   ```
   frontend/public/assets/sprites/player/warrior_idle.png
   frontend/public/assets/sprites/enemies/slime.png
   frontend/public/assets/sprites/environment/tree.png
   frontend/public/assets/sprites/items/potion_health.png
   frontend/public/assets/ui/icon_heart.png
   ```

6. **更新BootScene.ts加载这些资源**

---

## 📞 问题排查

### Q1: AI生成的不是像素艺术风格？

**解决**: 在提示词中强调：
```
pixel art style, 32x32 pixels, retro game sprite, sharp pixels, no blur
```

### Q2: 背景不是透明的？

**解决**: 
1. 在提示词中加上 `transparent background, PNG format`
2. 使用 remove.bg 工具后处理

### Q3: 生成的尺寸不对？

**解决**:
1. 使用图像编辑工具调整
2. 在Midjourney中使用 `--ar 1:1` 参数

### Q4: 风格不统一？

**解决**:
1. 保持相同的基础提示词结构
2. 使用相同的AI工具和参数
3. 参考已生成的资源进行调整

---

**开始创建你的游戏美术资源吧！** 🎮✨
