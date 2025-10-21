// 地图分块管理器 - 支持大地图的分块加载
import Phaser from 'phaser';

export interface ChunkData {
  x: number;
  y: number;
  key: string;
  loaded: boolean;
  tiles: Phaser.GameObjects.GameObject[];
  enemies: Phaser.GameObjects.GameObject[];
}

export class ChunkManager {
  private scene: Phaser.Scene;
  private chunkSize: number;
  private chunks: Map<string, ChunkData>;
  private loadDistance: number; // 加载距离（块数）
  private unloadDistance: number; // 卸载距离（块数）

  constructor(scene: Phaser.Scene, chunkSize: number = 1024) {
    this.scene = scene;
    this.chunkSize = chunkSize; // 每个块的大小（像素）
    this.chunks = new Map();
    this.loadDistance = 2; // 加载玩家周围2格的chunks
    this.unloadDistance = 4; // 卸载距离玩家4格以上的chunks
  }

  /**
   * 根据世界坐标获取chunk坐标
   */
  private worldToChunk(x: number, y: number): { chunkX: number; chunkY: number } {
    return {
      chunkX: Math.floor(x / this.chunkSize),
      chunkY: Math.floor(y / this.chunkSize),
    };
  }

  /**
   * 生成chunk的唯一key
   */
  private getChunkKey(chunkX: number, chunkY: number): string {
    return `${chunkX},${chunkY}`;
  }

  /**
   * 更新chunks - 根据玩家位置加载/卸载
   */
  update(playerX: number, playerY: number) {
    const { chunkX: playerChunkX, chunkY: playerChunkY } = this.worldToChunk(playerX, playerY);

    // 1. 加载玩家周围的chunks
    for (let dx = -this.loadDistance; dx <= this.loadDistance; dx++) {
      for (let dy = -this.loadDistance; dy <= this.loadDistance; dy++) {
        const chunkX = playerChunkX + dx;
        const chunkY = playerChunkY + dy;
        const key = this.getChunkKey(chunkX, chunkY);

        if (!this.chunks.has(key)) {
          this.loadChunk(chunkX, chunkY);
        }
      }
    }

    // 2. 卸载远离玩家的chunks
    this.chunks.forEach((chunk, key) => {
      const distance = Math.max(
        Math.abs(chunk.x - playerChunkX),
        Math.abs(chunk.y - playerChunkY)
      );

      if (distance > this.unloadDistance) {
        this.unloadChunk(key);
      }
    });
  }

  /**
   * 加载一个chunk
   */
  private loadChunk(chunkX: number, chunkY: number) {
    const key = this.getChunkKey(chunkX, chunkY);
    
    if (this.chunks.has(key)) return;

    const worldX = chunkX * this.chunkSize;
    const worldY = chunkY * this.chunkSize;

    const chunk: ChunkData = {
      x: chunkX,
      y: chunkY,
      key,
      loaded: true,
      tiles: [],
      enemies: [],
    };

    // 生成地块内容（草地瓦片）
    this.generateChunkTerrain(chunk, worldX, worldY);

    // 生成敌人（随机）
    this.generateChunkEnemies(chunk, worldX, worldY);

    this.chunks.set(key, chunk);
    console.log(`📦 Chunk loaded: ${key} at (${worldX}, ${worldY})`);
  }

  /**
   * 生成chunk地形（优化版，支持不同地形类型）
   */
  private generateChunkTerrain(chunk: ChunkData, worldX: number, worldY: number) {
    const tileSize = 64; // 草地瓦片大小
    const tilesPerRow = Math.ceil(this.chunkSize / tileSize);

    // 根据chunk位置确定地形类型（简单的生物群系）
    const biome = this.getBiomeType(chunk.x, chunk.y);
    
    // 使用更稀疏的瓦片生成（优化性能）
    // 只生成部分瓦片作为背景提示
    const skipStep = 2; // 每隔2格生成一个瓦片
    
    for (let i = 0; i < tilesPerRow; i += skipStep) {
      for (let j = 0; j < tilesPerRow; j += skipStep) {
        const x = worldX + i * tileSize + tileSize / 2;
        const y = worldY + j * tileSize + tileSize / 2;

        // 创建草地瓦片
        const tile = this.scene.add.image(x, y, 'ground');
        tile.setDepth(-1); // 放在最底层
        tile.setAlpha(0.6); // 略微透明
        
        // 根据生物群系调整颜色
        tile.setTint(biome.tint);
        
        chunk.tiles.push(tile);
      }
    }
  }
  
  /**
   * 根据chunk坐标确定生物群系
   */
  private getBiomeType(chunkX: number, chunkY: number): { name: string; tint: number } {
    // 简单的分区系统
    const distance = Math.sqrt(chunkX * chunkX + chunkY * chunkY);
    
    if (distance < 2) {
      return { name: 'plains', tint: 0x88ff88 }; // 平原（起始区）
    } else if (distance < 5) {
      return { name: 'forest', tint: 0x44aa44 }; // 森林
    } else if (distance < 8) {
      return { name: 'desert', tint: 0xffdd88 }; // 沙漠
    } else {
      return { name: 'mountain', tint: 0x888888 }; // 山地
    }
  }

  /**
   * 生成chunk内的敌人（优化版，根据生物群系调整）
   */
  private generateChunkEnemies(_chunk: ChunkData, worldX: number, worldY: number) {
    // 根据距离原点的距离调整敌人数量和强度
    const chunkX = Math.floor(worldX / this.chunkSize);
    const chunkY = Math.floor(worldY / this.chunkSize);
    const distance = Math.sqrt(chunkX * chunkX + chunkY * chunkY);
    
    // 根据距离调整敌人数量（越远越多）
    const baseCount = 3;
    const bonusCount = Math.floor(distance / 2);
    const enemyCount = Phaser.Math.Between(baseCount, baseCount + bonusCount + 3);

    for (let i = 0; i < enemyCount; i++) {
      const x = worldX + Phaser.Math.Between(100, this.chunkSize - 100);
      const y = worldY + Phaser.Math.Between(100, this.chunkSize - 100);

      // 触发生成敌人的事件（由GameScene处理）
      this.scene.events.emit('spawn-enemy-at', x, y);
    }
  }

  /**
   * 卸载一个chunk
   */
  private unloadChunk(key: string) {
    const chunk = this.chunks.get(key);
    if (!chunk) return;

    // 销毁所有瓦片
    chunk.tiles.forEach((tile) => tile.destroy());

    // 销毁所有敌人（通过事件通知GameScene）
    this.scene.events.emit('unload-chunk-enemies', key);

    this.chunks.delete(key);
    console.log(`🗑️  Chunk unloaded: ${key}`);
  }

  /**
   * 获取已加载的chunks数量
   */
  getLoadedChunkCount(): number {
    return this.chunks.size;
  }

  /**
   * 清理所有chunks
   */
  destroy() {
    this.chunks.forEach((chunk, key) => {
      this.unloadChunk(key);
    });
    this.chunks.clear();
  }

  /**
   * 获取chunk信息（用于调试）
   */
  getChunkInfo(): string[] {
    const info: string[] = [];
    this.chunks.forEach((chunkData, key) => {
      info.push(`Chunk ${key}: ${chunkData.tiles.length} tiles`);
    });
    return info;
  }
}
