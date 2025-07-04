"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

export default function ClientNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#121212] border-b border-[#333] px-4 py-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="font-mono text-lg font-semibold hover:text-yellow-400"
        >
          CobbleToolkit
        </Link>

        {/* Mobile menu toggle */}
        <button
          className="sm:hidden text-yellow-400"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu size={24} />
        </button>

        {/* Desktop links */}
        <div className="hidden sm:flex space-x-6 text-sm font-mono">
          <Link href="/spawn-scanner" className="hover:text-yellow-400">
            Spawn Scanner
          </Link>
          <Link href="/loot-scanner" className="hover:text-yellow-400">
            Loot Drop Scanner
          </Link>
          <Link href="/recommended" className="hover:text-yellow-400">
            Recommended Stuff
          </Link>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {isOpen && (
        <div className="sm:hidden px-4 mt-2 space-y-2 font-mono text-sm">
          <Link href="/spawn-scanner" className="block hover:text-yellow-400">
            Spawn Scanner
          </Link>
          <Link href="/loot-scanner" className="block hover:text-yellow-400">
            Loot Drop Scanner
          </Link>
          <Link href="/recommended" className="block hover:text-yellow-400">
            Recommended Stuff
          </Link>
          <Link
            href="/feedback-gallery"
            className="block hover:text-yellow-400"
          >
            Feedback Gallery
          </Link>
        </div>
      )}
    </nav>
  );
}
