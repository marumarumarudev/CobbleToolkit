"use client";

import { useState, useEffect, useRef } from "react";
import { parseCobblemonZip } from "@/utils/spawnParser";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";
import { ChevronDown, ChevronUp, ChevronsUpDown, X } from "lucide-react";
import Spinner from "./Spinner";

export default function UploadArea() {
  const [fileReports, setFileReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchField, setSearchField] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [contextFilter, setContextFilter] = useState("all");
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

  // on sort change
  useEffect(() => {
    localStorage.setItem("spawn_sort", JSON.stringify(sort));
  }, [sort]);

  // on load
  useEffect(() => {
    const savedSort = localStorage.getItem("spawn_sort");
    if (savedSort) {
      try {
        setSort(JSON.parse(savedSort));
      } catch {}
    }
  }, []);

  const prevSearch = useRef("");

  useEffect(() => {
    if (prevSearch.current !== "" && searchTerm === "") {
      setFileReports((prev) => prev.map((r) => ({ ...r, expanded: false })));
    }
    prevSearch.current = searchTerm;
  }, [searchTerm]);

  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 200);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const availableContexts = Array.from(
    new Set(
      fileReports
        .flatMap((r) => r.data.map((d) => d.context))
        .filter((c) => typeof c === "string" && c.length > 0)
    )
  ).sort();

  const rarityOrder = {
    common: 0,
    uncommon: 1,
    rare: 2,
    "ultra-rare": 3,
  };

  const TABLE_COLUMNS = [
    { key: "pokemon", label: "Pokémon", sortable: true },
    { key: "bucket", label: "Rarity", sortable: true },
    { key: "level", label: "Level", sortable: true },
    { key: "weight", label: "Weight", sortable: true },
    { key: "context", label: "Context", sortable: true },
    { key: "biomes", label: "Biomes", sortable: true },
    { key: "dimensions", label: "Dimensions", sortable: true },
    { key: "canSeeSky", label: "Can See Sky", sortable: true },
    { key: "structures", label: "Structures", sortable: true },
    { key: "isRaining", label: "Raining", sortable: true },
    { key: "moonPhase", label: "Moon Phase", sortable: true },
    { key: "neededNearbyBlocks", label: "Nearby Blocks", sortable: true },
    { key: "timeRange", label: "Time", sortable: true },
    { key: "lightLevel", label: "Light Level", sortable: true },
    { key: "antiBiomes", label: "Anti-Biomes", sortable: false },
    { key: "antiStructures", label: "Anti-Structures", sortable: false },
  ];

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
            showAll: false,
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

  const sortedReports = [
    ...fileReports.filter((r) => !r.error),
    ...fileReports.filter((r) => r.error),
  ];

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white px-4 py-8 flex flex-col items-center">
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
          <span>Parsing files...</span>
        </div>
      )}

      {fileReports.length > 0 && (
        <>
          {/* Search Controls */}
          <div className="flex flex-col md:flex-row gap-2 items-center mb-6 w-full max-w-3xl">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="bg-[#2c2c2c] border border-gray-600 text-white p-2 rounded w-full md:w-1/3"
            >
              <option value="all">All Fields</option>
              <option value="pokemon">Pokémon</option>
              <option value="bucket">Rarity</option>
              <option value="level">Level</option>
              <option value="weight">Weight</option>
              <option value="biomes">Biomes</option>
              <option value="dimensions">Dimensions</option>
              <option value="canSeeSky">Can See Sky</option>
              <option value="structures">Structures</option>
              <option value="isRaining">Raining</option>
              <option value="moonPhase">Moon Phase</option>
              <option value="neededNearbyBlocks">Nearby Blocks</option>
              <option value="timeRange">Time</option>
              <option value="lightLevel">Light Level</option>
              <option value="antiBiomes">Anti-Biomes</option>
              <option value="antiStructures">Anti-Structures</option>
            </select>

            <input
              type="text"
              placeholder={`Search by ${
                searchField === "all" ? "any field" : searchField
              }...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#2c2c2c] border border-gray-600 text-white p-2 rounded w-full"
            />

            <select
              value={contextFilter}
              onChange={(e) => setContextFilter(e.target.value)}
              className="bg-[#2c2c2c] border border-gray-600 text-white p-2 rounded w-full md:w-1/3"
            >
              <option value="all">All Contexts</option>
              {availableContexts.map((ctx) => (
                <option key={ctx} value={ctx}>
                  {ctx.charAt(0).toUpperCase() + ctx.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
              onClick={clearAll}
            >
              <X size={16} /> Clear All
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-green-700 rounded hover:bg-green-800 transition"
              onClick={() =>
                setFileReports((prev) =>
                  prev.map((r) => ({ ...r, expanded: true }))
                )
              }
            >
              <ChevronDown size={16} /> Expand All
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 transition"
              onClick={() =>
                setFileReports((prev) =>
                  prev.map((r) => ({ ...r, expanded: false }))
                )
              }
            >
              <ChevronUp size={16} /> Collapse All
            </button>
          </div>
        </>
      )}

      <div className="w-full max-w-6xl mx-auto space-y-4">
        {sortedReports.map((report) => {
          const isLong = report.data.length > 10;
          const displayCount =
            report.expanded && report.showAll ? report.data.length : 10;
          const term = searchTerm.toLowerCase();

          const matches = (value) =>
            typeof value === "string" && value.toLowerCase().includes(term);

          const filteredData = report.data.filter((r) => {
            const matchesContext =
              contextFilter === "all" || r.context === contextFilter;

            if (!matchesContext) return false;
            if (!term) return true;

            if (searchField === "all") {
              return [
                r.pokemon,
                r.bucket,
                r.level,
                r.weight,
                r.context,
                r.biomes,
                r.dimensions,
                r.structures,
                r.canSeeSky?.toString(),
                r.isRaining?.toString(),
                r.moonPhase,
                r.neededNearbyBlocks,
                r.timeRange,
                r.lightLevel,
                r.antiBiomes,
                r.antiStructures,
              ]
                .filter(Boolean)
                .some(matches);
            } else {
              const value = r[searchField];
              return value && matches(value.toString());
            }
          });

          const visibleColumns = TABLE_COLUMNS.filter(({ key }) =>
            filteredData.some((d) => {
              const value = d[key];
              return Array.isArray(value)
                ? value.length > 0
                : typeof value === "boolean"
                ? true
                : value !== null && value !== undefined && value !== "";
            })
          );

          if (filteredData.length === 0) return null;
          return (
            <div
              key={report.id}
              className="bg-[#2a2a2a] p-4 rounded-lg shadow-md w-full overflow-hidden"
            >
              <details
                open={searchTerm ? true : report.expanded}
                onToggle={(e) => {
                  const open = e.target.open;
                  setFileReports((prev) =>
                    prev.map((r) =>
                      r.id === report.id
                        ? { ...r, expanded: open, showAll: false }
                        : r
                    )
                  );
                }}
              >
                <summary className="cursor-pointer flex justify-between items-center text-lg font-medium w-full truncate">
                  <span className="break-all truncate block max-w-full">
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
                    {searchTerm && (
                      <p className="ml-4 mt-2 text-gray-400 text-sm">
                        Showing {filteredData.length} matched entr
                        {filteredData.length === 1 ? "y" : "ies"}.
                      </p>
                    )}

                    <div className="mt-4">
                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm table-auto border-collapse min-w-[900px]">
                          <thead>
                            <tr>
                              {visibleColumns.map(
                                ({ key, label, sortable }) => (
                                  <th
                                    key={key}
                                    onClick={
                                      sortable
                                        ? () => toggleSort(key)
                                        : undefined
                                    }
                                    className={`p-2 border ${
                                      sortable
                                        ? "cursor-pointer hover:bg-[#333]"
                                        : ""
                                    } group`}
                                  >
                                    <div className="flex items-center justify-center gap-1">
                                      <span>{label}</span>
                                      {sort.column === key ? (
                                        sort.direction === "asc" ? (
                                          <ChevronUp size={14} />
                                        ) : (
                                          <ChevronDown size={14} />
                                        )
                                      ) : sortable ? (
                                        <ChevronsUpDown
                                          size={14}
                                          className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        />
                                      ) : null}
                                    </div>
                                  </th>
                                )
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {sortData(filteredData.slice(0, displayCount)).map(
                              (d, idx) => (
                                <tr key={idx} className="bg-[#222]">
                                  {visibleColumns.map(({ key }) => (
                                    <td key={key} className="p-2 border">
                                      {Array.isArray(d[key])
                                        ? d[key].join(", ")
                                        : d[key]?.toString() ?? ""}
                                    </td>
                                  ))}
                                </tr>
                              )
                            )}
                            {isLong && !report.showAll && (
                              <tr>
                                <td
                                  colSpan={visibleColumns.length}
                                  className="p-2 text-center"
                                >
                                  <button
                                    onClick={() =>
                                      setFileReports((prev) =>
                                        prev.map((r) =>
                                          r.id === report.id
                                            ? { ...r, showAll: true }
                                            : r
                                        )
                                      )
                                    }
                                    className="mt-2 px-3 py-1 bg-gray-700 rounded hover:bg-gray-800"
                                  >
                                    Show more
                                  </button>
                                </td>
                              </tr>
                            )}
                            {isLong && report.showAll && (
                              <tr>
                                <td
                                  colSpan={visibleColumns.length}
                                  className="p-2 text-center"
                                >
                                  <button
                                    onClick={() =>
                                      setFileReports((prev) =>
                                        prev.map((r) =>
                                          r.id === report.id
                                            ? { ...r, showAll: false }
                                            : r
                                        )
                                      )
                                    }
                                    className="mt-2 px-3 py-1 bg-gray-700 rounded hover:bg-gray-800"
                                  >
                                    Show less
                                  </button>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden flex flex-col gap-4">
                        {sortData(filteredData.slice(0, displayCount)).map(
                          (d, idx) => (
                            <div
                              key={idx}
                              className="bg-[#222] p-4 rounded border text-sm space-y-1"
                            >
                              {visibleColumns.map(({ key, label }) => (
                                <div key={key}>
                                  <strong>{label}:</strong>{" "}
                                  {Array.isArray(d[key])
                                    ? d[key].join(", ")
                                    : d[key]?.toString() ?? ""}
                                </div>
                              ))}
                            </div>
                          )
                        )}

                        {isLong && !report.showAll && (
                          <button
                            onClick={() =>
                              setFileReports((prev) =>
                                prev.map((r) =>
                                  r.id === report.id
                                    ? { ...r, showAll: true }
                                    : r
                                )
                              )
                            }
                            className="mt-2 px-3 py-1 bg-gray-700 rounded hover:bg-gray-800 self-center"
                          >
                            Show more
                          </button>
                        )}

                        {isLong && report.showAll && (
                          <button
                            onClick={() =>
                              setFileReports((prev) =>
                                prev.map((r) =>
                                  r.id === report.id
                                    ? { ...r, showAll: false }
                                    : r
                                )
                              )
                            }
                            className="mt-2 px-3 py-1 bg-gray-700 rounded hover:bg-gray-800 self-center"
                          >
                            Show less
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </details>
            </div>
          );
        })}
      </div>
    </div>
  );
}
