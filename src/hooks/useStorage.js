import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for managing tool data with IndexedDB storage
 */
export function useStorage(storeName, initialData = []) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Dynamic import to avoid SSR issues
      const { default: getStorage } = await import("@/utils/indexedDBStorage");
      const storage = getStorage();

      const savedData = await storage.loadData(storeName);
      setData(savedData);
    } catch (err) {
      console.error(`Failed to load data from ${storeName}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [storeName]);

  // Load data on mount only
  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveData = useCallback(
    async (newData) => {
      try {
        setError(null);

        // Dynamic import to avoid SSR issues
        const { default: getStorage } = await import(
          "@/utils/indexedDBStorage"
        );
        const storage = getStorage();

        await storage.saveData(storeName, newData);
        setData(newData);
        return true;
      } catch (err) {
        console.error(`Failed to save data to ${storeName}:`, err);
        setError(err.message);
        return false;
      }
    },
    [storeName]
  );

  const clearData = useCallback(async () => {
    try {
      setError(null);

      // Dynamic import to avoid SSR issues
      const { default: getStorage } = await import("@/utils/indexedDBStorage");
      const storage = getStorage();

      await storage.clearStore(storeName);
      setData([]);
      return true;
    } catch (err) {
      console.error(`Failed to clear ${storeName}:`, err);
      setError(err.message);
      return false;
    }
  }, [storeName]);

  return {
    data,
    setData,
    saveData,
    loadData,
    clearData,
    loading,
    error,
  };
}

/**
 * Custom hook for managing user preferences
 */
export function usePreferences(toolType, defaultPreferences = {}) {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [loading, setLoading] = useState(true);

  // Load preferences on mount only
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true);

        // Dynamic import to avoid SSR issues
        const { default: getStorage } = await import(
          "@/utils/indexedDBStorage"
        );
        const storage = getStorage();

        const saved = await storage.loadPreferences(toolType);
        setPreferences({ ...defaultPreferences, ...saved });
      } catch (err) {
        console.error(`Failed to load preferences for ${toolType}:`, err);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolType]); // Remove defaultPreferences from dependencies

  const savePreferences = useCallback(
    async (newPreferences) => {
      try {
        // Dynamic import to avoid SSR issues
        const { default: getStorage } = await import(
          "@/utils/indexedDBStorage"
        );
        const storage = getStorage();

        await storage.savePreferences(toolType, newPreferences);
        setPreferences(newPreferences);
        return true;
      } catch (err) {
        console.error(`Failed to save preferences for ${toolType}:`, err);
        return false;
      }
    },
    [toolType]
  );

  return {
    preferences,
    setPreferences,
    savePreferences,
    loading,
  };
}
