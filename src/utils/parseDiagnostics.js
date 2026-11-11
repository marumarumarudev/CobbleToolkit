// Cap retained examples, not counts: malformed packs must not create an
// unbounded second dataset just to explain their parsing failures.
export function createParseDiagnostics(limit = 100) {
  const entries = [];
  let total = 0;
  let repairCount = 0;
  return {
    record(diagnostic) {
      total += 1;
      if (["repaired-json", "fallback-json"].includes(diagnostic.code)) repairCount += 1;
      if (entries.length < limit) entries.push({ ...diagnostic });
    },
    snapshot() {
      return {
        total,
        repairCount,
        skipCount: total - repairCount,
        omittedCount: total - entries.length,
        entries: entries.map((entry) => ({ ...entry })),
      };
    },
  };
}
