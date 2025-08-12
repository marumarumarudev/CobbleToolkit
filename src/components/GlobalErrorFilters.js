"use client";

import { useEffect } from "react";

export default function GlobalErrorFilters() {
  useEffect(() => {
    const unhandledRejectionHandler = (event) => {
      try {
        const message = String(event?.reason?.message || event?.reason || "");
        const stack = String(event?.reason?.stack || "");
        if (
          /enabledFeatures is undefined/i.test(message) ||
          /args\.site\.enabledFeatures/i.test(message) ||
          /isFeatureBroken/i.test(stack) ||
          /updateFeaturesInner/i.test(stack)
        ) {
          event.preventDefault();
          return;
        }
      } catch {
        /* ignore */
      }
    };

    const errorHandler = (event) => {
      try {
        const message = String(event?.message || "");
        const stack = String(event?.error?.stack || "");
        if (
          /enabledFeatures is undefined/i.test(message) ||
          /args\.site\.enabledFeatures/i.test(message) ||
          /isFeatureBroken/i.test(stack) ||
          /updateFeaturesInner/i.test(stack)
        ) {
          event.preventDefault?.();
          return;
        }
      } catch {
        /* ignore */
      }
    };

    window.addEventListener("unhandledrejection", unhandledRejectionHandler);
    window.addEventListener("error", errorHandler, true);

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        unhandledRejectionHandler
      );
      window.removeEventListener("error", errorHandler, true);
    };
  }, []);

  return null;
}
