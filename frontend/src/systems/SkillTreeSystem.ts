// 技能树管理系统
import { useGameStore } from '@store/gameStore';
import type { ClassType, ElementType, Skill, ElementMastery } from '@/types/skills';
import { getAllWarriorSkills } from '@/data/skills/warriorSkills';
import { calculateMasteryBonuses, calculateMasteryExpRequired } from '@/data/elements';

export class SkillTreeSystem {
  /**
   * 选择职业（仅在Lv5时可选择一次）
   */
  static selectClass(classType: ClassType): boolean {
    const store = useGameStore.getState();
    const player = store.player;

    // 检查等级
    if (player.level < 5) {
      console.warn('等级不足，需要Lv5才能选择职业');
      return false;
    }

    // 检查是否已选择职业
    if (store.skillTree && store.skillTree.selectedClass) {
      console.warn('已经选择过职业，无法更改');
      return false;
    }

    // 应用职业属性加成（通过等级成长系统实现）
    // 这里只记录职业选择
    store.selectClass(classType);
    
    console.log(`✅ 选择职业：${classType}`);
    return true;
  }

  /**
   * 检查是否可以学习技能
   */
  static canLearnSkill(skillId: string): boolean {
    const store = useGameStore.getState();
    const { skillTree, player } = store;

    if (!skillTree) return false;

    // 检查职业
    if (!skillTree.selectedClass) {
      console.warn('请先选择职业');
      return false;
    }

    // 获取技能信息
    const skill = this.getSkillById(skillId);
    if (!skill) {
      console.warn('技能不存在');
      return false;
    }

    // 检查职业匹配
    if (skill.classType !== skillTree.selectedClass) {
      console.warn('职业不匹配');
      return false;
    }

    // 检查是否已学习
    if (skillTree.learnedSkills.has(skillId)) {
      console.warn('已经学习过该技能');
      return false;
    }

    // 检查等级要求
    if (player.level < skill.requiredLevel) {
      console.warn(`等级不足，需要Lv${skill.requiredLevel}`);
      return false;
    }

    // 检查技能点
    if (skillTree.availablePoints < skill.cost) {
      console.warn(`技能点不足，需要${skill.cost}点`);
      return false;
    }

    // 检查前置技能
    for (const prereqId of skill.prerequisites) {
      if (!skillTree.learnedSkills.has(prereqId)) {
        console.warn(`需要先学习前置技能：${prereqId}`);
        return false;
      }
    }

    // 检查融合技能的元素要求
    if (skill.isFusionSkill && skill.fusionRequirements) {
      const { elementType, elementLevel } = skill.fusionRequirements;
      const mastery = this.getElementMastery(elementType);
      
      if (mastery.level < elementLevel) {
        console.warn(`元素精通等级不足，需要${elementType}精通Lv${elementLevel}`);
        return false;
      }
    }

    return true;
  }

  /**
   * 学习技能
   */
  static learnSkill(skillId: string): boolean {
    if (!this.canLearnSkill(skillId)) {
      return false;
    }

    const store = useGameStore.getState();
    const skill = this.getSkillById(skillId);
    
    if (!skill) return false;

    // 扣除技能点
    store.spendSkillPoints(skill.cost);
    
    // 学习技能
    store.learnSkill({ ...skill, currentLevel: 1 });
    
    console.log(`✨ 学习技能：${skill.name}`);
    return true;
  }

  /**
   * 检查是否可以升级技能
   */
  static canUpgradeSkill(skillId: string): boolean {
    const store = useGameStore.getState();
    const { skillTree } = store;

    if (!skillTree) return false;

    const learnedSkill = skillTree.learnedSkills.get(skillId);
    if (!learnedSkill) {
      console.warn('尚未学习该技能');
      return false;
    }

    // 检查是否已满级
    if (learnedSkill.currentLevel >= learnedSkill.maxLevel) {
      console.warn('技能已满级');
      return false;
    }

    // 升级消耗的技能点（当前等级）
    const upgradeCost = learnedSkill.currentLevel;
    
    // 检查技能点
    if (skillTree.availablePoints < upgradeCost) {
      console.warn(`技能点不足，需要${upgradeCost}点`);
      return false;
    }

    return true;
  }

  /**
   * 升级技能
   */
  static upgradeSkill(skillId: string): boolean {
    if (!this.canUpgradeSkill(skillId)) {
      return false;
    }

    const store = useGameStore.getState();
    const learnedSkill = store.skillTree!.learnedSkills.get(skillId);
    
    if (!learnedSkill) return false;

    const upgradeCost = learnedSkill.currentLevel;
    
    // 扣除技能点
    store.spendSkillPoints(upgradeCost);
    
    // 升级技能
    store.upgradeSkill(skillId);
    
    console.log(`⬆️ 升级技能：${learnedSkill.name} Lv${learnedSkill.currentLevel} → Lv${learnedSkill.currentLevel + 1}`);
    return true;
  }

  /**
   * 装备技能到快捷栏
   */
  static equipSkill(skillId: string, slot: 0 | 1 | 2 | 3): boolean {
    const store = useGameStore.getState();
    const { skillTree } = store;

    if (!skillTree) return false;

    // 检查是否已学习
    if (!skillTree.learnedSkills.has(skillId)) {
      console.warn('尚未学习该技能');
      return false;
    }

    // 装备技能
    store.equipSkill(skillId, slot);
    
    const skill = skillTree.learnedSkills.get(skillId);
    console.log(`🎯 装备技能：${skill?.name} 到槽位${slot + 1}`);
    return true;
  }

  /**
   * 卸下技能
   */
  static unequipSkill(slot: 0 | 1 | 2 | 3): void {
    const store = useGameStore.getState();
    store.unequipSkill(slot);
    console.log(`⬇️ 卸下槽位${slot + 1}的技能`);
  }

  /**
   * 提升元素精通
   */
  static upgradeElementMastery(element: ElementType): boolean {
    const store = useGameStore.getState();
    const { skillTree } = store;

    if (!skillTree) return false;

    const mastery = this.getElementMastery(element);

    // 检查是否已满级
    if (mastery.level >= 10) {
      console.warn('元素精通已满级');
      return false;
    }

    // 精通升级消耗：当前等级+1点
    const upgradeCost = mastery.level + 1;
    
    // 检查技能点
    if (skillTree.availablePoints < upgradeCost) {
      console.warn(`技能点不足，需要${upgradeCost}点`);
      return false;
    }

    // 扣除技能点
    store.spendSkillPoints(upgradeCost);
    
    // 升级元素精通
    const newLevel = mastery.level + 1;
    const newBonuses = calculateMasteryBonuses(newLevel);
    const newExpRequired = calculateMasteryExpRequired(newLevel);
    
    store.upgradeElementMastery(element, newLevel, newBonuses, newExpRequired);
    
    console.log(`🔥 提升${element}元素精通：Lv${mastery.level} → Lv${newLevel}`);
    return true;
  }

  /**
   * 重置技能树（消耗金币或特殊道具）
   */
  static resetSkillTree(element?: ElementType): boolean {
    const store = useGameStore.getState();
    
    // TODO: 添加重置成本检查（金币或道具）
    
    if (element) {
      // 重置特定元素
      store.resetElementMastery(element);
      console.log(`🔄 重置${element}元素精通`);
    } else {
      // 重置全部技能
      store.resetAllSkills();
      console.log('🔄 重置所有技能');
    }
    
    return true;
  }

  /**
   * 获取元素精通信息
   */
  static getElementMastery(element: ElementType): ElementMastery {
    const store = useGameStore.getState();
    const { skillTree } = store;

    if (!skillTree) {
      throw new Error('技能树未初始化');
    }

    switch (element) {
      case 'fire':
        return skillTree.fireMastery;
      case 'water':
        return skillTree.waterMastery;
      case 'wind':
        return skillTree.windMastery;
      case 'earth':
        return skillTree.earthMastery;
    }
  }

  /**
   * 根据ID获取技能
   */
  static getSkillById(skillId: string): Skill | null {
    const store = useGameStore.getState();
    const classType = store.skillTree?.selectedClass;
    
    if (!classType) return null;
    
    const allSkills = this.getClassSkills(classType);
    return allSkills.find(s => s.id === skillId) || null;
  }

  /**
   * 获取职业所有可用技能
   */
  static getClassSkills(classType: ClassType): Skill[] {
    switch (classType) {
      case 'warrior':
        return getAllWarriorSkills();
      case 'mage':
        const { getAllMageSkills } = require('@/data/skills/mageSkills');
        return getAllMageSkills();
      case 'rogue':
        const { getAllRogueSkills } = require('@/data/skills/rogueSkills');
        return getAllRogueSkills();
      case 'priest':
        const { getAllPriestSkills } = require('@/data/skills/priestSkills');
        return getAllPriestSkills();
      default:
        return [];
    }
  }

  /**
   * 计算技能实际伤害（考虑等级和元素精通）
   */
  static calculateSkillDamage(skill: Skill): number {
    if (!skill.damage) return 0;

    const store = useGameStore.getState();
    const learnedSkill = store.skillTree?.learnedSkills.get(skill.id);
    
    let damage = skill.damage;
    
    // 技能等级加成：每级+20%
    if (learnedSkill) {
      damage *= (1 + (learnedSkill.currentLevel - 1) * 0.2);
    }
    
    // 元素精通加成
    if (skill.elementType) {
      const mastery = this.getElementMastery(skill.elementType);
      damage *= (1 + mastery.bonuses.damageBonus / 100);
    }
    
    return Math.floor(damage);
  }
}
