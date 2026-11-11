import { test } from "node:test";
import assert from "node:assert/strict";
import { matchesSearch, searchMatchScore, searchNameSuggestions } from "../src/utils/nameUtils.js";

const ironNames = [
  "iron-boulder", "iron-bundle", "iron-crown", "iron-hands", "iron-jugulis",
  "iron-leaves", "iron-moth", "iron-thorns", "iron-treads", "iron-valiant",
];

test("Iron suggestions include Iron Valiant beyond the former eight-result cutoff", () => {
  const names = searchNameSuggestions(["lairon", "aron", ...ironNames], "Iron");
  assert.ok(names.includes("iron-valiant"));
  assert.deepEqual(names.slice(0, ironNames.length), ironNames);
  assert.equal(searchNameSuggestions(ironNames, "iron valiant")[0], "iron-valiant");
});

test("all tool searches accept partial, separated, compact, and camel-case species names", () => {
  for (const value of ["Iron Valiant", "iron-valiant", "iron_valiant", "ironValiant", "ironvaliant"]) {
    for (const query of ["Iron", "valiant", "IRON VALIANT", "iron_valiant", "ironvaliant", "iron va"]) {
      assert.equal(matchesSearch(query, value), true, `${query} should match ${value}`);
    }
  }
  assert.equal(matchesSearch("valiant iron", "Iron Valiant"), true);
});

test("punctuation and accents do not block species or item searches", () => {
  assert.equal(matchesSearch("flabebe", "Flabébé"), true);
  assert.equal(matchesSearch("farfetchd", "Farfetch’d"), true);
  assert.equal(matchesSearch("mr mime", "mr-mime"), true);
  assert.equal(matchesSearch("iron ingot", "minecraft:iron_ingot"), true);
  assert.equal(matchesSearch("cobblemon is jungle", "#cobblemon:is_jungle"), true);
});

test("small word typos and transpositions match without changing exact-match ranking", () => {
  for (const query of ["irno valiant", "iron valint", "iron valient", "ironvalant"]) {
    assert.equal(matchesSearch(query, "iron-valiant"), true, query);
  }
  assert.ok(searchMatchScore("iron valiant", "iron-valiant") < searchMatchScore("iron valiant", "iron-variant"));
  assert.equal(searchNameSuggestions(["iron-variant", "iron-valiant"], "iron valiant")[0], "iron-valiant");
});

test("short and numeric queries do not get typo tolerance", () => {
  assert.equal(matchesSearch("cat", "bat"), false);
  assert.equal(matchesSearch("12", 13), false);
  assert.equal(matchesSearch("1234", 1235), false);
  assert.equal(matchesSearch("12", 12), true);
  assert.equal(matchesSearch("xyzzypokemon", "iron-valiant"), false);
  assert.equal(matchesSearch("---", "iron-valiant"), false);
});

test("array fields, nulls, whitespace, and suggestion limits remain predictable", () => {
  assert.equal(matchesSearch("iron", ["normal", "iron-valiant"]), true);
  assert.equal(matchesSearch("iron", null), false);
  assert.equal(matchesSearch("  ", "anything"), true);
  assert.deepEqual(searchNameSuggestions(ironNames, "  "), []);
  assert.equal(searchNameSuggestions(ironNames, "iron", 3).length, 3);
});
