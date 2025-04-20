import { DBConfig, HistoryItem } from "../types";

const DB_CONFIG: DBConfig = {
  name: "bilibiliHistory",
  version: 1,
  stores: {
    history: {
      keyPath: "id",
      indexes: ["viewTime"],
    },
  },
};

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const store = db.createObjectStore("history", { keyPath: "id" });
      store.createIndex("viewTime", "viewTime", { unique: false });
    };
  });
};

export const saveHistory = async (history: HistoryItem[]): Promise<void> => {
  const db = await openDB();
  const tx = db.transaction("history", "readwrite");
  const store = tx.objectStore("history");

  return new Promise((resolve, reject) => {
    const clearRequest = store.clear();
    clearRequest.onsuccess = () => {
      history.forEach((item) => {
        store.add(item);
      });
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getHistory = async (): Promise<HistoryItem[]> => {
  const db = await openDB();
  const tx = db.transaction("history", "readonly");
  const store = tx.objectStore("history");
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};
