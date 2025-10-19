// 主菜单场景
import Phaser from 'phaser';
import { SCENE_KEYS } from '@constants/gameConfig';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.MENU });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 游戏标题
    const title = this.add.text(width / 2, height / 3, '遗忘的像素魔法大陆', {
      font: '48px monospace',
      color: '#ffffff',
    });
    title.setOrigin(0.5);

    // 副标题
    const subtitle = this.add.text(width / 2, height / 3 + 60, 'Forgotten Pixel Realm', {
      font: '20px monospace',
      color: '#aaaaaa',
    });
    subtitle.setOrigin(0.5);

    // 开始游戏按钮
    const startButton = this.createButton(width / 2, height / 2 + 50, '开始游戏', () => {
      this.scene.start(SCENE_KEYS.GAME);
    });

    // 继续游戏按钮
    const continueButton = this.createButton(width / 2, height / 2 + 120, '继续游戏', () => {
      // TODO: 加载存档
      this.scene.start(SCENE_KEYS.GAME);
    });

    // 设置按钮
    const settingsButton = this.createButton(width / 2, height / 2 + 190, '设置', () => {
      // TODO: 打开设置界面
      console.log('设置');
    });

    // 退出按钮
    const exitButton = this.createButton(width / 2, height / 2 + 260, '退出游戏', () => {
      // TODO: 退出游戏
      console.log('退出');
    });

    // 版本信息
    const version = this.add.text(width - 10, height - 10, 'v0.1.0', {
      font: '12px monospace',
      color: '#666666',
    });
    version.setOrigin(1, 1);
  }

  private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);
    
    const bg = this.add.rectangle(0, 0, 200, 40, 0x333333);
    bg.setStrokeStyle(2, 0xffffff);
    
    const label = this.add.text(0, 0, text, {
      font: '16px monospace',
      color: '#ffffff',
    });
    label.setOrigin(0.5);
    
    button.add([bg, label]);
    button.setSize(200, 40);
    button.setInteractive(new Phaser.Geom.Rectangle(-100, -20, 200, 40), Phaser.Geom.Rectangle.Contains);
    
    button.on('pointerover', () => {
      bg.setFillStyle(0x555555);
    });
    
    button.on('pointerout', () => {
      bg.setFillStyle(0x333333);
    });
    
    button.on('pointerdown', callback);
    
    return button;
  }
}
