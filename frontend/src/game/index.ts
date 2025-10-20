// Phaser游戏主类
import Phaser from 'phaser';
import { gameConfig } from './config';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';

export class Game {
  private game: Phaser.Game | null = null;

  constructor(parent: string) {
    const config = {
      ...gameConfig,
      parent,
      scene: [BootScene, GameScene],
    };

    this.game = new Phaser.Game(config);
  }

  destroy() {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }

  getGame(): Phaser.Game | null {
    return this.game;
  }

  /**
   * 启动游戏场景
   */
  startGameScene() {
    if (this.game) {
      const gameScene = this.game.scene.getScene('GameScene');
      if (gameScene) {
        this.game.scene.start('GameScene');
      }
    }
  }
}
