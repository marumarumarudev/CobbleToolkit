"use client";

import { useEffect, useId, useState, useRef, useLayoutEffect } from "react";
import { useSharedFiles } from "@/contexts/SharedFilesContext";
import { OFFICIAL_PROJECT_ID, OFFICIAL_SOURCE, validateOfficialRelease } from "@/utils/officialCobblemon";

export default function OfficialCobblemonPicker() {
  const { sharedFiles, filesReady, officialDownload, loadOfficialVersion, cancelOfficialDownload, removeSharedFile } = useSharedFiles();
  const [releases, setReleases] = useState([]);
  const [catalogError, setCatalogError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState("");
  const selectId = useId();
  const selectRef = useRef(null);
  const cancelFocused = useRef(false);
  const active = sharedFiles.find(file => file.source === OFFICIAL_SOURCE);
  const release = releases.find(entry => entry.version === selected);
  const busy = ["downloading", "validating", "saving"].includes(officialDownload.status);
  const alreadyLoaded = active?.file && active.officialVersionId === release?.versionId;

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/data/officialCobblemon.json`, { signal: controller.signal, credentials: "omit" })
      .then(response => { if (!response.ok) throw new Error("Version list unavailable"); return response.json(); })
      .then(catalog => {
        if (catalog.projectId !== OFFICIAL_PROJECT_ID || !Array.isArray(catalog.releases)) throw new Error("Invalid version list");
        const checked = catalog.releases.map(validateOfficialRelease);
        if (!controller.signal.aborted) { setReleases(checked.slice().reverse()); setCatalogError(null); }
      })
      .catch(error => { if (error.name !== "AbortError") setCatalogError("Could not load the version list. Retry or upload your JAR below."); });
    return () => controller.abort();
  }, [attempt]);
  useEffect(() => () => cancelOfficialDownload(), [cancelOfficialDownload]);
  useLayoutEffect(() => {
    if (!busy && cancelFocused.current) {
      selectRef.current?.focus();
      cancelFocused.current = false;
    }
  }, [busy]);

  return (
    <section aria-label="Official Cobblemon" className="mb-4 border-b border-border pb-4">
      <h4 className="text-sm font-semibold text-text-primary">Official Cobblemon <span className="font-normal text-text-secondary">(optional)</span></h4>
      <p className="mt-1 text-xs leading-relaxed text-text-secondary">Load the base game data here, then add your datapacks below.</p>
      <p className="mt-2 text-xs font-medium text-text-primary">{active ? `Active: Cobblemon ${active.officialVersion}` : "No official version loaded"}</p>
      {active && !active.file && <p className="mt-1 text-xs text-text-secondary">Stored archive unavailable. Select its version and load it again.</p>}
      <label htmlFor={selectId} className="mb-1 mt-3 block text-xs font-medium text-text-primary">Official Cobblemon version</label>
      <select ref={selectRef} id={selectId} value={selected} disabled={!filesReady || busy || !releases.length} onChange={event => setSelected(event.target.value)} className="min-h-11 w-full rounded-md border border-border bg-bg-base px-3 text-sm text-text-primary disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-accent">
        <option value="">Choose a version</option>
        {releases.map(entry => <option key={entry.versionId} value={entry.version}>{entry.version}</option>)}
      </select>
      {release && <p className="mt-2 text-xs text-text-secondary">{(release.size / 1024 ** 2).toFixed(1)} MiB download · <a href={release.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2">View official release</a></p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={!filesReady || !release || busy || alreadyLoaded} onClick={() => loadOfficialVersion(release)} className="min-h-11 rounded-md bg-accent px-3 text-xs font-semibold text-accent-ink transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50">{alreadyLoaded ? "Already loaded" : "Load version"}</button>
        {busy && <button type="button" onFocus={() => { cancelFocused.current = true; }} onBlur={() => { cancelFocused.current = false; }} onClick={cancelOfficialDownload} className="min-h-11 rounded-md border border-border px-3 text-xs text-text-primary hover:bg-bg-surface-2">Cancel download</button>}
        {active && !busy && <button type="button" onClick={() => removeSharedFile(active.id)} className="min-h-11 rounded-md border border-border px-3 text-xs text-text-secondary hover:text-danger">Remove official version</button>}
      </div>
      <div role="status" aria-live="polite" className="mt-2 text-xs text-text-secondary">
        {officialDownload.status === "downloading" && <>
          <p>Downloading {officialDownload.version}… {Math.floor((officialDownload.receivedBytes || 0) / (officialDownload.totalBytes || 1) * 100)}%</p>
          <progress aria-label="Official archive download" value={officialDownload.receivedBytes || 0} max={officialDownload.totalBytes || 1} className="mt-1 h-2 w-full accent-accent" />
        </>}
        {officialDownload.status === "validating" && "Checking archive… Your current version is still available."}
        {officialDownload.status === "saving" && "Saving official version…"}
        {officialDownload.status === "success" && "Official version loaded. Your uploaded files were kept."}
      </div>
      {(catalogError || officialDownload.status === "error") && <p role="alert" className="mt-2 text-xs leading-relaxed text-danger">{catalogError || officialDownload.error} {catalogError && <button type="button" onClick={() => setAttempt(value => value + 1)} className="min-h-11 underline underline-offset-2">Retry version list</button>}</p>}
      {sharedFiles.some(file => file.source !== OFFICIAL_SOURCE && /cobblemon.*\.jar$/i.test(file.name)) && <p className="mt-2 text-xs leading-relaxed text-text-secondary">You also have a manually uploaded Cobblemon JAR. Both will be scanned; remove the manual copy yourself if you only want one version.</p>}
      <p className="mt-3 text-xs leading-relaxed text-text-secondary">Downloads contact <a href="https://modrinth.com/mod/cobblemon" target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2">Modrinth</a>. Uploads stay in your browser. Switching replaces only this official archive and its results. Uses the Fabric data source; no mod installation needed.</p>
    </section>
  );
}
