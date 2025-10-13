import React from "react";
import ImageWithFullscreen, { UpdateCarousels } from "./ClientPage";

export const metadata = {
  title: "Cobbleverse Setup | CobbleToolkit",
  description:
    "How to install Cobbleverse and transfer from CurseForge to Modrinth and how to update.",
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

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">
          Server Setup Recommendations
        </h2>
        <p className="text-gray-300">
          <strong>For server operators/admins:</strong> When setting up your
          server, go to your datapacks folder, open the &quot;extra&quot; folder
          and you will see 3 files, Johto, Hoenn, and Terralith datapacks. Move
          them out of the extra folder and put it in the main datapacks folder
          and when creating the world, copy the contents of the datapacks folder
          into world &gt; datapacks folder to make sure it is loaded.
        </p>
        <p className="text-gray-300">
          Why take out these datapacks you might ask, it is so that all of the
          structures that are region-locked will generate as soon as the server
          is online and so you don&apos;t have to restart the server when
          someone is ready to proceed to the next region/series and so you
          don&apos;t have to travel hundreds of thousands of blocks just to find
          a new structure later in the game.
        </p>

        <ImageWithFullscreen
          src="/guides/datapack-regions.png"
          alt="Datapacks in file explorer moved out of extra folder"
        />

        <p className="text-gray-300">
          You can also achieve this in-game by doing these steps:
        </p>

        <ImageWithFullscreen
          src="/guides/datapack-commands.png"
          alt="Commands for enabling datapacks in-game"
        />

        <p className="text-gray-300">
          And don&apos;t forget to set{" "}
          <b>
            <code>enable-command-block</code>
          </b>{" "}
          to{" "}
          <b>
            <code>true</code>
          </b>{" "}
          in the{" "}
          <b>
            <code>server.properties</code>
          </b>{" "}
          file because some structures, mostly gyms, use command blocks.
        </p>

        <ImageWithFullscreen
          src="/guides/server-properties.png"
          alt="Server properties file"
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">
          Why no COBBLEVERSE Public Server?
        </h2>
        <ImageWithFullscreen
          src="/guides/public-server.png"
          alt="Why no COBBLEVERSE Public Server?"
        />
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
            <h3 className="text-xl font-semibold text-white">
              Singleplayer/Client
            </h3>
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
                In your server host, delete/replace the <code>config</code>,{" "}
                <code>datapacks</code>, and <code>mods</code> folders.
              </li>
              <li>
                Upload the <code>config</code>, <code>datapacks</code>, and{" "}
                <code>mods</code> folders from your fresh Modrinth instance to
                your server.
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
                <li>Keep a backup before updating server files.</li>
                <li>
                  Match the same Cobbleverse version on client and server.
                </li>
                <li>
                  If you have custom world data, copy your <code>world</code> or{" "}
                  <code>worlds</code> folder after updating the server files.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">
          How to Update Cobbleverse in Modrinth
        </h2>
        <p className="text-gray-300">To update:</p>
        <UpdateCarousels type="modrinth-update" />

        <div className="mt-4 p-3 rounded-lg bg-blue-900/20 border border-blue-700/40 text-blue-200 text-sm">
          <p className="font-medium">
            If the latest version is not on the version list:
          </p>
          <p className="mt-1">Purge Modrinth App cache:</p>
        </div>
        <UpdateCarousels type="purge-cache" />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">
          How to Update Cobbleverse in CurseForge
        </h2>
        <UpdateCarousels type="curseforge-update" />
      </section>
    </div>
  );
}
