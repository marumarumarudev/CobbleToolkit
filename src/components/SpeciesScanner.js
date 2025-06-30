"use client";

import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { parseSpeciesFromZip } from "@/utils/speciesParser";
import Spinner from "./Spinner";
import { ChevronDown, ChevronUp, X } from "lucide-react";

const ITEMS_PER_PAGE = 25;

export default function SpeciesScanner() {
  const [fileReports, setFileReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const openMapRef = useRef({});
  const [globalSearch, setGlobalSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("species_reports");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setFileReports(parsed);
      } catch (err) {
        console.error("Failed to load saved species reports:", err);
      }
    }
  }, []);

  const handleFiles = async (files) => {
    if (loading) {
      toast.error("Please wait, still parsing previous files.");
      return;
    }

    setLoading(true);
    const newReports = [];

    for (const file of files) {
      const isDuplicate = fileReports.some((r) => r.name === file.name);
      if (isDuplicate) {
        toast(`Skipped duplicate file: ${file.name}`);
        continue;
      }

      try {
        const parsed = await parseSpeciesFromZip(file);
        if (parsed.length === 0) {
          toast.error(`${file.name}: No species data found.`);
          continue;
        }

        newReports.push({
          id: crypto.randomUUID(),
          name: file.name,
          data: parsed,
          expanded: files.length === 1 && parsed.length < 100,
          search: "",
          page: 1,
          filters: {
            types: [],
            dropIncludes: "",
          },
        });
      } catch (err) {
        console.error(`❌ Failed to parse ${file.name}`);
        toast.error(`Failed to parse ${file.name}`);
      }
    }

    setFileReports((prev) => {
      const updatedReports = [...newReports, ...prev];
      localStorage.setItem("species_reports", JSON.stringify(updatedReports));
      return updatedReports;
    });
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const files = Array.from(e.target.files).filter(
      (f) =>
        f.name.toLowerCase().endsWith(".zip") ||
        f.name.toLowerCase().endsWith(".jar")
    );
    if (files.length === 0) {
      toast.error("Only .zip or .jar files are supported.");
      return;
    }
    handleFiles(files);
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white px-4 py-8 flex flex-col items-center">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Cobblemon Species Scanner</h1>
        <p className="text-gray-300 text-sm">
          Upload Cobblemon datapacks (.zip) or JARs to view species data like
          types, base stats, evolutions, drops, and more.
        </p>
      </header>

      <div
        className="border-2 border-dashed border-gray-600 rounded p-4 w-full max-w-2xl text-center bg-[#2c2c2c] hover:bg-[#3a3a3a] transition cursor-pointer mb-6"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const files = Array.from(e.dataTransfer.files).filter(
            (file) =>
              file.name.toLowerCase().endsWith(".zip") ||
              file.name.toLowerCase().endsWith(".jar")
          );
          if (files.length === 0) {
            toast.error("Only .zip or .jar files are supported.");
            return;
          }
          handleFiles(files);
        }}
        onClick={() => document.getElementById("fileInput").click()}
      >
        <p className="text-gray-300">📦 Drag and drop files here</p>
        <p className="text-sm text-gray-500">or click to select files</p>
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
          <span>Parsing species data...</span>
        </div>
      )}

      {fileReports.length > 0 && (
        <div className="w-full max-w-3xl mb-6">
          <input
            type="text"
            className="w-full p-2 bg-[#222] border border-gray-600 rounded text-sm"
            placeholder="🔍 Global search (any field across all files)..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
        </div>
      )}

      {fileReports.length > 0 && (
        <button
          className="mb-6 px-4 py-2 bg-red-600 rounded hover:bg-red-700"
          onClick={() => {
            setFileReports([]);
            localStorage.removeItem("species_reports");
          }}
        >
          Clear All
        </button>
      )}

      <div className="w-full max-w-6xl space-y-6">
        {fileReports.map((report) => {
          const searchLower = globalSearch.toLowerCase();
          const globalSearchLower = globalSearch.toLowerCase();

          const filteredData = report.data.filter((p) => {
            const haystacks = [
              p.name,
              p.namespace,
              p.experienceGroup,
              ...(p.types || []),
              ...(p.eggGroups || []),
              ...(p.abilities || []),
              ...(p.moves?.levelUp || []).flatMap((val) =>
                typeof val === "string" ? [val] : Object.values(val).flat()
              ),
              ...(p.moves?.tm || []),
              ...(p.moves?.egg || []),
              ...(p.moves?.tutor || []),
              ...(p.drops || []).map((d) => d.item),
              ...(p.evolutions || []).map((evo) => evo.to),
              ...(p.baseStats
                ? Object.entries(p.baseStats).map(([k, v]) => `${k}: ${v}`)
                : []),
              ...(p.evYield
                ? Object.entries(p.evYield).map(([k, v]) => `${k}: ${v}`)
                : []),
            ];

            return haystacks.some((text) =>
              (text || "").toString().toLowerCase().includes(searchLower)
            );
          });

          if (filteredData.length === 0) return null;

          const paginatedData = filteredData.slice(
            0,
            report.page * ITEMS_PER_PAGE
          );

          return (
            <details key={report.id}>
              <summary className="flex justify-between items-center text-lg font-medium cursor-pointer">
                <span>
                  {report.name}
                  <span className="text-sm text-gray-400 ml-2">
                    — {report.data.length} entries
                  </span>
                </span>
                <button
                  className="text-gray-400 hover:text-red-500 ml-4"
                  onClick={(e) => {
                    e.preventDefault();
                    setFileReports((prev) => {
                      const updated = prev.filter((r) => r.id !== report.id);
                      localStorage.setItem(
                        "species_reports",
                        JSON.stringify(updated)
                      );
                      return updated;
                    });
                  }}
                >
                  <X size={18} />
                </button>
              </summary>

              <div className="p-4 space-y-4">
                {paginatedData.map((p, index) => {
                  const key = `${report.id}-${index}`;
                  const isSearchActive = globalSearch.trim().length > 0;
                  const isOpen = openMapRef.current[key] ?? isSearchActive;

                  return (
                    <details
                      key={key}
                      open={isOpen}
                      onToggle={(e) => {
                        openMapRef.current[key] = e.target.open;
                      }}
                      className="bg-[#1e1e1e] p-4 rounded text-sm space-y-2"
                    >
                      <summary className="cursor-pointer text-base font-semibold flex justify-between items-center">
                        <span>
                          {p.name}
                          <span className="text-xs text-gray-400 ml-1">
                            ({p.namespace || "?"}, #{p.pokedexNumber || "?"})
                          </span>
                        </span>
                        <span className="text-gray-400">
                          {isOpen ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </span>
                      </summary>

                      <div className="mt-3 space-y-2">
                        <p>
                          <strong>Types:</strong> {(p.types || []).join(" / ")}
                        </p>
                        <p>
                          <strong>Abilities:</strong>{" "}
                          {(p.abilities || []).join(", ")}
                        </p>
                        <p>
                          <strong>Egg Groups:</strong>{" "}
                          {(p.eggGroups || []).join(", ") || "—"}
                        </p>
                        <p>
                          <strong>Shoulder Mountable:</strong>{" "}
                          {p.isShoulderMountable ? "Yes" : "No"}
                        </p>
                        <p>
                          <strong>Height / Weight:</strong>{" "}
                          {(p.height / 10).toFixed(1)} m /{" "}
                          {(p.weight / 10).toFixed(1)} kg
                        </p>
                        <p>
                          <strong>Base XP:</strong> {p.baseExperienceYield},{" "}
                          <strong>Catch Rate:</strong> {p.catchRate}
                        </p>
                        <p>
                          <strong>Experience Group:</strong>{" "}
                          {p.experienceGroup || "—"}
                        </p>
                        <p>
                          <strong>Effort Values:</strong>{" "}
                          {Object.entries(p.evYield || {})
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")}
                        </p>
                        <p>
                          <strong>Base Stats:</strong>{" "}
                          {Object.entries(p.baseStats || {})
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")}
                        </p>
                        {p.preEvolution && (
                          <p>
                            <strong>Pre-Evolution:</strong> {p.preEvolution}
                          </p>
                        )}
                        {(p.evolutions || []).length > 0 && (
                          <div>
                            <strong>Evolves To:</strong>
                            <ul className="list-disc ml-5 mt-1">
                              {p.evolutions.map((evo, idx) => (
                                <li key={idx}>
                                  <strong>{evo.to}</strong> via{" "}
                                  <em>{evo.method.replace(/_/g, " ")}</em>
                                  {(evo.movesRequired || []).length > 0 &&
                                    ` (requires ${evo.movesRequired.join(
                                      ", "
                                    )})`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* LEVEL-UP Moves with levels */}
                        {p.moves?.levelUp &&
                          Object.keys(p.moves.levelUp).length > 0 && (
                            <div>
                              <strong>LEVEL-UP Moves:</strong>
                              <ul className="list-disc ml-5 mt-1">
                                {Object.entries(p.moves.levelUp)
                                  .sort(
                                    (a, b) => parseInt(a[0]) - parseInt(b[0])
                                  )
                                  .map(([level, moves], i) => (
                                    <li key={i}>
                                      <strong>Level {level}:</strong>{" "}
                                      {(Array.isArray(moves)
                                        ? moves
                                        : [moves]
                                      ).join(", ")}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          )}

                        {/* TM, Egg, Tutor Moves */}
                        {["tm", "egg", "tutor"].map(
                          (moveType) =>
                            (p.moves?.[moveType] || []).length > 0 && (
                              <div key={moveType}>
                                <strong>{moveType.toUpperCase()} Moves:</strong>
                                <ul className="list-disc ml-5 mt-1">
                                  {p.moves[moveType].map((m, i) => (
                                    <li key={i}>{m}</li>
                                  ))}
                                </ul>
                              </div>
                            )
                        )}

                        {(p.drops || []).length > 0 && (
                          <div>
                            <strong>Loot Drops:</strong>
                            <ul className="list-disc ml-5">
                              {p.drops.map((drop, i) => (
                                <li key={i}>
                                  {drop.item}
                                  {drop.quantity && ` × ${drop.quantity}`}
                                  {drop.chance != null &&
                                    ` (${drop.chance}% chance)`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </details>
                  );
                })}

                {filteredData.length > paginatedData.length && (
                  <button
                    className="mt-2 px-4 py-1 bg-blue-700 text-white rounded hover:bg-blue-800"
                    onClick={() => {
                      setFileReports((prev) =>
                        prev.map((r) =>
                          r.id === report.id ? { ...r, page: r.page + 1 } : r
                        )
                      );
                    }}
                  >
                    Load More
                  </button>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
