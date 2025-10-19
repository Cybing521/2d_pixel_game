// 主游戏场景
import Phaser from 'phaser';
import { SCENE_KEYS, GAME_CONFIG } from '@constants/gameConfig';
import { Player } from '../entities/Player';
import { FogSystem } from '../systems/FogSystem';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private fogSystem!: FogSystem;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

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

    // 初始化迷雾系统
    this.fogSystem = new FogSystem(this, this.player);

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

  update(time: number, delta: number) {
    // 更新玩家
    this.player.update(time, delta);

    // 更新迷雾
    this.fogSystem.update(time, delta);
  }
}
