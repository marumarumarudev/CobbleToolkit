"use client";

import ScannerErrorNotice from "@/components/ScannerErrorNotice";
import { useState, useEffect, useMemo, useRef, useId } from "react";
import { parseCobblemonZip } from "@/utils/spawnParser";
import { createParseDiagnostics } from "@/utils/parseDiagnostics";
import SpawnParseDiagnostics from "@/components/SpawnParseDiagnostics";
import toast from "react-hot-toast";
import { Search, X, SlidersHorizontal, Radar } from "lucide-react";
import { usePreferences } from "@/hooks/useStorage";
import { withBasePath } from "@/utils/basePath";
import StorageInfo from "@/components/StorageInfo";
import { formatPokemonName, matchesSearch } from "@/utils/nameUtils";
import { useSharedFiles } from "@/contexts/SharedFilesContext";
import { useScannerLifecycle } from "@/hooks/useScannerLifecycle";
import ArchiveAvailabilityNotice from "@/components/ArchiveAvailabilityNotice";
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

const SCANNER_CONFIG = {
  scannerName: SCANNER_NAME,
  storeNames: ["spawnReports"],
  async parse(sharedFile, { signal } = {}) {
    const collector = createParseDiagnostics();
    const parsed = await parseCobblemonZip(sharedFile.file, { signal, allowRepair: sharedFile.allowRepairs ?? true, onDiagnostic: collector.record });
    const diagnostics = collector.snapshot();
    if (!parsed?.length && !diagnostics.total) return [];
    const report = {
      id: crypto.randomUUID(),
      name: sharedFile.name,
      sharedFileId: sharedFile.id,
      data: parsed,
      diagnostics,
      fromShared: true,
    };
    return [{ storeName: "spawnReports", hasWarnings: diagnostics.total > 0, merge: (current) => [report, ...current] }];
  },
};

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
  { key: "spawnType", label: "Type" },
  { key: "level", label: "Level" },
  { key: "weight", label: "Weight" },
  { key: "spawnablePositionType", label: "Position" },
  { key: "presets", label: "Presets" },
  { key: "biomes", label: "Biomes" },
  { key: "dimensions", label: "Dimensions" },
  { key: "structures", label: "Structures" },
  { key: "neededNearbyBlocks", label: "Nearby Blocks" },
  { key: "neededBaseBlocks", label: "Base Blocks" },
  { key: "labels", label: "Labels" },
  { key: "markers", label: "Markers" },
  { key: "isPokeSnack", label: "Poké Snack" },
  { key: "isLeader", label: "Herd leader" },
  { key: "isFollower", label: "Herd follower" },
  { key: "maxHerdSize", label: "Max herd" },
  { key: "herdLevelRange", label: "Herd levels" },
  { key: "memberMaxTimes", label: "Herd max times" },
  { key: "levelRangeOffset", label: "Level offset" },
  { key: "herdWeight", label: "Herd weight" },
  { key: "spawnId", label: "Spawn ID" },
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

const ESSENTIAL_COLUMN_KEYS = new Set([
  "pokemon", "bucket", "level", "weight", "spawnablePositionType", "biomes", "sourceFile",
]);

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
  if (key === "pokemon") return 200;
  if (key === "biomes" || key === "antiBiomes") return 320;
  if (key === "spawnablePositionType") return 110;
  if (key === "spawnType") return 120;
  if (key === "bucket") return 110;
  if (WIDE_COLUMN_KEYS.has(key)) return 260;
  return 120;
}

export default function SpawnScanner() {
  const [searchField, setSearchField] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [contextFilter, setContextFilter] = useState("all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [columnView, setColumnView] = useState(null);

  useEffect(() => {
    // Choose once after hydration; resizing never replaces an explicit selection.
    setColumnView((current) => current ?? (
      window.matchMedia("(max-width: 767px)").matches ? "essentials" : "all"
    ));
  }, []);

  // Biome tags map loaded from BiomeTags.md — resolves tag details.
  const [biomeTagsMap, setBiomeTagsMap] = useState({});
  const [biomeTagsLoaded, setBiomeTagsLoaded] = useState(false);

  const [biomeDetails, setBiomeDetails] = useState(null);
  const biomePanelId = useId();
  const biomeTitleId = useId();
  const biomeCloseRef = useRef(null);
  const searchInputRef = useRef(null);
  const scannerHeadingRef = useRef(null);

  const closeBiomeDetails = () => {
    setBiomeDetails(null);
    const target = biomeDetails?.trigger.isConnected
      ? biomeDetails.trigger
      : searchInputRef.current ?? scannerHeadingRef.current;
    target?.focus();
  };

  useEffect(() => {
    if (!biomeDetails) return;
    biomeCloseRef.current?.focus({ preventScroll: true });
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setBiomeDetails(null);
      const target = biomeDetails.trigger.isConnected
        ? biomeDetails.trigger
        : searchInputRef.current ?? scannerHeadingRef.current;
      target?.focus();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [biomeDetails]);

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

  const { data, loading, unavailableFiles, error } = useScannerLifecycle(SCANNER_CONFIG);
  const { spawnReports: fileReports } = data;
  const { addSharedFile } = useSharedFiles();

  usePreferences("spawnScanner", { column: "pokemon", direction: "asc" });

  useEffect(() => {
    document.title = "Spawn Scanner | CobbleToolkit";
  }, []);

  // Load + parse BiomeTags.md for biome details
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

  const pokemonEntryCount = useMemo(
    () => new Set(allSpawnData.map((row) => row.pokemon).filter((value) => value !== null && value !== undefined && value !== "")).size,
    [allSpawnData]
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
        (columnView === "all" || ESSENTIAL_COLUMN_KEYS.has(key)) &&
        filteredData.some((d) => {
          const value = d[key];
          return Array.isArray(value)
            ? value.length > 0
            : typeof value === "boolean"
            ? true
            : value !== null && value !== undefined && value !== "";
        })
      ),
    [filteredData, columnView]
  );

  // Show all tags. Row height is dynamic (DataTable measures each row), so
  // sparse rows stay compact and tag-heavy rows grow only as needed — no
  // fixed max-height clip and no "+N more" nesting.
  const renderTagList = (tokens, groupKey) => {
    if (!tokens.length) return null;

    return (
      <div className="flex min-w-0 flex-wrap content-start gap-1">
        {tokens.map((tok, i) => {
          const isTagVisual =
            tok.startsWith("#") || /^[a-zA-Z_\s]+$/.test(tok);
          const chipClass = [
            "max-w-full truncate whitespace-nowrap rounded px-1.5 py-0.5 text-xs leading-tight",
            isTagVisual
              ? "border border-accent/30 bg-accent-soft text-accent"
              : "bg-bg-surface-2 text-text-secondary",
          ].join(" ");

          if (!isTagVisual) {
            return (
              <span key={i} className={chipClass} title={tok}>
                {tok}
              </span>
            );
          }

          const entries = resolveBiomeTagEntries(tok);
          const content = { title: tok, entries };
          const triggerKey = JSON.stringify([groupKey, i]);
          return (
            <button
              key={i}
              type="button"
              title={tok}
              aria-haspopup="dialog"
              aria-expanded={biomeDetails?.triggerKey === triggerKey}
              aria-controls={biomePanelId}
              onClick={(event) => setBiomeDetails({ content, triggerKey, trigger: event.currentTarget })}
              className={`cursor-pointer text-left hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${chipClass}`}
            >
              {tok}
            </button>
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
            wrap: true,
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
                className="font-mono text-xs text-text-secondary leading-snug line-clamp-2 break-all"
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
                      className="rounded bg-bg-surface-2 px-1.5 py-0.5 text-xs text-text-secondary"
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
              return tokens.length ? renderTagList(tokens, [row._rowId, col.key]) : null;
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
                ? renderTagList(value.map((v) => String(v)), [row._rowId, col.key])
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
    [visibleColumnDefs, biomeDetails, biomeTagsMap, biomePanelId]
  );

  const clearSearch = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSearchField("all");
  };

  const resetFilters = () => {
    clearSearch();
    setContextFilter("all");
  };
  const activeFilters = [
    searchTerm ? `Search: “${searchTerm}”` : null,
    searchField !== "all" ? `Field: ${SEARCH_FIELDS.find((field) => field.value === searchField)?.label}` : null,
    contextFilter !== "all" ? `Position: ${contextFilter}` : null,
  ].filter(Boolean);
  const hasData = fileReports.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <header className="dex-console">
        <div className="dex-screen p-3 sm:p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-text-secondary">
          <span className="uppercase tracking-widest">Spawn data</span>
          <span role="status">{loading ? "Scanning archives…" : error ? "Scanner needs attention" : hasData ? "Scan ready" : "Awaiting datapack"}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-soft text-accent">
            <Radar size={16} />
          </div>
          <h1 ref={scannerHeadingRef} tabIndex={-1} data-route-title className="text-xl font-semibold text-text-primary">
            Spawn Scanner
          </h1>
        </div>
        <p className="mt-1 text-sm text-text-secondary">
          Find spawns, compare weights, and check conditions in your datapack.
        </p>
        <dl aria-label="Dataset overview" className="mt-3 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-2 text-text-primary">
          <div className="flex items-baseline gap-2"><dd className="font-mono font-semibold">{allSpawnData.length.toLocaleString()}</dd><dt className="text-xs">Spawn entries</dt></div>
          <div className="flex items-baseline gap-2" title="Distinct raw Pokémon values; forms and properties are not normalized into species."><dd className="font-mono font-semibold">{pokemonEntryCount.toLocaleString()}</dd><dt className="text-xs">Pokémon entries</dt></div>
          <div className="flex items-baseline gap-2"><dd className="font-mono font-semibold">{fileReports.filter((report) => !report.error).length.toLocaleString()}</dd><dt className="text-xs">Sources</dt></div>
        </dl>
        </div>
        <details className="mt-3 rounded-lg border border-border bg-bg-surface p-3 text-sm text-text-secondary">
          <summary className="w-fit cursor-pointer hover:text-text-primary">About biome tags</summary>
          <p className="mt-1 max-w-2xl leading-relaxed">
          Biome tags like{" "}
          <code className="font-mono text-accent">#cobblemon:is_arid</code>{" "}
          can be opened to see their biomes. See the{" "}
          <a
            href="https://gitlab.com/cable-mc/cobblemon/-/blob/main/docs/cobblemon-tags/1.6.1/BiomeTags.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Cobblemon 1.6.1 biome tag reference
          </a>
          .
          </p>
        </details>
      </header>
      <ScannerErrorNotice error={error} />
      <ArchiveAvailabilityNotice files={unavailableFiles} />
      <SpawnParseDiagnostics reports={fileReports} />

      {!hasData && !loading && (
        <EmptyState
          icon={Radar}
          title={unavailableFiles.length ? "Upload an archive again to scan here" : "No datapack loaded yet"}
          description="Upload a Cobblemon datapack to read its spawn_pool_world/ folder."
          action={
            <FileDropzone
              accept=".zip,.jar"
              multiple
              onFiles={handleDroppedFiles}
              label="Drop your datapack here"
              hint="ZIP or JAR. Files stay in your browser."
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
            <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
              <span>Pokémon entries include distinct forms and properties.</span>
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

          <section aria-label="Spawn filters" className="flex flex-col gap-3 rounded-lg border border-accent/30 bg-bg-surface p-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-text-primary">Refine spawns</h2>
                <Button variant="secondary" onClick={resetFilters}>Reset filters</Button>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1">
                  <label htmlFor="spawn-search" className="mb-1 block text-sm font-medium text-text-primary">Search spawn data</label>
                  <div className="relative">
                  <Search
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    id="spawn-search"
                                        ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search spawn data"
                    placeholder="Search Pokémon, biome, or condition…"
                    className="min-h-11 w-full rounded-md border border-border bg-bg-surface-2 py-2 pl-9 pr-12 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      aria-label="Clear search"
                      className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-text-muted hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      <X size={14} />
                    </button>
                  )}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  icon={SlidersHorizontal}
                  onClick={() => setShowAdvanced((v) => !v)}
                  aria-expanded={showAdvanced}
                  aria-controls="spawn-advanced-filters"
                >
                  Filters
                </Button>
              </div>

              <p className="min-w-0 wrap-anywhere text-sm text-text-secondary">
                <span className="font-medium text-text-primary">Active filters: </span>
                {activeFilters.length ? activeFilters.join(" · ") : "None"}
              </p>
              {showAdvanced && (
                <div id="spawn-advanced-filters" className="grid gap-3 rounded-md bg-bg-surface-2 p-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="spawn-search-field" className="mb-1 block text-sm font-medium text-text-primary">
                      Search field
                    </label>
                    <select
                      id="spawn-search-field"
                      value={searchField}
                      onChange={(e) => setSearchField(e.target.value)}
                      className="w-full rounded-md border border-border bg-bg-surface p-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                    >
                      {SEARCH_FIELDS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="spawn-position-type" className="mb-1 block text-sm font-medium text-text-primary">
                      Position type
                    </label>
                    <select
                      id="spawn-position-type"
                      value={contextFilter}
                      onChange={(e) => setContextFilter(e.target.value)}
                      className="w-full rounded-md border border-border bg-bg-surface p-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                    >
                      <option value="all">All position types</option>
                      {availableContexts.map((ctx) => (
                        <option key={ctx} value={ctx}>
                          {ctx.charAt(0).toUpperCase() + ctx.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>
              )}
            </section>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Spawn results</h2>
              <p role="status" aria-live="polite" aria-atomic="true" className="text-xs text-text-secondary">
                {filteredData.length.toLocaleString()} of {allSpawnData.length.toLocaleString()} spawn entries
              </p>
            </div>
            <div>
              <label htmlFor="spawn-column-view" className="mb-1 block text-sm font-medium text-text-primary">Column view</label>
              <select id="spawn-column-view" value={columnView ?? "all"} onChange={(event) => setColumnView(event.target.value)} aria-describedby="spawn-column-help" className="rounded-md border border-border bg-bg-surface p-2 text-sm text-text-primary focus:border-accent focus:outline-none">
                <option value="all">All fields</option>
                <option value="essentials">Essentials</option>
              </select>
            </div>
          </div>
          <p id="spawn-column-help" className="text-sm leading-relaxed text-text-secondary">
            Column view only changes visible columns. Search still uses all fields or your selected search field. Scroll horizontally to explore more columns.
          </p>
          {allSpawnData.length === 0 ? (
            <EmptyState
              icon={Radar}
              title="No spawn entries in this dataset"
              description="No spawn entries found. Check diagnostics or upload a datapack with a spawn_pool_world/ folder."
              action={<FileDropzone accept=".zip,.jar" multiple onFiles={handleDroppedFiles} label="Drop another datapack here" hint="ZIP or JAR. Files stay in your browser." className="w-full max-w-md" />}
            />
          ) : filteredData.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No matching spawns"
              description="Reset filters to see all spawn entries."
              action={<Button variant="secondary" onClick={resetFilters}>Show all spawns</Button>}
            />
          ) : (
            <DataTable
              rows={filteredData}
              columns={columns}
              getRowKey={(row) => row._rowId}
              virtualized
              rowHeight={48}
              maxHeight="clamp(20rem, calc(100dvh - 20rem), 70rem)"
            />
          )}
        </div>
      )}

      {biomeDetails && (
        <div
          id={biomePanelId}
          role="dialog"
          aria-labelledby={biomeTitleId}
          className="fixed bottom-2 right-2 z-50 flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-md flex-col rounded-lg border border-border bg-bg-base text-sm text-text-primary"
        >
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border p-3">
            <h2 id={biomeTitleId} className="min-w-0 max-h-[25dvh] overflow-y-auto wrap-anywhere font-semibold">
              {biomeDetails.content.title}
            </h2>
            <button
              ref={biomeCloseRef}
              type="button"
              onClick={closeBiomeDetails}
              aria-label="Close biome details"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-text-secondary hover:bg-bg-surface-2 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <div tabIndex={0} aria-label="Biome entries" className="min-h-0 overflow-y-auto px-3 py-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent">
            {biomeDetails.content.entries.length > 0 ? (
              <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {biomeDetails.content.entries.map((entry, index) => (
                  <li key={index} className="min-w-0 wrap-anywhere leading-5 text-text-secondary">
                    {entry}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-text-secondary">No entries found for this tag</p>
            )}
          </div>
          <p className="shrink-0 border-t border-border px-3 py-2 text-xs text-text-secondary">
            Close or press Escape to return to the biome tag.
          </p>
        </div>
      )}
    </div>
  );
}
