import Link from "next/link";
import {
  Radar,
  Layers,
  Users,
  Utensils,
  ArrowRight,
  Terminal,
} from "lucide-react";
import { Card, CardBody, Badge } from "@/components/ui";

const TOOLS = [
  {
    name: "Spawn Scanner",
    path: "/spawn-scanner",
    icon: Radar,
    description:
      "Every spawn pool entry in a datapack — rarity, level, weight, and the full condition list, biome tags included.",
    stat: "70+ spawn fields",
  },
  {
    name: "Species & Loot",
    path: "/species-loot",
    icon: Layers,
    description:
      "Pick a species, see its base stats and moves next to its drop table. One upload, no tab switching.",
    badge: "Merged",
    stat: "Stats + drops, one view",
  },
  {
    name: "RCT Trainer Scanner",
    path: "/trainer-scanner",
    icon: Users,
    description:
      "Team, AI, and fully resolved loot for Cobbleverse RCT trainers — nested generic pools flattened out, cycles and missing refs caught.",
    stat: "Recursive loot resolution",
  },
  {
    name: "Pokésnack Maker",
    path: "/pokesnack-maker",
    icon: Utensils,
    description:
      "Pick a species and a target rarity, get back seasonings that actually make sense for that target — not a generic combo.",
    stat: "Goal-aware recommendations",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-14">
      {/* Hero — asymmetric, personal, not a SaaS template */}
      <section className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-[11px] font-mono font-medium text-accent">
            <Terminal size={12} />
            CobbleToolkit
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary leading-[1.2]">
            Built these because reading datapack JSON by hand was driving me insane.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-text-secondary">
            Drop a Cobblemon or Cobbleverse RCT pack in and dig through
            spawns, species, loot, trainers, and pokésnacks — no more
            scrolling through .json files yourself. Everything stays in your
            browser, nothing gets uploaded anywhere.
          </p>
        </div>

        <div className="ultraball-seam rounded-xl border border-border bg-bg-surface p-6">
          <p className="font-mono text-xs text-text-muted">what&apos;s inside:</p>
          <ul className="mt-3 flex flex-col gap-2.5 text-sm text-text-secondary">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />4 tools,
              one shared upload
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Fully client-side — no server, no account
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Built for real datapacks, tested against real ones
            </li>
          </ul>
        </div>
      </section>

      {/* Tool grid */}
      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Tools
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {TOOLS.map((tool) => (
            <Link key={tool.path} href={tool.path} className="group">
              <Card hover className="h-full">
                <CardBody className="flex h-full flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
                      <tool.icon size={16} />
                    </div>
                    {tool.badge && <Badge tone="accent">{tool.badge}</Badge>}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      {tool.name}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                      {tool.description}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <span className="text-[11px] font-mono text-text-muted">
                      {tool.stat}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-accent opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                      Open
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
