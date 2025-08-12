"use client";

import { useState, useEffect, Fragment } from "react";
import toast from "react-hot-toast";
import Spinner from "./Spinner";
import { parseSpeciesAndSpawnFromZip } from "@/utils/speciesSpawnParser";
import {
  X,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  Filter,
  Zap,
  BookOpen,
  Star,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

export default function SpeciesScanner() {
  const [species, setSpecies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [sortBy, setSortBy] = useState("dex");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedMoves, setExpandedMoves] = useState({});
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [moveSearch, setMoveSearch] = useState({});
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
  const PAGE_SIZE = 25;

  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const saved = localStorage.getItem("species_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSpecies(parsed);
        setFiltered(parsed);
      } catch (err) {
        console.error("Failed to load saved species data");
      }
    }

    // Calculate initial storage usage
    updateStorageUsage();
  }, []);

  // Save sort preference
  useEffect(() => {
    localStorage.setItem(
      "species_sort",
      JSON.stringify({ sortBy, sortDirection })
    );
  }, [sortBy, sortDirection]);

  // Load sort preference
  useEffect(() => {
    const savedSort = localStorage.getItem("species_sort");
    if (savedSort) {
      try {
        const parsed = JSON.parse(savedSort);
        setSortBy(parsed.sortBy || "dex");
        setSortDirection(parsed.sortDirection || "asc");
      } catch {}
    }
  }, []);

  // Calculate storage usage
  const updateStorageUsage = () => {
    try {
      const saved = localStorage.getItem("species_data");
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
        const saved = localStorage.getItem("species_data");
        if (saved) {
          const data = JSON.parse(saved);
          // Keep only the 100 most recent species
          const cleanedData = data.slice(0, 100);
          localStorage.setItem("species_data", JSON.stringify(cleanedData));
          setSpecies(cleanedData);
          setFiltered(cleanedData);
          updateStorageUsage();
          toast.warning(
            "⚠️ Storage was nearly full. Automatically removed old species data."
          );
        }
      } catch (err) {
        console.error("Auto-cleanup failed:", err);
      }
    }
  };

  useEffect(() => {
    const term = debouncedSearch.toLowerCase();

    const result = species.filter((s) => {
      if (!term) return true;

      if (searchField === "all") {
        const fields = [
          s.name,
          s.types.join(" "),
          ...Object.entries(s.evYield || {})
            .filter(([_, val]) => val > 0)
            .map(([stat, val]) => `${val} ${stat}`),
          ...Object.values(s.stats || {}).map((v) => `${v}`),
          ...(s.moves || []),
        ]
          .join(" ")
          .toLowerCase();

        return fields.includes(term);
      } else {
        const value = s[searchField];
        if (searchField === "types") {
          return value && value.join(" ").toLowerCase().includes(term);
        } else if (searchField === "stats") {
          return (
            value && Object.values(value).join(" ").toLowerCase().includes(term)
          );
        } else if (searchField === "evYield") {
          return (
            value &&
            Object.entries(value)
              .filter(([_, val]) => val > 0)
              .map(([stat, val]) => `${val} ${stat}`)
              .join(" ")
              .toLowerCase()
              .includes(term)
          );
        } else if (searchField === "moves") {
          return value && value.join(" ").toLowerCase().includes(term);
        } else {
          return value && value.toString().toLowerCase().includes(term);
        }
      }
    });

    // Sort the filtered data
    switch (sortBy) {
      case "name":
        result.sort((a, b) => {
          const comparison = a.name.localeCompare(b.name);
          return sortDirection === "asc" ? comparison : -comparison;
        });
        break;
      case "type":
        result.sort((a, b) => {
          const comparison = (a.types[0] || "").localeCompare(b.types[0] || "");
          return sortDirection === "asc" ? comparison : -comparison;
        });
        break;
      case "ev":
        result.sort((a, b) => {
          const evA = Object.values(a.evYield || {}).reduce(
            (sum, v) => sum + v,
            0
          );
          const evB = Object.values(b.evYield || {}).reduce(
            (sum, v) => sum + v,
            0
          );
          return sortDirection === "asc" ? evA - evB : evB - evA;
        });
        break;
      case "bst":
        result.sort((a, b) => {
          const bstA = Object.values(a.stats || {}).reduce(
            (sum, v) => sum + v,
            0
          );
          const bstB = Object.values(b.stats || {}).reduce(
            (sum, v) => sum + v,
            0
          );
          return sortDirection === "asc" ? bstA - bstB : bstB - bstA;
        });
        break;
      default:
        result.sort((a, b) => {
          const comparison = (a.nationalDex || 0) - (b.nationalDex || 0);
          return sortDirection === "asc" ? comparison : -comparison;
        });
    }

    setFiltered(result);
    setCurrentPage(1);
  }, [debouncedSearch, searchField, sortBy, sortDirection, species]);

  const handleFiles = async (files) => {
    if (loading) return toast.error("Still parsing...");
    setLoading(true);

    const valid = Array.from(files).filter((f) =>
      f.name.toLowerCase().match(/\.(zip|jar)$/)
    );
    if (!valid.length) {
      toast.error("Only .zip or .jar files allowed.");
      setLoading(false);
      return;
    }

    setUploadProgress({ current: 0, total: valid.length, fileName: "" });

    const allParsed = [];

    for (let i = 0; i < valid.length; i++) {
      const file = valid[i];
      setUploadProgress({
        current: i + 1,
        total: valid.length,
        fileName: file.name,
      });

      try {
        const parsed = await parseSpeciesAndSpawnFromZip(file);
        allParsed.push(...parsed);

        // Small delay to allow garbage collection between files
        if (i < valid.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      } catch (e) {
        console.error(e);
        toast.error(`Failed to parse ${file.name}`);
      }
    }

    if (allParsed.length > 0) {
      // Progressive localStorage saving to prevent Chrome hanging
      try {
        // Auto-cleanup if storage is nearly full
        autoCleanupStorage();

        // Check storage size before saving
        const dataSize = JSON.stringify(allParsed).length;
        const maxStorageSize = 5 * 1024 * 1024; // 5MB limit

        if (dataSize > maxStorageSize) {
          // If data is too large, try to save only recent species
          const recentSpecies = allParsed.slice(
            0,
            Math.min(allParsed.length, 200)
          ); // Keep only 200 most recent
          const recentSize = JSON.stringify(recentSpecies).length;

          if (recentSize <= maxStorageSize) {
            localStorage.setItem("species_data", JSON.stringify(recentSpecies));
            setSpecies(recentSpecies);
            setFiltered(recentSpecies);
            toast.warning(
              `⚠️ Data too large for storage. Keeping only ${recentSpecies.length} most recent species.`
            );
          } else {
            // Even recent species are too large, clear storage and save only current batch
            localStorage.removeItem("species_data");
            setSpecies(allParsed);
            setFiltered(allParsed);
            toast.error(
              "⚠️ Data too large for storage. Only current batch will be displayed."
            );
          }
        } else {
          // Normal save
          localStorage.setItem("species_data", JSON.stringify(allParsed));
          setSpecies(allParsed);
          setFiltered(allParsed);
        }
        toast.success("Species data loaded!");
      } catch (err) {
        if (
          err instanceof DOMException &&
          (err.name === "QuotaExceededError" ||
            err.name === "NS_ERROR_DOM_QUOTA_REACHED")
        ) {
          console.error("❌ Local storage is full. Please clear old data.");
          toast.error(
            "❌ Storage full. Please clear old data before adding new ones."
          );
          setSpecies(allParsed);
          setFiltered(allParsed);
        } else {
          console.error("Failed to save to localStorage:", err);
          toast.error(
            "⚠️ Failed to save data. It will be lost on page refresh."
          );
          setSpecies(allParsed);
          setFiltered(allParsed);
        }
      }
    } else {
      toast.error("No species data found.");
    }

    setLoading(false);
    setUploadProgress({ current: 0, total: 0, fileName: "" });
    updateStorageUsage(); // Update storage usage after saving
  };

  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const toggleMoves = (name, category) => {
    setExpandedMoves((prev) => {
      const newState = { ...prev };

      // If we're expanding this move category, collapse all other Pokémon's moves first
      if (!prev[`${name}-${category}`]) {
        // Collapse all other Pokémon's moves
        Object.keys(newState).forEach((key) => {
          if (!key.startsWith(`${name}-`)) {
            newState[key] = false;
          }
        });
      }

      // Toggle the current move category
      newState[`${name}-${category}`] = !prev[`${name}-${category}`];

      return newState;
    });
  };

  const expandAllMoves = (name) => {
    setExpandedMoves((prev) => {
      const newState = { ...prev };

      // Collapse all other Pokémon's moves first
      Object.keys(newState).forEach((key) => {
        if (!key.startsWith(`${name}-`)) {
          newState[key] = false;
        }
      });

      // Expand all move categories for this Pokémon
      newState[`${name}-level`] = true;
      newState[`${name}-tm`] = true;
      newState[`${name}-egg`] = true;

      return newState;
    });
  };

  const collapseAllMoves = (name) => {
    setExpandedMoves((prev) => ({
      ...prev,
      [`${name}-level`]: false,
      [`${name}-tm`]: false,
      [`${name}-egg`]: false,
    }));
  };

  const isAllMovesExpanded = (name) => {
    return (
      expandedMoves[`${name}-level`] &&
      expandedMoves[`${name}-tm`] &&
      expandedMoves[`${name}-egg`]
    );
  };

  const hasAnyMovesExpanded = (name) => {
    return (
      expandedMoves[`${name}-level`] ||
      expandedMoves[`${name}-tm`] ||
      expandedMoves[`${name}-egg`]
    );
  };

  const clearAll = () => {
    setSpecies([]);
    setFiltered([]);
    setSortBy("dex");
    setSortDirection("asc");
    localStorage.removeItem("species_data");
    updateStorageUsage(); // Update storage usage after clearing
    toast.success("Species data cleared");
  };

  const clearSearch = () => {
    setSearch("");
    setSearchField("all");
    setCurrentPage(1);
  };

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const SEARCH_FIELDS = [
    { value: "all", label: "All Fields" },
    { value: "name", label: "Name" },
    { value: "types", label: "Types" },
    { value: "stats", label: "Base Stats" },
    { value: "evYield", label: "EV Yield" },
    { value: "moves", label: "Moves" },
  ];

  const TABLE_COLUMNS = [
    { key: "dex", label: "#", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "types", label: "Type", sortable: true },
    { key: "stats", label: "Base Stats", sortable: false },
    { key: "evYield", label: "EV Yield", sortable: true },
    { key: "moves", label: "Moves", sortable: false },
    { key: "sourceFile", label: "Source File", sortable: false },
  ];

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white px-4 py-8 flex flex-col items-center">
      <header className="text-center mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
          Cobblemon Species Scanner
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto px-4 text-sm md:text-base">
          Upload a Cobblemon datapack (.zip or .jar) to view Pokémon species,
          stats, and moves.
        </p>
      </header>

      {/* Upload */}
      <div
        className="border-2 border-dashed border-gray-600 rounded p-4 md:p-6 w-full max-w-2xl text-center bg-[#2c2c2c] hover:bg-[#3a3a3a] transition cursor-pointer mb-6 md:mb-8 mx-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => document.getElementById("speciesInput").click()}
      >
        <p className="text-gray-300 text-base md:text-lg">
          📦 Drag and drop file here
        </p>
        <p className="text-sm text-gray-500">or click to select</p>
        <p className="text-xs text-gray-600 mt-2">
          ⚠️ Maximum file size: 150MB. Large files may take longer to process.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          💡 Tip: Large files consume more storage. Consider clearing old data
          if you encounter issues.
        </p>
        <input
          id="speciesInput"
          type="file"
          accept=".zip,.jar"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
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

      {species.length > 0 && (
        <>
          {/* Enhanced Search & Actions */}
          <div className="w-full max-w-4xl mb-6 px-4">
            {/* Main Search Bar */}
            <div className="flex flex-col lg:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="🔍 Search species data..."
                  className="w-full pl-10 pr-4 py-2 md:py-3 bg-[#2c2c2c] border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm md:text-base"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
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
                className="flex items-center gap-2 px-3 py-2 md:py-3 bg-[#3a3a3a] hover:bg-[#4a4a4a] rounded-lg transition-colors duration-200 lg:w-auto w-full justify-center text-sm md:text-base"
              >
                <Filter size={16} />
                <span className="hidden sm:inline">Advanced</span>
              </button>
            </div>

            {/* Advanced Search Options */}
            {showAdvancedSearch && (
              <div className="bg-[#2a2a2a] rounded-lg p-3 md:p-4 border border-gray-700/50 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Search Field
                    </label>
                    <select
                      value={searchField}
                      onChange={(e) => setSearchField(e.target.value)}
                      className="w-full bg-[#3a3a3a] border border-gray-600 text-white p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-[#3a3a3a] border border-gray-600 text-white p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="dex">Dex #</option>
                      <option value="name">Name</option>
                      <option value="type">Type</option>
                      <option value="ev">EV Yield</option>
                      <option value="bst">BST</option>
                    </select>
                  </div>

                  <div className="flex items-end sm:col-span-2 lg:col-span-1">
                    <button
                      onClick={clearSearch}
                      className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors duration-200 text-sm"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Search Stats */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs md:text-sm text-gray-400">
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <span>Results: {filtered.length}</span>
                <span className="text-gray-600">|</span>
                <span>Species: {species.length}</span>
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
                  className="text-blue-400 hover:text-blue-300 transition-colors text-xs md:text-sm"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>

          {/* Storage Usage Indicator */}
          <div className="flex flex-col items-center gap-2 mb-4 px-4">
            <div className="text-xs md:text-sm text-gray-400 text-center">
              Storage Usage:{" "}
              {Math.round((storageUsage.used / 1024 / 1024) * 100) / 100}MB /{" "}
              {Math.round((storageUsage.limit / 1024 / 1024) * 100) / 100}MB
            </div>
            <div className="w-48 md:w-64 bg-gray-700 rounded-full h-2">
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
              <div className="text-xs text-yellow-400 text-center px-4">
                ⚠️ Storage nearly full. Consider clearing old data.
              </div>
            )}
          </div>

          {/* Clear Button */}
          <div className="flex flex-wrap gap-2 justify-center mb-6 px-4">
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition text-sm md:text-base"
            >
              <X size={16} /> Clear All
            </button>
          </div>

          {/* Modern Table View */}
          <div className="w-full max-w-7xl mx-auto px-4">
            <div className="overflow-hidden rounded-lg border border-gray-700/50 bg-[#2a2a2a]">
              <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-800/50 to-gray-700/50">
                      {TABLE_COLUMNS.map(({ key, label, sortable }) => (
                        <th
                          key={key}
                          onClick={sortable ? () => toggleSort(key) : undefined}
                          className={`p-2 md:p-3 text-left font-medium text-gray-300 border-b border-gray-700/50 ${
                            sortable
                              ? "cursor-pointer hover:bg-gray-700/30 transition-colors duration-200"
                              : ""
                          } group`}
                        >
                          <div className="flex items-center gap-1 md:gap-2">
                            <span className="whitespace-nowrap">{label}</span>
                            {sortBy === key ? (
                              sortDirection === "asc" ? (
                                <ChevronUp
                                  size={12}
                                  className="text-blue-400"
                                />
                              ) : (
                                <ChevronDown
                                  size={12}
                                  className="text-blue-400"
                                />
                              )
                            ) : sortable ? (
                              <ChevronsUpDown
                                size={12}
                                className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              />
                            ) : null}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/30">
                    {paginated.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center p-4 md:p-6 text-gray-400"
                        >
                          {debouncedSearch
                            ? "No matching results found."
                            : "No species data available."}
                        </td>
                      </tr>
                    ) : (
                      paginated.map((mon, i) => {
                        const levelMoves = mon.moves
                          .filter((m) => /^\d+:/.test(m))
                          .map((m) => {
                            const [lvl, move] = m.split(":");
                            return `Lv ${lvl} ${move}`;
                          })
                          .filter((move) => {
                            const searchTerm = moveSearch[mon.name];
                            return (
                              !searchTerm ||
                              move
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                            );
                          });

                        const tmMoves = mon.moves
                          .filter((m) => m.startsWith("tm:"))
                          .map((m) => m.replace("tm:", ""))
                          .filter((move) => {
                            const searchTerm = moveSearch[mon.name];
                            return (
                              !searchTerm ||
                              move
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                            );
                          });

                        const eggMoves = mon.moves
                          .filter((m) => m.startsWith("tutor:"))
                          .map((m) => m.replace("tutor:", ""))
                          .filter((move) => {
                            const searchTerm = moveSearch[mon.name];
                            return (
                              !searchTerm ||
                              move
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                            );
                          });

                        const evText =
                          Object.entries(mon.evYield || {})
                            .filter(([_, val]) => val > 0)
                            .map(
                              ([stat, val]) => `${val} ${stat.toUpperCase()}`
                            )
                            .join(", ") || "—";

                        return (
                          <Fragment key={`${mon.name}-${mon.sourceFile}`}>
                            <tr className="bg-gray-800/20 hover:bg-gray-700/30 transition-colors duration-150">
                              <td className="p-2 md:p-3">
                                <span className="text-gray-300 font-medium text-xs md:text-sm">
                                  {mon.nationalDex || "?"}
                                </span>
                              </td>
                              <td className="p-2 md:p-3">
                                <span className="text-gray-300 capitalize font-medium text-xs md:text-sm">
                                  {mon.name}
                                </span>
                              </td>
                              <td className="p-2 md:p-3">
                                <div className="flex flex-wrap gap-1">
                                  {mon.types.map((type, idx) => (
                                    <span
                                      key={idx}
                                      className="px-1.5 md:px-2 py-0.5 md:py-1 bg-gray-700/50 rounded text-xs text-gray-300"
                                    >
                                      {type}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="p-2 md:p-3">
                                <div className="text-xs text-gray-400 space-y-0.5 md:space-y-1">
                                  <div>HP: {mon.stats.hp}</div>
                                  <div>ATK: {mon.stats.attack}</div>
                                  <div>DEF: {mon.stats.defence}</div>
                                  <div>SPA: {mon.stats.special_attack}</div>
                                  <div>SPD: {mon.stats.special_defence}</div>
                                  <div>SPE: {mon.stats.speed}</div>
                                </div>
                              </td>
                              <td className="p-2 md:p-3">
                                <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded text-xs">
                                  {evText}
                                </span>
                              </td>
                              <td className="p-2 md:p-3">
                                <div className="flex flex-col gap-1 md:gap-2">
                                  {/* Level-Up Moves */}
                                  <div className="flex items-center gap-1 md:gap-2">
                                    <button
                                      onClick={() =>
                                        toggleMoves(mon.name, "level")
                                      }
                                      className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 border rounded-lg text-xs transition-all duration-200 hover:scale-105 ${
                                        expandedMoves[`${mon.name}-level`]
                                          ? "bg-blue-500/40 border-blue-500/60 text-blue-200 shadow-lg"
                                          : "bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/30"
                                      }`}
                                    >
                                      <Zap size={10} className="md:hidden" />
                                      <Zap
                                        size={12}
                                        className="hidden md:block"
                                      />
                                      <span className="hidden sm:inline">
                                        Level-Up
                                      </span>
                                      <span className="sm:hidden">Lv</span>
                                      <span
                                        className={`px-1 md:px-1.5 py-0.5 rounded-full text-xs ${
                                          expandedMoves[`${mon.name}-level`]
                                            ? "bg-blue-500/50 text-blue-100"
                                            : "bg-blue-500/30 text-blue-300"
                                        }`}
                                      >
                                        {levelMoves.length}
                                      </span>
                                    </button>
                                  </div>

                                  {/* TM Moves */}
                                  <div className="flex items-center gap-1 md:gap-2">
                                    <button
                                      onClick={() =>
                                        toggleMoves(mon.name, "tm")
                                      }
                                      className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 border rounded-lg text-xs transition-all duration-200 hover:scale-105 ${
                                        expandedMoves[`${mon.name}-tm`]
                                          ? "bg-green-500/40 border-green-500/60 text-green-200 shadow-lg"
                                          : "bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-500/30"
                                      }`}
                                    >
                                      <BookOpen
                                        size={10}
                                        className="md:hidden"
                                      />
                                      <BookOpen
                                        size={12}
                                        className="hidden md:block"
                                      />
                                      <span className="hidden sm:inline">
                                        TM
                                      </span>
                                      <span className="sm:hidden">TM</span>
                                      <span
                                        className={`px-1 md:px-1.5 py-0.5 rounded-full text-xs ${
                                          expandedMoves[`${mon.name}-tm`]
                                            ? "bg-green-500/50 text-green-100"
                                            : "bg-green-500/30 text-green-300"
                                        }`}
                                      >
                                        {tmMoves.length}
                                      </span>
                                    </button>
                                  </div>

                                  {/* Egg Moves */}
                                  <div className="flex items-center gap-1 md:gap-2">
                                    <button
                                      onClick={() =>
                                        toggleMoves(mon.name, "egg")
                                      }
                                      className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 border rounded-lg text-xs transition-all duration-200 hover:scale-105 ${
                                        expandedMoves[`${mon.name}-egg`]
                                          ? "bg-yellow-500/40 border-yellow-500/60 text-yellow-200 shadow-lg"
                                          : "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border-yellow-500/30"
                                      }`}
                                    >
                                      <Star size={10} className="md:hidden" />
                                      <Star
                                        size={12}
                                        className="hidden md:block"
                                      />
                                      <span className="hidden sm:inline">
                                        Egg
                                      </span>
                                      <span className="sm:hidden">Egg</span>
                                      <span
                                        className={`px-1 md:px-1.5 py-0.5 rounded-full text-xs ${
                                          expandedMoves[`${mon.name}-egg`]
                                            ? "bg-yellow-500/50 text-yellow-100"
                                            : "bg-yellow-500/30 text-yellow-300"
                                        }`}
                                      >
                                        {eggMoves.length}
                                      </span>
                                    </button>
                                  </div>

                                  {/* Quick Move Preview */}
                                  <div className="text-xs text-gray-500 mt-1">
                                    <div className="flex items-center gap-1">
                                      <span>Total:</span>
                                      <span className="text-gray-400 font-medium">
                                        {mon.moves.length}
                                      </span>
                                      {hasAnyMovesExpanded(mon.name) && (
                                        <span className="text-blue-400 text-xs">
                                          • Expanded
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-2 md:p-3">
                                <span className="text-xs text-gray-400 font-mono">
                                  {mon.sourceFile || "—"}
                                </span>
                              </td>
                            </tr>

                            {(expandedMoves[mon.name + "-level"] ||
                              expandedMoves[mon.name + "-tm"] ||
                              expandedMoves[mon.name + "-egg"]) && (
                              <tr
                                key={mon.name + "-details"}
                                className="bg-gray-900/30"
                              >
                                <td
                                  colSpan={7}
                                  className="p-3 md:p-4 text-xs text-gray-300"
                                >
                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
                                    {/* Level-Up Moves */}
                                    {expandedMoves[mon.name + "-level"] && (
                                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 md:p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Zap
                                            size={12}
                                            className="md:hidden"
                                          />
                                          <Zap
                                            size={14}
                                            className="hidden md:block"
                                          />
                                          <strong className="text-blue-400 text-xs md:text-sm">
                                            Level-Up Moves ({levelMoves.length})
                                          </strong>
                                        </div>
                                        <div className="space-y-1 max-h-32 overflow-y-auto">
                                          {levelMoves.length > 0 ? (
                                            levelMoves.map((move, idx) => (
                                              <div
                                                key={idx}
                                                className="flex items-center justify-between bg-blue-500/10 rounded px-2 py-1 hover:bg-blue-500/20 transition-colors"
                                              >
                                                <span className="text-gray-300 text-xs">
                                                  {move}
                                                </span>
                                              </div>
                                            ))
                                          ) : (
                                            <span className="text-gray-500 italic text-xs">
                                              None
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* TM Moves */}
                                    {expandedMoves[mon.name + "-tm"] && (
                                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 md:p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                          <BookOpen
                                            size={12}
                                            className="md:hidden"
                                          />
                                          <BookOpen
                                            size={14}
                                            className="hidden md:block"
                                          />
                                          <strong className="text-green-400 text-xs md:text-sm">
                                            TM Moves ({tmMoves.length})
                                          </strong>
                                        </div>
                                        <div className="space-y-1 max-h-32 overflow-y-auto">
                                          {tmMoves.length > 0 ? (
                                            tmMoves.map((move, idx) => (
                                              <div
                                                key={idx}
                                                className="flex items-center justify-between bg-green-500/10 rounded px-2 py-1 hover:bg-green-500/20 transition-colors"
                                              >
                                                <span className="text-gray-300 text-xs">
                                                  {move}
                                                </span>
                                              </div>
                                            ))
                                          ) : (
                                            <span className="text-gray-500 italic text-xs">
                                              None
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Egg Moves */}
                                    {expandedMoves[mon.name + "-egg"] && (
                                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 md:p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Star
                                            size={12}
                                            className="md:hidden"
                                          />
                                          <Star
                                            size={14}
                                            className="hidden md:block"
                                          />
                                          <strong className="text-yellow-400 text-xs md:text-sm">
                                            Egg Moves ({eggMoves.length})
                                          </strong>
                                        </div>
                                        <div className="space-y-1 max-h-32 overflow-y-auto">
                                          {eggMoves.length > 0 ? (
                                            eggMoves.map((move, idx) => (
                                              <div
                                                key={idx}
                                                className="flex items-center justify-between bg-yellow-500/10 rounded px-2 py-1 hover:bg-yellow-500/20 transition-colors"
                                              >
                                                <span className="text-gray-300 text-xs">
                                                  {move}
                                                </span>
                                              </div>
                                            ))
                                          ) : (
                                            <span className="text-gray-500 italic text-xs">
                                              None
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Quick Actions */}
                                  <div className="flex justify-center mt-3 pt-3 border-t border-gray-700/30">
                                    <button
                                      onClick={() => {
                                        if (isAllMovesExpanded(mon.name)) {
                                          collapseAllMoves(mon.name);
                                        } else {
                                          expandAllMoves(mon.name);
                                        }
                                      }}
                                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-600/50 hover:bg-gray-600/70 text-gray-300 rounded-lg transition-colors text-xs"
                                    >
                                      {isAllMovesExpanded(mon.name) ? (
                                        <>
                                          <ChevronLeft size={12} />
                                          <span className="hidden sm:inline">
                                            Collapse All
                                          </span>
                                          <span className="sm:hidden">
                                            Collapse
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <ChevronRight size={12} />
                                          <span className="hidden sm:inline">
                                            Expand All
                                          </span>
                                          <span className="sm:hidden">
                                            Expand
                                          </span>
                                        </>
                                      )}
                                    </button>
                                  </div>

                                  {/* Move Search */}
                                  <div className="mt-3 pt-3 border-t border-gray-700/30">
                                    <div className="flex items-center gap-2 justify-center">
                                      <Search size={12} className="md:hidden" />
                                      <Search
                                        size={14}
                                        className="hidden md:block"
                                      />
                                      <input
                                        type="text"
                                        placeholder="🔍 Search moves..."
                                        className="bg-gray-700/50 border border-gray-600 text-white px-2 py-1 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent w-32 md:w-48"
                                        value={moveSearch[mon.name] || ""}
                                        onChange={(e) =>
                                          setMoveSearch((prev) => ({
                                            ...prev,
                                            [mon.name]: e.target.value,
                                          }))
                                        }
                                      />
                                      {(moveSearch[mon.name] || "").length >
                                        0 && (
                                        <button
                                          onClick={() =>
                                            setMoveSearch((prev) => ({
                                              ...prev,
                                              [mon.name]: "",
                                            }))
                                          }
                                          className="text-gray-400 hover:text-white transition-colors"
                                        >
                                          <X size={12} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Enhanced Pagination */}
            {filtered.length > PAGE_SIZE && (
              <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4 px-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="bg-gray-700 hover:bg-gray-600 px-3 md:px-4 py-2 rounded text-xs md:text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="text-gray-300 text-xs md:text-sm px-2 md:px-4">
                    Page {currentPage} /{" "}
                    {Math.ceil(filtered.length / PAGE_SIZE)}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(Math.ceil(filtered.length / PAGE_SIZE), p + 1)
                      )
                    }
                    className="bg-gray-700 hover:bg-gray-600 px-3 md:px-4 py-2 rounded text-xs md:text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      currentPage === Math.ceil(filtered.length / PAGE_SIZE)
                    }
                  >
                    Next
                  </button>
                </div>

                <div className="text-xs md:text-sm text-gray-400 text-center">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1} -{" "}
                  {Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length} species
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* No Results Message */}
      {species.length > 0 && filtered.length === 0 && (
        <div className="text-center py-8 md:py-12 text-gray-400 px-4">
          <div className="text-4xl md:text-6xl mb-4">🔍</div>
          <h3 className="text-lg md:text-xl font-medium mb-2">
            No species data found
          </h3>
          <p className="text-gray-500 text-sm md:text-base">
            {debouncedSearch
              ? "Try adjusting your search terms or clearing filters"
              : "Try uploading different files or check file contents"}
          </p>
        </div>
      )}
    </div>
  );
}
