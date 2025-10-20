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
    this.cameras.main.setBounds(0, 0, 2000, 2000);

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
  
  private createTeleportPoint(x: number, y: number, villageId: string) {
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
      
      // 确保敌人不在任何已解锁村庄的安全区生成
      const isInAnyVillage = this.villages.some(village => {
        if (!village.unlocked) return false;
        const distance = Phaser.Math.Distance.Between(pos.x, pos.y, village.x, village.y);
        return distance < village.radius;
      });
      
      if (!isInAnyVillage) {
        const enemy = new Enemy(this, pos.x, pos.y, enemyData);
        this.enemies.add(enemy);
      }
    });

    console.log(`生成了 ${this.enemies.getLength()} 个敌人（村庄外）`);
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
  
  private healPlayerInSpring(village: typeof this.villages[0], delta: number) {
    const store = useGameStore.getState();
    const currentHealth = store.player.health;
    const maxHealth = store.player.maxHealth;
    
    // 如果未满血，每秒回复5点生命值
    if (currentHealth < maxHealth) {
      const healRate = 5; // 每秒回复量
      const healAmount = (healRate * delta) / 1000;
      const newHealth = Math.min(maxHealth, currentHealth + healAmount);
      
      store.updatePlayerStats({ health: newHealth });
      
      // 每秒显示一次回血提示
      if (Math.floor(currentHealth) !== Math.floor(newHealth) && Math.floor(newHealth) % 5 === 0) {
        this.showFloatingText(this.player.x, this.player.y - 40, `+${Math.floor(healAmount)}`, '#00ff00');
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
