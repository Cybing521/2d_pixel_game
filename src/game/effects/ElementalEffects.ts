// 元素效果系统
import type { SkillEffect, SkillEffectType } from '@/types/skills';

export interface ActiveEffect {
  id: string;
  type: SkillEffectType;
  value: number;
  duration: number;
  remainingTime: number;
  tickInterval?: number;
  lastTickTime?: number;
  source: string;  // 技能ID
  stackable: boolean;
}

export class ElementalEffects {
  private static effectIdCounter = 0;
  private static activeEffects: Map<string, ActiveEffect[]> = new Map();  // targetId -> effects

  /**
   * 应用效果到目标
   */
  static applyEffect(
    targetId: string,
    effect: SkillEffect,
    skillId: string
  ): string {
    const effectId = `effect_${++this.effectIdCounter}`;
    
    const activeEffect: ActiveEffect = {
      id: effectId,
      type: effect.type,
      value: effect.value,
      duration: effect.duration,
      remainingTime: effect.duration,
      tickInterval: effect.tickInterval,
      lastTickTime: Date.now(),
      source: skillId,
      stackable: this.isStackable(effect.type),
    };

    // 获取目标的效果列表
    if (!this.activeEffects.has(targetId)) {
      this.activeEffects.set(targetId, []);
    }

    const targetEffects = this.activeEffects.get(targetId)!;

    // 检查是否可叠加
    if (!activeEffect.stackable) {
      // 不可叠加，移除相同类型的效果
      const existingIndex = targetEffects.findIndex(
        e => e.type === effect.type && e.source === skillId
      );
      if (existingIndex !== -1) {
        targetEffects.splice(existingIndex, 1);
      }
    }

    targetEffects.push(activeEffect);

    console.log(`✨ 应用效果：${effect.type} 到 ${targetId}`);
    return effectId;
  }

  /**
   * 更新所有效果（每帧调用）
   */
  static update(deltaTime: number): void {
    const currentTime = Date.now();

    this.activeEffects.forEach((effects, targetId) => {
      for (let i = effects.length - 1; i >= 0; i--) {
        const effect = effects[i];
        
        // 更新剩余时间
        effect.remainingTime -= deltaTime;

        // 处理DOT/HOT
        if (effect.tickInterval) {
          const timeSinceLastTick = currentTime - (effect.lastTickTime || currentTime);
          if (timeSinceLastTick >= effect.tickInterval * 1000) {
            this.applyTickEffect(targetId, effect);
            effect.lastTickTime = currentTime;
          }
        }

        // 移除过期效果
        if (effect.remainingTime <= 0) {
          this.removeEffect(targetId, effect.id);
        }
      }
    });
  }

  /**
   * 应用tick效果（DOT/HOT）
   */
  private static applyTickEffect(targetId: string, effect: ActiveEffect): void {
    switch (effect.type) {
      case 'burn':
        // 燃烧伤害
        this.dealDamage(targetId, effect.value);
        this.showEffect(targetId, '🔥', effect.value);
        break;

      case 'heal':
        // 持续治疗
        this.healTarget(targetId, effect.value);
        this.showEffect(targetId, '💚', effect.value);
        break;

      case 'debuff':
        // 持续削弱（如流血、中毒）
        this.dealDamage(targetId, effect.value);
        this.showEffect(targetId, '🩸', effect.value);
        break;
    }
  }

  /**
   * 移除效果
   */
  static removeEffect(targetId: string, effectId: string): void {
    const effects = this.activeEffects.get(targetId);
    if (!effects) return;

    const index = effects.findIndex(e => e.id === effectId);
    if (index !== -1) {
      effects.splice(index, 1);
    }

    // 如果目标没有效果了，清理
    if (effects.length === 0) {
      this.activeEffects.delete(targetId);
    }
  }

  /**
   * 清除目标所有效果
   */
  static clearAllEffects(targetId: string): void {
    this.activeEffects.delete(targetId);
  }

  /**
   * 清除目标特定类型的效果
   */
  static clearEffectType(targetId: string, type: SkillEffectType): void {
    const effects = this.activeEffects.get(targetId);
    if (!effects) return;

    for (let i = effects.length - 1; i >= 0; i--) {
      if (effects[i].type === type) {
        effects.splice(i, 1);
      }
    }
  }

  /**
   * 获取目标的所有效果
   */
  static getActiveEffects(targetId: string): ActiveEffect[] {
    return this.activeEffects.get(targetId) || [];
  }

  /**
   * 检查目标是否有特定效果
   */
  static hasEffect(targetId: string, type: SkillEffectType): boolean {
    const effects = this.activeEffects.get(targetId);
    return effects?.some(e => e.type === type) || false;
  }

  /**
   * 获取特定效果的总值（用于叠加效果）
   */
  static getEffectValue(targetId: string, type: SkillEffectType): number {
    const effects = this.activeEffects.get(targetId);
    if (!effects) return 0;

    return effects
      .filter(e => e.type === type)
      .reduce((sum, e) => sum + e.value, 0);
  }

  /**
   * 判断效果是否可叠加
   */
  private static isStackable(type: SkillEffectType): boolean {
    switch (type) {
      case 'burn':
      case 'debuff':
        return true;  // 可以叠加多个燃烧/削弱
      case 'freeze':
      case 'stun':
      case 'slow':
        return false; // 控制效果不叠加
      case 'shield':
      case 'buff':
        return true;  // buff可以叠加
      default:
        return false;
    }
  }

  /**
   * 应用控制效果
   */
  static applyControlEffect(
    targetId: string,
    type: 'freeze' | 'stun' | 'slow',
    duration: number,
    value: number
  ): void {
    // 实现控制效果逻辑
    // 这里会与游戏引擎集成
    console.log(`🎯 应用控制：${type} ${duration}秒 到 ${targetId}`);
  }

  /**
   * 造成伤害（与游戏系统集成）
   */
  private static dealDamage(targetId: string, damage: number): void {
    // 这里会调用游戏的伤害系统
    console.log(`💥 DOT伤害：${damage} 到 ${targetId}`);
  }

  /**
   * 治疗目标（与游戏系统集成）
   */
  private static healTarget(targetId: string, healing: number): void {
    // 这里会调用游戏的治疗系统
    console.log(`💚 HOT治疗：${healing} 到 ${targetId}`);
  }

  /**
   * 显示效果（视觉反馈）
   */
  private static showEffect(targetId: string, icon: string, value: number): void {
    // 这里会显示浮动数字等视觉效果
    console.log(`${icon} ${value} -> ${targetId}`);
  }

  /**
   * 获取效果描述
   */
  static getEffectDescription(effect: ActiveEffect): string {
    const timeLeft = Math.ceil(effect.remainingTime);
    
    switch (effect.type) {
      case 'burn':
        return `🔥 燃烧 (${effect.value}/秒, ${timeLeft}秒)`;
      case 'freeze':
        return `❄️ 冰冻 (${timeLeft}秒)`;
      case 'slow':
        return `🐌 减速 ${effect.value}% (${timeLeft}秒)`;
      case 'stun':
        return `💫 晕眩 (${timeLeft}秒)`;
      case 'heal':
        return `💚 持续治疗 (${effect.value}/秒, ${timeLeft}秒)`;
      case 'shield':
        return `🛡️ 护盾 (${effect.value}, ${timeLeft}秒)`;
      case 'buff':
        return `⬆️ 增益 +${effect.value}% (${timeLeft}秒)`;
      case 'debuff':
        return `⬇️ 削弱 (${effect.value}/秒, ${timeLeft}秒)`;
      default:
        return `❓ 未知效果`;
    }
  }

  /**
   * 重置所有效果（用于游戏重置）
   */
  static reset(): void {
    this.activeEffects.clear();
    this.effectIdCounter = 0;
  }
}
