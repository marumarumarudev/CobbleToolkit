"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { validateFileStructure } from "@/utils/fileValidation";
import getStorage from "@/utils/indexedDBStorage";
import { createScannerCoordinator } from "@/utils/scannerCoordinator";
import { restoreSharedFiles, storageFailureMessage } from "@/utils/archiveAvailability";
import { createSharedFilesSync } from "@/utils/sharedFilesSync";
import { MAX_ARCHIVE_BYTES } from "@/utils/archiveLimits";

const SharedFilesContext = createContext(null);

export function SharedFilesProvider({ children }) {
  const [sharedFiles, setSharedFiles] = useState([]);
  const [filesReady, setFilesReady] = useState(false);
    const [storageNotice, setStorageNotice] = useState(null);
  const [lifecycleVersion, setLifecycleVersion] = useState(0);
  const filesRef = useRef([]);
  const hydratedRef = useRef(false);
  const cancellations = useRef(new Set());
  const syncRef = useRef(null);
  const coordinatorRef = useRef(null);
  if (!coordinatorRef.current) coordinatorRef.current = createScannerCoordinator();
  const { enqueue: enqueueMutation, getGeneration, invalidate } = coordinatorRef.current;

  const publish = useCallback((files) => {
    filesRef.current = files;
    setSharedFiles(files);
  }, []);
  const invalidateScans = useCallback(() => {
    invalidate();
    cancellations.current.forEach((cancel) => cancel());
    setLifecycleVersion((version) => version + 1);
  }, [invalidate]);
  const registerCancellation = useCallback((cancel) => {
    cancellations.current.add(cancel);
    return () => cancellations.current.delete(cancel);
  }, []);
  const notifyCommitted = useCallback(() => syncRef.current?.publish("changed"), []);

  useEffect(() => {
    let active = true;
    const refresh = () => enqueueMutation(async () => {
      const files = await getStorage().loadSharedArchives();
      if (!active) return;
      publish(restoreSharedFiles(files));
      hydratedRef.current = true;
      setFilesReady(true);
    }).catch((err) => {
      if (!active) return;
      console.error("Failed to load shared archives:", err);
      toast.error("Failed to load shared archives. Check browser storage and reload.");
    });
    const onRemoteChange = () => {
      invalidateScans();
      refresh();
    };
    const onStorageBlocked = (event) => setStorageNotice(event.detail
          ? "Close other CobbleToolkit tabs to finish upgrading browser storage. Saved data will be retained; this tab will continue automatically."
          : null);
        window.addEventListener("cobbletoolkit:storage-blocked", onStorageBlocked);
        const sync = createSharedFilesSync(onRemoteChange, window);
    syncRef.current = sync;
    // Also recover from missed notifications (suspended tabs / unavailable channel).
    window.addEventListener("focus", onRemoteChange);
    refresh();
    return () => {
      active = false;
      sync.close();
      syncRef.current = null;
      window.removeEventListener("focus", onRemoteChange);
            window.removeEventListener("cobbletoolkit:storage-blocked", onStorageBlocked);
    };
  }, [enqueueMutation, invalidateScans, publish]);

  const addSharedFile = useCallback((file, { allowRepairs = false } = {}) => {
    if (!file) return Promise.resolve(false);
    return enqueueMutation(async () => {
      const toastId = `validate-${crypto.randomUUID()}`;
      toast.loading(`Validating "${file.name}"...`, { id: toastId });
      try {
        if (!hydratedRef.current) throw new Error("Shared files have not loaded");
        if (file.size > MAX_ARCHIVE_BYTES) throw Object.assign(new Error("Archive exceeds 512 MiB. Choose a smaller archive."), { name: "ArchiveLimitError" });
        const validation = await validateFileStructure(file);
        if (!validation.valid) {
          toast.error(validation.reason, { id: toastId });
          return false;
        }
        const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
        const contentHash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
        const existing = filesRef.current.find((entry) => entry.contentHash === contentHash && entry.allowRepairs === allowRepairs);
        await getStorage().persistSharedArchive({
          id: crypto.randomUUID(), name: file.name, size: file.size,
          uploadedAt: Date.now(), contentHash, allowRepairs,
        }, file);
        publish(restoreSharedFiles(await getStorage().loadSharedArchives()));
        notifyCommitted();
        toast.success(existing ? `Reconnected "${existing.name}" — saved results retained` : `Saved "${file.name}" in this browser`, { id: toastId });
        return true;
      } catch (err) {
        console.error("Failed to add shared archive:", err);
        toast.error(storageFailureMessage(err, `save "${file.name}"`), { id: toastId });
        return false;
      }
    });
  }, [enqueueMutation, publish, notifyCommitted]);

  const purge = useCallback((fileId) => {
    invalidateScans();
    syncRef.current?.publish("invalidate");
    return enqueueMutation(async () => {
      try {
        if (!hydratedRef.current) throw new Error("Shared files have not loaded");
        await getStorage().purgeSharedFiles(fileId);
        publish(restoreSharedFiles(await getStorage().loadSharedArchives()));
        toast.success(fileId === null ? "All archives and tool data cleared" : "Archive and its results removed from every tool");
        return true;
      } catch (err) {
        console.error("Failed to purge shared files:", err);
        toast.error("Could not clear file data. Try again; no success was confirmed.");
        return false;
      } finally {
        setLifecycleVersion((version) => version + 1);
        notifyCommitted();
      }
    });
  }, [enqueueMutation, invalidateScans, notifyCommitted, publish]);

  const removeSharedFile = useCallback((fileId) => purge(fileId), [purge]);
  const clearSharedFiles = useCallback(() => purge(null), [purge]);

  return (
    <SharedFilesContext.Provider value={{
      sharedFiles, filesReady, lifecycleVersion, getGeneration, enqueueMutation,
      registerCancellation, notifyCommitted, addSharedFile, removeSharedFile, clearSharedFiles,
    }}>
      {storageNotice && <div role="status" className="border-b border-border bg-bg-surface-2 px-4 py-3 text-sm text-text-primary">{storageNotice}</div>}
      {children}
    </SharedFilesContext.Provider>
  );
}

export function useSharedFiles() {
  const context = useContext(SharedFilesContext);
  if (!context) throw new Error("useSharedFiles must be used within SharedFilesProvider");
  return context;
}
