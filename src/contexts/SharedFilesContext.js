"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import toast from "react-hot-toast";

const SharedFilesContext = createContext(null);

export function SharedFilesProvider({ children }) {
  const [sharedFiles, setSharedFiles] = useState([]); // Array of { id, file, name, size, uploadedAt }

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

      const newFile = {
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        uploadedAt: Date.now(),
      };

      const updated = [...sharedFiles, newFile];
      await saveSharedFiles(updated);
      toast.success(`✅ Added "${file.name}" to shared files`);
    },
    [sharedFiles, saveSharedFiles]
  );

  const removeSharedFile = useCallback(
    async (fileId) => {
      const updated = sharedFiles.filter((f) => f.id !== fileId);
      await saveSharedFiles(updated);
      toast.success("File removed from shared files");
    },
    [sharedFiles, saveSharedFiles]
  );

  const clearSharedFiles = useCallback(async () => {
    try {
      const { default: getStorage } = await import("@/utils/indexedDBStorage");
      const storage = getStorage();
      await storage.clearStore("sharedFiles");
      setSharedFiles([]);
      toast.success("All shared files cleared");
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
