// 升级选项生成器
import { LEVEL_UP_OPTIONS, getAvailableOptions, type LevelUpOption } from '@/data/levelUpOptions';

export class LevelUpOptionsGenerator {
  /**
   * 生成3个随机的升级选项
   * @param currentLevel 当前等级
   * @param recentChoices 最近5次选择的选项ID
   * @returns 3个不重复的选项
   */
  static generate(currentLevel: number, recentChoices: string[] = []): LevelUpOption[] {
    // 1. 获取当前等级可用的所有选项
    const availableOptions = getAvailableOptions(currentLevel);
    
    if (availableOptions.length < 3) {
      console.warn('可用选项不足3个');
      return availableOptions;
    }
    
    // 2. 计算每个选项的权重（考虑最近选择）
    const weightedOptions = this.calculateWeights(availableOptions, recentChoices);
    
    // 3. 随机选择3个不重复的选项
    const selected: LevelUpOption[] = [];
    const remaining = [...weightedOptions];
    
    for (let i = 0; i < 3 && remaining.length > 0; i++) {
      const option = this.weightedRandomSelect(remaining);
      selected.push(option);
      
      // 从剩余选项中移除已选择的
      const index = remaining.findIndex(opt => opt.id === option.id);
      if (index !== -1) {
        remaining.splice(index, 1);
      }
    }
    
    return selected;
  }

  /**
   * 计算选项权重（降低最近选择过的选项权重）
   */
  private static calculateWeights(
    options: LevelUpOption[],
    recentChoices: string[]
  ): Array<LevelUpOption & { adjustedWeight: number }> {
    return options.map(option => {
      let weight = option.weight;
      
      // 如果在最近5次选择中，降低权重
      const timesChosen = recentChoices.filter(id => id === option.id).length;
      if (timesChosen > 0) {
        weight = weight * Math.pow(0.5, timesChosen); // 每次选择权重减半
      }
      
      return {
        ...option,
        adjustedWeight: weight,
      };
    });
  }

  /**
   * 根据权重随机选择一个选项
   */
  private static weightedRandomSelect(
    options: Array<LevelUpOption & { adjustedWeight: number }>
  ): LevelUpOption {
    // 计算总权重
    const totalWeight = options.reduce((sum, opt) => sum + opt.adjustedWeight, 0);
    
    // 生成随机数
    let random = Math.random() * totalWeight;
    
    // 选择对应的选项
    for (const option of options) {
      random -= option.adjustedWeight;
      if (random <= 0) {
        return option;
      }
    }
    
    // 默认返回最后一个
    return options[options.length - 1];
  }

  /**
   * 应用选项到玩家属性
   * @param option 选择的选项
   * @param currentStats 当前属性
   * @returns 新的属性值
   */
  static applyOption(option: LevelUpOption, currentStats: any): any {
    const newStats = { ...currentStats };
    
    // 获取当前值
    const currentValue = newStats[option.statType] || 0;
    
    // 应用提升
    newStats[option.statType] = currentValue + option.value;
    
    return newStats;
  }

  /**
   * 格式化属性值显示
   * @param option 选项
   * @param currentValue 当前值
   * @returns 格式化后的字符串
   */
  static formatStatChange(option: LevelUpOption, currentValue: number = 0): string {
    const newValue = currentValue + option.value;
    
    // 百分比类型的属性
    const percentageStats = ['critRate', 'critDamage', 'cooldownReduction', 'expBonus', 
                            'lifeSteal', 'thorns', 'dodge', 'penetration'];
    
    if (percentageStats.includes(option.statType)) {
      return `${currentValue}% → ${newValue}%`;
    }
    
    // 普通数值类型
    return `${currentValue} → ${newValue}`;
  }
}
