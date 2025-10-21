// 敌人实体
import Phaser from 'phaser';
import type { EnemyData } from '@/types/entities';
import type { Player } from './Player';
import { DirectionHelper, type Direction8 } from '../utils/DirectionHelper';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private enemyData: EnemyData;
  private health: number;
  private maxHealth: number;
  private isDead: boolean = false;
  
  // 方向控制（8方向）
  private currentDirection: Direction8 = 'south';
  private spritePrefix: string;
  
  // AI 相关
  private aiType: 'patrol' | 'aggressive' | 'defensive';
  private patrolPoints: Phaser.Math.Vector2[] = [];
  private currentPatrolIndex: number = 0;
  private detectionRange: number = 150; // 检测范围
  private attackRange: number = 30; // 攻击范围（匹配更小的碰撞体）
  
  // 攻击冷却
  private lastAttackTime: number = 0;
  private attackCooldown: number = 1000; // 1秒攻击间隔

  constructor(scene: Phaser.Scene, x: number, y: number, enemyData: EnemyData) {
    // 根据敌人ID确定精灵前缀
    let spritePrefix: string;
    let initialTexture: string;
    
    switch (enemyData.id) {
      case 'slime':
        spritePrefix = 'slime';
        initialTexture = 'slime-south';
        break;
      case 'skeleton':
        spritePrefix = 'skeleton';
        initialTexture = 'skeleton-south';
        break;
      case 'goblin':
        spritePrefix = 'goblin';
        initialTexture = 'goblin-south';
        break;
      default:
        spritePrefix = 'slime';
        initialTexture = 'slime-south';
    }
    
    super(scene, x, y, initialTexture);
    
    this.enemyData = enemyData;
    this.health = enemyData.health;
    this.maxHealth = enemyData.health;
    this.aiType = enemyData.aiType;
    this.spritePrefix = spritePrefix;
    
    // 添加到场景
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setCollideWorldBounds(true);
    this.setScale(1); // 缩小到1倍，让敌人显示大小和碰撞框匹配
    
    // 设置碰撞体（史莱姆实际可见部分很小）
    // 注意：setSize的值不受scale影响
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(20, 20); // 碰撞框大小（与玩家一致）
    body.setOffset(6, 12); // 偏移量，使碰撞框对齐精灵底部中心
    
    // 设置较小的质量，使敌人更容易被推开
    body.setMass(3);
    body.setImmovable(false);
    
    // 设置巡逻路径
    if (this.aiType === 'patrol') {
      this.setupPatrolPath(x, y);
    }
    
    console.log(`✅ ${enemyData.name} 已创建（${enemyData.id === 'slime' ? '使用真实精灵图' : '使用临时占位符'}）`);
  }

  private setupPatrolPath(startX: number, startY: number) {
    // 创建简单的巡逻路径（矩形）
    const range = 100;
    this.patrolPoints = [
      new Phaser.Math.Vector2(startX, startY),
      new Phaser.Math.Vector2(startX + range, startY),
      new Phaser.Math.Vector2(startX + range, startY + range),
      new Phaser.Math.Vector2(startX, startY + range),
    ];
  }

  update(time: number, _delta: number, player: Player) {
    if (this.isDead) return;
    
    // 根据AI类型执行不同行为
    switch (this.aiType) {
      case 'patrol':
        this.doPatrol(player);
        break;
      case 'aggressive':
        this.doAggressive(player);
        break;
      case 'defensive':
        this.doDefensive(player);
        break;
    }
    
    // 尝试攻击玩家
    this.tryAttack(time, player);
  }

  private doPatrol(player: Player) {
    // 检测玩家
    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.x, this.y,
      player.x, player.y
    );
    
    // 如果玩家在检测范围内，追击
    if (distanceToPlayer < this.detectionRange) {
      this.chasePlayer(player);
    } else {
      // 继续巡逻
      this.patrol();
    }
  }

  private doAggressive(player: Player) {
    // 主动追击玩家
    this.chasePlayer(player);
  }

  private doDefensive(player: Player) {
    // 只有玩家靠近时才反击
    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.x, this.y,
      player.x, player.y
    );
    
    if (distanceToPlayer < this.detectionRange * 0.5) {
      this.chasePlayer(player);
    } else {
      // 保持原地或缓慢巡逻
      this.setVelocity(0, 0);
    }
  }

  private patrol() {
    if (this.patrolPoints.length === 0) return;
    
    const target = this.patrolPoints[this.currentPatrolIndex];
    const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
    
    if (distance < 10) {
      // 到达巡逻点，切换到下一个
      this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
      return;
    }
    
    // 移动到巡逻点
    this.scene.physics.moveTo(this, target.x, target.y, this.enemyData.speed);
    
    // 更新方向（基于目标位置）
    this.updateDirectionToTarget(target.x, target.y);
  }

  private chasePlayer(player: Player) {
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      player.x, player.y
    );
    
    // 如果在攻击范围内，停止移动
    if (distance < this.attackRange) {
      this.setVelocity(0, 0);
      return;
    }
    
    // 追击玩家
    this.scene.physics.moveTo(this, player.x, player.y, this.enemyData.speed);
    
    // 更新方向（基于玩家位置）
    this.updateDirectionToTarget(player.x, player.y);
  }

  /**
   * 根据目标位置更新敌人朝向（仅对史莱姆等有8方向精灵图的敌人有效）
   */
  private updateDirectionToTarget(targetX: number, targetY: number) {
    // 只有史莱姆才有8方向精灵图
    if (this.spritePrefix !== 'slime') return;
    
    // 计算速度向量
    const velocityX = targetX - this.x;
    const velocityY = targetY - this.y;
    
    const newDirection = DirectionHelper.getDirectionFromVelocity(velocityX, velocityY);
    
    if (newDirection && newDirection !== this.currentDirection) {
      this.currentDirection = newDirection;
      const textureKey = DirectionHelper.getTextureKey(this.spritePrefix, newDirection);
      this.setTexture(textureKey);
    }
  }

  private tryAttack(time: number, player: Player) {
    // 检查攻击冷却
    if (time - this.lastAttackTime < this.attackCooldown) {
      return;
    }
    
    // 检查距离
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      player.x, player.y
    );
    
    if (distance < this.attackRange) {
      this.attack(player);
      this.lastAttackTime = time;
    }
  }

  private attack(player: Player) {
    // 计算伤害（攻击力 - 玩家防御力）
    const damage = Math.max(1, this.enemyData.attack);
    player.takeDamage(damage);
    
    console.log(`${this.enemyData.name} 攻击玩家，造成 ${damage} 点伤害`);
    
    // 攻击动画（简单的缩放效果）
    this.scene.tweens.add({
      targets: this,
      scaleX: 2.3,
      scaleY: 2.3,
      duration: 100,
      yoyo: true,
    });
  }

  takeDamage(amount: number) {
    if (this.isDead) return;
    
    this.health = Math.max(0, this.health - amount);
    
    // 受伤效果（更明显的闪白）
    this.setTint(0xffffff);
    
    // 受伤震动
    this.scene.tweens.add({
      targets: this,
      x: this.x + 5,
      duration: 50,
      yoyo: true,
      repeat: 2,
    });
    
    this.scene.time.delayedCall(150, () => {
      if (!this.isDead) {
        this.clearTint();
      }
    });
    
    // 显示伤害数字
    this.showDamageNumber(amount);
    
    console.log(`${this.enemyData.name} 受到 ${amount} 点伤害，剩余血量：${this.health}/${this.maxHealth}`);
    
    // 检查死亡
    if (this.health <= 0) {
      this.onDeath();
    }
  }

  private showDamageNumber(damage: number) {
    const text = this.scene.add.text(this.x, this.y - 20, `-${damage}`, {
      fontSize: '24px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#ff0000',
      strokeThickness: 4,
    });
    text.setOrigin(0.5);
    text.setDepth(1000); // 确保在最上层
    
    // 飘字动画（更明显）
    this.scene.tweens.add({
      targets: text,
      y: text.y - 50,
      alpha: 0,
      scale: 1.5,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        text.destroy();
      },
    });
  }

  private onDeath() {
    this.isDead = true;
    
    console.log(`${this.enemyData.name} 被击败，获得 ${this.enemyData.expReward} 经验`);
    
    // 死亡动画
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.1,
      scaleY: 0.1,
      duration: 300,
      onComplete: () => {
        this.dropLoot();
        this.destroy();
      },
    });
    
    // 发射死亡事件
    this.scene.events.emit('enemy-killed', {
      enemyId: this.enemyData.id,
      expReward: this.enemyData.expReward,
      dropTable: this.enemyData.dropTable,
    });
  }

  private dropLoot() {
    // TODO: 实现掉落物品逻辑
    console.log('掉落物品：', this.enemyData.dropTable);
  }

  // Getters
  getHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  getEnemyData(): EnemyData {
    return this.enemyData;
  }

  isDying(): boolean {
    return this.isDead;
  }
}
