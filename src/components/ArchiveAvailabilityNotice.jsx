export default function ArchiveAvailabilityNotice({ files }) {
  if (!files.length) return null;

  return (
    <section role="status" className="rounded-md border border-border bg-bg-surface-2 p-3 text-sm text-text-secondary">
      <h2 className="font-medium text-text-primary">Archive unavailable for this scanner</h2>
      <p className="mt-1">
        These packs are still listed, but the original files are missing.
        Add the files again through Shared files or the dropzone to scan them here.
        Results from earlier scans are still available.
      </p>
      <ul className="mt-2 list-disc pl-5">
        {files.map((file) => <li key={file.id} className="break-all">{file.name}</li>)}
      </ul>
      <p className="mt-2 text-xs text-text-muted">
        The same SHA-256 content and repair policy reconnect to the existing ID and results,
                even after renaming. Different content or repair policy creates a separate entry.
                Legacy metadata without a fingerprint cannot safely reconnect by filename;
                it creates a new entry and keeps the old caches. Removing an archive atomically
                removes its associated reports too.
      </p>
    </section>
  );
}
