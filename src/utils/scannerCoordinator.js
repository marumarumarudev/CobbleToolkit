// One queue orders metadata mutations, scanner commits, and purges. Parsing
// stays outside it so removal does not wait for archive decompression.
export function createScannerCoordinator() {
  let tail = Promise.resolve();
  let generation = 0;
  return {
    enqueue(operation) {
      const result = tail.then(operation);
      tail = result.catch(() => {});
      return result;
    },
    getGeneration: () => generation,
    invalidate: () => { generation += 1; },
  };
}
