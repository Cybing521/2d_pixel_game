// 迷雾系统
import Phaser from 'phaser';
import { FOG_CONFIG } from '@constants/gameConfig';
import { Player } from '../entities/Player';

export class FogSystem {
  private scene: Phaser.Scene;
  private player: Player;
  private fogLayer!: Phaser.GameObjects.RenderTexture;
  private exploredMap: Set<string> = new Set();
  private fogDensity = FOG_CONFIG.INITIAL_DENSITY;
  private clearRadius = FOG_CONFIG.CLEAR_RADIUS;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
    this.createFogLayer();
  }

  private createFogLayer() {
    // 创建渲染纹理作为迷雾遮罩
    this.fogLayer = this.scene.add.renderTexture(0, 0, 2000, 2000);
    
    // 初始化为完全迷雾
    this.fogLayer.fill(0x000000, this.fogDensity);
    this.fogLayer.setDepth(1000); // 置于顶层
    this.fogLayer.setBlendMode(Phaser.BlendModes.MULTIPLY);
  }

  update(time: number, delta: number) {
    // 清除玩家周围的迷雾
    const playerX = this.player.x;
    const playerY = this.player.y;
    
    this.clearFog(playerX, playerY, this.clearRadius);
    
    // TODO: 实现迷雾再生
    // TODO: 实现迷雾潮汐事件
  }

  /**
   * 清除指定位置的迷雾
   */
  clearFog(x: number, y: number, radius: number) {
    // 使用圆形遮罩清除迷雾
    const graphics = this.scene.make.graphics({});
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(0, 0, radius);
    
    // 在渲染纹理上擦除
    this.fogLayer.erase(graphics, x, y);
    graphics.destroy();
    
    // 记录已探索区域
    const gridX = Math.floor(x / FOG_CONFIG.GRID_SIZE);
    const gridY = Math.floor(y / FOG_CONFIG.GRID_SIZE);
    this.exploredMap.add(`${gridX},${gridY}`);
  }

  /**
   * 迷雾再生（高级功能）
   */
  regenerateFog(x: number, y: number, radius: number) {
    const graphics = this.scene.make.graphics({});
    graphics.fillStyle(0x000000, this.fogDensity * 0.5);
    graphics.fillCircle(0, 0, radius);
    
    this.fogLayer.draw(graphics, x, y);
    graphics.destroy();
  }

  /**
   * 检查位置是否已探索
   */
  isExplored(x: number, y: number): boolean {
    const gridX = Math.floor(x / FOG_CONFIG.GRID_SIZE);
    const gridY = Math.floor(y / FOG_CONFIG.GRID_SIZE);
    return this.exploredMap.has(`${gridX},${gridY}`);
  }

  /**
   * 获取探索进度百分比
   */
  getExplorationProgress(): number {
    const totalCells = (2000 / FOG_CONFIG.GRID_SIZE) ** 2;
    return (this.exploredMap.size / totalCells) * 100;
  }
}
