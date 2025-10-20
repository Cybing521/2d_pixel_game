// 玩家实体
import Phaser from 'phaser';
import { PLAYER_CONFIG } from '@constants/gameConfig';
import { DEFAULT_KEYBINDINGS } from '@constants/keybindings';
import { useGameStore } from '@store/gameStore';

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
    attack: Phaser.Input.Keyboard.Key;
  };
  
  // 攻击相关
  private attackRange: number = 40;
  private attackDamage: number = 15;
  private lastAttackTime: number = 0;
  private attackCooldown: number = 500; // 0.5秒攻击间隔

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
      attack: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };
  }

  update(time: number, delta: number) {
    this.handleMovement();
    this.handleAttack(time);
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
    
    // 同步血量到store（关键！）
    useGameStore.getState().updatePlayerStats({ health: this.health });
    
    // 显示伤害数字
    this.showDamageNumber(amount);
    
    // 受伤闪烁效果（更明显）
    this.setTint(0xff0000);
    this.scene.time.delayedCall(200, () => {
      this.clearTint();
    });
    
    // 震动效果
    this.scene.cameras.main.shake(100, 0.002);

    console.log(`玩家受到 ${amount} 点伤害，剩余血量：${this.health}/${this.maxHealth}`);

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

  private handleAttack(time: number) {
    // 检查攻击键
    if (this.keys.attack.isDown && time - this.lastAttackTime > this.attackCooldown) {
      this.attack();
      this.lastAttackTime = time;
    }
  }
  
  attack() {
    // 攻击动画（简单的缩放效果）
    this.scene.tweens.add({
      targets: this,
      scaleX: 2.5,
      scaleY: 2.5,
      duration: 100,
      yoyo: true,
    });
    
    // 攻击特效（白色闪光圈）
    const attackCircle = this.scene.add.circle(this.x, this.y, this.attackRange, 0xffffff, 0.3);
    this.scene.tweens.add({
      targets: attackCircle,
      alpha: 0,
      scale: 1.5,
      duration: 200,
      onComplete: () => {
        attackCircle.destroy();
      },
    });
    
    // 发射攻击事件
    this.scene.events.emit('player-attack', {
      x: this.x,
      y: this.y,
      range: this.attackRange,
      damage: this.attackDamage,
    });
    
    console.log('玩家攻击！范围：' + this.attackRange);
  }

  private showDamageNumber(damage: number) {
    const text = this.scene.add.text(this.x, this.y - 30, `-${damage}`, {
      fontSize: '20px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    text.setOrigin(0.5);
    
    // 飘字动画
    this.scene.tweens.add({
      targets: text,
      y: text.y - 40,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        text.destroy();
      },
    });
  }

  private onDeath() {
    console.log('Player died');
    
    // 玩家死亡效果
    this.setTint(0x000000);
    this.setVelocity(0, 0);  // 停止移动
    
    // 禁用输入
    this.disableBody(true, false);
    
    // 死亡动画
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      angle: 90,
      duration: 500,
    });
    
    // 发射死亡事件
    this.scene.events.emit('player-died');
  }
  
  // 复活时调用
  respawn() {
    this.enableBody(true, this.x, this.y, true, true);
    this.setAlpha(1);
    this.setAngle(0);
    this.clearTint();
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
