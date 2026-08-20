"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileArchive } from "lucide-react";

/**
 * Standardized "drop your datapack" zone. Purely presentational + drag/drop +
 * native file picker wiring — callers own what happens to the FileList.
 *
 *   <FileDropzone
 *     accept=".zip"
 *     multiple
 *     onFiles={(fileList) => handle(fileList)}
 *     hint="ZIP, or a folder exported as ZIP"
 *   />
 */
export default function FileDropzone({
  accept,
  multiple = false,
  onFiles,
  label = "Drop your datapack here",
  hint = "or click to browse",
  className = "",
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (fileList) => {
      if (fileList && fileList.length > 0) onFiles?.(fileList);
    },
    [onFiles]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={[
        "flex flex-col items-center justify-center gap-2 rounded-lg cursor-pointer",
        "border-2 border-dashed px-6 py-10 text-center transition-colors duration-150",
        isDragging
          ? "border-accent bg-accent-soft"
          : "border-border hover:border-border-hover bg-bg-surface",
        className,
      ].join(" ")}
    >
      <div
        className={[
          "flex h-10 w-10 items-center justify-center rounded-full",
          isDragging ? "bg-accent text-accent-ink" : "bg-bg-surface-2 text-text-secondary",
        ].join(" ")}
      >
        {isDragging ? <UploadCloud size={18} /> : <FileArchive size={18} />}
      </div>
      <p className="text-sm font-medium text-text-primary">{label}</p>
      <p className="text-xs text-text-muted">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
