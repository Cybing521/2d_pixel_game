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
  private respawnPoint: { x: number; y: number } = { x: 400, y: 300 }; // 复活点
  private village: { x: number; y: number; radius: number } = { x: 400, y: 300, radius: 150 }; // 村庄

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
    
    // 创建村庄标记
    this.createVillage();

    // 创建玩家
    this.player = new Player(this, 400, 300);
    
    // 创建敌人组
    this.enemies = this.add.group();
    
    // 生成敌人
    this.spawnEnemies();
    
    // 设置碰撞（使用collider防止穿模）
    this.physics.add.collider(this.player, this.enemies);

    // 初始化迷雾系统
    this.fogSystem = new FogSystem(this, this.player);
    
    // 监听敌人死亡事件
    this.events.on('enemy-killed', this.onEnemyKilled, this);
    
    // 监听玩家攻击事件
    this.events.on('player-attack', this.onPlayerAttack, this);
    
    // 监听玩家死亡事件
    this.events.on('player-died', this.onPlayerDied, this);

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
  
  private createVillage() {
    const { x, y, radius } = this.village;
    
    // 村庄安全区域（黄色圆圈）
    const villageCircle = this.add.circle(x, y, radius, 0xffff00, 0.1);
    villageCircle.setStrokeStyle(3, 0xffff00, 0.5);
    villageCircle.setDepth(-1);
    
    // 村庄标记文字
    const villageText = this.add.text(x, y - radius - 30, '🏘️ 起始村庄', {
      fontSize: '24px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    villageText.setOrigin(0.5);
    villageText.setDepth(10);
    
    // 复活点标记（中心点）
    const respawnMarker = this.add.circle(x, y, 8, 0xffff00, 1);
    respawnMarker.setStrokeStyle(2, 0xffffff);
    respawnMarker.setDepth(10);
    
    // 脉动效果
    this.tweens.add({
      targets: respawnMarker,
      scale: 1.5,
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });
    
    // 添加提示文字（靠近时显示）
    const hintText = this.add.text(x, y + radius + 20, '安全区域 - 敌人不会进入', {
      fontSize: '16px',
      color: '#ffff00',
      fontStyle: 'italic',
    });
    hintText.setOrigin(0.5);
    hintText.setAlpha(0.7);
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

    // 在不同位置生成敌人（远离村庄）
    const spawnPositions = [
      { x: 700, y: 400 },   // 东侧
      { x: 900, y: 600 },   // 东南
      { x: 600, y: 800 },   // 南侧
    ];

    enemyTypes.forEach((enemyData, index) => {
      const pos = spawnPositions[index];
      
      // 确保敌人不在村庄安全区生成
      const distanceToVillage = Phaser.Math.Distance.Between(
        pos.x, pos.y, 
        this.village.x, this.village.y
      );
      
      if (distanceToVillage > this.village.radius) {
        const enemy = new Enemy(this, pos.x, pos.y, enemyData);
        this.enemies.add(enemy);
      }
    });

    console.log(`生成了 ${this.enemies.getLength()} 个敌人（村庄外）`);
  }
  
  private isInVillage(x: number, y: number): boolean {
    const distance = Phaser.Math.Distance.Between(x, y, this.village.x, this.village.y);
    return distance < this.village.radius;
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

  private onPlayerDied() {
    console.log('玩家死亡，3秒后在复活点复活...');
    
    // 显示死亡提示
    const deathText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      '你死了...\n\n3秒后复活',
      {
        fontSize: '32px',
        color: '#ff0000',
        fontStyle: 'bold',
        align: 'center',
      }
    );
    deathText.setOrigin(0.5);
    deathText.setScrollFactor(0);
    deathText.setDepth(2000);
    
    // 3秒后复活
    this.time.delayedCall(3000, () => {
      deathText.destroy();
      this.respawnPlayer();
    });
  }
  
  private respawnPlayer() {
    // 复活玩家
    this.player.setPosition(this.respawnPoint.x, this.respawnPoint.y);
    this.player.respawn();
    
    // 恢复满血
    const store = useGameStore.getState();
    store.updatePlayerStats({ 
      health: store.player.maxHealth,
      mana: store.player.maxMana || store.player.maxMana,
    });
    
    // 清除所有敌人
    this.enemies.clear(true, true);
    
    // 重新生成敌人
    this.spawnEnemies();
    
    console.log('玩家已在复活点复活');
  }

  private onEnemyKilled(data: { enemyId: string; expReward: number }) {
    // 玩家获得经验
    const store = useGameStore.getState();
    const currentExp = store.player.exp;
    const newExp = currentExp + data.expReward;
    
    store.updatePlayerStats({ exp: newExp });
    
    console.log(`获得 ${data.expReward} 经验值，当前经验：${newExp}/${store.player.expToNextLevel}`);
    
    // 检查升级
    this.checkLevelUp();
  }
  
  private checkLevelUp() {
    const store = useGameStore.getState();
    const player = store.player;
    
    if (player.exp >= player.expToNextLevel) {
      this.levelUp();
    }
  }
  
  private levelUp() {
    const store = useGameStore.getState();
    const player = store.player;
    
    // 升级
    const newLevel = player.level + 1;
    const remainingExp = player.exp - player.expToNextLevel;
    const newExpToNextLevel = this.calculateExpToNextLevel(newLevel);
    
    // 提升属性
    const newMaxHealth = player.maxHealth + 10;
    const newMaxMana =(player.maxMana??0) +5;
    
    store.updatePlayerStats({
      level: newLevel,
      exp: remainingExp,
      expToNextLevel: newExpToNextLevel,
      maxHealth: newMaxHealth,
      maxMana: newMaxMana,
      health: newMaxHealth,  // 升级回满血
      mana: newMaxMana,      // 升级回满蓝
    });
    
    // 升级特效
    const levelUpText = this.add.text(
      this.player.x,
      this.player.y - 50,
      `升级！Lv.${newLevel}`,
      {
        fontSize: '32px',
        color: '#ffff00',
        fontStyle: 'bold',
        stroke: '#ff0000',
        strokeThickness: 4,
      }
    );
    levelUpText.setOrigin(0.5);
    levelUpText.setDepth(1000);
    
    // 升级动画
    this.tweens.add({
      targets: levelUpText,
      y: levelUpText.y - 80,
      alpha: 0,
      scale: 1.5,
      duration: 2000,
      onComplete: () => {
        levelUpText.destroy();
      },
    });
    
    // 升级光效
    const levelUpCircle = this.add.circle(this.player.x, this.player.y, 10, 0xffff00, 0.8);
    levelUpCircle.setDepth(999);
    
    this.tweens.add({
      targets: levelUpCircle,
      scale: 10,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        levelUpCircle.destroy();
      },
    });
    
    console.log(`🎉 升级到 Lv.${newLevel}！HP: ${newMaxHealth}, MP: ${newMaxMana}`);
  }
  
  private calculateExpToNextLevel(level: number): number {
    // 经验值公式：100 * 1.5^(level-1)
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  update(time: number, delta: number) {
    // 更新玩家
    this.player.update(time, delta);
    
    // 更新所有敌人
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy instanceof Enemy) {
        enemy.update(time, delta, this.player);
        
        // 检查敌人是否试图进入村庄
        if (this.isInVillage(enemy.x, enemy.y)) {
          // 将敌人推出村庄
          const angle = Phaser.Math.Angle.Between(
            this.village.x, this.village.y,
            enemy.x, enemy.y
          );
          
          // 计算边界位置
          const pushX = this.village.x + Math.cos(angle) * this.village.radius;
          const pushY = this.village.y + Math.sin(angle) * this.village.radius;
          
          enemy.setPosition(pushX, pushY);
          enemy.setVelocity(0, 0);
        }
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
