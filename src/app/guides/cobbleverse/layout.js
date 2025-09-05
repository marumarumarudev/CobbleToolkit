"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CobbleverseLayout({ children }) {
  const pathname = usePathname();
  const isActive = (path) => pathname === path;

  const items = [
    { name: "Overview", href: "/guides/cobbleverse" },
    { name: "Progression", href: "/guides/cobbleverse/progression" },
    { name: "Gym Leaders", href: "/guides/cobbleverse/gym-leaders" },
    { name: "Items", href: "/guides/cobbleverse/items" },
    { name: "How to Get Pokémon", href: "/guides/cobbleverse/how-to-get" },
    { name: "Farming", href: "/guides/cobbleverse/farming" },
    { name: "Cobbreeding", href: "/guides/cobbleverse/cobbreeding" },
    { name: "Spawn Rates", href: "/guides/cobbleverse/spawnrates" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
      <aside className="bg-[#2a2a2a] rounded-md p-4 h-max">
        <h2 className="text-lg font-semibold mb-3">COBBLEVERSE</h2>
        <nav className="space-y-2 text-sm">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className={`${
                isActive(i.href)
                  ? "text-yellow-400"
                  : "text-gray-300 hover:text-yellow-400"
              } block`}
            >
              {i.name}
            </Link>
          ))}
        </nav>
      </aside>
      <section>{children}</section>
    </div>
  );
}
