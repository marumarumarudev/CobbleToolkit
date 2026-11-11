"use client";

import ScannerErrorNotice from "@/components/ScannerErrorNotice";
import SpawnParseDiagnostics from "@/components/SpawnParseDiagnostics";
import { createParseDiagnostics } from "@/utils/parseDiagnostics";
import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import toast from "react-hot-toast";
import {
  Search,
  X,
  Users,
  Swords,
  PackageSearch,
  Info,
  AlertTriangle,
  Sparkles,
  ImageOff,
  ChevronRight,
} from "lucide-react";

import { useSharedFiles } from "@/contexts/SharedFilesContext";
import { useScannerLifecycle } from "@/hooks/useScannerLifecycle";
import ArchiveAvailabilityNotice from "@/components/ArchiveAvailabilityNotice";
import { parseRctTrainersFromZip } from "@/utils/rctTrainerParser";
import { formatPokemonName, matchesSearch } from "@/utils/nameUtils";
import { withBasePath } from "@/utils/basePath";

import {
  Card,
  CardBody,
  Badge,
  Tabs,
  FileDropzone,
  EmptyState,
  Spinner,
} from "@/components/ui";
import StorageInfo from "@/components/StorageInfo";

const SCANNER_NAME = "rctTrainerScanner";

const SCANNER_CONFIG = {
  scannerName: SCANNER_NAME,
  storeNames: ["trainerReports"],
  async parse(sharedFile, { signal } = {}) {
    const collector = createParseDiagnostics();
    const options = { signal, allowRepair: sharedFile.allowRepairs ?? true, onDiagnostic: collector.record };
    const parsed = await parseRctTrainersFromZip(sharedFile.file, options);
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
    return [{ storeName: "trainerReports", hasWarnings: diagnostics.total > 0, merge: (current) => [report, ...current] }];
  },
};

// Showdown gen5 ids: base is toID (mrmime, hooh), forms append with "-"
// (mrmime-galar, tauros-paldeablaze, pinsir-mega). Aspects from RCT data
// are mapped into those suffixes; unknown aspects fall back to base art.
const ASPECT_TO_SHOWDOWN_SUFFIX = {
  hisuian: "hisui",
  hisui: "hisui",
  "hisui-bias": "", // cobblemon tag → fall back to base (non-hisui) art
  bias: "",
  galarian: "galar",
  galar: "galar",
  alolan: "alola",
  alola: "alola",
  // Paldean Tauros breeds — Showdown merges region+breed: paldeablaze
  "paldean-blaze": "paldeablaze",
  "paldea-blaze": "paldeablaze",
  paldeablaze: "paldeablaze",
  blaze: "paldeablaze",
  "blaze-breed": "paldeablaze",
  "paldean-aqua": "paldeaaqua",
  "paldea-aqua": "paldeaaqua",
  paldeaaqua: "paldeaaqua",
  aqua: "paldeaaqua",
  "aqua-breed": "paldeaaqua",
  "paldean-combat": "paldeacombat",
  "paldea-combat": "paldeacombat",
  paldeacombat: "paldeacombat",
  combat: "paldeacombat",
  "combat-breed": "paldeacombat",
  paldean: "paldea",
  paldea: "paldea",
  mega: "mega",
  "mega-x": "megax",
  megax: "megax",
  "mega-y": "megay",
  megay: "megay",
  gmax: "gmax",
  gigantamax: "gmax",
  primal: "primal",
  // Flower colors / furfrou / sizes / hoopa / zygarde
  blue: "blue",
  orange: "orange",
  white: "white",
  yellow: "yellow",
  red: "", // default flabebe art
  eternal: "eternal",
  dandy: "dandy",
  debutante: "debutante",
  diamond: "diamond",
  heart: "heart",
  kabuki: "kabuki",
  "la-reine": "lareine",
  lareine: "lareine",
  matron: "matron",
  pharaoh: "pharaoh",
  star: "star",
  // Pumpkaboo / Gourgeist sizes → base gen5 art
  small: "",
  large: "",
  super: "",
  average: "",
  medium: "",
  "small-size": "",
  "large-size": "",
  "super-size": "",
  unbound: "unbound",
  "10": "10",
  "10%": "10",
  "10-c": "10",
  "10%-c": "10",
  "10-percent": "10",
  complete: "complete",
  "100%": "complete",
  "100": "complete",
  "50%": "",
  "50%-c": "",
  "50-c": "",
  "50": "",
  powerconstruct: "",
  bloodmoon: "bloodmoon",
  origin: "origin",
  therian: "therian",
  "rapid-strike": "rapidstrike",
  rapidstrike: "rapidstrike",
  "low-key": "lowkey",
  lowkey: "lowkey",
};

function showdownSlug(mon) {
  // Parse form off the species string first so "growlithe-hisui" does not
  // collapse to "growlithehisui".
  let raw = String(mon.species || "")
    .toLowerCase()
    .replace(/['’.]/g, "")
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const nameRules = [
    { re: /-(?:mega-?x|megax)$/, form: "megax" },
    { re: /-(?:mega-?y|megay)$/, form: "megay" },
    { re: /-mega$/, form: "mega" },
    { re: /-(?:gigantamax|gmax)$/, form: "gmax" },
    { re: /-(?:alolan|alola)$/, form: "alola" },
    { re: /-(?:galarian|galar)$/, form: "galar" },
    { re: /-(?:hisuian|hisui)-bias$/, form: "" },
    { re: /-(?:hisuian|hisui)$/, form: "hisui" },
    { re: /-paldea-blaze$/, form: "paldeablaze" },
    { re: /-paldea-aqua$/, form: "paldeaaqua" },
    { re: /-paldea-combat$/, form: "paldeacombat" },
    { re: /-paldea$/, form: "paldea" },
    { re: /-unbound$/, form: "unbound" },
    { re: /-(?:10%-?c|10-c)$/, form: "10" },
    { re: /-(?:10%?)$/, form: "10" },
    { re: /-(?:complete|100%?)$/, form: "complete" },
    { re: /-(?:50%-?c|50-c|50%?|power-?construct)$/, form: "" },
    { re: /-(?:small|large|super|average|medium)(?:-size)?$/, form: "" },
  ];

  let formFromName;
  for (const rule of nameRules) {
    if (rule.re.test(raw)) {
      formFromName = rule.form;
      raw = raw.replace(rule.re, "");
      break;
    }
  }
  const base = raw.replace(/[^a-z0-9]/g, "");

  const aspects = (mon.aspects || []).map((a) => String(a).toLowerCase());
  let formFromAspect;
  for (const a of aspects) {
    if (Object.prototype.hasOwnProperty.call(ASPECT_TO_SHOWDOWN_SUFFIX, a)) {
      formFromAspect = ASPECT_TO_SHOWDOWN_SUFFIX[a];
      break;
    }
  }
  if (formFromAspect === undefined && aspects.includes("paldean")) {
    if (aspects.some((a) => a.includes("blaze"))) formFromAspect = "paldeablaze";
    else if (aspects.some((a) => a.includes("aqua"))) formFromAspect = "paldeaaqua";
    else if (aspects.some((a) => a.includes("combat"))) formFromAspect = "paldeacombat";
    else formFromAspect = "paldea";
  }
  // Explicit bias aspect → force non-regional base art
  if (aspects.some((a) => a.includes("bias"))) {
    formFromAspect = "";
    formFromName = "";
  }

  const form =
    formFromAspect !== undefined && formFromAspect !== ""
      ? formFromAspect
      : formFromAspect === ""
        ? ""
        : formFromName || "";

  if (!base) return form || "";
  return form ? `${base}-${form}` : base;
}

// Local-first sprites (public/sprites/gen5/), then Showdown CDN.
// Credit: Pokémon Showdown — https://play.pokemonshowdown.com
function PokemonSprite({ mon, size = 56 }) {
  const slug = showdownSlug(mon);
  const baseOnly = slug.includes("-") ? slug.split("-")[0] : null;
  const sources = useMemo(() => {
    const local = (s, shiny) =>
      withBasePath(`/sprites/gen5${shiny ? "-shiny" : ""}/${s}.png`);
    const cdn = (s, shiny) =>
      `https://play.pokemonshowdown.com/sprites/gen5${shiny ? "-shiny" : ""}/${s}.png`;
    const dex = (s) =>
      `https://play.pokemonshowdown.com/sprites/dex/${s}.png`;

    const list = [];
    if (mon.shiny) {
      list.push(local(slug, true), cdn(slug, true));
    }
    list.push(local(slug, false), cdn(slug, false), dex(slug));
    if (baseOnly) {
      if (mon.shiny) {
        list.push(local(baseOnly, true), cdn(baseOnly, true));
      }
      list.push(local(baseOnly, false), cdn(baseOnly, false), dex(baseOnly));
    }
    return list.filter(Boolean);
  }, [mon.shiny, slug, baseOnly]);

  const [sourceIndex, setSourceIndex] = useState(0);

  // Reset when mon changes — a prior 404 must not stick
  useEffect(() => {
    setSourceIndex(0);
  }, [slug, mon.shiny]);

  const src = sources[sourceIndex];

  if (!src) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-md border border-border bg-bg-surface-2 text-text-muted"
        style={{ width: size, height: size }}
      >
        <ImageOff size={18} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={src}
      src={src}
      alt={mon.species}
      width={size}
      height={size}
      onError={() => setSourceIndex((i) => i + 1)}
      className="shrink-0 rounded-md border border-border bg-bg-surface-2"
      style={{ imageRendering: "pixelated" }}
      title={`${mon.species} → ${slug}`}
    />
  );
}

const EV_STAT_ORDER = ["hp", "atk", "def", "spa", "spd", "spe"];
const EV_STAT_LABELS = {
  hp: "HP",
  atk: "Atk",
  def: "Def",
  spa: "SpA",
  spd: "SpD",
  spe: "Spe",
};
// Same six-color EV palette used across the toolkit — chosen for enough
// separation from each other and the accent gold, at a lightness that
// still passes contrast against bg-surface-2.
const EV_STAT_COLORS = {
  hp: "#f87171",
  atk: "#fb923c",
  def: "#facc15",
  spa: "#60a5fa",
  spd: "#4ade80",
  spe: "#f472b6",
};
const GENDER_COLORS = {
  male: "#60a5fa",
  female: "#f472b6",
};

function formatCondition(cond) {
  if (!cond || typeof cond !== "object") return String(cond);
  if (cond.condition === "rctmod:defeat_count") {
    return `Defeat count ${cond.comparator ?? "=="} ${cond.count}`;
  }
  if (cond.condition === "rctmod:level_range") {
    const { min, max } = cond.range || {};
    return `Level ${min ?? "?"}–${max ?? "?"}`;
  }
  return cond.condition || JSON.stringify(cond);
}

function formatRolls(rolls) {
  if (!rolls) return "1";
  return rolls.min === rolls.max ? String(rolls.min) : `${rolls.min}–${rolls.max}`;
}

// Adaptive precision: sub-1% chances (common for deeply nested loot) need a
// decimal place or two to not all read as "0%"; anything bigger reads fine
// rounded to one decimal.
function formatChancePercent(pct) {
  if (pct == null || Number.isNaN(pct)) return null;
  return pct < 1 ? `${pct.toFixed(2)}%` : `${pct.toFixed(1)}%`;
}

function formatSetCount(setCount) {
  if (!setCount) return null;
  return setCount.min === setCount.max
    ? `×${setCount.min}`
    : `×${setCount.min}–${setCount.max}`;
}

export default function TrainerScanner() {
  const { data, loading, unavailableFiles, error } = useScannerLifecycle(SCANNER_CONFIG);
  const { trainerReports: fileReports } = data;
  const { addSharedFile } = useSharedFiles();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState("team");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [lootFilter, setLootFilter] = useState("all");
  const sourceRegistry = useRef({ order: new Map(), anonymous: new WeakMap() });

  useEffect(() => {
    document.title = "RCT Trainer Scanner | CobbleToolkit";
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const handleDroppedFiles = async (fileList) => {
    const valid = Array.from(fileList).filter((f) =>
      f.name.toLowerCase().match(/\.(zip|jar)$/)
    );
    if (!valid.length) {
      toast.error("Only .zip or .jar files are supported.");
      return;
    }
    for (const file of valid) await addSharedFile(file);
  };

  const sources = useMemo(() => {
    const { order, anonymous } = sourceRegistry.current;
    return fileReports.filter((report) => !report.error).map((report) => {
      let key;
      if (report.id != null) key = `report:${report.id}`;
      else if (report.sharedFileId != null) key = `shared:${report.sharedFileId}`;
      else {
        // Legacy reports without IDs retain identity while other packs are added.
        if (!anonymous.has(report)) anonymous.set(report, `anonymous:${order.size}`);
        key = anonymous.get(report);
      }
      if (!order.has(key)) order.set(key, order.size);
      return { key, name: report.name || "Unnamed pack", report };
    }).sort((a, b) => order.get(a.key) - order.get(b.key));
  }, [fileReports]);

  useEffect(() => {
    if (sourceFilter !== "all" && !sources.some((source) => source.key === sourceFilter)) {
      setSourceFilter("all");
    }
  }, [sources, sourceFilter]);

  const allTrainers = useMemo(
    () => sources.flatMap(({ key, name, report }) => report.data.map((trainer, index) => ({
      ...trainer,
      _trainerKey: JSON.stringify([key, index]),
      _sourceKey: key,
      _sourceName: name,
    }))),
    [sources]
  );

  // Precompute a search haystack per trainer so filtering doesn't re-walk
  // nested team/loot arrays on every keystroke.
  const searchable = useMemo(
    () =>
      allTrainers.map((t) => ({
        trainer: t,
        haystack: [
          t.name,
          t.id,
          ...t.team.map((p) => p.species),
          ...t.loot.items.filter((i) => !i.empty).map((i) => i.item),
        ],
      })),
    [allTrainers]
  );

  const filtered = useMemo(() => {
    return searchable
      .filter(({ trainer, haystack }) =>
        (sourceFilter === "all" || trainer._sourceKey === sourceFilter) &&
        (lootFilter === "all" ||
          (lootFilter === "linked" && trainer.loot.linkStatus !== "none") ||
          (lootFilter === "none" && trainer.loot.linkStatus === "none") ||
          (lootFilter === "issues" && trainer.loot.issues.length > 0)) &&
        (!debouncedSearch || haystack.some((v) => matchesSearch(debouncedSearch, v)))
      )
      .map((s) => s.trainer);
  }, [searchable, debouncedSearch, sourceFilter, lootFilter]);

  const selected = useMemo(
    () => filtered.find((t) => t._trainerKey === selectedId) ?? filtered[0] ?? null,
    [filtered, selectedId]
  );

  useEffect(() => {
    setSelectedId(selected?._trainerKey ?? null);
  }, [selected]);

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSourceFilter("all");
    setLootFilter("all");
  };

  const hasData = allTrainers.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <header className="dex-console">
        <div className="dex-screen p-3 sm:p-4">
        <div className="mb-2 flex flex-wrap justify-between gap-2 font-mono text-xs text-accent">
          <span className="uppercase tracking-widest">Trainer data</span>
          <span>{loading ? "Indexing archives…" : error ? "Scanner needs attention" : hasData ? "Archive ready" : "Awaiting datapack"}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-soft text-accent">
            <Swords size={16} />
          </div>
          <h1 className="text-xl font-semibold text-text-primary">
            RCT Trainer Scanner
          </h1>
        </div>
        <p className="mt-1 text-sm text-text-secondary">
          Browse Cobbleverse RCT teams, AI, and loot tables, including nested pools.
        </p>
        <p className="mt-3 border-t border-border pt-2 font-mono text-xs text-text-secondary">
          {allTrainers.length} trainers · {sources.length} source packs · {allTrainers.filter((t) => t.loot.linkStatus !== "none").length} with linked loot
        </p>
        </div>
      </header>
      <ScannerErrorNotice error={error} />
      <SpawnParseDiagnostics reports={fileReports} />
      <ArchiveAvailabilityNotice files={unavailableFiles} />

      {!hasData && !loading && (
        <EmptyState
          icon={Swords}
          title={unavailableFiles.length ? "Upload an archive again to scan here" : "No datapack loaded yet"}
          description="Upload an RCT datapack to read data/<namespace>/trainers/ and loot_table/ for trainer, group, and generic loot."
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
              Parsing datapack and resolving loot tables…
            </span>
          </CardBody>
        </Card>
      )}

      {hasData && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span>{allTrainers.length} trainers</span>
              <span className="text-border">•</span>
              <span>
                {allTrainers.filter((t) => t.loot.linkStatus !== "none").length}{" "}
                with linked loot
              </span>
              {loading && (
                <span className="flex items-center gap-1.5 text-accent">
                  <Spinner size={12} /> Parsing more files…
                </span>
              )}
            </div>
            <StorageInfo />
          </div>

          {/*
            Stable split: left column keeps a fixed basis and won't shrink when
            the right detail panel grows. minmax(0,1fr) lets the right side wrap
            instead of crushing the trainer list.
          */}
          <div className="grid gap-4 lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
            {/* Trainer list */}
            <Card className="flex min-w-0 flex-col overflow-hidden lg:sticky lg:top-36 lg:max-h-[calc(100dvh-10rem)]">
              <div className="space-y-3 border-b border-border bg-bg-surface-2/50 p-4">
                <h2 className="font-mono text-xs uppercase tracking-widest text-accent">Trainer roster</h2>
                <div className="relative">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search trainer, species, or loot item"
                    placeholder="Search trainer, species, or loot item…"
                    className="w-full rounded-md border border-border bg-bg-surface-2 py-1.5 pl-8 pr-7 text-xs text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                  />
                  {search && (
                    <button
                      onClick={() => { setSearch(""); setDebouncedSearch(""); }}
                      aria-label="Clear trainer search"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                <label className="block text-xs text-text-secondary">
                  Source pack
                  <select
                    aria-label="Trainer source pack"
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-bg-surface-2 p-2 text-xs text-text-primary"
                  >
                    <option value="all">All source packs</option>
                    {sources.map((source) => <option key={source.key} value={source.key}>{source.name}</option>)}
                  </select>
                </label>
                <label className="block text-xs text-text-secondary">
                  Loot status
                  <select
                    aria-label="Trainer loot status"
                    value={lootFilter}
                    onChange={(e) => setLootFilter(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-bg-surface-2 p-2 text-xs text-text-primary"
                  >
                    <option value="all">All loot statuses</option>
                    <option value="linked">Linked loot</option>
                    <option value="none">No linked loot</option>
                    <option value="issues">Loot issues</option>
                  </select>
                </label>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span role="status" className="text-text-muted">{filtered.length} of {allTrainers.length} trainers</span>
                  <button type="button" onClick={resetFilters} className="text-accent hover:underline">Reset trainer filters</button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto max-h-[50vh] lg:max-h-none">
                {filtered.length === 0 ? (
                  <p className="px-3 py-6 text-center text-xs text-text-muted">
                    No matching trainers
                  </p>
                ) : (
                  filtered.map((t) => {
                    const key = t._trainerKey;
                    return (
                      <button
                        key={key}
                        aria-pressed={key === selected?._trainerKey}
                        onClick={() => {
                          setSelectedId(key);
                          setActiveTab("team");
                        }}
                        className={[
                          "flex w-full items-center justify-between gap-2 border-b border-border px-3 py-2.5 text-left transition-colors duration-100",
                          key === selected?._trainerKey
                            ? "bg-accent-soft"
                            : "hover:bg-bg-surface-2",
                        ].join(" ")}
                      >
                        <span className="min-w-0">
                          <span
                            className={[
                              "block break-words text-sm font-semibold leading-snug",
                              key === selected?._trainerKey
                                ? "text-accent"
                                : "text-text-primary",
                            ].join(" ")}
                          >
                            {t.name}
                          </span>
                          <span className="block truncate text-xs text-text-secondary" title={t._sourceName}>
                            {t._sourceName}
                          </span>
                          <span className="block break-all font-mono text-xs text-text-secondary">
                            {t.namespace}:{t.id}
                          </span>
                          <span className="block truncate text-xs text-text-muted">
                            {t.teamSize} mon{t.teamSize === 1 ? "" : "s"} · avg
                            Lv {t.averageLevel}
                          </span>
                        </span>
                        {t.loot.linkStatus === "none" ? (
                          <span
                            title="No loot table matched"
                            className="h-1.5 w-1.5 shrink-0 rounded-full bg-text-muted"
                          />
                        ) : (
                          <span
                            title={`Loot: ${t.loot.linkStatus}`}
                            className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                          />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Detail panel */}
            <div className="flex min-w-0 flex-col gap-3">
              {!selected ? (
                <EmptyState
                  icon={Search}
                  title="No matching trainers"
                  description="Change or reset filters to view a trainer."
                />
              ) : (
                <>
                  <div className="rounded-xl border border-border bg-bg-surface p-2">
                  <div className="dex-screen flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-accent">Selected trainer</p>
                      <h2 className="break-words text-lg font-semibold text-text-primary">
                        {selected.name}
                      </h2>
                      <p className="break-all font-mono text-sm text-text-muted">
                        {selected.namespace}:{selected.id}
                      </p>
                      <h3 className="mt-2 break-words text-xs font-medium text-text-secondary">Source pack: {selected._sourceName}</h3>
                      <dl className="mt-3 flex gap-6 text-xs">
                        <div><dt className="text-text-muted">Team size</dt><dd className="font-mono font-semibold text-text-primary">{selected.teamSize}</dd></div>
                        <div><dt className="text-text-muted">Avg level</dt><dd className="font-mono font-semibold text-text-primary">{selected.averageLevel}</dd></div>
                      </dl>
                    </div>
                    <Tabs
                      ariaLabel="Trainer detail view"
                      tabs={[
                        {
                          id: "team",
                          label: "Team",
                          icon: Users,
                          count: selected.teamSize,
                        },
                        {
                          id: "loot",
                          label: "Loot",
                          icon: PackageSearch,
                          count: selected.loot.items.filter((i) => !i.empty)
                            .length,
                        },
                        { id: "meta", label: "Meta", icon: Info },
                      ]}
                      active={activeTab}
                      onChange={setActiveTab}
                    />
                  </div>

                  </div>
                  {activeTab === "team" && <TeamPanel key={selected._trainerKey} trainer={selected} />}
                  {activeTab === "loot" && <LootPanel key={selected._trainerKey} trainer={selected} />}
                  {activeTab === "meta" && <MetaPanel key={selected._trainerKey} trainer={selected} />}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamPanel({ trainer }) {
  if (trainer.team.length === 0) {
    return (
      <EmptyState icon={Users} title="No team data" description="This trainer has an empty team array." />
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {trainer.team.map((mon) => {
        const evEntries = EV_STAT_ORDER
          .map((stat) => ({ stat, value: mon.evs?.[stat] ?? 0 }))
          .filter((e) => e.value > 0);

        return (
          <Card key={mon.index} className="min-w-0 border-t-2 border-t-accent/40">
            <CardBody className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <PokemonSprite mon={mon} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <p className="break-words text-base font-semibold capitalize text-text-primary">
                      {formatPokemonName(mon.species)}
                    </p>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {mon.shiny && <Badge tone="accent">Shiny</Badge>}
                      <Badge tone="neutral">Lv {mon.level}</Badge>
                    </div>
                  </div>
                  <p
                    className="mt-0.5 text-xs font-medium capitalize"
                    style={{
                      color:
                        GENDER_COLORS[mon.gender?.toLowerCase()] ||
                        "var(--color-text-muted)",
                    }}
                  >
                    {mon.gender?.toLowerCase()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm leading-relaxed [&>div]:min-w-0 [&>div]:break-words">
                <div>
                  <p className="text-text-muted">Nature</p>
                  <p className="capitalize text-text-primary">{mon.nature}</p>
                </div>
                <div>
                  <p className="text-text-muted">Ability</p>
                  <p className="capitalize text-text-primary">
                    {mon.ability ? mon.ability.replace(/_/g, " ") : "—"}
                  </p>
                </div>
              </div>

              {evEntries.length > 0 && (
                <div>
                  <p className="mb-1 text-xs text-text-muted">EVs</p>
                  <div className="flex flex-wrap gap-1">
                    {evEntries.map(({ stat, value }) => (
                      <span
                        key={stat}
                        className="rounded bg-bg-surface-2 px-1.5 py-0.5 text-sm font-mono font-semibold"
                        style={{ color: EV_STAT_COLORS[stat] }}
                      >
                        {value} {EV_STAT_LABELS[stat]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {mon.moveset.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Moves</p>
                  <div className="flex flex-wrap gap-1">
                    {mon.moveset.map((mv) => (
                      <span
                        key={mv}
                        className="rounded-md border border-border bg-bg-surface-2 px-2.5 py-1 text-sm capitalize leading-relaxed text-text-primary"
                      >
                        {mv.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {mon.heldItem?.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">Held item</p>
                  <p className="text-sm capitalize text-text-primary">
                    {mon.heldItem.map((h) => h.replace(/_/g, " ")).join(", ")}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}

function LootPanel({ trainer }) {
  const { loot } = trainer;
  const [lootSearch, setLootSearch] = useState("");
  const [debouncedLootSearch, setDebouncedLootSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState(() => new Set());
  // Tracks only the groups that were opened *by search*, as opposed to a
  // manual header click — so clearing the search can collapse them back
  // without touching anything the person opened themselves.
  const [autoExpandedGroups, setAutoExpandedGroups] = useState(
    () => new Set()
  );

  useEffect(() => {
    const t = setTimeout(() => setDebouncedLootSearch(lootSearch), 200);
    return () => clearTimeout(t);
  }, [lootSearch]);

  // Reset the loot search and collapse every group whenever the selected
  // trainer changes, so state from a previous trainer never leaks in here.
  useEffect(() => {
    setLootSearch("");
    setExpandedGroups(new Set());
    setAutoExpandedGroups(new Set());
  }, [trainer.id]);

  const items = loot.items.filter((i) => !i.empty);
  const issueCount = loot.issues.length;

  const filteredItems = debouncedLootSearch
    ? items.filter((it) => matchesSearch(debouncedLootSearch, it.item))
    : items;

  const rows = filteredItems.map((it, i) => ({
    id: `${it.item}-${i}`,
    item: it.item,
    weight: it.weight,
    theoreticalWeight: it.theoreticalWeight,
    poolTotalWeight: it.poolTotalWeight,
    chancePercent: it.chancePercent,
    rolls: formatRolls(it.rolls),
    setCount: formatSetCount(it.setCount),
    conditions: it.conditions,
    direct: it.direct,
    sourcePath: it.sourcePath,
  }));

  // Group into "Direct drops" (from the trainer's own root table) plus one
  // group per distinct nested loot-table path. Built off the (possibly
  // search-filtered) rows, so a group with zero remaining matches during a
  // search simply disappears from the list.
  const groups = buildLootGroups(rows);

  // While a search is active, expand every group that still has matches
  // (tracking which ones we opened automatically). Once the search is
  // cleared, collapse back only those auto-opened groups — anything the
  // person expanded/collapsed by hand keeps whatever state they left it
  // in. Kept above the "no loot table" early return so hook order never
  // varies between renders.
  const groupKeysSignature = groups.map((g) => g.key).join("|");
  useEffect(() => {
    if (debouncedLootSearch) {
      const matchKeys = groups.map((g) => g.key);
      setExpandedGroups((prev) => {
        const next = new Set(prev);
        let changed = false;
        for (const key of matchKeys) {
          if (!next.has(key)) {
            next.add(key);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
      setAutoExpandedGroups((prev) => {
        const next = new Set(prev);
        let changed = false;
        for (const key of matchKeys) {
          if (!next.has(key)) {
            next.add(key);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    } else if (autoExpandedGroups.size > 0) {
      const toCollapse = autoExpandedGroups;
      setExpandedGroups((prevExpanded) => {
        const next = new Set(prevExpanded);
        for (const key of toCollapse) next.delete(key);
        return next;
      });
      setAutoExpandedGroups(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedLootSearch, groupKeysSignature]);

  if (loot.linkStatus === "none") {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No loot table matched"
        description="No trainers/single or trainers/groups loot table filename matches this trainer. It may have no loot in this pack."
      />
    );
  }

  // Manual toggles always take priority — untrack the group from "auto"
  // so a later search-clear won't yank it closed/open out from under a
  // person who just clicked it themselves.
  const toggleGroup = (key) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setAutoExpandedGroups((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
        <Badge tone={loot.linkStatus === "single" ? "accent" : "info"}>
          {loot.linkStatus === "single"
            ? "Direct trainer loot table"
            : `Group loot: ${trainer.loot.groupMatch}`}
        </Badge>
        <span className="min-w-0 break-all font-mono text-xs text-text-secondary">{loot.rootTableId}</span>
        <span className="rounded-md border border-border bg-bg-surface px-2.5 py-1 text-text-primary">{items.length} reward entries</span>
      </div>

      {issueCount > 0 && (
        <div className="flex flex-col gap-1 rounded-md border border-warning/30 bg-warning-soft p-2.5">
          {loot.issues.slice(0, 5).map((issue, i) => (
            <p key={i} className="flex flex-wrap items-start gap-1.5 text-sm text-warning">
              <AlertTriangle size={12} className="mt-0.5 shrink-0" />
              {issue.type === "missing"
                ? `Referenced loot table not found: ${issue.id}`
                : issue.type === "cycle"
                ? `Cycle detected. Table references itself: ${issue.id}`
                : `Resolution depth limit hit at: ${issue.id}`}
              <span className="text-text-muted break-all">
                ({issue.sourcePath.join(" → ")})
              </span>
            </p>
          ))}
          {issueCount > 5 && (
            <p className="text-sm text-text-muted">
              +{issueCount - 5} more issue{issueCount - 5 === 1 ? "" : "s"}
            </p>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No items resolved"
          description="No items found in the loot table. It may be conditional or reference missing tables."
        />
      ) : (
        <>
          <div className="rounded-lg border border-border bg-bg-surface p-4">
            <h3 className="text-sm font-semibold text-text-primary">Possible rewards</h3>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">
              Chances are theoretical, per-pool estimates—not a guaranteed chance per battle.
              Rolls, conditions, and nested tables can affect the rewards you receive.
              Repeated items may come from different entries or tables.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p role="status" className="text-sm text-text-secondary">
              {rows.length} of {items.length} entries · {groups.length} tables
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => { setExpandedGroups(new Set(groups.map((group) => group.key))); setAutoExpandedGroups(new Set()); }} className="rounded-md border border-border bg-bg-surface px-3 py-2 text-sm text-accent hover:bg-bg-surface-2 focus-visible:outline-2 focus-visible:outline-accent">Expand all</button>
              <button type="button" onClick={() => { setExpandedGroups(new Set()); setAutoExpandedGroups(new Set()); }} className="rounded-md border border-border bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-surface-2 focus-visible:outline-2 focus-visible:outline-accent">Collapse all</button>
            </div>
          </div>
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              value={lootSearch}
              onChange={(e) => setLootSearch(e.target.value)}
              aria-label="Search possible drops"
                            placeholder={`Search ${items.length} possible drops…`}
              className="w-full rounded-md border border-border bg-bg-surface-2 py-2.5 pl-8 pr-8 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
            {lootSearch && (
              <button
                onClick={() => setLootSearch("")}
                aria-label="Clear drop search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {groups.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No drops match your search"
              description={`Nothing in this trainer's ${items.length} possible drops matches "${debouncedLootSearch}".`}
            />
          ) : (
            <div className="flex flex-col gap-2">
              {groups.map((group) => (
                <LootGroupSection
                  key={group.key}
                  group={group}
                  isOpen={expandedGroups.has(group.key)}
                  onToggle={() => toggleGroup(group.key)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Splits rows into a "Direct drops" group plus one group per distinct
// nested loot-table path (sourcePath minus the trainer root). Direct always
// sorts first; nested groups sort alphabetically by their leaf label.
function buildLootGroups(rows) {
  const direct = [];
  const nestedByKey = new Map();

  for (const row of rows) {
    const isDirect = row.direct || row.sourcePath.length <= 1;
    if (isDirect) {
      direct.push(row);
      continue;
    }
    const nestedPath = row.sourcePath.slice(1);
    const key = nestedPath.join(" → ");
    if (!nestedByKey.has(key)) {
      const leafId = row.sourcePath[row.sourcePath.length - 1] || key;
      const label = leafId.includes(":") ? leafId.split(":").pop() : leafId;
      nestedByKey.set(key, { key, label, subtitle: key, rows: [] });
    }
    nestedByKey.get(key).rows.push(row);
  }

  const groups = [];
  if (direct.length > 0) {
    groups.push({
      key: "__direct__",
      label: "Direct drops",
      subtitle: null,
      rows: direct,
    });
  }
  const nestedGroups = Array.from(nestedByKey.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  );
  groups.push(...nestedGroups);

  return groups;
}

function LootGroupSection({ group, isOpen, onToggle }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className="flex w-full items-center gap-3 bg-bg-surface px-4 py-3 text-left hover:bg-bg-surface-2 focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-2 transition-colors duration-100"
      >
        <ChevronRight
          size={14}
          className={`shrink-0 text-text-muted transition-transform duration-150 ${
            isOpen ? "rotate-90" : ""
          }`}
        />
        <span className="min-w-0 flex-1">
          <span className="block break-words text-sm font-semibold text-text-primary">
            {group.label}
          </span>
          {group.subtitle && (
            <span
              className="block break-all text-xs leading-relaxed text-text-secondary"
              title={group.subtitle}
            >
              {group.subtitle}
            </span>
          )}
        </span>
        <Badge tone="neutral">{group.rows.length}</Badge>
      </button>
      {isOpen && (
        <div className="border-t border-border">
          <LootRowList rows={group.rows} bordered={false} />
        </div>
      )}
    </div>
  );
}

// Responsive, wrap-instead-of-scroll loot row list. Virtualizes once a
// trainer has enough drops to matter (some RCT trainers flatten to 1000+).
// Uses a fixed row size on purpose — dynamic measureElement calls flushSync
// under React 19 and throws during layout.
const LOOT_ROW_SIZE = 128;

function LootRowList({ rows, bordered = true }) {
  const scrollRef = useRef(null);
  const shouldVirtualize = rows.length > 150;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => LOOT_ROW_SIZE,
    overscan: 12,
    enabled: shouldVirtualize,
  });

  if (!shouldVirtualize) {
    return (
      <div
        className={`flex flex-col divide-y divide-border ${
          bordered ? "rounded-lg border border-border" : ""
        }`}
      >
        {rows.map((row) => (
          <LootRow key={row.id} row={row} />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className={`overflow-y-auto ${
        bordered ? "rounded-lg border border-border" : ""
      }`}
      style={{ maxHeight: "65vh" }}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          return (
            <div
              key={row.id}
              tabIndex={0}
                            aria-label={`Reward entry: ${row.item}`}
                            className="absolute left-0 top-0 w-full overflow-auto border-b border-border focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-2"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <LootRow row={row} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LootRow({ row }) {
  const chanceLabel = formatChancePercent(row.chancePercent);
  // Only worth calling out that theoreticalWeight differs from the raw
  // entry weight when it actually does (i.e. the item came through a
  // nested/grouped branch) — for a direct, ungrouped entry the two are
  // identical and showing both would just be noise.
  const isReweighted =
    row.theoreticalWeight != null &&
    Math.abs(row.theoreticalWeight - row.weight) > 0.01;

  return (
    <div className="flex flex-col gap-1.5 px-3 py-2.5 hover:bg-bg-surface-2 transition-colors duration-100">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="min-w-0 break-words text-sm font-semibold capitalize text-text-primary" title={row.item}>
          {row.item.split(":").pop().replace(/_/g, " ")}
          <span className="ml-2 font-mono text-xs font-normal normal-case text-text-secondary">{row.item}</span>
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-1.5">
          {chanceLabel && (
            <span
              title={
                isReweighted
                  ? `Theoretical chance ${chanceLabel} — this entry's weight (${row.weight}) is shared across a nested/grouped table, working out to an effective weight of ~${row.theoreticalWeight.toFixed(2)} out of this pool's ${row.poolTotalWeight} total weight. A simplified model, not a full simulation — see the source for details.`
                  : `Theoretical chance ${chanceLabel} — weight ${row.weight} out of this pool's ${row.poolTotalWeight} total weight.`
              }
              className="rounded bg-accent-soft px-1.5 py-0.5 text-xs font-semibold text-accent"
            >
              {chanceLabel} chance
            </span>
          )}
          <span
            title={
              isReweighted
                ? `Raw entry weight ${row.weight} (effective weight after nested grouping: ~${row.theoreticalWeight.toFixed(2)})`
                : "Weight"
            }
            className="rounded bg-bg-surface-2 px-1.5 py-0.5 text-xs text-text-secondary"
          >
            Weight {row.weight}
          </span>
          <span
            title="Rolls"
            className="rounded bg-bg-surface-2 px-1.5 py-0.5 text-xs text-text-secondary"
          >
            Rolls {row.rolls}
          </span>
          {row.setCount && (
            <Badge tone="accent">Quantity {row.setCount}</Badge>
          )}
          {row.direct ? (
            <Badge tone="neutral">Direct</Badge>
          ) : (
            <span
              className="max-w-35 truncate text-xs text-text-muted"
              title={row.sourcePath.join(" → ")}
            >
              via {row.sourcePath.slice(1).join(" → ")}
            </span>
          )}
        </span>
      </div>
      {row.conditions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {row.conditions.map((c, i) => (
            <span
              key={i}
              className="rounded bg-bg-surface-2 px-1.5 py-0.5 text-xs text-text-secondary"
            >
              {formatCondition(c)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function MetaPanel({ trainer }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card>
        <CardBody className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Battle
          </p>
          <p className="text-xs text-text-primary">
            Format: <span className="text-text-secondary">{trainer.battleFormat}</span>
          </p>
          <p className="text-xs text-text-primary">
            AI type:{" "}
            <span className="text-text-secondary">
              {trainer.ai?.type || "—"}
            </span>
          </p>
          {trainer.ai?.data && (
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(trainer.ai.data).map(([k, v]) => (
                <span
                  key={k}
                  className="rounded bg-bg-surface-2 px-1.5 py-0.5 text-xs text-text-secondary"
                >
                  {k}: {String(v)}
                </span>
              ))}
            </div>
          )}
          {Object.keys(trainer.battleRules || {}).length > 0 && (
            <pre className="mt-1 overflow-x-auto rounded bg-bg-surface-2 p-2 text-xs text-text-secondary">
              {JSON.stringify(trainer.battleRules, null, 2)}
            </pre>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Source
          </p>
          <p className="break-all font-mono text-sm leading-relaxed text-text-secondary">
            {trainer.sourceFile}
          </p>
          <p className="text-xs text-text-primary">
            Namespace:{" "}
            <span className="text-text-secondary">{trainer.namespace}</span>
          </p>
          <p className="text-xs text-text-primary">
            Loot link:{" "}
            <span className="text-text-secondary">
              {trainer.loot.linkStatus === "single"
                ? "Direct match (trainers/single)"
                : trainer.loot.linkStatus === "group"
                ? `Group match (trainers/groups/${trainer.loot.groupMatch})`
                : "No match found"}
            </span>
          </p>
          {trainer.bag?.length > 0 && (
            <div>
              <p className="mt-1 text-sm font-medium text-text-secondary">
                Bag
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {trainer.bag.map((b, i) => (
                  <span
                    key={i}
                    className="rounded bg-bg-surface-2 px-1.5 py-0.5 text-xs text-text-secondary"
                  >
                    {typeof b === "string" ? b : JSON.stringify(b)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
