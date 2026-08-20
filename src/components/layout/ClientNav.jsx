"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Radar, Layers, Users, HelpCircle } from "lucide-react";
import { TbCakeRoll } from "react-icons/tb";
import GlobalFileUpload from "../GlobalFileUpload";

const SafeIcon = ({ Icon, size, ...props }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !Icon) return null;
  return <Icon size={size} {...props} />;
};

const NAV_ITEMS = [
  { name: "Spawn Scanner", path: "/spawn-scanner", icon: Radar },
  { name: "Species & Loot", path: "/species-loot", icon: Layers },
  { name: "RCT Trainer Scanner", path: "/trainer-scanner", icon: Users },
  { name: "Pokésnack Maker", path: "/pokesnack-maker", icon: TbCakeRoll },
  { name: "FAQ", path: "/faq", icon: HelpCircle },
];

export default function ClientNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isActive = (path) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg-base/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-sm font-semibold text-text-primary"
        >
          <svg
            viewBox="0 0 64 64"
            className="h-6 w-6 shrink-0"
            aria-hidden="true"
          >
            <circle cx="32" cy="32" r="30" fill="#0b0c0f" stroke="#e6b800" strokeWidth="3" />
            <path d="M2 32a30 30 0 0 1 60 0z" fill="#e6b800" />
            <rect x="2" y="30" width="60" height="4" fill="#15171c" />
            <circle cx="32" cy="32" r="9" fill="#15171c" stroke="#e6b800" strokeWidth="3" />
          </svg>
          CobbleToolkit
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={[
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150",
                isActive(item.path)
                  ? "bg-accent-soft text-accent"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-surface-2",
              ].join(" ")}
            >
              <SafeIcon Icon={item.icon} size={13} />
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:block">
          <GlobalFileUpload />
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 -m-2 text-text-secondary hover:text-text-primary"
          onClick={() => setIsOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <SafeIcon Icon={isOpen ? X : Menu} size={22} />
        </button>
      </div>

      {/* Mobile menu — solid bg so page content can't bleed through;
          overflow-y-auto so long menus scroll; upload lives at the bottom. */}
      {isOpen && (
        <div className="md:hidden flex max-h-[calc(100vh-3.5rem)] flex-col gap-1 overflow-y-auto border-t border-border bg-bg-base px-4 py-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setIsOpen(false)}
              className={[
                "flex items-center gap-2 rounded-md px-3 py-3 text-sm font-medium",
                isActive(item.path)
                  ? "bg-accent-soft text-accent"
                  : "text-text-secondary hover:bg-bg-surface-2 hover:text-text-primary",
              ].join(" ")}
            >
              <SafeIcon Icon={item.icon} size={15} />
              {item.name}
            </Link>
          ))}
          <div className="mt-2 border-t border-border pt-2">
            <GlobalFileUpload />
          </div>
        </div>
      )}
    </nav>
  );
}
