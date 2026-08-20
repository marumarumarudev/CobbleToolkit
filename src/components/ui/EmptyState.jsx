export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center text-center rounded-lg",
        "border border-dashed border-border bg-bg-surface/50 px-6 py-14",
        className,
      ].join(" ")}
    >
      {Icon && (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Icon size={18} />
        </div>
      )}
      <p className="text-sm font-medium text-text-primary">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-text-secondary">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
