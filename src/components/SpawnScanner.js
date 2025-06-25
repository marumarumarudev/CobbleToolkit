"use client";

import { useState, useEffect } from "react";
import { parseCobblemonZip } from "@/utils/spawnParser";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";
import { ChevronDown, ChevronUp, ChevronsUpDown, X } from "lucide-react";
import Spinner from "./Spinner";

export default function UploadArea() {
  const [fileReports, setFileReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [setSearchTerm] = useState("");
  const [sort, setSort] = useState({ column: "bucket", direction: "asc" });

  useEffect(() => {
    const saved = localStorage.getItem("spawn_reports");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setFileReports(parsed);
      } catch (err) {
        console.error("Failed to load saved spawn reports:", err);
      }
    }
  }, []);

  const rarityOrder = {
    common: 0,
    uncommon: 1,
    rare: 2,
    "ultra-rare": 3,
  };

  const handleFiles = async (files) => {
    if (loading) {
      toast.error("Please wait, still parsing previous files.");
      return;
    }

    setLoading(true);

    const existingNames = new Set(fileReports.map((r) => r.name));
    const newFiles = files.filter((f) => !existingNames.has(f.name));
    const skippedCount = files.length - newFiles.length;

    if (skippedCount > 0) {
      toast(
        `Skipped ${skippedCount} duplicate file${skippedCount > 1 ? "s" : ""}.`
      );
    }

    if (newFiles.length === 0) {
      setLoading(false);
      return;
    }

    const isBulk = newFiles.length > 1;
    const parsedReports = await Promise.all(
      newFiles.map(async (file) => {
        try {
          const parsed = await parseCobblemonZip(file);
          const hasData = parsed.length > 0;
          return {
            id: crypto.randomUUID(),
            name: file.name,
            data: parsed,
            error: hasData ? null : "No valid spawn data found.",
            expanded: !isBulk && hasData,
            searchTerm: "",
          };
        } catch (err) {
          const message = err.message || "Failed to parse file.";

          if (message.includes("spawn_pool_world")) {
            toast.error(`${file.name}: No spawn_pool_world folder.`);
            return null;
          }

          console.error(`❌ Failed to parse ${file.name}`, err);
          return {
            id: crypto.randomUUID(),
            name: file.name,
            data: [],
            error: err.message || "Failed to parse file.",
            expanded: false,
          };
        }
      })
    );

    setFileReports((prev) => {
      const updated = [...parsedReports.filter(Boolean), ...prev];
      localStorage.setItem("spawn_reports", JSON.stringify(updated));
      return updated;
    });
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const files = Array.from(e.target.files).filter(
      (file) =>
        file.name.toLowerCase().endsWith(".zip") ||
        file.name.toLowerCase().endsWith(".jar")
    );
    if (files.length === 0) {
      toast.error("Only valid .zip files are supported.");
      return;
    }
    handleFiles(files);
  };

  const clearAll = () => {
    setFileReports([]);
    setSort({ column: "pokemon", direction: "asc" });
    localStorage.removeItem("spawn_reports");
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

  const sortedReports = [
    ...fileReports.filter((r) => !r.error),
    ...fileReports.filter((r) => r.error),
  ];

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white flex flex-col items-center px-6 py-10">
      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Cobblemon Spawn Pool Scanner
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Analyze Cobblemon spawn pools (.zip & .jar) to view Pokémon rarities,
          biomes, structures, and more.
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
          const files = Array.from(e.dataTransfer.files).filter(
            (file) => file.name.endsWith(".zip") || file.name.endsWith(".jar")
          );
          if (files.length === 0) {
            toast.error("Only .zip files are supported.");
            return;
          }
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
          accept=".zip,.jar"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {loading && (
        <div className="mb-4 flex items-center gap-2 text-blue-400">
          <Spinner />
          <span>Parsing files...</span>
        </div>
      )}

      {fileReports.length > 0 && (
        <button
          className="mb-6 px-4 py-2 bg-red-600 rounded hover:bg-red-700"
          onClick={clearAll}
        >
          Clear All
        </button>
      )}

      {fileReports.length > 0 && (
        <div className="flex gap-4 mb-6">
          <button
            onClick={() =>
              setFileReports((prev) =>
                prev.map((r) => ({ ...r, expanded: true }))
              )
            }
            className="px-3 py-1 bg-blue-700 rounded hover:bg-blue-800"
          >
            Expand All
          </button>
          <button
            onClick={() =>
              setFileReports((prev) =>
                prev.map((r) => ({ ...r, expanded: false }))
              )
            }
            className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-700"
          >
            Collapse All
          </button>
        </div>
      )}

      {/* Reports */}
      <div className="flex flex-wrap -mx-3">
        {[0, 1, 2].map((colIndex) => (
          <div
            key={colIndex}
            className="w-full sm:w-1/2 xl:w-1/3 px-3 flex flex-col gap-6"
          >
            {sortedReports
              .filter((_, i) => i % 3 === colIndex)
              .map((report) => (
                <div
                  key={report.id}
                  className="bg-[#2a2a2a] p-4 rounded-lg shadow-md w-full"
                >
                  <details
                    open={report.expanded}
                    onToggle={(e) => {
                      const open = e.target.open;
                      setFileReports((prev) =>
                        prev.map((r) =>
                          r.id === report.id ? { ...r, expanded: open } : r
                        )
                      );
                    }}
                  >
                    <summary className="cursor-pointer flex justify-between items-center text-lg font-medium">
                      <span>
                        {report.name}
                        {!report.expanded && (
                          <span className="text-sm text-gray-400 ml-2">
                            {report.error
                              ? report.error === "No valid spawn data found."
                                ? "— no spawn_pool_folder"
                                : `— ${report.error}`
                              : `— ${report.data.length} entries`}
                          </span>
                        )}
                      </span>
                      <button
                        className="text-gray-400 hover:text-red-500 ml-4"
                        onClick={(e) => {
                          e.preventDefault();
                          setFileReports((prev) =>
                            prev.filter((r) => r.id !== report.id)
                          );
                        }}
                      >
                        <X size={18} />
                      </button>
                    </summary>

                    {report.error ? (
                      <p className="text-red-400 mt-2">❌ {report.error}</p>
                    ) : (
                      <>
                        <p className="mt-2">
                          ✅ Found {report.data.length} spawn entries
                        </p>
                        <button
                          onClick={() =>
                            downloadMarkdown(report.name, report.data)
                          }
                          className="mt-2 px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
                        >
                          Download Markdown
                        </button>

                        <div className="mt-4">
                          <input
                            className="bg-[#222] border border-gray-600 text-white p-2 rounded w-full mb-4"
                            placeholder="Search Pokémon name..."
                            onChange={(e) =>
                              setFileReports((prev) =>
                                prev.map((r) =>
                                  r.id === report.id
                                    ? { ...r, searchTerm: e.target.value }
                                    : r
                                )
                              )
                            }
                            value={report.searchTerm}
                          />

                          {/* Desktop Table */}
                          <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm table-auto border-collapse min-w-[900px]">
                              <thead className="bg-[#1e1e1e] sticky top-0 z-10">
                                <tr>
                                  {[
                                    { key: "pokemon", label: "Pokémon" },
                                    { key: "bucket", label: "Rarity" },
                                    { key: "level", label: "Level" },
                                    { key: "weight", label: "Weight" },
                                    { key: "biomes", label: "Biomes" },
                                    { key: "dimensions", label: "Dimensions" },
                                    { key: "canSeeSky", label: "Can See Sky" },
                                    { key: "structures", label: "Structures" },
                                    { key: "isRaining", label: "Raining" },
                                    { key: "moonPhase", label: "Moon Phase" },
                                    {
                                      key: "neededNearbyBlocks",
                                      label: "Nearby Blocks",
                                    },
                                  ].map(({ key, label }) => (
                                    <th
                                      key={key}
                                      onClick={() => toggleSort(key)}
                                      className="p-2 border cursor-pointer hover:bg-[#333] group"
                                    >
                                      <div className="flex items-center justify-center gap-1">
                                        <span>{label}</span>
                                        {sort.column === key ? (
                                          sort.direction === "asc" ? (
                                            <ChevronUp
                                              size={14}
                                              className="text-white"
                                            />
                                          ) : (
                                            <ChevronDown
                                              size={14}
                                              className="text-white"
                                            />
                                          )
                                        ) : (
                                          <ChevronsUpDown
                                            size={14}
                                            className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                          />
                                        )}
                                      </div>
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {sortData(
                                  report.data.filter((r) =>
                                    r.pokemon
                                      ?.toLowerCase()
                                      .includes(report.searchTerm.toLowerCase())
                                  )
                                ).map((d, idx) => (
                                  <tr key={idx} className="bg-[#222]">
                                    <td className="p-2 border">{d.pokemon}</td>
                                    <td className="p-2 border">{d.bucket}</td>
                                    <td className="p-2 border">{d.level}</td>
                                    <td className="p-2 border">{d.weight}</td>
                                    <td className="p-2 border">{d.biomes}</td>
                                    <td className="p-2 border">
                                      {d.dimensions}
                                    </td>
                                    <td className="p-2 border">
                                      {d.canSeeSky?.toString()}
                                    </td>
                                    <td className="p-2 border">
                                      {d.structures}
                                    </td>
                                    <td className="p-2 border">
                                      {d.isRaining?.toString()}
                                    </td>
                                    <td className="p-2 border">
                                      {d.moonPhase}
                                    </td>
                                    <td className="p-2 border">
                                      {d.neededNearbyBlocks}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile Card View */}
                          <div className="md:hidden flex flex-col gap-4">
                            {sortData(
                              report.data.filter((r) =>
                                r.pokemon
                                  ?.toLowerCase()
                                  .includes(report.searchTerm.toLowerCase())
                              )
                            ).map((d, idx) => (
                              <div
                                key={idx}
                                className="bg-[#222] p-4 rounded border text-sm space-y-1"
                              >
                                <div>
                                  <strong>Pokémon:</strong> {d.pokemon}
                                </div>
                                <div>
                                  <strong>Rarity:</strong> {d.bucket}
                                </div>
                                <div>
                                  <strong>Level:</strong> {d.level}
                                </div>
                                <div>
                                  <strong>Weight:</strong> {d.weight}
                                </div>
                                <div>
                                  <strong>Biomes:</strong> {d.biomes}
                                </div>
                                <div>
                                  <strong>Dimensions:</strong> {d.dimensions}
                                </div>
                                <div>
                                  <strong>Can See Sky:</strong>{" "}
                                  {d.canSeeSky?.toString()}
                                </div>
                                <div>
                                  <strong>Structures:</strong> {d.structures}
                                </div>
                                <div>
                                  <strong>Raining:</strong>{" "}
                                  {d.isRaining?.toString()}
                                </div>
                                <div>
                                  <strong>Moon Phase:</strong> {d.moonPhase}
                                </div>
                                <div>
                                  <strong>Nearby Blocks:</strong>{" "}
                                  {d.neededNearbyBlocks}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </details>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
