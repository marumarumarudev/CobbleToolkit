export function Spinner({ size = 16, className = "" }) {
  return (
    <svg
      className={["animate-spin text-accent", className].join(" ")}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Skeleton({ className = "" }) {
  return (
    <div
      className={[
        "animate-pulse rounded-md bg-bg-surface-2",
        className,
      ].join(" ")}
    />
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="bg-bg-surface-2 h-8" />
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 px-4 py-3">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-3.5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
