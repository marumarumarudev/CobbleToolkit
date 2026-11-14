"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Search,
  X,
  Loader2,
  AlertTriangle,
  Sparkles,
  Info,
  RefreshCw,
  Youtube,
  Fish,
  Flame,
} from "lucide-react";
import { usePokedexSearch } from "@/hooks/usePokedexSearch";
import { recommendSeasonings, RARITY_BUCKETS, GOALS } from "@/utils/pokesnackMatcher";
import { MC_ITEM_GALLERY_VERSION } from "@/data/baitSeasoningData";
import { COOKING_MODES, COOKING_MODE_TABS } from "@/data/cookingModes";
import { withBasePath } from "@/utils/basePath";
import { runLatestRequest, getSeasoningAlternatives, cycleSeasoningSlot } from "@/utils/kitchenInteractions";
import { Card, CardBody, Badge, Tabs, EmptyState, Spinner } from "@/components/ui";
import { TbCakeRoll } from "react-icons/tb";

// Hardcoded corrections for species where PokeAPI/caching produces the
// wrong EV yield. Format matches target.evYield: [{stat, amount}].
const EV_YIELD_OVERRIDES = {
  "ursaluna-bloodmoon": [{ stat: "special_attack", amount: 3 }],
};

function resolveEvYield(slug, evYield) {
  return EV_YIELD_OVERRIDES[slug] ?? evYield ?? [];
}

const TYPE_COLORS = {
  Normal: "#A8A878", Fire: "#F08030", Water: "#6890F0", Electric: "#F8D030",
  Grass: "#78C850", Ice: "#98D8D8", Fighting: "#C03028", Poison: "#A040A0",
  Ground: "#E0C068", Flying: "#A890F0", Psychic: "#F85888", Bug: "#A8B820",
  Rock: "#B8A038", Ghost: "#705898", Dragon: "#7038F8", Dark: "#705848",
  Steel: "#B8B8D0", Fairy: "#EE99AC",
};

const SNACK_TUTORIAL_CREATORS = [
  { name: "Ploop Craft", url: "https://www.youtube.com/@Ploop-Craft" },
  { name: "GodDigMC", url: "https://www.youtube.com/@GodDigMC" },
  { name: "PocketCraft", url: "https://www.youtube.com/@pocketcraft3440" },
];

function resolveIconSources(item) {
  if (!item) return [];
  const sources = [];
  // Local first: public/icons/items/{id}.png
  if (item.id) sources.push(withBasePath(`/icons/items/${item.id}.png`));
  if (item.mcItemId) {
    sources.push(
      `https://mcitemgallery.com/images/${MC_ITEM_GALLERY_VERSION}/${item.mcItemId}.png`
    );
  }
  if (item.iconSlug) {
    sources.push(
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.iconSlug}.png`
    );
  }
  return sources;
}

function ItemIcon({ item, size = 36, className = "" }) {
  const sources = useMemo(() => resolveIconSources(item), [item]);
  const [sourceIndex, setSourceIndex] = useState(0);
  useEffect(() => setSourceIndex(0), [item]);
  const src = sources[sourceIndex];
  const title = item?.name || "";

  if (!item) {
    return (
      <div
        className={`shrink-0 rounded border border-border/60 bg-bg-surface-2/50 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  if (!src || sourceIndex >= sources.length) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded border border-border bg-bg-surface-2 ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.45 }}
        title={title}
      >
        {item.emoji || "·"}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={title}
      title={title}
      width={size}
      height={size}
      onError={() => setSourceIndex((i) => i + 1)}
      className={`shrink-0 object-contain ${className}`}
      style={{ imageRendering: "pixelated", width: size, height: size }}
    />
  );
}


const EV_STAT_LABELS = {
  hp: "HP",
  attack: "Atk",
  defence: "Def",
  special_attack: "Sp. Atk",
  special_defence: "Sp. Def",
  speed: "Spe",
};

const EV_STAT_COLORS = {
  hp: "#f87171",
  attack: "#fb923c",
  defence: "#facc15",
  special_attack: "#60a5fa",
  special_defence: "#4ade80",
  speed: "#f472b6",
};

function EvYieldDisplay({ evYield }) {
  const nonZero = (evYield || []).filter((ev) => ev.amount);
  if (nonZero.length === 0) {
    return <span className="text-text-muted">No EV yield</span>;
  }
  return (
    <>
      {nonZero.map((ev, i) => (
        <span key={ev.stat}>
          <span
            className="font-semibold"
            style={{ color: EV_STAT_COLORS[ev.stat] || "inherit" }}
          >
            +{ev.amount} {EV_STAT_LABELS[ev.stat] || ev.stat}
          </span>
          {i < nonZero.length - 1 && <span className="text-text-muted">, </span>}
        </span>
      ))}
    </>
  );
}

function TypeBadge({ type }) {
  return (
    <span
      className="rounded px-1.5 py-0.5 text-xs font-mono font-semibold text-white"
      style={{ backgroundColor: TYPE_COLORS[type] || "#777" }}
    >
      {type}
    </span>
  );
}


/** In-game-style campfire pot: 3×3 base + 3 seasoning slots (no result icon). */
function CampfirePotPanel({ mode, seasonings = [], swappableSlots = [], onSeasoningClick }) {
  const slots = [0, 1, 2].map((i) => seasonings[i] || null);

  return (
    <section aria-label="Campfire pot" className="w-full rounded-xl border-2 border-border bg-bg-base p-3 shadow-inner sm:w-72">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-border pb-3">
        <h3 className="flex items-center gap-2 font-mono text-xs font-semibold text-accent"><Flame size={15} aria-hidden="true" /> Campfire pot</h3>
        <span className="font-mono text-xs text-text-muted">Recipe preview</span>
      </div>
      <div className="rounded-lg border border-border bg-bg-surface p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-muted">01 / Base recipe</p>
        <div className="flex flex-col items-center gap-3">
          <div aria-label="Base ingredient grid" className="grid w-full max-w-44 grid-cols-3 gap-1.5">
            {mode.grid.map((cell, i) => (
              <div
                key={i}
                className={`flex aspect-square items-center justify-center rounded-sm border shadow-inner ${cell ? "border-border-hover bg-bg-surface-2" : "border-dashed border-border bg-bg-base/60"}`}
                title={cell?.name || "Empty ingredient slot"}
              >
                {cell ? (
                  <ItemIcon item={cell} size={28} />
                ) : null}
              </div>
            ))}
          </div>

          <div className="w-full border-t border-border pt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-muted">02 / Seasoning slots</p>
            <div className="grid grid-cols-3 gap-2">
              {slots.map((seasoning, i) => (
                <button
                  key={i}
                  type="button"
                  title={
                    seasoning
                      ? `${seasoning.name}: ${seasoning.effect || "seasoning"}`
                      : `Seasoning slot ${i + 1} (empty)`
                  }
                  disabled={!seasoning || !swappableSlots[i]}
                  aria-label={swappableSlots[i]
                    ? `Cycle seasoning ${i + 1}: ${seasoning?.name}`
                    : `Seasoning ${i + 1}: ${seasoning?.name || "empty"}`}
                  onClick={() => onSeasoningClick?.(i)}
                  className={`relative flex min-h-16 flex-col items-center justify-center gap-1 rounded-md border px-1 py-2 transition-colors ${
                    seasoning
                      ? `border-accent/40 bg-accent-soft ${swappableSlots[i] ? "cursor-pointer hover:border-accent hover:bg-accent-soft-hover" : "cursor-default"}`
                      : "border-dashed border-border bg-bg-base/60"
                  }`}
                >
                  <span aria-hidden="true" className="absolute left-1.5 top-1 font-mono text-xs text-text-muted">{i + 1}</span>
                  {seasoning ? <ItemIcon item={seasoning} size={28} /> : <span aria-hidden="true" className="text-lg text-text-muted">+</span>}
                  <span aria-hidden="true" className="text-xs text-text-secondary">{!seasoning ? "Empty" : swappableSlots[i] ? "Cycle" : "Set"}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-text-muted">
              {slots.some(Boolean) ? "Cycle an available slot to try another seasoning. Cards below stay in sync." : "Choose a Pokémon to fill these slots with recommended seasonings."}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-md border border-accent/20 bg-accent-soft px-3 py-2">
        {mode.id === "bait" ? <Fish size={20} className="shrink-0 text-accent" aria-hidden="true" /> : <TbCakeRoll size={20} className="shrink-0 text-accent" aria-hidden="true" />}
        <div><p className="text-xs font-semibold text-text-primary">{mode.productName}</p><p className="font-mono text-xs text-text-muted">{mode.yieldNote}</p></div>
      </div>
    </section>
  );
}

export default function CampfireKitchen() {
  useEffect(() => {
    document.title = "Campfire Kitchen | CobbleToolkit";
  }, []);

  const { listLoading, listError, searchNames, fetchDetail } = usePokedexSearch();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
    const [activeSuggestion, setActiveSuggestion] = useState(-1);
    const [searchOpen, setSearchOpen] = useState(false);
    const searchId = useId();
    const searchRef = useRef(null);
    const listboxId = `${searchId}-suggestions`;
    const suggestionsOpen = searchOpen && suggestions.length > 0;
  const [selectedSlug, setSelectedSlug] = useState(null);

  const [target, setTarget] = useState(null);
  const [targetLoading, setTargetLoading] = useState(false);
  const [targetError, setTargetError] = useState(null);
    const selectionSequence = useRef(0);

    useEffect(() => () => { selectionSequence.current += 1; }, []);

  const [rarityBucket, setRarityBucket] = useState("uncommon");
  const [goal, setGoal] = useState("balanced");
  const [cookingMode, setCookingMode] = useState("snack");
  const mode = COOKING_MODES[cookingMode] || COOKING_MODES.snack;

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    setSuggestions(searchNames(query, 20));
  }, [query, searchNames]);

    useEffect(() => {
      if (suggestionsOpen && activeSuggestion >= 0) {
        document.getElementById(`${listboxId}-${activeSuggestion}`)?.scrollIntoView({ block: "nearest" });
      }
    }, [activeSuggestion, suggestionsOpen, listboxId]);

  const handleSelect = async (slug) => {
    setSearchOpen(false);
        setActiveSuggestion(-1);
        setSelectedSlug(slug);
    setQuery("");
    setSuggestions([]);
    setTarget(null);
    setTargetError(null);
    setTargetLoading(true);
    await runLatestRequest(selectionSequence, () => fetchDetail(slug), {
      onSuccess: (detail) => setTarget({
        ...detail,
        evYield: resolveEvYield(slug, detail.evYield),
      }),
      onError: (err) => setTargetError(err.message || "Couldn't load that Pokémon."),
      onSettled: () => setTargetLoading(false),
    });
  };

  const result = useMemo(() => {
    if (!target) return null;
    return recommendSeasonings(target, rarityBucket, goal);
  }, [target, rarityBucket, goal]);

  // Per-slot editable state. Fixed slots (rarity/shiny/HA) stay as recommended.
  // Targeting slots store their own selected seasoning id so each card swaps
  // independently — never shifts sibling cards.
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    const recs = result?.recommendations ?? [];
    setSlots(
      recs.map((rec) => ({
        ...rec,
        // For targeting slots, track the active choice by id so the user can
        // cycle without losing the original recommendation.
        selectedId: rec.seasoning?.id ?? null,
      }))
    );
  }, [result]);

  const targetingPool = result?.targetingPool ?? [];

  const resolveSlot = (slot) => {
    if (!slot) return null;
    if (slot.slotKind !== "targeting") return slot;
    const fromPool = targetingPool.find((c) => c.seasoning?.id === slot.selectedId);
    if (fromPool) {
      return {
        ...slot,
        seasoning: fromPool.seasoning,
        reason: fromPool.reason,
      };
    }
    return slot;
  };

  const resolvedSeasonings = useMemo(
    () => slots.map((s) => resolveSlot(s)?.seasoning ?? null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slots, targetingPool]
  );


  const canSwap = (slotIndex) =>
    getSeasoningAlternatives(slots, targetingPool, slotIndex).length > 0;

  const handleSwap = (slotIndex) => {
    setSlots((prev) => cycleSeasoningSlot(prev, targetingPool, slotIndex));
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="dex-console">
        <div className="dex-screen p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-accent">
            <span className="uppercase tracking-widest">Recipes & seasonings</span>
            <span role="status">{targetLoading ? "Looking up species…" : targetError || listError ? "Could not load species" : result ? "Recipe ready" : "Choose a Pokémon"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-soft text-accent">
              <Flame size={16} />
            </div>
            <h1 data-route-title className="text-xl font-semibold text-text-primary">
              Campfire Kitchen
            </h1>
          </div>
          <p className="mt-1 text-sm text-text-secondary max-w-2xl">
            Pick a Pokémon to find seasonings for{" "}
            <strong className="font-medium text-text-primary">Poké Snacks</strong>{" "}
            or fishing <strong className="font-medium text-text-primary">Poké Bait</strong>.
            Both use the same seasonings with different base ingredients.
          </p>
          <p className="mt-3 border-t border-border pt-3 font-mono text-sm text-text-muted">No datapack needed. Species details come from the online Pokédex.</p>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside aria-label="Recipe settings" className="min-w-0 rounded-lg border border-border bg-bg-surface p-4 lg:sticky lg:top-36">
                  <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-accent">Recipe settings</h2>
          <div className="flex flex-col gap-4 divide-y divide-border">
        <div>
          <p className="mb-2 text-xs font-semibold text-text-muted">
            <span aria-hidden="true" className="mr-2 font-mono text-accent">01</span> Product
          </p>
          <Tabs
            ariaLabel="Product"
                        tabs={COOKING_MODE_TABS}
            active={cookingMode}
            onChange={setCookingMode}
          />
        </div>

            <section className="flex flex-col gap-3 pt-4">
          <label htmlFor={searchId} className="text-xs font-semibold text-text-muted">
            <span aria-hidden="true" className="mr-2 font-mono text-accent">02</span> Species
          </label>
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              id={searchId}
              ref={searchRef}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={suggestionsOpen}
              aria-controls={listboxId}
              aria-activedescendant={suggestionsOpen && activeSuggestion >= 0 && activeSuggestion < suggestions.length ? `${listboxId}-${activeSuggestion}` : undefined}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveSuggestion(-1);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  setSearchOpen(false);
                  setActiveSuggestion(-1);
                } else if ((event.key === "ArrowDown" || event.key === "ArrowUp") && suggestions.length) {
                  event.preventDefault();
                  setSearchOpen(true);
                  setActiveSuggestion((current) => event.key === "ArrowDown"
                    ? (current + 1) % suggestions.length
                    : (current <= 0 ? suggestions.length - 1 : current - 1));
                } else if (event.key === "Enter" && suggestionsOpen && suggestions[activeSuggestion]) {
                  event.preventDefault();
                  handleSelect(suggestions[activeSuggestion]);
                }
              }}
              placeholder={
                listLoading ? "Loading Pokédex…" : "Search for a Pokémon…"
              }
              disabled={listLoading || Boolean(listError)}
              className="w-full rounded-md border border-border bg-bg-surface-2 py-3 pl-9 pr-12 text-base sm:text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none disabled:opacity-50"
            />
            {query && (
              <button
                type="button"
                                aria-label="Clear species search"
                                onClick={() => {
                                  setQuery("");
                                  setSuggestions([]);
                                  setActiveSuggestion(-1);
                                  searchRef.current?.focus();
                                }}
                className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-text-muted hover:text-text-primary"
              >
                <X size={14} />
              </button>
            )}

            {suggestionsOpen && (
              <div id={listboxId} role="listbox" aria-label="Species suggestions" className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-border bg-bg-surface shadow-xl">
                {suggestions.map((name, index) => (
                  <button
                    key={name}
                    id={`${listboxId}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={activeSuggestion === index}
                    tabIndex={-1}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActiveSuggestion(index)}
                    onClick={() => handleSelect(name)}
                    className={`block w-full px-3 py-2 text-left text-sm capitalize text-text-primary hover:bg-bg-surface-2 ${activeSuggestion === index ? "bg-accent-soft text-accent" : ""}`}
                  >
                    {name.replace(/-/g, " ")}
                  </button>
                ))}
              </div>
            )}
          </div>

          {listError && (
            <p className="flex items-center gap-1.5 text-xs text-danger">
              <AlertTriangle size={12} /> {listError}
            </p>
          )}

          {targetLoading && (
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <Loader2 size={13} className="animate-spin" /> Loading species
              data…
            </div>
          )}
          {targetError && (
            <p className="flex items-center gap-1.5 text-xs text-danger">
              <AlertTriangle size={12} /> {targetError}
            </p>
          )}

          {target && !targetLoading && (
            <div className="flex items-center gap-3 rounded-md border border-accent/25 bg-accent-soft p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={target.sprite}
                alt={target.name}
                width={48}
                height={48}
                style={{ imageRendering: "pixelated" }}
              />
              <div className="min-w-0">
                <p className="break-words text-base font-semibold text-text-primary">
                  {target.name}
                  {target.isHighRarity && (
                    <Badge tone="accent" className="ml-2 align-middle">
                      Legendary/Mythical
                    </Badge>
                  )}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  {target.types.map((t) => (
                    <TypeBadge key={t} type={t} />
                  ))}
                  <span className="text-xs">
                    <EvYieldDisplay evYield={target.evYield} />
                  </span>
                </div>
              </div>
            </div>
          )}
            </section>
            {selectedSlug && (
              <section className="flex flex-col gap-4 pt-4">
            <div>
              <p className="mb-2 text-xs font-semibold text-text-muted">
                <span aria-hidden="true" className="mr-2 font-mono text-accent">03</span> Target rarity
              </p>
              <Tabs
                ariaLabel="Target rarity"
                                tabs={RARITY_BUCKETS.map((b) => ({ id: b.id, label: b.label }))}
                active={rarityBucket}
                onChange={setRarityBucket}
              />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold text-text-muted">
                <span aria-hidden="true" className="mr-2 font-mono text-accent">04</span> Goal <span className="text-text-muted normal-case">(optional)</span>
              </p>
              <Tabs
                ariaLabel="Goal"
                                tabs={GOALS.map((g) => ({ id: g.id, label: g.label }))}
                active={goal}
                onChange={setGoal}
              />
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {GOALS.find((g) => g.id === goal)?.description}
              </p>
            </div>
              </section>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-5">
        <section aria-label="Base recipe" className="min-w-0 rounded-xl border border-border bg-bg-surface p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1 flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {cookingMode === "bait" ? (
                  <Fish size={14} className="text-accent shrink-0" />
                ) : (
                  <TbCakeRoll size={14} className="text-accent shrink-0" />
                )}
                <h2 className="text-sm font-semibold text-text-primary">
                  {mode.productName}
                </h2>
                <Badge tone="neutral">{mode.yieldNote}</Badge>
              </div>
              <p className="text-sm leading-relaxed text-text-secondary">
                {mode.blurb}
              </p>
              <ul className="flex flex-col gap-1">
                {mode.tips.map((tip) => (
                  <li
                    key={tip}
                    className="flex items-start gap-1.5 text-sm text-text-muted"
                  >
                    <Info size={11} className="mt-0.5 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
              <div className="mt-3 border-t border-border pt-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Ingredients for one cook</h3>
                <ul className="grid gap-2 xl:grid-cols-2">
                  {mode.ingredients.map((ingredient) => (
                    <li key={ingredient.id} className="flex items-center gap-2 rounded-md border border-border bg-bg-surface-2 px-3 py-2 text-xs">
                      <ItemIcon item={ingredient} size={24} />
                      <span className="min-w-0 flex-1 text-text-secondary">{ingredient.name}</span>
                      <span className="font-mono font-semibold text-accent">×{ingredient.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="w-full min-w-0 shrink-0 sm:w-auto sm:pt-0.5">
              <CampfirePotPanel
                mode={mode}
                seasonings={resolvedSeasonings}
                swappableSlots={slots.map((_, i) => canSwap(i))}
                onSeasoningClick={handleSwap}
              />
            </div>
          </div>

        </section>
      {/* Seasoning plan */}
      {!selectedSlug && (
        <EmptyState
          icon={Sparkles}
          title="Search for a species to get started"
          description="Choose a Pokémon and target rarity in settings to see seasonings."
        />
      )}

      {result && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Recommended seasonings</h2>
              <p className="mt-1 text-xs text-text-secondary">{target.name} · {RARITY_BUCKETS.find((bucket) => bucket.id === rarityBucket)?.label} · {GOALS.find((entry) => entry.id === goal)?.label}</p>
            </div>
            <button type="button" onClick={() => setSlots((result?.recommendations ?? []).map((rec) => ({ ...rec, selectedId: rec.seasoning?.id ?? null })))} className="flex min-h-10 items-center gap-2 rounded-md border border-border bg-bg-surface px-3 py-2 text-xs text-accent transition-colors hover:border-accent">
              <RefreshCw size={13} aria-hidden="true" /> Restore recommendations
            </button>
          </div>

          <div className="flex flex-col gap-3">
              {slots.length === 0 ? (
                <EmptyState
                  icon={AlertTriangle}
                  title="No confident recommendation"
                  description="Try a different goal, or check this species' data."
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-3">
                  {slots.map((rawSlot, i) => {
                    const slot = resolveSlot(rawSlot);
                    const { seasoning, reason } = slot;
                    const swappable = canSwap(i);
                    return (
                      <Card
                        key={`slot-${i}`}
                        role={swappable ? "button" : undefined}
                        tabIndex={swappable ? 0 : undefined}
                        onClick={swappable ? () => handleSwap(i) : undefined}
                        onKeyDown={
                          swappable
                            ? (e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  handleSwap(i);
                                }
                              }
                            : undefined
                        }
                        className={
                          swappable
                            ? "min-w-0 cursor-pointer border-t-2 border-t-accent transition-colors hover:border-accent/60"
                            : "min-w-0 border-t-2 border-t-border-hover"
                        }
                      >
                        <CardBody className="seasoning-swap flex flex-col gap-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs uppercase tracking-wider text-text-muted">
                            <span>Slot {i + 1}</span><span className={swappable ? "text-accent" : ""}>{swappable ? "Swappable" : "Recommended"}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <ItemIcon item={seasoning} />
                            <div className="min-w-0">
                              <p className="break-words text-base font-semibold text-accent">
                                {seasoning.name}
                              </p>
                              <p className="text-sm leading-relaxed text-text-secondary">
                                {seasoning.effect}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm leading-relaxed text-text-secondary">
                            {reason}
                          </p>
                          {swappable && (
                            <p className="text-xs font-medium text-accent">
                              Tap card or pot slot to cycle this seasoning
                            </p>
                          )}
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>
              )}

              {result.notes.length > 0 && (
                <div className="flex flex-col gap-1.5 rounded-md border border-border bg-bg-surface-2 p-3">
                  {result.notes.map((note, i) => (
                    <p
                      key={i}
                      className="flex items-start gap-1.5 text-sm text-text-secondary"
                    >
                      <Info size={12} className="mt-0.5 shrink-0 text-text-muted" />
                      {note}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-muted">
                <span className="flex items-center gap-1">
                  <Youtube size={12} className="shrink-0" />
                  Want a video walkthrough? Check out
                </span>
                {SNACK_TUTORIAL_CREATORS.map((creator, i) => (
                  <span key={creator.url} className="flex items-center gap-1">
                    <a
                      href={creator.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-accent hover:underline"
                    >
                      {creator.name}
                    </a>
                    {i < SNACK_TUTORIAL_CREATORS.length - 1 && <span>·</span>}
                  </span>
                ))}
              </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
