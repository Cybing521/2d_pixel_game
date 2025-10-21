// 玩家实体
import Phaser from 'phaser';
import { PLAYER_CONFIG } from '@constants/gameConfig';
import { DEFAULT_KEYBINDINGS } from '@constants/keybindings';
import { useGameStore } from '@store/gameStore';
import { DirectionHelper, type Direction8 } from '../utils/DirectionHelper';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private speed: number = PLAYER_CONFIG.SPEED;
  private health: number = PLAYER_CONFIG.STARTING_HEALTH;
  private maxHealth: number = PLAYER_CONFIG.STARTING_HEALTH;
  private mana: number = PLAYER_CONFIG.STARTING_MANA;
  private maxMana: number = PLAYER_CONFIG.STARTING_MANA;
  private level: number = PLAYER_CONFIG.STARTING_LEVEL;
  private exp: number = 0;

  // 方向控制（8方向）
  private currentDirection: Direction8 = 'south'; // 默认朝向南方（下方）
  private spritePrefix: string = 'chibi-hero'; // 使用chibi风格英雄

  // 输入控制
  private keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    attack: Phaser.Input.Keyboard.Key;
  };
  
  // 攻击相关
  private attackRange: number = 35; // 攻击范围（匹配更小的碰撞体）
  private attackDamage: number = 15;
  private lastAttackTime: number = 0;
  private attackCooldown: number = 500; // 0.5秒攻击间隔

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // 使用Chibi英雄角色的南向精灵图作为默认
    super(scene, x, y, 'chibi-hero-south');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setScale(2); // 放大2倍以便看清
    
    // 设置碰撞体（精灵图32x32，缩放2倍后64x64，但实际可见部分很小）
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(12, 14); // 更小的碰撞体，匹配实际可见的角色大小
    body.setOffset(10, 18); // 调整偏移，对齐角色脚部位置
    
    // 设置质量，防止被敌人推开
    body.setMass(10);
    body.setImmovable(false); // 允许移动但有惯性
    
    this.setupInput();
    
    console.log('✅ 玩家角色已创建（使用真实精灵图）');
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

  update(time: number, _delta: number) {
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
    
    // 根据速度更新方向和精灵图
    this.updateDirection(velocityX, velocityY);
  }

  /**
   * 根据速度向量更新角色朝向和精灵图
   */
  private updateDirection(velocityX: number, velocityY: number) {
    const newDirection = DirectionHelper.getDirectionFromVelocity(velocityX, velocityY);
    
    // 只有在移动且方向改变时才更新纹理
    if (newDirection && newDirection !== this.currentDirection) {
      this.currentDirection = newDirection;
      const textureKey = DirectionHelper.getTextureKey(this.spritePrefix, newDirection);
      this.setTexture(textureKey);
    }
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

  /**
   * 显示升级效果 - 头顶像素风格文字
   */
  showLevelUp(newLevel: number) {
    // 创建像素风格的LEVEL UP文字
    const levelUpText = this.scene.add.text(
      this.x, 
      this.y - 60, 
      '★ LEVEL UP ★',
      {
        fontSize: '24px',
        color: '#FFD700',
        fontStyle: 'bold',
        fontFamily: 'monospace',
        stroke: '#000000',
        strokeThickness: 4,
      }
    );
    levelUpText.setOrigin(0.5);
    levelUpText.setDepth(1000);
    
    // 创建等级文字
    const levelText = this.scene.add.text(
      this.x,
      this.y - 35,
      `Lv.${newLevel - 1} → Lv.${newLevel}`,
      {
        fontSize: '16px',
        color: '#FFFFFF',
        fontStyle: 'bold',
        fontFamily: 'monospace',
        stroke: '#000000',
        strokeThickness: 3,
      }
    );
    levelText.setOrigin(0.5);
    levelText.setDepth(1000);
    
    // 动画效果
    this.scene.tweens.add({
      targets: [levelUpText, levelText],
      y: '-=40',
      alpha: { from: 1, to: 0 },
      scale: { from: 1, to: 1.5 },
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        levelUpText.destroy();
        levelText.destroy();
      },
    });
    
    // 升级光效
    const particles = this.scene.add.particles(this.x, this.y, 'coin', {
      speed: { min: 50, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      lifespan: 800,
      quantity: 20,
      blendMode: 'ADD',
    });
    
    this.scene.time.delayedCall(800, () => {
      particles.destroy();
    });
    
    console.log(`🎉 玩家升级！等级：${newLevel}`);
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
