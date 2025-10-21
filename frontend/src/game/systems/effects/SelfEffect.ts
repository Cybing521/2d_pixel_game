// 自身增益技能特效处理器
import Phaser from 'phaser';
import type { Skill } from '@/types/skills';

export class SelfEffect {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 创建基础增益光环
   */
  create(caster: any, skill: Skill, color: number): void {
    const aura = this.scene.add.circle(caster.x, caster.y, 30, color, 0.3);
    aura.setDepth(900);

    this.scene.tweens.add({
      targets: aura,
      scale: { from: 0.8, to: 1.5 },
      alpha: { from: 0.6, to: 0 },
      duration: 500,
      onComplete: () => aura.destroy(),
    });

    this.scene.events.emit('skill-self-buff', {
      caster,
      skill,
    });
  }

  /**
   * 治疗术
   */
  createHeal(caster: any, skill: Skill): void {
    const color = 0x00ff00;

    // 治疗光环
    const aura = this.scene.add.circle(caster.x, caster.y, 30, color, 0.4);
    aura.setDepth(900);

    // 上升的治疗粒子
    const particles: Phaser.GameObjects.GameObject[] = [];
    
    for (let i = 0; i < 10; i++) {
      this.scene.time.delayedCall(i * 100, () => {
        const angle = (i / 10) * Math.PI * 2;
        const distance = 20;
        const x = caster.x + Math.cos(angle) * distance;
        const y = caster.y + Math.sin(angle) * distance;

        const particle = this.scene.add.circle(x, y, 5, 0x00ffaa, 0.8);
        particle.setDepth(901);
        particle.setBlendMode(Phaser.BlendModes.ADD);

        particles.push(particle);

        this.scene.tweens.add({
          targets: particle,
          y: y - 60,
          alpha: 0,
          scale: 0,
          duration: 1000,
          onComplete: () => {
            particle.destroy();
            const index = particles.indexOf(particle);
            if (index > -1) particles.splice(index, 1);
          },
        });
      });
    }

    this.scene.tweens.add({
      targets: aura,
      scale: { from: 0.8, to: 2 },
      alpha: { from: 0.6, to: 0 },
      duration: 1000,
      onComplete: () => aura.destroy(),
    });

    this.scene.events.emit('skill-heal', {
      target: caster,
      amount: skill.healing || 40,
    });
  }

  /**
   * 水盾术
   */
  createShield(caster: any, skill: Skill): void {
    const color = 0x00aaff;
    const duration = skill.duration || 6000;

    // 护盾光环
    const shield = this.scene.add.circle(caster.x, caster.y, 40, color, 0.3);
    shield.setDepth(900);

    // 护盾跟随角色
    const followEvent = this.scene.time.addEvent({
      delay: 16,
      repeat: duration / 16,
      callback: () => {
        if (shield.active && caster.x !== undefined) {
          shield.setPosition(caster.x, caster.y);
        }
      },
    });

    // 闪烁效果
    this.scene.tweens.add({
      targets: shield,
      alpha: { from: 0.3, to: 0.6 },
      duration: 500,
      yoyo: true,
      repeat: (duration / 500) - 1,
      onComplete: () => {
        followEvent.remove();
        shield.destroy();
      },
    });

    this.scene.events.emit('skill-buff', {
      target: caster,
      type: 'shield',
      value: 50,
      duration,
    });
  }

  /**
   * 岩石护甲
   */
  createRockArmor(caster: any, skill: Skill): void {
    const color = 0x996633;
    const duration = skill.duration || 8000;

    // 岩石光环
    const armor = this.scene.add.circle(caster.x, caster.y, 45, color, 0.2);
    armor.setDepth(900);

    // 岩石碎片环绕
    const rocks: Phaser.GameObjects.GameObject[] = [];
    const rockCount = 6;

    for (let i = 0; i < rockCount; i++) {
      const angle = (i / rockCount) * Math.PI * 2;
      const distance = 40;
      const x = caster.x + Math.cos(angle) * distance;
      const y = caster.y + Math.sin(angle) * distance;

      const rock = this.scene.add.rectangle(x, y, 8, 8, 0x664422);
      rock.setDepth(901);
      rocks.push(rock);
    }

    // 环绕动画
    let orbitAngle = 0;
    const orbitEvent = this.scene.time.addEvent({
      delay: 30,
      repeat: duration / 30,
      callback: () => {
        if (armor.active && caster.x !== undefined) {
          armor.setPosition(caster.x, caster.y);
          
          rocks.forEach((rock, i) => {
            if (rock.active) {
              const angle = orbitAngle + (i / rockCount) * Math.PI * 2;
              (rock as any).setPosition(
                caster.x + Math.cos(angle) * 40,
                caster.y + Math.sin(angle) * 40
              );
            }
          });
          
          orbitAngle += 0.05;
        }
      },
    });

    this.scene.time.delayedCall(duration, () => {
      orbitEvent.remove();
      armor.destroy();
      rocks.forEach(rock => {
        if (rock.active) {
          this.scene.tweens.add({
            targets: rock,
            alpha: 0,
            scale: 0,
            duration: 300,
            onComplete: () => rock.destroy(),
          });
        }
      });
    });

    this.scene.events.emit('skill-buff', {
      target: caster,
      type: 'defense',
      value: 30,
      duration,
    });
  }

  /**
   * 风之庇护（闪避增益）
   */
  createWindBlessing(caster: any, skill: Skill): void {
    const color = 0x88ff88;
    const duration = skill.duration || 5000;

    // 风之光环
    const blessing = this.scene.add.circle(caster.x, caster.y, 35, color, 0.2);
    blessing.setDepth(900);

    // 风之流线
    const streams: Phaser.GameObjects.GameObject[] = [];
    
    const createStream = () => {
      if (!blessing.active) return;

      const angle = Math.random() * Math.PI * 2;
      const distance = 30;
      const x = caster.x + Math.cos(angle) * distance;
      const y = caster.y + Math.sin(angle) * distance;

      const stream = this.scene.add.circle(x, y, 3, color, 0.6);
      stream.setDepth(901);
      stream.setBlendMode(Phaser.BlendModes.ADD);

      streams.push(stream);

      this.scene.tweens.add({
        targets: stream,
        x: x + Math.cos(angle) * 20,
        y: y + Math.sin(angle) * 20,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          stream.destroy();
          const index = streams.indexOf(stream);
          if (index > -1) streams.splice(index, 1);
        },
      });
    };

    const streamEvent = this.scene.time.addEvent({
      delay: 100,
      callback: createStream,
      loop: true,
    });

    // 跟随角色
    const followEvent = this.scene.time.addEvent({
      delay: 16,
      repeat: duration / 16,
      callback: () => {
        if (blessing.active && caster.x !== undefined) {
          (blessing as any).setPosition(caster.x, caster.y);
        }
      },
    });

    this.scene.time.delayedCall(duration, () => {
      streamEvent.remove();
      followEvent.remove();
      blessing.destroy();
      streams.forEach(s => {
        if (s.active) s.destroy();
      });
    });

    this.scene.events.emit('skill-buff', {
      target: caster,
      type: 'dodge',
      value: 20,
      duration,
    });
  }
}
