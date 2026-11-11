export default function ScannerErrorNotice({ error }) {
  if (!error) return null;

  return (
    <section role="alert" className="rounded-md border border-border bg-bg-surface-2 p-3 text-sm text-text-secondary">
      <h2 className="font-medium text-text-primary">Scan could not finish</h2>
      <p className="mt-1 whitespace-pre-wrap wrap-break-word text-xs text-text-primary">{error}</p>
      <details className="mt-2 text-xs leading-relaxed">
        <summary className="w-fit cursor-pointer text-text-secondary hover:text-text-primary">How to retry</summary>
        <p className="mt-2">
          After addressing the error, select the original archive again using Upload File.
          Matching content and repair policy retain existing results; unprocessed scans retry.
          There is no need to remove saved results first.
        </p>
        <p className="mt-2">
          For a storage-quota error, free browser storage. For a processing-budget error,
          use a smaller archive. Compatibility parsing does not bypass safety limits;
          enable it only for malformed JSON, and verify any repaired results against the source.
        </p>
      </details>
    </section>
  );
}
