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
   */
  calculateDamage(
    baseDamage: number,
    attackerAttack: number,
    targetDefense: number
  ): number {
    // 基础伤害计算
    let damage = baseDamage + attackerAttack - targetDefense * 0.5;
    damage = Math.max(1, damage); // 最少1点伤害

    // 暴击判定
    if (Math.random() < COMBAT_CONFIG.CRIT_CHANCE) {
      damage *= COMBAT_CONFIG.CRIT_DAMAGE;
    }

    // 应用伤害倍率
    damage *= COMBAT_CONFIG.DAMAGE_MULTIPLIER;

    return Math.floor(damage);
  }

  /**
   * 闪避判定
   */
  checkDodge(): boolean {
    return Math.random() < COMBAT_CONFIG.DODGE_CHANCE;
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
