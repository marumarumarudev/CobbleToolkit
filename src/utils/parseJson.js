import { checkAbort, rethrowProcessingError } from "./archiveProcessing.js";
/**
 * Shared robust JSON parsing for Cobblemon datapack files.
 * Tries strict parse first, then progressive cleanups, then best-effort field extraction.
 */

const DEBUG =
  typeof process !== "undefined" && process.env.NODE_ENV === "development";

function logWarn(...args) {
  if (DEBUG) console.warn(...args);
}

/**
 * Strip BOM / control characters and common JSON syntax issues from datapack dumps.
 */
export function cleanJsonString(jsonString) {
  let cleaned = jsonString.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  cleaned = cleaned
    // trailing commas before } or ]
    .replace(/,(\s*[}\]])/g, "$1")
    // BOM
    .replace(/^\uFEFF/, "")
    // invalid escape sequences
    .replace(/\\(?!["\\/bfnrt])/g, "\\\\")
    // bare newlines inside what might be strings (best-effort)
    .replace(/\n(?=.*")/g, "\\n")
    .replace(/\r(?=.*")/g, "\\r")
    .replace(/[\u2028\u2029]/g, "");

  return cleaned;
}

function aggressiveClean(content) {
  return content
    .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
    .replace(/\\(?!["\\/bfnrt])/g, "\\\\")
    .replace(/,(\s*[}\]])/g, "$1")
    .replace(/^\uFEFF/, "");
}

/**
 * @param {string} content
 * @param {string} [filePath]
 * @param {{ extractFallback?: (content: string) => object | null }} [options]
 * @returns {object | null}
 */
export function parseJsonWithFallbacks(content, filePath = "unknown", options = {}) {
  const { signal, onDiagnostic = () => {}, allowRepair = true } = options;
  checkAbort(signal);
  const emit = (code, message) => onDiagnostic({ path: filePath, code, message });
  try {
    return JSON.parse(content);
  } catch (error) {
    rethrowProcessingError(error);
    logWarn(`Direct JSON parse failed for ${filePath}, trying clean...`);
  }

  if (!allowRepair) {
    emit("invalid-json", "Strict JSON parsing failed; repairs disabled.");
    return null;
  }
  try {
    const value = JSON.parse(cleanJsonString(content));
    emit("repaired-json", "Cleaned JSON formatting.");
    return value;
  } catch (error) {
    rethrowProcessingError(error);
    logWarn(`Cleaned JSON parse failed for ${filePath}, trying aggressive clean...`);
  }

  try {
    const value = JSON.parse(aggressiveClean(content));
    emit("repaired-json", "Aggressively cleaned JSON formatting.");
    return value;
  } catch (error) {
    rethrowProcessingError(error);
    logWarn(`Aggressive cleaning failed for ${filePath}, trying fallback extraction...`);
  }

  if (typeof options.extractFallback === "function") {
    try {
      const fallback = options.extractFallback(content);
      if (fallback) {
        logWarn(`Using fallback parsing for ${filePath} — basic fields only`);
        emit("fallback-json", "Extracted partial fields from invalid JSON.");
        return fallback;
      }
    } catch (error) {
      rethrowProcessingError(error);
      logWarn(`Fallback extraction failed for ${filePath}`);
    }
  }

  emit("invalid-json", "JSON parsing and repairs failed.");
  return null;
}
