"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { parseLootFromZip } from "@/utils/lootParser";
import Spinner from "./Spinner";
import {
  X,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  Filter,
} from "lucide-react";

export default function LootScanner() {
  const [fileReports, setFileReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [groupBy, setGroupBy] = useState("pokemon");
  const [sort, setSort] = useState({ column: "pokemon", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
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
  const PAGE_SIZE = 50;

  useEffect(() => {
    document.title = "Loot Scanner | CobbleToolkit";
  }, []);

  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(globalSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [globalSearch]);

  useEffect(() => {
    const saved = localStorage.getItem("loot_reports");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setFileReports(parsed);
      } catch (err) {
        console.error("Failed to load saved loot reports:", err);
      }
    }

    // Calculate initial storage usage
    updateStorageUsage();
  }, []);

  // Save sort preference
  useEffect(() => {
    localStorage.setItem("loot_sort", JSON.stringify(sort));
  }, [sort]);

  // Load sort preference
  useEffect(() => {
    const savedSort = localStorage.getItem("loot_sort");
    if (savedSort) {
      try {
        setSort(JSON.parse(savedSort));
      } catch {}
    }
  }, []);

  // Calculate storage usage
  const updateStorageUsage = () => {
    try {
      const saved = localStorage.getItem("loot_reports");
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

  // Update storage usage whenever fileReports changes
  useEffect(() => {
    updateStorageUsage();
  }, [fileReports]);

  // Auto-cleanup storage when it gets too full
  const autoCleanupStorage = () => {
    if (storageUsage.percentage > 90) {
      try {
        const saved = localStorage.getItem("loot_reports");
        if (saved) {
          const reports = JSON.parse(saved);
          // Keep only the 25 most recent reports
          const cleanedReports = reports.slice(0, 25);
          localStorage.setItem("loot_reports", JSON.stringify(cleanedReports));
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

  const handleFiles = async (files) => {
    if (loading) return toast.error("Still parsing...");
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

    const newReports = [];
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      setUploadProgress({
        current: i + 1,
        total: newFiles.length,
        fileName: file.name,
      });

      try {
        const parsed = await parseLootFromZip(file);
        if (parsed && parsed.length > 0) {
          newReports.push({
            id: crypto.randomUUID(),
            name: file.name,
            data: parsed,
          });
          console.log(
            `✅ Successfully parsed ${file.name}: ${parsed.length} Pokémon with loot data`
          );
        } else {
          console.warn(`⚠️ No loot data found in ${file.name}`);
          toast.error(`${file.name}: No loot data found.`);
        }

        // Small delay to allow garbage collection between files
        if (i < newFiles.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      } catch (err) {
        console.error(`❌ Failed to parse ${file.name}:`, err);
        toast.error(`Failed to parse ${file.name} - check console for details`);
      }
    }

    // Show parsing results before state update
    if (newReports.length > 0) {
      const totalPokemon = newReports.reduce(
        (sum, report) => sum + report.data.length,
        0
      );
      toast.success(
        `✅ Successfully parsed ${newReports.length} file(s) with ${totalPokemon} Pokémon loot data!`
      );
    }

    setFileReports((prev) => {
      const updated = [...newReports, ...prev];

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
            localStorage.setItem("loot_reports", JSON.stringify(recentReports));
            setFileReports(recentReports);
            toast.warning(
              `⚠️ Data too large for storage. Keeping only ${recentReports.length} most recent reports.`
            );
          } else {
            // Even recent reports are too large, clear storage and save only current batch
            localStorage.removeItem("loot_reports");
            setFileReports(newReports);
            toast.error(
              "⚠️ Data too large for storage. Only current batch will be displayed."
            );
          }
        } else {
          // Normal save
          localStorage.setItem("loot_reports", JSON.stringify(updated));
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
            const batchData = JSON.stringify(newReports);
            if (batchData.length <= 5 * 1024 * 1024) {
              // 5MB limit
              localStorage.setItem("loot_reports", batchData);
              setFileReports(newReports);
              toast.warning("⚠️ Cleared storage and saved only current batch.");
            } else {
              setFileReports(newReports);
              toast.error(
                "⚠️ Could not save to storage. Data will be lost on page refresh."
              );
            }
          } catch (saveErr) {
            setFileReports(newReports);
            toast.error("⚠️ Storage error. Data will be lost on page refresh.");
          }
        } else {
          console.error("Failed to save to localStorage:", err);
          toast.error(
            "⚠️ Failed to save data. It will be lost on page refresh."
          );
          setFileReports(updated);
        }
      }

      return updated;
    });

    setLoading(false);
    setUploadProgress({ current: 0, total: 0, fileName: "" });
  };

  const handleInputChange = (e) => {
    const files = Array.from(e.target.files).filter((f) =>
      f.name.toLowerCase().match(/\.(zip|jar)$/)
    );
    if (!files.length) return toast.error("Only .zip or .jar files allowed.");
    handleFiles(files);
  };

  const lootEntries = fileReports.flatMap((report) =>
    report.data.flatMap((pokemon) =>
      (pokemon.drops || []).map((drop) => ({
        reportName: report.name,
        pokemon: pokemon.name,
        item: drop.item,
        quantity:
          typeof drop.quantity === "string"
            ? drop.quantity
            : Array.isArray(drop.quantity)
            ? `${drop.quantity[0]}–${drop.quantity[1]}`
            : "1",
        chance: drop.chance != null ? `${drop.chance}%` : "100%",
        sourceFile: report.name,
      }))
    )
  );

  // Enhanced filtering with field-specific search
  const filtered = lootEntries.filter((entry) => {
    if (!debouncedSearch) return true;

    const searchTerm = debouncedSearch.toLowerCase();

    if (searchField === "all") {
      return [
        entry.pokemon,
        entry.item,
        entry.quantity,
        entry.chance,
        entry.sourceFile,
      ].some((val) => val && val.toString().toLowerCase().includes(searchTerm));
    } else {
      const value = entry[searchField];
      return value && value.toString().toLowerCase().includes(searchTerm);
    }
  });

  // Sort the filtered data
  const sortedData = [...filtered].sort((a, b) => {
    const { column, direction } = sort;
    let valA = a[column] ?? "";
    let valB = b[column] ?? "";

    if (valA < valB) return direction === "asc" ? -1 : 1;
    if (valA > valB) return direction === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate the sorted data
  const paginatedData = sortedData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const toggleSort = (column) => {
    setSort((prev) => ({
      column,
      direction:
        prev.column === column && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, searchField]);

  const clearSearch = () => {
    setGlobalSearch("");
    setSearchField("all");
    setCurrentPage(1);
  };

  const clearAll = () => {
    setFileReports([]);
    setSort({ column: "pokemon", direction: "asc" });
    localStorage.removeItem("loot_reports");
  };

  const SEARCH_FIELDS = [
    { value: "all", label: "All Fields" },
    { value: "pokemon", label: "Pokémon" },
    { value: "item", label: "Item" },
    { value: "quantity", label: "Quantity" },
    { value: "chance", label: "Chance" },
    { value: "sourceFile", label: "Source File" },
  ];

  const TABLE_COLUMNS = [
    { key: "pokemon", label: "Pokémon", sortable: true },
    { key: "item", label: "Item", sortable: true },
    { key: "quantity", label: "Quantity", sortable: true },
    { key: "chance", label: "Chance", sortable: true },
    { key: "sourceFile", label: "Source File", sortable: true },
  ];

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white px-4 py-8 flex flex-col items-center">
      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Cobblemon Loot Scanner
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Upload Cobblemon datapacks (.zip or .jar) to scan Pokémon loot drops.
        </p>
        <p className="text-gray-300 text-sm text-center mt-2">
          Drops like <code>cobblemon:raw_fish</code> are shown per Pokémon.
        </p>
      </header>

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-600 rounded p-6 w-full max-w-2xl text-center bg-[#2c2c2c] hover:bg-[#3a3a3a] transition cursor-pointer mb-8"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const files = Array.from(e.dataTransfer.files).filter((f) =>
            f.name.toLowerCase().match(/\.(zip|jar)$/)
          );
          if (!files.length) return toast.error("Only .zip or .jar allowed.");
          handleFiles(files);
        }}
        onClick={() => document.getElementById("lootInput").click()}
      >
        <p className="text-gray-300 text-lg">📦 Drag and drop files here</p>
        <p className="text-sm text-gray-500">or click to select files</p>
        <p className="text-xs text-gray-600 mt-2">
          ⚠️ Maximum file size: 150MB. Large files may take longer to process.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          💡 Tip: Large files consume more storage. Consider clearing old
          reports if you encounter issues.
        </p>
        <input
          id="lootInput"
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

      {lootEntries.length > 0 && (
        <>
          {/* Enhanced Search & Actions */}
          <div className="w-full max-w-4xl mb-6">
            {/* Main Search Bar */}
            <div className="flex flex-col lg:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="🔍 Search loot data..."
                  className="w-full pl-10 pr-4 py-3 bg-[#2c2c2c] border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                />
                {globalSearch && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="flex items-center gap-2 px-4 py-3 bg-[#3a3a3a] hover:bg-[#4a4a4a] rounded-lg transition-colors duration-200 lg:w-auto w-full justify-center"
              >
                <Filter size={18} />
                <span className="hidden sm:inline">Advanced</span>
              </button>
            </div>

            {/* Advanced Search Options */}
            {showAdvancedSearch && (
              <div className="bg-[#2a2a2a] rounded-lg p-4 border border-gray-700/50 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Search Field
                    </label>
                    <select
                      value={searchField}
                      onChange={(e) => setSearchField(e.target.value)}
                      className="w-full bg-[#3a3a3a] border border-gray-600 text-white p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {SEARCH_FIELDS.map((field) => (
                        <option key={field.value} value={field.value}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Group By
                    </label>
                    <select
                      value={groupBy}
                      onChange={(e) => setGroupBy(e.target.value)}
                      className="w-full bg-[#3a3a3a] border border-gray-600 text-white p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pokemon">Pokémon</option>
                      <option value="item">Item</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={clearSearch}
                      className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors duration-200"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Search Stats */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span>Results: {filtered.length}</span>
                <span className="text-gray-600">|</span>
                <span>Files: {fileReports.length}</span>
                {debouncedSearch && (
                  <>
                    <span className="text-gray-600">|</span>
                    <span className="text-blue-400">
                      Matches: &quot;{debouncedSearch}&quot;
                    </span>
                  </>
                )}
              </div>

              {debouncedSearch && (
                <button
                  onClick={clearSearch}
                  className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                >
                  Clear Search
                </button>
              )}
            </div>
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
                style={{
                  width: `${Math.min(storageUsage.percentage, 100)}%`,
                }}
              ></div>
            </div>
            {storageUsage.percentage > 80 && (
              <div className="text-xs text-yellow-400">
                ⚠️ Storage nearly full. Consider clearing old reports.
              </div>
            )}
          </div>

          {/* Clear Button */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
              onClick={clearAll}
            >
              <X size={16} /> Clear All
            </button>
          </div>

          {/* Modern Table View */}
          <div className="w-full max-w-7xl mx-auto">
            <div className="overflow-hidden rounded-lg border border-gray-700/50 bg-[#2a2a2a]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-800/50 to-gray-700/50">
                      {TABLE_COLUMNS.map(({ key, label, sortable }) => (
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
                                <ChevronUp
                                  size={14}
                                  className="text-blue-400"
                                />
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
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center p-6 text-gray-400"
                        >
                          {debouncedSearch
                            ? "No matching results found."
                            : "No loot data available."}
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((entry, index) => (
                        <tr
                          key={`${entry.pokemon}-${entry.item}-${entry.sourceFile}-${index}`}
                          className="bg-gray-800/20 hover:bg-gray-700/30 transition-colors duration-150"
                        >
                          <td className="p-3">
                            <span className="text-gray-300 font-medium">
                              {entry.pokemon}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-gray-300">{entry.item}</span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300">
                              {entry.quantity}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded text-xs">
                              {entry.chance}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-xs text-gray-400 font-mono">
                              {entry.sourceFile}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Enhanced Pagination */}
            {filtered.length > PAGE_SIZE && (
              <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="text-gray-300 text-sm px-4">
                    Page {currentPage} /{" "}
                    {Math.ceil(filtered.length / PAGE_SIZE)}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(Math.ceil(filtered.length / PAGE_SIZE), p + 1)
                      )
                    }
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      currentPage === Math.ceil(filtered.length / PAGE_SIZE)
                    }
                  >
                    Next
                  </button>
                </div>

                <div className="text-sm text-gray-400">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1} -{" "}
                  {Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length} entries
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* No Results Message */}
      {fileReports.length > 0 && filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-medium mb-2">No loot data found</h3>
          <p className="text-gray-500">
            {debouncedSearch
              ? "Try adjusting your search terms or clearing filters"
              : "Try uploading different files or check file contents"}
          </p>
        </div>
      )}
    </div>
  );
}
