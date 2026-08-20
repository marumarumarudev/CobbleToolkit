"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  Loader2,
  AlertTriangle,
  Sparkles,
  Info,
  RefreshCw,
} from "lucide-react";
import { usePokedexSearch } from "@/hooks/usePokedexSearch";
import { recommendSeasonings, RARITY_BUCKETS, GOALS } from "@/utils/pokesnackMatcher";
import { MC_ITEM_GALLERY_VERSION } from "@/data/baitSeasoningData";
import { withBasePath } from "@/utils/basePath";
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

function resolveIconSources(item) {
  const sources = [];
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

function ItemIcon({ item, size = 36 }) {
  const sources = useMemo(() => resolveIconSources(item), [item]);
  const [sourceIndex, setSourceIndex] = useState(0);
  useEffect(() => setSourceIndex(0), [item]);
  const src = sources[sourceIndex];

  if (!src) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-md bg-bg-surface-2 border border-border"
        style={{ width: size, height: size, fontSize: size * 0.5 }}
        title={item.name}
      >
        {item.emoji || "🍓"}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={item.name}
      title={item.name}
      width={size}
      height={size}
      onError={() => setSourceIndex((i) => i + 1)}
      className="shrink-0 rounded-md border border-border bg-bg-surface-2"
      style={{ imageRendering: "pixelated" }}
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

function formatEvYield(evYield) {
  const nonZero = (evYield || []).filter((ev) => ev.amount);
  if (nonZero.length === 0) return "No EV yield";
  return nonZero
    .map((ev) => `+${ev.amount} ${EV_STAT_LABELS[ev.stat] || ev.stat}`)
    .join(", ");
}

function TypeBadge({ type }) {
  return (
    <span
      className="rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold text-white"
      style={{ backgroundColor: TYPE_COLORS[type] || "#777" }}
    >
      {type}
    </span>
  );
}

export default function PokesnackMaker() {
  useEffect(() => {
    document.title = "Pokésnack Maker | CobbleToolkit";
  }, []);

  const { listLoading, listError, searchNames, fetchDetail } = usePokedexSearch();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState(null);

  const [target, setTarget] = useState(null);
  const [targetLoading, setTargetLoading] = useState(false);
  const [targetError, setTargetError] = useState(null);

  const [rarityBucket, setRarityBucket] = useState("uncommon");
  const [goal, setGoal] = useState("balanced");

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    setSuggestions(searchNames(query, 8));
  }, [query, searchNames]);

  const handleSelect = async (slug) => {
    setSelectedSlug(slug);
    setQuery("");
    setSuggestions([]);
    setTarget(null);
    setTargetError(null);
    setTargetLoading(true);
    try {
      const detail = await fetchDetail(slug);
      setTarget({
        ...detail,
        evYield: resolveEvYield(slug, detail.evYield),
      });
    } catch (err) {
      setTargetError(err.message || "Couldn't load that Pokémon.");
    } finally {
      setTargetLoading(false);
    }
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

  const canSwap = (slotIndex) => {
    const slot = slots[slotIndex];
    if (!slot || slot.slotKind !== "targeting") return false;
    return targetingPool.length > 1;
  };

  // Advance ONLY this card to the next pool option. Other cards are untouched.
  // Options already shown on sibling targeting cards are skipped when possible
  // so you don't get accidental duplicates, but if every other option is taken
  // we still allow cycling the full pool so nothing ever gets stuck.
  const handleSwap = (slotIndex) => {
    const slot = slots[slotIndex];
    if (!slot || slot.slotKind !== "targeting" || targetingPool.length < 2) return;

    const occupiedElsewhere = new Set(
      slots
        .map((s, i) =>
          i !== slotIndex && s.slotKind === "targeting" ? s.selectedId : null
        )
        .filter(Boolean)
    );

    const currentIdx = Math.max(
      0,
      targetingPool.findIndex((c) => c.seasoning?.id === slot.selectedId)
    );

    // Prefer next unused option; fall back to plain next in pool.
    let nextId = null;
    for (let step = 1; step <= targetingPool.length; step++) {
      const candidate = targetingPool[(currentIdx + step) % targetingPool.length];
      const id = candidate?.seasoning?.id;
      if (!id) continue;
      if (!occupiedElsewhere.has(id) || step === targetingPool.length) {
        nextId = id;
        if (!occupiedElsewhere.has(id)) break;
      }
    }
    if (!nextId) return;

    setSlots((prev) =>
      prev.map((s, i) => (i === slotIndex ? { ...s, selectedId: nextId } : s))
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-soft text-accent">
            <TbCakeRoll size={16} />
          </div>
          <h1 className="text-xl font-semibold text-text-primary">
            Pokésnack Maker
          </h1>
        </div>
        <p className="mt-1 text-sm text-text-secondary">
          Pick a species and a target rarity — get up to 3 seasonings adapted
          to that target, not just a generic combo.
        </p>
      </header>

      {/* Step 1: species */}
      <Card>
        <CardBody className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            1. Species
          </p>
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                listLoading ? "Loading Pokédex…" : "Search for a Pokémon…"
              }
              disabled={listLoading || Boolean(listError)}
              className="w-full rounded-md border border-border bg-bg-surface-2 py-2 pl-9 pr-8 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none disabled:opacity-50"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X size={14} />
              </button>
            )}

            {suggestions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-bg-surface shadow-xl">
                {suggestions.map((name) => (
                  <button
                    key={name}
                    onClick={() => handleSelect(name)}
                    className="block w-full px-3 py-2 text-left text-sm capitalize text-text-primary hover:bg-bg-surface-2"
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
            <div className="flex items-center gap-3 rounded-md border border-border bg-bg-surface-2 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={target.sprite}
                alt={target.name}
                width={48}
                height={48}
                style={{ imageRendering: "pixelated" }}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-primary">
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
                  <span className="text-[11px] text-text-muted">
                    {formatEvYield(target.evYield)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Step 2 + 3: rarity + goal */}
      {selectedSlug && (
        <Card>
          <CardBody className="flex flex-col gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                2. Target rarity bucket
              </p>
              <Tabs
                tabs={RARITY_BUCKETS.map((b) => ({ id: b.id, label: b.label }))}
                active={rarityBucket}
                onChange={setRarityBucket}
              />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                3. Goal <span className="text-text-muted normal-case">(optional)</span>
              </p>
              <Tabs
                tabs={GOALS.map((g) => ({ id: g.id, label: g.label }))}
                active={goal}
                onChange={setGoal}
              />
              <p className="mt-1.5 text-[11px] text-text-muted">
                {GOALS.find((g) => g.id === goal)?.description}
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Step 4: results */}
      {!selectedSlug && (
        <EmptyState
          icon={Sparkles}
          title="Search for a species to get started"
          description="Pick a Pokémon above, then choose a target rarity to see recommended seasonings."
        />
      )}

      {result && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            4. Recommended seasonings
          </p>

          {slots.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title="No confident recommendation"
              description="Try a different goal, or double-check this species' data."
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
                    title={
                      swappable
                        ? "Click to swap this card for another valid option"
                        : undefined
                    }
                    className={
                      swappable
                        ? "group relative cursor-pointer transition-colors duration-150 hover:border-accent/50 hover:bg-bg-surface-2 focus-visible:border-accent"
                        : "relative"
                    }
                  >
                    {swappable && (
                      <span className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-bg-surface-2 text-text-muted opacity-70 transition-opacity duration-150 group-hover:opacity-100">
                        <RefreshCw size={12} />
                      </span>
                    )}
                    <CardBody
                      key={seasoning?.id}
                      className="seasoning-swap flex flex-col gap-2.5"
                    >
                      <div className="flex items-center gap-2.5 pr-6">
                        <ItemIcon item={seasoning} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-accent">
                            {seasoning.name}
                          </p>
                          <p className="text-[11px] text-text-muted">
                            {seasoning.effect}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed text-text-secondary">
                        {reason}
                      </p>
                      {swappable && (
                        <p className="text-[10px] font-medium text-accent">
                          Tap to swap this card only
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
                  className="flex items-start gap-1.5 text-[11px] text-text-secondary"
                >
                  <Info size={12} className="mt-0.5 shrink-0 text-text-muted" />
                  {note}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
