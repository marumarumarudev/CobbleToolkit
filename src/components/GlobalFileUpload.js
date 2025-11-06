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
      f.name.toLowerCase().match(/\.(zip|jar)$/)
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
      f.name.toLowerCase().match(/\.(zip|jar)$/)
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
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-mono hover:text-yellow-400 hover:bg-[#2a2a2a]/50"
        title="Upload shared files"
      >
        <Upload size={16} />
        <span className="hidden sm:inline">Upload File</span>
        {sharedFiles.length > 0 && (
          <span className="bg-yellow-400/20 text-yellow-400 px-1.5 py-0.5 rounded text-xs">
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
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-[#1c1c1c] border border-[#333] rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-4 border-b border-[#333]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-yellow-400">
                  Shared Files
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
                  isDragging
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-gray-600 hover:border-gray-500"
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
                    f.name.toLowerCase().match(/\.(zip|jar)$/)
                  );
                  if (!files.length) {
                    toast.error("Only .zip or .jar files allowed.");
                    return;
                  }
                  handleFiles(files);
                }}
                onClick={() => document.getElementById("globalFileInput").click()}
              >
                <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-xs text-gray-300 mb-1">
                  Drop files here or click to upload
                </p>
                <p className="text-xs text-gray-500">
                  .zip or .jar files only
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
                <div className="p-4 text-center text-gray-400 text-sm">
                  No shared files uploaded
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {sharedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2 bg-[#2a2a2a] rounded hover:bg-[#333] transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <File size={14} className="text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeSharedFile(file.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors p-1"
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
              <div className="p-3 border-t border-[#333]">
                <button
                  onClick={async () => {
                    if (
                      window.confirm(
                        "Are you sure you want to clear all shared files?"
                      )
                    ) {
                      await clearSharedFiles();
                    }
                  }}
                  className="w-full px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-xs transition-colors"
                >
                  Clear All Files
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

