/**
 * IndexedDB Storage Utility for Cobblemon Tools
 * Replaces localStorage with much larger capacity and better performance
 */

class CobblemonStorage {
  constructor() {
    this.dbName = "CobblemonData";
    this.version = 1;
    this.db = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the IndexedDB database
   */
  async init() {
    if (this.isInitialized) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error("IndexedDB failed to open:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log("IndexedDB initialized successfully");
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log("Creating IndexedDB object stores...");

        // Create object stores for each tool
        const stores = [
          "spawnReports",
          "speciesData",
          "trainerReports",
          "lootReports",
          "spawnPoolData",
          "userPreferences",
        ];

        stores.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: "id" });
            // Create indexes for better querying
            store.createIndex("timestamp", "timestamp", { unique: false });
            store.createIndex("toolType", "toolType", { unique: false });
          }
        });
      };
    });
  }

  /**
   * Save data to a specific store
   */
  async saveData(storeName, data, metadata = {}) {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);

      const dataToSave = {
        id: "main", // Single record per store
        data: data,
        timestamp: Date.now(),
        toolType: storeName,
        ...metadata,
      };

      const request = store.put(dataToSave);

      request.onsuccess = () => {
        console.log(`Data saved to ${storeName} store`);
        resolve(true);
      };

      request.onerror = () => {
        console.error(`Failed to save data to ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Load data from a specific store
   */
  async loadData(storeName) {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get("main");

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.data) {
          console.log(`Data loaded from ${storeName} store`);
          resolve(result.data);
        } else {
          console.log(`No data found in ${storeName} store`);
          resolve([]);
        }
      };

      request.onerror = () => {
        console.error(`Failed to load data from ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Save user preferences (sort settings, filters, etc.)
   */
  async savePreferences(toolType, preferences) {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["userPreferences"], "readwrite");
      const store = transaction.objectStore("userPreferences");

      const dataToSave = {
        id: toolType,
        preferences: preferences,
        timestamp: Date.now(),
      };

      const request = store.put(dataToSave);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Load user preferences
   */
  async loadPreferences(toolType) {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["userPreferences"], "readonly");
      const store = transaction.objectStore("userPreferences");
      const request = store.get(toolType);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.preferences : {});
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all data from a specific store
   */
  async clearStore(storeName) {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        console.log(`Cleared ${storeName} store`);
        resolve(true);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get storage usage information
   */
  async getStorageInfo() {
    await this.ensureInitialized();

    return new Promise((resolve) => {
      if (!navigator.storage || !navigator.storage.estimate) {
        resolve({ quota: "Unknown", usage: "Unknown" });
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

  /**
   * Ensure database is initialized before operations
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.init();
    }
  }

  /**
   * Check if IndexedDB is supported (SSR-safe)
   */
  static isSupported() {
    return typeof window !== "undefined" && "indexedDB" in window;
  }

  /**
   * Fallback to localStorage if IndexedDB is not available
   */
  static createFallbackStorage() {
    return {
      async saveData(storeName, data) {
        try {
          if (typeof window === "undefined") return false;
          localStorage.setItem(storeName, JSON.stringify(data));
          return true;
        } catch (err) {
          console.error("localStorage fallback failed:", err);
          return false;
        }
      },

      async loadData(storeName) {
        try {
          if (typeof window === "undefined") return [];
          const saved = localStorage.getItem(storeName);
          return saved ? JSON.parse(saved) : [];
        } catch (err) {
          console.error("localStorage fallback load failed:", err);
          return [];
        }
      },

      async savePreferences(toolType, preferences) {
        try {
          if (typeof window === "undefined") return false;
          localStorage.setItem(
            `${toolType}_preferences`,
            JSON.stringify(preferences)
          );
          return true;
        } catch (err) {
          console.error("localStorage preferences save failed:", err);
          return false;
        }
      },

      async loadPreferences(toolType) {
        try {
          if (typeof window === "undefined") return {};
          const saved = localStorage.getItem(`${toolType}_preferences`);
          return saved ? JSON.parse(saved) : {};
        } catch (err) {
          console.error("localStorage preferences load failed:", err);
          return {};
        }
      },

      async clearStore(storeName) {
        try {
          if (typeof window === "undefined") return false;
          localStorage.removeItem(storeName);
          return true;
        } catch (err) {
          console.error("localStorage clear failed:", err);
          return false;
        }
      },

      async getStorageInfo() {
        try {
          if (typeof window === "undefined") {
            return { quota: "Unknown", usage: "Unknown", percentage: 0 };
          }
          let totalSize = 0;
          for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
              totalSize += localStorage[key].length;
            }
          }
          return {
            usage: totalSize,
            quota: 5 * 1024 * 1024, // 5MB typical limit
            percentage: Math.round((totalSize / (5 * 1024 * 1024)) * 100),
          };
        } catch (err) {
          return { quota: "Unknown", usage: "Unknown", percentage: 0 };
        }
      },
    };
  }
}

// Create a lazy storage instance that only initializes on the client
let storageInstance = null;

const getStorage = () => {
  if (typeof window === "undefined") {
    // Return fallback storage on server
    return CobblemonStorage.createFallbackStorage();
  }

  if (!storageInstance) {
    storageInstance = CobblemonStorage.isSupported()
      ? new CobblemonStorage()
      : CobblemonStorage.createFallbackStorage();
  }

  return storageInstance;
};

export default getStorage;
