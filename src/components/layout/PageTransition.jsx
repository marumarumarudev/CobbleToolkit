"use client";

import { usePathname } from "next/navigation";

/**
 * Keys a div on the current pathname so React remounts it on route change,
 * which retriggers the CSS fade-in animation defined in globals.css
 * (.page-transition). Pure CSS, no animation library — respects
 * prefers-reduced-motion via the global reduced-motion rule in
 * globals.css, which zeroes out animation-duration site-wide.
 */
export default function PageTransition({ children }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}
