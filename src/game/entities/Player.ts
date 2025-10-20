// 玩家实体
import Phaser from 'phaser';
import { PLAYER_CONFIG } from '@constants/gameConfig';
import { DEFAULT_KEYBINDINGS } from '@constants/keybindings';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private speed: number = PLAYER_CONFIG.SPEED;
  private health: number = PLAYER_CONFIG.STARTING_HEALTH;
  private maxHealth: number = PLAYER_CONFIG.STARTING_HEALTH;
  private mana: number = PLAYER_CONFIG.STARTING_MANA;
  private maxMana: number = PLAYER_CONFIG.STARTING_MANA;
  private level: number = PLAYER_CONFIG.STARTING_LEVEL;
  private exp: number = 0;

  // 输入控制
  private keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // 使用简单的图形作为占位符
    super(scene, x, y, 'placeholder');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setScale(2);
    
    // 绘制玩家占位符
    this.drawPlaceholder();
    
    this.setupInput();
  }

  private drawPlaceholder() {
    // 创建一个简单的方块作为玩家占位符
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x00ff00);
    graphics.fillRect(-8, -8, 16, 16);
    graphics.generateTexture('player-placeholder', 16, 16);
    graphics.destroy();
    
    this.setTexture('player-placeholder');
  }

  private setupInput() {
    // 设置WASD键位
    this.keys = {
      up: this.scene.input.keyboard!.addKey(DEFAULT_KEYBINDINGS.MOVE_UP),
      down: this.scene.input.keyboard!.addKey(DEFAULT_KEYBINDINGS.MOVE_DOWN),
      left: this.scene.input.keyboard!.addKey(DEFAULT_KEYBINDINGS.MOVE_LEFT),
      right: this.scene.input.keyboard!.addKey(DEFAULT_KEYBINDINGS.MOVE_RIGHT),
    };
  }

  update(time: number, delta: number) {
    this.handleMovement();
  }

  private handleMovement() {
    let velocityX = 0;
    let velocityY = 0;

    // 处理输入
    if (this.keys.left.isDown) {
      velocityX = -this.speed;
    } else if (this.keys.right.isDown) {
      velocityX = this.speed;
    }

    if (this.keys.up.isDown) {
      velocityY = -this.speed;
    } else if (this.keys.down.isDown) {
      velocityY = this.speed;
    }

    // 标准化对角线速度
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707;
      velocityY *= 0.707;
    }

    this.setVelocity(velocityX, velocityY);
  }

  takeDamage(amount: number) {
    this.health = Math.max(0, this.health - amount);
    
    // 受伤闪烁效果
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });

    if (this.health <= 0) {
      this.onDeath();
    }
  }

  heal(amount: number) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  consumeMana(amount: number): boolean {
    if (this.mana >= amount) {
      this.mana -= amount;
      return true;
    }
    return false;
  }

  restoreMana(amount: number) {
    this.mana = Math.min(this.maxMana, this.mana + amount);
  }

  gainExp(amount: number) {
    this.exp += amount;
    // TODO: 检查升级
  }

  private onDeath() {
    // TODO: 处理玩家死亡
    console.log('Player died');
  }

  // Getters
  getHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  getMana(): number {
    return this.mana;
  }

  getMaxMana(): number {
    return this.maxMana;
  }

  getLevel(): number {
    return this.level;
  }

  getExp(): number {
    return this.exp;
  }
}
