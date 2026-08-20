export function Card({ className = "", hover = false, children, ...props }) {
  return (
    <div
      className={[
        "bg-bg-surface border border-border rounded-lg",
        hover &&
          "transition-colors duration-150 hover:border-border-hover hover:bg-bg-surface-2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }) {
  return (
    <div
      className={["px-5 py-4 border-b border-border", className].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }) {
  return (
    <h3
      className={[
        "text-sm font-semibold text-text-primary tracking-tight",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className = "", children, ...props }) {
  return (
    <p
      className={["text-xs text-text-secondary mt-1", className].join(" ")}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardBody({ className = "", children, ...props }) {
  return (
    <div className={["px-5 py-4", className].join(" ")} {...props}>
      {children}
    </div>
  );
}
