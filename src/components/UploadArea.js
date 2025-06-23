"use client";

import { useState } from "react";
import { parseCobblemonZip } from "@/utils/parser";
import { saveAs } from "file-saver";

export default function UploadArea() {
  const [fileReports, setFileReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState({ column: "pokemon", direction: "asc" });

  const rarityOrder = {
    common: 0,
    uncommon: 1,
    rare: 2,
    "ultra-rare": 3,
  };

  const handleFiles = async (files) => {
    setLoading(true);
    const reports = [];

    for (const file of files) {
      const parsed = await parseCobblemonZip(file);
      if (!parsed.length) {
        reports.push({ name: file.name, error: "No valid spawn data found." });
        continue;
      }

      reports.push({ name: file.name, data: parsed });
    }

    setFileReports(reports);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const clearAll = () => {
    setFileReports([]);
    setSearchTerm("");
    setSort({ column: "pokemon", direction: "asc" });
  };

  const sortData = (rows) => {
    const { column, direction } = sort;
    return [...rows].sort((a, b) => {
      let valA = a[column] ?? "";
      let valB = b[column] ?? "";

      if (column === "bucket") {
        valA = rarityOrder[valA] ?? 99;
        valB = rarityOrder[valB] ?? 99;
      }

      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const toggleSort = (column) => {
    setSort((prev) => ({
      column,
      direction:
        prev.column === column && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const downloadMarkdown = (name, data) => {
    const base = name.replace(/\.zip$/, "");

    const md = [
      `# Spawn Data — ${base}`,
      ``,
      `| Pokémon | Rarity | Level | Weight | Biomes | Dimensions | Can See Sky | Structures | Raining | Moon Phase | Nearby Blocks |`,
      `|---------|--------|-------|--------|--------|------------|-------------|------------|---------|------------|---------------|`,
      ...data.map(
        (d) =>
          `| ${d.pokemon} | ${d.bucket} | ${d.level} | ${d.weight} | ${d.biomes} | ${d.dimensions} | ${d.canSeeSky} | ${d.structures} | ${d.isRaining} | ${d.moonPhase} | ${d.neededNearbyBlocks} |`
      ),
    ].join("\n");

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    saveAs(blob, `${base}.md`);
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white flex flex-col items-center px-6 py-10">
      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Cobblemon Datapack Spawn Pool Scanner
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Analyze Cobblemon datapack spawn pools (.zip) to view Pokémon
          rarities, biomes, structures, and more. This tool runs entirely in
          your browser — your files are never uploaded. Open source on{" "}
          <a
            href="https://github.com/moonBSIS/Cobblemon-Datapack-Spawn-Scanner"
            className="text-blue-400 underline hover:text-blue-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          .
        </p>
        <br />
        <p className="text-gray-300 text-sm text-center mt-2">
          View spawn tags like <code>#cobblemon:is_arid</code> in the{" "}
          <a
            href="https://wiki.cobblemon.com/index.php/Pok%C3%A9mon/Spawning/Spawn_Definitions"
            className="text-blue-400 underline hover:text-blue-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cobblemon Spawn Definitions Wiki
          </a>
          .
        </p>
      </header>

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-600 rounded p-6 w-full max-w-2xl text-center bg-[#2c2c2c] hover:bg-[#3a3a3a] transition cursor-pointer mb-8"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const files = Array.from(e.dataTransfer.files);
          handleFiles(files);
        }}
        onClick={() => document.getElementById("fileInput").click()}
      >
        <p className="text-gray-300 text-lg">
          📦 Drag and drop .zip files here
        </p>
        <p className="text-sm text-gray-500 mt-1">or click to select files</p>
        <input
          id="fileInput"
          type="file"
          multiple
          accept=".zip"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {loading && <p className="mb-4 text-blue-400">🔄 Parsing files...</p>}

      {fileReports.length > 0 && (
        <button
          className="mb-6 px-4 py-2 bg-red-600 rounded hover:bg-red-700"
          onClick={clearAll}
        >
          Clear All
        </button>
      )}

      {/* Reports */}
      <div className="w-full max-w-7xl">
        {fileReports.map((report, i) => (
          <div
            key={i}
            className="bg-[#2b2b2b] border border-gray-700 rounded p-4 mb-6 shadow-md"
          >
            <strong className="text-lg">{report.name}</strong>
            {report.error ? (
              <p className="text-red-400 mt-2">❌ {report.error}</p>
            ) : (
              <>
                <p className="mt-2">
                  ✅ Found {report.data.length} spawn entries
                </p>
                <button
                  onClick={() => downloadMarkdown(report.name, report.data)}
                  className="mt-2 px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
                >
                  Download Markdown
                </button>

                <div className="mt-4">
                  <input
                    className="bg-[#222] border border-gray-600 text-white p-2 rounded w-full mb-4"
                    placeholder="Search Pokémon name..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                    value={searchTerm}
                  />

                  <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full text-sm table-auto border-collapse">
                      <thead className="bg-[#1e1e1e] sticky top-0 z-10">
                        <tr>
                          {[
                            { key: "pokemon", label: "Pokémon" },
                            { key: "bucket", label: "Rarity" },
                            { key: "level", label: "Level" },
                            { key: "weight", label: "Weight" },
                            { key: "biomes", label: "Biomes" },
                            { key: "dimensions", label: "Dimensions" },
                            {
                              key: "canSeeSky",
                              label: "Can See Sky",
                              className: "min-w-[100px]",
                            },
                            { key: "structures", label: "Structures" },
                            { key: "isRaining", label: "Raining" },
                            { key: "moonPhase", label: "Moon Phase" },
                            {
                              key: "neededNearbyBlocks",
                              label: "Nearby Blocks",
                            },
                          ].map(({ key, label, className }) => (
                            <th
                              key={key}
                              className={`p-2 border cursor-pointer hover:bg-[#333] ${
                                className || ""
                              }`}
                              onClick={() => toggleSort(key)}
                            >
                              {label}
                              {sort.column === key &&
                                (sort.direction === "asc" ? " ▲" : " ▼")}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sortData(
                          report.data.filter((r) =>
                            r.pokemon
                              ?.toLowerCase()
                              .includes(searchTerm.toLowerCase())
                          )
                        ).map((d, idx) => (
                          <tr key={idx} className="bg-[#222]">
                            <td className="p-2 border">{d.pokemon}</td>
                            <td className="p-2 border">{d.bucket}</td>
                            <td className="p-2 border">{d.level}</td>
                            <td className="p-2 border">{d.weight}</td>
                            <td className="p-2 border">{d.biomes}</td>
                            <td className="p-2 border">{d.dimensions}</td>
                            <td className="p-2 border">
                              {d.canSeeSky?.toString()}
                            </td>
                            <td className="p-2 border">{d.structures}</td>
                            <td className="p-2 border">
                              {d.isRaining?.toString()}
                            </td>
                            <td className="p-2 border">{d.moonPhase}</td>
                            <td className="p-2 border">
                              {d.neededNearbyBlocks}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <footer className="text-sm text-gray-500 text-center mt-12 mb-4">
        Built by{" "}
        <a
          href="https://github.com/moonBSIS"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          @moonBSIS
        </a>{" "}
        • Open source on{" "}
        <a
          href="https://github.com/moonBSIS/Cobblemon-Datapack-Spawn-Scanner"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          GitHub
        </a>{" "}
        • Deployed on{" "}
        <a
          href="https://cobblemon-datapack-spawn-scanner.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          Vercel
        </a>
      </footer>
      <p className="text-gray-500 text-sm text-center mt-2 max-w-2xl mx-auto">
        Made this for my own use and laziness out of boredom, but I thought it
        might be useful for others. Feel free to contact me on discord if you
        have any questions or feedback. Discord: <strong>zmoonmaru</strong>
      </p>
    </div>
  );
}
