"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";

export default function HomePage() {
  const availableTools = [
    { name: "Spawn Pool Scanner", path: "/spawn-scanner" },
    { name: "Loot Drop Scanner", path: "/loot-scanner" },
    { name: "Species Scanner", path: "/species-scanner" },
    { name: "Trainer Scanner", path: "/trainer-scanner" },
    { name: "Spawn Pool Generator", path: "/spawn-pool-generator" },
    { name: "Recommended Stuff", path: "/recommended" },
    { name: "Guides", path: "/guides" },
    { name: "Feedback Gallery", path: "/feedback-gallery" },
    { name: "FAQ", path: "/faq" },
    { name: "buh", path: "/buh" },
    { name: "wuh", path: "/wuh" },
    { name: "guh", path: "/guh" },
  ];

  useEffect(() => {
    document.title = "CobbleToolkit";
  }, []);

  const upcomingTools = ["nuhuh"];

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white px-4 py-10 sm:px-6 sm:py-12 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold mb-4 text-center">CobbleToolkit</h1>
        <p className="text-gray-300 text-center max-w-2xl mx-auto mb-8">
          A collection of browser-based tools for analyzing and understanding
          Cobblemon datapacks. This toolkit runs entirely in your browser — your
          files are never uploaded. Open source on{" "}
          <a
            href="https://github.com/marumarumarudev/CobbleToolkit"
            className="text-blue-400 underline hover:text-blue-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          .
        </p>

        <div className="grid gap-4 mb-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {availableTools.map((tool) => (
            <Link
              key={tool.path}
              href={tool.path}
              className="block bg-[#2a2a2a] hover:bg-[#3a3a3a] transition p-4 rounded-lg shadow-sm text-center"
            >
              <h2 className="text-xl font-semibold">{tool.name}</h2>
            </Link>
          ))}
        </div>
        {new Date().getMonth() === 6 && new Date().getDate() === 5 && (
          <div className="flex flex-col items-center mb-6">
            <Image
              height={120}
              width={120}
              src="/birthday.jpg"
              alt="Happy Birthday!"
              className="w-30 max-w-xs rounded-lg shadow-lg"
            />
            <p className="mt-2 text-sm text-gray-400 italic">
              me when birthday
            </p>
          </div>
        )}

        <h3 className="text-2xl font-semibold mb-2">Coming Soon</h3>
        <ul className="text-gray-400 list-disc list-inside space-y-1 mb-12">
          {upcomingTools.map((tool, idx) => (
            <li key={idx}>{tool}</li>
          ))}
        </ul>

        {/* Disclaimer */}
        <div className="text-sm text-gray-500 bg-[#2a2a2a] p-4 rounded-md mb-8 text-center">
          This toolkit is a personal passion project and is{" "}
          <strong>not affiliated</strong> with the Cobblemon team. For official
          updates and community help, join their{" "}
          <a
            href="https://discord.com/invite/cobblemon"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            official Discord server
          </a>
          .
        </div>

        {/* Footer */}
        <footer className="text-sm text-gray-500 text-center">
          Built by{" "}
          <a
            href="https://github.com/marumarumarudev/CobbleToolkit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            maru
          </a>{" "}
          • Deployed on{" "}
          <a
            href="https://vercel.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Vercel
          </a>
          <p className="mt-2 text-gray-500 text-sm">
            Made this out of laziness, boredom and love. Discord:{" "}
            <strong>zmoonmaru</strong>.
          </p>
        </footer>
      </div>
    </div>
  );
}
