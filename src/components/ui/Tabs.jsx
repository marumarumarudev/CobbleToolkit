"use client";

/**
 * Lightweight controlled single-choice settings. No context/compound-magic needed at our scale.
 *
 *   <Tabs
 *     tabs={[{ id: "loot", label: "Loot Table" }, { id: "species", label: "Species Data" }]}
 *     active={tab}
 *     onChange={setTab}
 *   />
 */
export default function Tabs({ tabs, active, onChange, className = "", ariaLabel = "Options" }) {
  return (
    <div
      role="radiogroup"
            aria-label={ariaLabel}
      className={[
        "inline-flex flex-wrap items-center gap-1 rounded-lg bg-bg-surface-2 border border-border p-1",
        className,
      ].join(" ")}
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive || (!tabs.some((item) => item.id === active) && index === 0) ? 0 : -1}
            onKeyDown={(event) => {
              let next;
              if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % tabs.length;
              else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + tabs.length) % tabs.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = tabs.length - 1;
              else return;
              event.preventDefault();
              event.currentTarget.parentElement.querySelectorAll('[role="radio"]')[next].focus();
              onChange(tabs[next].id);
            }}
            onClick={() => onChange(tab.id)}
            className={[
              "relative flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium leading-5",
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
                  "ml-0.5 rounded-full px-1.5 text-xs leading-4",
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
