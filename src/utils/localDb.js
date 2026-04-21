/**
 * Native IndexedDB Wrapper for Leka POS
 * Handles local caching and pending sync queue.
 */

const DB_NAME = 'LekaPOS_LocalCache';
const DB_VERSION = 1;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Catalog Cache (Categories & Items)
      if (!db.objectStoreNames.contains('catalog')) {
        db.createObjectStore('catalog', { keyPath: 'id' });
      }

      // Pending Bills (Items to be synced to Firebase)
      if (!db.objectStoreNames.contains('pending_bills')) {
        db.createObjectStore('pending_bills', { keyPath: 'tempId', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const localDb = {
  // ── Catalog ──────────────────────────────────────────────────
  async saveCatalog(type, data) {
    const db = await initDB();
    const tx = db.transaction('catalog', 'readwrite');
    const store = tx.objectStore('catalog');
    
    // Store type-specific data (e.g., key 'items' holds the array)
    store.put({ id: type, value: data, updatedAt: Date.now() });
    return new Promise((res) => { tx.oncomplete = () => res(); });
  },

  async getCatalog(type) {
    const db = await initDB();
    const tx = db.transaction('catalog', 'readonly');
    const store = tx.objectStore('catalog');
    const request = store.get(type);
    return new Promise((res) => { request.onsuccess = () => res(request.result?.value || null); });
  },

  // ── Pending Bills ────────────────────────────────────────────
  async addPendingBill(businessId, billData) {
    const db = await initDB();
    const tx = db.transaction('pending_bills', 'readwrite');
    const store = tx.objectStore('pending_bills');
    const entry = {
      businessId,
      ...billData,
      createdAt: new Date().toISOString(),
      retryCount: 0
    };
    store.add(entry);
    return new Promise((res) => { tx.oncomplete = () => res(); });
  },

  async getPendingBills() {
    const db = await initDB();
    const tx = db.transaction('pending_bills', 'readonly');
    const store = tx.objectStore('pending_bills');
    const request = store.getAll();
    return new Promise((res) => { request.onsuccess = () => res(request.result); });
  },

  async removePendingBill(tempId) {
    const db = await initDB();
    const tx = db.transaction('pending_bills', 'readwrite');
    const store = tx.objectStore('pending_bills');
    store.delete(tempId);
    return new Promise((res) => { tx.oncomplete = () => res(); });
  }
};
