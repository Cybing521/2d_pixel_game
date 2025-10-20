// 主游戏场景
import Phaser from 'phaser';
import { SCENE_KEYS, GAME_CONFIG } from '@constants/gameConfig';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { FogSystem } from '../systems/FogSystem';
import { useGameStore } from '@store/gameStore';
import type { EnemyData } from '@/types/entities';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.GameObjects.Group;
  private fogSystem!: FogSystem;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private lastExploredTile: string = '';

  constructor() {
    super({ key: SCENE_KEYS.GAME });
  }

  create() {
    // 启动UI场景（作为覆盖层）
    this.scene.launch(SCENE_KEYS.UI);

    // 创建世界边界
    this.physics.world.setBounds(0, 0, 2000, 2000);

    // 创建简单的地面
    this.createGround();

    // 创建玩家
    this.player = new Player(this, 400, 300);
    
    // 创建敌人组
    this.enemies = this.add.group();
    
    // 生成敌人
    this.spawnEnemies();
    
    // 设置碰撞
    this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemyCollision as any, undefined, this);

    // 初始化迷雾系统
    this.fogSystem = new FogSystem(this, this.player);
    
    // 监听敌人死亡事件
    this.events.on('enemy-killed', this.onEnemyKilled, this);
    
    // 监听玩家攻击事件
    this.events.on('player-attack', this.onPlayerAttack, this);

    // 相机跟随
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(GAME_CONFIG.ZOOM);
    this.cameras.main.setBounds(0, 0, 2000, 2000);

    // 输入控制
    this.cursors = this.input.keyboard!.createCursorKeys();

    // ESC键暂停
    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.pause(SCENE_KEYS.UI);
      // TODO: 显示暂停菜单
    });
  }

  private createGround() {
    // 创建简单的格子地面
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);

    for (let x = 0; x <= 2000; x += GAME_CONFIG.TILE_SIZE) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, 2000);
    }

    for (let y = 0; y <= 2000; y += GAME_CONFIG.TILE_SIZE) {
      graphics.moveTo(0, y);
      graphics.lineTo(2000, y);
    }

    graphics.strokePath();
  }

  private spawnEnemies() {
    // 生成几个测试敌人
    const enemyTypes: EnemyData[] = [
      {
        id: 'fog_wisp_1',
        name: '迷雾幽灵',
        type: 'basic',
        health: 30,
        maxHealth: 30,
        attack: 5,
        defense: 2,
        speed: 50,
        aiType: 'patrol',
        expReward: 10,
        dropTable: [],
      },
      {
        id: 'shadow_wolf_1',
        name: '暗影之狼',
        type: 'aggressive',
        health: 50,
        maxHealth: 50,
        attack: 10,
        defense: 5,
        speed: 80,
        aiType: 'aggressive',
        expReward: 20,
        dropTable: [],
      },
      {
        id: 'fog_wisp_2',
        name: '迷雾幽灵',
        type: 'basic',
        health: 30,
        maxHealth: 30,
        attack: 5,
        defense: 2,
        speed: 50,
        aiType: 'patrol',
        expReward: 10,
        dropTable: [],
      },
    ];

    // 在不同位置生成敌人
    const spawnPositions = [
      { x: 600, y: 400 },
      { x: 800, y: 600 },
      { x: 500, y: 700 },
    ];

    enemyTypes.forEach((enemyData, index) => {
      const pos = spawnPositions[index];
      const enemy = new Enemy(this, pos.x, pos.y, enemyData);
      this.enemies.add(enemy);
    });

    console.log(`生成了 ${enemyTypes.length} 个敌人`);
  }

  private handlePlayerEnemyCollision() {
    // 碰撞已经在Enemy的update中处理了
    // 这里可以添加额外的碰撞效果
  }

  private onPlayerAttack(data: { x: number; y: number; range: number; damage: number }) {
    // 检测范围内的敌人
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy instanceof Enemy && !enemy.isDying()) {
        const distance = Phaser.Math.Distance.Between(data.x, data.y, enemy.x, enemy.y);
        
        if (distance < data.range) {
          // 对敌人造成伤害
          enemy.takeDamage(data.damage);
        }
      }
    });
  }

  private onEnemyKilled(data: { enemyId: string; expReward: number }) {
    // 玩家获得经验
    const store = useGameStore.getState();
    const currentExp = store.player.exp;
    store.updatePlayerStats({ exp: currentExp + data.expReward });
    
    console.log(`获得 ${data.expReward} 经验值`);
    
    // TODO: 检查升级
    // TODO: 处理掉落物品
  }

  update(time: number, delta: number) {
    // 更新玩家
    this.player.update(time, delta);
    
    // 更新所有敌人
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy instanceof Enemy) {
        enemy.update(time, delta, this.player);
      }
    });

    // 更新迷雾
    this.fogSystem.update(time, delta);
    
    // 更新玩家位置到store
    const playerX = this.player.x;
    const playerY = this.player.y;
    useGameStore.getState().updatePlayerPosition(playerX, playerY);
    
    // 记录探索区域（每64像素为一个区域）
    const tileX = Math.floor(playerX / 64);
    const tileY = Math.floor(playerY / 64);
    const currentTile = `${tileX}-${tileY}`;
    
    if (currentTile !== this.lastExploredTile) {
      useGameStore.getState().addExploredArea(playerX, playerY);
      this.lastExploredTile = currentTile;
    }
  }
}
