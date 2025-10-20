// 伤害计算系统
import type { Skill, ElementType } from '@/types/skills';
import type { PlayerData } from '@/types/entities';
import { checkElementCounter, calculateElementDamage } from '@/data/elements';
import { SkillTreeSystem } from '@/systems/SkillTreeSystem';

export interface DamageResult {
  baseDamage: number;
  finalDamage: number;
  isCritical: boolean;
  isCounter: boolean;  // 是否克制
  elementBonus: number;
  breakdown: {
    base: number;
    attack: number;
    skillLevel: number;
    elementMastery: number;
    critical: number;
    counter: number;
  };
}

export class DamageCalculator {
  /**
   * 计算技能伤害
   */
  static calculateSkillDamage(
    skill: Skill,
    caster: PlayerData,
    targetElement?: ElementType
  ): DamageResult {
    if (!skill.damage) {
      return this.createZeroDamage();
    }

    const breakdown = {
      base: skill.damage,
      attack: 0,
      skillLevel: 0,
      elementMastery: 0,
      critical: 0,
      counter: 0,
    };

    // 1. 基础伤害
    let damage = skill.damage;

    // 2. 技能等级加成（每级+20%）
    const skillLevelBonus = (skill.currentLevel - 1) * 0.2;
    breakdown.skillLevel = damage * skillLevelBonus;
    damage += breakdown.skillLevel;

    // 3. 攻击力/魔法强度加成
    if (skill.classType === 'warrior' || skill.classType === 'rogue') {
      // 物理职业用攻击力
      breakdown.attack = (caster.attack || 0) * 0.5;
    } else {
      // 魔法职业用魔法强度
      breakdown.attack = (caster.magic || 0) * 0.8;
    }
    damage += breakdown.attack;

    // 4. 元素精通加成
    if (skill.elementType) {
      const mastery = SkillTreeSystem.getElementMastery(skill.elementType);
      const masteryBonus = mastery.bonuses.damageBonus / 100;
      breakdown.elementMastery = damage * masteryBonus;
      damage += breakdown.elementMastery;
    }

    // 5. 元素克制加成
    let isCounter = false;
    if (skill.elementType && targetElement) {
      isCounter = checkElementCounter(skill.elementType, targetElement);
      if (isCounter) {
        breakdown.counter = damage * 0.3;  // +30%
        damage += breakdown.counter;
      }
    }

    // 6. 暴击判定
    const critRate = (caster.critRate || 0) / 100;
    const isCritical = Math.random() < critRate;
    if (isCritical) {
      const critDamage = (caster.critDamage || 150) / 100;
      breakdown.critical = damage * (critDamage - 1);
      damage *= critDamage;
    }

    const baseDamage = skill.damage;
    const finalDamage = Math.floor(damage);

    return {
      baseDamage,
      finalDamage,
      isCritical,
      isCounter,
      elementBonus: breakdown.elementMastery + breakdown.counter,
      breakdown,
    };
  }

  /**
   * 计算治疗量
   */
  static calculateHealing(
    skill: Skill,
    caster: PlayerData
  ): number {
    if (!skill.healing) return 0;

    let healing = skill.healing;

    // 1. 技能等级加成
    healing *= (1 + (skill.currentLevel - 1) * 0.2);

    // 2. 魔法强度加成
    healing += (caster.magic || 0) * 0.6;

    // 3. 治疗效果加成（如果有）
    const healingBonus = (caster.healingBonus || 0) / 100;
    healing *= (1 + healingBonus);

    return Math.floor(healing);
  }

  /**
   * 计算实际承受伤害（考虑防御）
   */
  static calculateActualDamage(
    rawDamage: number,
    target: { defense: number; [key: string]: any }
  ): number {
    // 防御减伤公式：实际伤害 = 原始伤害 * (100 / (100 + 防御))
    const defense = target.defense || 0;
    const damageReduction = 100 / (100 + defense);
    const actualDamage = rawDamage * damageReduction;

    return Math.floor(Math.max(1, actualDamage)); // 至少造成1点伤害
  }

  /**
   * 计算护盾吸收量
   */
  static calculateShieldAmount(
    skill: Skill,
    caster: PlayerData
  ): number {
    const effect = skill.effects?.find(e => e.type === 'shield');
    if (!effect) return 0;

    let shield = effect.value;

    // 技能等级加成
    shield *= (1 + (skill.currentLevel - 1) * 0.2);

    // 魔法强度加成
    shield += (caster.magic || 0) * 0.4;

    return Math.floor(shield);
  }

  /**
   * 创建零伤害结果
   */
  private static createZeroDamage(): DamageResult {
    return {
      baseDamage: 0,
      finalDamage: 0,
      isCritical: false,
      isCounter: false,
      elementBonus: 0,
      breakdown: {
        base: 0,
        attack: 0,
        skillLevel: 0,
        elementMastery: 0,
        critical: 0,
        counter: 0,
      },
    };
  }

  /**
   * 格式化伤害信息（用于显示）
   */
  static formatDamageInfo(result: DamageResult): string {
    const parts: string[] = [];

    if (result.isCritical) {
      parts.push('💥暴击');
    }

    if (result.isCounter) {
      parts.push('⚡克制');
    }

    parts.push(`${result.finalDamage}伤害`);

    return parts.join(' ');
  }

  /**
   * 计算DOT伤害（持续伤害）
   */
  static calculateDOTDamage(
    baseValue: number,
    caster: PlayerData,
    skillLevel: number
  ): number {
    let damage = baseValue;

    // 技能等级加成
    damage *= (1 + (skillLevel - 1) * 0.15);

    // 魔法强度加成（DOT伤害较低）
    damage += (caster.magic || 0) * 0.3;

    return Math.floor(damage);
  }

  /**
   * 计算HOT治疗（持续治疗）
   */
  static calculateHOTHealing(
    baseValue: number,
    caster: PlayerData,
    skillLevel: number
  ): number {
    let healing = baseValue;

    // 技能等级加成
    healing *= (1 + (skillLevel - 1) * 0.15);

    // 魔法强度加成
    healing += (caster.magic || 0) * 0.4;

    return Math.floor(healing);
  }
}
