# 🧰 CobbleToolkit

Browser-based tools for digging through **Cobblemon** and **Cobbleverse RCT** datapacks so you don't have to open a single `.json` file yourself. Datapack processing runs client-side — your datapacks are never uploaded. External species lookups, images, video, and comments use third-party services.

## ⚙️ Tools

### 📦 Spawn Scanner

Every spawn pool entry in a datapack — rarity, level, weight, and the full condition list (biomes, structures, light levels, moon phase, all of it). Hover a biome tag to see exactly which biomes it resolves to.

### 🧬 Species & Loot

Pick a species, see its base stats and moveset right next to its loot table. One shared upload, no tab-switching between a species scanner and a loot scanner.

### 🥊 RCT Trainer Scanner

Built for Cobbleverse RCT trainers specifically. Team, AI config, and battle rules — plus fully resolved loot tables, including nested `generic/**` pools flattened all the way down to the actual items. Catches cycles and missing table references instead of silently breaking on them. Search covers trainer names, team species, and resolved loot items.

### 🍲 Campfire Kitchen

Plan up to three seasonings for Poké Snacks or fishing Poké Bait. Pick a species, rarity bucket, and goal; cycle available alternatives from a recommendation card or the matching pot slot. The old `/pokesnack-maker/` URL remains supported.

### ❓ FAQ

Quick answers to the "wait, how does this work" questions.

## 💡 Why this exists

I kept needing to answer questions like "what actually drops from this trainer" or "where does this thing even spawn," and the only way to find out was scrolling through raw datapack JSON. So I built tools that just tell you.

## 🛠️ Built with

- [Next.js](https://nextjs.org/) (App Router, static export)
- [React](https://reactjs.org/) + [Tailwind CSS](https://tailwindcss.com/)
- [JSZip](https://stuk.github.io/jszip/) for reading datapack archives in-browser
- [@tanstack/react-virtual](https://tanstack.com/virtual) for scanning huge tables without melting your browser
- IndexedDB (schema v7) for local archives, file metadata, committed parsed results, and bounded parsing diagnostics

## 🚀 Live

Hosted on GitHub Pages: **https://marumarumarudev.github.io/CobbleToolkit/**

## 📦 Using it

1. Open the tool you need and drop in a `.zip` or `.jar` datapack (or use the upload button in the nav — files are shared across tools).
2. New uploads use strict JSON by default. **Upload File** offers an optional compatibility-repair checkbox for malformed JSON. Repair is heuristic and may alter values; parsing diagnostics are saved and bounded. Existing legacy entries retain their old compatibility behavior.
3. Archives, metadata, and committed parsed results are saved in IndexedDB (v7), with a 512 MiB limit per archive and a 1024 MiB total stored-archive limit. Saved archives can be used by other scanners after a refresh, but browser storage is not a backup: the browser may evict it, and clearing site data removes everything.
4. Re-uploading identical content (SHA-256) with the same repair policy automatically reconnects to the existing entry ID and results, even if the file was renamed. Different content or a different repair policy creates a separate entry. Legacy metadata without a fingerprint cannot safely reconnect by filename: uploading creates a new entry and retains the old cached results.
5. Older entries whose archive blobs are missing still show “Archive unavailable — re-upload to scan in another tool”. Their cached results remain usable. Removing an archive atomically removes its associated reports too.
6. Changes sync across tabs using BroadcastChannel, with a storage-event fallback and a refresh when the tab regains focus.

On smaller screens, select a species or trainer to open its details, then use **Back to results** to return with your search and list position intact. Item drops starts in **Compact view**, with full values in each drop’s details and **Full table** available for comparison. Spawn Scanner starts with **Essentials** below 768px; you can choose **All fields** without narrowing search coverage.

Biome tags open with click, tap, Enter, or Space. Close the details or press Escape to return to the tag. Tool changes use a brief title/selection cue rather than moving the results; reduced-motion preferences skip those animations.

## 🧪 Development checks

- `npm test` — run the test suite.
- `npm run lint` — run lint checks.
- `npm run build` — build the static export.
- `npm run test:browser` — Chromium acceptance tests at desktop and mobile viewport sizes, using a managed local static server. First run `npx playwright install chromium` and `npm run build`. External services are stubbed during tests.

Parsing also limits archives to 250,000 entries (including directories and non-data JAR assets), 512 MiB declared uncompressed data, 10 MiB per JSON entry, and 500,000 emitted rows. Species & Loot reuse one archive load per scan. Cancellation stops work at processing checkpoints; JSZip's internal load and individual extraction cannot be interrupted mid-operation.

Verified upstream regression fixtures are pinned to Cobblemon **1.8.0**, commit `b33536e8721c9419d664fee15aa9e35cbf1900a8`. Source URLs and hashes are recorded in `tests/fixtures/upstream/manifest.json`. These samples do not establish full compatibility with every server datapack.

Schema v7 upgrades preserve existing caches. If an older tab blocks upgrading, close that tab when prompted; do not delete browser storage. A rollback build must retain v7 storage compatibility rather than attempting to reopen the database at v6.

## ⚠️ Disclaimer

Personal project, not affiliated with the Cobblemon or Cobbleverse RCT teams. For official stuff, go bug them directly.

## 🧑‍💻 Author

Made by [zmoonmaru](https://github.com/zmoonmaru).
Discord: `zmoonmaru` · [Ko-fi](https://ko-fi.com/zmoonmaru) · [Modrinth](https://modrinth.com/user/zmoonmaru) · [CurseForge](https://www.curseforge.com/members/zmoonmaru/)

## 🪪 License

MIT — see [LICENSE](./LICENSE). Do what you want with it.

## 🤝 Contributing

Issues and PRs welcome. If something's broken or a tool's missing a feature you need, open an issue.
