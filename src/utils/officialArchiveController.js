export function createOfficialArchiveController({ download, prepare, commit, onState }) {
  let current = null;
  const cancel = () => {
    current?.abort();
    current = null;
    onState({ status: 'idle' });
  };
  return {
    cancel,
    async load(release) {
      current?.abort();
      const controller = new AbortController();
      current = controller;
      const signal = controller.signal;
      const isCurrent = () => current === controller && !signal.aborted;
      const publish = state => { if (isCurrent()) onState({ version: release.version, ...state }); };
      const check = () => { if (!isCurrent()) throw new DOMException('Official load canceled', 'AbortError'); };
      try {
        publish({ status: 'downloading', receivedBytes: 0, totalBytes: release.size });
        const file = await download(release, { signal, isCurrent, onProgress: progress => publish({ status: 'downloading', ...progress }) });
        check();
        publish({ status: 'validating' });
        const prepared = await prepare(file, { signal, isCurrent, release });
        check();
        publish({ status: 'saving' });
        await commit(prepared, { signal, isCurrent, release });
        check();
        publish({ status: 'success' });
        current = null;
        return true;
      } catch (error) {
        if (isCurrent()) {
          publish(error?.name === 'AbortError' ? { status: 'idle' } : { status: 'error', error: error.message || 'Could not load the official archive. Try uploading it manually.' });
          current = null;
        }
        return false;
      }
    },
  };
}
