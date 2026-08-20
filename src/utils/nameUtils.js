export function formatPokemonName(name) {
  if (!name || typeof name !== "string") return name;

  if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/.test(name.trim())) {
    return name.trim();
  }

  let formatted = name.replace(/_/g, " ");

  formatted = formatted.replace(/([a-z])([A-Z])/g, "$1 $2");

  const words = formatted
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((word) => {
      const lower = word.toLowerCase();
      if (lower === "mr" || lower === "mrs" || lower === "ms") {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });

  return words.join(" ");
}

export function normalizeSearchTerm(term) {
  if (!term || typeof term !== "string") return "";
  return term.toLowerCase().replace(/_/g, " ").replace(/\s+/g, " ").trim();
}

export function normalizeValueForSearch(value) {
  if (Array.isArray(value)) {
    return value.map((v) => normalizeSearchTerm(String(v))).join(" ");
  }
  if (value === null || value === undefined) return "";
  return normalizeSearchTerm(String(value));
}

// Strips every separator character searches shouldn't care about — spaces,
// hyphens, underscores, apostrophes — so "iron valiant", "Iron-Valiant",
// and "ironvaliant" all collapse to the same "ironvaliant" string and match
// each other regardless of which form the query or the underlying data uses.
function stripSeparators(value) {
  return value.replace(/[\s\-_']/g, "");
}

export function matchesSearch(searchTerm, value) {
  const normalizedSearch = normalizeSearchTerm(searchTerm);
  const normalizedValue = normalizeValueForSearch(value);
  if (normalizedValue.includes(normalizedSearch)) return true;

  const fuzzySearch = stripSeparators(normalizedSearch);
  if (!fuzzySearch) return false;
  const fuzzyValue = stripSeparators(normalizedValue);
  return fuzzyValue.includes(fuzzySearch);
}

