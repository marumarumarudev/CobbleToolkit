"use client";

import { useState, useEffect, useRef } from "react";
import { parseCobblemonZip } from "@/utils/spawnParser";
import toast from "react-hot-toast";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  X,
  Search,
  Filter,
} from "lucide-react";
import Spinner from "./Spinner";

export default function UploadArea() {
  const [fileReports, setFileReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchField, setSearchField] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [contextFilter, setContextFilter] = useState("all");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
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
  const PAGE_SIZE = 25;

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

  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
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
    { key: "presets", label: "Presets", sortable: true },

    // Condition fields
    { key: "biomes", label: "Biomes", sortable: true },
    { key: "dimensions", label: "Dimensions", sortable: true },
    { key: "structures", label: "Structures", sortable: true },
    { key: "neededNearbyBlocks", label: "Nearby Blocks", sortable: true },
    { key: "neededBaseBlocks", label: "Base Blocks", sortable: true },
    { key: "labels", label: "Labels", sortable: true },
    { key: "canSeeSky", label: "Can See Sky", sortable: true },
    { key: "isRaining", label: "Raining", sortable: true },
    { key: "isThundering", label: "Thundering", sortable: true },
    { key: "isSlimeChunk", label: "Slime Chunk", sortable: true },
    { key: "fluidIsSource", label: "Fluid Is Source", sortable: true },
    { key: "moonPhase", label: "Moon Phase", sortable: true },
    { key: "minX", label: "Min X", sortable: true },
    { key: "minY", label: "Min Y", sortable: true },
    { key: "minZ", label: "Min Z", sortable: true },
    { key: "maxX", label: "Max X", sortable: true },
    { key: "maxY", label: "Max Y", sortable: true },
    { key: "maxZ", label: "Max Z", sortable: true },
    { key: "minLight", label: "Min Light", sortable: true },
    { key: "maxLight", label: "Max Light", sortable: true },
    { key: "minSkyLight", label: "Min Sky Light", sortable: true },
    { key: "maxSkyLight", label: "Max Sky Light", sortable: true },
    { key: "minWidth", label: "Min Width", sortable: true },
    { key: "maxWidth", label: "Max Width", sortable: true },
    { key: "minHeight", label: "Min Height", sortable: true },
    { key: "maxHeight", label: "Max Height", sortable: true },
    { key: "minDepth", label: "Min Depth", sortable: true },
    { key: "maxDepth", label: "Max Depth", sortable: true },
    { key: "minLureLevel", label: "Min Lure Level", sortable: true },
    { key: "maxLureLevel", label: "Max Lure Level", sortable: true },
    { key: "timeRange", label: "Time Range", sortable: true },
    { key: "fluidBlock", label: "Fluid Block", sortable: true },
    { key: "bobber", label: "Bobber", sortable: true },
    { key: "bait", label: "Bait", sortable: true },
    { key: "labelMode", label: "Label Mode", sortable: true },
    { key: "lightLevel", label: "Light Level", sortable: true },

    // Anti-condition fields
    { key: "antiBiomes", label: "Anti-Biomes", sortable: true },
    { key: "antiStructures", label: "Anti-Structures", sortable: true },
    { key: "antiDimensions", label: "Anti-Dimensions", sortable: true },
    {
      key: "antiNeededNearbyBlocks",
      label: "Anti-Nearby Blocks",
      sortable: true,
    },
    { key: "antiNeededBaseBlocks", label: "Anti-Base Blocks", sortable: true },
    { key: "antiLabels", label: "Anti-Labels", sortable: true },
    { key: "antiCanSeeSky", label: "Anti-Can See Sky", sortable: true },
    { key: "antiIsRaining", label: "Anti-Raining", sortable: true },
    { key: "antiIsThundering", label: "Anti-Thundering", sortable: true },
    { key: "antiIsSlimeChunk", label: "Anti-Slime Chunk", sortable: true },
    { key: "antiFluidIsSource", label: "Anti-Fluid Is Source", sortable: true },
    { key: "antiMoonPhase", label: "Anti-Moon Phase", sortable: true },
    { key: "antiMinX", label: "Anti-Min X", sortable: true },
    { key: "antiMinY", label: "Anti-Min Y", sortable: true },
    { key: "antiMinZ", label: "Anti-Min Z", sortable: true },
    { key: "antiMaxX", label: "Anti-Max X", sortable: true },
    { key: "antiMaxY", label: "Anti-Max Y", sortable: true },
    { key: "antiMaxZ", label: "Anti-Max Z", sortable: true },
    { key: "antiMinLight", label: "Anti-Min Light", sortable: true },
    { key: "antiMaxLight", label: "Anti-Max Light", sortable: true },
    { key: "antiMinSkyLight", label: "Anti-Min Sky Light", sortable: true },
    { key: "antiMaxSkyLight", label: "Anti-Max Sky Light", sortable: true },
    { key: "antiMinWidth", label: "Anti-Min Width", sortable: true },
    { key: "antiMaxWidth", label: "Anti-Max Width", sortable: true },
    { key: "antiMinHeight", label: "Anti-Min Height", sortable: true },
    { key: "antiMaxHeight", label: "Anti-Max Height", sortable: true },
    { key: "antiMinDepth", label: "Anti-Min Depth", sortable: true },
    { key: "antiMaxDepth", label: "Anti-Max Depth", sortable: true },
    { key: "antiMinLureLevel", label: "Anti-Min Lure Level", sortable: true },
    { key: "antiMaxLureLevel", label: "Anti-Max Lure Level", sortable: true },
    { key: "antiTimeRange", label: "Anti-Time Range", sortable: true },
    { key: "antiFluidBlock", label: "Anti-Fluid Block", sortable: true },
    { key: "antiBobber", label: "Anti-Bobber", sortable: true },
    { key: "antiBait", label: "Anti-Bait", sortable: true },
    { key: "antiLabelMode", label: "Anti-Label Mode", sortable: true },

    // Weight multiplier fields
    {
      key: "weightMultiplierMultiplier",
      label: "Weight Multiplier",
      sortable: true,
    },
    { key: "weightMultiplierBiomes", label: "WM-Biomes", sortable: true },
    {
      key: "weightMultiplierDimensions",
      label: "WM-Dimensions",
      sortable: true,
    },
    {
      key: "weightMultiplierStructures",
      label: "WM-Structures",
      sortable: true,
    },
    {
      key: "weightMultiplierNeededNearbyBlocks",
      label: "WM-Nearby Blocks",
      sortable: true,
    },
    {
      key: "weightMultiplierNeededBaseBlocks",
      label: "WM-Base Blocks",
      sortable: true,
    },
    { key: "weightMultiplierLabels", label: "WM-Labels", sortable: true },
    {
      key: "weightMultiplierCanSeeSky",
      label: "WM-Can See Sky",
      sortable: true,
    },
    { key: "weightMultiplierIsRaining", label: "WM-Raining", sortable: true },
    {
      key: "weightMultiplierIsThundering",
      label: "WM-Thundering",
      sortable: true,
    },
    {
      key: "weightMultiplierIsSlimeChunk",
      label: "WM-Slime Chunk",
      sortable: true,
    },
    {
      key: "weightMultiplierFluidIsSource",
      label: "WM-Fluid Is Source",
      sortable: true,
    },
    {
      key: "weightMultiplierMoonPhase",
      label: "WM-Moon Phase",
      sortable: true,
    },
    { key: "weightMultiplierMinX", label: "WM-Min X", sortable: true },
    { key: "weightMultiplierMinY", label: "WM-Min Y", sortable: true },
    { key: "weightMultiplierMinZ", label: "WM-Min Z", sortable: true },
    { key: "weightMultiplierMaxX", label: "WM-Max X", sortable: true },
    { key: "weightMultiplierMaxY", label: "WM-Max Y", sortable: true },
    { key: "weightMultiplierMaxZ", label: "WM-Max Z", sortable: true },
    { key: "weightMultiplierMinLight", label: "WM-Min Light", sortable: true },
    { key: "weightMultiplierMaxLight", label: "WM-Max Light", sortable: true },
    {
      key: "weightMultiplierMinSkyLight",
      label: "WM-Min Sky Light",
      sortable: true,
    },
    {
      key: "weightMultiplierMaxSkyLight",
      label: "WM-Max Sky Light",
      sortable: true,
    },
    { key: "weightMultiplierMinWidth", label: "WM-Min Width", sortable: true },
    { key: "weightMultiplierMaxWidth", label: "WM-Max Width", sortable: true },
    {
      key: "weightMultiplierMinHeight",
      label: "WM-Min Height",
      sortable: true,
    },
    {
      key: "weightMultiplierMaxHeight",
      label: "WM-Max Height",
      sortable: true,
    },
    { key: "weightMultiplierMinDepth", label: "WM-Min Depth", sortable: true },
    { key: "weightMultiplierMaxDepth", label: "WM-Max Depth", sortable: true },
    {
      key: "weightMultiplierMinLureLevel",
      label: "WM-Min Lure Level",
      sortable: true,
    },
    {
      key: "weightMultiplierMaxLureLevel",
      label: "WM-Max Lure Level",
      sortable: true,
    },
    {
      key: "weightMultiplierTimeRange",
      label: "WM-Time Range",
      sortable: true,
    },
    {
      key: "weightMultiplierFluidBlock",
      label: "WM-Fluid Block",
      sortable: true,
    },
    { key: "weightMultiplierBobber", label: "WM-Bobber", sortable: true },
    { key: "weightMultiplierBait", label: "WM-Bait", sortable: true },
    {
      key: "weightMultiplierLabelMode",
      label: "WM-Label Mode",
      sortable: true,
    },

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
    if (!debouncedSearch) return true;

    if (searchField === "all") {
      return [
        r.pokemon,
        r.bucket,
        r.level,
        r.weight,
        r.context,
        r.presets,
        r.biomes,
        r.dimensions,
        r.structures,
        r.neededNearbyBlocks,
        r.neededBaseBlocks,
        r.labels,
        r.canSeeSky?.toString(),
        r.isRaining?.toString(),
        r.isThundering?.toString(),
        r.isSlimeChunk?.toString(),
        r.fluidIsSource?.toString(),
        r.moonPhase,
        r.minX,
        r.minY,
        r.minZ,
        r.maxX,
        r.maxY,
        r.maxZ,
        r.minLight,
        r.maxLight,
        r.minSkyLight,
        r.maxSkyLight,
        r.minWidth,
        r.maxWidth,
        r.minHeight,
        r.maxHeight,
        r.minDepth,
        r.maxDepth,
        r.minLureLevel,
        r.maxLureLevel,
        r.timeRange,
        r.fluidBlock,
        r.bobber,
        r.bait,
        r.labelMode,
        r.lightLevel,
        r.antiBiomes,
        r.antiStructures,
        r.antiDimensions,
        r.antiNeededNearbyBlocks,
        r.antiNeededBaseBlocks,
        r.antiLabels,
        r.antiCanSeeSky?.toString(),
        r.antiIsRaining?.toString(),
        r.antiIsThundering?.toString(),
        r.antiIsSlimeChunk?.toString(),
        r.antiFluidIsSource?.toString(),
        r.antiMoonPhase,
        r.antiMinX,
        r.antiMinY,
        r.antiMinZ,
        r.antiMaxX,
        r.antiMaxY,
        r.antiMaxZ,
        r.antiMinLight,
        r.antiMaxLight,
        r.antiMinSkyLight,
        r.antiMaxSkyLight,
        r.antiMinWidth,
        r.antiMaxWidth,
        r.antiMinHeight,
        r.antiMaxHeight,
        r.antiMinDepth,
        r.antiMaxDepth,
        r.antiMinLureLevel,
        r.antiMaxLureLevel,
        r.antiTimeRange,
        r.antiFluidBlock,
        r.antiBobber,
        r.antiBait,
        r.antiLabelMode,
        r.weightMultiplierMultiplier,
        r.weightMultiplierBiomes,
        r.weightMultiplierDimensions,
        r.weightMultiplierStructures,
        r.weightMultiplierNeededNearbyBlocks,
        r.weightMultiplierNeededBaseBlocks,
        r.weightMultiplierLabels,
        r.weightMultiplierCanSeeSky?.toString(),
        r.weightMultiplierIsRaining?.toString(),
        r.weightMultiplierIsThundering?.toString(),
        r.weightMultiplierIsSlimeChunk?.toString(),
        r.weightMultiplierFluidIsSource?.toString(),
        r.weightMultiplierMoonPhase,
        r.weightMultiplierMinX,
        r.weightMultiplierMinY,
        r.weightMultiplierMinZ,
        r.weightMultiplierMaxX,
        r.weightMultiplierMaxY,
        r.weightMultiplierMaxZ,
        r.weightMultiplierMinLight,
        r.weightMultiplierMaxLight,
        r.weightMultiplierMinSkyLight,
        r.weightMultiplierMaxSkyLight,
        r.weightMultiplierMinWidth,
        r.weightMultiplierMaxWidth,
        r.weightMultiplierMinHeight,
        r.weightMultiplierMaxHeight,
        r.weightMultiplierMinDepth,
        r.weightMultiplierMaxDepth,
        r.weightMultiplierMinLureLevel,
        r.weightMultiplierMaxLureLevel,
        r.weightMultiplierTimeRange,
        r.weightMultiplierFluidBlock,
        r.weightMultiplierBobber,
        r.weightMultiplierBait,
        r.weightMultiplierLabelMode,
        r.sourceFile,
      ]
        .filter(Boolean)
        .some(
          (value) =>
            typeof value === "string" &&
            value.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
    } else {
      const value = r[searchField];
      return (
        value &&
        value.toString().toLowerCase().includes(debouncedSearch.toLowerCase())
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
  }, [debouncedSearch, contextFilter, searchField]);

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
          if (batchData.length <= maxStorageSize) {
            localStorage.setItem("spawn_reports", batchData);
            setFileReports(parsedReports);
            toast.warning("⚠️ Cleared storage and saved only current batch.");
          } else {
            // Even current batch is too large, try to compress or reduce data
            const compressedReports = parsedReports.map((report) => ({
              ...report,
              data: report.data.slice(0, 1000), // Keep only first 1000 spawns per file
            }));
            const compressedData = JSON.stringify(compressedReports);

            if (compressedData.length <= maxStorageSize) {
              localStorage.setItem("spawn_reports", compressedData);
              setFileReports(compressedReports);
              toast.warning(
                "⚠️ Storage full. Kept only first 1000 spawns per file."
              );
            } else {
              setFileReports(parsedReports);
              toast.error(
                "⚠️ Could not save to storage. Data will be lost on page refresh."
              );
            }
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

  const clearSearch = () => {
    setSearchTerm("");
    setSearchField("all");
    setCurrentPage(1);
  };

  const clearAll = () => {
    setFileReports([]);
    setSort({ column: "pokemon", direction: "asc" });
    localStorage.removeItem("spawn_reports");
    updateStorageUsage(); // Update storage usage after clearing
  };

  const SEARCH_FIELDS = [
    { value: "all", label: "All Fields" },
    { value: "pokemon", label: "Pokémon" },
    { value: "bucket", label: "Rarity" },
    { value: "level", label: "Level" },
    { value: "weight", label: "Weight" },
    { value: "context", label: "Context" },
    { value: "presets", label: "Presets" },
    { value: "biomes", label: "Biomes" },
    { value: "dimensions", label: "Dimensions" },
    { value: "structures", label: "Structures" },
    { value: "neededNearbyBlocks", label: "Nearby Blocks" },
    { value: "neededBaseBlocks", label: "Base Blocks" },
    { value: "labels", label: "Labels" },
    { value: "canSeeSky", label: "Can See Sky" },
    { value: "isRaining", label: "Raining" },
    { value: "isThundering", label: "Thundering" },
    { value: "isSlimeChunk", label: "Slime Chunk" },
    { value: "fluidIsSource", label: "Fluid Is Source" },
    { value: "moonPhase", label: "Moon Phase" },
    { value: "minX", label: "Min X" },
    { value: "minY", label: "Min Y" },
    { value: "minZ", label: "Min Z" },
    { value: "maxX", label: "Max X" },
    { value: "maxY", label: "Max Y" },
    { value: "maxZ", label: "Max Z" },
    { value: "minLight", label: "Min Light" },
    { value: "maxLight", label: "Max Light" },
    { value: "minSkyLight", label: "Min Sky Light" },
    { value: "maxSkyLight", label: "Max Sky Light" },
    { value: "minWidth", label: "Min Width" },
    { value: "maxWidth", label: "Max Width" },
    { value: "minHeight", label: "Min Height" },
    { value: "maxHeight", label: "Max Height" },
    { value: "minDepth", label: "Min Depth" },
    { value: "maxDepth", label: "Max Depth" },
    { value: "minLureLevel", label: "Min Lure Level" },
    { value: "maxLureLevel", label: "Max Lure Level" },
    { value: "timeRange", label: "Time Range" },
    { value: "fluidBlock", label: "Fluid Block" },
    { value: "bobber", label: "Bobber" },
    { value: "bait", label: "Bait" },
    { value: "labelMode", label: "Label Mode" },
    { value: "lightLevel", label: "Light Level" },
    { value: "antiBiomes", label: "Anti-Biomes" },
    { value: "antiStructures", label: "Anti-Structures" },
    { value: "antiDimensions", label: "Anti-Dimensions" },
    { value: "antiNeededNearbyBlocks", label: "Anti-Nearby Blocks" },
    { value: "antiNeededBaseBlocks", label: "Anti-Base Blocks" },
    { value: "antiLabels", label: "Anti-Labels" },
    { value: "antiCanSeeSky", label: "Anti-Can See Sky" },
    { value: "antiIsRaining", label: "Anti-Raining" },
    { value: "antiIsThundering", label: "Anti-Thundering" },
    { value: "antiIsSlimeChunk", label: "Anti-Slime Chunk" },
    { value: "antiFluidIsSource", label: "Anti-Fluid Is Source" },
    { value: "antiMoonPhase", label: "Anti-Moon Phase" },
    { value: "antiMinX", label: "Anti-Min X" },
    { value: "antiMinY", label: "Anti-Min Y" },
    { value: "antiMinZ", label: "Anti-Min Z" },
    { value: "antiMaxX", label: "Anti-Max X" },
    { value: "antiMaxY", label: "Anti-Max Y" },
    { value: "antiMaxZ", label: "Anti-Max Z" },
    { value: "antiMinLight", label: "Anti-Min Light" },
    { value: "antiMaxLight", label: "Anti-Max Light" },
    { value: "antiMinSkyLight", label: "Anti-Min Sky Light" },
    { value: "antiMaxSkyLight", label: "Anti-Max Sky Light" },
    { value: "antiMinWidth", label: "Anti-Min Width" },
    { value: "antiMaxWidth", label: "Anti-Max Width" },
    { value: "antiMinHeight", label: "Anti-Min Height" },
    { value: "antiMaxHeight", label: "Anti-Max Height" },
    { value: "antiMinDepth", label: "Anti-Min Depth" },
    { value: "antiMaxDepth", label: "Anti-Max Depth" },
    { value: "antiMinLureLevel", label: "Anti-Min Lure Level" },
    { value: "antiMaxLureLevel", label: "Anti-Max Lure Level" },
    { value: "antiTimeRange", label: "Anti-Time Range" },
    { value: "antiFluidBlock", label: "Anti-Fluid Block" },
    { value: "antiBobber", label: "Anti-Bobber" },
    { value: "antiBait", label: "Anti-Bait" },
    { value: "antiLabelMode", label: "Anti-Label Mode" },
    { value: "weightMultiplierMultiplier", label: "Weight Multiplier" },
    { value: "weightMultiplierBiomes", label: "WM-Biomes" },
    { value: "weightMultiplierDimensions", label: "WM-Dimensions" },
    { value: "weightMultiplierStructures", label: "WM-Structures" },
    { value: "weightMultiplierNeededNearbyBlocks", label: "WM-Nearby Blocks" },
    { value: "weightMultiplierNeededBaseBlocks", label: "WM-Base Blocks" },
    { value: "weightMultiplierLabels", label: "WM-Labels" },
    { value: "weightMultiplierCanSeeSky", label: "WM-Can See Sky" },
    { value: "weightMultiplierIsRaining", label: "WM-Raining" },
    { value: "weightMultiplierIsThundering", label: "WM-Thundering" },
    { value: "weightMultiplierIsSlimeChunk", label: "WM-Slime Chunk" },
    { value: "weightMultiplierFluidIsSource", label: "WM-Fluid Is Source" },
    { value: "weightMultiplierMoonPhase", label: "WM-Moon Phase" },
    { value: "weightMultiplierMinX", label: "WM-Min X" },
    { value: "weightMultiplierMinY", label: "WM-Min Y" },
    { value: "weightMultiplierMinZ", label: "WM-Min Z" },
    { value: "weightMultiplierMaxX", label: "WM-Max X" },
    { value: "weightMultiplierMaxY", label: "WM-Max Y" },
    { value: "weightMultiplierMaxZ", label: "WM-Max Z" },
    { value: "weightMultiplierMinLight", label: "WM-Min Light" },
    { value: "weightMultiplierMaxLight", label: "WM-Max Light" },
    { value: "weightMultiplierMinSkyLight", label: "WM-Min Sky Light" },
    { value: "weightMultiplierMaxSkyLight", label: "WM-Max Sky Light" },
    { value: "weightMultiplierMinWidth", label: "WM-Min Width" },
    { value: "weightMultiplierMaxWidth", label: "WM-Max Width" },
    { value: "weightMultiplierMinHeight", label: "WM-Min Height" },
    { value: "weightMultiplierMaxHeight", label: "WM-Max Height" },
    { value: "weightMultiplierMinDepth", label: "WM-Min Depth" },
    { value: "weightMultiplierMaxDepth", label: "WM-Max Depth" },
    { value: "weightMultiplierMinLureLevel", label: "WM-Min Lure Level" },
    { value: "weightMultiplierMaxLureLevel", label: "WM-Max Lure Level" },
    { value: "weightMultiplierTimeRange", label: "WM-Time Range" },
    { value: "weightMultiplierFluidBlock", label: "WM-Fluid Block" },
    { value: "weightMultiplierBobber", label: "WM-Bobber" },
    { value: "weightMultiplierBait", label: "WM-Bait" },
    { value: "weightMultiplierLabelMode", label: "WM-Label Mode" },
  ];

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
    if (storageUsage.percentage > 80) {
      // Lowered threshold from 90% to 80%
      try {
        const saved = localStorage.getItem("spawn_reports");
        if (saved) {
          const reports = JSON.parse(saved);

          // More aggressive cleanup - keep only the 15 most recent reports
          // and limit spawns per report to reduce storage usage
          const cleanedReports = reports.slice(0, 15).map((report) => ({
            ...report,
            data: report.data.slice(0, 500), // Keep only first 500 spawns per file
          }));

          localStorage.setItem("spawn_reports", JSON.stringify(cleanedReports));
          setFileReports(cleanedReports);
          updateStorageUsage();
          toast.warning(
            "⚠️ Storage was nearly full. Automatically removed old reports and limited spawns per file."
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
          View biome tags like <code>#cobblemon:is_arid</code> in the{" "}
          <a
            href="https://gitlab.com/cable-mc/cobblemon/-/blob/main/docs/cobblemon-tags/1.6.1/BiomeTags.md"
            className="text-blue-400 underline hover:text-blue-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cobblemon Biome Tags in GitLab
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
                  placeholder="🔍 Search spawn data..."
                  className="w-full pl-10 pr-4 py-3 bg-[#2c2c2c] border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
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
                      Context Filter
                    </label>
                    <select
                      value={contextFilter}
                      onChange={(e) => setContextFilter(e.target.value)}
                      className="w-full bg-[#3a3a3a] border border-gray-600 text-white p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Contexts</option>
                      {availableContexts.map((ctx) => (
                        <option key={ctx} value={ctx}>
                          {ctx.charAt(0).toUpperCase() + ctx.slice(1)}
                        </option>
                      ))}
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
                <span>Results: {filteredData.length}</span>
                <span className="text-gray-600">|</span>
                <span>Files: {fileReports.filter((r) => !r.error).length}</span>
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

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
              onClick={clearAll}
            >
              <X size={16} /> Clear All
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700 transition"
              onClick={() => {
                try {
                  const saved = localStorage.getItem("spawn_reports");
                  if (saved) {
                    const reports = JSON.parse(saved);
                    // Keep only the 10 most recent reports and limit spawns
                    const cleanedReports = reports
                      .slice(0, 10)
                      .map((report) => ({
                        ...report,
                        data: report.data.slice(0, 250), // Keep only first 250 spawns per file
                      }));
                    localStorage.setItem(
                      "spawn_reports",
                      JSON.stringify(cleanedReports)
                    );
                    setFileReports(cleanedReports);
                    updateStorageUsage();
                    toast.success(
                      "✅ Cleaned up storage - kept 10 most recent files with limited spawns."
                    );
                  }
                } catch (err) {
                  console.error("Manual cleanup failed:", err);
                  toast.error("❌ Cleanup failed.");
                }
              }}
            >
              🧹 Clean Storage
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
