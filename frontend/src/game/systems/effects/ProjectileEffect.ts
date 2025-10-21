// 弹道技能特效处理器
import Phaser from 'phaser';
import type { Skill } from '@/types/skills';

export class ProjectileEffect {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 创建基础弹道
   */
  create(
    caster: any,
    target: { x: number; y: number },
    skill: Skill,
    color: number
  ): Phaser.GameObjects.GameObject {
    const projectile = this.scene.add.circle(caster.x, caster.y, 10, color);
    projectile.setDepth(900);
    projectile.setAlpha(0.9);
    projectile.setBlendMode(Phaser.BlendModes.ADD);

    this.scene.physics.add.existing(projectile);

    const angle = Phaser.Math.Angle.Between(
      caster.x,
      caster.y,
      target.x,
      target.y
    );
    const speed = 500;

    (projectile.body as Phaser.Physics.Arcade.Body).setVelocity(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    );

    // 添加拖尾效果
    this.addTrail(projectile, color);

    // 自动销毁
    this.scene.time.delayedCall(3000, () => {
      if (projectile.active) {
        projectile.destroy();
      }
    });

    return projectile;
  }

  /**
   * 创建火球效果
   */
  createFireball(
    caster: any,
    target: { x: number; y: number },
    skill: Skill
  ): void {
    const color = 0xff4400;
    const fireball = this.create(caster, target, skill, color);

    // 火焰特殊效果
    const fireGlow = this.scene.add.circle(caster.x, caster.y, 15, 0xff8800, 0.5);
    fireGlow.setDepth(899);
    fireGlow.setBlendMode(Phaser.BlendModes.ADD);

    this.scene.tweens.add({
      targets: fireGlow,
      x: (fireball as any).x,
      y: (fireball as any).y,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 500,
      onComplete: () => fireGlow.destroy(),
    });

    this.scene.events.emit('skill-projectile-created', {
      projectile: fireball,
      skill,
      caster,
    });
  }

  /**
   * 创建冰箭效果
   */
  createIceArrow(
    caster: any,
    target: { x: number; y: number },
    skill: Skill
  ): void {
    const color = 0x00aaff;
    const arrow = this.scene.add.triangle(
      caster.x,
      caster.y,
      0, 0,
      10, 5,
      0, 10,
      color
    );
    arrow.setDepth(900);
    this.scene.physics.add.existing(arrow);

    const angle = Phaser.Math.Angle.Between(
      caster.x,
      caster.y,
      target.x,
      target.y
    );
    arrow.setRotation(angle + Math.PI / 2);

    const speed = 700;
    (arrow.body as Phaser.Physics.Arcade.Body).setVelocity(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    );

    this.scene.time.delayedCall(2000, () => {
      if (arrow.active) {
        arrow.destroy();
      }
    });

    this.scene.events.emit('skill-projectile-created', {
      projectile: arrow,
      skill,
      caster,
    });
  }

  /**
   * 创建疾风刃（连续3次）
   */
  createWindBlade(
    caster: any,
    target: { x: number; y: number },
    skill: Skill
  ): void {
    const color = 0x88ff88;

    for (let i = 0; i < 3; i++) {
      this.scene.time.delayedCall(i * 100, () => {
        const blade = this.create(caster, target, skill, color);
        this.scene.events.emit('skill-projectile-created', {
          projectile: blade,
          skill,
          caster,
        });
      });
    }
  }

  /**
   * 添加拖尾效果
   */
  private addTrail(projectile: Phaser.GameObjects.GameObject, color: number): void {
    // 简化版本，不使用粒子系统
    const trail: Phaser.GameObjects.GameObject[] = [];
    const trailLength = 5;

    const updateTrail = () => {
      if (!projectile.active) return;

      const pos = projectile as any;
      const dot = this.scene.add.circle(pos.x, pos.y, 4, color, 0.6);
      dot.setDepth(898);
      dot.setBlendMode(Phaser.BlendModes.ADD);

      trail.push(dot);

      this.scene.tweens.add({
        targets: dot,
        alpha: 0,
        scale: 0.5,
        duration: 300,
        onComplete: () => {
          dot.destroy();
          const index = trail.indexOf(dot);
          if (index > -1) trail.splice(index, 1);
        },
      });

      if (trail.length > trailLength) {
        const old = trail.shift();
        if (old && old.active) old.destroy();
      }
    };

    const interval = this.scene.time.addEvent({
      delay: 50,
      callback: updateTrail,
      loop: true,
    });

    this.scene.time.delayedCall(3000, () => {
      interval.remove();
      trail.forEach(dot => {
        if (dot.active) dot.destroy();
      });
    });
  }
}
