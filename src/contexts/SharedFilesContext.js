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

async function validateFileStructure(file) {
  try {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(file, {
      checkCRC32: false,
      streamFiles: true,
    });

    const filePaths = Object.keys(zip.files);

    // Check for spawn_pool_world (Spawn Scanner)
    const hasSpawnData = filePaths.some((name) =>
      name.includes("/spawn_pool_world/")
    );

    // Check for species or species_additions (Loot Scanner)
    const hasLootData = filePaths.some((rawPath) => {
      const normalized = rawPath.replace(/\\/g, "/");
      const dataIndex = normalized.indexOf("data/");
      if (dataIndex === -1) return false;
      const rel = normalized.slice(dataIndex);
      return /^data\/[^/]+\/(species|species_additions)\/.+\.json$/.test(rel);
    });

    // Check for species folder (Species Scanner)
    const hasSpeciesData = filePaths.some((path) =>
      path.match(/^data\/[^/]+\/species\/.+\.json$/)
    );

    if (!hasSpawnData && !hasLootData && !hasSpeciesData) {
      return {
        valid: false,
        reason:
          "File does not contain required folders. Needs at least one of: spawn_pool_world, species, or species_additions folders.",
      };
    }

    return { valid: true };
  } catch (err) {
    console.error("Error validating file structure:", err);
    return {
      valid: false,
      reason: `Failed to validate file: ${err.message}`,
    };
  }
}

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
      toast.success(`✅ Added "${file.name}" to shared files`, {
        id: `validate-${file.name}`,
      });
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
