// 等级系统 - 管理经验值、升级和属性提升
import { useGameStore } from '@store/gameStore';

export interface LevelUpReward {
  healthRestore: number;  // HP恢复百分比 (50-100)
  manaRestore: number;    // MP恢复百分比 (50-100)
}

export class LevelSystem {
  /**
   * 计算升到下一级所需的经验值
   * 采用分段曲线：前期平滑、后期递增
   * 
   * 1-10级：线性增长（50 * level）
   * 11-30级：平方增长（基础 + 系数 * (level - 10)^1.3）
   * 31-50级：指数增长（基础 + 系数 * (level - 30)^1.8）
   */
  static calculateExpToNextLevel(level: number): number {
    if (level <= 10) {
      // 前期：线性增长，每级增加50经验
      // Lv1->2: 50, Lv2->3: 100, Lv10->11: 500
      return 50 * level;
    } else if (level <= 30) {
      // 中期：平方增长，增速逐渐加快
      // Lv11->12: ~600, Lv20->21: ~1500, Lv30->31: ~3500
      return Math.floor(500 + 100 * Math.pow(level - 10, 1.3));
    } else {
      // 后期：指数增长，增速明显加快
      // Lv31->32: ~4000, Lv40->41: ~12000, Lv49->50: ~35000
      return Math.floor(3500 + 500 * Math.pow(level - 30, 1.8));
    }
  }

  /**
   * 添加经验值并检查升级
   * @param amount 获得的经验值
   * @returns 是否升级
   */
  static addExp(amount: number): boolean {
    const store = useGameStore.getState();
    const { player, progress } = store;
    
    // 应用经验加成
    const expBonus = player.expBonus || 0;
    const actualExp = Math.floor(amount * (1 + expBonus / 100));
    
    const newExp = progress.exp + actualExp;
    const expToNext = this.calculateExpToNextLevel(player.level);
    
    // 更新经验值
    store.updatePlayerStats({ exp: newExp });
    
    // 检查是否升级
    if (newExp >= expToNext) {
      this.handleLevelUp();
      return true;
    }
    
    return false;
  }

  /**
   * 处理升级逻辑
   */
  static handleLevelUp(): void {
    const store = useGameStore.getState();
    const { player, progress } = store;
    
    // 计算新等级
    const newLevel = player.level + 1;
    const remainingExp = progress.exp - this.calculateExpToNextLevel(player.level);
    const newExpToNext = this.calculateExpToNextLevel(newLevel);
    
    // 生成恢复奖励
    const reward = this.generateLevelUpReward();
    
    // 更新等级
    store.updatePlayerStats({
      level: newLevel,
      exp: Math.max(0, remainingExp),
    });
    
    // 更新经验值需求
    store.updateProgress({
      exp: Math.max(0, remainingExp),
      expToNextLevel: newExpToNext,
    });
    
    // 应用升级奖励（恢复HP/MP）
    this.applyLevelUpReward(reward);
    
    // 添加未分配点数
    store.addUnallocatedPoint();
    
    // 生成3个属性选项（在选项系统实现后会用到）
    // const options = generateLevelUpOptions(newLevel, store.progress.recentChoices);
    // store.addPendingOptions(options);
    
    console.log(`🎉 升级到 Lv.${newLevel}！恢复 ${Math.floor(reward.healthRestore)}% HP, ${Math.floor(reward.manaRestore)}% MP`);
  }

  /**
   * 生成升级恢复奖励
   * HP和MP各恢复50-100%
   */
  static generateLevelUpReward(): LevelUpReward {
    return {
      healthRestore: 50 + Math.random() * 50,  // 50-100%
      manaRestore: 50 + Math.random() * 50,     // 50-100%
    };
  }

  /**
   * 应用升级恢复奖励
   * @param reward 恢复奖励
   */
  static applyLevelUpReward(reward: LevelUpReward): void {
    const store = useGameStore.getState();
    const { player } = store;
    
    // 计算恢复量
    const healthRestore = Math.floor(player.maxHealth * (reward.healthRestore / 100));
    const manaRestore = Math.floor((player.maxMana || 0) * (reward.manaRestore / 100));
    
    // 应用恢复
    const newHealth = Math.min(player.maxHealth, player.health + healthRestore);
    const newMana = Math.min(player.maxMana || 0, (player.mana || 0) + manaRestore);
    
    store.updatePlayerStats({
      health: newHealth,
      mana: newMana,
    });
    
    // 显示恢复特效（通过事件系统）
    store.showLevelUpEffect({
      level: player.level,
      healthRestore: reward.healthRestore,
      manaRestore: reward.manaRestore,
      actualHealthRestore: healthRestore,
      actualManaRestore: manaRestore,
    });
  }

  /**
   * 消耗未分配点数并应用属性提升
   * 注意：实际的属性应用逻辑在AttributeAllocationPanel组件中处理
   */
  static consumeUnallocatedPoint(): boolean {
    const store = useGameStore.getState();
    
    if (store.progress.unallocatedPoints <= 0) {
      console.warn('没有可用的属性点');
      return false;
    }
    
    // 点数消耗在AttributeAllocationPanel中处理
    return true;
  }

  /**
   * 获取等级里程碑奖励
   * @param level 等级
   */
  static checkLevelMilestone(level: number): string[] {
    const milestones: string[] = [];
    
    if (level === 5) milestones.push('解锁第一个技能槽');
    if (level === 10) milestones.push('解锁传送功能');
    if (level === 15) milestones.push('解锁第二个技能槽');
    if (level === 20) milestones.push('解锁精英技能');
    if (level === 25) milestones.push('解锁装备强化');
    if (level === 30) milestones.push('解锁第三个技能槽');
    if (level === 40) milestones.push('解锁终极技能');
    if (level === 50) milestones.push('达到满级！获得特殊称号');
    
    return milestones;
  }
}
