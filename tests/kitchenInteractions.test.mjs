import { test } from "node:test";
import assert from "node:assert/strict";
import {
  runLatestRequest,
  getSeasoningAlternatives,
  cycleSeasoningSlot,
} from "../src/utils/kitchenInteractions.js";

function deferred() {
  let resolve, reject;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}

function selectionHarness() {
  const sequence = { current: 0 };
  const state = { target: null, error: null, loading: false };
  return {
    sequence,
    state,
    select(request) {
      state.target = null;
      state.error = null;
      state.loading = true;
      return runLatestRequest(sequence, () => request.promise, {
        onSuccess: (value) => { state.target = value; },
        onError: (error) => { state.error = error.message; },
        onSettled: () => { state.loading = false; },
      });
    },
  };
}

test("late species success cannot overwrite the newer selected species", async () => {
  const harness = selectionHarness();
  const a = deferred(), b = deferred();
  const first = harness.select(a);
  const second = harness.select(b);
  b.resolve({ name: "B" });
  await second;
  a.resolve({ name: "A" });
  await first;
  assert.deepEqual(harness.state, { target: { name: "B" }, error: null, loading: false });
});

test("stale failure and finally leave the newer request loading", async () => {
  const harness = selectionHarness();
  const a = deferred(), b = deferred();
  const first = harness.select(a);
  const second = harness.select(b);
  a.reject(new Error("old failure"));
  await first;
  assert.deepEqual(harness.state, { target: null, error: null, loading: true });
  b.resolve({ name: "B" });
  await second;
  assert.deepEqual(harness.state, { target: { name: "B" }, error: null, loading: false });
});

test("stale success cannot hide a failure from the latest species request", async () => {
  const harness = selectionHarness();
  const a = deferred(), b = deferred();
  const first = harness.select(a);
  const second = harness.select(b);
  b.reject(new Error("latest failure"));
  await second;
  a.resolve({ name: "A" });
  await first;
  assert.deepEqual(harness.state, { target: null, error: "latest failure", loading: false });
});

test("invalidating selection on unmount suppresses all completion callbacks", async () => {
  const harness = selectionHarness();
  const request = deferred();
  const pending = harness.select(request);
  harness.sequence.current += 1;
  request.resolve({ name: "A" });
  await pending;
  assert.deepEqual(harness.state, { target: null, error: null, loading: true });
});

const choice = (id) => ({ seasoning: { id, name: id }, reason: `Reason for ${id}` });
const slot = (id, slotKind = "targeting") => ({ ...choice(id), slotKind, selectedId: id });

test("saturated three-choice pool disables every cycle without duplicating slots", () => {
  const pool = ["eggant", "pomeg", "chilan"].map(choice);
  const slots = ["eggant", "pomeg", "chilan"].map((id) => slot(id));
  for (let index = 0; index < slots.length; index++) {
    assert.deepEqual(getSeasoningAlternatives(slots, pool, index), []);
    assert.equal(cycleSeasoningSlot(slots, pool, index), slots);
  }
});

test("cycling skips occupied ingredients including fixed slots and wraps in pool order", () => {
  const slots = [slot("b"), slot("c"), slot("d", "fixed")];
  const pool = ["a", "b", "c", "d", "e"].map(choice);
  assert.deepEqual(getSeasoningAlternatives(slots, pool, 0).map((item) => item.seasoning.id), ["e", "a"]);
  const next = cycleSeasoningSlot(slots, pool, 0);
  assert.equal(next[0].selectedId, "e");
  assert.equal(next[1], slots[1]);
  assert.equal(next[2], slots[2]);
  assert.equal(slots[0].selectedId, "b");
  assert.equal(cycleSeasoningSlot(next, pool, 0)[0].selectedId, "a");
  // The same selected ID resolves both the pot icon and the card's reason.
  assert.equal(pool.find((item) => item.seasoning.id === next[0].selectedId).reason, "Reason for e");
});

test("fixed, empty, single-choice, and duplicate pools do not advertise a no-op", () => {
  const slots = [slot("a"), slot("b", "fixed")];
  assert.deepEqual(getSeasoningAlternatives(slots, [choice("a")], 0), []);
  assert.deepEqual(getSeasoningAlternatives(slots, [choice("c")], 1), []);
  assert.deepEqual(getSeasoningAlternatives(slots, [choice("c")], 2), []);
  assert.deepEqual(getSeasoningAlternatives(slots, [], 0), []);
  assert.deepEqual(getSeasoningAlternatives(slots, [null, choice("a"), choice("c"), choice("c")], 0), [choice("c")]);
});

test("successive functional slot updates cannot pick a sibling's new ingredient", () => {
  const pool = ["a", "b", "c"].map(choice);
  const slots = [slot("a"), slot("b")];
  const first = cycleSeasoningSlot(slots, pool, 0);
  const second = cycleSeasoningSlot(first, pool, 1);
  assert.deepEqual(second.map((item) => item.selectedId), ["c", "a"]);
});
