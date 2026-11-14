"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import DataTable from "@/components/ui/DataTable";
import { formatPokemonName, matchesSearch } from "@/utils/nameUtils";

const EMPTY_REPORTS = [];

export default function ItemDropBrowser({ reports = EMPTY_REPORTS, onSelectSpecies }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [source, setSource] = useState("");
  const [view, setView] = useState(null);
  const [narrow, setNarrow] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const compactRef = useRef(null);
  const detailHeadingRef = useRef(null);
  const detailTriggerRef = useRef(null);
  const focusRequestedRef = useRef(false);
  const searchRef = useRef(null);
  const remProbeRef = useRef(null);
  const [summarySize, setSummarySize] = useState(128);

  useEffect(() => {
    const probe = remProbeRef.current;
    const update = () => setSummarySize(Math.max(112, Math.ceil(probe.getBoundingClientRect().height * 8)));
    const observer = new ResizeObserver(update);
    observer.observe(probe);
    update();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const update = () => setNarrow(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const compact = view ? view === "compact" : narrow;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const sources = useMemo(
    () => reports.map((report, index) => ({
      value: String(report.id ?? report.sharedFileId ?? index),
      label: `${report.name || "Unnamed pack"} (report ${index + 1})`,
    })),
    [reports]
  );

  // Keep source selection attached to its archive as reports are added or removed.
  useEffect(() => {
    if (source && !sources.some((pack) => pack.value === source)) setSource("");
  }, [source, sources]);

  // Entry indexes preserve repeated drops within each report.
  const rows = useMemo(
    () => reports.flatMap((report, reportIndex) =>
      (report.data ?? []).flatMap((entry, entryIndex) =>
        (entry.drops ?? []).map((drop, dropIndex) => ({
          id: `${sources[reportIndex].value}-${entryIndex}-${dropIndex}`,
          item: drop.item,
          pokemon: entry.name,
          quantity:
            typeof drop.quantity === "string"
              ? drop.quantity
              : Array.isArray(drop.quantity)
              ? `${drop.quantity[0]}–${drop.quantity[1]}`
              : String(drop.quantity ?? 1),
          chance: drop.chance ?? null,
          source: sources[reportIndex].value,
          sourceLabel: sources[reportIndex].label,
        }))
      )
    ),
    [reports, sources]
  );

  const filteredRows = useMemo(
    () => rows.filter((row) =>
      (source === "" || row.source === source) &&
      matchesSearch(debouncedSearch, row.item)
    ),
    [rows, source, debouncedSearch]
  );
  const expanded = filteredRows.find((row) => row.id === expandedId);
  const compactVirtualizer = useVirtualizer({
    count: filteredRows.length,
    getScrollElement: () => compactRef.current,
    estimateSize: () => summarySize,
    overscan: 8,
    enabled: compact,
  });

  useEffect(() => {
    compactVirtualizer.measure();
  }, [summarySize, compactVirtualizer]);

  useEffect(() => {
    if (focusRequestedRef.current) {
      detailHeadingRef.current?.focus();
      focusRequestedRef.current = false;
    }
  }, [expandedId]);

  useEffect(() => {
    if (expandedId != null && !expanded) setExpandedId(null);
  }, [expandedId, expanded]);

  const closeDetail = () => {
    setExpandedId(null);
    const previous = detailTriggerRef.current;
    if (!previous) return;
    const list = compactRef.current;
    const index = filteredRows.findIndex((row) => row.id === previous.rowId);
    if (list) list.scrollTop = previous.listTop;
    if (index >= 0 && index !== previous.index) compactVirtualizer.scrollToIndex(index, { align: "start" });
    let attempts = 0;
    const restore = () => {
      const trigger = list && Array.from(list.querySelectorAll("[data-drop-id]")).find((node) => node.dataset.dropId === previous.rowId);
      if (!trigger && index >= 0 && attempts++ < 10) {
        if (attempts === 3) compactVirtualizer.scrollToIndex(index, { align: "auto" });
        requestAnimationFrame(restore);
        return;
      }
      (trigger || list || searchRef.current)?.focus({ preventScroll: true });
      window.scrollTo({ top: previous.pageY, behavior: "instant" });
    };
    requestAnimationFrame(restore);
  };

  const uniqueItemCount = useMemo(
    () => new Set(filteredRows.map((row) => row.item)).size,
    [filteredRows]
  );

  const columns = useMemo(() => [
    {
      key: "item",
      label: "Item",
      width: 260,
      render: (row) => (
        <span title={row.item} className="block truncate font-mono text-xs">{row.item}</span>
      ),
    },
    {
      key: "pokemon",
      label: "Pokémon",
      width: 200,
      wrap: true,
      render: (row) => (
        <button
          type="button"
          onClick={(event) => onSelectSpecies(row.pokemon, event.currentTarget)}
          className="min-h-11 min-w-0 rounded text-left text-accent hover:underline focus-visible:outline-2 focus-visible:outline-accent"
        >
          {formatPokemonName(row.pokemon)}
        </button>
      ),
    },
    { key: "quantity", label: "Quantity", width: 100 },
    {
      key: "chance",
      label: "Chance",
      width: 110,
      sortValue: (row) => row.chance == null ? null : Number(row.chance),
      render: (row) => row.chance != null ? (
        <span className="rounded bg-accent-soft px-1.5 py-0.5 text-accent">{row.chance}%</span>
      ) : (
        <span className="text-text-secondary" title="Chance not specified">Not specified</span>
      ),
    },
    {
      key: "sourceLabel",
      label: "Source pack",
      width: 260,
      render: (row) => (
        <span title={row.sourceLabel} className="block truncate">{row.sourceLabel}</span>
      ),
    },
  ], [onSelectSpecies]);

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSource("");
  };

  return (
    <section aria-label="Item drop browser" className="min-w-0 space-y-4 rounded-lg border border-border bg-bg-surface p-4">
      <span ref={remProbeRef} aria-hidden="true" style={{ position: "absolute", width: "1rem", height: "1rem", visibility: "hidden", pointerEvents: "none" }} />
      <div>
        <h2 className="text-base font-semibold text-text-primary">Item drop finder</h2>
        <p className="mt-1 text-sm leading-relaxed text-text-secondary">Find item drops by name or ID. Select a Pokémon to open its loot table.</p>
      </div>
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-xs text-text-secondary">
          Search item drops
          <input
            ref={searchRef}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search item IDs…"
            className="min-h-11 min-w-0 w-full rounded-md border border-border bg-bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
        </label>
        <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-xs text-text-secondary">
          Source pack
          <select
            value={source}
            onChange={(event) => setSource(event.target.value)}
            className="min-h-11 min-w-0 w-full rounded-md border border-border bg-bg-surface-2 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
          >
            <option value="">All source packs</option>
            {sources.map((pack) => (
              <option key={pack.value} value={pack.value}>{pack.label}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={clearFilters}
          disabled={!search && !debouncedSearch && source === ""}
          className="min-h-11 shrink-0 rounded-md border border-border px-3 py-2 text-xs text-accent hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-default disabled:opacity-40"
        >
          Clear filters
        </button>
      </div>

      <div role="group" aria-label="Item drop layout" className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={compact} onClick={() => setView("compact")} className="min-h-11 rounded-md border border-border px-3 text-sm text-accent hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-accent">Compact view</button>
        <button type="button" aria-pressed={!compact} onClick={() => setView("full")} className="min-h-11 rounded-md border border-border px-3 text-sm text-accent hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-accent">Full table</button>
      </div>
      <p role="status" className="text-xs text-text-secondary">
        {filteredRows.length} of {rows.length} drop entries matched · {uniqueItemCount} unique items in matches
      </p>
      <p className="text-sm leading-relaxed text-text-secondary">
        Missing chance does not mean a guaranteed drop. Duplicate drops and sources are kept. Pack priority is not applied.
      </p>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-border bg-bg-surface-2 p-6 text-center">
          <h3 className="text-sm font-medium text-text-primary">No item drops found</h3>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">
            Upload a datapack with species drop tables to browse items.
          </p>
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="rounded-lg border border-border bg-bg-surface-2 p-6 text-center">
          <h3 className="text-sm font-medium text-text-primary">No matching item drops</h3>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">
            Try another item ID or source pack, or clear filters.
          </p>
        </div>
      ) : compact ? (
        <div ref={compactRef} tabIndex={-1} role="region" aria-label="Compact item drops" className="max-h-[65vh] min-w-0 overflow-y-auto rounded-lg border border-border">
          <div className="relative w-full" style={{ height: compactVirtualizer.getTotalSize() }}>
            {compactVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = filteredRows[virtualRow.index];
              return (
                <div key={row.id} className="absolute left-0 top-0 w-full min-w-0 border-b border-border px-3 py-2" style={{ height: virtualRow.size, transform: `translateY(${virtualRow.start}px)` }}>
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="min-w-0 flex-1 truncate font-mono text-xs text-text-primary" title={row.item}>{row.item}</span>
                    <span className="min-w-0 max-w-[50%] truncate text-xs text-accent">{row.chance == null ? "Not specified" : `${row.chance}%`}</span>
                  </div>
                  <span className="block truncate text-sm text-text-secondary">{formatPokemonName(row.pokemon)}</span>
                  <button type="button" data-drop-id={row.id} aria-label={`Drop details for ${row.item} from ${formatPokemonName(row.pokemon)}`} aria-expanded={expandedId === row.id} onClick={() => {
                                      detailTriggerRef.current = { rowId: row.id, index: virtualRow.index, listTop: compactRef.current?.scrollTop ?? 0, pageY: window.scrollY };
                                      focusRequestedRef.current = true;
                                      if (expandedId === row.id) {
                                        detailHeadingRef.current?.focus();
                                        focusRequestedRef.current = false;
                                      } else setExpandedId(row.id);
                                    }} className="block min-h-11 w-full truncate rounded text-left text-sm text-accent hover:underline focus-visible:outline-2 focus-visible:outline-accent">View drop details</button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <DataTable
          virtualized
          rowHeight={60}
          rows={filteredRows}
          columns={columns}
          getRowKey={(row) => row.id}
          className="min-w-0 w-full"
        />
      )}
      {compact && expanded && (
        <section aria-label="Selected drop details" className="min-w-0 border-t border-border pt-4">
          <h3 ref={detailHeadingRef} tabIndex={-1} className="break-all font-mono text-sm font-semibold text-text-primary focus-visible:outline-2 focus-visible:outline-accent">{expanded.item}</h3>
          <dl className="mt-3 space-y-2 break-words text-sm text-text-secondary">
            <div><dt>Pokémon</dt><dd><button type="button" onClick={(event) => onSelectSpecies(expanded.pokemon, event.currentTarget)} className="min-h-11 rounded text-left text-accent hover:underline focus-visible:outline-2 focus-visible:outline-accent">{formatPokemonName(expanded.pokemon)}</button></dd></div>
            <div><dt>Quantity</dt><dd>{expanded.quantity}</dd></div>
            <div><dt>Chance</dt><dd>{expanded.chance == null ? "Not specified" : `${expanded.chance}%`}</dd></div>
            <div><dt>Source pack</dt><dd className="break-all">{expanded.sourceLabel}</dd></div>
          </dl>
          <button type="button" onClick={closeDetail} className="mt-3 min-h-11 rounded-md border border-border px-3 text-sm text-accent hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-accent">Back to item drops</button>
        </section>
      )}
    </section>
  );
}
