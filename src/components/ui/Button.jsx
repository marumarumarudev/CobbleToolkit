"use client";

import { forwardRef } from "react";

const VARIANTS = {
  primary:
    "bg-accent text-accent-ink hover:bg-accent-hover active:bg-accent-active border border-transparent shadow-[0_0_0_1px_rgba(230,184,0,0.15)]",
  secondary:
    "bg-bg-surface text-text-primary border border-border hover:border-border-hover hover:bg-bg-surface-2",
  ghost:
    "bg-transparent text-text-secondary border border-transparent hover:text-text-primary hover:bg-bg-surface-2",
  danger:
    "bg-transparent text-danger border border-danger/30 hover:bg-danger-soft",
};

const SIZES = {
  sm: "text-xs px-2.5 py-1.5 gap-1.5",
  md: "text-sm px-3.5 py-2 gap-2",
};

const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    className = "",
    children,
    icon: Icon,
    iconPosition = "left",
    disabled,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center rounded-md font-medium",
        "transition-colors duration-150 ease-out",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(" ")}
      {...props}
    >
      {Icon && iconPosition === "left" && <Icon size={size === "sm" ? 14 : 16} />}
      {children}
      {Icon && iconPosition === "right" && <Icon size={size === "sm" ? 14 : 16} />}
    </button>
  );
});

export default Button;
