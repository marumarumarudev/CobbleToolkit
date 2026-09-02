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
  try {
    return JSON.parse(content);
  } catch {
    logWarn(`Direct JSON parse failed for ${filePath}, trying clean...`);
  }

  try {
    return JSON.parse(cleanJsonString(content));
  } catch {
    logWarn(`Cleaned JSON parse failed for ${filePath}, trying aggressive clean...`);
  }

  try {
    return JSON.parse(aggressiveClean(content));
  } catch {
    logWarn(`Aggressive cleaning failed for ${filePath}, trying fallback extraction...`);
  }

  if (typeof options.extractFallback === "function") {
    try {
      const fallback = options.extractFallback(content);
      if (fallback) {
        logWarn(`Using fallback parsing for ${filePath} — basic fields only`);
        return fallback;
      }
    } catch {
      logWarn(`Fallback extraction failed for ${filePath}`);
    }
  }

  return null;
}
