export default function SpawnParseDiagnostics({ reports = [] }) {
  const warnings = reports.filter((report) => report.diagnostics?.total > 0);
  if (!warnings.length) return null;

  return (
    <details className="rounded-md border border-border bg-bg-surface-2 p-3 text-sm text-text-secondary">
      <summary className="cursor-pointer font-medium text-text-primary">
        Parse warnings · {warnings.length} {warnings.length === 1 ? "archive" : "archives"}
      </summary>
      <p className="mt-2 text-xs leading-relaxed">
        Some content needed best-effort JSON repair or was skipped. Results may be
        incomplete or altered by repair; check the source files before relying on them.
        These reports are saved as processed, not automatically retried. After fixing
        the pack, remove its entry and re-upload to scan it again. Removing an entry
        deletes its cached results in every tool.
      </p>
      {warnings.map((report) => (
        <section key={report.id} className="mt-3 border-t border-border pt-3">
          <h3 className="break-all font-medium text-text-primary">{report.name}</h3>
          <p className="mt-1 text-xs text-text-muted">
            {report.data.length} rows retained · {report.diagnostics.repairCount} repair notices · {report.diagnostics.skipCount} skip notices
          </p>
          <ul className="mt-2 max-h-64 space-y-2 overflow-auto text-xs">
            {report.diagnostics.entries.map((entry, index) => (
              <li key={index} className="wrap-break-word">
                <code className="break-all text-text-primary">{entry.path}</code>
                <span className="ml-2 text-text-muted">[{entry.code}]</span>
                <p className="mt-0.5">{entry.message}</p>
              </li>
            ))}
          </ul>
          {report.diagnostics.omittedCount > 0 && (
            <p className="mt-2 text-xs text-text-muted">
              {report.diagnostics.omittedCount} additional notices omitted to keep the report small.
            </p>
          )}
        </section>
      ))}
    </details>
  );
}
