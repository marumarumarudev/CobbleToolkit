"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { parseLootFromZip } from "@/utils/lootParser";
import Spinner from "./Spinner";

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
      <h1 className="text-3xl font-bold mb-2">Cobblemon Loot Scanner</h1>
      <p className="text-gray-400 text-sm mb-6">
        Upload Cobblemon datapacks to view and search Pokémon loot drops.
      </p>

      <div
        className="border-2 border-dashed border-gray-600 rounded p-4 w-full max-w-2xl text-center bg-[#2c2c2c] hover:bg-[#3a3a3a] transition cursor-pointer mb-4"
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
        <p className="text-gray-300">📦 Drag and drop files here</p>
        <p className="text-sm text-gray-500">or click to select files</p>
        <input
          id="lootInput"
          type="file"
          multiple
          accept=".zip,.jar"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {loading && (
        <div className="flex gap-2 items-center text-blue-400 mb-4">
          <Spinner />
          <span>Parsing loot data...</span>
        </div>
      )}

      {lootEntries.length > 0 && (
        <>
          <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
            <input
              type="text"
              placeholder="🔍 Search Pokémon or Item..."
              className="w-full md:w-[77%] p-2 bg-[#222] border border-gray-600 rounded text-sm"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-sm">
                <label className="text-gray-300">Group by:</label>
                <select
                  className="bg-[#222] border border-gray-600 rounded px-2 py-1"
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                >
                  <option value="pokemon">Pokémon</option>
                  <option value="item">Item</option>
                </select>
              </div>

              <button
                className="px-3 py-1 bg-red-600 text-sm rounded hover:bg-red-700 whitespace-nowrap"
                onClick={() => {
                  setFileReports([]);
                  localStorage.removeItem("loot_reports");
                }}
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="w-full overflow-x-auto max-w-6xl border border-gray-600 rounded">
            <table className="min-w-full text-sm table-auto border-collapse">
              <thead className="bg-[#2c2c2c] text-left text-gray-300">
                <tr>
                  <th className="py-2 px-4 border-b border-gray-600">
                    Pokémon
                  </th>
                  <th className="py-2 px-4 border-b border-gray-600">Item</th>
                  <th className="py-2 px-4 border-b border-gray-600">
                    Quantity
                  </th>
                  <th className="py-2 px-4 border-b border-gray-600">Chance</th>
                  <th className="py-2 px-4 border-b border-gray-600">
                    Source File
                  </th>
                </tr>
              </thead>
              <tbody>
                {grouped.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-6 text-gray-400 border-b border-gray-700"
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
                      <td className="py-2 px-4 border-b border-gray-700">
                        {entry.pokemon}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-700">
                        {entry.item}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-700">
                        {entry.quantity}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-700">
                        {entry.chance}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-700">
                        {entry.sourceFile}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {grouped.length > visibleCount && (
              <div className="mt-4 text-center">
                <button
                  className="px-4 mb-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded"
                  onClick={() =>
                    setVisibleCount((prev) => prev + SHOW_INCREMENT)
                  }
                >
                  Show More ({visibleCount} / {grouped.length})
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
