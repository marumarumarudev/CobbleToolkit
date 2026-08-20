"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import toast from "react-hot-toast";
import { validateFileStructure } from "@/utils/fileValidation";
import {
  SCANNER_NAMES,
  TOOL_DATA_STORES,
  SHARED_FILES_CHANGED_EVENT,
} from "@/utils/toolDataStores";

const SharedFilesContext = createContext(null);


export function SharedFilesProvider({ children }) {
  const [sharedFiles, setSharedFiles] = useState([]);

  // Load shared files metadata from IndexedDB on mount
  useEffect(() => {
    const loadSharedFiles = async () => {
      try {
        const { default: getStorage } = await import(
          "@/utils/indexedDBStorage"
        );
        const storage = getStorage();
        const savedMetadata = await storage.loadData("sharedFiles");

        if (savedMetadata && savedMetadata.length > 0) {
          setSharedFiles(
            savedMetadata.map((meta) => ({ ...meta, file: null }))
          );
        }
      } catch (err) {
        console.error("Failed to load shared files:", err);
      }
    };

    loadSharedFiles();
  }, []);

  // Save shared files metadata to IndexedDB
  const saveSharedFiles = useCallback(async (files) => {
    try {
      const { default: getStorage } = await import("@/utils/indexedDBStorage");
      const storage = getStorage();

      // Save metadata only (File objects can't be serialized)
      const metadata = files.map(({ id, name, size, uploadedAt }) => ({
        id,
        name,
        size,
        uploadedAt,
      }));

      await storage.saveData("sharedFiles", metadata);
      setSharedFiles(files);
    } catch (err) {
      console.error("Failed to save shared files:", err);
      toast.error("Failed to save shared files");
    }
  }, []);

  const addSharedFile = useCallback(
    async (file) => {
      if (!file) return;

      // Validate file structure before adding
      toast.loading(`Validating "${file.name}"...`, {
        id: `validate-${file.name}`,
      });
      const validation = await validateFileStructure(file);

      if (!validation.valid) {
        toast.error(validation.reason, { id: `validate-${file.name}` });
        return;
      }

      const newFile = {
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        uploadedAt: Date.now(),
      };

      const updated = [...sharedFiles, newFile];
      await saveSharedFiles(updated);
      const supports = validation.labels?.length
        ? ` — supports ${validation.labels.join(", ")}`
        : "";
      toast.success(`✅ Added "${file.name}"${supports}`, {
        id: `validate-${file.name}`,
      });
    },
    [sharedFiles, saveSharedFiles]
  );

  const removeSharedFile = useCallback(
    async (fileId) => {
      const removedFile = sharedFiles.find((f) => f.id === fileId);
      const updated = sharedFiles.filter((f) => f.id !== fileId);
      await saveSharedFiles(updated);

      // Purge this file's contribution from every tool's parsed data, and
      // forget it was "processed" so re-adding the same file re-parses it.
      try {
        const { default: getStorage } = await import("@/utils/indexedDBStorage");
        const storage = getStorage();

        if (removedFile) {
          await Promise.all([
            ...TOOL_DATA_STORES.map(({ store, matchesFile }) =>
              storage.removeMatchingEntries(store, (item) =>
                matchesFile(item, removedFile.name)
              )
            ),
            ...SCANNER_NAMES.map((scannerName) =>
              storage.unmarkFileProcessed(scannerName, fileId)
            ),
          ]);
        }
      } catch (err) {
        console.error("Failed to purge tool data for removed file:", err);
      }

      window.dispatchEvent(new CustomEvent(SHARED_FILES_CHANGED_EVENT));
      toast.success("File removed — its data was cleared from every tool");
    },
    [sharedFiles, saveSharedFiles]
  );

  const clearSharedFiles = useCallback(async () => {
    try {
      const { default: getStorage } = await import("@/utils/indexedDBStorage");
      const storage = getStorage();

      await Promise.all([
        storage.clearStore("sharedFiles"),
        ...TOOL_DATA_STORES.map(({ store }) => storage.clearStore(store)),
        ...SCANNER_NAMES.map((scannerName) =>
          storage.clearProcessedFiles(scannerName)
        ),
      ]);

      setSharedFiles([]);
      window.dispatchEvent(new CustomEvent(SHARED_FILES_CHANGED_EVENT));
      toast.success("All shared files and tool data cleared");
    } catch (err) {
      console.error("Failed to clear shared files:", err);
      toast.error("Failed to clear shared files");
    }
  }, []);

  return (
    <SharedFilesContext.Provider
      value={{
        sharedFiles,
        addSharedFile,
        removeSharedFile,
        clearSharedFiles,
      }}
    >
      {children}
    </SharedFilesContext.Provider>
  );
}

export function useSharedFiles() {
  const context = useContext(SharedFilesContext);
  if (!context) {
    throw new Error("useSharedFiles must be used within SharedFilesProvider");
  }
  return context;
}
