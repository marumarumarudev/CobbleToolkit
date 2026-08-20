"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Search,
  X,
  Layers,
  Sparkles,
  Zap,
  BookOpen,
  Star,
  PackageSearch,
  Dna,
} from "lucide-react";

import { useStorage } from "@/hooks/useStorage";
import { useSharedFiles } from "@/contexts/SharedFilesContext";
import { SHARED_FILES_CHANGED_EVENT } from "@/utils/toolDataStores";
import { parseSpeciesAndSpawnFromZip } from "@/utils/speciesSpawnParser";
import { parseLootFromZip } from "@/utils/lootParser";
import { formatPokemonName, matchesSearch } from "@/utils/nameUtils";
import { mergeSpeciesAndLoot } from "@/lib/speciesLootMerge";
import { withBasePath } from "@/utils/basePath";

import {
  Card,
  CardBody,
  Badge,
  Tabs,
  FileDropzone,
  EmptyState,
  DataTable,
  Spinner,
  SkeletonTable,
} from "@/components/ui";
import StorageInfo from "@/components/StorageInfo";

const SCANNER_NAME = "speciesLootScanner";

// CDN-only sprites via Pokémon Showdown (https://play.pokemonshowdown.com).
// At most 2 requests: exact form slug, then base species.

function normalizeSpeciesKey(name) {
  if (!name) return "";
  let raw = String(name).toLowerCase().trim();
  if (raw.includes(":")) raw = raw.split(":").pop();
  return raw
    .replace(/['’%]/g, "")
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Map Cobblemon form/aspect token → Showdown suffix ("" = base art). */
function formTokenToShowdown(token) {
  if (token == null || token === "") return "";
  let t = String(token)
    .toLowerCase()
    .replace(/['’%]/g, "")
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  t = t
    .replace(/-style$/, "")
    .replace(/-mask$/, "")
    .replace(/-percent$/, "")
    .replace(/-breed$/, "")
    .replace(/-flower$/, "")
    .replace(/-trim$/, "")
    .replace(/-mode$/, "")
    .replace(/-forme?$/, "")
    .replace(/-size$/, "");

  const table = {
    mega: "mega",
    megax: "megax",
    "mega-x": "megax",
    megay: "megay",
    "mega-y": "megay",
    gmax: "gmax",
    gigantamax: "gmax",
    alola: "alola",
    alolan: "alola",
    galar: "galar",
    galarian: "galar",
    hisui: "hisui",
    hisuian: "hisui",
    paldea: "paldea",
    paldean: "paldea",
    paldeablaze: "paldeablaze",
    blaze: "paldeablaze",
    paldeaaqua: "paldeaaqua",
    aqua: "paldeaaqua",
    paldeacombat: "paldeacombat",
    combat: "paldeacombat",
    baile: "",
    pompom: "pompom",
    "pom-pom": "pompom",
    pau: "pau",
    "pa-u": "pau",
    sensu: "sensu",
    teal: "",
    tealtera: "tealtera",
    wellspring: "wellspring",
    wellspringtera: "wellspringtera",
    hearthflame: "hearthflame",
    hearthflametera: "hearthflametera",
    cornerstone: "cornerstone",
    cornerstonetera: "cornerstonetera",
    "10": "10",
    "10c": "10",
    "10-c": "10",
    "50": "",
    "50c": "",
    "50-c": "",
    complete: "complete",
    "power-construct": "",
    powerconstruct: "",
    primal: "primal",
    partner: "partner",
    hero: "hero",
    unbound: "unbound",
    origin: "origin",
    sky: "sky",
    therian: "therian",
    attack: "attack",
    defense: "defense",
    speed: "speed",
    bloodmoon: "bloodmoon",
    rapidstrike: "rapidstrike",
    "rapid-strike": "rapidstrike",
    rapidstrikegmax: "rapidstrikegmax",
    lowkey: "lowkey",
    "low-key": "lowkey",
    lowkeygmax: "gmax",
    zen: "zen",
    galarzen: "galarzen",
    sunshine: "sunshine",
    overcast: "",
    east: "east",
    west: "",
    plant: "",
    sandy: "sandy",
    trash: "trash",
    heat: "heat",
    wash: "wash",
    frost: "frost",
    fan: "fan",
    mow: "mow",
    spring: "",
    summer: "summer",
    autumn: "autumn",
    fall: "autumn",
    winter: "winter",
    blue: "blue",
    orange: "orange",
    white: "white",
    yellow: "yellow",
    red: "",
    eternal: "eternal",
    dandy: "dandy",
    debutante: "debutante",
    diamond: "diamond",
    heart: "heart",
    kabuki: "kabuki",
    lareine: "lareine",
    "la-reine": "lareine",
    matron: "matron",
    pharaoh: "pharaoh",
    star: "star",
    small: "small",
    large: "large",
    super: "super",
    average: "",
    medium: "",
    bluestriped: "bluestriped",
    "blue-striped": "bluestriped",
    whitestriped: "whitestriped",
    "white-striped": "whitestriped",
    original: "original",
    busted: "busted",
    black: "black",
    duskmane: "duskmane",
    "dusk-mane": "duskmane",
    dawnwings: "dawnwings",
    "dawn-wings": "dawnwings",
    ultra: "ultra",
    resolute: "resolute",
    terastal: "terastal",
    stellar: "stellar",
    masterpiece: "masterpiece",
    antique: "antique",
    artisan: "artisan",
    roaming: "roaming",
    threesegment: "threesegment",
    "three-segment": "threesegment",
    stretchy: "stretchy",
    droopy: "droopy",
    curly: "",
    four: "four",
    hangry: "hangry",
    noice: "noice",
    gulping: "gulping",
    gorging: "gorging",
    meteor: "meteor",
    school: "school",
    solo: "",
    dusk: "dusk",
    midnight: "midnight",
    midday: "",
    crowned: "crowned",
    shadow: "shadow",
    ice: "ice",
    dada: "dada",
    eternamax: "eternamax",
    ash: "ash",
    douse: "douse",
    shock: "shock",
    burn: "burn",
    chill: "chill",
    rubycream: "rubycream",
    matchacream: "matchacream",
    mintcream: "mintcream",
    lemoncream: "lemoncream",
    saltedcream: "saltedcream",
    rubyswirl: "rubyswirl",
    caramelswirl: "caramelswirl",
    rainbowswirl: "rainbowswirl",
    vanillacream: "",
  };
  if (Object.prototype.hasOwnProperty.call(table, t)) return table[t];
  const types = [
    "normal","fire","water","electric","grass","ice","fighting","poison",
    "ground","flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy",
  ];
  if (types.includes(t)) return t;
  return null; // unknown — do not treat as form
}

function showdownSlugFromName(name) {
  if (!name) return "";
  let raw = normalizeSpeciesKey(name);

  // Strip cosmetics that are not forms
  raw = raw
    .replace(/(?:^|-)bias(?:-|$)/g, "-")
    .replace(/-style(?=-|$)/g, "")
    .replace(/-mask(?=-|$)/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // Species with no hyphen in Showdown ids
  if (/^nidoran-?f$/.test(raw) || raw === "nidoranf") return "nidoranf";
  if (/^nidoran-?m$/.test(raw) || raw === "nidoranm") return "nidoranm";
  if (/^type-?null$/.test(raw)) return "typenull";
  if (raw === "farfetchd" || raw === "farfetch-d") return "farfetchd";
  if (raw === "sirfetchd" || raw === "sirfetch-d") return "sirfetchd";

  // Leading form: mega-venusaur, gmax-charizard, hisuian-arcanine
  const lead = raw.match(
    /^(mega|gmax|gigantamax|alola|alolan|galar|galarian|hisui|hisuian|primal)-(x-|y-)?(.+)$/
  );
  if (lead) {
    const kind = lead[1];
    const xy = lead[2];
    const rest = lead[3];
    let form = "mega";
    if (kind === "mega") form = xy === "x-" ? "megax" : xy === "y-" ? "megay" : "mega";
    else if (kind.includes("max")) form = "gmax";
    else if (kind.startsWith("alola")) form = "alola";
    else if (kind.startsWith("galar")) form = "galar";
    else if (kind.startsWith("hisui")) form = "hisui";
    else form = "primal";
    raw = `${rest}-${form}`;
  }

  // Ordered suffix rules — longest / most specific first
  // form null means "unknown, keep looking"; "" means base art
  const rules = [
    [/-(rapid-?strike-?gmax)$/, "rapidstrikegmax"],
    [/-(low-?key-?gmax)$/, "gmax"],
    [/-(mega-?x|megax)$/, "megax"],
    [/-(mega-?y|megay)$/, "megay"],
    [/-mega$/, "mega"],
    [/-(gigantamax|gmax)$/, "gmax"],
    [/-(alolan|alola)$/, "alola"],
    [/-(galarian|galar)$/, "galar"],
    [/-(hisuian|hisui)$/, "hisui"],
    [/-paldeablaze$/, "paldeablaze"],
    [/-paldeaaqua$/, "paldeaaqua"],
    [/-paldeacombat$/, "paldeacombat"],
    [/-paldea$/, "paldea"],
    [/-(dusk-?mane)$/, "duskmane"],
    [/-(dawn-?wings)$/, "dawnwings"],
    [/-(blue-?striped)$/, "bluestriped"],
    [/-(white-?striped)$/, "whitestriped"],
    [/-(three-?segment)$/, "threesegment"],
    [/-(pom-?pom)$/, "pompom"],
    [/-(wellspring-?tera)$/, "wellspringtera"],
    [/-(hearthflame-?tera)$/, "hearthflametera"],
    [/-(cornerstone-?tera)$/, "cornerstonetera"],
    [/-(teal-?tera)$/, "tealtera"],
    [/-(10-?percent-?c|10-?c|10-?percent|10)$/, "10"],
    [/-(50-?percent-?c|50-?c|50-?percent|50)$/, ""],
    [/-(complete-?percent|complete)$/, "complete"],
    [/-primal$/, "primal"],
    [/-partner$/, "partner"],
    [/-hero$/, "hero"],
    [/-unbound$/, "unbound"],
    [/-origin$/, "origin"],
    [/-sky$/, "sky"],
    [/-therian$/, "therian"],
    [/-attack$/, "attack"],
    [/-defense$/, "defense"],
    [/-speed$/, "speed"],
    [/-bloodmoon$/, "bloodmoon"],
    [/-rapid-?strike$/, "rapidstrike"],
    [/-low-?key$/, "lowkey"],
    [/-baile$/, ""],
    [/-pau$/, "pau"],
    [/-sensu$/, "sensu"],
    [/-teal$/, ""],
    [/-wellspring$/, "wellspring"],
    [/-hearthflame$/, "hearthflame"],
    [/-cornerstone$/, "cornerstone"],
    [/-zen$/, "zen"],
    [/-sunshine$/, "sunshine"],
    [/-east$/, "east"],
    [/-west$/, ""],
    [/-sandy$/, "sandy"],
    [/-trash$/, "trash"],
    [/-heat$/, "heat"],
    [/-wash$/, "wash"],
    [/-frost$/, "frost"],
    [/-fan$/, "fan"],
    [/-mow$/, "mow"],
    [/-summer$/, "summer"],
    [/-autumn$|-fall$/, "autumn"],
    [/-winter$/, "winter"],
    [/-spring$/, ""],
    [/-blue$/, "blue"],
    [/-orange$/, "orange"],
    [/-white$/, "white"],
    [/-yellow$/, "yellow"],
    [/-red$/, ""],
    [/-eternal$/, "eternal"],
    [/-dandy$/, "dandy"],
    [/-debutante$/, "debutante"],
    [/-diamond$/, "diamond"],
    [/-heart$/, "heart"],
    [/-kabuki$/, "kabuki"],
    [/-(la-?reine|lareine)$/, "lareine"],
    [/-matron$/, "matron"],
    [/-pharaoh$/, "pharaoh"],
    [/-star$/, "star"],
    [/-small$/, "small"],
    [/-large$/, "large"],
    [/-super$/, "super"],
    [/-original$/, "original"],
    [/-busted$/, "busted"],
    [/-black$/, "black"],
    [/-ultra$/, "ultra"],
    [/-resolute$/, "resolute"],
    [/-terastal$/, "terastal"],
    [/-stellar$/, "stellar"],
    [/-masterpiece$/, "masterpiece"],
    [/-antique$/, "antique"],
    [/-artisan$/, "artisan"],
    [/-roaming$/, "roaming"],
    [/-stretchy$/, "stretchy"],
    [/-droopy$/, "droopy"],
    [/-four$/, "four"],
    [/-hangry$/, "hangry"],
    [/-noice$/, "noice"],
    [/-gulping$/, "gulping"],
    [/-gorging$/, "gorging"],
    [/-meteor$/, "meteor"],
    [/-school$/, "school"],
    [/-dusk$/, "dusk"],
    [/-midnight$/, "midnight"],
    [/-crowned$/, "crowned"],
    [/-shadow$/, "shadow"],
    [/-dada$/, "dada"],
    [/-eternamax$/, "eternamax"],
    [/-ash$/, "ash"],
    // Type plates last so "hisui" etc. already matched
    [/-(normal|fire|water|electric|grass|ice|fighting|poison|ground|flying|psychic|bug|rock|ghost|dragon|dark|steel|fairy)$/, null],
  ];

  let form = "";
  let base = raw;
  for (const [re, formId] of rules) {
    if (!re.test(base)) continue;
    const m = base.match(re);
    form = formId === null && m ? m[1] : formId;
    base = base.replace(re, "");
    break;
  }

  // Tauros breed shorthand
  if (!form && form !== "") {
    /* noop */
  }
  {
    const t = raw.match(/^tauros-(blaze|aqua|combat)$/);
    if (t && !form) {
      base = "tauros";
      form = `paldea${t[1]}`;
    }
  }

  base = String(base).replace(/[^a-z0-9]/g, "");
  if (!base || /^\d+$/.test(base)) return "";
  return form ? `${base}-${form}` : base;
}

function buildSpriteSources(name) {
  const slug = showdownSlugFromName(name);
  if (!slug) return [];
  const base = slug.includes("-") ? slug.split("-")[0] : slug;
  const urls = [`https://play.pokemonshowdown.com/sprites/gen5/${slug}.png`];
  if (base && base !== slug) {
    urls.push(`https://play.pokemonshowdown.com/sprites/gen5/${base}.png`);
  }
  return urls;
}

function PokemonSprite({ name, size = 40, className = "" }) {
  const sources = useMemo(() => buildSpriteSources(name), [name]);
  const [sourceIndex, setSourceIndex] = useState(0);

  // Critical: reset when species changes, or a prior 404 leaves the icon stuck
  useEffect(() => {
    setSourceIndex(0);
  }, [name]);

  const src = sources[sourceIndex] || null;

  if (!src) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-md border border-border bg-bg-surface-2 text-text-muted ${className}`}
        style={{ width: size, height: size }}
        title={name ? `${name} (no sprite)` : ""}
      >
        <Dna size={Math.max(14, size * 0.35)} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={src}
      src={src}
      alt={name}
      width={size}
      height={size}
      onError={() => setSourceIndex((i) => i + 1)}
      className={`shrink-0 rounded-md border border-border bg-bg-surface-2 ${className}`}
      style={{ imageRendering: "pixelated" }}
      title={`${name} → ${showdownSlugFromName(name)}`}
    />
  );
}

export default function SpeciesLootScanner() {
  // Same stores SpeciesScanner / LootScanner already use — this tool reads
  // and writes the same shapes, so nothing here forks the data model.
  const {
    data: species,
    setData: setSpecies,
    saveData: saveSpecies,
    loadData: reloadSpecies,
  } = useStorage("speciesData", []);
  const {
    data: lootReports,
    setData: setLootReports,
    saveData: saveLootReports,
    loadData: reloadLootReports,
  } = useStorage("lootReports", []);

  const { sharedFiles, addSharedFile } = useSharedFiles();

  const [processedFiles, setProcessedFiles] = useState(new Set());
  const [processedFilesLoaded, setProcessedFilesLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedName, setSelectedName] = useState(null);
  const [activeTab, setActiveTab] = useState("species");

  useEffect(() => {
    document.title = "Species & Loot | CobbleToolkit";
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(handler);
  }, [search]);

  // Load which shared files this tool has already parsed
  useEffect(() => {
    (async () => {
      try {
        const { default: getStorage } = await import(
          "@/utils/indexedDBStorage"
        );
        const storage = getStorage();
        const processed = await storage.getProcessedFiles(SCANNER_NAME);
        setProcessedFiles(processed);
      } catch (err) {
        console.error("Failed to load processed files:", err);
      } finally {
        setProcessedFilesLoaded(true);
      }
    })();
  }, []);

  // The nav upload widget is the single place files/data get removed. When
  // it removes a file or clears everything, refresh both stores + the
  // processed set from IndexedDB so this view never shows stale rows.
  useEffect(() => {
    const handleFilesChanged = async () => {
      await Promise.all([reloadSpecies(), reloadLootReports()]);
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
  }, [reloadSpecies, reloadLootReports]);

  // Process any shared files this tool hasn't seen yet through BOTH parsers
  useEffect(() => {
    const run = async () => {
      if (!processedFilesLoaded || !sharedFiles.length || loading) return;

      const unprocessed = sharedFiles.filter(
        (sf) => sf.file && !processedFiles.has(sf.id)
      );
      if (!unprocessed.length) return;

      setLoading(true);
      const { default: getStorage } = await import("@/utils/indexedDBStorage");
      const storage = getStorage();

      const existingSpeciesFiles = new Set(
        species.map((s) => s.sourceFile).filter(Boolean)
      );
      const existingLootFiles = new Set(lootReports.map((r) => r.name));

      const newSpecies = [];
      const newLootReports = [];
      let filesWithData = 0;

      for (const sharedFile of unprocessed) {
        try {
          if (!existingSpeciesFiles.has(sharedFile.name)) {
            const parsedSpecies = await parseSpeciesAndSpawnFromZip(
              sharedFile.file
            );
            if (parsedSpecies?.length) {
              newSpecies.push(...parsedSpecies);
              existingSpeciesFiles.add(sharedFile.name);
            }
          }

          if (!existingLootFiles.has(sharedFile.name)) {
            const parsedLoot = await parseLootFromZip(sharedFile.file);
            if (parsedLoot?.length) {
              newLootReports.push({
                id: crypto.randomUUID(),
                name: sharedFile.name,
                data: parsedLoot,
                fromShared: true,
              });
              existingLootFiles.add(sharedFile.name);
            }
          }

          filesWithData++;
        } catch (err) {
          console.error(`Failed to process ${sharedFile.name}:`, err);
        }

        await storage.markFileProcessed(SCANNER_NAME, sharedFile.id);
        setProcessedFiles((prev) => new Set([...prev, sharedFile.id]));
      }

      if (newSpecies.length) {
        const merged = [...species, ...newSpecies].filter(
          (s, i, self) =>
            i ===
            self.findIndex(
              (o) => o.name === s.name && o.sourceFile === s.sourceFile
            )
        );
        await saveSpecies(merged);
        setSpecies(merged);
      }

      if (newLootReports.length) {
        const merged = [...newLootReports, ...lootReports];
        await saveLootReports(merged);
        setLootReports(merged);
      }

      if (newSpecies.length || newLootReports.length) {
        toast.success(
          `Parsed ${unprocessed.length} file${
            unprocessed.length === 1 ? "" : "s"
          } — ${newSpecies.length} species, ${newLootReports.length} loot table${
            newLootReports.length === 1 ? "" : "s"
          }`
        );
      } else if (unprocessed.length) {
        toast.error(
          "No species or loot data found in the uploaded file(s)."
        );
      }

      setLoading(false);
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedFiles, processedFilesLoaded, loading]);

  const merged = useMemo(
    () => mergeSpeciesAndLoot(species, lootReports),
    [species, lootReports]
  );

  // Expand nested Cobblemon `forms[]` (Mega, Gmax, regional, etc.) into
  // selectable rows so their sprites resolve to venusaur-gmax.png etc.
  const catalog = useMemo(() => {
    const out = [];
    const seen = new Set();
    for (const m of merged) {
      if (!seen.has(m.name)) {
        seen.add(m.name);
        out.push(m);
      }
      const forms = m.forms;
      if (!Array.isArray(forms) || !forms.length) continue;
      for (const f of forms) {
        // Prefer aspect tokens (pom_pom-style, 10-percent) — closer to Showdown
        const aspect = (f?.aspects || []).find(Boolean);
        const formLabel = aspect || f?.name;
        if (!formLabel) continue;
        const suffix = formTokenToShowdown(formLabel);
        const formName = suffix
          ? `${m.name}-${suffix}`
          : // baile / teal / 50% etc. share base sprite — still list row with label
            `${m.name}-${normalizeSpeciesKey(f?.name || formLabel)}`;
        if (seen.has(formName)) continue;
        seen.add(formName);
        const types = f.primaryType
          ? [f.primaryType, f.secondaryType].filter(Boolean)
          : m.types;
        out.push({
          ...m,
          name: formName,
          types: types || m.types,
          stats: f.baseStats || m.stats,
          abilities: f.abilities || m.abilities,
          forms: undefined,
          isForm: true,
          formOf: m.name,
          aspects: f.aspects || [String(formLabel).toLowerCase()],
          drops: m.drops,
          hasLootData: m.hasLootData,
          hasSpeciesData: true,
        });
      }
    }
    return out;
  }, [merged]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return catalog;
    return catalog.filter(
      (m) =>
        matchesSearch(debouncedSearch, m.name) ||
        matchesSearch(debouncedSearch, m.types) ||
        (m.drops || []).some((drop) => matchesSearch(debouncedSearch, drop.item))
    );
  }, [catalog, debouncedSearch]);

  const selected = useMemo(
    () => catalog.find((m) => m.name === selectedName) ?? null,
    [catalog, selectedName]
  );

  // Keep a valid selection as filters/data change
  useEffect(() => {
    if (!selected && filtered.length > 0) {
      setSelectedName(filtered[0].name);
    }
  }, [filtered, selected]);

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

  const hasAnyData = merged.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-soft text-accent">
            <Layers size={16} />
          </div>
          <h1 className="text-xl font-semibold text-text-primary">
            Species & Loot
          </h1>
        </div>
        <p className="mt-1 text-sm text-text-secondary">
          Pick a species to see its base data and drop table side by side.
        </p>
      </header>

      {!hasAnyData && !loading && (
        <EmptyState
          icon={Layers}
          title="No datapack loaded yet"
          description="Drop a Cobblemon datapack .zip (or .jar) below, or use the upload button in the nav. This tool reads the species/ and species_additions/ folders."
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

      {loading && !hasAnyData && (
        <Card>
          <CardBody className="flex items-center gap-3">
            <Spinner />
            <span className="text-sm text-text-secondary">
              Parsing datapack…
            </span>
          </CardBody>
        </Card>
      )}

      {hasAnyData && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span>{merged.length} species indexed</span>
              <span className="text-border">•</span>
              <span>
                {merged.filter((m) => m.hasLootData).length} with loot data
              </span>
              {loading && (
                <span className="flex items-center gap-1.5 text-accent">
                  <Spinner size={12} /> Parsing more files…
                </span>
              )}
            </div>
            <StorageInfo />
          </div>

          <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
            {/* Species selector */}
            <Card className="flex flex-col overflow-hidden">
              <div className="border-b border-border p-3">
                <div className="relative">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search species, type, or loot item…"
                    className="w-full rounded-md border border-border bg-bg-surface-2 py-1.5 pl-8 pr-7 text-xs text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-[65vh] overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="px-3 py-6 text-center text-xs text-text-muted">
                    No species match &quot;{debouncedSearch}&quot;.
                  </p>
                ) : (
                  filtered.map((mon) => (
                    <button
                      key={mon.name}
                      onClick={() => setSelectedName(mon.name)}
                      className={[
                        "flex w-full items-center justify-between gap-2 border-b border-border px-3 py-2 text-left transition-colors duration-100",
                        mon.name === selectedName
                          ? "bg-accent-soft"
                          : "hover:bg-bg-surface-2",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <PokemonSprite name={mon.name} size={32} />
                        <span className="min-w-0">
                          <span
                            className={[
                              "block truncate text-xs font-medium capitalize",
                              mon.name === selectedName
                                ? "text-accent"
                                : "text-text-primary",
                            ].join(" ")}
                          >
                            {formatPokemonName(mon.name)}
                          </span>
                          <span className="block text-[10px] text-text-muted">
                            {mon.nationalDex ? `#${mon.nationalDex}` : "—"}
                          </span>
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1">
                        {mon.hasLootData && (
                          <span
                            title="Has loot data"
                            className="h-1.5 w-1.5 rounded-full bg-accent"
                          />
                        )}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </Card>

            {/* Detail panel */}
            <div className="flex flex-col gap-3">
              {!selected ? (
                <EmptyState
                  icon={Search}
                  title="Select a species"
                  description="Choose a species from the list to see its data and loot table."
                />
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <PokemonSprite name={selected.name} size={56} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-semibold capitalize text-text-primary">
                            {formatPokemonName(selected.name)}
                          </h2>
                          {selected.nationalDex && (
                            <Badge tone="neutral">#{selected.nationalDex}</Badge>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {selected.types.map((t) => (
                            <Badge key={t} tone="accent">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Tabs
                      tabs={[
                        { id: "species", label: "Species Data", icon: Dna },
                        {
                          id: "loot",
                          label: "Loot Table",
                          icon: PackageSearch,
                          count: selected.drops.length,
                        },
                      ]}
                      active={activeTab}
                      onChange={setActiveTab}
                    />
                  </div>

                  {activeTab === "species" && (
                    <SpeciesPanel entry={selected} />
                  )}
                  {activeTab === "loot" && <LootPanel entry={selected} />}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatRow({ label, value, max = 255 }) {
  const pct = Math.min(100, Math.round(((value ?? 0) / max) * 100));
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-9 shrink-0 text-text-muted">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-surface-2">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-7 shrink-0 text-right text-text-primary">
        {value ?? 0}
      </span>
    </div>
  );
}

function SpeciesPanel({ entry }) {
  if (!entry.hasSpeciesData) {
    return (
      <EmptyState
        icon={Dna}
        title="No species data for this Pokémon"
        description="A loot table was found, but no matching entry exists in species/ or species_additions/ — the species file may have failed to parse."
      />
    );
  }

  const evText =
    Object.entries(entry.evYield || {})
      .filter(([, v]) => v > 0)
      .map(([stat, v]) => `+${v} ${stat.replace("_", " ")}`)
      .join(", ") || "None";

  const levelMoves = entry.moves
    .filter((m) => /^\d+:/.test(m))
    .map((m) => {
      const [lvl, move] = m.split(":");
      return { lvl: Number(lvl), move };
    })
    .sort((a, b) => a.lvl - b.lvl);
  const tmMoves = entry.moves
    .filter((m) => m.startsWith("tm:"))
    .map((m) => m.replace("tm:", ""));
  const eggMoves = entry.moves
    .filter((m) => m.startsWith("tutor:"))
    .map((m) => m.replace("tutor:", ""));

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card>
        <CardBody className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Base stats
          </p>
          <StatRow label="HP" value={entry.stats?.hp} />
          <StatRow label="Atk" value={entry.stats?.attack} />
          <StatRow label="Def" value={entry.stats?.defence} />
          <StatRow label="SpA" value={entry.stats?.special_attack} />
          <StatRow label="SpD" value={entry.stats?.special_defence} />
          <StatRow label="Spe" value={entry.stats?.speed} />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              EV yield
            </p>
            <p className="mt-1 text-xs text-text-primary">{evText}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Source
            </p>
            <p className="mt-1 truncate font-mono text-[11px] text-text-secondary">
              {entry.sourceFile || "—"}
            </p>
          </div>
        </CardBody>
      </Card>

      <Card className="sm:col-span-2">
        <CardBody className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Moves ({entry.moves.length})
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <MoveGroup icon={Zap} label="Level-up" items={levelMoves.map((m) => `Lv ${m.lvl} ${m.move}`)} />
            <MoveGroup icon={BookOpen} label="TM" items={tmMoves} />
            <MoveGroup icon={Star} label="Egg" items={eggMoves} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function MoveGroup({ icon: Icon, label, items }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
        <Icon size={12} />
        {label}
        <span className="text-text-muted">({items.length})</span>
      </div>
      <div className="max-h-40 space-y-0.5 overflow-y-auto rounded-md border border-border bg-bg-surface-2 p-1.5">
        {items.length === 0 ? (
          <p className="px-1 py-1 text-[11px] italic text-text-muted">None</p>
        ) : (
          items.map((move, i) => (
            <p key={i} className="truncate px-1 py-0.5 text-[11px] text-text-primary">
              {move}
            </p>
          ))
        )}
      </div>
    </div>
  );
}

function LootPanel({ entry }) {
  if (!entry.hasLootData) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No loot data for this Pokémon"
        description="This species doesn't define a drops.entries table in the datapack, or none was found in the uploaded file(s)."
      />
    );
  }

  const rows = entry.drops.map((drop, i) => ({
    id: `${entry.name}-${i}`,
    item: drop.item,
    quantity:
      typeof drop.quantity === "string"
        ? drop.quantity
        : Array.isArray(drop.quantity)
        ? `${drop.quantity[0]}–${drop.quantity[1]}`
        : String(drop.quantity ?? 1),
    chance: drop.chance != null ? drop.chance : null,
  }));

  return (
    <DataTable
      getRowKey={(row) => row.id}
      rows={rows}
      columns={[
        {
          key: "item",
          label: "Item",
          render: (row) => (
            <span className="font-mono text-xs">{row.item}</span>
          ),
        },
        { key: "quantity", label: "Quantity" },
        {
          key: "chance",
          label: "Chance",
          sortValue: (row) => row.chance ?? -1,
          render: (row) =>
            row.chance != null ? (
              <Badge tone="accent">{row.chance}%</Badge>
            ) : (
              <span className="text-text-muted">—</span>
            ),
        },
      ]}
    />
  );
}
