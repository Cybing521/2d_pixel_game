// 存档系统
import { SaveData } from '@types/systems';

export class SaveSystem {
  private static SAVE_KEY = 'forgotten-pixel-realm-save';
  private static VERSION = '1.0.0';

  /**
   * 保存游戏数据
   */
  static save(data: Partial<SaveData>): void {
    const saveData: SaveData = {
      version: this.VERSION,
      timestamp: Date.now(),
      player: data.player || {},
      inventory: data.inventory || {},
      quests: data.quests || [],
      progress: data.progress || {
        exploredAreas: [],
        killedBosses: [],
        unlockedSkills: [],
        completedQuests: [],
        discoveredItems: [],
      },
      settings: data.settings || {
        volume: {
          master: 1.0,
          music: 0.8,
          sfx: 0.8,
        },
        graphics: {
          fullscreen: false,
          vsync: true,
        },
        controls: {},
      },
    };

    try {
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
      console.log('游戏保存成功');
    } catch (error) {
      console.error('保存失败:', error);
    }
  }

  /**
   * 加载游戏数据
   */
  static load(): SaveData | null {
    const saved = localStorage.getItem(this.SAVE_KEY);
    if (!saved) {
      console.log('没有找到存档');
      return null;
    }

    try {
      const saveData = JSON.parse(saved) as SaveData;
      
      // 版本检查
      if (saveData.version !== this.VERSION) {
        console.warn('存档版本不匹配，可能需要迁移数据');
      }
      
      console.log('游戏加载成功');
      return saveData;
    } catch (error) {
      console.error('加载失败:', error);
      return null;
    }
  }

  /**
   * 删除存档
   */
  static delete(): void {
    localStorage.removeItem(this.SAVE_KEY);
    console.log('存档已删除');
  }

  /**
   * 检查是否存在存档
   */
  static exists(): boolean {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }

  /**
   * 获取所有存档槽位
   */
  static getAllSaves(): SaveData[] {
    const saves: SaveData[] = [];
    for (let i = 1; i <= 3; i++) {
      const key = `${this.SAVE_KEY}-${i}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          saves.push(JSON.parse(saved));
        } catch (error) {
          console.error(`加载存档槽位 ${i} 失败:`, error);
        }
      }
    }
    return saves;
  }
}
