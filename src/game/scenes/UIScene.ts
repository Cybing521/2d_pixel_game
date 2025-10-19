// UI覆盖层场景
// 注意：血条已由React HUD显示，此场景暂时用于其他Phaser UI元素
import Phaser from 'phaser';
import { SCENE_KEYS } from '@constants/gameConfig';

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.UI });
  }

  create() {
    // React HUD已经处理了血条和魔力条显示
    // 这里可以添加其他需要Phaser渲染的UI元素
    // 例如：伤害数字、特效等
  }
}
