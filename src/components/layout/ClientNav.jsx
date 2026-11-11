"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Radar, Layers, Users, HelpCircle, House, Utensils, ChevronRight } from "lucide-react";
import GlobalFileUpload from "../GlobalFileUpload";
import ThemePicker from "./ThemePicker";

const NAV_ITEMS = [
  { name: "Overview", path: "/", icon: House, detail: "Tools at a glance" },
  { name: "Spawn Scanner", path: "/spawn-scanner", icon: Radar, detail: "Encounters & conditions" },
  { name: "Species & Loot", path: "/species-loot", icon: Layers, detail: "Pokémon, mounts & drops" },
  { name: "RCT Trainer Scanner", path: "/trainer-scanner", icon: Users, detail: "Teams & rewards" },
  { name: "Campfire Kitchen", path: "/campfire-kitchen", icon: Utensils, detail: "Snacks & fishing bait" },
  { name: "FAQ", path: "/faq", icon: HelpCircle, detail: "Help & feedback" },
];

export default function ClientNav() {
  const pathname = usePathname();
  // Route-keyed state closes the disclosure on navigation, including browser history.
  return <Navigation key={pathname} pathname={pathname} />;
}

function Navigation({ pathname }) {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef(null);
  const toggleRef = useRef(null);
  const route = pathname?.replace(/\/+$/, "") || "/";
  const isActive = (path) => path === "/"
    ? route === "/"
    : route === path || route.startsWith(`${path}/`) ||
      (path === "/campfire-kitchen" && (route === "/pokesnack-maker" || route.startsWith("/pokesnack-maker/")));
  const activeItem = NAV_ITEMS.find((item) => isActive(item.path));

  useEffect(() => {
    if (!isOpen) return;
    const closeOutside = (event) => {
      if (!navRef.current?.contains(event.target)) setIsOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (desktop.matches) setIsOpen(false); };
    document.addEventListener("pointerdown", closeOutside);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [isOpen]);

  return (
    <nav
      ref={navRef}
      aria-label="Main navigation"
      className="dex-header sticky top-0 z-50"
      onKeyDown={(event) => {
        if (event.key === "Escape" && isOpen) {
          event.preventDefault();
          setIsOpen(false);
          toggleRef.current?.focus();
        }
      }}
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
    >
      <div className="mx-auto flex max-w-[100rem] items-center justify-between gap-3 px-4 py-3 sm:px-6 xl:px-8">
        <Link href="/" aria-label="CobbleToolkit home" onClick={() => setIsOpen(false)} className="flex min-w-0 items-center gap-3 rounded-md">
          <span className="dex-lens" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block font-mono text-sm font-bold tracking-tight text-white sm:text-base">CobbleToolkit</span>
            <span className="hidden text-[9px] uppercase tracking-[0.2em] text-red-100 sm:block">Tools for Cobblemon</span>
          </span>
          <span aria-hidden="true" className="ml-2 hidden items-center gap-1.5 xl:flex">
            <span className="h-2 w-2 rounded-full border border-black/25 bg-red-300" />
            <span className="h-2 w-2 rounded-full border border-black/25 bg-amber-200" />
            <span className="h-2 w-2 rounded-full border border-black/25 bg-accent" />
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <span className="mr-2 hidden font-mono text-[10px] uppercase tracking-widest text-red-100 xl:block">Your packs stay in your browser</span>
          <GlobalFileUpload />
          <button
            ref={toggleRef}
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-md border border-white/25 bg-black/15 text-white transition-colors hover:bg-black/25 lg:hidden"
            onClick={() => setIsOpen((open) => !open)}
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
          >
            {isOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div className="border-t border-black/20 bg-bg-base/95">
        <div className="mx-auto flex max-w-[100rem] items-center gap-3 px-4 sm:px-6 xl:px-8">
        <div className="hidden min-w-0 flex-1 flex-wrap gap-1 py-2 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link key={item.path} href={item.path} aria-current={isActive(item.path) ? "page" : undefined}
              className={`flex min-h-11 items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors ${isActive(item.path) ? "border-accent/35 bg-accent-soft text-accent shadow-inner" : "border-transparent text-text-secondary hover:bg-bg-surface-2 hover:text-text-primary"} ${item.path === "/faq" ? "ml-auto" : ""}`}>
              <item.icon size={16} aria-hidden="true" />
              {item.name}
            </Link>
          ))}
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 py-2 text-xs lg:hidden">
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Tools</span>
          <ChevronRight size={12} className="text-text-muted" aria-hidden="true" />
          <span className="truncate font-medium text-accent">{activeItem?.name || "CobbleToolkit"}</span>
        </div>
        <ThemePicker />
        </div>
      </div>

      <div id="mobile-navigation" hidden={!isOpen} className="absolute inset-x-0 top-full max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain border-b-4 border-border bg-bg-base p-3 shadow-xl lg:hidden">
        <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">Choose a tool</p>
        <div className="grid gap-1 sm:grid-cols-2">
          {NAV_ITEMS.map((item) => (
            <Link key={item.path} href={item.path} onClick={() => setIsOpen(false)} aria-current={isActive(item.path) ? "page" : undefined}
              className={`flex min-h-16 items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${isActive(item.path) ? "border-accent/35 bg-accent-soft text-accent" : "border-transparent text-text-secondary hover:bg-bg-surface-2 hover:text-text-primary"}`}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-bg-surface"><item.icon size={18} aria-hidden="true" /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{item.name}</span><span className="block text-[11px] text-text-muted">{item.detail}</span></span>
              <ChevronRight size={14} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
