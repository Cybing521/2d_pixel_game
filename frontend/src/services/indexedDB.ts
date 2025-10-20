import { openDB, IDBPDatabase } from 'idb';

/**
 * IndexedDB 存储服务
 */

const DB_NAME = 'ForgottenRealmDB';
const DB_VERSION = 1;
const STORE_NAME = 'gameSaves';

let dbInstance: IDBPDatabase | null = null;

/**
 * 初始化数据库
 */
export async function initIndexedDB(): Promise<IDBPDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 创建存储对象
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
        });

        // 创建索引
        store.createIndex('slotNumber', 'slotNumber', { unique: true });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    },
  });

  console.log('✅ IndexedDB initialized');
  return dbInstance;
}

/**
 * 保存数据到IndexedDB
 */
export async function saveToIndexedDB(
  slotNumber: number,
  data: any,
  saveName?: string
): Promise<void> {
  const db = await initIndexedDB();
  const now = Date.now();

  const saveData = {
    id: `slot-${slotNumber}`,
    slotNumber,
    saveName: saveName || `存档 ${slotNumber}`,
    gameData: data,
    createdAt: now,
    updatedAt: now,
  };

  await db.put(STORE_NAME, saveData);
  console.log(`✅ 数据已保存到 IndexedDB 槽位 ${slotNumber}`);
}

/**
 * 从IndexedDB加载数据
 */
export async function loadFromIndexedDB(slotNumber: number): Promise<any> {
  const db = await initIndexedDB();
  const saveData = await db.get(STORE_NAME, `slot-${slotNumber}`);

  if (!saveData) {
    throw new Error(`槽位 ${slotNumber} 没有存档数据`);
  }

  console.log(`✅ 从 IndexedDB 槽位 ${slotNumber} 加载数据`);
  return saveData.gameData;
}

/**
 * 获取所有存档槽位信息
 */
export async function getAllSaveSlots(): Promise<any[]> {
  const db = await initIndexedDB();
  const allSaves = await db.getAll(STORE_NAME);

  // 初始化3个槽位
  const slots = [];
  for (let i = 1; i <= 3; i++) {
    const save = allSaves.find(s => s.slotNumber === i);
    
    if (save) {
      slots.push({
        slotNumber: i,
        saveName: save.saveName,
        hasData: true,
        updatedAt: save.updatedAt,
        preview: {
          level: save.gameData?.player?.level || 1,
          exploredCount: save.gameData?.progress?.exploredAreas?.length || 0,
        },
      });
    } else {
      slots.push({
        slotNumber: i,
        saveName: `存档槽位 ${i}`,
        hasData: false,
        updatedAt: 0,
      });
    }
  }

  return slots;
}

/**
 * 删除存档
 */
export async function deleteFromIndexedDB(slotNumber: number): Promise<void> {
  const db = await initIndexedDB();
  await db.delete(STORE_NAME, `slot-${slotNumber}`);
  console.log(`✅ 已删除 IndexedDB 槽位 ${slotNumber}`);
}

/**
 * 重命名存档
 */
export async function renameSaveInIndexedDB(
  slotNumber: number,
  newName: string
): Promise<void> {
  const db = await initIndexedDB();
  const saveData = await db.get(STORE_NAME, `slot-${slotNumber}`);

  if (!saveData) {
    throw new Error(`槽位 ${slotNumber} 不存在`);
  }

  saveData.saveName = newName;
  saveData.updatedAt = Date.now();

  await db.put(STORE_NAME, saveData);
  console.log(`✅ 槽位 ${slotNumber} 已重命名为: ${newName}`);
}

/**
 * 清空所有存档
 */
export async function clearAllSaves(): Promise<void> {
  const db = await initIndexedDB();
  await db.clear(STORE_NAME);
  console.log('✅ 已清空所有存档');
}

/**
 * 获取数据库使用情况
 */
export async function getStorageUsage(): Promise<{
  usage: number;
  quota: number;
  usagePercent: number;
  formattedUsage: string;
  formattedQuota: string;
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const usagePercent = quota > 0 ? (usage / quota) * 100 : 0;

    const formatBytes = (bytes: number) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    };

    return {
      usage,
      quota,
      usagePercent,
      formattedUsage: formatBytes(usage),
      formattedQuota: formatBytes(quota),
    };
  }

  return {
    usage: 0,
    quota: 0,
    usagePercent: 0,
    formattedUsage: '0 B',
    formattedQuota: '0 B',
  };
}
