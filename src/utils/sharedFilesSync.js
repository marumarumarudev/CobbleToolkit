const CHANNEL = "cobbletoolkit:shared-files:v1";
const STORAGE_KEY = "cobbletoolkit:shared-files-signal";

// Only invalidation hints cross tabs; archives/results are read from IndexedDB.
export function createSharedFilesSync(onMessage, environment = globalThis) {
  const source = environment.crypto.randomUUID();
  const channel = environment.BroadcastChannel ? new environment.BroadcastChannel(CHANNEL) : null;
  const receive = (message) => {
    if (message?.source !== source && ["invalidate", "changed"].includes(message?.type)) onMessage(message);
  };
  const onStorage = (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try { receive(JSON.parse(event.newValue)); } catch { /* Ignore unrelated/malformed signals. */ }
  };
  if (channel) channel.onmessage = (event) => receive(event.data);
  else environment.addEventListener("storage", onStorage);
  return {
    publish(type) {
      const message = { type, source, nonce: environment.crypto.randomUUID() };
      if (channel) channel.postMessage(message);
      else {
        try { environment.localStorage.setItem(STORAGE_KEY, JSON.stringify(message)); }
        catch { /* Focus refresh remains available when storage events are unavailable. */ }
      }
    },
    close() {
      channel?.close();
      if (!channel) environment.removeEventListener("storage", onStorage);
    },
  };
}
