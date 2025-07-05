"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { parseLootFromZip } from "@/utils/lootParser";
import Spinner from "./Spinner";
import { X } from "lucide-react";

export default function LootScanner() {
  const [fileReports, setFileReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [groupBy, setGroupBy] = useState("pokemon");
  const [visibleCount, setVisibleCount] = useState(100);
  const SHOW_INCREMENT = 100;

  useEffect(() => {
    const saved = localStorage.getItem("loot_reports");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setFileReports(parsed);
      } catch (err) {
        console.error("Failed to load saved loot reports:", err);
      }
    }
  }, []);

  const handleFiles = async (files) => {
    if (loading) return toast.error("Still parsing...");
    setLoading(true);

    const newReports = [];
    for (const file of files) {
      const isDuplicate = fileReports.some((r) => r.name === file.name);
      if (isDuplicate) {
        toast(`Skipped duplicate file: ${file.name}`);
        continue;
      }

      try {
        const parsed = await parseLootFromZip(file);
        if (parsed.length === 0) {
          toast.error(`${file.name}: No loot data found.`);
          continue;
        }

        newReports.push({
          id: crypto.randomUUID(),
          name: file.name,
          data: parsed,
        });
      } catch (err) {
        toast.error(`Failed to parse ${file.name}`);
      }
    }

    setFileReports((prev) => {
      const updated = [...newReports, ...prev];
      localStorage.setItem("loot_reports", JSON.stringify(updated));
      return updated;
    });

    setLoading(false);
  };

  const handleInputChange = (e) => {
    const files = Array.from(e.target.files).filter((f) =>
      f.name.toLowerCase().match(/\.(zip|jar)$/)
    );
    if (!files.length) return toast.error("Only .zip or .jar files allowed.");
    handleFiles(files);
  };

  const lootEntries = fileReports.flatMap((report) =>
    report.data.flatMap((pokemon) =>
      (pokemon.drops || []).map((drop) => ({
        reportName: report.name,
        pokemon: pokemon.name,
        item: drop.item,
        quantity:
          typeof drop.quantity === "string"
            ? drop.quantity
            : Array.isArray(drop.quantity)
            ? `${drop.quantity[0]}–${drop.quantity[1]}`
            : "1",
        chance: drop.chance != null ? `${drop.chance}%` : "100%",
        sourceFile: report.name,
      }))
    )
  );

  const searchTerm = globalSearch.toLowerCase();
  const filtered = lootEntries.filter((entry) =>
    [entry.pokemon, entry.item, entry.chance, entry.sourceFile].some((val) =>
      val.toLowerCase().includes(searchTerm)
    )
  );

  const grouped =
    groupBy === "pokemon"
      ? filtered.sort((a, b) => a.pokemon.localeCompare(b.pokemon))
      : filtered.sort((a, b) => a.item.localeCompare(b.item));

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white px-4 py-8 flex flex-col items-center">
      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Cobblemon Loot Scanner
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Upload Cobblemon datapacks (.zip or .jar) to scan Pokémon loot drops.
        </p>
        <p className="text-gray-300 text-sm text-center mt-2">
          Drops like <code>cobblemon:raw_fish</code> are shown per Pokémon.
        </p>
      </header>

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-600 rounded p-6 w-full max-w-2xl text-center bg-[#2c2c2c] hover:bg-[#3a3a3a] transition cursor-pointer mb-8"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const files = Array.from(e.dataTransfer.files).filter((f) =>
            f.name.toLowerCase().match(/\.(zip|jar)$/)
          );
          if (!files.length) return toast.error("Only .zip or .jar allowed.");
          handleFiles(files);
        }}
        onClick={() => document.getElementById("lootInput").click()}
      >
        <p className="text-gray-300 text-lg">📦 Drag and drop files here</p>
        <p className="text-sm text-gray-500">or click to select files</p>
        <input
          id="lootInput"
          type="file"
          multiple
          accept=".zip,.jar"
          onChange={(e) => {
            handleInputChange(e);
            e.target.value = "";
          }}
          className="hidden"
        />
      </div>

      {loading && (
        <div className="mb-4 flex items-center gap-2 text-blue-400">
          <Spinner />
          <span>Parsing loot data...</span>
        </div>
      )}

      {lootEntries.length > 0 && (
        <>
          {/* Search & Actions */}
          <div className="flex flex-col md:flex-row gap-2 items-center mb-6 w-full max-w-3xl">
            <input
              type="text"
              placeholder="🔍 Search Pokémon or Item..."
              className="bg-[#2c2c2c] border border-gray-600 text-white p-2 rounded w-full"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />

            <select
              className="bg-[#2c2c2c] border border-gray-600 text-white p-2 rounded w-full md:w-1/3"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
            >
              <option value="pokemon">Group by Pokémon</option>
              <option value="item">Group by Item</option>
            </select>
          </div>

          {/* Clear Button */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
              onClick={() => {
                setFileReports([]);
                localStorage.removeItem("loot_reports");
              }}
            >
              <X size={16} /> Clear All
            </button>
          </div>

          {/* Table View */}
          <div className="w-full max-w-6xl overflow-x-auto">
            <table className="w-full text-sm table-auto border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#2c2c2c] text-left text-gray-300">
                  <th className="p-2 border-b border-gray-700">Pokémon</th>
                  <th className="p-2 border-b border-gray-700">Item</th>
                  <th className="p-2 border-b border-gray-700">Quantity</th>
                  <th className="p-2 border-b border-gray-700">Chance</th>
                  <th className="p-2 border-b border-gray-700">Source File</th>
                </tr>
              </thead>
              <tbody>
                {grouped.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center p-6 text-gray-400 border-b border-gray-700"
                    >
                      No matching results found.
                    </td>
                  </tr>
                ) : (
                  grouped.slice(0, visibleCount).map((entry, index) => (
                    <tr
                      key={index}
                      className={
                        index % 2 === 0 ? "bg-[#1e1e1e]" : "bg-[#252525]"
                      }
                    >
                      <td className="p-2 border-b border-gray-700">
                        {entry.pokemon}
                      </td>
                      <td className="p-2 border-b border-gray-700">
                        {entry.item}
                      </td>
                      <td className="p-2 border-b border-gray-700">
                        {entry.quantity}
                      </td>
                      <td className="p-2 border-b border-gray-700">
                        {entry.chance}
                      </td>
                      <td className="p-2 border-b border-gray-700">
                        {entry.sourceFile}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Show More Button */}
          {grouped.length > visibleCount && (
            <div className="mt-4 text-center">
              <button
                className="px-4 mb-4 py-2 bg-blue-700 hover:bg-blue-800 text-gray-300 rounded"
                onClick={() => setVisibleCount((prev) => prev + SHOW_INCREMENT)}
              >
                Show More ({visibleCount} / {grouped.length})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
