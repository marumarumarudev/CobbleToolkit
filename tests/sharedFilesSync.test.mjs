import { test } from "node:test";
import assert from "node:assert/strict";
import { createSharedFilesSync } from "../src/utils/sharedFilesSync.js";

function environments(useChannel) {
  let id = 0;
  const peers = [];
  const channels = new Set();
  class Channel {
    constructor() { channels.add(this); }
    postMessage(data) { for (const peer of channels) if (peer !== this) peer.onmessage?.({ data }); }
    close() { channels.delete(this); }
  }
  return () => {
    const listeners = new Set();
    const environment = {
      crypto: { randomUUID: () => String(++id) },
      BroadcastChannel: useChannel ? Channel : undefined,
      addEventListener: (name, listener) => { if (name === "storage") listeners.add(listener); },
      removeEventListener: (name, listener) => { if (name === "storage") listeners.delete(listener); },
      localStorage: { setItem(key, newValue) {
        for (const peer of peers) if (peer !== environment) peer.deliver({ key, newValue });
      } },
      deliver: (event) => { for (const listener of listeners) listener(event); },
    };
    peers.push(environment);
    return environment;
  };
}

for (const mode of [true, false]) {
  test(`cross-tab ${mode ? "BroadcastChannel" : "storage fallback"} signals invalidate and refresh without echo`, () => {
    const environment = environments(mode);
    const left = [], right = [];
    const a = createSharedFilesSync((event) => left.push(event.type), environment());
    const b = createSharedFilesSync((event) => right.push(event.type), environment());
    a.publish("invalidate");
    a.publish("changed");
    assert.deepEqual(left, []);
    assert.deepEqual(right, ["invalidate", "changed"]);
    b.publish("changed");
    assert.deepEqual(left, ["changed"]);
    b.close();
    a.publish("changed");
    assert.deepEqual(right, ["invalidate", "changed"]);
    a.close();
  });
}

test("fallback ignores malformed payloads and unrelated storage keys", () => {
  const environment = environments(false)();
  const received = [];
  const sync = createSharedFilesSync((event) => received.push(event), environment);
  environment.deliver({ key: "other", newValue: "{}" });
  environment.deliver({ key: "cobbletoolkit:shared-files-signal", newValue: "not json" });
  environment.deliver({ key: "cobbletoolkit:shared-files-signal", newValue: '{"type":"unknown"}' });
  assert.deepEqual(received, []);
  sync.close();
});
