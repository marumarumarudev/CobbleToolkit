import Link from "next/link";
import {
  Radar,
  Layers,
  Users,
  Utensils,
  ArrowRight,

} from "lucide-react";


const TOOLS = [
  {
    name: "Spawn Scanner",
    path: "/spawn-scanner",
    icon: Radar,
    description:
      "Browse spawn entries with rarity, level, weight, and all conditions, including biome tags.",
    stat: "70+ spawn fields",
  },
  {
    name: "Species & Loot",
    path: "/species-loot",
    icon: Layers,
    description:
      "Look up a Pokémon’s base stats, moves, and drops in one place.",

    stat: "Stats + drops, one view",
  },
  {
    name: "RCT Trainer Scanner",
    path: "/trainer-scanner",
    icon: Users,
    description:
      "Check Cobbleverse RCT trainer teams, AI, and loot. Nested generic pools are expanded, with cycles and missing references flagged.",
    stat: "Recursive loot resolution",
  },
  {
    name: "Campfire Kitchen",
    path: "/campfire-kitchen",
    icon: Utensils,
    description:
      "Choose seasonings for Poké Snacks and fishing Poké Bait based on your target species and goals, such as shinies, alphas, or marks.",
    stat: "Snacks + fishing bait",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div className="dex-console rounded-3xl p-4 sm:p-6">
        <div aria-hidden="true" className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-full border-4 border-white/70 bg-sky-300 shadow-inner" />
            <span className="h-2.5 w-2.5 rounded-full bg-red-950" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          </div>
          <span className="rounded-md bg-bg-surface px-3 py-1 font-mono text-xs uppercase tracking-widest text-text-primary">CT / CobbleToolkit</span>
        </div>
      <section aria-labelledby="field-guide-title" className="dex-screen grid gap-8 rounded-2xl border border-accent/20 bg-emerald-950 p-5 sm:p-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <div>

          <h1 id="field-guide-title" className="text-3xl sm:text-5xl font-semibold tracking-tight text-text-primary leading-[1.1]">
            See what’s in your <span className="text-accent">datapack.</span>
          </h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-text-secondary">
            Check Cobblemon spawns, species, loot, and Cobbleverse RCT trainers
            without reading JSON by hand, or plan Poké Snack recipes.
            Datapacks are never uploaded. Species lookups, images, video,
            and comments use external services.
          </p>
          <Link href="/spawn-scanner" className="mt-6 inline-flex min-h-11 items-center justify-center gap-3 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
            Open Spawn Scanner <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <p className="mt-3 font-mono text-sm text-text-muted">Open a .zip or .jar to get started.</p>
        </div>

        <div className="rounded-xl border border-accent/20 bg-black/20 p-5">
          <div aria-hidden="true" className="mb-5 overflow-hidden rounded-lg border border-accent/20 bg-emerald-950 text-accent">
            <svg viewBox="0 0 320 144" className="block h-auto w-full" fill="currentColor" shapeRendering="crispEdges">
              <path opacity=".12" d="M0 96h32V80h32V64h32v16h32v16h32V64h32V48h32v16h32v16h32v16h32v48H0z" />
              <path opacity=".35" d="M0 128h24v-16h24v16h40v-16h40v16h64v-16h32v16h40v-16h32v16h24v16H0zM40 24h8v8h-8zM272 40h8v8h-8zM248 16h4v4h-4z" />
              <path d="M144 32h32v8h16v16h8v32h-8v16h-16v8h-32v-8h-16V88h-8V56h8V40h16z" />
              <path fill="#022c22" d="M128 68h64v8h-64zM152 60h16v24h-16zM148 64h24v16h-24z" />
              <path d="M156 68h8v8h-8z" />
            </svg>
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">At a glance</p>
          <ul className="mt-3 flex flex-col gap-2.5 text-base leading-relaxed text-text-secondary">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />One upload for all three scanners
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Datapacks processed in your browser
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              No account needed to use the tools
            </li>
          </ul>
        </div>
      </section>
      </div>

      <details className="dex-screen rounded-xl border border-border bg-emerald-950 p-5">
        <summary className="cursor-pointer rounded text-sm font-semibold text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">Storage, privacy &amp; JSON handling</summary>
        <div className="mt-5 grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="min-w-0 space-y-6">
            <section aria-labelledby="privacy-heading">
              <h3 id="privacy-heading" className="mb-2 text-base font-semibold text-text-primary">Privacy &amp; processing</h3>
              <p className="max-w-prose text-base leading-relaxed text-text-secondary">
                Datapack processing runs in your browser, with no server or account required.
                Datapacks are never uploaded. Species lookups, images, video,
                and comments use external services.
              </p>
            </section>
            <section aria-labelledby="json-heading">
              <h3 id="json-heading" className="mb-2 text-base font-semibold text-text-primary">JSON compatibility &amp; tab sync</h3>
              <p className="max-w-prose text-base leading-relaxed text-text-secondary">
                New uploads use strict JSON by default. Shared files has an optional
                compatibility repair checkbox; its heuristics may alter values. Diagnostics
                are saved and bounded, and legacy entries retain their old compatibility
                behavior. Changes sync across tabs through BroadcastChannel or a
                storage event fallback, with a refresh on focus.
              </p>
            </section>
          </div>
          <section aria-labelledby="storage-heading" className="min-w-0 border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <h3 id="storage-heading" className="mb-2 text-base font-semibold text-text-primary">Local storage &amp; saved archives</h3>
      <p className="max-w-prose text-base leading-relaxed text-text-secondary">
        Archives, metadata, and parsed results are saved in IndexedDB (v7):
        128 MiB per archive, 256 MiB of stored archives total, with the same limits
        reported in metadata. The browser may evict storage; clearing site data
        removes everything. Uploading the same SHA-256 content again with the same
        repair policy reconnects to its existing ID and results, even if renamed.
        Different content or policy creates a separate entry. Legacy metadata
        without a fingerprint cannot safely reconnect by filename: a new entry
        is created and old caches are retained. Missing archive blobs still show
        the unavailable notice; saved results remain usable. Removing an archive
        atomically removes its reports too.
      </p>
          </section>
        </div>
      </details>

      {/* Tool modules */}
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-xl font-semibold tracking-tight text-text-primary">Choose a tool</h2>
          <p className="font-mono text-xs text-text-muted">4 tools / shared files</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {TOOLS.map((tool, index) => (
            <Link key={tool.path} href={tool.path} className="dex-tool-card group flex h-full flex-col gap-4 rounded-xl border border-border bg-emerald-950 p-5 transition-colors hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
                      <tool.icon size={20} aria-hidden="true" />
                    </div>
                    <div className="flex items-center gap-3 font-mono text-sm text-accent">
                      {tool.badge && <span className="rounded bg-accent-soft px-2 py-1">{tool.badge}</span>}
                      <span>TOOL / {String(index + 1).padStart(2, "0")}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">
                      {tool.name}
                    </h3>
                    <p className="mt-2 text-base leading-relaxed text-text-secondary">
                      {tool.description}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <span className="text-sm font-mono text-text-muted">
                      {tool.stat}
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-accent">
                      Open
                      <ArrowRight size={14} aria-hidden="true" />
                    </span>
                  </div>

            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
