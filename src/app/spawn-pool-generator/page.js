"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const STORAGE_KEY = "ct_spawn_files_v2";

const CONTEXTS = ["grounded", "surface", "submerged", "fishing"];
const BUCKETS = ["common", "uncommon", "rare", "ultra-rare"];

const PRESET_OPTIONS = [
  "ancient_city",
  "derelict",
  "desert_pyramid",
  "end_city",
  "foliage",
  "illager_structures",
  "jungle_pyramid",
  "lava",
  "mansion",
  "natural",
  "nether_fossil",
  "nether_structures",
  "ocean_monument",
  "ocean_ruins",
  "pillager_outpost",
  "redstone",
  "ruined_portal",
  "salt",
  "stronghold",
  "trail_ruins",
  "treetop",
  "urban",
  "water",
  "webs",
  "wild",
];

// Condition schema definitions to drive the UI
const CONDITION_DEFS = [
  // list types
  { key: "dimensions", label: "Dimensions", type: "list" },
  { key: "biomes", label: "Biomes", type: "list" },
  { key: "structures", label: "Structures", type: "list" },
  { key: "neededNearbyBlocks", label: "Needed Nearby Blocks", type: "list" },
  { key: "neededBaseBlocks", label: "Needed Base Blocks", type: "list" },
  { key: "labels", label: "Labels", type: "list" },

  // numeric / integer
  { key: "moonPhase", label: "Moon Phase (0-7)", type: "number" },
  { key: "minX", label: "minX", type: "number" },
  { key: "minY", label: "minY", type: "number" },
  { key: "minZ", label: "minZ", type: "number" },
  { key: "maxX", label: "maxX", type: "number" },
  { key: "maxY", label: "maxY", type: "number" },
  { key: "maxZ", label: "maxZ", type: "number" },
  { key: "minLight", label: "minLight (0-15)", type: "number" },
  { key: "maxLight", label: "maxLight (0-15)", type: "number" },
  { key: "minSkyLight", label: "minSkyLight (0-15)", type: "number" },
  { key: "maxSkyLight", label: "maxSkyLight (0-15)", type: "number" },
  { key: "minWidth", label: "minWidth", type: "number" },
  { key: "maxWidth", label: "maxWidth", type: "number" },
  { key: "minHeight", label: "minHeight", type: "number" },
  { key: "maxHeight", label: "maxHeight", type: "number" },
  { key: "minDepth", label: "minDepth", type: "number" },
  { key: "maxDepth", label: "maxDepth", type: "number" },
  { key: "minLureLevel", label: "minLureLevel", type: "number" },
  { key: "maxLureLevel", label: "maxLureLevel", type: "number" },

  // boolean
  { key: "canSeeSky", label: "Can See Sky", type: "boolean" },
  { key: "isRaining", label: "Is Raining", type: "boolean" },
  { key: "isThundering", label: "Is Thundering", type: "boolean" },
  { key: "isSlimeChunk", label: "Is Slime Chunk", type: "boolean" },
  { key: "fluidIsSource", label: "Fluid Is Source", type: "boolean" },

  // string / text
  { key: "timeRange", label: "Time Range", type: "string" },
  { key: "fluidBlock", label: "Fluid Block (e.g., water)", type: "string" },
  { key: "bobber", label: "Bobber", type: "string" },
  { key: "bait", label: "Bait", type: "string" },

  // labelMode as free-form text
  { key: "labelMode", label: "Label Mode", type: "string" },
];

function emptySpawn(defaultName) {
  return {
    id: "",
    pokemon: defaultName || "",
    presets: [], // <- added presets array on spawn
    type: "pokemon",
    context: "grounded",
    bucket: "common",
    levelMode: "single",
    levelSingle: 1,
    levelRangeMin: 1,
    levelRangeMax: 1,
    weight: 1,
    condition: {},
    lastEdited: Date.now(),
    uiCollapsed: false,
  };
}

export default function SpawnPoolGenerator() {
  const [fileList, setFileList] = useState([]);
  const [activeFileIndex, setActiveFileIndex] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortMode, setSortMode] = useState("alpha"); // alpha | edited

  // preview panel state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewEditMode, setPreviewEditMode] = useState(false);
  const [previewEditContent, setPreviewEditContent] = useState("");

  // custom modal state
  const [modal, setModal] = useState({
    open: false,
    mode: null, // 'prompt' | 'confirm' | 'batch-merge'
    title: "",
    message: "",
    placeholder: "",
    defaultValue: "",
    mergeDetails: null,
    resolve: null,
  });
  const promptInputRef = useRef(null);

  // Import progress state
  const [importProgress, setImportProgress] = useState({
    isImporting: false,
    current: 0,
    total: 0,
    message: "",
  });

  // Validation helpers
  const isValidFileIndex = useCallback(
    (index) => {
      return index !== null && index >= 0 && index < fileList.length;
    },
    [fileList.length]
  );

  const isValidSpawnIndex = useCallback(
    (fileIndex, spawnIndex) => {
      return (
        isValidFileIndex(fileIndex) &&
        spawnIndex >= 0 &&
        spawnIndex < fileList[fileIndex]?.spawns?.length
      );
    },
    [isValidFileIndex, fileList]
  );

  // Sync JSON editor when file changes
  useEffect(() => {
    if (previewEditMode && isValidFileIndex(activeFileIndex)) {
      const currentJson = buildJsonForFile(fileList[activeFileIndex]);
      setPreviewEditContent(JSON.stringify(currentJson, null, 2));
    }
  }, [fileList, activeFileIndex, previewEditMode, isValidFileIndex]);

  // Escape key handler for modals
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape" && modal.open) {
        modal.resolve && modal.resolve(null);
        closeModal();
      }
    }

    if (modal.open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [modal]);

  function openPrompt({ title, message, placeholder, defaultValue = "" }) {
    return new Promise((resolve) => {
      setModal({
        open: true,
        mode: "prompt",
        title: title || "",
        message: message || "",
        placeholder: placeholder || "",
        defaultValue,
        resolve,
      });
    });
  }

  function openConfirm({ title, message }) {
    return new Promise((resolve) => {
      setModal({
        open: true,
        mode: "confirm",
        title: title || "",
        message: message || "",
        resolve,
      });
    });
  }

  function closeModal() {
    setModal((m) => ({ ...m, open: false }));
  }

  // load from storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setFileList(parsed);
          setActiveFileIndex(parsed.length ? 0 : null);
        }
      }
    } catch (e) {
      console.error("load error", e);
    }
  }, []);

  // save to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fileList));
    } catch (e) {
      console.error("save error", e);
    }
  }, [fileList]);

  // helpers
  function touchFile(copy, idx) {
    if (!copy[idx]) return copy;
    copy[idx].lastEdited = Date.now();
    return copy;
  }

  // ---------- File management ----------
  function addFile() {
    (async () => {
      const nameRaw = await openPrompt({
        title: "New File",
        message: "Enter filename (without .json). Example: marshadow",
        placeholder: "filename",
      });
      if (!nameRaw) return;
      const name = String(nameRaw).trim();
      if (!name) return alert("Invalid name.");
      if (fileList.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
        return alert("File already exists.");
      }
      const newFile = {
        name,
        spawns: [emptySpawn(name)],
        lastEdited: Date.now(),
      };
      setFileList((prev) => {
        const arr = [...prev, newFile];
        setActiveFileIndex(arr.length - 1);
        return arr;
      });
    })();
  }

  function removeFile(index) {
    if (!isValidFileIndex(index)) {
      console.error("Invalid file index:", index);
      return;
    }

    (async () => {
      const ok = await openConfirm({
        title: "Delete File",
        message: `Are you sure you want to delete "${fileList[index]?.name}.json"? This action cannot be undone.`,
      });
      if (!ok) return;

      setFileList((prev) => {
        const copy = [...prev];
        copy.splice(index, 1);
        if (activeFileIndex === index) {
          setActiveFileIndex(copy.length ? Math.max(0, index - 1) : null);
        } else if (activeFileIndex > index) {
          setActiveFileIndex((i) => i - 1);
        }
        return copy;
      });
    })();
  }

  function renameFile(index) {
    if (!isValidFileIndex(index)) {
      console.error("Invalid file index:", index);
      return;
    }

    (async () => {
      const current = fileList[index]?.name || "";
      const raw = await openPrompt({
        title: "Rename File",
        message: "New filename (without .json):",
        defaultValue: current,
      });
      if (!raw) return;
      const name = String(raw).trim();
      if (!name) return alert("Filename cannot be empty.");
      if (
        fileList.some(
          (f, i) => f.name.toLowerCase() === name.toLowerCase() && i !== index
        )
      ) {
        return alert(`A file named "${name}.json" already exists.`);
      }

      setFileList((prev) => {
        const copy = [...prev];
        const oldName = copy[index].name;
        copy[index].name = name;
        // update empty pokemon fields for spawns that still match old name
        copy[index].spawns = copy[index].spawns.map((s) => {
          if (!s.pokemon || s.pokemon === oldName) s.pokemon = name;
          return s;
        });
        touchFile(copy, index);
        return copy;
      });
    })();
  }

  function duplicateFile(index) {
    if (!isValidFileIndex(index)) {
      console.error("Invalid file index:", index);
      return;
    }

    const originalFile = fileList[index];
    if (!originalFile) return;

    // Find a unique name for the duplicate
    let newName = `${originalFile.name}-copy`;
    let counter = 1;
    while (
      fileList.some((f) => f.name.toLowerCase() === newName.toLowerCase())
    ) {
      newName = `${originalFile.name}-copy-${counter}`;
      counter++;
    }

    setFileList((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const duplicatedFile = {
        ...originalFile,
        name: newName,
        lastEdited: Date.now(),
        spawns: originalFile.spawns.map((spawn, spawnIndex) => ({
          ...spawn,
          id: spawn.id ? `${spawn.id}-copy` : `${newName}-${spawnIndex + 1}`,
          pokemon: spawn.pokemon || newName,
          lastEdited: Date.now(),
        })),
      };
      copy.push(duplicatedFile);
      setActiveFileIndex(copy.length - 1);
      return copy;
    });
  }

  function importJsonFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.multiple = true;

    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      if (!files.length) return;

      // Show loading modal
      setImportProgress({
        isImporting: true,
        current: 0,
        total: files.length,
        message: "Starting import...",
      });

      const results = [];
      let successCount = 0;
      let errorCount = 0;
      const mergeCandidates = []; // Track files that could be merged

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Update progress
        setImportProgress((prev) => ({
          ...prev,
          current: i + 1,
          message: `Processing ${file.name}...`,
        }));

        try {
          const jsonContent = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(JSON.parse(reader.result));
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsText(file);
          });

          // Check if it's a valid spawn pool file
          if (!jsonContent.spawns || !Array.isArray(jsonContent.spawns)) {
            results.push({
              file: file.name,
              success: false,
              error:
                'Not a valid spawn pool file. File must contain a "spawns" array.',
            });
            errorCount++;
            continue;
          }

          if (jsonContent.spawns.length === 0) {
            results.push({
              file: file.name,
              success: true,
              warning: "Empty file (no spawns)",
              spawnCount: 0,
            });
          } else {
            results.push({
              file: file.name,
              success: true,
              spawnCount: jsonContent.spawns.length,
            });
          }

          // Check for existing file with same base name
          const baseName = file.name.replace(".json", "");
          const existingFileIndex = fileList.findIndex(
            (f) => f.name === baseName
          );

          if (existingFileIndex !== -1) {
            // Found existing file with same name - offer merge
            mergeCandidates.push({
              newFile: {
                name: baseName,
                content: jsonContent,
                originalName: file.name,
              },
              existingFileIndex,
              existingFile: fileList[existingFileIndex],
            });
          } else {
            // Generate a unique filename
            let newName = baseName;
            let counter = 1;
            while (
              fileList.some(
                (f) => f.name.toLowerCase() === newName.toLowerCase()
              )
            ) {
              newName = `${baseName}-${counter}`;
              counter++;
            }

            // Convert spawn pool format to our internal format
            const importedFile = {
              name: newName,
              lastEdited: Date.now(),
              spawns: jsonContent.spawns.map((spawn, index) => {
                // Parse level string to our level format
                let levelMode = "single";
                let levelSingle = 1;
                let levelRangeMin = 1;
                let levelRangeMax = 1;

                if (spawn.level) {
                  const levelStr = String(spawn.level);
                  if (levelStr.includes("-")) {
                    const [min, max] = levelStr
                      .split("-")
                      .map((n) => parseInt(n) || 1);
                    levelMode = "range";
                    levelRangeMin = min;
                    levelRangeMax = max;
                  } else {
                    levelSingle = parseInt(levelStr) || 1;
                  }
                }

                return {
                  id: spawn.id || `${newName}-${index + 1}`,
                  pokemon: spawn.pokemon || newName,
                  presets: spawn.presets || [],
                  type: spawn.type || "pokemon",
                  context: spawn.context || "grounded",
                  bucket: spawn.bucket || "common",
                  levelMode,
                  levelSingle,
                  levelRangeMin,
                  levelRangeMax,
                  weight: spawn.weight || 1,
                  condition: spawn.condition || {},
                  lastEdited: Date.now(),
                  uiCollapsed: false,
                };
              }),
            };

            setFileList((prev) => {
              const newList = [...prev, importedFile];
              setActiveFileIndex(newList.length - 1);
              return newList;
            });

            successCount++;
          }
        } catch (error) {
          results.push({
            file: file.name,
            success: false,
            error: error.message,
          });
          errorCount++;
        }
      }

      // Hide loading modal
      setImportProgress({
        isImporting: false,
        current: 0,
        total: 0,
        message: "",
      });

      // Handle merge candidates
      if (mergeCandidates.length > 0) {
        await handleMergeCandidates(mergeCandidates);
      }

      // Show simple summary
      let summaryMessage = `Imported ${successCount} file(s) successfully.`;
      if (errorCount > 0) {
        summaryMessage += `\n\n${errorCount} file(s) failed to import.`;
      }
      if (mergeCandidates.length > 0) {
        summaryMessage += `\n\n${mergeCandidates.length} file(s) were merged with existing files.`;
      }

      await openConfirm({
        title: "Import Complete",
        message: summaryMessage,
      });
    };

    input.click();
  }

  async function handleMergeCandidates(mergeCandidates) {
    if (mergeCandidates.length === 0) return;

    // Create a comprehensive merge summary
    let mergeSummary = `Found ${mergeCandidates.length} file(s) that can be merged with existing files:\n\n`;

    const mergeDetails = [];

    for (const candidate of mergeCandidates) {
      const { newFile, existingFileIndex, existingFile } = candidate;

      // Analyze spawns for duplicates and new ones
      const newSpawns = newFile.content.spawns.map((spawn, index) => {
        // Parse level string to our level format
        let levelMode = "single";
        let levelSingle = 1;
        let levelRangeMin = 1;
        let levelRangeMax = 1;

        if (spawn.level) {
          const levelStr = String(spawn.level);
          if (levelStr.includes("-")) {
            const [min, max] = levelStr.split("-").map((n) => parseInt(n) || 1);
            levelMode = "range";
            levelRangeMin = min;
            levelRangeMax = max;
          } else {
            levelSingle = parseInt(levelStr) || 1;
          }
        }

        return {
          id: spawn.id || `${newFile.name}-${index + 1}`,
          pokemon: spawn.pokemon || newFile.name,
          presets: spawn.presets || [],
          type: spawn.type || "pokemon",
          context: spawn.context || "grounded",
          bucket: spawn.bucket || "common",
          levelMode,
          levelSingle,
          levelRangeMin,
          levelRangeMax,
          weight: spawn.weight || 1,
          condition: spawn.condition || {},
          lastEdited: Date.now(),
          uiCollapsed: false,
        };
      });

      // Check for duplicates and new spawns
      const duplicates = [];
      const newUniqueSpawns = [];

      for (const newSpawn of newSpawns) {
        const duplicateIndex = existingFile.spawns.findIndex((existingSpawn) =>
          isSpawnDuplicate(existingSpawn, newSpawn)
        );

        if (duplicateIndex !== -1) {
          duplicates.push({
            newSpawn,
            existingSpawn: existingFile.spawns[duplicateIndex],
            existingIndex: duplicateIndex,
          });
        } else {
          newUniqueSpawns.push(newSpawn);
        }
      }

      mergeDetails.push({
        candidate,
        duplicates,
        newUniqueSpawns,
        totalNew: newSpawns.length,
        totalExisting: existingFile.spawns.length,
      });

      mergeSummary += `• ${newFile.originalName} → ${newFile.name}.json\n`;
      mergeSummary += `  - ${newUniqueSpawns.length} new spawn(s)\n`;
      mergeSummary += `  - ${duplicates.length} duplicate(s) found\n`;
    }

    // Show batch merge options
    const mergeAction = await openBatchMergeDialog(mergeSummary, mergeDetails);

    if (mergeAction === "cancel") return;

    // Process the merge based on user choice
    for (const detail of mergeDetails) {
      const { candidate, duplicates, newUniqueSpawns } = detail;
      const { existingFileIndex, existingFile } = candidate;

      let finalSpawns = [...existingFile.spawns];

      // Add new unique spawns
      finalSpawns.push(...newUniqueSpawns);

      // Handle duplicates based on user choice
      if (mergeAction === "update-duplicates") {
        // Replace existing spawns with new ones
        for (const duplicate of duplicates) {
          finalSpawns[duplicate.existingIndex] = duplicate.newSpawn;
        }
      } else if (mergeAction === "skip-duplicates") {
        // Keep existing spawns, skip new duplicates
        // (already handled by not adding them)
      } else if (mergeAction === "replace-all") {
        // Replace all spawns with new ones
        finalSpawns = [
          ...newUniqueSpawns,
          ...duplicates.map((d) => d.newSpawn),
        ];
      }

      // Update the existing file
      setFileList((prev) => {
        const fileListCopy = JSON.parse(JSON.stringify(prev));
        fileListCopy[existingFileIndex] = {
          ...fileListCopy[existingFileIndex],
          spawns: finalSpawns,
          lastEdited: Date.now(),
        };
        setActiveFileIndex(existingFileIndex);
        return fileListCopy;
      });
    }
  }

  async function openBatchMergeDialog(summary, mergeDetails) {
    return new Promise((resolve) => {
      setModal({
        open: true,
        mode: "batch-merge",
        title: "Merge Files",
        message: summary,
        mergeDetails,
        resolve,
      });
    });
  }

  function isSpawnDuplicate(spawn1, spawn2) {
    // Check if two spawns are essentially the same
    // Compare key properties that would make them duplicates

    // Basic properties
    if (spawn1.pokemon !== spawn2.pokemon) return false;
    if (spawn1.context !== spawn2.context) return false;
    if (spawn1.bucket !== spawn2.bucket) return false;

    // Level comparison
    const level1 =
      spawn1.levelMode === "single"
        ? spawn1.levelSingle
        : `${spawn1.levelRangeMin}-${spawn1.levelRangeMax}`;
    const level2 =
      spawn2.levelMode === "single"
        ? spawn2.levelSingle
        : `${spawn2.levelRangeMin}-${spawn2.levelRangeMax}`;
    if (level1 !== level2) return false;

    // Weight comparison (with small tolerance for floating point)
    if (Math.abs(spawn1.weight - spawn2.weight) > 0.01) return false;

    // Presets comparison
    const presets1 = (spawn1.presets || []).sort();
    const presets2 = (spawn2.presets || []).sort();
    if (JSON.stringify(presets1) !== JSON.stringify(presets2)) return false;

    // Condition comparison (simplified - could be more sophisticated)
    const condition1 = JSON.stringify(spawn1.condition || {});
    const condition2 = JSON.stringify(spawn2.condition || {});
    if (condition1 !== condition2) return false;

    return true;
  }

  function selectFile(i) {
    setActiveFileIndex(i);
  }

  // SPAWN ENTRY MANAGEMENT
  function addSpawnToFile(fileIndex) {
    if (!isValidFileIndex(fileIndex)) {
      console.error("Invalid file index:", fileIndex);
      return;
    }

    setFileList((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy[fileIndex].spawns.push(emptySpawn(copy[fileIndex].name));
      touchFile(copy, fileIndex);
      return copy;
    });
  }

  function removeSpawn(fileIndex, spawnIndex) {
    if (!isValidSpawnIndex(fileIndex, spawnIndex)) {
      console.error("Invalid spawn index:", { fileIndex, spawnIndex });
      return;
    }

    (async () => {
      const spawnName =
        fileList[fileIndex]?.spawns[spawnIndex]?.pokemon ||
        `spawn #${spawnIndex + 1}`;
      const ok = await openConfirm({
        title: "Delete Spawn",
        message: `Are you sure you want to delete "${spawnName}"? This action cannot be undone.`,
      });
      if (!ok) return;

      setFileList((prev) => {
        const copy = JSON.parse(JSON.stringify(prev));
        copy[fileIndex].spawns.splice(spawnIndex, 1);
        touchFile(copy, fileIndex);
        return copy;
      });
    })();
  }

  function duplicateSpawn(fileIndex, spawnIndex) {
    if (!isValidSpawnIndex(fileIndex, spawnIndex)) {
      console.error("Invalid spawn index:", { fileIndex, spawnIndex });
      return;
    }

    setFileList((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const spawn = JSON.parse(
        JSON.stringify(copy[fileIndex].spawns[spawnIndex])
      );
      if (spawn.id) spawn.id = `${spawn.id}-dup`;
      copy[fileIndex].spawns.splice(spawnIndex + 1, 0, spawn);
      touchFile(copy, fileIndex);
      return copy;
    });
  }

  function updateSpawnField(fileIndex, spawnIndex, field, value) {
    if (!isValidSpawnIndex(fileIndex, spawnIndex)) {
      console.error("Invalid spawn index:", { fileIndex, spawnIndex });
      return;
    }

    setFileList((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy[fileIndex].spawns[spawnIndex][field] = value;
      touchFile(copy, fileIndex);
      return copy;
    });
  }

  function toggleSpawnCollapsed(fileIndex, spawnIndex) {
    if (!isValidSpawnIndex(fileIndex, spawnIndex)) {
      console.error("Invalid spawn index:", { fileIndex, spawnIndex });
      return;
    }

    setFileList((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const spawn = copy[fileIndex]?.spawns?.[spawnIndex];
      if (spawn) {
        spawn.uiCollapsed = !spawn.uiCollapsed;
        touchFile(copy, fileIndex);
      }
      return copy;
    });
  }

  function setAllSpawnsCollapsed(fileIndex, collapsed) {
    if (!isValidFileIndex(fileIndex)) {
      console.error("Invalid file index:", fileIndex);
      return;
    }

    setFileList((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const spawns = copy[fileIndex]?.spawns || [];
      for (const s of spawns) s.uiCollapsed = collapsed;
      touchFile(copy, fileIndex);
      return copy;
    });
  }

  function getLevelSummaryForSpawn(spawn) {
    if (spawn.levelMode === "single") return String(spawn.levelSingle);
    return `${spawn.levelRangeMin}-${spawn.levelRangeMax}`;
  }

  function getConditionKeyCount(spawn) {
    return Object.keys(spawn.condition || {}).length;
  }

  // CONDITION MANAGEMENT
  function addConditionKey(fileIndex, spawnIndex, key) {
    if (!isValidSpawnIndex(fileIndex, spawnIndex)) {
      console.error("Invalid spawn index:", { fileIndex, spawnIndex });
      return;
    }

    setFileList((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const cond = copy[fileIndex].spawns[spawnIndex].condition || {};
      if (cond.hasOwnProperty(key)) {
        return copy;
      }
      const def = CONDITION_DEFS.find((d) => d.key === key);
      if (!def) return copy;
      if (def.type === "list") cond[key] = [];
      else if (def.type === "number") cond[key] = "";
      else if (def.type === "boolean") cond[key] = false;
      else if (def.type === "enum") cond[key] = def.options[0];
      else cond[key] = "";
      copy[fileIndex].spawns[spawnIndex].condition = cond;
      touchFile(copy, fileIndex);
      return copy;
    });
  }

  function removeConditionKey(fileIndex, spawnIndex, key) {
    if (!isValidSpawnIndex(fileIndex, spawnIndex)) {
      console.error("Invalid spawn index:", { fileIndex, spawnIndex });
      return;
    }

    setFileList((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const cond = copy[fileIndex].spawns[spawnIndex].condition || {};
      if (cond.hasOwnProperty(key)) delete cond[key];
      copy[fileIndex].spawns[spawnIndex].condition = cond;
      touchFile(copy, fileIndex);
      return copy;
    });
  }

  // Bulk-add for list-type: COMMA-separated (dedupe)
  function addConditionListItems(fileIndex, spawnIndex, key) {
    if (!isValidSpawnIndex(fileIndex, spawnIndex)) {
      console.error("Invalid spawn index:", { fileIndex, spawnIndex });
      return;
    }

    (async () => {
      const raw = await openPrompt({
        title: "Add",
        message: `Add values for ${key} (paste comma-separated). Example: minecraft:plains, minecraft:dark_forest`,
        placeholder: `${key}1, ${key}2`,
      });
      if (!raw) return;
      const items = String(raw)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!items.length) return;

      setFileList((prev) => {
        const copy = JSON.parse(JSON.stringify(prev));
        const cond = copy[fileIndex].spawns[spawnIndex].condition || {};
        cond[key] = cond[key] || [];
        const existing = new Set(cond[key]);
        for (const it of items) {
          if (!existing.has(it)) {
            cond[key].push(it);
            existing.add(it);
          }
        }
        copy[fileIndex].spawns[spawnIndex].condition = cond;
        touchFile(copy, fileIndex);
        return copy;
      });
    })();
  }

  function removeConditionListItem(fileIndex, spawnIndex, key, idx) {
    if (!isValidSpawnIndex(fileIndex, spawnIndex)) {
      console.error("Invalid spawn index:", { fileIndex, spawnIndex });
      return;
    }

    setFileList((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const cond = copy[fileIndex].spawns[spawnIndex].condition || {};
      if (Array.isArray(cond[key])) cond[key].splice(idx, 1);
      copy[fileIndex].spawns[spawnIndex].condition = cond;
      touchFile(copy, fileIndex);
      return copy;
    });
  }

  function setConditionValue(fileIndex, spawnIndex, key, value) {
    if (!isValidSpawnIndex(fileIndex, spawnIndex)) {
      console.error("Invalid spawn index:", { fileIndex, spawnIndex });
      return;
    }

    setFileList((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const cond = copy[fileIndex].spawns[spawnIndex].condition || {};
      cond[key] = value;
      copy[fileIndex].spawns[spawnIndex].condition = cond;
      touchFile(copy, fileIndex);
      return copy;
    });
  }

  // ---------- PRESETS management ----------
  function addPresetsBulkToSpawn(fileIndex, spawnIndex) {
    if (!isValidSpawnIndex(fileIndex, spawnIndex)) {
      console.error("Invalid spawn index:", { fileIndex, spawnIndex });
      return;
    }

    (async () => {
      const raw = await openPrompt({
        title: "Bulk Add Presets",
        message: "Add preset(s) comma-separated. Example: natural, foliage",
        placeholder: "natural, foliage",
      });
      if (!raw) return;
      const items = String(raw)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!items.length) return;

      setFileList((prev) => {
        const copy = JSON.parse(JSON.stringify(prev));
        const s = copy[fileIndex].spawns[spawnIndex];
        s.presets = s.presets || [];
        const existing = new Set(s.presets);
        for (const it of items) {
          if (!existing.has(it)) {
            s.presets.push(it);
            existing.add(it);
          }
        }
        touchFile(copy, fileIndex);
        return copy;
      });
    })();
  }

  function addPresetToSpawn(fileIndex, spawnIndex, preset) {
    if (!isValidSpawnIndex(fileIndex, spawnIndex)) {
      console.error("Invalid spawn index:", { fileIndex, spawnIndex });
      return;
    }
    if (!preset) return;

    setFileList((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const s = copy[fileIndex].spawns[spawnIndex];
      s.presets = s.presets || [];
      if (!s.presets.includes(preset)) s.presets.push(preset);
      touchFile(copy, fileIndex);
      return copy;
    });
  }

  function removePresetFromSpawn(fileIndex, spawnIndex, idx) {
    if (!isValidSpawnIndex(fileIndex, spawnIndex)) {
      console.error("Invalid spawn index:", { fileIndex, spawnIndex });
      return;
    }

    setFileList((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const s = copy[fileIndex].spawns[spawnIndex];
      if (Array.isArray(s.presets)) s.presets.splice(idx, 1);
      touchFile(copy, fileIndex);
      return copy;
    });
  }

  // Build JSON for a file
  function buildJsonForFile(file) {
    const spawns = file.spawns.map((s, i) => {
      let levelStr = "";
      if (s.levelMode === "single") levelStr = String(s.levelSingle);
      else levelStr = `${s.levelRangeMin}-${s.levelRangeMax}`;

      // Build spawn object with ordered keys and conditional presets immediately after pokemon
      const spawnObj = {
        id: s.id || `${file.name}-${i + 1}`,
        pokemon: s.pokemon || file.name,
      };

      if (Array.isArray(s.presets) && s.presets.length > 0) {
        spawnObj.presets = s.presets.slice();
      }

      Object.assign(spawnObj, {
        type: "pokemon",
        context: s.context,
        bucket: s.bucket,
        level: levelStr,
        weight: Number(s.weight) || 0,
      });

      const cond = s.condition || {};
      if (cond && Object.keys(cond).length > 0) {
        const cleaned = {};
        for (const k of Object.keys(cond)) {
          const v = cond[k];
          if (Array.isArray(v)) {
            if (v.length) cleaned[k] = v;
          } else if (v === "" || v === null || typeof v === "undefined") {
            // skip
          } else {
            cleaned[k] = v;
          }
        }
        if (Object.keys(cleaned).length > 0) spawnObj.condition = cleaned;
      }

      return spawnObj;
    });

    return {
      enabled: true,
      neededInstalledMods: [],
      neededUninstalledMods: [],
      spawns,
    };
  }

  // ZIP download
  async function downloadZip() {
    if (!fileList.length) {
      alert("No files to export.");
      return;
    }
    const zip = new JSZip();

    // Add pack.mcmeta at root level
    const packMcmeta = {
      pack: {
        pack_format: 34,
        description: "Made with CobbleToolkit Spawn Pool Generator by maru",
      },
    };
    zip.file("pack.mcmeta", JSON.stringify(packMcmeta, null, 2));

    // Add spawn pool files in data/cobblemon/spawn_pool_world/
    const base = zip
      .folder("data")
      .folder("cobblemon")
      .folder("spawn_pool_world");
    for (const f of fileList) {
      const obj = buildJsonForFile(f);
      base.file(`${f.name}.json`, JSON.stringify(obj, null, 2));
    }
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "spawn_pool_world_datapack.zip");
  }

  function updateFileFromJson(jsonString) {
    if (!isValidFileIndex(activeFileIndex)) {
      alert("No valid file selected for editing.");
      return false;
    }

    try {
      const parsed = JSON.parse(jsonString);

      // Validate the structure
      if (!parsed.spawns || !Array.isArray(parsed.spawns)) {
        throw new Error("Invalid structure: missing or invalid 'spawns' array");
      }

      if (parsed.spawns.length === 0) {
        throw new Error("Spawns array cannot be empty");
      }

      // Validate each spawn has required fields
      for (let i = 0; i < parsed.spawns.length; i++) {
        const spawn = parsed.spawns[i];
        if (!spawn.pokemon) {
          throw new Error(
            `Spawn at index ${i} is missing required 'pokemon' field`
          );
        }
        if (
          spawn.weight !== undefined &&
          (isNaN(spawn.weight) || spawn.weight < 0)
        ) {
          throw new Error(
            `Spawn at index ${i} has invalid weight: ${spawn.weight}. Weight must be a non-negative number.`
          );
        }
        if (
          spawn.level &&
          typeof spawn.level !== "string" &&
          typeof spawn.level !== "number"
        ) {
          throw new Error(
            `Spawn at index ${i} has invalid level: ${spawn.level}. Level must be a string or number.`
          );
        }
      }

      // Convert external format to internal format
      const updatedSpawns = parsed.spawns.map((spawn, index) => {
        // Parse level string to our level format
        let levelMode = "single";
        let levelSingle = 1;
        let levelRangeMin = 1;
        let levelRangeMax = 1;

        if (spawn.level) {
          const levelStr = String(spawn.level);
          if (levelStr.includes("-")) {
            const [min, max] = levelStr.split("-").map((n) => parseInt(n) || 1);
            levelMode = "range";
            levelRangeMin = min;
            levelRangeMax = max;
          } else {
            levelSingle = parseInt(levelStr) || 1;
          }
        }

        return {
          id: spawn.id || `${fileList[activeFileIndex].name}-${index + 1}`,
          pokemon: spawn.pokemon || fileList[activeFileIndex].name,
          presets: spawn.presets || [],
          type: spawn.type || "pokemon",
          context: spawn.context || "grounded",
          bucket: spawn.bucket || "common",
          levelMode,
          levelSingle,
          levelRangeMin,
          levelRangeMax,
          weight: spawn.weight || 1,
          condition: spawn.condition || {},
          lastEdited: Date.now(),
          uiCollapsed: false,
        };
      });

      // Update the file
      setFileList((prev) => {
        const copy = JSON.parse(JSON.stringify(prev));
        copy[activeFileIndex] = {
          ...copy[activeFileIndex],
          spawns: updatedSpawns,
          lastEdited: Date.now(),
        };

        // Update the preview content with the new data
        const updatedFile = copy[activeFileIndex];
        const newJson = buildJsonForFile(updatedFile);
        setPreviewEditContent(JSON.stringify(newJson, null, 2));

        return copy;
      });

      // Show success message
      alert(`Successfully updated file with ${updatedSpawns.length} spawn(s)!`);
      return true;
    } catch (error) {
      alert(
        `Invalid JSON: ${error.message}\n\nPlease check your syntax and try again.`
      );
      return false;
    }
  }

  function togglePreviewEditMode() {
    if (!isValidFileIndex(activeFileIndex)) {
      alert("No valid file selected for editing.");
      return;
    }

    if (!previewEditMode) {
      // Entering edit mode - populate with current JSON
      const currentJson = buildJsonForFile(fileList[activeFileIndex]);
      setPreviewEditContent(JSON.stringify(currentJson, null, 2));
    }
    setPreviewEditMode(!previewEditMode);
  }

  // file list filtering / sorting
  function getFilteredSortedFiles() {
    let list = [...fileList];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((f) => f.name.toLowerCase().includes(q));
    }
    if (sortMode === "alpha") list.sort((a, b) => a.name.localeCompare(b.name));
    else list.sort((a, b) => (b.lastEdited || 0) - (a.lastEdited || 0));
    return list;
  }

  // Condition editor renderer
  function renderConditionEditor(fileIndex, spawnIndex) {
    if (!isValidSpawnIndex(fileIndex, spawnIndex)) {
      console.error("Invalid spawn index:", { fileIndex, spawnIndex });
      return null;
    }

    const spawn = fileList[fileIndex].spawns[spawnIndex];
    const condition = spawn.condition || {};

    return (
      <div className="mt-3 p-3 bg-[#111218] rounded border border-[#242635]">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">Conditions</div>
          <div className="flex items-center gap-2">
            {/* Selecting a condition auto-adds it.
                If it's a list-type condition, selecting will immediately prompt for comma-separated items. */}
            <select
              id={`cond-picker-${fileIndex}-${spawnIndex}`}
              className="bg-[#1f1f23] p-1 rounded border text-sm"
              defaultValue=""
              onChange={(e) => {
                const key = e.target.value;
                if (!key) return;
                const def = CONDITION_DEFS.find((d) => d.key === key);
                addConditionKey(fileIndex, spawnIndex, key);
                if (def && def.type === "list") {
                  // bulk-add prompt immediately after creating the key
                  addConditionListItems(fileIndex, spawnIndex, key);
                }
                // reset the select back to placeholder
                e.target.selectedIndex = 0;
              }}
            >
              <option value="" disabled>
                Add condition...
              </option>
              {CONDITION_DEFS.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>
            {/* No "Add" button — selection triggers add (bulk prompt for lists) */}
          </div>
        </div>

        <div className="max-h-72 overflow-auto pr-1">
          {Object.keys(condition).length === 0 ? (
            <div className="text-gray-400 text-sm">No conditions set</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.keys(condition).map((key) => {
                const def = CONDITION_DEFS.find((d) => d.key === key) || {
                  type: typeof condition[key],
                };
                const val = condition[key];

                // list-type UI
                if (def.type === "list") {
                  return (
                    <div key={key} className="bg-[#0b1220] p-2 rounded h-full">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{def.label}</div>
                        <div className="flex gap-2">
                          {/* Bulk add is default (also available here) */}
                          <button
                            onClick={() =>
                              addConditionListItems(fileIndex, spawnIndex, key)
                            }
                            className="text-xs bg-green-600 px-2 py-1 rounded"
                          >
                            Bulk Add
                          </button>
                          <button
                            onClick={() =>
                              removeConditionKey(fileIndex, spawnIndex, key)
                            }
                            className="text-xs bg-red-600 px-2 py-1 rounded"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 space-y-2">
                        {(!val || !val.length) && (
                          <div className="text-gray-400 text-sm">Empty</div>
                        )}
                        {val &&
                          val.map((it, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="bg-[#071018] px-2 py-1 rounded text-sm">
                                {it}
                              </div>
                              <button
                                onClick={() =>
                                  removeConditionListItem(
                                    fileIndex,
                                    spawnIndex,
                                    key,
                                    idx
                                  )
                                }
                                className="text-red-500"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                }

                // number-type
                if (def.type === "number") {
                  return (
                    <div
                      key={key}
                      className="bg-[#071018] p-2 rounded flex items-center justify-between h-full"
                    >
                      <div>
                        <div className="font-medium">{def.label}</div>
                        <input
                          type="number"
                          value={val}
                          onChange={(e) =>
                            setConditionValue(
                              fileIndex,
                              spawnIndex,
                              key,
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                            )
                          }
                          className="mt-1 p-1 rounded bg-[#121217] border w-32"
                          autoComplete="off"
                          min="0"
                          step="0.1"
                        />
                      </div>
                      <button
                        onClick={() =>
                          removeConditionKey(fileIndex, spawnIndex, key)
                        }
                        className="text-xs bg-red-600 px-2 py-1 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  );
                }

                // boolean-type
                if (def.type === "boolean") {
                  return (
                    <div
                      key={key}
                      className="bg-[#071018] p-2 rounded flex items-center justify-between h-full"
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{def.label}</div>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={!!val}
                            onChange={(e) =>
                              setConditionValue(
                                fileIndex,
                                spawnIndex,
                                key,
                                e.target.checked
                              )
                            }
                          />
                          <span className="text-sm">
                            {val ? "True" : "False"}
                          </span>
                        </label>
                      </div>
                      <button
                        onClick={() =>
                          removeConditionKey(fileIndex, spawnIndex, key)
                        }
                        className="text-xs bg-red-600 px-2 py-1 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  );
                }

                // enum
                if (def.type === "enum") {
                  return (
                    <div
                      key={key}
                      className="bg-[#071018] p-2 rounded flex items-center justify-between h-full"
                    >
                      <div>
                        <div className="font-medium">{def.label}</div>
                        <select
                          value={val}
                          onChange={(e) =>
                            setConditionValue(
                              fileIndex,
                              spawnIndex,
                              key,
                              e.target.value
                            )
                          }
                          className="mt-1 p-1 rounded bg-[#121217] border"
                        >
                          {def.options.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() =>
                          removeConditionKey(fileIndex, spawnIndex, key)
                        }
                        className="text-xs bg-red-600 px-2 py-1 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  );
                }

                // default to string
                return (
                  <div
                    key={key}
                    className="bg-[#071018] p-2 rounded flex items-center justify-between h-full"
                  >
                    <div>
                      <div className="font-medium">{def.label || key}</div>
                      <input
                        type="text"
                        value={val ?? ""}
                        onChange={(e) =>
                          setConditionValue(
                            fileIndex,
                            spawnIndex,
                            key,
                            e.target.value
                          )
                        }
                        className="mt-1 p-1 rounded bg-[#121217] border w-64"
                        placeholder={`Enter ${def.label || key}`}
                        spellCheck={false}
                      />
                    </div>
                    <button
                      onClick={() =>
                        removeConditionKey(fileIndex, spawnIndex, key)
                      }
                      className="text-xs bg-red-600 px-2 py-1 rounded"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // UI
  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white px-4 py-8">
      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
        {/* Left column: file manager */}
        <div className="col-span-12 md:col-span-3 bg-[#2a2a2a] p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Files</h2>
            <div className="flex gap-1">
              <button
                onClick={addFile}
                className="text-xs bg-green-500 px-2 py-1.5 rounded hover:bg-green-600 flex items-center justify-center transition-colors"
                title="Add File"
                aria-label="Add File"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
              <button
                onClick={importJsonFile}
                className="text-xs bg-blue-500 px-2 py-1.5 rounded hover:bg-blue-600 flex items-center justify-center transition-colors"
                title="Import JSON"
                aria-label="Import JSON"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
              <button
                onClick={async () => {
                  const ok = await openConfirm({
                    title: "Clear All",
                    message: `Are you sure you want to clear all ${fileList.length} saved files? This action cannot be undone and all your work will be lost.`,
                  });
                  if (!ok) return;
                  setFileList([]);
                  setActiveFileIndex(null);
                  localStorage.removeItem(STORAGE_KEY);
                }}
                className="text-xs bg-gray-600 px-2 py-1.5 rounded hover:bg-gray-700 flex items-center justify-center transition-colors"
                title="Clear All"
                aria-label="Clear All"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mb-4">
            <input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 rounded bg-[#1f1f1f] border text-sm"
              autoComplete="off"
              spellCheck={false}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
              <span>Sort:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setSortMode("alpha")}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    sortMode === "alpha"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                  title="Sort alphabetically"
                >
                  A→Z
                </button>
                <button
                  onClick={() => setSortMode("edited")}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    sortMode === "edited"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                  title="Sort by last edited"
                >
                  Recent
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1 max-h-[50vh] overflow-auto">
            {getFilteredSortedFiles().length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">
                No files yet. Add a file to start.
              </p>
            )}
            {getFilteredSortedFiles().map((f) => {
              const idx = fileList.findIndex(
                (x) => x.name === f.name && x.lastEdited === f.lastEdited
              );
              return (
                <div
                  key={`${f.name}-${f.lastEdited}`}
                  onClick={() => selectFile(idx)}
                  className={`group p-2 rounded flex items-center justify-between cursor-pointer transition-all ${
                    activeFileIndex === idx
                      ? "bg-[#1e1e1e] ring-1 ring-purple-600"
                      : "hover:bg-[#222]"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">
                      {f.name}.json
                    </div>
                    <div className="text-xs text-gray-400">
                      {f.spawns.length} spawn{f.spawns.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        renameFile(idx);
                      }}
                      className="p-1 rounded bg-yellow-500 hover:bg-yellow-600 text-black flex items-center justify-center transition-colors"
                      title="Rename"
                      aria-label="Rename"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3 h-3"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateFile(idx);
                      }}
                      className="p-1 rounded bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors"
                      title="Duplicate"
                      aria-label="Duplicate"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3 h-3"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        ></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(idx);
                      }}
                      className="p-1 rounded bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
                      title="Delete"
                      aria-label="Delete"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3 h-3"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-[#3a3a3a]">
            <button
              onClick={downloadZip}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded transition-colors font-medium"
            >
              Download Datapack ZIP
            </button>
          </div>
        </div>

        {/* Right column: editor */}
        <div className="col-span-12 md:col-span-9">
          {!fileList.length || activeFileIndex === null ? (
            <div className="bg-[#2a2a2a] p-6 rounded-lg shadow text-center">
              <p className="text-gray-300 mb-4">
                No file selected. Add a file on the left and click it to start
                editing.
              </p>
              <button
                onClick={addFile}
                className="bg-blue-600 px-4 py-2 rounded text-white"
              >
                Create File
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#2a2a2a] p-4 rounded-lg shadow flex items-center justify-between sticky top-0 z-10">
                <div>
                  <h2 className="text-xl font-semibold">
                    {fileList[activeFileIndex].name}.json
                  </h2>
                </div>
                <div className="flex gap-2 flex-wrap justify-end overflow-x-auto">
                  <button
                    onClick={() => addSpawnToFile(activeFileIndex)}
                    className="bg-green-500 p-2 rounded text-white hover:bg-green-600 flex items-center justify-center"
                    title="Add Spawn Entry"
                    aria-label="Add Spawn Entry"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setAllSpawnsCollapsed(activeFileIndex, true)}
                    className="bg-gray-700 p-2 rounded text-white hover:bg-gray-600 flex items-center justify-center"
                    title="Collapse All"
                    aria-label="Collapse All"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <path d="M6 15l6-6 6 6" />
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      setAllSpawnsCollapsed(activeFileIndex, false)
                    }
                    className="bg-gray-700 p-2 rounded text-white hover:bg-gray-600 flex items-center justify-center"
                    title="Expand All"
                    aria-label="Expand All"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <path d="M18 9l-6 6-6-6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        JSON.stringify(
                          buildJsonForFile(fileList[activeFileIndex]),
                          null,
                          2
                        )
                      );
                      alert("JSON copied to clipboard");
                    }}
                    className="bg-gray-600 p-2 rounded text-white hover:bg-gray-700 flex items-center justify-center"
                    title="Copy JSON"
                    aria-label="Copy JSON"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <rect
                        x="9"
                        y="9"
                        width="13"
                        height="13"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* spawn entries */}
              <div className="bg-[#2a2a2a] p-4 rounded-lg shadow space-y-4 max-h-[68vh] overflow-auto pr-2">
                {fileList[activeFileIndex].spawns.length === 0 && (
                  <p className="text-gray-400">
                    No spawns yet. Click &quot;Add Spawn Entry&quot;.
                  </p>
                )}

                {fileList[activeFileIndex].spawns.map((s, si) => (
                  <div
                    key={si}
                    className="bg-[#1e1e1e] p-3 rounded border border-[#2b2d3a] hover:border-[#3b3d4c] transition-colors"
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() =>
                            toggleSpawnCollapsed(activeFileIndex, si)
                          }
                          className="w-7 h-7 rounded bg-[#2a2a34] flex items-center justify-center hover:bg-[#333545]"
                          title={s.uiCollapsed ? "Expand" : "Collapse"}
                        >
                          <span className="text-lg leading-none">
                            {s.uiCollapsed ? "▸" : "▾"}
                          </span>
                        </button>
                        <div className="text-base font-medium truncate">
                          Spawn #{si + 1}
                        </div>
                        <div className="hidden md:flex items-center gap-2 ml-2 text-xs text-gray-300 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-[#20222c] border border-[#2c2f3d]">
                            Lvl: {getLevelSummaryForSpawn(s)}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#20222c] border border-[#2c2f3d]">
                            Ctx: {s.context}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#20222c] border border-[#2c2f3d]">
                            Bucket: {s.bucket}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#20222c] border border-[#2c2f3d]">
                            Presets: {(s.presets || []).length}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#20222c] border border-[#2c2f3d]">
                            Cond: {getConditionKeyCount(s)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => duplicateSpawn(activeFileIndex, si)}
                          className="bg-yellow-500 p-2 rounded text-black hover:bg-yellow-400 flex items-center justify-center"
                          title="Duplicate"
                          aria-label="Duplicate"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4"
                          >
                            <rect
                              x="9"
                              y="9"
                              width="13"
                              height="13"
                              rx="2"
                              ry="2"
                            ></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                        </button>
                        <button
                          onClick={() => removeSpawn(activeFileIndex, si)}
                          className="bg-red-600 p-2 rounded hover:bg-red-500 flex items-center justify-center"
                          title="Delete"
                          aria-label="Delete"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4"
                          >
                            <path d="M3 6h18" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Card Body */}
                    {!s.uiCollapsed && (
                      <div className="mt-3">
                        <div className="grid grid-cols-12 gap-3">
                          <div className="col-span-6">
                            <label className="text-sm text-gray-300">ID</label>
                            <input
                              type="text"
                              value={s.id}
                              onChange={(e) =>
                                updateSpawnField(
                                  activeFileIndex,
                                  si,
                                  "id",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 mt-1 rounded bg-[#2a2a2a] border"
                              placeholder={`${fileList[activeFileIndex].name}-${
                                si + 1
                              }`}
                              autoComplete="off"
                              spellCheck={false}
                            />
                          </div>

                          <div className="col-span-6">
                            <label className="text-sm text-gray-300">
                              Pokemon
                            </label>
                            <input
                              type="text"
                              value={s.pokemon}
                              onChange={(e) =>
                                updateSpawnField(
                                  activeFileIndex,
                                  si,
                                  "pokemon",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 mt-1 rounded bg-[#2a2a2a] border"
                              placeholder={fileList[activeFileIndex].name}
                              autoComplete="off"
                              spellCheck={false}
                            />
                          </div>

                          <div className="col-span-3">
                            <label className="text-sm text-gray-300">
                              Context
                            </label>
                            <select
                              value={s.context}
                              onChange={(e) =>
                                updateSpawnField(
                                  activeFileIndex,
                                  si,
                                  "context",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 mt-1 rounded bg-[#2a2a2a] border"
                            >
                              {CONTEXTS.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-3">
                            <label className="text-sm text-gray-300">
                              Bucket
                            </label>
                            <select
                              value={s.bucket}
                              onChange={(e) =>
                                updateSpawnField(
                                  activeFileIndex,
                                  si,
                                  "bucket",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 mt-1 rounded bg-[#2a2a2a] border"
                            >
                              {BUCKETS.map((b) => (
                                <option key={b} value={b}>
                                  {b}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Presets column */}
                          <div className="col-span-3">
                            <label className="text-sm text-gray-300">
                              Presets
                            </label>
                            <div className="mt-1 flex gap-2 items-center">
                              <select
                                defaultValue=""
                                className="w-full p-2 rounded bg-[#2a2a2a] border text-sm"
                                onChange={async (e) => {
                                  const val = e.target.value;
                                  if (!val) return;
                                  if (val === "__custom__") {
                                    const raw = await openPrompt({
                                      title: "Custom Presets",
                                      message:
                                        "Add custom preset(s) comma-separated (e.g. natural, foliage)",
                                      placeholder: "natural, foliage",
                                    });
                                    if (!raw) {
                                      e.target.selectedIndex = 0;
                                      return;
                                    }
                                    const items = String(raw)
                                      .split(",")
                                      .map((s) => s.trim())
                                      .filter(Boolean);
                                    if (items.length) {
                                      setFileList((prev) => {
                                        const copy = JSON.parse(
                                          JSON.stringify(prev)
                                        );
                                        const spawnObj =
                                          copy[activeFileIndex].spawns[si];
                                        spawnObj.presets =
                                          spawnObj.presets || [];
                                        const existing = new Set(
                                          spawnObj.presets
                                        );
                                        for (const it of items) {
                                          if (!existing.has(it)) {
                                            spawnObj.presets.push(it);
                                            existing.add(it);
                                          }
                                        }
                                        touchFile(copy, activeFileIndex);
                                        return copy;
                                      });
                                    }
                                  } else {
                                    addPresetToSpawn(activeFileIndex, si, val);
                                  }
                                  e.target.selectedIndex = 0;
                                }}
                              >
                                <option value="" disabled>
                                  Add preset...
                                </option>
                                {PRESET_OPTIONS.map((p) => (
                                  <option key={p} value={p}>
                                    {p}
                                  </option>
                                ))}
                                <option value="__custom__">Custom...</option>
                              </select>
                              <button
                                onClick={() =>
                                  addPresetsBulkToSpawn(activeFileIndex, si)
                                }
                                className="text-xs bg-green-600 px-2 py-1 rounded"
                              >
                                Bulk Add
                              </button>
                            </div>

                            <div className="mt-2 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
                              {(!s.presets || !s.presets.length) && (
                                <div className="text-gray-400 text-sm">
                                  No presets
                                </div>
                              )}
                              {(s.presets || []).map((pr, pidx) => (
                                <div
                                  key={pidx}
                                  className="inline-flex items-center gap-1"
                                >
                                  <div className="bg-[#071018] px-2 py-1 rounded text-sm inline-block">
                                    {pr}
                                  </div>
                                  <button
                                    onClick={() =>
                                      removePresetFromSpawn(
                                        activeFileIndex,
                                        si,
                                        pidx
                                      )
                                    }
                                    className="text-red-500"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="col-span-3">
                            <label className="text-sm text-gray-300">
                              Weight
                            </label>
                            <input
                              type="number"
                              value={s.weight}
                              onChange={(e) =>
                                updateSpawnField(
                                  activeFileIndex,
                                  si,
                                  "weight",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 mt-1 rounded bg-[#2a2a2a] border"
                              autoComplete="off"
                              min="0"
                              step="0.1"
                            />
                          </div>

                          <div className="col-span-3">
                            <label className="text-sm text-gray-300">
                              Level
                            </label>
                            <div className="mt-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`levelmode-${activeFileIndex}-${si}`}
                                  checked={s.levelMode === "single"}
                                  onChange={() =>
                                    updateSpawnField(
                                      activeFileIndex,
                                      si,
                                      "levelMode",
                                      "single"
                                    )
                                  }
                                />
                                <span className="text-sm">Single</span>
                                <input
                                  type="number"
                                  value={s.levelSingle}
                                  onChange={(e) =>
                                    updateSpawnField(
                                      activeFileIndex,
                                      si,
                                      "levelSingle",
                                      e.target.value
                                    )
                                  }
                                  className="ml-2 p-1 rounded w-20 bg-[#2a2a2a] border"
                                  autoComplete="off"
                                  min="1"
                                  step="1"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`levelmode-${activeFileIndex}-${si}`}
                                  checked={s.levelMode === "range"}
                                  onChange={() =>
                                    updateSpawnField(
                                      activeFileIndex,
                                      si,
                                      "levelMode",
                                      "range"
                                    )
                                  }
                                />
                                <span className="text-sm">Range</span>
                                <input
                                  type="number"
                                  value={s.levelRangeMin}
                                  onChange={(e) =>
                                    updateSpawnField(
                                      activeFileIndex,
                                      si,
                                      "levelRangeMin",
                                      e.target.value
                                    )
                                  }
                                  className="ml-2 p-1 rounded w-20 bg-[#2a2a2a] border"
                                  placeholder="min"
                                  autoComplete="off"
                                  min="1"
                                  step="1"
                                />
                                <span>-</span>
                                <input
                                  type="number"
                                  value={s.levelRangeMax}
                                  onChange={(e) =>
                                    updateSpawnField(
                                      activeFileIndex,
                                      si,
                                      "levelRangeMax",
                                      e.target.value
                                    )
                                  }
                                  className="p-1 rounded w-20 bg-[#2a2a2a] border"
                                  placeholder="max"
                                  autoComplete="off"
                                  min="1"
                                  step="1"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* condition editor */}
                        {renderConditionEditor(activeFileIndex, si)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky collapsible JSON preview (bottom-right) */}
      <div
        className="fixed right-4 bottom-4 z-50"
        style={{ width: previewOpen ? "520px" : "220px" }}
      >
        <div
          className={`bg-[#2a2a2a] rounded-lg shadow-lg overflow-hidden border`}
          style={{ maxHeight: previewOpen ? "60vh" : "48px" }}
        >
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-3">
              <div className="font-medium text-sm">
                {fileList[activeFileIndex]?.name
                  ? `${fileList[activeFileIndex].name}.json`
                  : "No file"}
              </div>
              {previewOpen && (
                <div className="text-xs text-gray-300">
                  {fileList[activeFileIndex]
                    ? `${fileList[activeFileIndex].spawns.length} spawns`
                    : ""}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {previewOpen && (
                <>
                  <button
                    onClick={() => {
                      if (!fileList[activeFileIndex]) return;
                      navigator.clipboard?.writeText(
                        JSON.stringify(
                          buildJsonForFile(fileList[activeFileIndex]),
                          null,
                          2
                        )
                      );
                      alert("JSON copied to clipboard");
                    }}
                    className="text-xs px-2 py-1 rounded bg-gray-600 hover:bg-gray-700"
                  >
                    Copy
                  </button>
                  <button
                    onClick={togglePreviewEditMode}
                    className={`text-xs px-2 py-1 rounded ${
                      previewEditMode
                        ? "bg-orange-600 hover:bg-orange-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    } text-white`}
                  >
                    {previewEditMode ? "Save" : "Edit"}
                  </button>
                </>
              )}
              <button
                onClick={() => setPreviewOpen((p) => !p)}
                className="text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
              >
                {previewOpen ? "Close" : "Preview"}
              </button>
            </div>
          </div>

          {previewOpen &&
            activeFileIndex !== null &&
            fileList[activeFileIndex] && (
              <div
                className="p-3 bg-[#0b0b0b] text-sm overflow-auto"
                style={{ maxHeight: "calc(60vh - 64px)" }}
              >
                {previewEditMode ? (
                  <div className="space-y-3">
                    <textarea
                      value={previewEditContent}
                      onChange={(e) => setPreviewEditContent(e.target.value)}
                      className="w-full h-48 p-2 rounded bg-[#1a1a1a] border border-[#333] text-xs font-mono resize-none"
                      placeholder="Edit JSON here..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (updateFileFromJson(previewEditContent)) {
                            setPreviewEditMode(false);
                          }
                        }}
                        className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs"
                      >
                        Apply Changes
                      </button>
                      <button
                        onClick={() => {
                          setPreviewEditMode(false);
                          // Reset to current JSON
                          const currentJson = buildJsonForFile(
                            fileList[activeFileIndex]
                          );
                          setPreviewEditContent(
                            JSON.stringify(currentJson, null, 2)
                          );
                        }}
                        className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-700 text-white text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(
                      buildJsonForFile(fileList[activeFileIndex]),
                      null,
                      2
                    )}
                  </pre>
                )}
              </div>
            )}
        </div>
      </div>

      {/* Loading Modal for Import Progress */}
      {importProgress.isImporting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-[101] w-full max-w-md mx-4 rounded-lg bg-[#1f1f23] border border-[#2c2f3d] shadow-xl">
            <div className="px-4 py-3 border-b border-[#2c2f3d]">
              <div className="text-base font-semibold">Importing Files...</div>
            </div>
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-300 mb-2">
                  {importProgress.message}
                </div>
                <div className="text-xs text-gray-400">
                  {importProgress.current} of {importProgress.total} files
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (importProgress.current / importProgress.total) * 100
                    }%`,
                  }}
                />
              </div>

              <div className="text-center">
                <div className="text-xs text-gray-400">
                  Please wait while files are being processed...
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => {
              modal.resolve && modal.resolve(null);
              closeModal();
            }}
          />
          <div className="relative z-[101] w-full max-w-2xl mx-4 rounded-lg bg-[#1f1f23] border border-[#2c2f3d] shadow-xl">
            <div className="px-4 py-3 border-b border-[#2c2f3d]">
              <div className="text-base font-semibold">{modal.title}</div>
              {modal.message &&
                modal.mode !== "confirm" &&
                modal.mode !== "batch-merge" && (
                  <div className="text-sm text-gray-300 mt-1 max-h-32 overflow-y-auto">
                    {modal.message}
                  </div>
                )}
            </div>
            <div className="p-4">
              {modal.mode === "prompt" && (
                <input
                  autoFocus
                  type="text"
                  defaultValue={modal.defaultValue}
                  placeholder={modal.placeholder}
                  className="w-full p-2 rounded bg-[#2a2a2a] border"
                  ref={promptInputRef}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      modal.resolve && modal.resolve(e.currentTarget.value);
                      closeModal();
                    }
                  }}
                />
              )}
              {modal.mode === "confirm" && (
                <div className="text-sm text-gray-300 max-h-64 overflow-y-auto">
                  {modal.message}
                </div>
              )}
              {modal.mode === "batch-merge" && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-300 max-h-48 overflow-y-auto">
                    {modal.message}
                  </div>

                  <div className="border-t border-[#2c2f3d] pt-4">
                    <div className="text-sm font-medium mb-3">
                      How would you like to handle duplicates?
                    </div>

                    <div className="space-y-2 text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="merge-option"
                          value="skip-duplicates"
                          defaultChecked
                          className="text-blue-600"
                        />
                        <span className="text-gray-300">
                          <strong>Skip duplicates</strong> - Keep existing
                          spawns, ignore new duplicates
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="merge-option"
                          value="update-duplicates"
                          className="text-blue-600"
                        />
                        <span className="text-gray-300">
                          <strong>Update duplicates</strong> - Replace existing
                          spawns with new versions
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="merge-option"
                          value="replace-all"
                          className="text-blue-600"
                        />
                        <span className="text-gray-300">
                          <strong>Replace all</strong> - Replace all spawns with
                          new ones (keeps unique + duplicates)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-[#2c2f3d] flex justify-end gap-2">
              <button
                onClick={() => {
                  modal.resolve && modal.resolve(null);
                  closeModal();
                }}
                className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (modal.mode === "prompt") {
                    const val = promptInputRef.current
                      ? promptInputRef.current.value
                      : "";
                    modal.resolve && modal.resolve(val);
                  } else if (modal.mode === "confirm") {
                    modal.resolve && modal.resolve(true);
                  } else if (modal.mode === "batch-merge") {
                    const selectedOption = document.querySelector(
                      'input[name="merge-option"]:checked'
                    )?.value;
                    modal.resolve &&
                      modal.resolve(selectedOption || "skip-duplicates");
                  }
                  closeModal();
                }}
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
              >
                {modal.mode === "prompt"
                  ? "OK"
                  : modal.mode === "batch-merge"
                  ? "Merge Files"
                  : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
