// Phaser游戏配置
import Phaser from 'phaser';
import { GAME_CONFIG } from '@constants/gameConfig';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  parent: 'game-container',
  backgroundColor: '#2d2d2d',
  pixelArt: true, // 关键：像素游戏必须开启
  antialias: false,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 }, // 俯视角无重力
      debug: true, // 开启debug模式，显示碰撞体边界
      debugShowBody: true,
      debugShowStaticBody: true,
      debugShowVelocity: true,
    },
  },
  scale: {
    mode: Phaser.Scale.ENVELOP,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
  },
};
