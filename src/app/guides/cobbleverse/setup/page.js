import React from "react";
import ImageWithFullscreen from "./ClientPage";

export const metadata = {
  title: "Setup Cobbleverse | CobbleToolkit",
  description:
    "How to install Cobbleverse and transfer from CurseForge to Modrinth",
};

export default function SetupCobbleversePage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4">
      <h1 className="text-3xl font-bold">Setup Cobbleverse</h1>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">
          Install Cobbleverse
        </h2>
        <p className="text-gray-300">
          Install from <span className="font-medium">Modrinth</span> for the
          fastest updates. CurseForge is also supported.
        </p>
        <ol className="list-decimal pl-5 space-y-1 text-gray-300">
          <li>Open your launcher (Modrinth App or CurseForge Launcher).</li>
          <li>
            Go to <span className="font-medium">Modpacks</span> and search for{" "}
            <span className="font-medium">COBBLEVERSE</span>.
          </li>
          <li>
            Install it, then press <span className="font-medium">Play</span>.
          </li>
        </ol>
        <p className="text-gray-400 text-sm">
          You can use ATLauncher or Prism Launcher too (Prism is great). Never
          use TLauncher, get a job u bum.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">
          Cobbleverse Server Pack
        </h2>
        <p className="text-gray-300">
          Use the modpack for servers.{" "}
          <strong>NO PUBLIC SERVERS PLEASE!!!</strong>
        </p>
        <ImageWithFullscreen
          src="/guides/serverpack.png"
          alt="Cobbleverse server pack files"
        />
        <div className="p-3 rounded-lg bg-yellow-900/20 border border-yellow-700/40 text-yellow-200 text-sm">
          <p className="font-medium">Additional mods to remove on servers:</p>
          <ul className="list-disc pl-5 mt-1 space-y-0.5">
            <li>DropConfirm</li>
            <li>Interactic</li>
          </ul>
        </div>
        <p className="text-gray-300">
          Recommended hosts: <span className="font-medium">Apex Hosting</span>{" "}
          and <span className="font-medium">Nitrado</span>.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">
          Transfer from CurseForge to Modrinth
        </h2>
        <p className="text-gray-300">
          Follow the steps below to keep your worlds and waypoints.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">Singleplayer</h3>
            <ol className="list-decimal pl-5 space-y-1 text-gray-300">
              <li>
                Install a fresh <span className="font-medium">Cobbleverse</span>{" "}
                instance in the Modrinth App.
              </li>
              <li>
                Open your CurseForge instance folder and copy the{" "}
                <code>saves</code> folder and the <code>xaero</code> folder (for
                Xaero’s Minimap/WorldMap waypoints).
              </li>
              <li>
                Open the new Modrinth instance folder and paste those folders in
                the same locations.
              </li>
              <li>Launch Cobbleverse from Modrinth and play.</li>
            </ol>
            <div className="text-sm text-gray-400">
              <p className="font-medium">Where are these folders?</p>
              <ul className="list-disc pl-5 mt-1 space-y-0.5">
                <li>
                  <span className="font-medium">saves</span>: contains your
                  singleplayer worlds.
                </li>
                <li>
                  <span className="font-medium">xaero</span>: contains Xaero’s
                  waypoints/world map data.
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">Server</h3>
            <ol className="list-decimal pl-5 space-y-1 text-gray-300">
              <li>
                Install a fresh <span className="font-medium">Cobbleverse</span>{" "}
                instance in the Modrinth App.
              </li>
              <li>
                From your CurseForge instance, copy your <code>world</code> or{" "}
                <code>worlds</code> folder(s) and the <code>xaero</code> folder.
                If you edited configs, also copy the <code>config</code> folder.
              </li>
              <li>
                Paste them into the new Modrinth instance in the same locations.
              </li>
              <li>
                Upload the server files (including the copied folders) to your
                host.
              </li>
              <li>
                Delete these client-only mods from the <code>mods</code> folder:{" "}
                <span className="font-medium">Cobblemon UI Tweaks</span>,{" "}
                <span className="font-medium">DropConfirm</span>,{" "}
                <span className="font-medium">Interactic</span>.
              </li>
              <li>Start the server.</li>
            </ol>
            <div className="text-sm text-gray-400">
              <p className="font-medium">Tips</p>
              <ul className="list-disc pl-5 mt-1 space-y-0.5">
                <li>Keep a backup before moving files.</li>
                <li>
                  Match the same Cobbleverse version on client and server.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
