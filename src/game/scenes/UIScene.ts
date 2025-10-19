// UI覆盖层场景
import Phaser from 'phaser';
import { SCENE_KEYS } from '@constants/gameConfig';

export class UIScene extends Phaser.Scene {
  private healthBar!: Phaser.GameObjects.Graphics;
  private manaBar!: Phaser.GameObjects.Graphics;
  private healthText!: Phaser.GameObjects.Text;
  private manaText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENE_KEYS.UI });
  }

  create() {
    // 创建HUD元素
    this.createHealthBar();
    this.createManaBar();

    // 监听游戏场景的更新事件
    const gameScene = this.scene.get(SCENE_KEYS.GAME);
    gameScene.events.on('player-update', this.updateBars, this);
  }

  private createHealthBar() {
    const x = 20;
    const y = 20;
    const width = 200;
    const height = 20;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.5);
    bg.fillRect(x - 2, y - 2, width + 4, height + 4);
    bg.setScrollFactor(0);

    // 生命条
    this.healthBar = this.add.graphics();
    this.healthBar.setScrollFactor(0);

    // 文本
    this.healthText = this.add.text(x + 5, y + 2, 'HP: 100/100', {
      font: '12px monospace',
      color: '#ffffff',
    });
    this.healthText.setScrollFactor(0);
  }

  private createManaBar() {
    const x = 20;
    const y = 50;
    const width = 200;
    const height = 20;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.5);
    bg.fillRect(x - 2, y - 2, width + 4, height + 4);
    bg.setScrollFactor(0);

    // 魔力条
    this.manaBar = this.add.graphics();
    this.manaBar.setScrollFactor(0);

    // 文本
    this.manaText = this.add.text(x + 5, y + 2, 'MP: 80/80', {
      font: '12px monospace',
      color: '#ffffff',
    });
    this.manaText.setScrollFactor(0);
  }

  private updateBars(data: { health: number; maxHealth: number; mana: number; maxMana: number }) {
    const x = 20;
    const hpY = 20;
    const mpY = 50;
    const width = 200;
    const height = 20;

    // 更新生命条
    this.healthBar.clear();
    this.healthBar.fillStyle(0xff0000);
    this.healthBar.fillRect(x, hpY, (data.health / data.maxHealth) * width, height);
    this.healthText.setText(`HP: ${Math.floor(data.health)}/${data.maxHealth}`);

    // 更新魔力条
    this.manaBar.clear();
    this.manaBar.fillStyle(0x0099ff);
    this.manaBar.fillRect(x, mpY, (data.mana / data.maxMana) * width, height);
    this.manaText.setText(`MP: ${Math.floor(data.mana)}/${data.maxMana}`);
  }
}
