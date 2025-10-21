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
    // 🎨 加载真实的像素艺术角色精灵图
    
    // ========== 玩家角色（8方向）==========
    this.load.image('hero-south', '/assets/sprites/hero/south.png');
    this.load.image('hero-west', '/assets/sprites/hero/west.png');
    this.load.image('hero-east', '/assets/sprites/hero/east.png');
    this.load.image('hero-north', '/assets/sprites/hero/north.png');
    this.load.image('hero-south-east', '/assets/sprites/hero/south-east.png');
    this.load.image('hero-north-east', '/assets/sprites/hero/north-east.png');
    this.load.image('hero-north-west', '/assets/sprites/hero/north-west.png');
    this.load.image('hero-south-west', '/assets/sprites/hero/south-west.png');
    
    // ========== Chibi英雄角色（8方向）- 新！==========
    this.load.image('chibi-hero-south', '/assets/sprites/chibi_hero/south.png');
    this.load.image('chibi-hero-west', '/assets/sprites/chibi_hero/west.png');
    this.load.image('chibi-hero-east', '/assets/sprites/chibi_hero/east.png');
    this.load.image('chibi-hero-north', '/assets/sprites/chibi_hero/north.png');
    this.load.image('chibi-hero-south-east', '/assets/sprites/chibi_hero/south-east.png');
    this.load.image('chibi-hero-north-east', '/assets/sprites/chibi_hero/north-east.png');
    this.load.image('chibi-hero-north-west', '/assets/sprites/chibi_hero/north-west.png');
    this.load.image('chibi-hero-south-west', '/assets/sprites/chibi_hero/south-west.png');
    
    // ========== 史莱姆敌人（8方向）==========
    this.load.image('slime-south', '/assets/sprites/slime/south.png');
    this.load.image('slime-west', '/assets/sprites/slime/west.png');
    this.load.image('slime-east', '/assets/sprites/slime/east.png');
    this.load.image('slime-north', '/assets/sprites/slime/north.png');
    this.load.image('slime-south-east', '/assets/sprites/slime/south-east.png');
    this.load.image('slime-north-east', '/assets/sprites/slime/north-east.png');
    this.load.image('slime-north-west', '/assets/sprites/slime/north-west.png');
    this.load.image('slime-south-west', '/assets/sprites/slime/south-west.png');
    
    // ========== 骷髅战士敌人（8方向）- 新！==========
    this.load.image('skeleton-south', '/assets/sprites/skeleton/south.png');
    this.load.image('skeleton-west', '/assets/sprites/skeleton/west.png');
    this.load.image('skeleton-east', '/assets/sprites/skeleton/east.png');
    this.load.image('skeleton-north', '/assets/sprites/skeleton/north.png');
    this.load.image('skeleton-south-east', '/assets/sprites/skeleton/south-east.png');
    this.load.image('skeleton-north-east', '/assets/sprites/skeleton/north-east.png');
    this.load.image('skeleton-north-west', '/assets/sprites/skeleton/north-west.png');
    this.load.image('skeleton-south-west', '/assets/sprites/skeleton/south-west.png');
    
    // ========== 哥布林敌人（8方向）- 新！==========
    this.load.image('goblin-south', '/assets/sprites/goblin/south.png');
    this.load.image('goblin-west', '/assets/sprites/goblin/west.png');
    this.load.image('goblin-east', '/assets/sprites/goblin/east.png');
    this.load.image('goblin-north', '/assets/sprites/goblin/north.png');
    this.load.image('goblin-south-east', '/assets/sprites/goblin/south-east.png');
    this.load.image('goblin-north-east', '/assets/sprites/goblin/north-east.png');
    this.load.image('goblin-north-west', '/assets/sprites/goblin/north-west.png');
    this.load.image('goblin-south-west', '/assets/sprites/goblin/south-west.png');
    
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
    
    console.log('✅ 真实像素艺术角色已加载 (Chibi风格)');
    console.log('👾 英雄角色: hero + chibi-hero (8方向精灵图32x32px)');
    console.log('🟢 敌人角色: slime + skeleton + goblin (8方向精灵图32x32px)');
    console.log('🎮 支持: south, west, east, north + 4个对角方向');
    console.log('🎨 风格: 头大腿短的Chibi像素风格');
    console.log('💡 提示: 所有角色支持8方向移动，自动切换朝向');
  }

  create() {
    // 资源加载完成，等待 React 主菜单的指令
    // 不再自动启动 MenuScene，由 React 控制游戏启动
    console.log('游戏资源加载完成，等待开始...');
  }
}
