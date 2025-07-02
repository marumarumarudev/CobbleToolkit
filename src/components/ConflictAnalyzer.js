"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { parseDatapackConflicts } from "@/utils/conflictParser";

export default function ConflictAnalyzer() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const handleFiles = async (files) => {
    setLoading(true);
    try {
      const results = await parseDatapackConflicts(Array.from(files));
      const conflictsOnly = results.filter((r) => r.conflict);
      setEntries(conflictsOnly);
    } catch {
      toast.error("Error parsing datapacks.");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => setEntries([]);

  const filtered = entries.filter((entry) =>
    entry.pokemon.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-4">
        Datapack Conflict Analyzer
      </h1>
      <p className="text-gray-400 text-center mb-6 max-w-2xl mx-auto">
        Compare spawn pool conflicts side-by-side between datapacks.
      </p>

      <div
        className="border-2 border-dashed border-gray-600 rounded p-6 text-center bg-[#2c2c2c] hover:bg-[#3a3a3a] transition cursor-pointer mb-6"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => document.getElementById("conflictInput").click()}
      >
        <p className="text-gray-300 text-lg">🧩 Drag and drop datapacks here</p>
        <p className="text-sm text-gray-500">or click to select files</p>
        <input
          id="conflictInput"
          type="file"
          multiple
          accept=".zip,.jar"
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {entries.length > 0 && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <input
            type="text"
            placeholder="Search Pokémon..."
            className="px-3 py-2 rounded bg-[#333] text-white w-full sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            onClick={clearAll}
          >
            Clear All
          </button>
        </div>
      )}

      {loading && <p className="text-blue-400">Parsing datapacks...</p>}

      {entries.length > 0 && filtered.length === 0 && (
        <p className="text-gray-500 italic">No matching entries found.</p>
      )}

      <div className="space-y-8">
        {filtered.map((entry, idx) => (
          <div
            key={idx}
            className="border border-yellow-500 bg-[#2d2d1f] p-4 rounded"
          >
            <h2 className="text-xl font-bold mb-4 text-yellow-300">
              {entry.pokemon} — Conflict Detected
            </h2>

            <div
              className={`grid gap-4 ${
                entry.sources.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2"
              } grid-cols-1`}
            >
              {entry.sources.map((src, i) => (
                <div key={i} className="bg-[#222] p-3 rounded">
                  <h3 className="font-semibold text-white mb-2">
                    {src.file} ({src.namespace})
                  </h3>
                  {src.spawns && src.spawns.length > 0 ? (
                    src.spawns.map((spawn, j) => (
                      <div
                        key={j}
                        className="border border-gray-600 rounded p-2 mb-2 bg-[#111]"
                      >
                        <p className="text-sm">
                          <strong>ID:</strong> {spawn.id || "(none)"}
                        </p>
                        <p className="text-sm">
                          <strong>Biomes:</strong>{" "}
                          {Array.isArray(spawn.biomes) && spawn.biomes.length > 0
                            ? spawn.biomes.join(", ")
                            : "(none)"}
                        </p>
                        <p className="text-sm">
                          <strong>Level:</strong>{" "}
                          {spawn.level || "(unspecified)"}
                        </p>
                        <p className="text-sm">
                          <strong>Rarity:</strong> {spawn.rarity || "(?)"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 italic text-sm">
                      No spawns found.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
