"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  TrendingUp,
  Users,
  Package,
  Search,
  Sprout,
  Heart,
  BarChart3,
  ChevronRight,
  HelpCircle,
  Settings,
} from "lucide-react";

export default function CobbleverseLayout({ children }) {
  const pathname = usePathname();
  const isActive = (path) => pathname === path;

  const items = [
    { name: "Overview", href: "/guides/cobbleverse", icon: Home },
    {
      name: "FAQ",
      href: "/guides/cobbleverse/faq",
      icon: HelpCircle,
    },
    {
      name: "Progression",
      href: "/guides/cobbleverse/progression",
      icon: TrendingUp,
    },
    {
      name: "Gym Leaders",
      href: "/guides/cobbleverse/gym-leaders",
      icon: Users,
    },
    { name: "Items", href: "/guides/cobbleverse/items", icon: Package },
    {
      name: "How to Get Pokémon",
      href: "/guides/cobbleverse/how-to-get",
      icon: Search,
    },
    { name: "Farming", href: "/guides/cobbleverse/farming", icon: Sprout },
    {
      name: "Cobbreeding",
      href: "/guides/cobbleverse/cobbreeding",
      icon: Heart,
    },
    {
      name: "Spawn Rates",
      href: "/guides/cobbleverse/spawnrates",
      icon: BarChart3,
    },
    {
      name: "Setup Guide",
      href: "/guides/cobbleverse/setup",
      icon: Settings,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
      {/* Sidebar */}
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] border border-gray-700/50 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
              <Image
                src="/cobbleverse.png"
                alt="Cobbleverse icon"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </div>
            <h2 className="text-xl font-bold text-white">COBBLEVERSE</h2>
          </div>

          <nav className="space-y-2">
            {items.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 text-yellow-400 border border-yellow-400/30"
                      : "text-gray-300 hover:text-white hover:bg-gray-700/30"
                  }`}
                >
                  <IconComponent
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive(item.href)
                        ? "text-yellow-400"
                        : "text-gray-400 group-hover:text-gray-300"
                    }`}
                  />
                  <span className="text-sm font-medium flex-1">
                    {item.name}
                  </span>
                  {isActive(item.href) && (
                    <ChevronRight className="w-3 h-3 text-yellow-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick info */}
          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <div className="text-xs text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>Total Guides:</span>
                <span className="text-yellow-400">9</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span className="text-yellow-400">9/29/25</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <section className="min-h-[600px]">
        <div className="bg-gradient-to-br from-[#2a2a2a]/50 to-[#1f1f1f]/50 border border-gray-700/30 rounded-2xl p-8 shadow-lg">
          {children}
        </div>
      </section>
    </div>
  );
}
