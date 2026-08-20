const TONES = {
  neutral: "bg-bg-surface-2 text-text-secondary border-border",
  accent: "bg-accent-soft text-accent border-accent/30",
  success: "bg-success-soft text-success border-success/30",
  warning: "bg-warning-soft text-warning border-warning/30",
  danger: "bg-danger-soft text-danger border-danger/30",
  info: "bg-info-soft text-info border-info/30",
};

export default function Badge({ tone = "neutral", className = "", children }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
        "text-[11px] font-medium leading-none whitespace-nowrap",
        TONES[tone],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
