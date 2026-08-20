class CobblemonStorage {
  constructor() {
    this.dbName = "CobblemonData";
    this.version = 6; // v6: adds pokedexDetailCache_v2 (fixes normalized stat names)
    this.db = null;
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error("IndexedDB failed to open:", request.error);
        reject(request.error);
      };

      request.onblocked = () => {
        console.warn(
          "IndexedDB upgrade blocked — close other tabs with this site open, then reload."
        );
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log("IndexedDB initialized successfully");

        const expectedStores = [
          "spawnReports",
          "speciesData",
          "trainerReports",
          "lootReports",
          "spawnPoolData",
          "userPreferences",
          "sharedFiles",
          "processedFilesTracking",
          "pokedexListCache",
          "pokedexDetailCache",     // v5 — kept so existing data isn't orphaned
          "pokedexDetailCache_v2",  // v6 — normalized stat names (fixes EV berry bug)
        ];
        const missing = expectedStores.filter(
          (s) => !this.db.objectStoreNames.contains(s)
        );
        if (missing.length > 0) {
          console.warn(
            `IndexedDB is at version ${this.db.version} but is missing store(s): ${missing.join(
              ", "
            )}. Fix: DevTools -> Application -> IndexedDB -> delete "CobblemonData", then hard refresh.`
          );
        }

        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log(`Upgrading IndexedDB from v${event.oldVersion} to v${event.newVersion}...`);

        const stores = [
          "spawnReports",
          "speciesData",
          "trainerReports",
          "lootReports",
          "spawnPoolData",
          "userPreferences",
          "sharedFiles",
          "processedFilesTracking",
          "pokedexListCache",
          "pokedexDetailCache",     // kept from v5
          "pokedexDetailCache_v2",  // new in v6
        ];

        stores.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: "id" });
            store.createIndex("timestamp", "timestamp", { unique: false });
            store.createIndex("toolType", "toolType", { unique: false });
          }
        });
      };
    });
  }

  async saveData(storeName, data, metadata = {}) {
    await this.ensureInitialized();

    if (!this.db.objectStoreNames.contains(storeName)) {
      console.error(`Store "${storeName}" does not exist`);
      return Promise.reject(new Error(`Store "${storeName}" does not exist`));
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);

      const dataToSave = {
        id: "main",
        data: data,
        timestamp: Date.now(),
        toolType: storeName,
        ...metadata,
      };

      const request = store.put(dataToSave);
      request.onsuccess = () => { console.log(`Data saved to ${storeName}`); resolve(true); };
      request.onerror  = () => { console.error(`Failed to save to ${storeName}:`, request.error); reject(request.error); };
    });
  }

  async loadData(storeName) {
    await this.ensureInitialized();

    if (!this.db.objectStoreNames.contains(storeName)) {
      console.warn(`Store "${storeName}" does not exist, returning []`);
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get("main");

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.data) {
          console.log(`Data loaded from ${storeName}`);
          resolve(result.data);
        } else {
          console.log(`No data in ${storeName}`);
          resolve([]);
        }
      };
      request.onerror = () => { console.error(`Failed to load from ${storeName}:`, request.error); reject(request.error); };
    });
  }

  async savePreferences(toolType, preferences) {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["userPreferences"], "readwrite");
      const store = transaction.objectStore("userPreferences");
      const request = store.put({
        id: toolType,
        preferences,
        timestamp: Date.now(),
      });
      request.onsuccess = () => resolve(true);
      request.onerror  = () => reject(request.error);
    });
  }

  async loadPreferences(toolType) {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["userPreferences"], "readonly");
      const store = transaction.objectStore("userPreferences");
      const request = store.get(toolType);
      request.onsuccess = () => resolve(request.result?.preferences ?? {});
      request.onerror  = () => reject(request.error);
    });
  }

  async clearStore(storeName) {
    await this.ensureInitialized();

    if (!this.db.objectStoreNames.contains(storeName)) {
      console.warn(`Store "${storeName}" does not exist, nothing to clear`);
      return true;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => { console.log(`Cleared ${storeName}`); resolve(true); };
      request.onerror  = () => reject(request.error);
    });
  }

  async markFileProcessed(scannerName, fileId) {
    await this.ensureInitialized();

    if (!this.db.objectStoreNames.contains("processedFilesTracking")) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["processedFilesTracking"], "readwrite");
      const store = transaction.objectStore("processedFilesTracking");
      const getRequest = store.get(scannerName);

      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        const processedFiles = new Set(existing?.processedFiles ?? []);
        processedFiles.add(fileId);

        const putRequest = store.put({
          id: scannerName,
          scannerName,
          processedFiles: Array.from(processedFiles),
          lastUpdated: Date.now(),
        });
        putRequest.onsuccess = () => resolve();
        putRequest.onerror  = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getProcessedFiles(scannerName) {
    await this.ensureInitialized();

    if (!this.db.objectStoreNames.contains("processedFilesTracking")) {
      return new Set();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["processedFilesTracking"], "readonly");
      const store = transaction.objectStore("processedFilesTracking");
      const request = store.get(scannerName);
      request.onsuccess = () => {
        resolve(new Set(request.result?.processedFiles ?? []));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearProcessedFiles(scannerName) {
    await this.ensureInitialized();

    if (!this.db.objectStoreNames.contains("processedFilesTracking")) return true;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["processedFilesTracking"], "readwrite");
      const store = transaction.objectStore("processedFilesTracking");
      const request = store.delete(scannerName);
      request.onsuccess = () => { console.log(`Cleared processed files for ${scannerName}`); resolve(true); };
      request.onerror  = () => reject(request.error);
    });
  }

  // Removes a single file id from one scanner's processed-files set (used
  // when a shared file is removed, so it will be re-parsed if re-added).
  async unmarkFileProcessed(scannerName, fileId) {
    await this.ensureInitialized();

    if (!this.db.objectStoreNames.contains("processedFilesTracking")) return true;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["processedFilesTracking"], "readwrite");
      const store = transaction.objectStore("processedFilesTracking");
      const getRequest = store.get(scannerName);

      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          resolve(true);
          return;
        }
        const processedFiles = new Set(existing.processedFiles ?? []);
        processedFiles.delete(fileId);

        const putRequest = store.put({
          ...existing,
          processedFiles: Array.from(processedFiles),
          lastUpdated: Date.now(),
        });
        putRequest.onsuccess = () => resolve(true);
        putRequest.onerror  = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Loads a store's array data, removes entries matching `matchFn`, and
  // saves back only if something actually changed. Used to purge a single
  // uploaded file's contribution from every tool's parsed data store.
  async removeMatchingEntries(storeName, matchFn) {
    await this.ensureInitialized();

    const data = await this.loadData(storeName);
    if (!Array.isArray(data) || data.length === 0) return data;

    const filtered = data.filter((item) => !matchFn(item));
    if (filtered.length !== data.length) {
      await this.saveData(storeName, filtered);
    }
    return filtered;
  }

  async getStorageInfo() {
    await this.ensureInitialized();

    return new Promise((resolve) => {
      if (!navigator.storage?.estimate) {
        resolve({ quota: "Unknown", usage: "Unknown", percentage: 0 });
        return;
      }
      navigator.storage.estimate().then((estimate) => {
        resolve({
          quota: estimate.quota,
          usage: estimate.usage,
          percentage: estimate.quota
            ? Math.round((estimate.usage / estimate.quota) * 100)
            : 0,
        });
      });
    });
  }

  async ensureInitialized() {
    if (!this.isInitialized) await this.init();
  }

  static isSupported() {
    return typeof window !== "undefined" && "indexedDB" in window;
  }

  // Used only when IndexedDB genuinely isn't available (SSR, or a browser
  // without IndexedDB support). No-ops rather than falling back to
  // localStorage — IndexedDB is the only persistence backend this app
  // uses, so "unavailable" means "no persistence this session," not
  // "switch backends."
  static createNoopStorage() {
    return {
      async saveData() {
        return false;
      },
      async loadData() {
        return [];
      },
      async savePreferences() {
        return false;
      },
      async loadPreferences() {
        return {};
      },
      async clearStore() {
        return false;
      },
      async markFileProcessed() {
        return false;
      },
      async getProcessedFiles() {
        return new Set();
      },
      async unmarkFileProcessed() {
        return true;
      },
      async removeMatchingEntries() {
        return [];
      },
      async getStorageInfo() {
        return { quota: "Unknown", usage: "Unknown", percentage: 0 };
      },
    };
  }
}

let storageInstance = null;

const getStorage = () => {
  if (typeof window === "undefined") {
    return CobblemonStorage.createNoopStorage();
  }
  if (!storageInstance) {
    storageInstance = CobblemonStorage.isSupported()
      ? new CobblemonStorage()
      : CobblemonStorage.createNoopStorage();
  }
  return storageInstance;
};

export default getStorage;
