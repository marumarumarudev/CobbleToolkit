# 🧰 CobbleToolkit

Browser-based tools for digging through **Cobblemon** and **Cobbleverse RCT** datapacks so you don't have to open a single `.json` file yourself. Everything runs entirely client-side — drop a datapack in, and it never leaves your tab. No backend, no account, no upload.

## ⚙️ Tools

### 📦 Spawn Scanner

Every spawn pool entry in a datapack — rarity, level, weight, and the full condition list (biomes, structures, light levels, moon phase, all of it). Hover a biome tag to see exactly which biomes it resolves to.

### 🧬 Species & Loot

Pick a species, see its base stats and moveset right next to its loot table. One shared upload, no tab-switching between a species scanner and a loot scanner.

### 🥊 RCT Trainer Scanner

Built for Cobbleverse RCT trainers specifically. Team, AI config, and battle rules — plus fully resolved loot tables, including nested `generic/**` pools flattened all the way down to the actual items. Catches cycles and missing table references instead of silently breaking on them. Search covers trainer names, team species, and resolved loot items.

### 🍡 Pokésnack Maker

Pick a species and a target rarity (and optionally a goal — efficient, max shiny, hidden ability), get back up to 3 seasonings that actually make sense for that target instead of a copy-paste combo. Recommended cards are interactive — click one to swap it for another valid option when a species has more than one good fit (dual types, multiple EV yields, etc).

### ❓ FAQ

Quick answers to the "wait, how does this work" questions.

## 💡 Why this exists

I kept needing to answer questions like "what actually drops from this trainer" or "where does this thing even spawn," and the only way to find out was scrolling through raw datapack JSON. So I built tools that just tell you.

## 🛠️ Built with

- [Next.js](https://nextjs.org/) (App Router, static export)
- [React](https://reactjs.org/) + [Tailwind CSS](https://tailwindcss.com/)
- [JSZip](https://stuk.github.io/jszip/) for reading datapack archives in-browser
- [@tanstack/react-virtual](https://tanstack.com/virtual) for scanning huge tables without melting your browser
- IndexedDB for local storage — nothing is ever sent anywhere

## 🚀 Live

Hosted on GitHub Pages: **https://zmoonmaru.github.io/CobbleToolkit/**

## 📦 Using it

1. Open the tool you need and drop in a `.zip` or `.jar` datapack (or use the upload button in the nav — files are shared across tools).
2. Search, sort, and click around. Every tool remembers what you've uploaded between visits (IndexedDB, not localStorage).
3. That's it. No export step, no config.

## ⚠️ Disclaimer

Personal project, not affiliated with the Cobblemon or Cobbleverse RCT teams. For official stuff, go bug them directly.

## 🧑‍💻 Author

Made by [zmoonmaru](https://github.com/zmoonmaru).
Discord: `zmoonmaru` · [Ko-fi](https://ko-fi.com/zmoonmaru) · [Modrinth](https://modrinth.com/user/zmoonmaru) · [CurseForge](https://www.curseforge.com/members/zmoonmaru/)

## 🪪 License

MIT — see [LICENSE](./LICENSE). Do what you want with it.

## 🤝 Contributing

Issues and PRs welcome. If something's broken or a tool's missing a feature you need, open an issue.
