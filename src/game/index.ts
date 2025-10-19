// Phaser游戏主类
import Phaser from 'phaser';
import { gameConfig } from './config';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';

export class Game {
  private game: Phaser.Game | null = null;

  constructor(parent: string) {
    const config = {
      ...gameConfig,
      parent,
      scene: [BootScene, MenuScene, GameScene, UIScene],
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
}
