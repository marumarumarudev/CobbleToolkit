"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  ChevronDown,
  X,
  Wrench,
  BookOpen,
  Star,
  MessageSquare,
  HelpCircle,
} from "lucide-react";

// Icon wrapper to prevent hydration issues
const SafeIcon = ({ Icon, size, ...props }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !Icon) return null;

  return <Icon size={size} {...props} />;
};

export default function ClientNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const tools = [
    { name: "Spawn Scanner", path: "/spawn-scanner" },
    { name: "Loot Drop Scanner", path: "/loot-scanner" },
    { name: "Species Scanner", path: "/species-scanner" },
    { name: "Spawn Pool Generator", path: "/spawn-pool-generator" },
    { name: "Trainer Scanner", path: "/trainer-scanner" },
  ];

  const navItems = [
    { name: "Guides", path: "/guides", icon: BookOpen },
    { name: "Recommended Stuff", path: "/recommended", icon: Star },
    { name: "Feedback", path: "/feedback-gallery", icon: MessageSquare },
    { name: "FAQ", path: "/faq", icon: HelpCircle },
  ];

  const isActive = (path) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-md border-b border-[#333]/50 px-4 py-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link
          href="/"
          className={`font-mono text-lg font-semibold transition-all duration-200 ${
            pathname === "/"
              ? "text-yellow-400"
              : "hover:text-yellow-400 text-white"
          }`}
        >
          <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            CobbleToolkit
          </span>
        </Link>

        {/* Mobile menu toggle */}
        <button
          className="sm:hidden text-yellow-400 hover:text-yellow-300 transition-colors p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <SafeIcon Icon={X} size={24} />
          ) : (
            <SafeIcon Icon={Menu} size={24} />
          )}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center space-x-6 text-sm font-mono">
          {/* Tools Dropdown */}
          <div className="relative group">
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="flex items-center gap-1 hover:text-yellow-400 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-[#2a2a2a]/50"
            >
              <SafeIcon Icon={Wrench} size={16} />
              Tools
              <SafeIcon
                Icon={ChevronDown}
                size={16}
                className={`transition-transform duration-200 ${
                  toolsOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {toolsOpen && (
              <div className="absolute bg-[#1c1c1c] border border-[#333] mt-2 rounded-xl shadow-xl z-10 w-56 overflow-hidden">
                <div className="p-2">
                  {tools.map((tool) => (
                    <Link
                      key={tool.path}
                      href={tool.path}
                      onClick={() => setToolsOpen(false)}
                      className={`block px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                        isActive(tool.path)
                          ? "text-yellow-400 bg-yellow-400/10"
                          : "text-gray-300 hover:text-yellow-400 hover:bg-[#2c2c2c]"
                      }`}
                    >
                      {tool.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Other Navigation Items */}
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? "text-yellow-400 bg-yellow-400/10"
                    : "text-gray-300 hover:text-yellow-400 hover:bg-[#2a2a2a]/50"
                }`}
              >
                <SafeIcon Icon={IconComponent} size={16} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden mt-4 space-y-2 font-mono text-sm bg-[#1c1c1c] rounded-xl p-4 border border-[#333]">
          {/* Tools Section */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-yellow-400 font-semibold mb-2 px-2">
              <SafeIcon Icon={Wrench} size={16} />
              Tools
            </div>
            <div className="space-y-1 ml-4">
              {tools.map((tool) => (
                <Link
                  key={tool.path}
                  href={tool.path}
                  className={`block px-3 py-2 rounded-lg transition-colors ${
                    isActive(tool.path)
                      ? "text-yellow-400 bg-yellow-400/10"
                      : "text-gray-300 hover:text-yellow-400 hover:bg-[#2c2c2c]"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Other Navigation Items */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "text-yellow-400 bg-yellow-400/10"
                      : "text-gray-300 hover:text-yellow-400 hover:bg-[#2c2c2c]"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <SafeIcon Icon={IconComponent} size={16} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
