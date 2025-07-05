"use client";

import { useState, useEffect, Fragment } from "react";
import toast from "react-hot-toast";
import Spinner from "./Spinner";
import { parseSpeciesAndSpawnFromZip } from "@/utils/speciesSpawnParser";

export default function SpeciesScanner() {
  const [species, setSpecies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("dex");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedMoves, setExpandedMoves] = useState({});
  const PAGE_SIZE = 25;

  useEffect(() => {
    const saved = localStorage.getItem("species_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSpecies(parsed);
        setFiltered(parsed);
      } catch (err) {
        console.error("Failed to load saved species data");
      }
    }
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();

    const result = species.filter((s) => {
      const fields = [
        s.name,
        s.types.join(" "),
        ...Object.entries(s.evYield || {})
          .filter(([_, val]) => val > 0)
          .map(([stat, val]) => `${val} ${stat}`),
        ...Object.values(s.stats || {}).map((v) => `${v}`),
        ...(s.moves || []),
      ]
        .join(" ")
        .toLowerCase();

      return fields.includes(term);
    });

    switch (sortBy) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "type":
        result.sort((a, b) =>
          (a.types[0] || "").localeCompare(b.types[0] || "")
        );
        break;
      case "ev":
        result.sort((a, b) => {
          const evA = Object.values(a.evYield || {}).reduce(
            (sum, v) => sum + v,
            0
          );
          const evB = Object.values(b.evYield || {}).reduce(
            (sum, v) => sum + v,
            0
          );
          return evB - evA;
        });
        break;
      case "bst":
        result.sort((a, b) => {
          const bstA = Object.values(a.stats || {}).reduce(
            (sum, v) => sum + v,
            0
          );
          const bstB = Object.values(b.stats || {}).reduce(
            (sum, v) => sum + v,
            0
          );
          return bstB - bstA;
        });
        break;
      default:
        result.sort((a, b) => (a.nationalDex || 0) - (b.nationalDex || 0));
    }

    setFiltered(result);
    setCurrentPage(1);
  }, [search, sortBy, species]);

  const handleFiles = async (files) => {
    if (loading) return toast.error("Still parsing...");
    setLoading(true);

    const valid = Array.from(files).filter((f) =>
      f.name.toLowerCase().match(/\.(zip|jar)$/)
    );
    if (!valid.length) {
      toast.error("Only .zip or .jar files allowed.");
      setLoading(false);
      return;
    }

    const allParsed = [];

    for (const file of valid) {
      try {
        const parsed = await parseSpeciesAndSpawnFromZip(file);
        allParsed.push(...parsed);
      } catch (e) {
        console.error(e);
        toast.error(`Failed to parse ${file.name}`);
      }
    }

    if (allParsed.length > 0) {
      setSpecies(allParsed);
      setFiltered(allParsed);
      localStorage.setItem("species_data", JSON.stringify(allParsed));
      toast.success("Species data loaded!");
    } else {
      toast.error("No species data found.");
    }

    setLoading(false);
  };

  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const toggleMoves = (name, category) => {
    setExpandedMoves((prev) => ({
      ...prev,
      [`${name}-${category}`]: !prev[`${name}-${category}`],
    }));
  };

  const clearAll = () => {
    setSpecies([]);
    setFiltered([]);
    localStorage.removeItem("species_data");
    toast.success("Species data cleared");
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white px-4 py-8 flex flex-col items-center">
      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Cobblemon Species Scanner
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Upload a Cobblemon datapack (.zip or .jar) to view Pokémon species,
          stats, and moves.
        </p>
      </header>

      {/* Upload */}
      <div
        className="border-2 border-dashed border-gray-600 rounded p-6 w-full max-w-2xl text-center bg-[#2c2c2c] hover:bg-[#3a3a3a] transition cursor-pointer mb-8"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => document.getElementById("speciesInput").click()}
      >
        <p className="text-gray-300 text-lg">📦 Drag and drop file here</p>
        <p className="text-sm text-gray-500">or click to select</p>
        <input
          id="speciesInput"
          type="file"
          accept=".zip,.jar"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {loading && (
        <div className="mb-4 flex items-center gap-2 text-blue-400">
          <Spinner />
          <span>Parsing species data...</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-2 items-center mb-6 w-full max-w-4xl">
        <input
          type="text"
          placeholder="🔍 Search name, type, stat..."
          className="bg-[#2c2c2c] border border-gray-600 text-white px-3 py-2 rounded text-sm w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="bg-[#2c2c2c] border border-gray-600 text-white px-3 py-2 rounded text-sm w-50%"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="dex">Sort by Dex #</option>
          <option value="name">Sort by Name</option>
          <option value="type">Sort by Type</option>
          <option value="ev">Sort by EV Yield</option>
          <option value="bst">Sort by BST</option>
        </select>

        <button
          onClick={clearAll}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm whitespace-nowrap"
        >
          Clear All
        </button>
      </div>

      {/* Table */}
      <div className="w-full max-w-6xl overflow-x-auto">
        <table className="w-full text-sm table-auto border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-[#2c2c2c] text-left text-gray-300">
              <th className="p-2 border-b border-gray-700">#</th>
              <th className="p-2 border-b border-gray-700">Name</th>
              <th className="p-2 border-b border-gray-700">Type</th>
              <th className="p-2 border-b border-gray-700">Base Stats</th>
              <th className="p-2 border-b border-gray-700">EV Yield</th>
              <th className="p-2 border-b border-gray-700">Moves</th>
              <th className="py-2 px-4 border-b border-gray-600">
                Source File
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center p-6 text-gray-400 border-b border-gray-700"
                >
                  No matching results found.
                </td>
              </tr>
            ) : (
              paginated.map((mon, i) => {
                const levelMoves = mon.moves
                  .filter((m) => /^\d+:/.test(m))
                  .map((m) => {
                    const [lvl, move] = m.split(":");
                    return `Lv ${lvl} ${move}`;
                  });

                const tmMoves = mon.moves
                  .filter((m) => m.startsWith("tm:"))
                  .map((m) => m.replace("tm:", ""));

                const eggMoves = mon.moves
                  .filter((m) => m.startsWith("tutor:"))
                  .map((m) => m.replace("tutor:", ""));

                const evText =
                  Object.entries(mon.evYield || {})
                    .filter(([_, val]) => val > 0)
                    .map(([stat, val]) => `${val} ${stat.toUpperCase()}`)
                    .join(", ") || "—";

                return (
                  <Fragment key={`${mon.name}-${mon.sourceFile}`}>
                    <tr
                      className={i % 2 === 0 ? "bg-[#1e1e1e]" : "bg-[#262626]"}
                    >
                      <td className="p-2 border-b border-gray-700">
                        {mon.nationalDex || "?"}
                      </td>
                      <td className="p-2 border-b border-gray-700 capitalize">
                        {mon.name}
                      </td>
                      <td className="p-2 border-b border-gray-700">
                        {mon.types.join(" / ")}
                      </td>
                      <td className="p-2 border-b border-gray-700">
                        {`HP ${mon.stats.hp}, ATK ${mon.stats.attack}, DEF ${mon.stats.defence}, SPA ${mon.stats.special_attack}, SPD ${mon.stats.special_defence}, SPE ${mon.stats.speed}`}
                      </td>
                      <td className="p-2 border-b border-gray-700">{evText}</td>
                      <td className="p-2 border-b border-gray-700 space-x-2">
                        <button
                          onClick={() => toggleMoves(mon.name, "level")}
                          className="text-blue-400 hover:underline text-xs"
                        >
                          Level-Up
                        </button>
                        <button
                          onClick={() => toggleMoves(mon.name, "tm")}
                          className="text-green-400 hover:underline text-xs"
                        >
                          TM
                        </button>
                        <button
                          onClick={() => toggleMoves(mon.name, "egg")}
                          className="text-yellow-300 hover:underline text-xs"
                        >
                          Egg
                        </button>
                      </td>
                      <td className="px-4 py-2 border-b border-gray-700 text-xs">
                        {mon.sourceFile || "—"}
                      </td>
                    </tr>

                    {(expandedMoves[mon.name + "-level"] ||
                      expandedMoves[mon.name + "-tm"] ||
                      expandedMoves[mon.name + "-egg"]) && (
                      <tr key={mon.name + "-details"} className="bg-[#111]">
                        <td
                          colSpan={7}
                          className="p-3 text-xs text-gray-300 border-b border-gray-700 space-y-1"
                        >
                          {expandedMoves[mon.name + "-level"] && (
                            <div>
                              <strong className="text-blue-400">
                                Level-Up:
                              </strong>{" "}
                              {levelMoves.join(", ") || "None"}
                            </div>
                          )}
                          {expandedMoves[mon.name + "-tm"] && (
                            <div>
                              <strong className="text-green-400">TM:</strong>{" "}
                              {tmMoves.join(", ") || "None"}
                            </div>
                          )}
                          {expandedMoves[mon.name + "-egg"] && (
                            <div>
                              <strong className="text-yellow-300">Egg:</strong>{" "}
                              {eggMoves.join(", ") || "None"}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div className="mt-6 flex justify-center items-center gap-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-gray-300 text-sm">
            Page {currentPage} / {Math.ceil(filtered.length / PAGE_SIZE)}
          </span>
          <button
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(Math.ceil(filtered.length / PAGE_SIZE), p + 1)
              )
            }
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm"
            disabled={currentPage === Math.ceil(filtered.length / PAGE_SIZE)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
