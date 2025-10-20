// 启动场景 - 资源预加载
import Phaser from 'phaser';
import { SCENE_KEYS } from '@constants/gameConfig';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.BOOT });
  }

  preload() {
    // 显示加载进度条
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);
    
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: '加载中...',
      style: {
        font: '20px monospace',
        color: '#ffffff',
      },
    });
    loadingText.setOrigin(0.5, 0.5);
    
    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        font: '18px monospace',
        color: '#ffffff',
      },
    });
    percentText.setOrigin(0.5, 0.5);
    
    // 加载进度监听
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);
      percentText.setText(`${Math.floor(value * 100)}%`);
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // 加载游戏资源
    this.loadAssets();
  }

  private loadAssets() {
    // 🎨 增强版临时精灵 - 使用Canvas绘制更精美的游戏元素
    
    // ========== 玩家精灵（更精致的设计）==========
    const playerCanvas = this.textures.createCanvas('player', 32, 32);
    if (playerCanvas) {
      const ctx = playerCanvas.getContext();
      // 身体（蓝色）
      ctx.fillStyle = '#3498db';
      ctx.fillRect(8, 8, 16, 20);
      // 头部（浅蓝色）
      ctx.fillStyle = '#5dade2';
      ctx.fillRect(10, 4, 12, 8);
      // 眼睛
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(12, 6, 3, 3);
      ctx.fillRect(17, 6, 3, 3);
      ctx.fillStyle = '#000000';
      ctx.fillRect(13, 7, 1, 1);
      ctx.fillRect(18, 7, 1, 1);
      // 腿
      ctx.fillStyle = '#2980b9';
      ctx.fillRect(10, 28, 4, 4);
      ctx.fillRect(18, 28, 4, 4);
      // 边框
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 1;
      ctx.strokeRect(8, 8, 16, 20);
      playerCanvas.refresh();
    }
    
    // ========== 史莱姆敌人（可爱风格）==========
    const slimeCanvas = this.textures.createCanvas('enemy-slime', 32, 32);
    if (slimeCanvas) {
      const ctx = slimeCanvas.getContext();
      // 身体（绿色半圆）
      ctx.fillStyle = '#2ecc71';
      ctx.beginPath();
      ctx.arc(16, 20, 12, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      // 底部阴影
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(6, 26, 20, 4);
      // 眼睛
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(11, 16, 3, 0, Math.PI * 2);
      ctx.arc(21, 16, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(11, 17, 1.5, 0, Math.PI * 2);
      ctx.arc(21, 17, 1.5, 0, Math.PI * 2);
      ctx.fill();
      // 高光
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(10, 12, 4, 0, Math.PI * 2);
      ctx.fill();
      slimeCanvas.refresh();
    }
    
    // ========== 哥布林敌人 ==========
    const goblinCanvas = this.textures.createCanvas('enemy-goblin', 32, 32);
    if (goblinCanvas) {
      const ctx = goblinCanvas.getContext();
      // 身体（灰绿色）
      ctx.fillStyle = '#7f8c8d';
      ctx.fillRect(8, 12, 16, 16);
      // 头部
      ctx.fillStyle = '#95a5a6';
      ctx.fillRect(10, 6, 12, 10);
      // 眼睛（红色）
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(12, 9, 3, 2);
      ctx.fillRect(17, 9, 3, 2);
      // 武器（灰色）
      ctx.fillStyle = '#34495e';
      ctx.fillRect(4, 14, 4, 8);
      ctx.fillRect(24, 14, 4, 8);
      goblinCanvas.refresh();
    }
    
    // ========== 草地贴图（带纹理）==========
    const grassCanvas = this.textures.createCanvas('ground', 64, 64);
    if (grassCanvas) {
      const ctx = grassCanvas.getContext();
      // 基础绿色
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(0, 0, 64, 64);
      // 深色草丛（随机）
      ctx.fillStyle = '#229954';
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * 64;
        const y = Math.random() * 64;
        ctx.fillRect(x, y, 2, 2);
      }
      // 浅色点缀
      ctx.fillStyle = '#58d68d';
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * 64;
        const y = Math.random() * 64;
        ctx.fillRect(x, y, 1, 1);
      }
      grassCanvas.refresh();
    }
    
    // ========== 石头 ==========
    const rockCanvas = this.textures.createCanvas('rock', 32, 32);
    if (rockCanvas) {
      const ctx = rockCanvas.getContext();
      // 石头本体
      ctx.fillStyle = '#95a5a6';
      ctx.beginPath();
      ctx.moveTo(16, 8);
      ctx.lineTo(24, 16);
      ctx.lineTo(20, 26);
      ctx.lineTo(12, 26);
      ctx.lineTo(8, 16);
      ctx.closePath();
      ctx.fill();
      // 阴影
      ctx.fillStyle = '#7f8c8d';
      ctx.beginPath();
      ctx.moveTo(16, 16);
      ctx.lineTo(20, 26);
      ctx.lineTo(12, 26);
      ctx.closePath();
      ctx.fill();
      // 高光
      ctx.fillStyle = '#bdc3c7';
      ctx.fillRect(14, 10, 4, 4);
      rockCanvas.refresh();
    }
    
    // ========== 树（更精致）==========
    const treeCanvas = this.textures.createCanvas('tree', 32, 48);
    if (treeCanvas) {
      const ctx = treeCanvas.getContext();
      // 树冠（深绿色）
      ctx.fillStyle = '#27ae60';
      ctx.beginPath();
      ctx.arc(16, 16, 14, 0, Math.PI * 2);
      ctx.fill();
      // 树冠高光
      ctx.fillStyle = '#2ecc71';
      ctx.beginPath();
      ctx.arc(12, 12, 6, 0, Math.PI * 2);
      ctx.fill();
      // 树冠细节
      ctx.fillStyle = '#229954';
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const x = 16 + Math.cos(angle) * 10;
        const y = 16 + Math.sin(angle) * 10;
        ctx.fillRect(x, y, 2, 2);
      }
      // 树干
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(10, 24, 12, 20);
      // 树干纹理
      ctx.fillStyle = '#654321';
      ctx.fillRect(11, 28, 2, 4);
      ctx.fillRect(11, 36, 2, 4);
      treeCanvas.refresh();
    }
    
    // ========== 宝箱 ==========
    const chestCanvas = this.textures.createCanvas('chest', 32, 32);
    if (chestCanvas) {
      const ctx = chestCanvas.getContext();
      // 箱体（棕色）
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(6, 16, 20, 14);
      // 盖子
      ctx.fillStyle = '#a0522d';
      ctx.fillRect(6, 12, 20, 6);
      // 锁
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(14, 18, 4, 4);
      ctx.fillRect(15, 22, 2, 3);
      // 边框
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 1;
      ctx.strokeRect(6, 12, 20, 18);
      chestCanvas.refresh();
    }
    
    // ========== 金币 ==========
    const coinCanvas = this.textures.createCanvas('coin', 16, 16);
    if (coinCanvas) {
      const ctx = coinCanvas.getContext();
      // 金币
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.arc(8, 8, 6, 0, Math.PI * 2);
      ctx.fill();
      // 高光
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(6, 6, 3, 0, Math.PI * 2);
      ctx.fill();
      // 阴影
      ctx.fillStyle = '#d68910';
      ctx.beginPath();
      ctx.arc(10, 10, 2, 0, Math.PI * 2);
      ctx.fill();
      coinCanvas.refresh();
    }
    
    // ========== 心形生命值 ==========
    const heartCanvas = this.textures.createCanvas('heart', 16, 16);
    if (heartCanvas) {
      const ctx = heartCanvas.getContext();
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.moveTo(8, 13);
      ctx.bezierCurveTo(8, 11, 6, 9, 4, 9);
      ctx.bezierCurveTo(1, 9, 1, 12, 1, 12);
      ctx.bezierCurveTo(1, 14, 8, 15, 8, 15);
      ctx.bezierCurveTo(8, 15, 15, 14, 15, 12);
      ctx.bezierCurveTo(15, 12, 15, 9, 12, 9);
      ctx.bezierCurveTo(10, 9, 8, 11, 8, 13);
      ctx.fill();
      heartCanvas.refresh();
    }
    
    console.log('✅ 增强版彩色精灵已创建');
    console.log('📦 包含: 玩家、敌人(史莱姆/哥布林)、环境、道具');
    console.log('💡 提示: 查看 docs/资源更新指南.md 了解如何添加真实精灵图');
    
    // 🔥 当你准备好真实资源后，使用以下代码替换上面的临时方案：
    /*
    this.load.image('player', '/assets/sprites/player/idle.png');
    this.load.image('enemy', '/assets/sprites/enemies/slime.png');
    this.load.image('ground', '/assets/tilesets/grass.png');
    this.load.image('tree', '/assets/sprites/environment/tree.png');
    
    // 如果使用精灵表（动画）
    this.load.spritesheet('player-walk', '/assets/sprites/player/walk.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    */
  }

  create() {
    // 资源加载完成，等待 React 主菜单的指令
    // 不再自动启动 MenuScene，由 React 控制游戏启动
    console.log('游戏资源加载完成，等待开始...');
  }
}
