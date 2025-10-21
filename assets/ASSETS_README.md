# 游戏资源说明文档

## 生成时间
2025-10-21

## 资源概览

本文档记录了RPG游戏所需的像素艺术资源，包括地图瓦片和角色精灵图。

---

## 1. 地图瓦片集

### 草地-泥土瓦片集 (Grass-Dirt Tileset)

**瓦片集ID**: `ae1dbc37-a154-4f86-b69d-118078da7eab`

**规格**:
- 类型: 俯视图 Wang 瓦片集 (Top-down Wang Tileset)
- 视角: 高俯视角 (High Top-down)
- 瓦片尺寸: 16x16 像素
- 瓦片数量: 16 个瓦片
- 过渡尺寸: 0.5 (中等过渡)

**地形层**:
- 下层地形: 泥土地面 (Dirt Ground)
  - Base Tile ID: `a3bc15bc-51ad-4d5c-bc05-51c1a761d8ed`
- 上层地形: 草地 (Grass Field)
  - Base Tile ID: `d56c2b08-e7ab-4e10-a3c7-6b28a1ea3693`
- 过渡描述: 草叶与泥土交接处

**样式**:
- 轮廓: 无轮廓 (Lineless)
- 阴影: 基础阴影 (Basic Shading)
- 细节: 中等细节 (Medium Detail)

**使用说明**:
- 使用 Wang 瓦片算法进行地图绘制
- 适用于 2D 俯视角 RPG 游戏
- 可用于创建草地-泥土过渡区域
- 支持 Godot 引擎的 TileMap 系统

**在线预览**: [查看瓦片集](待API修复后获取)

---

## 2. 角色精灵图

### 2.1 史莱姆敌人 (Green Slime Enemy)

**角色ID**: `3601e4b0-c563-4bf6-b2e1-4e9e966fde4b`

**规格**:
- 方向数量: 8 方向 (south, west, east, north, south-east, north-east, north-west, south-west)
- 画布尺寸: 32x32 像素
- 角色尺寸: 约 19px 高 × 14px 宽
- 视角: 低俯视角 (Low Top-down)

**样式**:
- 轮廓: 单色黑色轮廓 (Single Color Black Outline)
- 阴影: 基础阴影 (Basic Shading)
- 细节: 中等细节 (Medium Detail)
- 比例: 可爱风格 (Chibi)

**外观描述**:
- 可爱的绿色史莱姆怪物
- 光滑的胶状身体
- 简单圆润的团块形状
- 友好的敌对生物

**资源位置**:
- 目录: `assets/characters/slime/`
- 精灵图: `assets/characters/slime/rotations/`
  - south.png
  - west.png
  - east.png
  - north.png
  - south-east.png
  - north-east.png
  - north-west.png
  - south-west.png
- 元数据: `assets/characters/slime/metadata.json`

**下载链接**: [下载史莱姆资源包](https://api.pixellab.ai/mcp/characters/3601e4b0-c563-4bf6-b2e1-4e9e966fde4b/download)

---

### 2.2 初始英雄角色 (Weak Starter Hero)

**角色ID**: `6b2985a6-e458-4a30-80d8-f90eb3c8cd96`

**规格**:
- 方向数量: 8 方向 (south, west, east, north, south-east, north-east, north-west, south-west)
- 画布尺寸: 32x32 像素
- 角色尺寸: 约 19px 高 × 14px 宽
- 视角: 低俯视角 (Low Top-down)

**样式**:
- 轮廓: 单色黑色轮廓 (Single Color Black Outline)
- 阴影: 基础阴影 (Basic Shading)
- 细节: 中等细节 (Medium Detail)
- 比例: 默认比例 (Default)

**外观描述**:
- 虚弱的年轻村民
- 简单的布衣束腰外衣
- 凌乱的头发
- 瘦弱的体型
- 看起来胆怯且缺乏经验

**资源位置**:
- 目录: `assets/characters/hero/`
- 精灵图: `assets/characters/hero/rotations/`
  - south.png
  - west.png
  - east.png
  - north.png
  - south-east.png
  - north-east.png
  - north-west.png
  - south-west.png
- 元数据: `assets/characters/hero/metadata.json`

**下载链接**: [下载英雄资源包](https://api.pixellab.ai/mcp/characters/6b2985a6-e458-4a30-80d8-f90eb3c8cd96/download)

---

## 3. 动画系统

**状态**: 动画功能已达到试用限制

**说明**: 
- 角色当前包含 8 个静态方向视图
- 动画需要升级到完整版 PixelLab 服务
- 可用动画模板: 走路、待机、攻击等
- 每个动画都会生成所有 8 个方向的帧

**待实现动画**:
- 史莱姆:
  - `slime_idle`: 史莱姆团块轻微弹跳的待机动画
  - `slime_move`: 史莱姆向前跳跃并摇晃的移动动画
- 英雄:
  - `hero_idle`: 英雄呼吸待机动画
  - `hero_walk`: 英雄行走动画

---

## 4. 技术规格

### 通用规格
- 像素艺术风格: 复古 2D 像素风
- 色彩: 调色板优化的颜色
- 透明度: PNG 格式，支持 Alpha 通道
- 碰撞检测: 包含关键点数据 + PNG 透明度支持像素级碰撞

### 兼容性
- 游戏引擎: Godot 4.x (推荐)
- 其他引擎: Unity, GameMaker, Phaser 等
- 文件格式: PNG (精灵图), JSON (元数据)

---

## 5. 使用建议

### 角色集成
1. 将精灵图导入游戏引擎
2. 根据 metadata.json 设置碰撞框
3. 创建动画状态机，分配 8 个方向
4. 实现方向切换逻辑

### 瓦片集成
1. 导入瓦片集到引擎的 TileMap 系统
2. 配置 Wang 瓦片规则（如果引擎支持）
3. 使用瓦片绘制地图
4. 设置碰撞层和掩码

### 性能优化
- 使用精灵图集（Sprite Atlas）减少绘制调用
- 启用纹理压缩
- 合理设置碰撞检测范围

---

## 6. 扩展计划

### 未来资源
- 更多敌人类型（骷髅、哥布林等）
- 更多地形瓦片（水域、岩石、道路等）
- NPC 角色（商人、村民等）
- 装备和道具图标
- UI 元素

### 动画扩展
- 攻击动画
- 受伤动画
- 死亡动画
- 技能特效

---

## 7. 版权信息

所有资源由 PixelLab AI 生成，用于个人/商业项目开发。

**生成服务**: [PixelLab](https://pixellab.ai)
**MCP 服务器**: pixellab MCP server

---

## 8. 相关链接

- [PixelLab 官网](https://pixellab.ai)
- [Godot Wang Tileset 文档](pixellab://docs/godot/wang-tilesets)
- [项目仓库](待添加)

---

*最后更新: 2025-10-21*
