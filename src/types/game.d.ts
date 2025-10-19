// 游戏核心类型定义

export interface GameConfig {
  width: number;
  height: number;
  pixelArt: boolean;
  physics: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type ElementType = 'fire' | 'ice' | 'thunder' | 'nature';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface GameTime {
  now: number;
  delta: number;
}
