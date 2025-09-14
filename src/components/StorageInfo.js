import { useState, useEffect } from "react";

export default function StorageInfo() {
  const [storageInfo, setStorageInfo] = useState({
    usage: 0,
    percentage: 0,
  });

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    try {
      const { default: getStorage } = await import("@/utils/indexedDBStorage");
      const storage = getStorage();
      const info = await storage.getStorageInfo();
      setStorageInfo({
        usage: info.usage,
        percentage: info.percentage,
      });
    } catch (err) {
      console.error("Failed to load storage info:", err);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === "Unknown" || bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="text-xs text-gray-400 text-center">
      Storage: {formatBytes(storageInfo.usage)} ({storageInfo.percentage}%)
    </div>
  );
}
