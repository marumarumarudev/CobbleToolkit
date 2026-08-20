"use client";

import { useState } from "react";
import { Upload, X, File } from "lucide-react";
import { useSharedFiles } from "@/contexts/SharedFilesContext";
import toast from "react-hot-toast";

export default function GlobalFileUpload() {
  const { sharedFiles, addSharedFile, removeSharedFile, clearSharedFiles } =
    useSharedFiles();
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = async (files) => {
    const valid = Array.from(files).filter((f) =>
      f.name.toLowerCase().match(/\.(zip|jar)$/),
    );

    if (!valid.length) {
      toast.error("Only .zip or .jar files allowed.");
      return;
    }

    for (const file of valid) {
      await addSharedFile(file);
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
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-150 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-surface-2"
        title="Upload shared files"
      >
        <Upload size={16} />
        <span className="hidden sm:inline">Upload File</span>
        {sharedFiles.length > 0 && (
          <span className="bg-accent-soft text-accent px-1.5 py-0.5 rounded text-[11px]">
            {sharedFiles.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown — capped to viewport width so it never clips off-screen
              on narrow phones, while staying w-80 on wider viewports. */}
          <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] bg-bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-accent">
                  Shared Files
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-text-muted hover:text-text-primary transition-colors p-1 -m-1"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
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
                onClick={() =>
                  document.getElementById("globalFileInput").click()
                }
              >
                <Upload size={24} className="mx-auto mb-2 text-text-muted" />
                <p className="text-xs text-text-secondary mb-1">
                  Drop files here or click to upload
                </p>
                <p className="text-xs text-text-muted">.zip or .jar files only</p>
                <p className="text-xs text-text-muted mt-1">
                  This is the one place to add or remove files — removing a
                  file here clears its data from every tool.
                </p>
                <input
                  id="globalFileInput"
                  type="file"
                  multiple
                  accept=".zip,.jar"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* File List */}
            <div className="max-h-64 overflow-y-auto">
              {sharedFiles.length === 0 ? (
                <div className="p-4 text-center text-text-muted text-sm">
                  No shared files uploaded
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {sharedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2 bg-bg-surface-2 rounded hover:bg-bg-surface-hover transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <File size={14} className="text-text-muted shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-text-primary truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-text-muted">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeSharedFile(file.id)}
                        className="text-text-muted hover:text-danger transition-colors p-1.5 -m-1"
                        title="Remove file and clear its data from every tool"
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
              <div className="p-3 border-t border-border">
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
                  className="w-full px-3 py-2.5 bg-danger-soft hover:bg-danger/20 text-danger rounded text-xs transition-colors"
                >
                  Clear All Files &amp; Data
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
