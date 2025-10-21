// 范围技能特效处理器
import Phaser from 'phaser';
import type { Skill } from '@/types/skills';

export class AreaEffect {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 创建基础范围效果
   */
  create(target: { x: number; y: number }, skill: Skill, color: number): void {
    const radius = skill.radius || 50;

    const circle = this.scene.add.circle(target.x, target.y, radius, color, 0.3);
    circle.setDepth(10);

    this.scene.tweens.add({
      targets: circle,
      scale: { from: 0.5, to: 1.2 },
      alpha: { from: 0.6, to: 0 },
      duration: 400,
      onComplete: () => circle.destroy(),
    });

    this.scene.events.emit('skill-area-damage', {
      x: target.x,
      y: target.y,
      radius,
      damage: skill.damage,
    });
  }

  /**
   * 火墙术
   */
  createFireWall(target: { x: number; y: number }, skill: Skill): void {
    const duration = skill.duration || 5000;
    const color = 0xff4400;

    const wall = this.scene.add.ellipse(
      target.x,
      target.y,
      100, 40,
      color, 0.3
    );
    wall.setDepth(10);

    // 火焰效果
    const flames: Phaser.GameObjects.GameObject[] = [];
    const createFlame = () => {
      if (!wall.active) return;

      const x = target.x + Phaser.Math.Between(-50, 50);
      const y = target.y + Phaser.Math.Between(-20, 20);
      const flame = this.scene.add.circle(x, y, 8, 0xff8800, 0.8);
      flame.setDepth(11);
      flame.setBlendMode(Phaser.BlendModes.ADD);

      flames.push(flame);

      this.scene.tweens.add({
        targets: flame,
        y: y - 40,
        alpha: 0,
        scale: 1.5,
        duration: 800,
        onComplete: () => {
          flame.destroy();
          const index = flames.indexOf(flame);
          if (index > -1) flames.splice(index, 1);
        },
      });
    };

    const flameEvent = this.scene.time.addEvent({
      delay: 100,
      callback: createFlame,
      loop: true,
    });

    this.scene.time.delayedCall(duration, () => {
      flameEvent.remove();
      wall.destroy();
      flames.forEach(f => {
        if (f.active) f.destroy();
      });
    });

    this.scene.events.emit('skill-area-damage', {
      x: target.x,
      y: target.y,
      radius: 50,
      damage: skill.damage,
      duration,
    });
  }

  /**
   * 龙卷风
   */
  createTornado(target: { x: number; y: number }, skill: Skill): void {
    const duration = skill.duration || 4000;
    const radius = skill.radius || 70;
    const color = 0x88ff88;

    const tornado = this.scene.add.ellipse(
      target.x,
      target.y,
      radius * 2,
      radius * 3,
      color, 0.2
    );
    tornado.setDepth(10);

    // 旋转动画
    this.scene.tweens.add({
      targets: tornado,
      angle: 360,
      duration: 1000,
      repeat: (duration / 1000) - 1,
    });

    // 螺旋粒子效果
    const particles: Phaser.GameObjects.GameObject[] = [];
    let angle = 0;

    const createParticle = () => {
      if (!tornado.active) return;

      const distance = Phaser.Math.Between(0, radius);
      const x = target.x + Math.cos(angle) * distance;
      const y = target.y + Math.sin(angle) * distance;

      const particle = this.scene.add.circle(x, y, 4, color, 0.8);
      particle.setDepth(11);
      particle.setBlendMode(Phaser.BlendModes.ADD);

      particles.push(particle);

      this.scene.tweens.add({
        targets: particle,
        y: y - 60,
        alpha: 0,
        duration: 1000,
        onComplete: () => {
          particle.destroy();
          const index = particles.indexOf(particle);
          if (index > -1) particles.splice(index, 1);
        },
      });

      angle += 0.3;
    };

    const particleEvent = this.scene.time.addEvent({
      delay: 50,
      callback: createParticle,
      loop: true,
    });

    this.scene.time.delayedCall(duration, () => {
      particleEvent.remove();
      tornado.destroy();
      particles.forEach(p => {
        if (p.active) p.destroy();
      });
    });

    this.scene.events.emit('skill-area-damage', {
      x: target.x,
      y: target.y,
      radius,
      damage: skill.damage,
      duration,
      effect: 'knockback',
    });
  }

  /**
   * 地刺术
   */
  createEarthSpike(target: { x: number; y: number }, skill: Skill): void {
    const color = 0x996633;
    const radius = skill.radius || 40;

    // 地面裂纹
    const crack = this.scene.add.ellipse(
      target.x,
      target.y,
      radius * 2,
      20,
      0x000000, 0.3
    );
    crack.setDepth(9);

    // 地刺升起
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const distance = radius * 0.6;
      const x = target.x + Math.cos(angle) * distance;
      const y = target.y + Math.sin(angle) * distance;

      const spike = this.scene.add.triangle(
        x, y,
        0, 20,
        -5, 0,
        5, 0,
        color
      );
      spike.setDepth(10);
      spike.setScale(0, 0);

      this.scene.tweens.add({
        targets: spike,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        delay: i * 50,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.scene.time.delayedCall(1000, () => {
            this.scene.tweens.add({
              targets: spike,
              scaleY: 0,
              duration: 200,
              onComplete: () => spike.destroy(),
            });
          });
        },
      });
    }

    this.scene.time.delayedCall(1500, () => crack.destroy());

    this.scene.events.emit('skill-area-damage', {
      x: target.x,
      y: target.y,
      radius,
      damage: skill.damage,
    });
  }

  /**
   * 爆炸效果（通用）
   */
  createExplosion(target: { x: number; y: number }, skill: Skill, color: number): void {
    const radius = skill.radius || 100;

    // 冲击波
    const shockwave = this.scene.add.circle(target.x, target.y, 20, color, 0.6);
    shockwave.setDepth(900);
    shockwave.setBlendMode(Phaser.BlendModes.ADD);

    // 相机震动
    this.scene.cameras.main.shake(400, 0.008);

    this.scene.tweens.add({
      targets: shockwave,
      scale: { from: 0.5, to: radius / 20 },
      alpha: { from: 0.8, to: 0 },
      duration: 600,
      ease: 'Power2',
      onComplete: () => shockwave.destroy(),
    });

    // 爆炸碎片
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const fragment = this.scene.add.circle(
        target.x,
        target.y,
        Phaser.Math.Between(3, 6),
        color, 0.8
      );
      fragment.setDepth(901);
      fragment.setBlendMode(Phaser.BlendModes.ADD);

      this.scene.tweens.add({
        targets: fragment,
        x: target.x + Math.cos(angle) * Phaser.Math.Between(50, radius),
        y: target.y + Math.sin(angle) * Phaser.Math.Between(50, radius),
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(400, 800),
        onComplete: () => fragment.destroy(),
      });
    }

    this.scene.events.emit('skill-area-damage', {
      x: target.x,
      y: target.y,
      radius,
      damage: skill.damage,
    });
  }
}
