// A selection owns success, error, and loading updates until a newer selection
// starts. Increment sequence.current on unmount to invalidate pending work too.
export async function runLatestRequest(sequence, request, { onSuccess, onError, onSettled }) {
  const requestId = ++sequence.current;
  try {
    const value = await request();
    if (requestId === sequence.current) onSuccess(value);
  } catch (error) {
    if (requestId === sequence.current) onError(error);
  } finally {
    if (requestId === sequence.current) onSettled();
  }
}

// Return unused choices in cycle order, excluding the current ingredient and
// every occupied sibling slot (including fixed goal/rarity ingredients).
export function getSeasoningAlternatives(slots, pool, slotIndex) {
  const slot = slots[slotIndex];
  if (!slot || slot.slotKind !== "targeting") return [];
  const currentId = slot.selectedId ?? slot.seasoning?.id;
  const occupied = new Set(slots.map((s) => s.selectedId ?? s.seasoning?.id));
  const currentIndex = pool.findIndex((candidate) => candidate?.seasoning?.id === currentId);
  const alternatives = [];
  for (let step = 1; step <= pool.length; step++) {
    const candidate = pool[(currentIndex + step) % pool.length];
    const id = candidate?.seasoning?.id;
    if (!id || occupied.has(id)) continue;
    alternatives.push(candidate);
    occupied.add(id);
  }
  return alternatives;
}

export function cycleSeasoningSlot(slots, pool, slotIndex) {
  const next = getSeasoningAlternatives(slots, pool, slotIndex)[0];
  if (!next) return slots;
  return slots.map((slot, i) => i === slotIndex
    ? { ...slot, selectedId: next.seasoning.id }
    : slot);
}
