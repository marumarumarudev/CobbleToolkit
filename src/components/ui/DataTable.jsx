"use client";

import { useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

const DEFAULT_COL_WIDTH = 160;

/**
 * Table shell with sticky header + sort-on-click.
 *
 * Non-virtualized mode (default) renders a plain <table> — fine up to a
 * few hundred rows.
 *
 * Virtualized mode (`virtualized`) renders only the rows in the viewport
 * via @tanstack/react-virtual, backed by a CSS grid instead of a real
 * <table> (virtualized rows need absolute positioning, which <tr> can't
 * do reliably). Use this for datasets that can run into the thousands.
 *
 *   <DataTable
 *     virtualized
 *     rowHeight={40}
 *     columns={[
 *       { key: "name", label: "Item", width: 220 },
 *       // wrap: true lets a column's content break onto a 2nd line
 *       // instead of truncating — pair with a taller rowHeight and a
 *       // line-clamp-2 span (+ title attr) in the column's render() so
 *       // very long values (e.g. "Tauros Paldean Bull Breed") stay
 *       // readable instead of ellipsis-clipped.
 *       { key: "pokemon", label: "Pokémon", width: 170, wrap: true },
 *     ]}
 *     rows={rows}
 *   />
 */
export default function DataTable({
  columns,
  rows,
  getRowKey,
  className = "",
  virtualized = false,
  rowHeight = 40,
  maxHeight = "70vh",
}) {
  const [sort, setSort] = useState({ key: null, dir: "asc" });

  const sortedRows = useMemo(() => {
    if (!sort.key) return rows;
    const col = columns.find((c) => c.key === sort.key);
    const sorted = [...rows].sort((a, b) => {
      const av = col?.sortValue ? col.sortValue(a) : a[sort.key];
      const bv = col?.sortValue ? col.sortValue(b) : b[sort.key];
      if (av == null) return 1;
      if (bv == null) return -1;
      return av > bv ? 1 : av < bv ? -1 : 0;
    });
    return sort.dir === "asc" ? sorted : sorted.reverse();
  }, [rows, sort, columns]);

  const toggleSort = (key) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  };

  const resolveKey = (row, index) =>
    getRowKey ? getRowKey(row, index) : index;

  const headerCell = (col) => (
    <th key={col.key}>
      {col.sortable === false ? (
        col.label
      ) : (
        <button
          onClick={() => toggleSort(col.key)}
          className="inline-flex items-center gap-1 hover:text-text-primary transition-colors"
        >
          {col.label}
          {sort.key === col.key ? (
            sort.dir === "asc" ? (
              <ChevronUp size={12} />
            ) : (
              <ChevronDown size={12} />
            )
          ) : (
            <ChevronsUpDown size={12} className="opacity-40" />
          )}
        </button>
      )}
    </th>
  );

  if (!virtualized) {
    return (
      <div
        className={[
          "border border-border rounded-lg overflow-auto max-h-[70vh]",
          className,
        ].join(" ")}
      >
        <table>
          <thead>
            <tr>{columns.map(headerCell)}</tr>
          </thead>
          <tbody>
            {sortedRows.map((row, i) => (
              <tr key={resolveKey(row, i)}>
                {columns.map((col) => (
                  <td key={col.key} className="text-text-primary">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <VirtualizedBody
      columns={columns}
      rows={sortedRows}
      resolveKey={resolveKey}
      className={className}
      rowHeight={rowHeight}
      maxHeight={maxHeight}
      sort={sort}
      onSort={toggleSort}
    />
  );
}

function VirtualizedBody({
  columns,
  rows,
  resolveKey,
  className,
  rowHeight,
  maxHeight,
  sort,
  onSort,
}) {
  const scrollRef = useRef(null);

  const gridTemplateColumns = useMemo(
    () => columns.map((c) => `${c.width ?? DEFAULT_COL_WIDTH}px`).join(" "),
    [columns]
  );
  const totalWidth = useMemo(
    () => columns.reduce((sum, c) => sum + (c.width ?? DEFAULT_COL_WIDTH), 0),
    [columns]
  );

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 12,
  });

  return (
    <div
      ref={scrollRef}
      className={[
        "border border-border rounded-lg overflow-auto",
        className,
      ].join(" ")}
      style={{ maxHeight }}
    >
      <div style={{ minWidth: totalWidth }}>
        {/* Header */}
        <div
          className="sticky top-0 z-10 grid bg-bg-surface-2 border-b border-border"
          style={{ gridTemplateColumns }}
        >
          {columns.map((col) => (
            <div
              key={col.key}
              className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-text-secondary truncate"
            >
              {col.sortable === false ? (
                col.label
              ) : (
                <button
                  onClick={() => onSort(col.key)}
                  className="inline-flex items-center gap-1 hover:text-text-primary transition-colors"
                >
                  {col.label}
                  {sort.key === col.key ? (
                    sort.dir === "asc" ? (
                      <ChevronUp size={12} />
                    ) : (
                      <ChevronDown size={12} />
                    )
                  ) : (
                    <ChevronsUpDown size={12} className="opacity-40" />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Virtualized rows */}
        <div
          style={{
            height: virtualizer.getTotalSize(),
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <div
                key={resolveKey(row, virtualRow.index)}
                className="absolute left-0 top-0 w-full grid border-b border-border hover:bg-bg-surface-2 transition-colors duration-100"
                style={{
                  gridTemplateColumns,
                  height: virtualRow.size,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {columns.map((col) => (
                  <div
                    key={col.key}
                    className={[
                      "flex px-3 py-2 text-xs text-text-primary",
                      col.wrap
                        ? "items-start whitespace-normal break-words"
                        : "items-center truncate",
                    ].join(" ")}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
