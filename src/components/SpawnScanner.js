"use client";

import { useState, useEffect, useRef } from "react";
import { parseCobblemonZip } from "@/utils/spawnParser";
import toast from "react-hot-toast";
import { ChevronDown, ChevronUp, ChevronsUpDown, X } from "lucide-react";
import Spinner from "./Spinner";

export default function UploadArea() {
  const [fileReports, setFileReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchField, setSearchField] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [contextFilter, setContextFilter] = useState("all");
  const [sort, setSort] = useState({ column: "bucket", direction: "asc" });
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
    fileName: "",
  });
  const [storageUsage, setStorageUsage] = useState({
    used: 0,
    limit: 0,
    percentage: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 50;

  useEffect(() => {
    try {
      const saved = localStorage.getItem("spawn_reports");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setFileReports(parsed);
      }
    } catch (err) {
      console.error("Failed to load spawn reports from localStorage:", err);
      toast.error(
        "❌ Couldn't load saved reports. Storage might be corrupted."
      );
    }

    // Chrome-specific memory optimization
    if (
      navigator.userAgent.includes("Chrome") ||
      navigator.userAgent.includes("Chromium")
    ) {
      console.log("Chrome detected - enabling memory optimizations");
      // Set memory pressure hints for Chrome
      if ("memory" in performance) {
        console.log(
          "Available memory:",
          Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          "MB used"
        );
      }
    }

    // Calculate initial storage usage
    updateStorageUsage();
  }, []);

  // on sort change
  useEffect(() => {
    localStorage.setItem("spawn_sort", JSON.stringify(sort));
  }, [sort]);

  // on load
  useEffect(() => {
    const savedSort = localStorage.getItem("spawn_sort");
    if (savedSort) {
      try {
        setSort(JSON.parse(savedSort));
      } catch {}
    }
  }, []);

  const prevSearch = useRef("");

  const isStorageNearLimit = () => {
    try {
      const testKey = "__storage_test__";
      const oneKb = "x".repeat(1024);
      for (let i = 0; i < 5 * 1024; i++) {
        localStorage.setItem(testKey, oneKb.repeat(i));
      }
    } catch (e) {
      return true;
    } finally {
      localStorage.removeItem("__storage_test__");
    }
    return false;
  };

  useEffect(() => {
    if (prevSearch.current !== "" && searchTerm === "") {
      // Reset search state when clearing search
      setCurrentPage(1);
    }
    prevSearch.current = searchTerm;
  }, [searchTerm]);

  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 200);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const availableContexts = Array.from(
    new Set(
      fileReports
        .flatMap((r) => r.data.map((d) => d.context))
        .filter((c) => typeof c === "string" && c.length > 0)
    )
  ).sort();

  const rarityOrder = {
    common: 0,
    uncommon: 1,
    rare: 2,
    "ultra-rare": 3,
  };

  const TABLE_COLUMNS = [
    { key: "pokemon", label: "Pokémon", sortable: true },
    { key: "bucket", label: "Rarity", sortable: true },
    { key: "level", label: "Level", sortable: true },
    { key: "weight", label: "Weight", sortable: true },
    { key: "context", label: "Context", sortable: true },
    { key: "biomes", label: "Biomes", sortable: true },
    { key: "dimensions", label: "Dimensions", sortable: true },
    { key: "canSeeSky", label: "Can See Sky", sortable: true },
    { key: "structures", label: "Structures", sortable: true },
    { key: "isRaining", label: "Raining", sortable: true },
    { key: "moonPhase", label: "Moon Phase", sortable: true },
    { key: "neededNearbyBlocks", label: "Nearby Blocks", sortable: true },
    { key: "timeRange", label: "Time", sortable: true },
    { key: "lightLevel", label: "Light Level", sortable: true },
    { key: "antiBiomes", label: "Anti-Biomes", sortable: false },
    { key: "antiStructures", label: "Anti-Structures", sortable: false },
    { key: "sourceFile", label: "Source File", sortable: true },
  ];

  // Get rarity color
  const getRarityColor = (bucket) => {
    switch (bucket) {
      case "common":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "uncommon":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "rare":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "ultra-rare":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  // Combine all spawn data from all files
  const allSpawnData = fileReports
    .filter((r) => !r.error)
    .flatMap((r) =>
      r.data.map((d) => ({
        ...d,
        sourceFile: r.name,
      }))
    );

  // Filter and search the combined data
  const filteredData = allSpawnData.filter((r) => {
    const matchesContext =
      contextFilter === "all" || r.context === contextFilter;

    if (!matchesContext) return false;
    if (!searchTerm) return true;

    if (searchField === "all") {
      return [
        r.pokemon,
        r.bucket,
        r.level,
        r.weight,
        r.context,
        r.biomes,
        r.dimensions,
        r.structures,
        r.canSeeSky?.toString(),
        r.isRaining?.toString(),
        r.moonPhase,
        r.neededNearbyBlocks,
        r.timeRange,
        r.lightLevel,
        r.antiBiomes,
        r.antiStructures,
        r.sourceFile,
      ]
        .filter(Boolean)
        .some(
          (value) =>
            typeof value === "string" &&
            value.toLowerCase().includes(searchTerm.toLowerCase())
        );
    } else {
      const value = r[searchField];
      return (
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  });

  // Sort the filtered data
  const sortedData = [...filteredData].sort((a, b) => {
    const { column, direction } = sort;
    let valA = a[column] ?? "";
    let valB = b[column] ?? "";

    if (column === "bucket") {
      valA = rarityOrder[valA] ?? 99;
      valB = rarityOrder[valB] ?? 99;
    }

    if (valA < valB) return direction === "asc" ? -1 : 1;
    if (valA > valB) return direction === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate the sorted data
  const paginatedData = sortedData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Get visible columns based on available data
  const visibleColumns = TABLE_COLUMNS.filter(({ key }) =>
    filteredData.some((d) => {
      const value = d[key];
      return Array.isArray(value)
        ? value.length > 0
        : typeof value === "boolean"
        ? true
        : value !== null && value !== undefined && value !== "";
    })
  );

  const toggleSort = (column) => {
    setSort((prev) => ({
      column,
      direction:
        prev.column === column && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, contextFilter, searchField]);

  const handleFiles = async (files) => {
    if (loading) {
      toast.error("Please wait, still parsing previous files.");
      return;
    }

    // Check file sizes before processing
    const maxFileSize = 150 * 1024 * 1024; // 150MB limit
    const oversizedFiles = files.filter((f) => f.size > maxFileSize);

    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map((f) => f.name).join(", ");
      toast.error(`Files too large (max 150MB): ${fileNames}`);
      return;
    }

    setLoading(true);

    const existingNames = new Set(fileReports.map((r) => r.name));
    const newFiles = files.filter((f) => !existingNames.has(f.name));
    const skippedCount = files.length - newFiles.length;

    if (skippedCount > 0) {
      toast(
        `Skipped ${skippedCount} duplicate file${skippedCount > 1 ? "s" : ""}.`
      );
    }

    if (newFiles.length === 0) {
      setLoading(false);
      setUploadProgress({ current: 0, total: 0, fileName: "" });
      return;
    }

    setUploadProgress({ current: 0, total: newFiles.length, fileName: "" });

    const isBulk = newFiles.length > 1;

    const parsedReports = [];

    try {
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        setUploadProgress({
          current: i + 1,
          total: newFiles.length,
          fileName: file.name,
        });

        // Add timeout protection for individual file processing
        const fileTimeout = setTimeout(() => {
          console.warn(`File processing timeout for ${file.name}`);
          // Reset loading state if timeout occurs
          setLoading(false);
          setUploadProgress({ current: 0, total: 0, fileName: "" });
          toast.error(
            `${file.name}: Processing timeout - file may be corrupted or too large.`
          );
        }, 45000); // 45 second timeout per file

        try {
          const parsed = await parseCobblemonZip(file);
          clearTimeout(fileTimeout); // Clear timeout if successful

          const hasData = parsed.length > 0;

          parsedReports.push({
            id: crypto.randomUUID(),
            name: file.name,
            data: parsed,
            error: hasData ? null : "No valid spawn data found.",
          });

          // Small delay to allow garbage collection between files
          if (i < newFiles.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
        } catch (err) {
          clearTimeout(fileTimeout); // Clear timeout on error

          const message = err.message || "Failed to parse file.";

          if (message.includes("spawn_pool_world")) {
            toast.error(`${file.name}: No spawn_pool_world folder.`);
          } else if (message.includes("timeout")) {
            toast.error(
              `${file.name}: Processing timeout - file may be corrupted or too large.`
            );
          } else if (message.includes("memory") || message.includes("quota")) {
            toast.error(
              `${file.name}: Memory error - file too large for browser to handle.`
            );
          } else {
            console.error(`❌ Failed to parse ${file.name}`, err);
            toast.error(`${file.name}: ${message}`);
          }

          parsedReports.push({
            id: crypto.randomUUID(),
            name: file.name,
            data: [],
            error: message,
          });
        }
      }
    } finally {
      // Always reset loading state, even if there are errors
      setLoading(false);
      setUploadProgress({ current: 0, total: 0, fileName: "" });
    }

    const updated = [...parsedReports, ...fileReports];

    // Progressive localStorage saving to prevent Chrome hanging
    try {
      // Auto-cleanup if storage is nearly full
      autoCleanupStorage();

      // Check storage size before saving
      const dataSize = JSON.stringify(updated).length;
      const maxStorageSize = 5 * 1024 * 1024; // 5MB limit

      if (dataSize > maxStorageSize) {
        // If data is too large, try to save only recent reports
        const recentReports = updated.slice(0, Math.min(updated.length, 50)); // Keep only 50 most recent
        const recentSize = JSON.stringify(recentReports).length;

        if (recentSize <= maxStorageSize) {
          localStorage.setItem("spawn_reports", JSON.stringify(recentReports));
          setFileReports(recentReports);
          toast.warning(
            `⚠️ Data too large for storage. Keeping only ${recentReports.length} most recent reports.`
          );
        } else {
          // Even recent reports are too large, clear storage and save only current batch
          localStorage.removeItem("spawn_reports");
          setFileReports(parsedReports);
          toast.error(
            "⚠️ Data too large for storage. Only current batch will be displayed."
          );
        }
      } else {
        // Normal save
        localStorage.setItem("spawn_reports", JSON.stringify(updated));
        setFileReports(updated);
      }
    } catch (err) {
      if (
        err instanceof DOMException &&
        (err.name === "QuotaExceededError" ||
          err.name === "NS_ERROR_DOM_QUOTA_REACHED")
      ) {
        console.error("❌ Local storage is full. Please clear old reports.");
        toast.error(
          "❌ Storage full. Please clear old reports before adding new ones."
        );

        // Try to save only current batch
        try {
          const batchData = JSON.stringify(parsedReports);
          if (batchData.length <= 5 * 1024 * 1024) {
            // 5MB limit
            localStorage.setItem("spawn_reports", batchData);
            setFileReports(parsedReports);
            toast.warning("⚠️ Cleared storage and saved only current batch.");
          } else {
            setFileReports(parsedReports);
            toast.error(
              "⚠️ Could not save to storage. Data will be lost on page refresh."
            );
          }
        } catch (saveErr) {
          setFileReports(parsedReports);
          toast.error("⚠️ Storage error. Data will be lost on page refresh.");
        }
      } else {
        console.error("Failed to save to localStorage:", err);
        toast.error("⚠️ Failed to save data. It will be lost on page refresh.");
        setFileReports(updated);
      }
    }

    // Clean up memory after processing
    cleanupMemory();
    updateStorageUsage(); // Update storage usage after saving

    // Always reset loading state
    setLoading(false);
    setUploadProgress({ current: 0, total: 0, fileName: "" });
  };

  const handleInputChange = (e) => {
    const files = Array.from(e.target.files).filter(
      (file) =>
        file.name.toLowerCase().endsWith(".zip") ||
        file.name.toLowerCase().endsWith(".jar")
    );
    if (files.length === 0) {
      toast.error("Only valid .zip files are supported.");
      return;
    }
    handleFiles(files);
  };

  const clearAll = () => {
    setFileReports([]);
    setSort({ column: "pokemon", direction: "asc" });
    localStorage.removeItem("spawn_reports");
    updateStorageUsage(); // Update storage usage after clearing
  };

  // Memory cleanup for Chrome
  const cleanupMemory = () => {
    if (
      navigator.userAgent.includes("Chrome") ||
      navigator.userAgent.includes("Chromium")
    ) {
      // Force garbage collection if available
      if (typeof window !== "undefined" && window.gc) {
        try {
          window.gc();
        } catch (e) {
          // gc() might not be available
        }
      }

      // Clear any cached data
      if ("caches" in window) {
        try {
          caches
            .keys()
            .then((names) =>
              Promise.allSettled(names.map((name) => caches.delete(name)))
            )
            .catch(() => {});
        } catch (e) {
          // ignore
        }
      }

      // Clear console to free memory
      if (console.clear) {
        try {
          console.clear();
        } catch (e) {
          // console.clear might not be available
        }
      }
    }
  };

  // Calculate storage usage
  const updateStorageUsage = () => {
    try {
      const saved = localStorage.getItem("spawn_reports");
      if (saved) {
        const used = new Blob([saved]).size;
        const limit = 5 * 1024 * 1024; // 5MB limit
        const percentage = Math.round((used / limit) * 100);
        setStorageUsage({ used, limit, percentage });
      } else {
        setStorageUsage({ used: 0, limit: 5 * 1024 * 1024, percentage: 0 });
      }
    } catch (err) {
      setStorageUsage({ used: 0, limit: 5 * 1024 * 1024, percentage: 0 });
    }
  };

  // Auto-cleanup storage when it gets too full
  const autoCleanupStorage = () => {
    if (storageUsage.percentage > 90) {
      try {
        const saved = localStorage.getItem("spawn_reports");
        if (saved) {
          const reports = JSON.parse(saved);
          // Keep only the 25 most recent reports
          const cleanedReports = reports.slice(0, 25);
          localStorage.setItem("spawn_reports", JSON.stringify(cleanedReports));
          setFileReports(cleanedReports);
          updateStorageUsage();
          toast.warning(
            "⚠️ Storage was nearly full. Automatically removed old reports."
          );
        }
      } catch (err) {
        console.error("Auto-cleanup failed:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white px-4 py-8 flex flex-col items-center">
      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Cobblemon Spawn Pool Scanner
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Analyze Cobblemon spawn pools (.zip & .jar) to view Pokémon rarities,
          biomes, structures, and more.
        </p>
        <br />
        <p className="text-gray-300 text-sm text-center mt-2">
          View spawn tags like <code>#cobblemon:is_arid</code> in the{" "}
          <a
            href="https://wiki.cobblemon.com/index.php/Pok%C3%A9mon/Spawning/Spawn_Definitions"
            className="text-blue-400 underline hover:text-blue-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cobblemon Spawn Definitions Wiki
          </a>
          .
        </p>
      </header>

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-600 rounded p-6 w-full max-w-2xl text-center bg-[#2c2c2c] hover:bg-[#3a3a3a] transition cursor-pointer mb-8"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const files = Array.from(e.dataTransfer.files).filter(
            (file) => file.name.endsWith(".zip") || file.name.endsWith(".jar")
          );
          if (files.length === 0) {
            toast.error("Only .zip files are supported.");
            return;
          }
          handleFiles(files);
        }}
        onClick={() => document.getElementById("fileInput").click()}
      >
        <p className="text-gray-300 text-lg">
          📦 Drag and drop .zip files here
        </p>
        <p className="text-sm text-gray-500 mt-1">or click to select files</p>
        <p className="text-xs text-gray-600 mt-2">
          ⚠️ Maximum file size: 150MB. Large files may take longer to process.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          💡 Tip: Large files consume more storage. Consider clearing old
          reports if you encounter issues.
        </p>
        <input
          id="fileInput"
          type="file"
          multiple
          accept=".zip,.jar"
          onChange={(e) => {
            handleInputChange(e);
            e.target.value = "";
          }}
          className="hidden"
        />
      </div>

      {loading && (
        <div className="mb-4 flex flex-col items-center gap-2 text-blue-400">
          <div className="flex items-center gap-2">
            <Spinner />
            <span>
              {uploadProgress.total > 1
                ? `Processing file ${uploadProgress.current} of ${uploadProgress.total}...`
                : "Parsing file..."}
            </span>
          </div>
          {uploadProgress.fileName && (
            <div className="text-sm text-gray-400">
              Current: {uploadProgress.fileName}
            </div>
          )}
          {uploadProgress.total > 1 && (
            <div className="w-64 bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (uploadProgress.current / uploadProgress.total) * 100
                  }%`,
                }}
              ></div>
            </div>
          )}
        </div>
      )}

      {fileReports.length > 0 && (
        <>
          {/* Search Controls */}
          <div className="flex flex-col md:flex-row gap-2 items-center mb-6 w-full max-w-3xl">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="bg-[#2c2c2c] border border-gray-600 text-white p-2 rounded w-full md:w-1/3"
            >
              <option value="all">All Fields</option>
              <option value="pokemon">Pokémon</option>
              <option value="bucket">Rarity</option>
              <option value="level">Level</option>
              <option value="weight">Weight</option>
              <option value="biomes">Biomes</option>
              <option value="dimensions">Dimensions</option>
              <option value="canSeeSky">Can See Sky</option>
              <option value="structures">Structures</option>
              <option value="isRaining">Raining</option>
              <option value="moonPhase">Moon Phase</option>
              <option value="neededNearbyBlocks">Nearby Blocks</option>
              <option value="timeRange">Time</option>
              <option value="lightLevel">Light Level</option>
              <option value="antiBiomes">Anti-Biomes</option>
              <option value="antiStructures">Anti-Structures</option>
            </select>

            <input
              type="text"
              placeholder={`Search by ${
                searchField === "all" ? "any field" : searchField
              }...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#2c2c2c] border border-gray-600 text-white p-2 rounded w-full"
            />

            <select
              value={contextFilter}
              onChange={(e) => setContextFilter(e.target.value)}
              className="bg-[#2c2c2c] border border-gray-600 text-white p-2 rounded w-full md:w-1/3"
            >
              <option value="all">All Contexts</option>
              {availableContexts.map((ctx) => (
                <option key={ctx} value={ctx}>
                  {ctx.charAt(0).toUpperCase() + ctx.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
              onClick={clearAll}
            >
              <X size={16} /> Clear All
            </button>
          </div>

          {/* Storage Usage Indicator */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="text-sm text-gray-400">
              Storage Usage:{" "}
              {Math.round((storageUsage.used / 1024 / 1024) * 100) / 100}MB /{" "}
              {Math.round((storageUsage.limit / 1024 / 1024) * 100) / 100}MB
            </div>
            <div className="w-64 bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  storageUsage.percentage > 80
                    ? "bg-red-500"
                    : storageUsage.percentage > 60
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${Math.min(storageUsage.percentage, 100)}%` }}
              ></div>
            </div>
            {storageUsage.percentage > 80 && (
              <div className="text-xs text-yellow-400">
                ⚠️ Storage nearly full. Consider clearing old reports.
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="text-center mb-4 text-gray-300">
            Showing {filteredData.length} spawn entries from{" "}
            {fileReports.filter((r) => !r.error).length} files
            {searchTerm && (
              <span className="text-blue-400">
                {" "}
                • {filteredData.length} matches for &ldquo;{searchTerm}&rdquo;
              </span>
            )}
          </div>
        </>
      )}

      {/* Unified Spawn Data Table */}
      {filteredData.length > 0 && (
        <div className="w-full max-w-7xl mx-auto">
          <div className="overflow-hidden rounded-lg border border-gray-700/50 bg-[#2a2a2a]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-800/50 to-gray-700/50">
                    {visibleColumns.map(({ key, label, sortable }) => (
                      <th
                        key={key}
                        onClick={sortable ? () => toggleSort(key) : undefined}
                        className={`p-3 text-left font-medium text-gray-300 border-b border-gray-700/50 ${
                          sortable
                            ? "cursor-pointer hover:bg-gray-700/30 transition-colors duration-200"
                            : ""
                        } group`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{label}</span>
                          {sort.column === key ? (
                            sort.direction === "asc" ? (
                              <ChevronUp size={14} className="text-blue-400" />
                            ) : (
                              <ChevronDown
                                size={14}
                                className="text-blue-400"
                              />
                            )
                          ) : sortable ? (
                            <ChevronsUpDown
                              size={14}
                              className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            />
                          ) : null}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                  {paginatedData.map((spawn, idx) => (
                    <tr
                      key={`${spawn.pokemon}-${spawn.sourceFile}-${idx}`}
                      className="bg-gray-800/20 hover:bg-gray-700/30 transition-colors duration-150"
                    >
                      {visibleColumns.map(({ key }) => {
                        const value = spawn[key];
                        const isArray = Array.isArray(value);
                        const isRarity = key === "bucket";

                        return (
                          <td key={key} className="p-3">
                            {isRarity ? (
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRarityColor(
                                  value
                                )}`}
                              >
                                {value}
                              </span>
                            ) : isArray ? (
                              <div className="flex flex-wrap gap-1">
                                {value.map((item, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 bg-gray-700/50 rounded text-xs"
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            ) : key === "sourceFile" ? (
                              <span className="text-xs text-gray-400 font-mono">
                                {value}
                              </span>
                            ) : (
                              <span className="text-gray-300">
                                {value?.toString() ?? ""}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {filteredData.length > PAGE_SIZE && (
            <div className="mt-6 flex justify-center items-center gap-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm transition-colors duration-200"
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="text-gray-300 text-sm">
                Page {currentPage} /{" "}
                {Math.ceil(filteredData.length / PAGE_SIZE)}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(Math.ceil(filteredData.length / PAGE_SIZE), p + 1)
                  )
                }
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm transition-colors duration-200"
                disabled={
                  currentPage === Math.ceil(filteredData.length / PAGE_SIZE)
                }
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* No Results Message */}
      {fileReports.length > 0 && filteredData.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-medium mb-2">No spawn data found</h3>
          <p className="text-gray-500">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  );
}
