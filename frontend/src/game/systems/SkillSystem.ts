// 技能释放系统 - 模块化版本
import Phaser from 'phaser';
import type { Skill, ElementType } from '@/types/skills';
import { ProjectileEffect } from './effects/ProjectileEffect';
import { AreaEffect } from './effects/AreaEffect';
import { SelfEffect } from './effects/SelfEffect';

export class SkillSystem {
  private scene: Phaser.Scene;
  private skillCooldowns: Map<string, number> = new Map();
  private activeSkills: Set<string> = new Set();
  
  // 特效处理器
  private projectileEffect: ProjectileEffect;
  private areaEffect: AreaEffect;
  private selfEffect: SelfEffect;
  
  private elementColors: Map<ElementType | null, number> = new Map([
    ['fire', 0xff4444],
    ['water', 0x4444ff],
    ['wind', 0x88ff88],
    ['earth', 0xaa6633],
    [null, 0xffffff],
  ]);

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.projectileEffect = new ProjectileEffect(scene);
    this.areaEffect = new AreaEffect(scene);
    this.selfEffect = new SelfEffect(scene);
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
    caster: any,
    target: { x: number; y: number }
  ): boolean {
    // 记录冷却时间
    this.skillCooldowns.set(skill.id, this.scene.time.now);
    this.activeSkills.add(skill.id);

    // 显示技能名称
    this.showSkillName(caster, skill.name, skill.elementType);

    // 根据技能ID调用对应的特效
    this.castSkillEffect(skill, caster, target);

    // 触发技能事件
    this.scene.events.emit('skill-cast', {
      skill,
      caster,
      target,
    });

    return true;
  }

  /**
   * 根据技能类型调用对应特效
   */
  private castSkillEffect(skill: Skill, caster: any, target: { x: number; y: number }): void {
    const skillId = skill.id;
    const color = this.elementColors.get(skill.elementType || null) || 0xffffff;

    // 火元素技能
    if (skillId === 'fireball') {
      this.projectileEffect.createFireball(caster, target, skill);
    } else if (skillId === 'fire_wall') {
      this.areaEffect.createFireWall(target, skill);
    } else if (skillId === 'flame_storm' || skillId === 'explosion') {
      this.areaEffect.createExplosion(target, skill, color);
    }
    // 水元素技能
    else if (skillId === 'heal') {
      this.selfEffect.createHeal(caster, skill);
    } else if (skillId === 'water_shield') {
      this.selfEffect.createShield(caster, skill);
    } else if (skillId === 'ice_arrow') {
      this.projectileEffect.createIceArrow(caster, target, skill);
    }
    // 风元素技能
    else if (skillId === 'wind_blade') {
      this.projectileEffect.createWindBlade(caster, target, skill);
    } else if (skillId === 'tornado') {
      this.areaEffect.createTornado(target, skill);
    } else if (skillId === 'wind_blessing') {
      this.selfEffect.createWindBlessing(caster, skill);
    }
    // 土元素技能
    else if (skillId === 'rock_armor') {
      this.selfEffect.createRockArmor(caster, skill);
    } else if (skillId === 'earth_spike') {
      this.areaEffect.createEarthSpike(target, skill);
    }
    // 默认弹道
    else {
      this.projectileEffect.create(caster, target, skill, color);
    }
  }

  /**
   * 显示技能名称
   */
  private showSkillName(caster: any, name: string, element?: ElementType | null): void {
    const color = this.elementColors.get(element || null) || 0xffffff;
    const text = this.scene.add.text(caster.x, caster.y - 50, name, {
      fontSize: '14px',
      color: '#' + color.toString(16).padStart(6, '0'),
      fontFamily: 'monospace',
      stroke: '#000',
      strokeThickness: 3,
    });
    text.setOrigin(0.5);
    text.setDepth(1000);

    this.scene.tweens.add({
      targets: text,
      y: caster.y - 80,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy(),
    });
  }

  /**
   * 获取技能剩余冷却时间（毫秒）
   */
  getRemainingCooldown(skillId: string, cooldown: number): number {
    const lastCast = this.skillCooldowns.get(skillId) || 0;
    const remaining = cooldown - (this.scene.time.now - lastCast);
    return Math.max(0, remaining);
  }

  /**
   * 获取技能冷却进度（0-1）
   */
  getCooldownProgress(skillId: string, cooldown: number): number {
    const remaining = this.getRemainingCooldown(skillId, cooldown);
    return 1 - (remaining / cooldown);
  }
}
