export const ARCHIVE_UNAVAILABLE_MESSAGE =
  "Archive unavailable — re-upload to scan in another tool";

// Persisted blobs are restored as named Files for parsers; legacy metadata
// without a blob remains unavailable until the user uploads an archive.
export function restoreSharedFiles(metadata, liveFiles = []) {
  const archives = new Map(liveFiles.map(({ id, file }) => [id, file]));
  return metadata.map((entry) => {
      const archive = entry.file ?? archives.get(entry.id) ?? null;
      const file = archive && typeof File !== "undefined" && !(archive instanceof File)
        ? new File([archive], entry.name, { type: archive.type, lastModified: entry.uploadedAt })
        : archive;
      return { ...entry, file };
    });
}

export function getUnavailableArchives(sharedFiles, processedFiles) {
  return sharedFiles.filter(({ id, file }) => !file && !processedFiles.has(id));
}

export function storageFailureMessage(error, action) {
  if (error?.name === "ArchiveLimitError" || error?.name === "ProcessingBudgetError") return error.message;
    if (error?.name === "QuotaExceededError") {
    return `Browser storage is full. Could not ${action}. Remove unneeded files and cached results using Upload File, then try again. Your datapacks are never uploaded.`;
  }
  return `Could not ${action}. Try again; if this keeps happening, check that browser storage is available.`;
}
