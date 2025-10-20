// 技能冷却管理器
import { useGameStore } from '@/store/gameStore';

export interface CooldownInfo {
  skillId: string;
  startTime: number;
  duration: number;  // 毫秒
  remaining: number;
}

export class CooldownManager {
  private static cooldowns: Map<string, CooldownInfo> = new Map();

  /**
   * 开始冷却
   */
  static startCooldown(skillId: string, duration: number): void {
    const now = Date.now();
    
    // 获取冷却减少加成
    const cooldownReduction = this.getCooldownReduction(skillId);
    const actualDuration = duration * (1 - cooldownReduction) * 1000; // 转换为毫秒

    const cooldown: CooldownInfo = {
      skillId,
      startTime: now,
      duration: actualDuration,
      remaining: actualDuration,
    };

    this.cooldowns.set(skillId, cooldown);

    // 更新到gameStore
    const store = useGameStore.getState();
    if (store.skillTree) {
      store.skillTree.skillCooldowns.set(skillId, now + actualDuration);
    }

    console.log(`⏱️ 技能冷却：${skillId} ${duration}秒`);
  }

  /**
   * 更新所有冷却（每帧调用）
   */
  static update(): void {
    const now = Date.now();

    this.cooldowns.forEach((cooldown, skillId) => {
      cooldown.remaining = cooldown.startTime + cooldown.duration - now;

      // 冷却结束
      if (cooldown.remaining <= 0) {
        this.removeCooldown(skillId);
      }
    });
  }

  /**
   * 检查技能是否在冷却中
   */
  static isOnCooldown(skillId: string): boolean {
    return this.cooldowns.has(skillId);
  }

  /**
   * 获取技能剩余冷却时间（秒）
   */
  static getRemainingTime(skillId: string): number {
    const cooldown = this.cooldowns.get(skillId);
    if (!cooldown) return 0;

    return Math.max(0, cooldown.remaining / 1000);
  }

  /**
   * 获取冷却进度（0-1）
   */
  static getCooldownProgress(skillId: string): number {
    const cooldown = this.cooldowns.get(skillId);
    if (!cooldown) return 0;

    const elapsed = Date.now() - cooldown.startTime;
    return Math.min(1, elapsed / cooldown.duration);
  }

  /**
   * 移除冷却
   */
  static removeCooldown(skillId: string): void {
    this.cooldowns.delete(skillId);

    // 从gameStore移除
    const store = useGameStore.getState();
    if (store.skillTree) {
      store.skillTree.skillCooldowns.delete(skillId);
    }
  }

  /**
   * 重置特定技能冷却
   */
  static resetCooldown(skillId: string): void {
    this.removeCooldown(skillId);
    console.log(`🔄 重置冷却：${skillId}`);
  }

  /**
   * 减少冷却时间
   */
  static reduceCooldown(skillId: string, seconds: number): void {
    const cooldown = this.cooldowns.get(skillId);
    if (!cooldown) return;

    cooldown.remaining -= seconds * 1000;
    
    if (cooldown.remaining <= 0) {
      this.removeCooldown(skillId);
    }
  }

  /**
   * 获取冷却减少百分比
   */
  private static getCooldownReduction(skillId: string): number {
    const store = useGameStore.getState();
    const player = store.player;
    
    let reduction = 0;

    // 1. 玩家自身的冷却减少
    reduction += (player.cooldownReduction || 0) / 100;

    // 2. 元素精通的冷却减少
    // 这里可以根据技能的元素类型获取相应的加成
    
    // 最大不超过40%
    return Math.min(0.4, reduction);
  }

  /**
   * 获取所有冷却中的技能
   */
  static getAllCooldowns(): CooldownInfo[] {
    return Array.from(this.cooldowns.values());
  }

  /**
   * 清除所有冷却
   */
  static clearAllCooldowns(): void {
    this.cooldowns.clear();
    
    const store = useGameStore.getState();
    if (store.skillTree) {
      store.skillTree.skillCooldowns.clear();
    }
    
    console.log('🔄 清除所有冷却');
  }

  /**
   * 格式化冷却时间显示
   */
  static formatCooldownTime(seconds: number): string {
    if (seconds < 1) {
      return `${Math.ceil(seconds * 10) / 10}s`;
    }
    return `${Math.ceil(seconds)}s`;
  }

  /**
   * 检查是否可以使用技能（考虑冷却和魔力）
   */
  static canUseSkill(skillId: string, manaCost: number): {
    canUse: boolean;
    reason?: string;
  } {
    // 检查冷却
    if (this.isOnCooldown(skillId)) {
      const remaining = this.getRemainingTime(skillId);
      return {
        canUse: false,
        reason: `冷却中 (${this.formatCooldownTime(remaining)})`,
      };
    }

    // 检查魔力
    const store = useGameStore.getState();
    const player = store.player;
    
    if (player.mana < manaCost) {
      return {
        canUse: false,
        reason: `魔力不足 (需要${manaCost})`,
      };
    }

    return { canUse: true };
  }

  /**
   * 重置系统（游戏重置时调用）
   */
  static reset(): void {
    this.clearAllCooldowns();
  }
}
