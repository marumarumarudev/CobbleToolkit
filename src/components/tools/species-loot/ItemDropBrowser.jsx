"use client";

import { useEffect, useMemo, useState } from "react";
import DataTable from "@/components/ui/DataTable";
import { formatPokemonName, matchesSearch } from "@/utils/nameUtils";

const EMPTY_REPORTS = [];

export default function ItemDropBrowser({ reports = EMPTY_REPORTS, onSelectSpecies }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [source, setSource] = useState("");

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
          onClick={() => onSelectSpecies(row.pokemon)}
          className="min-w-0 rounded text-left text-accent hover:underline focus-visible:outline-2 focus-visible:outline-accent"
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
      <div>
        <h2 className="text-base font-semibold text-text-primary">Item drop finder</h2>
        <p className="mt-1 text-sm leading-relaxed text-text-secondary">Find item drops by name or ID. Select a Pokémon to open its loot table.</p>
      </div>
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-xs text-text-secondary">
          Search item drops
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search item IDs…"
            className="min-w-0 w-full rounded-md border border-border bg-bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
        </label>
        <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-xs text-text-secondary">
          Source pack
          <select
            value={source}
            onChange={(event) => setSource(event.target.value)}
            className="min-w-0 w-full rounded-md border border-border bg-bg-surface-2 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
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
          className="shrink-0 rounded-md border border-border px-3 py-2 text-xs text-accent hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-default disabled:opacity-40"
        >
          Clear filters
        </button>
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
      ) : (
        <DataTable
          virtualized
          rows={filteredRows}
          columns={columns}
          getRowKey={(row) => row.id}
          className="min-w-0 w-full"
        />
      )}
    </section>
  );
}
