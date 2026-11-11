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
  return term
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function normalizeValueForSearch(value) {
  if (Array.isArray(value)) {
    return value.map((v) => normalizeSearchTerm(String(v))).join(" ");
  }
  if (value === null || value === undefined) return "";
  return normalizeSearchTerm(String(value));
}

// One insertion, deletion, substitution, or adjacent transposition. Short
// queries and numeric filters intentionally do not use approximate matching.
function isOneEditAway(query, word) {
  if (Math.abs(query.length - word.length) > 1) return false;
  let index = 0;
  while (index < Math.min(query.length, word.length) && query[index] === word[index]) index++;
  if (index === Math.min(query.length, word.length)) return true;
  if (query.length === word.length) {
    return query.slice(index + 1) === word.slice(index + 1) ||
      (query[index] === word[index + 1] && query[index + 1] === word[index] &&
        query.slice(index + 2) === word.slice(index + 2));
  }
  return query.length > word.length
    ? query.slice(index + 1) === word.slice(index)
    : query.slice(index) === word.slice(index + 1);
}

export function searchMatchScore(searchTerm, value) {
  const query = normalizeSearchTerm(searchTerm);
  if (!query) return typeof searchTerm === "string" && searchTerm.trim() ? Infinity : 0;
  const text = normalizeValueForSearch(value);
  const compactQuery = query.replace(/ /g, "");
  const compactText = text.replace(/ /g, "");
  if (compactText === compactQuery) return 0;
  if (compactText.startsWith(compactQuery)) return 1;
  if (compactText.includes(compactQuery)) return 2;

  const terms = query.split(" ");
  const words = text.split(" ");
  if (terms.every((term) => words.some((word) => word.includes(term)))) return 3;
  if (compactQuery.length >= 4 && /^\p{L}+$/u.test(compactQuery) && /^\p{L}+$/u.test(compactText) && isOneEditAway(compactQuery, compactText)) return 4;
  if (terms.every((term) => words.some((word) => word.includes(term) ||
    (term.length >= 4 && /^\p{L}+$/u.test(term) && /^\p{L}+$/u.test(word) && isOneEditAway(term, word))))) return 4;
  return Infinity;
}

export function matchesSearch(searchTerm, value) {
  return Number.isFinite(searchMatchScore(searchTerm, value));
}

export function searchNameSuggestions(names, query, limit = 20) {
  if (!query?.trim()) return [];
  return names.map((name) => ({ name, score: searchMatchScore(query, name) }))
    .filter(({ score }) => Number.isFinite(score))
    .sort((a, b) => a.score - b.score || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map(({ name }) => name);
}

