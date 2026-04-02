import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'hospital_kiosk_db';
const DB_VERSION = 1;

export interface OfflineAction {
  id: string;
  type: 'TOKEN_INCREMENT' | 'RECONNECT_SYNC';
  payload: any;
  timestamp: number;
}

export interface KioskDB {
  ads: {
    key: string;
    value: any;
  };
  tokens: {
    key: string;
    value: any;
  };
  offline_queue: {
    key: string;
    value: OfflineAction;
  };
  config: {
    key: string;
    value: any;
  };
}

let dbPromise: Promise<IDBPDatabase<KioskDB>>;

export const initDB = () => {
  dbPromise = openDB<KioskDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('ads')) {
        db.createObjectStore('ads');
      }
      if (!db.objectStoreNames.contains('tokens')) {
        db.createObjectStore('tokens');
      }
      if (!db.objectStoreNames.contains('offline_queue')) {
        db.createObjectStore('offline_queue', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('config')) {
        db.createObjectStore('config');
      }
    },
  });
  return dbPromise;
};

export const dbStore = {
  async set(storeName: keyof KioskDB, key: string, value: any) {
    const db = await dbPromise;
    return db.put(storeName, value, key);
  },
  async get(storeName: keyof KioskDB, key: string) {
    const db = await dbPromise;
    return db.get(storeName, key);
  },
  async getAll(storeName: keyof KioskDB) {
    const db = await dbPromise;
    return db.getAll(storeName);
  },
  async delete(storeName: keyof KioskDB, key: string) {
    const db = await dbPromise;
    return db.delete(storeName, key);
  },
  async clear(storeName: keyof KioskDB) {
    const db = await dbPromise;
    return db.clear(storeName);
  },
  // Offline queue specific
  async addToQueue(action: Omit<OfflineAction, 'id' | 'timestamp'>) {
    const db = await dbPromise;
    const offlineAction: OfflineAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    return db.put('offline_queue', offlineAction);
  },
  async getQueue() {
    const db = await dbPromise;
    return db.getAll('offline_queue');
  },
  async removeFromQueue(id: string) {
    const db = await dbPromise;
    return db.delete('offline_queue', id);
  }
};
