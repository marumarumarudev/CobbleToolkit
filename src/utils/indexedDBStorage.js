import { TOOL_DATA_STORES, SCANNER_NAMES } from "./toolDataStores.js";

function announceStorageBlocked(blocked) {
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new CustomEvent("cobbletoolkit:storage-blocked", { detail: blocked }));
  }
}

class CobblemonStorage {
  constructor() {
    this.dbName = "CobblemonData";
    this.version = 7; // v7: persists uploaded archive blobs without replacing caches
    this.db = null;
    this.isInitialized = false;
    this.initPromise = null;
  }

  async init() {
    if (this.isInitialized) return Promise.resolve();

    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error("IndexedDB failed to open:", request.error);
        reject(request.error);
      };

      request.onblocked = () => {
        announceStorageBlocked(true);
        console.warn(
          "IndexedDB upgrade blocked — close other tabs with this site open, then reload."
        );
      };

      request.onsuccess = () => {
        announceStorageBlocked(false);
        this.db = request.result;
        this.db.onversionchange = () => {
          this.db.close();
          this.db = null;
          this.isInitialized = false;
          this.initPromise = null;
        };
        this.isInitialized = true;
        console.log("IndexedDB initialized successfully");

        const expectedStores = [
                  "archiveBlobs",
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
            )}. Reload the latest build. Do not clear site data unless you intend to discard saved archives and results.`
          );
        }

        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log(`Upgrading IndexedDB from v${event.oldVersion} to v${event.newVersion}...`);

        const stores = [
                  "archiveBlobs",
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
    try {
      await this.initPromise;
    } finally {
      this.initPromise = null;
    }
  }

  async commitScannerFile(scannerName, fileId, updates, isCurrent) {
    await this.ensureInitialized();
    const abortError = () => new DOMException("Scanner file commit is no longer current", "AbortError");
    if (!isCurrent()) throw abortError();

    return new Promise((resolve, reject) => {
      const storeNames = [...new Set([
        ...updates.map(({ storeName }) => storeName),
        "processedFilesTracking",
        "sharedFiles",
      ])];
      const transaction = this.db.transaction(storeNames, "readwrite");
      const committed = {};
      let failure;
      const abort = (error) => {
        failure = error;
        transaction.abort();
      };
      transaction.oncomplete = () => resolve(committed);
      transaction.onerror = () => reject(failure ?? transaction.error);
      transaction.onabort = () => reject(failure ?? transaction.error ?? abortError());

      const sharedRequest = transaction.objectStore("sharedFiles").get("main");
      sharedRequest.onsuccess = () => {
        try {
          if (!isCurrent() || !sharedRequest.result?.data?.some((file) => file.id === fileId)) {
            abort(abortError());
            return;
          }

          const tracking = transaction.objectStore("processedFilesTracking");
          const request = tracking.get(scannerName);
          request.onsuccess = () => {
            try {
              if (!isCurrent()) {
                abort(abortError());
                return;
              }
              const existing = request.result;
              const processedFiles = new Set(existing?.processedFiles ?? []);
              const alreadyProcessed = processedFiles.has(fileId);

              // Check tracking under the same write lock before scheduling any merges.
              const grouped = new Map();
              for (const update of updates) {
                if (!grouped.has(update.storeName)) grouped.set(update.storeName, []);
                grouped.get(update.storeName).push(update.merge);
              }
              for (const [storeName, merges] of grouped) {
                const store = transaction.objectStore(storeName);
                const dataRequest = store.get("main");
                dataRequest.onsuccess = () => {
                  try {
                    if (!isCurrent()) {
                      abort(abortError());
                      return;
                    }
                    const record = dataRequest.result;
                    let data = record?.data ?? [];
                    if (!alreadyProcessed) {
                      for (const merge of merges) data = merge(data);
                      store.put({
                        toolType: storeName,
                        ...record,
                        id: "main",
                        data,
                        timestamp: Date.now(),
                      });
                    }
                    Object.defineProperty(committed, storeName, { value: data, enumerable: true });
                  } catch (error) {
                    abort(error);
                  }
                };
              }
              if (!alreadyProcessed) {
                processedFiles.add(fileId);
                tracking.put({
                  ...existing,
                  id: scannerName,
                  scannerName,
                  processedFiles: Array.from(processedFiles),
                  lastUpdated: Date.now(),
                });
              }
            } catch (error) {
              abort(error);
            }
          };
        } catch (error) {
          abort(error);
        }
      };
    });
  }

  async persistSharedArchive(metadata, blob) {
    if (!metadata?.id || !metadata.contentHash || typeof metadata.allowRepairs !== "boolean") {
      throw new TypeError("Archive metadata requires id, contentHash and boolean allowRepairs");
    }
    if (!(blob instanceof Blob)) throw new TypeError("Archive must be a Blob");
    const limitError = (message) => Object.assign(new Error(message), { name: "ArchiveLimitError" });
    if (blob.size > 128 * 1024 * 1024) {
      throw limitError("Archive exceeds 128 MiB. Choose a smaller archive.");
    }
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(["sharedFiles", "archiveBlobs"], "readwrite");
      let files;
      let failure;
      tx.oncomplete = () => resolve(files);
      tx.onabort = () => reject(failure ?? tx.error ?? new DOMException("Transaction aborted", "AbortError"));
      const shared = tx.objectStore("sharedFiles");
      const blobs = tx.objectStore("archiveBlobs");
      const metaRequest = shared.get("main");
      const blobRequest = blobs.getAll();
      blobRequest.onsuccess = () => {
        try {
          const record = metaRequest.result;
          const existing = record?.data ?? [];
          const matches = (entry) => entry.contentHash === metadata.contentHash &&
            entry.allowRepairs === metadata.allowRepairs;
          const selected = metadata.reconnectId == null ? existing.find(matches) :
            existing.find((entry) => entry.id === metadata.reconnectId);
          if (metadata.reconnectId != null && (!selected || !matches(selected))) {
            throw new Error("Cannot reconnect unverified archive content or a different repair policy. Upload as a new archive instead.");
          }
          if (!selected && existing.some((entry) => entry.id === metadata.id)) {
            throw new Error("Archive ID already belongs to different content. Use a new ID.");
          }
          const { reconnectId, file, ...clean } = metadata;
          const saved = selected ?? { ...clean, size: blob.size };
          const total = blobRequest.result.reduce((sum, entry) =>
            sum + (entry.id === saved.id ? 0 : entry.blob.size), blob.size);
          if (total > 256 * 1024 * 1024) {
            throw limitError("Stored archives would exceed 256 MiB. Remove unneeded archives and try again.");
          }
          files = selected ? existing : [...existing, saved];
          blobs.put({ id: saved.id, blob });
          shared.put({ ...record, id: "main", toolType: "sharedFiles", data: files, timestamp: Date.now() });
        } catch (error) {
          failure = error;
          tx.abort();
        }
      };
    });
  }

  async loadSharedArchives() {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(["sharedFiles", "archiveBlobs"], "readonly");
      const metadata = tx.objectStore("sharedFiles").get("main");
      const blobs = tx.objectStore("archiveBlobs").getAll();
      tx.oncomplete = () => {
        const byId = new Map(blobs.result.map(({ id, blob }) => [id, blob]));
        resolve((metadata.result?.data ?? []).map((meta) => ({ ...meta, file: byId.get(meta.id) ?? null })));
      };
      tx.onabort = () => reject(tx.error ?? new DOMException("Transaction aborted", "AbortError"));
    });
  }

  async appendSharedFile(metadata) {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["sharedFiles"], "readwrite");
      let files;
      let failure;
      transaction.oncomplete = () => resolve(files);
      transaction.onerror = () => reject(failure ?? transaction.error);
      transaction.onabort = () => reject(
        failure ?? transaction.error ?? new DOMException("Transaction aborted", "AbortError")
      );
      const store = transaction.objectStore("sharedFiles");
      const request = store.get("main");
      request.onsuccess = () => {
        try {
          const existing = request.result;
          files = [...(existing?.data ?? []), metadata];
          store.put({
            toolType: "sharedFiles",
            ...existing,
            id: "main",
            data: files,
            timestamp: Date.now(),
          });
        } catch (error) {
          failure = error;
          transaction.abort();
        }
      };
    });
  }

  async purgeSharedFiles(fileId = null) {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const storeNames = [...new Set([
        "sharedFiles",
        "archiveBlobs",
        ...TOOL_DATA_STORES.map(({ store }) => store),
        "processedFilesTracking",
      ])];
      const transaction = this.db.transaction(storeNames, "readwrite");
      let remaining = [];
      let failure;
      const abort = (error) => {
        failure = error;
        transaction.abort();
      };
      transaction.oncomplete = () => resolve(remaining);
      transaction.onerror = () => reject(failure ?? transaction.error);
      transaction.onabort = () => reject(
        failure ?? transaction.error ?? new DOMException("Transaction aborted", "AbortError")
      );

      const blobStore = transaction.objectStore("archiveBlobs");
            if (fileId === null) blobStore.clear();
            else blobStore.delete(fileId);
            const sharedStore = transaction.objectStore("sharedFiles");
      const sharedRequest = sharedStore.get("main");
      sharedRequest.onsuccess = () => {
        try {
          const existing = sharedRequest.result;
          const files = existing?.data ?? [];
          const removed = files.filter((file) => fileId === null || file.id === fileId);
          remaining = fileId === null ? [] : files.filter((file) => file.id !== fileId);
          sharedStore.put({
            toolType: "sharedFiles",
            ...existing,
            id: "main",
            data: remaining,
            timestamp: Date.now(),
          });

          for (const { store: storeName, matchesFile } of TOOL_DATA_STORES) {
            const store = transaction.objectStore(storeName);
            if (fileId === null) {
              store.clear();
              continue;
            }
            const request = store.get("main");
            request.onsuccess = () => {
              try {
                const record = request.result;
                if (!Array.isArray(record?.data)) return;
                const data = record.data.filter((item) => {
                  if (item?.sharedFileId != null) return item.sharedFileId !== fileId;
                  return !removed.some((file) => matchesFile(item, file.name));
                });
                if (data.length !== record.data.length) {
                  store.put({ ...record, data, timestamp: Date.now() });
                }
              } catch (error) {
                abort(error);
              }
            };
          }

          const tracking = transaction.objectStore("processedFilesTracking");
          if (fileId === null) {
            tracking.clear();
          } else {
            for (const scannerName of SCANNER_NAMES) {
              const request = tracking.get(scannerName);
              request.onsuccess = () => {
                try {
                  const record = request.result;
                  if (!record) return;
                  const processedFiles = (record.processedFiles ?? []).filter((id) => id !== fileId);
                  tracking.put({ ...record, processedFiles, lastUpdated: Date.now() });
                } catch (error) {
                  abort(error);
                }
              };
            }
          }
        } catch (error) {
          abort(error);
        }
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
      transaction.oncomplete = () => { console.log(`Data saved to ${storeName}`); resolve(true); };
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error ?? new DOMException("Transaction aborted", "AbortError"));
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
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error ?? new DOMException("Transaction aborted", "AbortError"));
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
      transaction.oncomplete = () => { console.log(`Cleared ${storeName}`); resolve(true); };
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error ?? new DOMException("Transaction aborted", "AbortError"));
      request.onerror  = () => reject(request.error);
    });
  }

  async markFileProcessed(scannerName, fileId) {
    await this.ensureInitialized();

    if (!this.db.objectStoreNames.contains("processedFilesTracking")) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["processedFilesTracking"], "readwrite");
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error ?? new DOMException("Transaction aborted", "AbortError"));
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
      transaction.oncomplete = () => { console.log(`Cleared processed files for ${scannerName}`); resolve(true); };
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error ?? new DOMException("Transaction aborted", "AbortError"));
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
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error ?? new DOMException("Transaction aborted", "AbortError"));
      const store = transaction.objectStore("processedFilesTracking");
      const getRequest = store.get(scannerName);

      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) return;
        const processedFiles = new Set(existing.processedFiles ?? []);
        processedFiles.delete(fileId);

        const putRequest = store.put({
          ...existing,
          processedFiles: Array.from(processedFiles),
          lastUpdated: Date.now(),
        });

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
      async persistSharedArchive() {
        throw new Error("Persistence unavailable: IndexedDB is not supported");
      },
      async loadSharedArchives() {
        throw new Error("Persistence unavailable: IndexedDB is not supported");
      },
      async commitScannerFile() {
        throw new Error("Persistence unavailable: IndexedDB is not supported");
      },
      async appendSharedFile() {
        throw new Error("Persistence unavailable: IndexedDB is not supported");
      },
      async purgeSharedFiles() {
        throw new Error("Persistence unavailable: IndexedDB is not supported");
      },
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
