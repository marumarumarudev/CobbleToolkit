# 🧰 Cobblemon Toolkit

A growing suite of open-source, browser-based tools to analyze and inspect **Cobblemon datapacks**. Built for modders, server owners, and curious players. No backend — your files never leave your computer.

## ⚙️ Current Tools

### 📦 Spawn Scanner

- Parses Cobblemon datapacks (`.zip` or `.jar`) and extracts Pokémon spawn data.
- Searchable, sortable table with filters (context, rarity, and more).
- Designed for quick inspection across multiple files.
- **NEW**: Advanced IndexedDB storage for handling large datasets (100+ MB files).

### 🎁 Loot Scanner

- Scans Pokémon loot drops from Cobblemon datapacks (`.zip` or `.jar`).
- Group results by Pokémon or by Item; global search and large table view.
- Supports drag-and-drop multiple files and clearing saved results.
- **NEW**: Persistent storage with data merging across multiple uploads.

### 🧬 Species Scanner

- Extracts species metadata from Cobblemon datapacks.
- Shows name, base stats, types, EV yields, and move lists.
- Built-in pagination and search for fast browsing.
- **NEW**: Enhanced storage capacity for large species datasets.

### 🧍‍♂️ Trainer Scanner

- Scans trainer configurations from Cobblemon datapacks (`.zip` or `.jar`).
- Shows trainer teams, AI settings, battle formats, and Pokémon details.
- Filter by format, team size, and search across trainers, Pokémon, and moves.
- **NEW**: Improved data persistence and merging capabilities.

### 🛠️ Spawn Pool Generator

- Build spawn pool JSONs in-browser with a friendly editor (contexts, buckets, presets, conditions, levels, weights).
- Import existing spawn pool JSONs, dedupe/merge, and edit inline via a JSON preview/editor.
- Export a ready-to-use datapack ZIP (`data/cobblemon/spawn_pool_world/*.json`).

## 📚 Guides & Resources

- ✅ **Visual Guides**: Comprehensive image guides for legendary encounters, special items, and complex mechanics
- 🏛️ **Location Guides**: Step-by-step visual walkthroughs for temples, ruins, and special areas

## 💡 Features

- 🌙 Fully client-side (no upload required)
- 🌑 Clean dark mode UI
- 📁 Drag-and-drop or manual upload
- 📱 Mobile and desktop responsive
- ⚡ Fast parsing with visual feedback
- 🔄 **NEW**: Advanced IndexedDB storage (hundreds of MB capacity vs 5MB localStorage)
- 🔄 **NEW**: Data persistence across page refreshes
- 📊 **NEW**: Real-time storage usage tracking
- 🔄 **NEW**: Smart data merging for multiple file uploads

## 🛠️ Technologies Used

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [JSZip](https://stuk.github.io/jszip/) for parsing archives
- [file-saver](https://www.npmjs.com/package/file-saver) for downloads
- **NEW**: IndexedDB for advanced client-side storage

## 🚀 Try It Live

**https://cobbletoolkit.pages.dev/**

## 📦 How to Use

1. Visit the tool and upload one or more Cobblemon datapack `.zip` or `.jar` files.
2. Explore data — sort, search, scroll, collapse, and expand.
3. **NEW**: Upload additional files to merge with existing data (no more data replacement!).
4. Download any results (where available) or export generated files.
5. Use "Clear All" to reset and scan new files.
6. **NEW**: Your data persists across browser sessions and page refreshes.
7. ✅ **Check the guides**: Use the visual guides in `/guides` for detailed walkthroughs.

## ⚡ Performance Improvements

- **Large File Support**: Handle 100+ MB Cobblemon JAR files without storage errors
- **Smart Storage**: IndexedDB provides much larger capacity than traditional localStorage
- **Data Merging**: Upload multiple files without losing previous data
- **Memory Optimization**: Efficient parsing and storage for large datasets
- **Real-time Tracking**: Monitor storage usage with built-in indicators

## ⚠️ Disclaimer

This is a **personal passion project** and is **not affiliated** with the Cobblemon team.
For official updates and help, please join the [Cobblemon Discord](https://discord.com/invite/cobblemon).

## 🧑‍💻 Author

Made with laziness and love by [maru](https://github.com/marumarumarudev).
Discord: `zmoonmaru`

## 🪪 License

Licensed under the [WTFPL](http://www.wtfpl.net/about/).
Do whatever you want.

## 🤝 Contributing

PRs, issues, and suggestions are welcome! Fork it, break it, improve it — have fun.
