"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSharedFiles } from "@/contexts/SharedFilesContext";
import { createScannerNotifications } from "@/utils/scannerNotifications";
import { getUnavailableArchives, storageFailureMessage } from "@/utils/archiveAvailability";

export function useScannerLifecycle(config) {
  const { sharedFiles, filesReady, lifecycleVersion, getGeneration, enqueueMutation,
    registerCancellation, notifyCommitted } = useSharedFiles();
  const [data, setData] = useState(() => Object.fromEntries(config.storeNames.map((name) => [name, []])));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unavailableFiles, setUnavailableFiles] = useState([]);

  useEffect(() => {
    let active = true;
    if (!filesReady) return () => { active = false; };
    const controller = new AbortController();
    const notices = createScannerNotifications(toast, config.scannerName);
    const unregister = registerCancellation(() => { controller.abort(); notices.clear(); });
    const generation = getGeneration();
    const isCurrent = () => active && !controller.signal.aborted && generation === getGeneration();
    const run = async () => {
      setLoading(true);
      setError(null);
      setUnavailableFiles([]);
      try {
        const { default: getStorage } = await import("@/utils/indexedDBStorage");
        const storage = getStorage();
        const snapshot = await enqueueMutation(async () => {
          if (!isCurrent()) return null;
          const stores = await Promise.all(config.storeNames.map(async (name) => [name, await storage.loadData(name)]));
          const processed = await storage.getProcessedFiles(config.scannerName);
          return { data: Object.fromEntries(stores), processed };
        });
        if (!snapshot || !isCurrent()) return;
        setData(snapshot.data);
        setUnavailableFiles(getUnavailableArchives(sharedFiles, snapshot.processed));

        for (const sharedFile of sharedFiles) {
          if (!isCurrent()) return;
          if (!sharedFile.file || snapshot.processed.has(sharedFile.id)) continue;
          try {
            notices.start(sharedFile.name);
            // Give the progress notification a paint before ZIP parsing starts.
            await new Promise(resolve => setTimeout(resolve, 0));
            if (!isCurrent()) return;
            const updates = await config.parse(sharedFile, { signal: controller.signal });
            if (!isCurrent()) return;
            const committed = await enqueueMutation(async () => {
              if (!isCurrent()) return null;
              return storage.commitScannerFile(config.scannerName, sharedFile.id, updates, isCurrent);
            });
            if (!committed || !isCurrent()) return;
            setData((current) => ({ ...current, ...committed }));
            snapshot.processed.add(sharedFile.id);
            notifyCommitted();
            if (updates.some((update) => update.hasWarnings)) {
              notices.warning(`Processed "${sharedFile.name}" with warnings. Review parse warnings above the results.`);
            } else if (updates.length) {
              notices.success(`Processed "${sharedFile.name}" for ${config.scannerName}`);
            } else {
              notices.info(`No data for this tool in "${sharedFile.name}". Other scanners can still use it.`);
            }
          } catch (err) {
            if (!isCurrent() || err?.name === "AbortError") return;
            console.error(`Failed to process ${sharedFile.name}:`, err);
            const message = ["QuotaExceededError", "ProcessingBudgetError"].includes(err?.name)
              ? storageFailureMessage(err, `save scan results for "${sharedFile.name}"`)
              : `Failed to process "${sharedFile.name}": ${err.message || "Unknown error"}`;
            setError(message);
            notices.error(message);
          }
        }
      } catch (err) {
        if (!isCurrent()) return;
        console.error(`Failed to hydrate ${config.scannerName}:`, err);
        setError(`Failed to load saved scanner results: ${err.message}`);
        toast.error(`Failed to load ${config.scannerName} data.`);
      } finally {
        if (isCurrent()) setLoading(false);
      }
    };
    run();
    return () => {
      active = false;
      controller.abort();
      notices.clear();
      unregister();
    };
  }, [config, sharedFiles, filesReady, lifecycleVersion, getGeneration, enqueueMutation, registerCancellation, notifyCommitted]);

  return { data, loading, error, unavailableFiles };
}
