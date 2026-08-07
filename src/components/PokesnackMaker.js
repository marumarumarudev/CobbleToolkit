"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Loader2,
  AlertTriangle,
  ChefHat,
  Info,
  Copy,
  Check,
  HelpCircle,
} from "lucide-react";
import { usePokedexSearch } from "@/hooks/usePokedexSearch";
import { buildBestCombo } from "@/utils/pokesnackMatcher";
import { buildSpeciesTips, GENERAL_SNACK_TIPS } from "@/utils/huntingTips";
import {
  MC_ITEM_GALLERY_VERSION,
  EV_YIELD_BERRIES,
} from "@/data/baitSeasoningData";
import { withBasePath } from "@/utils/basePath";

// ── EV stat label map ─────────────────────────────────────────────────────────
// PokeAPI can return stat names in several formats depending on the endpoint
// and caching state. This map covers ALL known variants so the display label
// always resolves correctly regardless of what the hook returns.
const EV_STAT_LABELS = {
  // Normalized (underscore + British) — what our hook should produce
  hp:              "HP",
  attack:          "Attack",
  defence:         "Defense",
  special_attack:  "Sp. Atk",
  special_defence: "Sp. Def",
  speed:           "Speed",
  // Raw PokeAPI (hyphen + American) — fallback if cache has old data
  defense:         "Defense",
  "special-attack":  "Sp. Atk",
  "special-defense": "Sp. Def",
};

// ── Per-species EV yield overrides ────────────────────────────────────────────
// Hardcoded corrections for Pokémon where PokeAPI data or caching produces
// the wrong result. Format matches target.evYield: [{stat, amount}].
// stat must use the normalized format (underscore + British spelling) so it
// matches EV_YIELD_BERRIES entries in baitSeasoningData.
const EV_YIELD_OVERRIDES = {
  "ursaluna-bloodmoon": [{ stat: "special_attack", amount: 3 }],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getEvLabel(stat) {
  return EV_STAT_LABELS[stat] ?? stat;
}

/**
 * Apply any hardcoded override for this Pokémon slug, then return the
 * (possibly corrected) evYield array. Leaves all other Pokémon unchanged.
 */
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
      `https://mcitemgallery.com/images/${MC_ITEM_GALLERY_VERSION}/${item.mcItemId}.png`,
    );
  }
  if (item.iconSlug) {
    sources.push(
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.iconSlug}.png`,
    );
  }
  return sources;
}

function ItemIcon({ item, size = 32 }) {
  const sources = useMemo(() => resolveIconSources(item), [item]);
  const [sourceIndex, setSourceIndex] = useState(0);
  useEffect(() => setSourceIndex(0), [item]);
  const src = sources[sourceIndex];
  if (!src) {
    return (
      <div
        className="flex items-center justify-center bg-[#8b8b8b] rounded-sm"
        style={{ width: size, height: size, fontSize: size * 0.55,
          boxShadow: "inset 2px 2px 0 #373737, inset -2px -2px 0 #ffffff" }}
        title={item.name}
      >
        {item.emoji || "🍓"}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={item.name} title={item.name} width={size} height={size}
      onError={() => setSourceIndex((i) => i + 1)}
      style={{ imageRendering: "pixelated" }} />
  );
}

function TypeBadge({ type }) {
  return (
    <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold text-white"
      style={{ backgroundColor: TYPE_COLORS[type] || "#777" }}>
      {type}
    </span>
  );
}

function SeasoningCard({ item, compact = false }) {
  if (!item) return null;
  return (
    <div className={`flex items-start gap-3 bg-[#1e1e1e] border border-[#333] rounded-lg ${compact ? "p-3" : "p-3.5"}`}>
      <ItemIcon item={item} size={compact ? 28 : 32} />
      <div className="min-w-0 flex-1">
        <div className="font-mono text-sm text-yellow-400 leading-snug wrap-break-word">{item.name}</div>
        <div className="text-xs text-gray-400 leading-snug mt-0.5">{item.effect}</div>
      </div>
    </div>
  );
}

function SlotCard({ slot, compact = false }) {
  if (!slot || slot.items.length === 0) return null;
  if (slot.items.length === 1) return <SeasoningCard item={slot.items[0]} compact={compact} />;
  return (
    <div className={`bg-[#1e1e1e] border border-[#333] rounded-lg ${compact ? "p-3" : "p-3.5"}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {slot.items.map((item, i) => (
          <div key={item.id} className="flex items-start gap-3 flex-1 min-w-0">
            <ItemIcon item={item} size={compact ? 28 : 32} />
            <div className="min-w-0 flex-1">
              <div className="font-mono text-sm text-yellow-400 leading-snug wrap-break-word">{item.name}</div>
              <div className="text-xs text-gray-400 leading-snug mt-0.5">{item.effect}</div>
            </div>
            {i < slot.items.length - 1 && (
              <span className="hidden sm:block text-gray-500 text-sm px-1 self-center">/</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CopyRecipeButton({ target, combo }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    const lines = [
      `${target.name} — Poké Snack seasoning combo`,
      ...combo.primary.map((slot) => `• ${slot.items.map((item) => item.name).join(" / ")}`),
    ];
    navigator.clipboard.writeText(lines.join("\n"))
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); })
      .catch(() => {});
  }
  return (
    <button onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-[#333] text-gray-400 hover:text-yellow-400 hover:border-yellow-500/50 transition-colors">
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied" : "Copy recipe"}
    </button>
  );
}

const RECENT_SEARCHES_KEY = "pokesnackMakerRecent";
const MAX_RECENT = 8;

export default function PokesnackMaker() {
  const { listLoading, listError, searchNames, fetchDetail, totalCount } = usePokedexSearch();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [target, setTarget] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [showGeneralTips, setShowGeneralTips] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 150);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setSuggestions(searchNames(debouncedQuery));
    setHighlightedIndex(-1);
  }, [debouncedQuery, searchNames]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setShowSuggestions(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { default: getStorage } = await import("@/utils/indexedDBStorage");
        const storage = getStorage();
        const prefs = await storage.loadPreferences(RECENT_SEARCHES_KEY);
        if (!cancelled && prefs?.recent) setRecentSearches(prefs.recent);
      } catch { /* non-fatal */ }
    })();
    return () => { cancelled = true; };
  }, []);

  async function saveRecentSearch(detail) {
    const entry = { slug: detail.slug, name: detail.name, sprite: detail.sprite };
    const next = [entry, ...recentSearches.filter((r) => r.slug !== entry.slug)].slice(0, MAX_RECENT);
    setRecentSearches(next);
    try {
      const { default: getStorage } = await import("@/utils/indexedDBStorage");
      await getStorage().savePreferences(RECENT_SEARCHES_KEY, { recent: next });
    } catch { /* non-fatal */ }
  }

  async function selectPokemon(name) {
    setShowSuggestions(false);
    setQuery("");
    setHighlightedIndex(-1);
    setDetailLoading(true);
    setDetailError(null);
    setShowReasoning(false);
    try {
      const detail = await fetchDetail(name);
      setTarget(detail);
      saveRecentSearch(detail);
    } catch (err) {
      setDetailError(err.message || "Something went wrong looking that up.");
    } finally {
      setDetailLoading(false);
    }
  }

  function handleInputKeyDown(e) {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlightedIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); const pick = suggestions[highlightedIndex] ?? suggestions[0]; if (pick) selectPokemon(pick); }
    else if (e.key === "Escape") setShowSuggestions(false);
  }

  // Resolve EV yield — applies hardcoded overrides for problem Pokémon
  const resolvedEvYield = useMemo(
    () => target ? resolveEvYield(target.slug, target.evYield) : [],
    [target]
  );

  const combo = useMemo(() => {
    if (!target) return null;
    return buildBestCombo({
      name:        target.name,
      types:       target.types,
      eggGroups:   target.eggGroups,
      isHighRarity: target.isHighRarity,
      evYield:     resolvedEvYield,  // use overridden EV yield
    });
  }, [target, resolvedEvYield]);

  const speciesTips = useMemo(() => (target ? buildSpeciesTips(target) : []), [target]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 font-mono">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
          <ChefHat size={22} /> Pokésnack Maker
        </h1>
        <p className="text-xs text-gray-400 mt-1.5">
          Pick a target Pokémon and get the best Bait Seasoning combo to attract it.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-3" ref={containerRef}>
        <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#333] rounded-lg px-3 py-2.5 focus-within:border-yellow-400 transition-colors">
          <Search size={16} className="text-gray-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            placeholder={listLoading ? "Loading Pokédex..." : `Search ${totalCount} Pokémon...`}
            disabled={listLoading}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleInputKeyDown}
            className="bg-transparent outline-none flex-1 text-sm text-white placeholder:text-gray-600"
          />
          {listLoading && <Loader2 size={16} className="animate-spin text-gray-500" />}
        </div>

        {listError && (
          <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
            <AlertTriangle size={14} /> Couldn&apos;t reach PokeAPI: {listError}
          </div>
        )}

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-[#1e1e1e] border border-[#333] rounded-lg shadow-xl max-h-72 overflow-y-auto">
            {suggestions.map((name, i) => (
              <button key={name} onClick={() => selectPokemon(name)}
                onMouseEnter={() => setHighlightedIndex(i)}
                className={`w-full text-left px-3 py-2 text-sm capitalize transition-colors ${
                  i === highlightedIndex ? "bg-[#2a2a2a] text-yellow-400" : "hover:bg-[#2a2a2a]"
                }`}>
                {name.replace(/-/g, " ")}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recently searched */}
      {recentSearches.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          <span className="text-[11px] text-gray-500 mr-1">Recent:</span>
          {recentSearches.map((r) => (
            <button key={r.slug} onClick={() => selectPokemon(r.slug)}
              className="flex items-center gap-1 pl-1 pr-2 py-0.5 rounded-full bg-[#1e1e1e] border border-[#333] hover:border-yellow-500/50 text-[11px] text-gray-300 hover:text-yellow-400 transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.sprite} alt="" className="w-4 h-4 object-contain" style={{ imageRendering: "pixelated" }} />
              {r.name}
            </button>
          ))}
        </div>
      )}

      {detailLoading && (
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
          <Loader2 size={16} className="animate-spin" /> Looking up Pokédex data...
        </div>
      )}

      {detailError && (
        <div className="flex items-center gap-2 text-red-400 text-sm mb-4">
          <AlertTriangle size={16} /> {detailError}
        </div>
      )}

      {target && combo && (
        <div className="space-y-5">
          {/* Target summary card */}
          <div className="flex items-center gap-3 bg-[#1e1e1e] border border-[#333] rounded-xl p-3.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={target.sprite} alt={target.name}
              className="w-14 h-14 object-contain shrink-0"
              style={{ imageRendering: "pixelated" }} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white">{target.name}</h2>
                {target.isLegendary && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-yellow-600/30 text-yellow-300 border border-yellow-600/50">Legendary</span>
                )}
                {target.isMythical && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-purple-600/30 text-purple-300 border border-purple-600/50">Mythical</span>
                )}
                {target.types.map((t) => <TypeBadge key={t} type={t} />)}
              </div>
              <div className="text-xs text-gray-400 mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                <span>Egg group{target.eggGroups.length > 1 ? "s" : ""}: {target.eggGroups.join(", ")}</span>
                {resolvedEvYield.length > 0 && (
                  <span>
                    EV yield:{" "}
                    {resolvedEvYield
                      .map((ev) => `${ev.amount} ${getEvLabel(ev.stat)}`)
                      .join(", ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid md:grid-cols-2 gap-5 items-start">
            <div>
              <div className="flex items-center justify-between flex-wrap gap-y-1.5 mb-3">
                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Recommended combo</h3>
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowReasoning((v) => !v)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-yellow-400 transition-colors">
                    <HelpCircle size={13} /> Why this combo?
                  </button>
                  <CopyRecipeButton target={target} combo={combo} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {combo.primary.map((slot, i) => <SlotCard key={i} slot={slot} compact />)}
              </div>

              {showReasoning && (
                <div className="bg-[#161616] border border-[#2a2a2a] rounded-lg p-2.5 mt-2 space-y-1.5">
                  {combo.primary.map((slot, i) => (
                    <div key={i} className="text-[11px] leading-snug">
                      <span className="text-yellow-400 font-semibold">
                        {slot.items.map((item) => item.name).join(" / ")}:
                      </span>{" "}
                      <span className="text-gray-400">{slot.reason}</span>
                    </div>
                  ))}
                </div>
              )}

              {combo.notes.length > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2.5 space-y-1 mt-2">
                  {combo.notes.map((note, i) => (
                    <div key={i} className="flex gap-1.5 text-[11px] text-blue-200">
                      <Info size={12} className="shrink-0 mt-0.5" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              )}

              {combo.alternates.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-2">Alternates</h3>
                  <div className="grid md:grid-cols-2 gap-2.5">
                    {combo.alternates.map((alt) => (
                      <div key={alt.label} className="bg-[#161616] border border-[#2a2a2a] rounded-lg p-2.5">
                        <div className="text-xs font-semibold text-yellow-400 mb-1.5">{alt.label}</div>
                        <div className="flex flex-col gap-1 mb-1.5">
                          {alt.combo.map((item) => (
                            <div key={item.id} className="flex items-center gap-1.5">
                              <ItemIcon item={item} size={22} />
                              <span className="text-[11px] text-gray-300">{item.name}</span>
                            </div>
                          ))}
                        </div>
                        <div className="text-[11px] text-gray-500 leading-snug">{alt.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-2">
                Tips for hunting {target.name}
              </h3>
              <div className="grid gap-2">
                {speciesTips.map((tip) => (
                  <div key={tip.title} className="bg-[#1e1e1e] border border-[#333] rounded-lg p-2.5">
                    <div className="text-xs text-yellow-400 font-semibold">{tip.title}</div>
                    <div className="text-xs text-gray-400 mt-1 leading-relaxed">{tip.body}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* General tips */}
      <div className="mt-7 border-t border-[#333] pt-4">
        <button onClick={() => setShowGeneralTips((v) => !v)}
          className="text-xs text-gray-400 hover:text-yellow-400 transition-colors py-1">
          {showGeneralTips ? "Hide" : "Show"} general Poké Snack placement &amp; effectiveness tips
        </button>
        {showGeneralTips && (
          <div className="grid md:grid-cols-2 gap-2 mt-3">
            {GENERAL_SNACK_TIPS.map((tip) => (
              <div key={tip.title} className="bg-[#1e1e1e] border border-[#333] rounded-lg p-2.5">
                <div className="text-xs text-yellow-400 font-semibold">{tip.title}</div>
                <div className="text-xs text-gray-400 mt-1 leading-relaxed">{tip.body}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
