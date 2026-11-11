"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Upload, X, File } from "lucide-react";
import { useSharedFiles } from "@/contexts/SharedFilesContext";
import toast from "react-hot-toast";
import { ARCHIVE_UNAVAILABLE_MESSAGE } from "@/utils/archiveAvailability";

export default function GlobalFileUpload() {
  const { sharedFiles, addSharedFile, removeSharedFile, clearSharedFiles } =
    useSharedFiles();
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
    const [allowRepairs, setAllowRepairs] = useState(false);
    const inputRef = useRef(null);
    const triggerRef = useRef(null);
    const dialogRef = useRef(null);
    const headingId = useId();

    useEffect(() => {
      if (!isOpen) return;
      dialogRef.current?.focus();
      const trigger = triggerRef.current;
      return () => trigger?.focus();
    }, [isOpen]);

  const handleFiles = async (files) => {
    const valid = Array.from(files).filter((f) =>
      f.name.toLowerCase().match(/\.(zip|jar)$/),
    );

    if (!valid.length) {
      toast.error("Only .zip or .jar files allowed.");
      return;
    }

    for (const file of valid) {
      await addSharedFile(file, { allowRepairs });
    }
  };

  const handleInputChange = (e) => {
    const files = Array.from(e.target.files).filter((f) =>
      f.name.toLowerCase().match(/\.(zip|jar)$/),
    );
    if (!files.length) {
      toast.error("Only .zip or .jar files allowed.");
      return;
    }
    handleFiles(files);
    e.target.value = "";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md border border-accent/30 bg-bg-base px-3 py-2 text-xs font-semibold text-accent shadow-sm transition-colors duration-150 hover:bg-bg-surface-2 hover:border-accent"
        aria-label={sharedFiles.length ? `Upload shared files (${sharedFiles.length} files)` : "Upload shared files"}
        title="Upload shared files"
      >
        <Upload size={16} aria-hidden="true" />
        <span className="hidden sm:inline">Shared files</span>
        {sharedFiles.length > 0 && (
          <span className="bg-accent-soft text-accent px-1.5 py-0.5 rounded text-[11px]">
            {sharedFiles.length}
          </span>
        )}
      </button>

      {isOpen && createPortal(
        <>
          {/* Backdrop — above the sticky nav so the panel is fully interactive */}
          <div
            className="fixed inset-0 z-60 bg-black/40"
            onClick={() => setIsOpen(false)}
          />

          {/* Portal outside the filtered/scrolling nav so fixed positioning
              stays relative to the viewport, including after page scroll. */}
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            tabIndex={-1}
            onKeyDown={(event) => {
              if (event.key === "Escape") { event.preventDefault(); setIsOpen(false); }
              if (event.key !== "Tab") return;
              const controls = Array.from(event.currentTarget.querySelectorAll('button:not(:disabled), input:not(:disabled), [tabindex="0"]')).filter((element) => element.offsetParent !== null);
              const first = controls[0];
              const last = controls[controls.length - 1];
              if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last?.focus(); }
              else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
            }}
            className="fixed z-70 flex max-h-[min(32rem,calc(100vh-2rem))] w-[min(20rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-border bg-bg-surface shadow-xl
              left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
              md:left-auto md:right-4 md:top-16 md:translate-x-0 md:translate-y-0"
          >
            <div className="shrink-0 border-b border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 id={headingId} className="text-sm font-semibold text-accent">
                  Shared Files
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close shared files"
                  className="p-1 -m-1 text-text-muted transition-colors hover:text-text-primary"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Upload Area */}
              <div
                role="button"
                tabIndex={0}
                aria-label="Choose ZIP or JAR archives"
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") { event.preventDefault(); inputRef.current?.click(); }
                }}
                className={`cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
                  isDragging
                    ? "border-accent bg-accent-soft"
                    : "border-border hover:border-border-hover"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const files = Array.from(e.dataTransfer.files).filter((f) =>
                    f.name.toLowerCase().match(/\.(zip|jar)$/),
                  );
                  if (!files.length) {
                    toast.error("Only .zip or .jar files allowed.");
                    return;
                  }
                  handleFiles(files);
                }}
                onClick={() => inputRef.current?.click()}
              >
                <Upload size={24} className="mx-auto mb-2 text-text-muted" />
                <p className="mb-1 text-xs text-text-secondary">
                  Drop files here or click to upload
                </p>
                <p className="text-xs text-text-muted">.zip or .jar files only</p>
                <p className="mt-1 text-xs text-text-muted">
                  Archives and results are saved in this browser, including after refresh.
                  512 MiB per archive · 1024 MiB stored archives total.
                  Removing an archive clears its results from every tool.
                </p>
                <input
                  ref={inputRef}
                                    aria-label="Archive files"
                  type="file"
                  multiple
                  accept=".zip,.jar"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </div>
              <label className="mt-3 flex items-start gap-2 text-xs text-text-secondary">
                <input type="checkbox" checked={allowRepairs} onChange={(event) => setAllowRepairs(event.target.checked)} className="mt-0.5" />
                <span>Allow compatibility JSON repairs for this upload. Repairs may alter values; review parse warnings. Strict JSON is the default.</span>
              </label>
            </div>

            {/* File List — scrolls inside the panel */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {sharedFiles.length === 0 ? (
                <div className="p-4 text-center text-sm text-text-muted">
                  No shared files uploaded
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {sharedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between rounded bg-bg-surface-2 p-2 transition-colors hover:bg-bg-surface-hover"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <File size={14} className="shrink-0 text-text-muted" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs text-text-primary">
                            {file.name}
                          </p>
                          <p className="text-xs text-text-muted">
                            {formatFileSize(file.size)} · {file.allowRepairs === false ? "Strict JSON" : "Compatibility repairs"}
                          </p>
                          {!file.file && (
                            <p className="mt-1 text-xs text-text-secondary">
                              {ARCHIVE_UNAVAILABLE_MESSAGE}. Identical content and repair policy reconnect when a fingerprint is available; legacy entries without one stay separate.
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeSharedFile(file.id)}
                        className="p-1.5 -m-1 text-text-muted transition-colors hover:text-danger"
                        title="Remove file and clear its data from every tool"
                                                aria-label={`Remove ${file.name}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {sharedFiles.length > 0 && (
              <div className="shrink-0 border-t border-border p-3">
                <button
                  onClick={async () => {
                    if (
                      window.confirm(
                        "Clear all shared files and their parsed data in every tool? This cannot be undone.",
                      )
                    ) {
                      await clearSharedFiles();
                    }
                  }}
                  className="w-full rounded bg-danger-soft px-3 py-2.5 text-xs text-danger transition-colors hover:bg-danger/20"
                >
                  Clear All Files &amp; Data
                </button>
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
