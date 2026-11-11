"use client";

import { useEffect, useRef } from "react";
import { Palette } from "lucide-react";

const STORAGE_KEY = "cobbletoolkit-theme";
const THEMES = [
  ["retro", "Retro green"],
  ["pokedex", "Blue Pokédex"],
  ["rotom", "Rotom Dex"],
  ["dark", "Full dark"],
  ["light", "Light"],
];

function applyTheme(value) {
  const theme = THEMES.some(([id]) => id === value) ? value : "retro";
  document.documentElement.dataset.theme = theme;
  return theme;
}

export default function ThemePicker() {
  const selectRef = useRef(null);

  useEffect(() => {
    const sync = (value) => {
      const theme = applyTheme(value);
      if (selectRef.current) selectRef.current.value = theme;
    };
    try { sync(localStorage.getItem(STORAGE_KEY)); }
    catch { sync(document.documentElement.dataset.theme); }
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY || event.key === null) sync(event.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <label className="relative flex h-11 shrink-0 items-center rounded-lg border border-border bg-bg-base text-text-primary focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
      <Palette size={18} aria-hidden="true" className="pointer-events-none absolute left-3" />
      <span className="sr-only">Page theme</span>
      <select
        ref={selectRef}
        aria-label="Page theme"
        defaultValue="retro"
        onChange={(event) => {
          const theme = applyTheme(event.target.value);
          try { localStorage.setItem(STORAGE_KEY, theme); }
          catch { /* Theme selection still works when browser storage is blocked. */ }
        }}
        className="h-full w-11 cursor-pointer appearance-none rounded-lg bg-transparent pl-11 text-sm outline-none sm:w-40 sm:pr-3"
      >
        {THEMES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
      </select>
    </label>
  );
}
