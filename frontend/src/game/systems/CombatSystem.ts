// 战斗系统
import Phaser from 'phaser';
import { COMBAT_CONFIG } from '@constants/gameConfig';

export class CombatSystem {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 计算伤害
   * @param attackerStats 攻击者属性
   * @param targetStats 目标属性
   * @param baseDamage 基础伤害
   * @returns { damage: number, isCrit: boolean, effects: string[] }
   */
  calculateDamage(
    attackerStats: any,
    targetStats: any,
    baseDamage: number = 0
  ): { damage: number; isCrit: boolean; effects: string[] } {
    const effects: string[] = [];
    
    // 基础伤害计算
    let damage = baseDamage + (attackerStats.attack || 0);
    
    // 穿透计算
    const penetration = (attackerStats.penetration || 0) / 100;
    const effectiveDefense = (targetStats.defense || 0) * (1 - penetration);
    damage -= effectiveDefense * 0.5;
    
    damage = Math.max(1, damage);

    // 暴击判定
    const critRate = (attackerStats.critRate || 5) / 100; // 默认5%暴击率
    const isCrit = Math.random() < critRate;
    
    if (isCrit) {
      const critDamage = (attackerStats.critDamage || 150) / 100; // 默认1.5倍
      damage *= critDamage;
      effects.push('CRIT');
    }
    
    // 多重打击
    const multiHit = attackerStats.multiHit || 0;
    if (multiHit > 0) {
      damage *= (1 + multiHit * 0.3); // 每次额外打击+30%伤害
      effects.push(`x${1 + multiHit}`);
    }

    return { damage: Math.floor(damage), isCrit, effects };
  }

  /**
   * 闪避判定
   */
  checkDodge(dodgeRate: number = 0): boolean {
    return Math.random() < (dodgeRate / 100);
  }
  
  /**
   * 应用攻击后效果（吸血、反伤等）
   */
  applyAttackEffects(
    attacker: any,
    target: any,
    damageDealt: number
  ): { lifeSteal: number; thorns: number } {
    const effects = { lifeSteal: 0, thorns: 0 };
    
    // 吸血
    const lifeStealRate = (attacker.lifeSteal || 0) / 100;
    if (lifeStealRate > 0) {
      effects.lifeSteal = Math.floor(damageDealt * lifeStealRate);
    }
    
    // 反伤（目标有反伤属性）
    const thornsRate = (target.thorns || 0) / 100;
    if (thornsRate > 0) {
      effects.thorns = Math.floor(damageDealt * thornsRate);
    }
    
    return effects;
  }

  /**
   * 创建伤害数字显示
   */
  showDamageNumber(x: number, y: number, damage: number, isCrit: boolean = false) {
    const text = this.scene.add.text(x, y, `-${damage}`, {
      font: isCrit ? 'bold 20px monospace' : '16px monospace',
      color: isCrit ? '#ff0000' : '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    });
    text.setOrigin(0.5);

    // 飘字动画
    this.scene.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        text.destroy();
      },
    });
  }

  /**
   * 创建治疗数字显示
   */
  showHealNumber(x: number, y: number, amount: number) {
    const text = this.scene.add.text(x, y, `+${amount}`, {
      font: '16px monospace',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 3,
    });
    text.setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        text.destroy();
      },
    });
  }
}
