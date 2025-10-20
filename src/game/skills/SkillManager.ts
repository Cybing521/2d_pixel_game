// 技能释放管理器
import type { Skill, ElementType } from '@/types/skills';
import { useGameStore } from '@/store/gameStore';
import { SkillTreeSystem } from '@/systems/SkillTreeSystem';
import { DamageCalculator } from '@/game/combat/DamageCalculator';
import { ElementalEffects } from '@/game/effects/ElementalEffects';
import { CooldownManager } from './CooldownManager';

export interface SkillCastResult {
  success: boolean;
  reason?: string;
  damage?: number;
  healing?: number;
  effects?: string[];
}

export interface SkillTarget {
  id: string;
  x: number;
  y: number;
  element?: ElementType;
  [key: string]: any;
}

export class SkillManager {
  /**
   * 释放技能
   */
  static castSkill(
    skillId: string,
    target?: SkillTarget,
    targetPosition?: { x: number; y: number }
  ): SkillCastResult {
    const store = useGameStore.getState();
    const player = store.player;
    const skillTree = store.skillTree;

    if (!skillTree) {
      return {
        success: false,
        reason: '未选择职业',
      };
    }

    // 1. 获取技能
    const skill = skillTree.learnedSkills.get(skillId);
    if (!skill) {
      return {
        success: false,
        reason: '未学习该技能',
      };
    }

    // 2. 检查是否可以使用
    const canUse = CooldownManager.canUseSkill(skillId, skill.manaCost);
    if (!canUse.canUse) {
      return {
        success: false,
        reason: canUse.reason,
      };
    }

    // 3. 消耗魔力
    store.updatePlayerStats({
      mana: Math.max(0, player.mana - skill.manaCost),
    });

    // 4. 开始冷却
    CooldownManager.startCooldown(skillId, skill.cooldown);

    // 5. 执行技能效果
    const result = this.executeSkill(skill, player, target, targetPosition);

    // 6. 技能动画和特效
    this.playSkillAnimation(skill, player, target, targetPosition);

    console.log(`✨ 释放技能：${skill.name}`);
    return result;
  }

  /**
   * 执行技能效果
   */
  private static executeSkill(
    skill: Skill,
    caster: any,
    target?: SkillTarget,
    targetPosition?: { x: number; y: number }
  ): SkillCastResult {
    const result: SkillCastResult = {
      success: true,
      effects: [],
    };

    // 伤害类技能
    if (skill.damage) {
      const damageResult = DamageCalculator.calculateSkillDamage(
        skill,
        caster,
        target?.element
      );

      result.damage = damageResult.finalDamage;
      result.effects?.push(DamageCalculator.formatDamageInfo(damageResult));

      // 应用伤害到目标
      if (target) {
        this.applyDamage(target.id, damageResult.finalDamage);
      }
    }

    // 治疗类技能
    if (skill.healing) {
      const healing = DamageCalculator.calculateHealing(skill, caster);
      result.healing = healing;
      result.effects?.push(`💚 治疗 ${healing}`);

      // 应用治疗
      this.applyHealing('player', healing);
    }

    // 应用技能效果
    if (skill.effects && target) {
      skill.effects.forEach(effect => {
        ElementalEffects.applyEffect(target.id, effect, skill.id);
        result.effects?.push(ElementalEffects.getEffectDescription({
          id: '',
          ...effect,
          remainingTime: effect.duration,
          source: skill.id,
          stackable: false,
        }));
      });
    }

    // 特殊技能效果
    this.applySpecialEffects(skill, caster, target, targetPosition);

    return result;
  }

  /**
   * 应用特殊技能效果
   */
  private static applySpecialEffects(
    skill: Skill,
    caster: any,
    target?: SkillTarget,
    targetPosition?: { x: number; y: number }
  ): void {
    // 传送类技能
    if (skill.id.includes('teleport') || skill.id.includes('shadow_step')) {
      if (targetPosition) {
        this.teleportPlayer(targetPosition.x, targetPosition.y);
      }
    }

    // 护盾类技能
    if (skill.effects?.some(e => e.type === 'shield')) {
      const shieldAmount = DamageCalculator.calculateShieldAmount(skill, caster);
      this.applyShield('player', shieldAmount, skill.duration || 10);
    }

    // buff类技能
    if (skill.effects?.some(e => e.type === 'buff')) {
      console.log(`⬆️ 应用增益效果：${skill.name}`);
    }
  }

  /**
   * 应用伤害
   */
  private static applyDamage(targetId: string, damage: number): void {
    // 这里会与游戏引擎集成，对敌人造成伤害
    console.log(`💥 对 ${targetId} 造成 ${damage} 伤害`);
  }

  /**
   * 应用治疗
   */
  private static applyHealing(targetId: string, healing: number): void {
    const store = useGameStore.getState();
    const player = store.player;

    if (targetId === 'player') {
      const newHealth = Math.min(player.maxHealth, player.health + healing);
      store.updatePlayerStats({ health: newHealth });
      console.log(`💚 治疗 ${healing} HP (${player.health} → ${newHealth})`);
    }
  }

  /**
   * 应用护盾
   */
  private static applyShield(targetId: string, amount: number, duration: number): void {
    console.log(`🛡️ 获得 ${amount} 护盾，持续 ${duration} 秒`);
    // 这里可以在gameStore中添加护盾状态
  }

  /**
   * 传送玩家
   */
  private static teleportPlayer(x: number, y: number): void {
    const store = useGameStore.getState();
    store.updatePlayerPosition(x, y);
    console.log(`🌀 传送到 (${x}, ${y})`);
  }

  /**
   * 播放技能动画
   */
  private static playSkillAnimation(
    skill: Skill,
    caster: any,
    target?: SkillTarget,
    targetPosition?: { x: number; y: number }
  ): void {
    // 这里会触发Phaser动画系统
    console.log(`🎬 播放技能动画：${skill.name}`);
    
    // 根据技能类型播放不同动画
    switch (skill.elementType) {
      case 'fire':
        console.log('🔥 火焰特效');
        break;
      case 'water':
        console.log('💧 水特效');
        break;
      case 'wind':
        console.log('🌪️ 风特效');
        break;
      case 'earth':
        console.log('🪨 土特效');
        break;
    }
  }

  /**
   * 快捷栏释放技能
   */
  static castSkillBySlot(slot: 0 | 1 | 2 | 3, target?: SkillTarget): SkillCastResult {
    const store = useGameStore.getState();
    const skillTree = store.skillTree;

    if (!skillTree) {
      return {
        success: false,
        reason: '未选择职业',
      };
    }

    const skillId = skillTree.equippedSkills[slot];
    if (!skillId) {
      return {
        success: false,
        reason: `槽位${slot + 1}未装备技能`,
      };
    }

    return this.castSkill(skillId, target);
  }

  /**
   * 获取AOE范围内的目标
   */
  static getTargetsInRadius(
    centerX: number,
    centerY: number,
    radius: number,
    allTargets: SkillTarget[]
  ): SkillTarget[] {
    return allTargets.filter(target => {
      const dx = target.x - centerX;
      const dy = target.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= radius;
    });
  }

  /**
   * 检查目标是否在技能范围内
   */
  static isInRange(
    casterX: number,
    casterY: number,
    targetX: number,
    targetY: number,
    range: number
  ): boolean {
    const dx = targetX - casterX;
    const dy = targetY - casterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= range;
  }

  /**
   * 获取可释放的技能列表
   */
  static getAvailableSkills(): Skill[] {
    const store = useGameStore.getState();
    const skillTree = store.skillTree;
    const player = store.player;

    if (!skillTree) return [];

    const skills: Skill[] = [];
    skillTree.learnedSkills.forEach(skill => {
      const canUse = CooldownManager.canUseSkill(skill.id, skill.manaCost);
      if (canUse.canUse) {
        skills.push(skill);
      }
    });

    return skills;
  }

  /**
   * 打断技能释放
   */
  static interruptCast(skillId: string): void {
    // 这里可以打断正在释放的技能
    console.log(`⛔ 打断技能：${skillId}`);
  }

  /**
   * 重置系统
   */
  static reset(): void {
    // 重置所有技能状态
    console.log('🔄 重置技能系统');
  }
}
