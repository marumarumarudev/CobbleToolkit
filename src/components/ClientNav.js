"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown } from "lucide-react";

export default function ClientNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const tools = [
    { name: "Spawn Scanner", path: "/spawn-scanner" },
    { name: "Loot Drop Scanner", path: "/loot-scanner" },
    { name: "Species Scanner", path: "/species-scanner" },
  ];

  const isActive = (path) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#121212] border-b border-[#333] px-4 py-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link
          href="/"
          className={`font-mono text-lg font-semibold ${
            pathname === "/"
              ? "text-yellow-400"
              : "hover:text-yellow-400 text-white"
          }`}
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

        {/* Desktop */}
        <div className="hidden sm:flex items-center space-x-6 text-sm font-mono">
          <div className="relative group">
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="flex items-center gap-1 hover:text-yellow-400"
            >
              Tools <ChevronDown size={16} />
            </button>
            {toolsOpen && (
              <div className="absolute bg-[#1c1c1c] border border-[#333] mt-2 rounded shadow-md z-10 w-48">
                {tools.map((tool) => (
                  <Link
                    key={tool.path}
                    href={tool.path}
                    onClick={() => setToolsOpen(false)} // Close dropdown
                    className={`block px-4 py-2 text-sm ${
                      isActive(tool.path)
                        ? "text-yellow-400"
                        : "text-gray-300 hover:text-yellow-400 hover:bg-[#2c2c2c]"
                    }`}
                  >
                    {tool.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/recommended"
            className={`${
              isActive("/recommended")
                ? "text-yellow-400"
                : "text-gray-300 hover:text-yellow-400"
            }`}
          >
            Recommended Stuff
          </Link>
          <Link
            href="/feedback-gallery"
            className={`${
              isActive("/feedback-gallery")
                ? "text-yellow-400"
                : "text-gray-300 hover:text-yellow-400"
            }`}
          >
            Feedback
          </Link>
          <Link
            href="/faq"
            className={`${
              isActive("/faq")
                ? "text-yellow-400"
                : "text-gray-300 hover:text-yellow-400"
            }`}
          >
            FAQ
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden px-4 mt-2 space-y-2 font-mono text-sm">
          {tools.map((tool) => (
            <Link
              key={tool.path}
              href={tool.path}
              className={`block ${
                isActive(tool.path)
                  ? "text-yellow-400"
                  : "text-gray-300 hover:text-yellow-400"
              }`}
              onClick={() => setIsOpen(false)} // Close mobile menu
            >
              {tool.name}
            </Link>
          ))}
          <Link
            href="/recommended"
            className={`block ${
              isActive("/recommended")
                ? "text-yellow-400"
                : "text-gray-300 hover:text-yellow-400"
            }`}
            onClick={() => setIsOpen(false)}
          >
            Recommended Stuff
          </Link>
          <Link
            href="/feedback-gallery"
            className={`block ${
              isActive("/feedback-gallery")
                ? "text-yellow-400"
                : "text-gray-300 hover:text-yellow-400"
            }`}
            onClick={() => setIsOpen(false)}
          >
            Feedback Gallery
          </Link>
          <Link
            href="/faq"
            className={`${
              isActive("/faq")
                ? "text-yellow-400"
                : "text-gray-300 hover:text-yellow-400"
            }`}
          >
            FAQ
          </Link>
        </div>
      )}
    </nav>
  );
}
