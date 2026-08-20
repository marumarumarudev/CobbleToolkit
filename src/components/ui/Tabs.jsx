"use client";

/**
 * Lightweight controlled tabs. No context/compound-magic needed at our scale.
 *
 *   <Tabs
 *     tabs={[{ id: "loot", label: "Loot Table" }, { id: "species", label: "Species Data" }]}
 *     active={tab}
 *     onChange={setTab}
 *   />
 */
export default function Tabs({ tabs, active, onChange, className = "" }) {
  return (
    <div
      role="tablist"
      className={[
        "inline-flex flex-wrap items-center gap-1 rounded-lg bg-bg-surface-2 border border-border p-1",
        className,
      ].join(" ")}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={[
              "relative flex items-center gap-1.5 rounded-md px-3 py-2 sm:py-1.5 text-xs font-medium",
              "transition-colors duration-150",
              isActive
                ? "bg-accent text-accent-ink"
                : "text-text-secondary hover:text-text-primary",
            ].join(" ")}
          >
            {tab.icon && <tab.icon size={13} />}
            {tab.label}
            {typeof tab.count === "number" && (
              <span
                className={[
                  "ml-0.5 rounded-full px-1.5 text-[10px] leading-4",
                  isActive
                    ? "bg-accent-ink/15 text-accent-ink"
                    : "bg-bg-surface text-text-muted",
                ].join(" ")}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
