// 主游戏场景
import Phaser from 'phaser';
import { SCENE_KEYS, GAME_CONFIG } from '@constants/gameConfig';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { FogSystem } from '../systems/FogSystem';
import { ChunkManager } from '../systems/ChunkManager';
import { useGameStore } from '@store/gameStore';
import type { EnemyData } from '@/types/entities';
import { LevelSystem } from '@/systems/LevelSystem';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.GameObjects.Group;
  private fogSystem!: FogSystem;
  private chunkManager!: ChunkManager;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private lastExploredTile: string = '';
  private performanceStats = { fps: 0, chunks: 0, enemies: 0 };
  private respawnPoint: { x: number; y: number } = { x: 400, y: 300 }; // 复活点
  private villages: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    radius: number;
    size: 'small' | 'medium' | 'large';
    unlocked: boolean;
    hasSpring: boolean;
    hasTeleport: boolean;
  }> = []; // 村庄列表
  private currentVillage: string | null = null; // 当前所在村庄
  private trajectoryTimer: number = 0; // 轨迹记录计时器
  private trajectoryInterval: number = 1000; // 轨迹记录间隔（毫秒）
  private enemyRespawnTimer: number = 0; // 怪物重生计时器
  private enemyRespawnInterval: number = 5000; // 怪物重生间隔（5秒）
  private maxEnemies: number = 15; // 最大怪物数量
  private minEnemies: number = 8; // 最小怪物数量（低于此值开始生成）

  constructor() {
    super({ key: SCENE_KEYS.GAME });
  }

  create() {
    // 启动UI场景（作为覆盖层）
    this.scene.launch(SCENE_KEYS.UI);

    // 创建世界边界（10倍大地图）
    this.physics.world.setBounds(0, 0, GAME_CONFIG.WORLD_WIDTH, GAME_CONFIG.WORLD_HEIGHT);

    // 初始化ChunkManager（分块加载系统）
    this.chunkManager = new ChunkManager(this, GAME_CONFIG.CHUNK_SIZE);
    
    // 监听chunk事件生成敌人
    this.events.on('spawn-enemy-at', this.spawnEnemyAt, this);
    this.events.on('unload-chunk-enemies', this.unloadChunkEnemies, this);
    
    // 初始化村庄系统
    this.initializeVillages();
    
    // 创建村庄标记
    this.createVillages();

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
    this.cameras.main.setBounds(0, 0, GAME_CONFIG.WORLD_WIDTH, GAME_CONFIG.WORLD_HEIGHT);
    
    console.log('🗺️  大地图系统已启用');
    console.log(`📏 世界大小: ${GAME_CONFIG.WORLD_WIDTH}x${GAME_CONFIG.WORLD_HEIGHT}`);
    console.log(`📦 Chunk大小: ${GAME_CONFIG.CHUNK_SIZE}x${GAME_CONFIG.CHUNK_SIZE}`);

    // 输入控制
    this.cursors = this.input.keyboard!.createCursorKeys();

    // ESC键暂停
    this.input.keyboard?.on('keydown-ESC', () => {
      console.log('ESC pressed - pause game');
    });
    
    // T键传送
    this.input.keyboard?.on('keydown-T', () => {
      this.handleTeleport();
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
  
  private initializeVillages() {
    // 初始化所有村庄
    this.villages = [
      {
        id: 'starter_village',
        name: '起始村庄',
        x: 400,
        y: 300,
        radius: 150,
        size: 'medium',
        unlocked: true,  // 初始解锁
        hasSpring: true,  // 有泉水
        hasTeleport: false,  // 没有传送门（起始村庄）
      },
      {
        id: 'forest_village',
        name: '森林村庄',
        x: 1200,
        y: 800,
        radius: 100,
        size: 'small',
        unlocked: false,  // 需要探索解锁
        hasSpring: true,
        hasTeleport: true,
      },
      {
        id: 'mountain_village',
        name: '山脚村庄',
        x: 800,
        y: 1500,
        radius: 200,
        size: 'large',
        unlocked: false,
        hasSpring: true,
        hasTeleport: true,
      },
    ];
  }
  
  private createVillages() {
    this.villages.forEach(village => {
      if (!village.unlocked) return; // 只创建已解锁的村庄
      
      const { x, y, radius, name, hasSpring } = village;
      
      // 村庄安全区域（黄色圆圈）
      const villageCircle = this.add.circle(x, y, radius, 0xffff00, 0.1);
      villageCircle.setStrokeStyle(3, 0xffff00, 0.5);
      villageCircle.setDepth(-1);
      
      // 村庄标记文字
      const sizeLabel = village.size === 'large' ? '大' : village.size === 'medium' ? '中' : '小';
      const villageText = this.add.text(x, y - radius - 30, `🏘️ ${name} [${sizeLabel}]`, {
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
      
      // 泉水（如果有）
      if (hasSpring) {
        this.createSpring(x, y);
      }
      
      // 传送点（如果有）
      if (village.hasTeleport) {
        this.createTeleportPoint(x, y + 40, village.id);
      }
      
      // 添加提示文字
      let hints = ['安全区域'];
      if (hasSpring) hints.push('泉水回血');
      if (village.hasTeleport) hints.push('按T传送');
      
      const hintText = this.add.text(x, y + radius + 20, hints.join(' | '), {
        fontSize: '16px',
        color: '#ffff00',
        fontStyle: 'italic',
      });
      hintText.setOrigin(0.5);
      hintText.setAlpha(0.7);
    });
  }
  
  private createTeleportPoint(x: number, y: number, _villageId: string) {
    // 传送点底座
    const teleportBase = this.add.circle(x, y, 25, 0xff00ff, 0.3);
    teleportBase.setStrokeStyle(3, 0xff00ff);
    teleportBase.setDepth(5);
    
    // 传送点图标
    const teleportIcon = this.add.text(x, y, '🌀', {
      fontSize: '40px',
    });
    teleportIcon.setOrigin(0.5);
    teleportIcon.setDepth(6);
    
    // 传送点旋转动画
    this.tweens.add({
      targets: teleportIcon,
      angle: 360,
      duration: 3000,
      repeat: -1,
    });
    
    // 传送点脉动效果
    this.tweens.add({
      targets: [teleportBase, teleportIcon],
      scale: 1.1,
      alpha: 0.7,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });
    
    // 传送点标签
    const teleportLabel = this.add.text(x, y + 40, '传送点 (按T)', {
      fontSize: '14px',
      color: '#ff00ff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    });
    teleportLabel.setOrigin(0.5);
    teleportLabel.setDepth(6);
  }
  
  private createSpring(x: number, y: number) {
    // 泉水特效（蓝色圆圈）
    const spring = this.add.circle(x, y - 30, 20, 0x00ffff, 0.3);
    spring.setStrokeStyle(2, 0x00ffff);
    spring.setDepth(5);
    
    // 泉水图标
    const springText = this.add.text(x, y - 30, '💧', {
      fontSize: '32px',
    });
    springText.setOrigin(0.5);
    springText.setDepth(6);
    
    // 泉水脉动效果
    this.tweens.add({
      targets: [spring, springText],
      scale: 1.2,
      alpha: 0.8,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });
    
    // 泉水说明
    const springLabel = this.add.text(x, y - 60, '泉水 (自动回血)', {
      fontSize: '14px',
      color: '#00ffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    });
    springLabel.setOrigin(0.5);
    springLabel.setDepth(6);
  }

  private spawnEnemies(count?: number) {
    // 如果没有指定数量，生成到最大数量
    const targetCount = count || this.maxEnemies;
    const currentCount = this.enemies.getLength();
    const spawnCount = Math.min(targetCount - currentCount, targetCount);
    
    if (spawnCount <= 0) return;

    // 敌人类型模板（权重系统）
    const enemyTemplates = [
      {
        name: '迷雾幽灵',
        type: 'basic' as const,
        health: 30,
        maxHealth: 30,
        attack: 5,
        defense: 2,
        speed: 50,
        aiType: 'patrol' as const,
        expReward: 10,
        weight: 50, // 权重：50%
      },
      {
        name: '暗影之狼',
        type: 'aggressive' as const,
        health: 50,
        maxHealth: 50,
        attack: 10,
        defense: 5,
        speed: 80,
        aiType: 'aggressive' as const,
        expReward: 20,
        weight: 30, // 权重：30%
      },
      {
        name: '迷雾蝙蝠',
        type: 'basic' as const,
        health: 20,
        maxHealth: 20,
        attack: 3,
        defense: 1,
        speed: 100,
        aiType: 'patrol' as const,
        expReward: 8,
        weight: 20, // 权重：20%
      },
    ];

    let spawned = 0;
    let attempts = 0;
    const maxAttempts = spawnCount * 10; // 防止死循环

    while (spawned < spawnCount && attempts < maxAttempts) {
      attempts++;
      
      // 随机选择敌人类型（基于权重）
      const template = this.getRandomEnemyTemplate(enemyTemplates);
      
      // 随机生成位置（在世界范围内，但远离村庄和玩家）
      const pos = this.getRandomSpawnPosition();
      
      if (!pos) continue; // 没有合适的位置
      
      // 创建敌人数据
      const enemyData: EnemyData = {
        id: `enemy_${Date.now()}_${spawned}`,
        name: template.name,
        type: template.type,
        health: template.health,
        maxHealth: template.maxHealth,
        attack: template.attack,
        defense: template.defense,
        speed: template.speed,
        aiType: template.aiType,
        expReward: template.expReward,
        dropTable: [],
      };
      
      // 生成敌人
      const enemy = new Enemy(this, pos.x, pos.y, enemyData);
      enemy.setData('id', enemyData.id);
      enemy.setData('name', enemyData.name);
      this.enemies.add(enemy);
      spawned++;
    }

    console.log(`🐺 生成了 ${spawned} 个敌人，当前总数：${this.enemies.getLength()}`);
  }
  
  /**
   * 基于权重随机选择敌人模板
   */
  private getRandomEnemyTemplate(templates: Array<{ weight: number; [key: string]: any }>) {
    const totalWeight = templates.reduce((sum, t) => sum + t.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const template of templates) {
      random -= template.weight;
      if (random <= 0) {
        return template;
      }
    }
    
    return templates[0]; // fallback
  }
  
  /**
   * 获取随机生成位置（避开村庄和玩家）
   */
  private getRandomSpawnPosition(): { x: number; y: number } | null {
    const worldBounds = { minX: 100, maxX: 1900, minY: 100, maxY: 1900 };
    const minDistanceFromPlayer = 300; // 距离玩家至少300px
    const minDistanceFromVillage = 200; // 距离村庄至少200px
    
    for (let i = 0; i < 50; i++) { // 最多尝试50次
      const x = Phaser.Math.Between(worldBounds.minX, worldBounds.maxX);
      const y = Phaser.Math.Between(worldBounds.minY, worldBounds.maxY);
      
      // 检查是否距离玩家太近
      const distToPlayer = Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y);
      if (distToPlayer < minDistanceFromPlayer) continue;
      
      // 检查是否在村庄安全区内
      const isInVillage = this.villages.some(village => {
        if (!village.unlocked) return false;
        const dist = Phaser.Math.Distance.Between(x, y, village.x, village.y);
        return dist < village.radius + minDistanceFromVillage;
      });
      
      if (!isInVillage) {
        return { x, y };
      }
    }
    
    return null; // 找不到合适位置
  }
  
  /**
   * 检查并重新生成敌人
   */
  private checkAndRespawnEnemies() {
    const currentCount = this.enemies.getLength();
    
    // 如果怪物数量低于最小值，生成新怪物
    if (currentCount < this.minEnemies) {
      const spawnCount = this.maxEnemies - currentCount;
      console.log(`⚡ 怪物数量过低 (${currentCount}/${this.minEnemies})，生成 ${spawnCount} 个新怪物`);
      this.spawnEnemies(spawnCount);
    }
  }
  
  /**
   * 在指定位置生成敌人（用于Chunk系统）
   */
  private spawnEnemyAt(x: number, y: number) {
    // 敌人类型模板（简化版）
    const enemyTemplates = [
      {
        id: 'slime',
        name: '史莱姆',
        health: 50,
        attack: 8,
        speed: 60,
        aiType: 'patrol' as const,
        expReward: 15,
        dropTable: [],
      },
      {
        id: 'skeleton',
        name: '骷髅战士',
        health: 100,
        attack: 15,
        speed: 80,
        aiType: 'aggressive' as const,
        expReward: 25,
        dropTable: [],
      },
      {
        id: 'goblin',
        name: '哥布林',
        health: 60,
        attack: 10,
        speed: 100,
        aiType: 'patrol' as const,
        expReward: 18,
        dropTable: [],
      },
    ];
    
    // 随机选择敌人类型
    const template = Phaser.Utils.Array.GetRandom(enemyTemplates);
    
    const enemyData: EnemyData = {
      id: template.id,
      name: template.name,
      type: 'basic',
      health: template.health,
      maxHealth: template.health,
      attack: template.attack,
      defense: 2,
      speed: template.speed,
      aiType: template.aiType,
      expReward: template.expReward,
      dropTable: template.dropTable,
    };
    
    const enemy = new Enemy(this, x, y, enemyData);
    this.enemies.add(enemy);
    
    // 设置碰撞
    this.physics.add.collider(this.player, enemy);
  }
  
  /**
   * 卸载chunk时移除该chunk的敌人
   */
  private unloadChunkEnemies(chunkKey: string) {
    // 暂时不做特殊处理，让敌人自然存在
    // 后续可以根据chunk添加标记来清理远离的敌人
    console.log(`🗑️  Chunk ${chunkKey} 敌人处理（保留）`);
  }
  
  private isInVillage(x: number, y: number): { inVillage: boolean; villageId?: string } {
    for (const village of this.villages) {
      if (!village.unlocked) continue;
      const distance = Phaser.Math.Distance.Between(x, y, village.x, village.y);
      if (distance < village.radius) {
        return { inVillage: true, villageId: village.id };
      }
    }
    return { inVillage: false };
  }
  
  private healPlayerInSpring(_village: typeof this.villages[0], delta: number) {
    const store = useGameStore.getState();
    const currentHealth = store.player.health;
    const maxHealth = store.player.maxHealth;
    
    // 如果未满血，每秒回复5点生命值
    if (currentHealth < maxHealth) {
      const healRate = 5; // 每秒回复量
      const healAmount = (healRate * delta) / 1000;
      const newHealth = Math.min(maxHealth, currentHealth + healAmount);
      
      store.updatePlayerStats({ health: newHealth });
      
      // 每次整数变化时显示回血提示（但不要太频繁）
      const oldHealthInt = Math.floor(currentHealth);
      const newHealthInt = Math.floor(newHealth);
      
      if (newHealthInt > oldHealthInt) {
        // 显示实际回复的整数值
        const displayHeal = newHealthInt - oldHealthInt;
        this.showFloatingText(this.player.x, this.player.y - 40, `+${displayHeal}`, '#00ff00');
      }
    }
  }
  
  private showFloatingText(x: number, y: number, text: string, color: string) {
    const floatingText = this.add.text(x, y, text, {
      fontSize: '18px',
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    floatingText.setOrigin(0.5);
    floatingText.setDepth(1000);
    
    this.tweens.add({
      targets: floatingText,
      y: floatingText.y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => {
        floatingText.destroy();
      },
    });
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
    // 清除所有敌人（先清除，避免复活后立刻被攻击）
    this.enemies.clear(true, true);
    
    // 复活玩家
    this.player.setPosition(this.respawnPoint.x, this.respawnPoint.y);
    this.player.respawn();
    
    // 恢复满血
    const store = useGameStore.getState();
    store.updatePlayerStats({ 
      health: store.player.maxHealth,
      mana: store.player.maxMana || 0,
    });
    
    // 给予短暂无敌时间（3秒），然后重新生成敌人
    this.time.delayedCall(3000, () => {
      this.spawnEnemies();
      console.log('✅ 敌人已重新生成');
    });
    
    // 显示复活提示
    this.showFloatingText(
      this.respawnPoint.x, 
      this.respawnPoint.y - 50, 
      '复活成功！', 
      '#00ff00'
    );
    
    console.log('💚 玩家已在复活点复活，3秒后敌人将重新出现');
  }

  private onEnemyKilled(data: { enemyId: string; expReward: number }) {
    // 使用LevelSystem处理经验值和升级
    const leveledUp = LevelSystem.addExp(data.expReward);
    
    if (leveledUp) {
      console.log('🎉 玩家升级！');
      
      // 升级时给予技能点
      const player = useGameStore.getState().player;
      useGameStore.getState().addSkillPoints(1); // 每级+1技能点
      
      console.log(`获得1技能点！当前等级：${player.level}`);
    } else {
      const progress = useGameStore.getState().progress;
      console.log(`获得 ${data.expReward} 经验值，当前经验：${progress.exp}/${progress.expToNextLevel}`);
    }
  }

  update(time: number, delta: number) {
    // 更新ChunkManager（分块加载系统）
    this.chunkManager.update(this.player.x, this.player.y);
    
    // 更新性能统计
    this.performanceStats.fps = Math.round(this.game.loop.actualFps);
    this.performanceStats.chunks = this.chunkManager.getLoadedChunkCount();
    this.performanceStats.enemies = this.enemies.getLength();
    
    // 更新玩家
    this.player.update(time, delta);
    
    // 更新所有敌人
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy instanceof Enemy) {
        enemy.update(time, delta, this.player);
        
        // 检查敌人是否试图进入村庄
        const villageCheck = this.isInVillage(enemy.x, enemy.y);
        if (villageCheck.inVillage && villageCheck.villageId) {
          // 找到对应的村庄
          const village = this.villages.find(v => v.id === villageCheck.villageId);
          if (village) {
            // 将敌人推出村庄
            const angle = Phaser.Math.Angle.Between(
              village.x, village.y,
              enemy.x, enemy.y
            );
            
            // 计算边界位置
            const pushX = village.x + Math.cos(angle) * village.radius;
            const pushY = village.y + Math.sin(angle) * village.radius;
            
            enemy.setPosition(pushX, pushY);
            enemy.setVelocity(0, 0);
          }
        }
      }
    });

    // 更新迷雾
    this.fogSystem.update(time, delta);
    
    // 更新玩家位置到store
    const playerX = this.player.x;
    const playerY = this.player.y;
    useGameStore.getState().updatePlayerPosition(playerX, playerY);
    
    // 定期记录轨迹（每秒一次）
    this.trajectoryTimer += delta;
    if (this.trajectoryTimer >= this.trajectoryInterval) {
      useGameStore.getState().addTrajectoryPoint(playerX, playerY);
      this.trajectoryTimer = 0;
    }
    
    // 定期检查并重生怪物（每5秒检查一次）
    this.enemyRespawnTimer += delta;
    if (this.enemyRespawnTimer >= this.enemyRespawnInterval) {
      this.checkAndRespawnEnemies();
      this.enemyRespawnTimer = 0;
    }
    
    // 更新敌人位置到store
    const enemiesData = this.enemies.getChildren().map((enemy) => {
      if (enemy instanceof Enemy) {
        return {
          id: enemy.getData('id') || `enemy_${enemy.x}_${enemy.y}`,
          x: enemy.x,
          y: enemy.y,
          name: enemy.getData('name') || '敌人',
        };
      }
      return null;
    }).filter(Boolean) as Array<{ id: string; x: number; y: number; name: string }>;
    
    useGameStore.setState({ enemies: enemiesData });
    
    // 检查玩家是否在村庄中（泉水回血）
    const playerVillageCheck = this.isInVillage(playerX, playerY);
    if (playerVillageCheck.inVillage && playerVillageCheck.villageId) {
      const village = this.villages.find(v => v.id === playerVillageCheck.villageId);
      if (village && village.hasSpring) {
        // 在泉水范围内自动回血
        this.healPlayerInSpring(village, delta);
      }
      
      // 更新当前所在村庄
      if (this.currentVillage !== playerVillageCheck.villageId) {
        this.currentVillage = playerVillageCheck.villageId;
        console.log(`进入村庄：${village?.name}`);
      }
    } else {
      if (this.currentVillage) {
        console.log('离开村庄');
        this.currentVillage = null;
      }
    }
    
    // 记录探索区域（每64像素为一个区域）
    const tileX = Math.floor(playerX / 64);
    const tileY = Math.floor(playerY / 64);
    const currentTile = `${tileX}-${tileY}`;
    
    if (currentTile !== this.lastExploredTile) {
      useGameStore.getState().addExploredArea(playerX, playerY);
      this.lastExploredTile = currentTile;
      
      // 检查是否靠近未解锁的村庄
      this.checkVillageUnlock(playerX, playerY);
    }
  }
  
  private checkVillageUnlock(x: number, y: number) {
    this.villages.forEach(village => {
      if (village.unlocked) return;
      
      // 检查玩家是否靠近未解锁的村庄（范围+50像素）
      const distance = Phaser.Math.Distance.Between(x, y, village.x, village.y);
      const discoverRange = village.radius + 50;
      
      if (distance < discoverRange) {
        // 解锁村庄
        village.unlocked = true;
        
        console.log(`🎉 发现新村庄：${village.name}`);
        
        // 显示解锁提示
        this.showVillageUnlockNotification(village);
        
        // 创建村庄视觉标记
        this.createVillages();
      }
    });
  }
  
  private showVillageUnlockNotification(village: typeof this.villages[0]) {
    const sizeLabel = village.size === 'large' ? '大型' : village.size === 'medium' ? '中型' : '小型';
    
    // 屏幕中央大字提示
    const notification = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 50,
      `🎉 发现新村庄！\n\n${village.name}\n[${sizeLabel}村庄]`,
      {
        fontSize: '32px',
        color: '#ffff00',
        fontStyle: 'bold',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 6,
      }
    );
    notification.setOrigin(0.5);
    notification.setScrollFactor(0);
    notification.setDepth(3000);
    
    // 淡入淡出动画
    notification.setAlpha(0);
    this.tweens.add({
      targets: notification,
      alpha: 1,
      duration: 500,
      yoyo: true,
      hold: 2000,
      onComplete: () => {
        notification.destroy();
      },
    });
    
    // 村庄位置闪光特效
    const flash = this.add.circle(village.x, village.y, village.radius * 2, 0xffff00, 0.5);
    flash.setDepth(999);
    
    this.tweens.add({
      targets: flash,
      scale: 2,
      alpha: 0,
      duration: 1500,
      onComplete: () => {
        flash.destroy();
      },
    });
  }
  
  private handleTeleport() {
    // 检查玩家是否在有传送点的村庄中
    const playerCheck = this.isInVillage(this.player.x, this.player.y);
    if (!playerCheck.inVillage || !playerCheck.villageId) {
      console.log('你不在村庄中，无法传送');
      return;
    }
    
    const currentVillage = this.villages.find(v => v.id === playerCheck.villageId);
    if (!currentVillage || !currentVillage.hasTeleport) {
      console.log('此村庄没有传送点');
      return;
    }
    
    // 获取所有已解锁且有传送点的村庄（排除当前村庄）
    const teleportTargets = this.villages.filter(v => 
      v.unlocked && v.hasTeleport && v.id !== currentVillage.id
    );
    
    if (teleportTargets.length === 0) {
      console.log('没有可传送的目标村庄');
      this.showFloatingText(this.player.x, this.player.y - 50, '没有可传送目标', '#ff0000');
      return;
    }
    
    // 简单实现：传送到第一个可用村庄
    const target = teleportTargets[0];
    console.log(`🌀 传送到：${target.name}`);
    
    // 传送特效
    this.showTeleportEffect(this.player.x, this.player.y);
    
    // 延迟传送
    this.time.delayedCall(500, () => {
      // 移动玩家
      this.player.setPosition(target.x, target.y);
      
      // 到达特效
      this.showTeleportEffect(target.x, target.y);
      
      console.log(`✅ 已到达：${target.name}`);
    });
  }
  
  private showTeleportEffect(x: number, y: number) {
    // 传送光效
    const teleportFlash = this.add.circle(x, y, 50, 0xff00ff, 0.8);
    teleportFlash.setDepth(2000);
    
    this.tweens.add({
      targets: teleportFlash,
      scale: 3,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        teleportFlash.destroy();
      },
    });
    
    // 传送粒子效果（简单版）
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const particle = this.add.circle(x, y, 5, 0xff00ff, 1);
      particle.setDepth(2001);
      
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 80,
        y: y + Math.sin(angle) * 80,
        alpha: 0,
        duration: 600,
        onComplete: () => {
          particle.destroy();
        },
      });
    }
  }
}
