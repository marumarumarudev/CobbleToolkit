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
import { useStorage, usePreferences } from "@/hooks/useStorage";
import StorageInfo from "./StorageInfo";
import { formatPokemonName, matchesSearch } from "@/utils/nameUtils";
import { useSharedFiles } from "@/contexts/SharedFilesContext";

export default function UploadArea() {
  const [loading, setLoading] = useState(false);
  const [searchField, setSearchField] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [contextFilter, setContextFilter] = useState("all");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [sort, setSort] = useState({ column: "bucket", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 25;

  // Biome tags map loaded from BiomeTags.md { "#cobblemon:is_mountain": ["minecraft:...", ...] }
  const [biomeTagsMap, setBiomeTagsMap] = useState({});
  const [biomeTagsLoaded, setBiomeTagsLoaded] = useState(false);

  // Floating tooltip state (fixed-position, not clipped by overflow containers)
  const [hoverTooltip, setHoverTooltip] = useState({
    visible: false,
    pinned: false,
    x: 0,
    y: 0,
    content: null, // { title: string, entries: string[] }
  });

  const showTooltip = (x, y, content) => {
    setHoverTooltip({ visible: true, pinned: false, x, y, content });
  };

  const hideTooltip = () => {
    setHoverTooltip((prev) =>
      prev.pinned ? prev : { ...prev, visible: false }
    );
  };

  // Heuristic resolver for biome tag keys from various inputs (e.g., "mountain" → "#cobblemon:is_mountain")
  const resolveBiomeTagEntries = (raw) => {
    if (!raw) return [];
    const s = String(raw).trim();
    const candidates = new Set();

    // If already a tag, try as-is and lowercase
    if (s.startsWith("#")) {
      candidates.add(s);
      candidates.add(s.toLowerCase());
    } else {
      // Plain labels like "mountain" or "is_mountain"
      const base = s.toLowerCase().replace(/\s+/g, "_");
      const withIs = base.startsWith("is_") ? base : `is_${base}`;
      candidates.add(`#${base}`);
      candidates.add(`#${withIs}`);
      candidates.add(`#cobblemon:${base}`);
      candidates.add(`#cobblemon:${withIs}`);
      candidates.add(`#minecraft:${base}`);
      candidates.add(`#minecraft:${withIs}`);
    }

    for (const key of candidates) {
      if (biomeTagsMap[key]?.length) return biomeTagsMap[key];
    }
    return [];
  };

  const {
    data: fileReports,
    setData: setFileReports,
    saveData: saveReports,
    clearData: clearReports,
    loading: storageLoading,
    error: storageError,
  } = useStorage("spawnReports", []);
  const { sharedFiles } = useSharedFiles();
  const [processedFiles, setProcessedFiles] = useState(new Set());
  const [processedFilesLoaded, setProcessedFilesLoaded] = useState(false);
  const SCANNER_NAME = "spawnScanner";

  const { preferences: sortPreferences, savePreferences: saveSortPreferences } =
    usePreferences("spawnScanner", {
      column: "pokemon",
      direction: "asc",
    });

  useEffect(() => {
    document.title = "Spawn Scanner | CobbleToolkit";
  }, []);

  // Load and parse BiomeTags.md to enable hover tooltips for biome tags
  useEffect(() => {
    let isCancelled = false;

    // Remote fetch to GitLab raw is blocked by CORS; rely on local copy served from /public

    const parseBiomeTagsMarkdown = (markdownText) => {
      /**
       * Very lightweight parser for our specific MD structure:
       * - Look for lines like: <summary><b>Tag:</b> #cobblemon:is_mountain</summary>
       * - Collect following list items beginning with "- " until we hit </details>
       */
      const lines = markdownText.split(/\r?\n/);
      const map = {};
      let currentTag = null;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const tagMatch = line.match(
          /<summary><b>Tag:<\/b>\s*(#[^<\s]+)\s*<\/summary>/i
        );
        if (tagMatch) {
          currentTag = tagMatch[1];
          if (!map[currentTag]) map[currentTag] = [];
          continue;
        }
        if (currentTag) {
          if (line.startsWith("- ")) {
            const entry = line.slice(2).trim();
            if (entry) map[currentTag].push(entry);
          } else if (line.includes("</details>")) {
            currentTag = null;
          }
        }
      }
      return map;
    };

    const fetchAndParse = async () => {
      if (biomeTagsLoaded) return; // prevent duplicate loads

      // Try local copy (must be placed in /public as BiomeTags.md)
      const candidates = ["/BiomeTags.md"];

      for (const url of candidates) {
        try {
          const resp = await fetch(url, { cache: "no-store" });
          if (!resp.ok) continue;
          const text = await resp.text();
          if (isCancelled) return;
          const parsed = parseBiomeTagsMarkdown(text);
          setBiomeTagsMap(parsed || {});
          try {
            const count = Object.keys(parsed || {}).length;
            console.info(`[BiomeTags] Loaded ${count} tags from`, url);
          } catch {}
          setBiomeTagsLoaded(true);
          return;
        } catch {
          // ignore and try next candidate
        }
      }

      // If all attempts fail, mark as loaded to avoid repeated fetches
      if (!isCancelled) setBiomeTagsLoaded(true);
    };

    fetchAndParse();
    return () => {
      isCancelled = true;
    };
  }, [biomeTagsLoaded]);

  useEffect(() => {
    saveSortPreferences({ sort });
  }, [sort, saveSortPreferences]);

  // Load processed files tracking on mount
  useEffect(() => {
    const loadProcessedFiles = async () => {
      try {
        const { default: getStorage } = await import(
          "@/utils/indexedDBStorage"
        );
        const storage = getStorage();
        const processed = await storage.getProcessedFiles(SCANNER_NAME);
        setProcessedFiles(processed);
        setProcessedFilesLoaded(true);
      } catch (err) {
        console.error("Failed to load processed files:", err);
        setProcessedFilesLoaded(true); // Set to true even on error to prevent blocking
      }
    };
    loadProcessedFiles();
  }, []);

  // Process shared files automatically for spawn data
  useEffect(() => {
    const processSharedFiles = async () => {
      // Wait for processed files to be loaded before processing
      if (!processedFilesLoaded || !sharedFiles.length || loading) return;

      // Filter out files already processed by this scanner
      const unprocessed = sharedFiles.filter(
        (sf) => sf.file && !processedFiles.has(sf.id)
      );

      if (!unprocessed.length) return;

      setLoading(true);
      const parsedReports = [];
      const existingFileNames = new Set(fileReports.map((r) => r.name));
      const { default: getStorage } = await import("@/utils/indexedDBStorage");
      const storage = getStorage();

      for (const sharedFile of unprocessed) {
        // Check for duplicates in current data
        if (existingFileNames.has(sharedFile.name)) {
          console.log(`⏭️ Skipping duplicate file: ${sharedFile.name}`);
          // Mark as processed even if duplicate
          await storage.markFileProcessed(SCANNER_NAME, sharedFile.id);
          setProcessedFiles((prev) => new Set([...prev, sharedFile.id]));
          continue;
        }

        try {
          const parsed = await parseCobblemonZip(sharedFile.file);
          if (parsed && parsed.length > 0) {
            parsedReports.push({
              id: crypto.randomUUID(),
              name: sharedFile.name,
              data: parsed,
              fromShared: true,
            });
            existingFileNames.add(sharedFile.name);
            console.log(
              `✅ Processed shared file ${sharedFile.name}: ${parsed.length} spawns`
            );
          }
        } catch (err) {
          console.error(
            `❌ Failed to process shared file ${sharedFile.name}:`,
            err
          );
        }
        // Mark as processed in persistent storage
        await storage.markFileProcessed(SCANNER_NAME, sharedFile.id);
        setProcessedFiles((prev) => new Set([...prev, sharedFile.id]));
      }

      if (parsedReports.length > 0) {
        const updated = [...parsedReports, ...fileReports];
        try {
          await saveReports(updated);
          setFileReports(updated);
          toast.success(
            `✅ Processed ${parsedReports.length} shared file(s) for spawn data`
          );
        } catch (err) {
          console.error("Failed to save spawn reports:", err);
          setFileReports(updated);
        }
      }

      setLoading(false);
    };

    processSharedFiles();
  }, [
    sharedFiles,
    loading,
    fileReports,
    saveReports,
    setFileReports,
    processedFiles,
    processedFilesLoaded,
  ]);

  const prevSearch = useRef("");

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

    // Weight multiplier (plural) summary
    { key: "weightMultipliers", label: "Weight Multipliers", sortable: false },

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
        r.sourceFile,
        // Serialize plural weight multipliers for search
        Array.isArray(r.weightMultipliers)
          ? r.weightMultipliers
              .map((wm) => {
                try {
                  return [
                    wm.multiplier,
                    ...(wm.condition
                      ? Object.entries(wm.condition).map(
                          ([k, v]) => `${k}:${String(v)}`
                        )
                      : []),
                  ]
                    .filter(Boolean)
                    .join(" ");
                } catch {
                  return "";
                }
              })
              .join(" | ")
          : "",
      ]
        .filter(Boolean)
        .some((value) => matchesSearch(debouncedSearch, value));
    } else {
      const value = r[searchField];
      const searchValue =
        searchField === "weightMultipliers"
          ? Array.isArray(value)
            ? value
                .map((wm) => {
                  try {
                    return [
                      wm.multiplier,
                      ...(wm.condition
                        ? Object.entries(wm.condition).map(
                            ([k, v]) => `${k}:${String(v)}`
                          )
                        : []),
                    ]
                      .filter(Boolean)
                      .join(" ");
                  } catch {
                    return "";
                  }
                })
                .join(" | ")
            : ""
          : (value ?? "").toString();
      return matchesSearch(debouncedSearch, searchValue);
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

  const clearSearch = () => {
    setSearchTerm("");
    setSearchField("all");
    setCurrentPage(1);
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
    { value: "weightMultipliers", label: "Weight Multipliers" },
  ];

  return (
    <div
      className="min-h-screen bg-[#1e1e1e] text-white px-4 py-8 flex flex-col items-center"
      onClick={() =>
        setHoverTooltip((prev) =>
          prev.pinned
            ? { visible: false, pinned: false, x: 0, y: 0, content: null }
            : prev
        )
      }
    >
      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Cobblemon Spawn Pool Scanner
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          View Pokémon spawn pools from uploaded datapacks.
        </p>
        <p className="text-gray-300 text-sm text-center mt-2">
          Upload files using the &quot;Upload File&quot; button in the
          navigation bar.
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

      {loading && (
        <div className="mb-4 flex flex-col items-center gap-2 text-blue-400">
          <div className="flex items-center gap-2">
            <Spinner />
            <span>Processing shared files...</span>
          </div>
        </div>
      )}

      {fileReports.length > 0 && (
        <>
          {/* Add StorageInfo component here */}
          <div className="w-full max-w-4xl mb-6 px-4">
            <div className="flex items-center justify-center gap-4">
              <StorageInfo />
              <button
                onClick={async () => {
                  if (
                    window.confirm(
                      "Are you sure you want to clear all spawn data? This cannot be undone."
                    )
                  ) {
                    const success = await clearReports();
                    if (success) {
                      // Don't clear processed files tracking - this prevents automatic reprocessing
                      // If user wants to reprocess, they can clear tracking separately
                      setFileReports([]);
                      toast.success("All spawn data cleared successfully");
                    } else {
                      toast.error("Failed to clear data");
                    }
                  }
                }}
                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded text-xs transition-colors duration-200 border border-red-600/30"
              >
                Clear All Data
              </button>
            </div>
          </div>

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
                      Matches: &ldquo;{debouncedSearch}&rdquo;
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
                            ) : key === "weightMultipliers" &&
                              Array.isArray(value) ? (
                              <div className="flex flex-wrap gap-1">
                                {value.map((wm, i) => {
                                  const summary = (() => {
                                    try {
                                      const parts = [];
                                      if (wm?.multiplier)
                                        parts.push(`x${wm.multiplier}`);
                                      const cond = wm?.condition || {};
                                      const condParts = Object.entries(
                                        cond
                                      ).map(([k, v]) => `${k}=${String(v)}`);
                                      if (condParts.length)
                                        parts.push(condParts.join(", "));
                                      return parts.join(" • ");
                                    } catch {
                                      return "";
                                    }
                                  })();
                                  return (
                                    <span
                                      key={i}
                                      className="px-2 py-1 bg-gray-700/50 rounded text-xs"
                                    >
                                      {summary || "(invalid)"}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : isArray ? (
                              <div className="flex flex-wrap gap-1">
                                {value.map((item, i) => {
                                  const itemStr = String(item);
                                  const entries =
                                    resolveBiomeTagEntries(itemStr);
                                  const content = { title: itemStr, entries };
                                  const isTagVisual =
                                    itemStr.startsWith("#") ||
                                    /^[a-zA-Z_\s]+$/.test(itemStr);
                                  return (
                                    <span
                                      key={i}
                                      onMouseEnter={(e) => {
                                        if (hoverTooltip.pinned) return;
                                        const rect =
                                          e.currentTarget.getBoundingClientRect();
                                        const x = Math.min(
                                          rect.left,
                                          window.innerWidth - 20
                                        );
                                        const y = Math.min(
                                          rect.bottom + 8,
                                          window.innerHeight - 20
                                        );
                                        showTooltip(x, y, content);
                                      }}
                                      onMouseLeave={hideTooltip}
                                      onClick={(e) => {
                                        const rect =
                                          e.currentTarget.getBoundingClientRect();
                                        const x = Math.min(
                                          rect.left,
                                          window.innerWidth - 20
                                        );
                                        const y = Math.min(
                                          rect.bottom + 8,
                                          window.innerHeight - 20
                                        );
                                        setHoverTooltip({
                                          visible: true,
                                          pinned: true,
                                          x,
                                          y,
                                          content,
                                        });
                                        e.stopPropagation();
                                      }}
                                      className={`${
                                        isTagVisual
                                          ? "px-2 py-1 rounded text-xs bg-blue-700/40 border border-blue-600/40"
                                          : "px-2 py-1 rounded text-xs bg-gray-700/50"
                                      } cursor-pointer hover:underline`}
                                      aria-label={content}
                                      role="note"
                                    >
                                      {itemStr}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : key === "biomes" || key === "antiBiomes" ? (
                              (() => {
                                const tokens = String(value || "")
                                  .split(/[\|,]/)
                                  .map((t) => t.trim())
                                  .filter(Boolean);
                                if (tokens.length === 0) {
                                  return (
                                    <span className="text-gray-500 text-xs"></span>
                                  );
                                }
                                return (
                                  <div className="flex flex-wrap gap-1">
                                    {tokens.map((tok, i) => {
                                      const entries =
                                        resolveBiomeTagEntries(tok);
                                      const content = { title: tok, entries };
                                      const isTagVisual =
                                        tok.startsWith("#") ||
                                        /^[a-zA-Z_\s]+$/.test(tok);
                                      return (
                                        <span
                                          key={i}
                                          onMouseEnter={(e) => {
                                            if (hoverTooltip.pinned) return;
                                            const rect =
                                              e.currentTarget.getBoundingClientRect();
                                            const x = Math.min(
                                              rect.left,
                                              window.innerWidth - 20
                                            );
                                            const y = Math.min(
                                              rect.bottom + 8,
                                              window.innerHeight - 20
                                            );
                                            showTooltip(x, y, content);
                                          }}
                                          onMouseLeave={hideTooltip}
                                          onClick={(e) => {
                                            const rect =
                                              e.currentTarget.getBoundingClientRect();
                                            const x = Math.min(
                                              rect.left,
                                              window.innerWidth - 20
                                            );
                                            const y = Math.min(
                                              rect.bottom + 8,
                                              window.innerHeight - 20
                                            );
                                            setHoverTooltip({
                                              visible: true,
                                              pinned: true,
                                              x,
                                              y,
                                              content,
                                            });
                                            e.stopPropagation();
                                          }}
                                          className={`${
                                            isTagVisual
                                              ? "px-2 py-1 rounded text-xs bg-blue-700/40 border border-blue-600/40"
                                              : "px-2 py-1 rounded text-xs bg-gray-700/50"
                                          } cursor-pointer hover:underline`}
                                          aria-label={content}
                                          role="note"
                                        >
                                          {tok}
                                        </span>
                                      );
                                    })}
                                  </div>
                                );
                              })()
                            ) : key === "sourceFile" ? (
                              <span className="text-xs text-gray-400 font-mono">
                                {value}
                              </span>
                            ) : key === "pokemon" ? (
                              <span className="text-gray-300 font-medium">
                                {formatPokemonName(value)}
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

      {/* Global floating tooltip (fixed; avoids overflow clipping) */}
      {hoverTooltip.visible && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            left: hoverTooltip.x,
            top: hoverTooltip.y,
            transform: "translate3d(0,0,0)",
          }}
          className="z-[1000] max-w-[28rem] text-[12px] text-white bg-[#0b0b0c]/95 backdrop-blur-sm border border-gray-700/60 rounded-lg shadow-2xl"
        >
          <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-gray-700/60">
            <div className="font-semibold truncate">
              {hoverTooltip.content?.title || "Biome tag"}
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto px-3 py-2">
            {Array.isArray(hoverTooltip.content?.entries) &&
            hoverTooltip.content.entries.length > 0 ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 pr-1">
                {hoverTooltip.content.entries.map((e, idx) => (
                  <li
                    key={idx}
                    className="text-gray-200/95 text-[12px] leading-5"
                  >
                    {e}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400 text-[12px]">
                No entries found for this tag
              </div>
            )}
          </div>
          {hoverTooltip.pinned ? (
            <div className="px-3 py-2 text-[11px] text-gray-400 border-t border-gray-700/60">
              Click anywhere outside to close
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
