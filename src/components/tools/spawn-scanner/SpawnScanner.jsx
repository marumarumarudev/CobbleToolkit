"use client";

import { useState, useEffect, useMemo } from "react";
import { parseCobblemonZip } from "@/utils/spawnParser";
import toast from "react-hot-toast";
import { Search, X, SlidersHorizontal, Radar } from "lucide-react";
import { useStorage, usePreferences } from "@/hooks/useStorage";
import { withBasePath } from "@/utils/basePath";
import StorageInfo from "@/components/StorageInfo";
import { formatPokemonName, matchesSearch } from "@/utils/nameUtils";
import { useSharedFiles } from "@/contexts/SharedFilesContext";
import { SHARED_FILES_CHANGED_EVENT } from "@/utils/toolDataStores";
import {
  Card,
  CardBody,
  Badge,
  Button,
  FileDropzone,
  EmptyState,
  DataTable,
  Spinner,
} from "@/components/ui";

const SCANNER_NAME = "spawnScanner";

const RARITY_ORDER = { common: 0, uncommon: 1, rare: 2, "ultra-rare": 3 };
const RARITY_TONE = {
  common: "success",
  uncommon: "info",
  rare: "accent",
  "ultra-rare": "warning",
};

// Column metadata — same field set the original scanner exposed, kept here
// as the source of truth for both column visibility and search-field options.
const TABLE_COLUMNS = [
  { key: "pokemon", label: "Pokémon" },
  { key: "bucket", label: "Rarity" },
  { key: "level", label: "Level" },
  { key: "weight", label: "Weight" },
  { key: "spawnablePositionType", label: "Spawnable Position Type" },
  { key: "presets", label: "Presets" },
  { key: "biomes", label: "Biomes" },
  { key: "dimensions", label: "Dimensions" },
  { key: "structures", label: "Structures" },
  { key: "neededNearbyBlocks", label: "Nearby Blocks" },
  { key: "neededBaseBlocks", label: "Base Blocks" },
  { key: "labels", label: "Labels" },
  { key: "canSeeSky", label: "Can See Sky" },
  { key: "isRaining", label: "Raining" },
  { key: "isThundering", label: "Thundering" },
  { key: "isSlimeChunk", label: "Slime Chunk" },
  { key: "fluidIsSource", label: "Fluid Is Source" },
  { key: "moonPhase", label: "Moon Phase" },
  { key: "minX", label: "Min X" },
  { key: "minY", label: "Min Y" },
  { key: "minZ", label: "Min Z" },
  { key: "maxX", label: "Max X" },
  { key: "maxY", label: "Max Y" },
  { key: "maxZ", label: "Max Z" },
  { key: "minLight", label: "Min Light" },
  { key: "maxLight", label: "Max Light" },
  { key: "minSkyLight", label: "Min Sky Light" },
  { key: "maxSkyLight", label: "Max Sky Light" },
  { key: "minWidth", label: "Min Width" },
  { key: "maxWidth", label: "Max Width" },
  { key: "minHeight", label: "Min Height" },
  { key: "maxHeight", label: "Max Height" },
  { key: "minDepth", label: "Min Depth" },
  { key: "maxDepth", label: "Max Depth" },
  { key: "minLureLevel", label: "Min Lure Level" },
  { key: "maxLureLevel", label: "Max Lure Level" },
  { key: "timeRange", label: "Time Range" },
  { key: "fluidBlock", label: "Fluid Block" },
  { key: "bobber", label: "Bobber" },
  { key: "bait", label: "Bait" },
  { key: "labelMode", label: "Label Mode" },
  { key: "lightLevel", label: "Light Level" },
  { key: "antiBiomes", label: "Anti-Biomes" },
  { key: "antiStructures", label: "Anti-Structures" },
  { key: "antiDimensions", label: "Anti-Dimensions" },
  { key: "antiNeededNearbyBlocks", label: "Anti-Nearby Blocks" },
  { key: "antiNeededBaseBlocks", label: "Anti-Base Blocks" },
  { key: "antiLabels", label: "Anti-Labels" },
  { key: "antiCanSeeSky", label: "Anti-Can See Sky" },
  { key: "antiIsRaining", label: "Anti-Raining" },
  { key: "antiIsThundering", label: "Anti-Thundering" },
  { key: "antiIsSlimeChunk", label: "Anti-Slime Chunk" },
  { key: "antiFluidIsSource", label: "Anti-Fluid Is Source" },
  { key: "antiMoonPhase", label: "Anti-Moon Phase" },
  { key: "antiMinX", label: "Anti-Min X" },
  { key: "antiMinY", label: "Anti-Min Y" },
  { key: "antiMinZ", label: "Anti-Min Z" },
  { key: "antiMaxX", label: "Anti-Max X" },
  { key: "antiMaxY", label: "Anti-Max Y" },
  { key: "antiMaxZ", label: "Anti-Max Z" },
  { key: "antiMinLight", label: "Anti-Min Light" },
  { key: "antiMaxLight", label: "Anti-Max Light" },
  { key: "antiMinSkyLight", label: "Anti-Min Sky Light" },
  { key: "antiMaxSkyLight", label: "Anti-Max Sky Light" },
  { key: "antiMinWidth", label: "Anti-Min Width" },
  { key: "antiMaxWidth", label: "Anti-Max Width" },
  { key: "antiMinHeight", label: "Anti-Min Height" },
  { key: "antiMaxHeight", label: "Anti-Max Height" },
  { key: "antiMinDepth", label: "Anti-Min Depth" },
  { key: "antiMaxDepth", label: "Anti-Max Depth" },
  { key: "antiMinLureLevel", label: "Anti-Min Lure Level" },
  { key: "antiMaxLureLevel", label: "Anti-Max Lure Level" },
  { key: "antiTimeRange", label: "Anti-Time Range" },
  { key: "antiFluidBlock", label: "Anti-Fluid Block" },
  { key: "antiBobber", label: "Anti-Bobber" },
  { key: "antiBait", label: "Anti-Bait" },
  { key: "antiLabelMode", label: "Anti-Label Mode" },
  { key: "weightMultipliers", label: "Weight Multipliers", sortable: false },
  { key: "sourceFile", label: "Source File" },
];

const SEARCH_FIELDS = [
  { value: "all", label: "All Fields" },
  ...TABLE_COLUMNS.filter((c) => c.key !== "weightMultipliers").map((c) => ({
    value: c.key,
    label: c.label,
  })),
  { value: "weightMultipliers", label: "Weight Multipliers" },
];

function weightMultiplierSummary(wm) {
  try {
    const parts = [];
    if (wm?.multiplier) parts.push(`x${wm.multiplier}`);
    const cond = wm?.condition || {};
    const condParts = Object.entries(cond).map(([k, v]) => `${k}=${String(v)}`);
    if (condParts.length) parts.push(condParts.join(", "));
    return parts.join(" • ");
  } catch {
    return "";
  }
}

const WIDE_COLUMN_KEYS = new Set([
  "biomes",
  "antiBiomes",
  "structures",
  "antiStructures",
  "labels",
  "antiLabels",
  "neededNearbyBlocks",
  "antiNeededNearbyBlocks",
  "neededBaseBlocks",
  "antiNeededBaseBlocks",
  "weightMultipliers",
  "presets",
  "sourceFile",
]);

function colWidth(key) {
  if (key === "pokemon") return 190;
  // Biomes / anti-biomes get more room so tags don't hard-clip as often.
  if (key === "biomes" || key === "antiBiomes") return 280;
  if (WIDE_COLUMN_KEYS.has(key)) return 240;
  return 130;
}

export default function SpawnScanner() {
  const [loading, setLoading] = useState(false);
  const [searchField, setSearchField] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [contextFilter, setContextFilter] = useState("all");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Biome tags map loaded from BiomeTags.md — enables hover tooltips.
  const [biomeTagsMap, setBiomeTagsMap] = useState({});
  const [biomeTagsLoaded, setBiomeTagsLoaded] = useState(false);

  // Floating tooltip (fixed-position, not clipped by table overflow).
  const [hoverTooltip, setHoverTooltip] = useState({
    visible: false,
    pinned: false,
    x: 0,
    y: 0,
    content: null,
  });

  const showTooltip = (x, y, content) =>
    setHoverTooltip({ visible: true, pinned: false, x, y, content });
  const hideTooltip = () =>
    setHoverTooltip((prev) => (prev.pinned ? prev : { ...prev, visible: false }));

  const resolveBiomeTagEntries = (raw) => {
    if (!raw) return [];
    const s = String(raw).trim();
    const candidates = new Set();
    if (s.startsWith("#")) {
      candidates.add(s);
      candidates.add(s.toLowerCase());
    } else {
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
    loadData: reloadReports,
  } = useStorage("spawnReports", []);
  const { sharedFiles, addSharedFile } = useSharedFiles();
  const [processedFiles, setProcessedFiles] = useState(new Set());
  const [processedFilesLoaded, setProcessedFilesLoaded] = useState(false);

  usePreferences("spawnScanner", { column: "pokemon", direction: "asc" });

  useEffect(() => {
    document.title = "Spawn Scanner | CobbleToolkit";
  }, []);

  // Load + parse BiomeTags.md for hover tooltips
  useEffect(() => {
    let cancelled = false;

    const parseBiomeTagsMarkdown = (markdownText) => {
      const lines = markdownText.split(/\r?\n/);
      const map = {};
      let currentTag = null;
      for (const raw of lines) {
        const line = raw.trim();
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
      if (biomeTagsLoaded) return;
      try {
        const resp = await fetch(withBasePath("/BiomeTags.md"), {
          cache: "no-store",
        });
        if (resp.ok) {
          const text = await resp.text();
          if (!cancelled) {
            setBiomeTagsMap(parseBiomeTagsMarkdown(text) || {});
            setBiomeTagsLoaded(true);
          }
          return;
        }
      } catch {
        // ignore — fall through to marking loaded below
      }
      if (!cancelled) setBiomeTagsLoaded(true);
    };

    fetchAndParse();
    return () => {
      cancelled = true;
    };
  }, [biomeTagsLoaded]);

  // Load processed-files tracking
  useEffect(() => {
    (async () => {
      try {
        const { default: getStorage } = await import(
          "@/utils/indexedDBStorage"
        );
        const storage = getStorage();
        setProcessedFiles(await storage.getProcessedFiles(SCANNER_NAME));
      } catch (err) {
        console.error("Failed to load processed files:", err);
      } finally {
        setProcessedFilesLoaded(true);
      }
    })();
  }, []);

  // The nav upload widget is the single place files/data get removed. When
  // it removes a file or clears everything, refresh our data + processed
  // set from IndexedDB so this view never shows stale rows.
  useEffect(() => {
    const handleFilesChanged = async () => {
      await reloadReports();
      try {
        const { default: getStorage } = await import(
          "@/utils/indexedDBStorage"
        );
        const storage = getStorage();
        setProcessedFiles(await storage.getProcessedFiles(SCANNER_NAME));
      } catch (err) {
        console.error("Failed to refresh processed files:", err);
      }
    };
    window.addEventListener(SHARED_FILES_CHANGED_EVENT, handleFilesChanged);
    return () =>
      window.removeEventListener(
        SHARED_FILES_CHANGED_EVENT,
        handleFilesChanged
      );
  }, [reloadReports]);

  // Auto-process shared files
  useEffect(() => {
    const run = async () => {
      if (!processedFilesLoaded || !sharedFiles.length || loading) return;

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
        if (existingFileNames.has(sharedFile.name)) {
          await storage.markFileProcessed(SCANNER_NAME, sharedFile.id);
          setProcessedFiles((prev) => new Set([...prev, sharedFile.id]));
          continue;
        }
        try {
          const parsed = await parseCobblemonZip(sharedFile.file);
          if (parsed?.length) {
            parsedReports.push({
              id: crypto.randomUUID(),
              name: sharedFile.name,
              data: parsed,
              fromShared: true,
            });
            existingFileNames.add(sharedFile.name);
          }
        } catch (err) {
          console.error(`Failed to process ${sharedFile.name}:`, err);
        }
        await storage.markFileProcessed(SCANNER_NAME, sharedFile.id);
        setProcessedFiles((prev) => new Set([...prev, sharedFile.id]));
      }

      if (parsedReports.length > 0) {
        const updated = [...parsedReports, ...fileReports];
        try {
          await saveReports(updated);
          setFileReports(updated);
          toast.success(
            `Processed ${parsedReports.length} shared file${
              parsedReports.length === 1 ? "" : "s"
            } for spawn data`
          );
        } catch (err) {
          console.error("Failed to save spawn reports:", err);
          setFileReports(updated);
        }
      }

      setLoading(false);
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedFiles, processedFilesLoaded, loading]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleDroppedFiles = async (fileList) => {
    const valid = Array.from(fileList).filter((f) =>
      f.name.toLowerCase().match(/\.(zip|jar)$/)
    );
    if (!valid.length) {
      toast.error("Only .zip or .jar files are supported.");
      return;
    }
    for (const file of valid) {
      await addSharedFile(file);
    }
  };

  const availableContexts = useMemo(
    () =>
      Array.from(
        new Set(
          fileReports
            .flatMap((r) =>
              r.data.map((d) => d.spawnablePositionType || d.context || "")
            )
            .filter((c) => typeof c === "string" && c.length > 0)
        )
      ).sort(),
    [fileReports]
  );

  const allSpawnData = useMemo(
    () =>
      fileReports
        .filter((r) => !r.error)
        .flatMap((r, reportIndex) =>
          r.data.map((d, spawnIndex) => ({
            ...d,
            spawnablePositionType:
              d.spawnablePositionType || d.context || "none",
            sourceFile: r.name,
            // Stable, collision-proof identity for React keys — independent
            // of content, since two spawn entries can otherwise share every
            // visible field (same pokemon/rarity/level, different biomes).
            _rowId: `${r.id || reportIndex}:${spawnIndex}`,
          }))
        ),
    [fileReports]
  );

  const filteredData = useMemo(() => {
    return allSpawnData.filter((r) => {
      const matchesContext =
        contextFilter === "all" || r.spawnablePositionType === contextFilter;
      if (!matchesContext) return false;
      if (!debouncedSearch) return true;

      if (searchField === "all") {
        const fields = TABLE_COLUMNS.filter(
          (c) => c.key !== "weightMultipliers"
        ).map(({ key }) => {
          const v = r[key];
          return typeof v === "boolean" ? v.toString() : v;
        });
        fields.push(
          Array.isArray(r.weightMultipliers)
            ? r.weightMultipliers.map(weightMultiplierSummary).join(" | ")
            : ""
        );
        return fields.filter(Boolean).some((value) =>
          matchesSearch(debouncedSearch, value)
        );
      }

      const value = r[searchField];
      const searchValue =
        searchField === "weightMultipliers"
          ? Array.isArray(value)
            ? value.map(weightMultiplierSummary).join(" | ")
            : ""
          : (value ?? "").toString();
      return matchesSearch(debouncedSearch, searchValue);
    });
  }, [allSpawnData, contextFilter, debouncedSearch, searchField]);

  const visibleColumnDefs = useMemo(
    () =>
      TABLE_COLUMNS.filter(({ key }) =>
        filteredData.some((d) => {
          const value = d[key];
          return Array.isArray(value)
            ? value.length > 0
            : typeof value === "boolean"
            ? true
            : value !== null && value !== undefined && value !== "";
        })
      ),
    [filteredData]
  );

  // Show all tags directly (no "+N more"). Virtualized rows need a fixed
  // height, so the chip area gets a generous max-height and the table uses
  // a matching taller rowHeight so multi-line biome lists fit without
  // slicing chip borders. Long individual chips still truncate cleanly.
  const renderTagList = (tokens) => {
    if (!tokens.length) return null;

    return (
      <div className="flex max-h-30 min-w-0 flex-wrap content-start gap-1 overflow-hidden">
        {tokens.map((tok, i) => {
          const isTagVisual =
            tok.startsWith("#") || /^[a-zA-Z_\s]+$/.test(tok);
          const chipClass = [
            "max-w-full truncate whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] leading-tight",
            isTagVisual
              ? "border border-accent/30 bg-accent-soft text-accent"
              : "bg-bg-surface-2 text-text-secondary",
          ].join(" ");

          // Only cobblemon-style biome tags have lookup data to show, so
          // only those get the hover/click tooltip wired up.
          if (!isTagVisual) {
            return (
              <span key={i} className={chipClass} title={tok}>
                {tok}
              </span>
            );
          }

          const entries = resolveBiomeTagEntries(tok);
          const content = { title: tok, entries };
          return (
            <span
              key={i}
              title={tok}
              onMouseEnter={(e) => {
                if (hoverTooltip.pinned) return;
                const rect = e.currentTarget.getBoundingClientRect();
                showTooltip(
                  Math.min(rect.left, window.innerWidth - 20),
                  Math.min(rect.bottom + 8, window.innerHeight - 20),
                  content
                );
              }}
              onMouseLeave={hideTooltip}
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                setHoverTooltip({
                  visible: true,
                  pinned: true,
                  x: Math.min(rect.left, window.innerWidth - 20),
                  y: Math.min(rect.bottom + 8, window.innerHeight - 20),
                  content,
                });
              }}
              className={`cursor-pointer hover:underline ${chipClass}`}
            >
              {tok}
            </span>
          );
        })}
      </div>
    );
  };

  const columns = useMemo(
    () =>
      visibleColumnDefs.map((col) => {
        if (col.key === "bucket") {
          return {
            key: col.key,
            label: col.label,
            width: colWidth(col.key),
            sortValue: (row) => RARITY_ORDER[row.bucket] ?? 99,
            render: (row) => (
              <Badge tone={RARITY_TONE[row.bucket] || "neutral"}>
                {row.bucket}
              </Badge>
            ),
          };
        }
        if (col.key === "pokemon") {
          return {
            key: col.key,
            label: col.label,
            width: colWidth(col.key),
            wrap: true,
            render: (row) => (
              <span
                title={formatPokemonName(row.pokemon)}
                className="font-medium capitalize leading-snug line-clamp-2"
              >
                {formatPokemonName(row.pokemon)}
              </span>
            ),
          };
        }
        if (col.key === "sourceFile") {
          return {
            key: col.key,
            label: col.label,
            width: colWidth(col.key),
            wrap: true,
            render: (row) => (
              <span
                title={row.sourceFile}
                className="font-mono text-[11px] text-text-muted leading-snug line-clamp-2 break-all"
              >
                {row.sourceFile}
              </span>
            ),
          };
        }
        if (col.key === "weightMultipliers") {
          return {
            key: col.key,
            label: col.label,
            width: colWidth(col.key),
            wrap: true,
            sortable: false,
            render: (row) =>
              Array.isArray(row.weightMultipliers) ? (
                <div className="flex flex-wrap gap-1">
                  {row.weightMultipliers.map((wm, i) => (
                    <span
                      key={i}
                      title={weightMultiplierSummary(wm) || "(invalid)"}
                      className="rounded bg-bg-surface-2 px-1.5 py-0.5 text-[11px] text-text-secondary"
                    >
                      {weightMultiplierSummary(wm) || "(invalid)"}
                    </span>
                  ))}
                </div>
              ) : null,
          };
        }
        if (col.key === "biomes" || col.key === "antiBiomes") {
          return {
            key: col.key,
            label: col.label,
            width: colWidth(col.key),
            wrap: true,
            render: (row) => {
              const tokens = String(row[col.key] || "")
                .split(/[|,]/)
                .map((t) => t.trim())
                .filter(Boolean);
              return tokens.length ? renderTagList(tokens) : null;
            },
          };
        }
        return {
          key: col.key,
          label: col.label,
          width: colWidth(col.key),
          wrap: true,
          render: (row) => {
            const value = row[col.key];
            if (Array.isArray(value)) {
              return value.length
                ? renderTagList(value.map((v) => String(v)))
                : null;
            }
            const text = value?.toString() ?? "";
            return (
              <span
                title={text.length > 20 ? text : undefined}
                className="text-text-primary leading-snug line-clamp-2 wrap-break-word"
              >
                {text}
              </span>
            );
          },
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visibleColumnDefs, hoverTooltip.pinned]
  );

  const clearSearch = () => {
    setSearchTerm("");
    setSearchField("all");
  };

  const hasData = fileReports.length > 0;

  return (
    <div
      className="flex flex-col gap-6"
      onClick={() =>
        setHoverTooltip((prev) =>
          prev.pinned
            ? { visible: false, pinned: false, x: 0, y: 0, content: null }
            : prev
        )
      }
    >
      <header>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-soft text-accent">
            <Radar size={16} />
          </div>
          <h1 className="text-xl font-semibold text-text-primary">
            Spawn Scanner
          </h1>
        </div>
        <p className="mt-1 text-sm text-text-secondary">
          Inspect spawn pool entries — rarity, level, weight, and every spawn
          condition — from an uploaded datapack.
        </p>
        <p className="mt-1 text-xs text-text-muted">
          Biome tags like{" "}
          <code className="font-mono text-accent">#cobblemon:is_arid</code>{" "}
          show their resolved biomes on hover. See the{" "}
          <a
            href="https://gitlab.com/cable-mc/cobblemon/-/blob/main/docs/cobblemon-tags/1.6.1/BiomeTags.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            full Cobblemon biome tag reference
          </a>
          .
        </p>
      </header>

      {!hasData && !loading && (
        <EmptyState
          icon={Radar}
          title="No datapack loaded yet"
          description="Drop a Cobblemon datapack .zip (or .jar) below, or use the upload button in the nav. This tool reads the spawn_pool_world/ folder."
          action={
            <FileDropzone
              accept=".zip,.jar"
              multiple
              onFiles={handleDroppedFiles}
              label="Drop your datapack here"
              hint="ZIP or JAR — parsed entirely in your browser"
              className="w-full max-w-md"
            />
          }
        />
      )}

      {loading && !hasData && (
        <Card>
          <CardBody className="flex items-center gap-3">
            <Spinner />
            <span className="text-sm text-text-secondary">
              Parsing datapack…
            </span>
          </CardBody>
        </Card>
      )}

      {hasData && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span>{filteredData.length} spawn entries</span>
              <span className="text-border">•</span>
              <span>{fileReports.filter((r) => !r.error).length} files</span>
              {loading && (
                <span className="flex items-center gap-1.5 text-accent">
                  <Spinner size={12} /> Parsing more files…
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <StorageInfo />
            </div>
          </div>

          <Card>
            <CardBody className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1">
                  <Search
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search spawn data…"
                    className="w-full rounded-md border border-border bg-bg-surface-2 py-2 pl-9 pr-8 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                  />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <Button
                  variant="secondary"
                  icon={SlidersHorizontal}
                  onClick={() => setShowAdvanced((v) => !v)}
                >
                  Advanced
                </Button>
              </div>

              {showAdvanced && (
                <div className="grid gap-3 rounded-md border border-border bg-bg-surface-2 p-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-secondary">
                      Search field
                    </label>
                    <select
                      value={searchField}
                      onChange={(e) => setSearchField(e.target.value)}
                      className="w-full rounded-md border border-border bg-bg-surface p-2 text-xs text-text-primary focus:border-accent focus:outline-none"
                    >
                      {SEARCH_FIELDS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-secondary">
                      Position type
                    </label>
                    <select
                      value={contextFilter}
                      onChange={(e) => setContextFilter(e.target.value)}
                      className="w-full rounded-md border border-border bg-bg-surface p-2 text-xs text-text-primary focus:border-accent focus:outline-none"
                    >
                      <option value="all">All position types</option>
                      {availableContexts.map((ctx) => (
                        <option key={ctx} value={ctx}>
                          {ctx.charAt(0).toUpperCase() + ctx.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => {
                        clearSearch();
                        setContextFilter("all");
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {filteredData.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No spawn data found"
              description="Try adjusting your search terms or filters."
            />
          ) : (
            <DataTable
              rows={filteredData}
              columns={columns}
              getRowKey={(row) => row._rowId}
              virtualized
              rowHeight={120}
              maxHeight="70vh"
            />
          )}
        </div>
      )}

      {hoverTooltip.visible && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            left: hoverTooltip.x,
            top: hoverTooltip.y,
          }}
          className="z-50 max-w-md rounded-lg border border-border bg-bg-base/95 text-xs text-text-primary shadow-2xl backdrop-blur-sm"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
            <div className="truncate font-semibold">
              {hoverTooltip.content?.title || "Biome tag"}
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto px-3 py-2">
            {Array.isArray(hoverTooltip.content?.tokens) ? (
              <div className="flex flex-wrap gap-1">
                {hoverTooltip.content.tokens.map((tok, idx) => {
                  const isTagVisual =
                    tok.startsWith("#") || /^[a-zA-Z_\s]+$/.test(tok);
                  return (
                    <span
                      key={idx}
                      className={[
                        "rounded px-1.5 py-0.5 text-[11px]",
                        isTagVisual
                          ? "border border-accent/30 bg-accent-soft text-accent"
                          : "bg-bg-surface-2 text-text-secondary",
                      ].join(" ")}
                    >
                      {tok}
                    </span>
                  );
                })}
              </div>
            ) : Array.isArray(hoverTooltip.content?.entries) &&
              hoverTooltip.content.entries.length > 0 ? (
              <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {hoverTooltip.content.entries.map((e, idx) => (
                  <li key={idx} className="leading-5 text-text-secondary">
                    {e}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-text-muted">
                No entries found for this tag
              </div>
            )}
          </div>
          {hoverTooltip.pinned && (
            <div className="border-t border-border px-3 py-2 text-[11px] text-text-muted">
              Click anywhere outside to close
            </div>
          )}
        </div>
      )}
    </div>
  );
}
