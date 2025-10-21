// 技能释放系统 - 基础版本
import Phaser from 'phaser';

export interface Skill {
  id: string;
  name: string;
  manaCost: number;
  cooldown: number;
  damage?: number;
  radius?: number;
  effectType?: 'projectile' | 'area' | 'self';
}

export class SkillSystem {
  private scene: Phaser.Scene;
  private skillCooldowns: Map<string, number> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 检查技能是否可以释放
   */
  canCastSkill(skill: Skill, currentMana: number): boolean {
    // 检查魔力
    if (currentMana < skill.manaCost) {
      return false;
    }

    // 检查冷却
    const lastCast = this.skillCooldowns.get(skill.id) || 0;
    const now = this.scene.time.now;
    if (now - lastCast < skill.cooldown) {
      return false;
    }

    return true;
  }

  /**
   * 释放技能
   */
  castSkill(
    skill: Skill,
    caster: Phaser.GameObjects.GameObject,
    target: { x: number; y: number }
  ): boolean {
    // 记录冷却时间
    this.skillCooldowns.set(skill.id, this.scene.time.now);

    // 根据技能类型创建效果
    switch (skill.effectType) {
      case 'projectile':
        this.createProjectile(caster, target, skill);
        break;
      case 'area':
        this.createAreaEffect(target, skill);
        break;
      case 'self':
        this.createSelfEffect(caster, skill);
        break;
    }

    return true;
  }

  /**
   * 创建弹道技能
   */
  private createProjectile(
    caster: any,
    target: { x: number; y: number },
    skill: Skill
  ): void {
    // 创建一个简单的弹道
    const projectile = this.scene.add.circle(caster.x, caster.y, 8, 0xff4444);
    this.scene.physics.add.existing(projectile);

    // 计算方向
    const angle = Phaser.Math.Angle.Between(caster.x, caster.y, target.x, target.y);
    const speed = 400;

    (projectile.body as Phaser.Physics.Arcade.Body).setVelocity(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    );

    // 自动销毁
    this.scene.time.delayedCall(3000, () => {
      projectile.destroy();
    });

    // 发射技能命中事件
    this.scene.events.emit('skill-projectile-created', {
      projectile,
      skill,
      caster,
    });
  }

  /**
   * 创建范围技能
   */
  private createAreaEffect(target: { x: number; y: number }, skill: Skill): void {
    const radius = skill.radius || 50;

    // 创建范围指示圈
    const circle = this.scene.add.circle(target.x, target.y, radius, 0xff0000, 0.3);
    
    // 爆炸动画
    this.scene.tweens.add({
      targets: circle,
      scale: { from: 0.5, to: 1.2 },
      alpha: { from: 0.6, to: 0 },
      duration: 400,
      onComplete: () => {
        circle.destroy();
      },
    });

    // 发射范围伤害事件
    this.scene.events.emit('skill-area-damage', {
      x: target.x,
      y: target.y,
      radius,
      damage: skill.damage,
    });
  }

  /**
   * 创建自身增益技能
   */
  private createSelfEffect(caster: any, skill: Skill): void {
    // 创建光环效果
    const aura = this.scene.add.circle(caster.x, caster.y, 30, 0x00ff00, 0.3);

    this.scene.tweens.add({
      targets: aura,
      scale: { from: 0.8, to: 1.5 },
      alpha: { from: 0.6, to: 0 },
      duration: 500,
      onComplete: () => {
        aura.destroy();
      },
    });

    // 发射自身增益事件
    this.scene.events.emit('skill-self-buff', {
      caster,
      skill,
    });
  }

  /**
   * 获取技能剩余冷却时间
   */
  getRemainingCooldown(skill: Skill): number {
    const lastCast = this.skillCooldowns.get(skill.id) || 0;
    const remaining = skill.cooldown - (this.scene.time.now - lastCast);
    return Math.max(0, remaining);
  }
}
