// 方向辅助工具 - 处理8方向的计算和纹理映射
import Phaser from 'phaser';

export type Direction8 = 
  | 'south' 
  | 'south-east' 
  | 'east' 
  | 'north-east' 
  | 'north' 
  | 'north-west' 
  | 'west' 
  | 'south-west';

export class DirectionHelper {
  /**
   * 根据速度向量计算8方向
   * @param velocityX X轴速度
   * @param velocityY Y轴速度
   * @returns 8方向之一，如果速度为0则返回null
   */
  static getDirectionFromVelocity(velocityX: number, velocityY: number): Direction8 | null {
    // 如果没有移动，返回null
    if (velocityX === 0 && velocityY === 0) {
      return null;
    }

    // 计算角度（以度为单位）
    const angle = Phaser.Math.RadToDeg(Math.atan2(velocityY, velocityX));
    
    // 标准化角度到 0-360 范围
    const normalizedAngle = (angle + 360) % 360;
    
    // 根据角度范围确定方向
    // 东（右）: 0度, 南（下）: 90度, 西（左）: 180度, 北（上）: 270度
    if (normalizedAngle >= 337.5 || normalizedAngle < 22.5) {
      return 'east';
    } else if (normalizedAngle >= 22.5 && normalizedAngle < 67.5) {
      return 'south-east';
    } else if (normalizedAngle >= 67.5 && normalizedAngle < 112.5) {
      return 'south';
    } else if (normalizedAngle >= 112.5 && normalizedAngle < 157.5) {
      return 'south-west';
    } else if (normalizedAngle >= 157.5 && normalizedAngle < 202.5) {
      return 'west';
    } else if (normalizedAngle >= 202.5 && normalizedAngle < 247.5) {
      return 'north-west';
    } else if (normalizedAngle >= 247.5 && normalizedAngle < 292.5) {
      return 'north';
    } else {
      return 'north-east';
    }
  }

  /**
   * 获取角色纹理键名
   * @param spritePrefix 精灵前缀（如 'hero' 或 'slime'）
   * @param direction 方向
   * @returns 完整的纹理键名
   */
  static getTextureKey(spritePrefix: string, direction: Direction8): string {
    return `${spritePrefix}-${direction}`;
  }

  /**
   * 获取相反方向
   * @param direction 当前方向
   * @returns 相反方向
   */
  static getOppositeDirection(direction: Direction8): Direction8 {
    const opposites: Record<Direction8, Direction8> = {
      'south': 'north',
      'south-east': 'north-west',
      'east': 'west',
      'north-east': 'south-west',
      'north': 'south',
      'north-west': 'south-east',
      'west': 'east',
      'south-west': 'north-east',
    };
    return opposites[direction];
  }

  /**
   * 检查两个方向是否相邻
   * @param dir1 方向1
   * @param dir2 方向2
   * @returns 是否相邻
   */
  static areDirectionsAdjacent(dir1: Direction8, dir2: Direction8): boolean {
    const directionOrder: Direction8[] = [
      'east', 'south-east', 'south', 'south-west',
      'west', 'north-west', 'north', 'north-east'
    ];
    
    const index1 = directionOrder.indexOf(dir1);
    const index2 = directionOrder.indexOf(dir2);
    
    const diff = Math.abs(index1 - index2);
    return diff === 1 || diff === 7; // 相邻或循环相邻
  }
}
