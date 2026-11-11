import GiscusComments from "@/components/GiscusComments";
import UploadTutorialVideo from "@/components/UploadTutorialVideo";

export const metadata = {
  title: "FAQ | CobbleToolkit",
  description: "Common questions and community feedback for CobbleToolkit.",
};

const faqs = [
  {
    question: "Are you affiliated with Cobblemon or Cobbled Studios?",
    answer:
      "No. CobbleToolkit is a fan project and is not officially affiliated with Cobbled Studios, Cobblemon, or Cobbleverse.",
  },
  {
    question: "What can this toolkit do?",
    answer:
      "Four browser tools for Cobblemon / Cobbleverse datapacks: Spawn Scanner, Species & Loot, RCT Trainer Scanner, and Campfire Kitchen. Datapack processing runs entirely in your tab.",
  },
  {
    question: "What files can I upload?",
    answer:
      ".zip or .jar datapacks. Upload from the top bar or any tool’s dropzone. They share the same file list. Cobblemon 1.8.x jars (including herd / alpha spawn data) are supported.",
  },
  {
    question: "Why is nothing showing up after I upload?",
    answer:
      "The pack might not contain the folders that tool reads, or you’re on a tool that doesn’t use datapack files (Campfire Kitchen uses the online Pokédex). New uploads use strict JSON by default; check parsing diagnostics for invalid JSON. Shared files offers optional compatibility repair, but its heuristics may alter values. Diagnostics persist and are bounded. Existing legacy entries keep their old compatibility behavior.",
  },
  {
    question: "Where is my data stored?",
    answer:
      "Datapacks are never uploaded. IndexedDB (v7) stores archives, metadata, parsed results, and bounded diagnostics. Archives are limited to 512 MiB each and 1024 MiB stored total; metadata reports the same limits. The browser may evict storage, and clearing site data removes everything. Removing an archive atomically removes its associated reports too. External species lookups, images, video, and comments still use external services.",
  },
  {
    question: "When do I need to upload an archive again?",
    answer:
      "Saved archives remain available after a refresh. Older entries with missing archive blobs still show a notice asking you to upload again to scan in another tool. Their cached results remain usable. Uploading the same SHA-256 content again with the same repair policy automatically reconnects to the existing ID and results, even if renamed. Different content or repair policy creates a separate entry. Legacy metadata without a fingerprint cannot safely reconnect by filename: a new entry is created and old caches are retained.",
  },
  {
    question: "Do changes sync across browser tabs?",
    answer:
      "Yes. Changes sync through BroadcastChannel with a storage event fallback, and tabs refresh their local state when they regain focus.",
  },
  {
    question: "How do I find which Pokémon drop an item?",
    answer:
      "Open Species & Loot and choose Item drops to browse drops across the loaded Pokémon without selecting a species first. Use the Species browser when you want an individual Pokémon’s stats, moves, types, and loot table. Results reflect the data in your loaded archives.",
  },
  {
    question: "Where do mount stats come from?",
    answer:
      "Species & Loot reads riding configuration from species/ and species_additions/. Additions are applied over loaded base definitions, and custom behaviour modes are shown alongside their configured stats and ranges. These are not calculated speeds in the game, and the view does not resolve your server’s pack priority. Missing stats are not assumed to be zero. No riding configuration in the loaded data does not prove a Pokémon cannot be ridden: the base mod or another pack may supply it. Expand the raw configuration and mount data sources for more context.",
  },
  {
    question: "Why does a saved result need a mount data refresh?",
    answer:
      "The scanner uses a new cache version to index saved archives again and add mount data missing from older results. If the source archive is missing, upload it again so the refresh can run. Older cached results can remain usable, but they cannot supply mount fields that were never indexed.",
  },
  {
    question: "Does Campfire Kitchen need a datapack?",
    answer:
      "No. Campfire Kitchen uses an external online Pokédex for species lookups rather than your uploaded archives. Choose the snack or Poké Bait recipe mode: they use different base recipes with the same seasoning effects and three seasoning slots. Treat recipe guidance as a plan, not verification of your server’s runtime configuration or pack priority. External lookups require access to the online service.",
  },
  {
    question: "Can I suggest a feature or report a bug?", 
    answer:
      "Yes. Leave a comment below through GitHub Discussions or message me on Discord: zmoonmaru.",
  },
];


export default function FAQPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      <header className="dex-console">
        <div className="dex-screen p-5 sm:p-8">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-accent">
            Help & community
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            FAQ & Feedback
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
            Learn how to open a datapack, find answers about the tools,
            or ask a question below.
          </p>
          <nav aria-label="FAQ sections" className="mt-6 flex flex-wrap gap-2">
            {[
              ["getting-started", "01 / Getting started"],
              ["common-questions", "02 / Common questions"],
              ["feedback", "03 / Feedback"],
            ].map(([id, label]) => (
              <a key={id} href={`#${id}`} className="rounded-lg border border-border bg-accent-soft px-4 py-2 text-sm font-medium text-accent transition-colors hover:border-border-hover hover:bg-accent-soft-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section id="getting-started" aria-labelledby="upload-heading" className="grid scroll-mt-40 items-start gap-6 lg:grid-cols-2">
        <div className="dex-screen p-5 sm:p-6">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-accent">01 / Getting started</p>
        <h2 id="upload-heading" className="text-lg font-semibold text-text-primary">
          Open a datapack
        </h2>
        <ol className="mt-5 list-decimal space-y-4 pl-6 text-base leading-relaxed text-text-secondary marker:font-mono marker:font-semibold marker:text-accent">
          <li>Choose <strong className="font-medium text-text-primary">Shared files</strong> in the top bar, or use a scanner’s dropzone.</li>
          <li>Select your datapack <code className="font-mono text-xs">.zip</code> or Cobblemon <code className="font-mono text-xs">.jar</code>. No need to extract it.</li>
          <li>Open Spawn Scanner, Species &amp; Loot, or RCT Trainer Scanner. Each reads the same archive for its own data.</li>
        </ol>
        <p className="mt-4 max-w-prose text-sm leading-relaxed text-text-secondary">
          Datapacks are never uploaded. Archives and results are saved locally;
          browser eviction or clearing site data can remove them. New uploads use
          strict JSON. Shared files offers optional compatibility repair, which may
          alter values. Identical content and repair policy reconnect to saved
          results, even after renaming; legacy entries without fingerprints stay separate.
        </p>
        </div>
        <UploadTutorialVideo />
      </section>

      <section id="common-questions" aria-labelledby="questions-heading" className="scroll-mt-40">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-accent">02 / Questions</p>
        <h2 id="questions-heading" className="text-xl font-semibold text-text-primary">
          Common questions
        </h2>
        <p className="mb-5 mt-2 text-sm text-text-secondary">Select a question to read the answer.</p>
        <div className="grid items-start gap-3 md:grid-cols-2">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="min-w-0 rounded-xl border border-border bg-bg-surface open:border-border-hover"
            >
              <summary className="cursor-pointer rounded-xl p-5 text-base font-semibold leading-relaxed text-accent marker:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent hover:bg-accent-soft">
                {faq.question}
              </summary>
              <p className="max-w-prose border-t border-border px-5 py-4 text-base leading-relaxed text-text-secondary">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section id="feedback" aria-labelledby="feedback-heading" className="scroll-mt-40 border-t border-border pt-6">
        <div className="mb-5">
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-accent">03 / Feedback</p>
          <h2 id="feedback-heading" className="text-lg font-semibold text-text-primary">
            Questions & feedback
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Found a wrong result? Include the tool, pack version, and the entry you expected.
          </p>
        </div>

        <p className="mb-5 max-w-prose text-sm leading-relaxed text-text-secondary">
          Comments use GitHub Discussions. Sign in to GitHub to post.{" "}
          <a href="https://github.com/marumarumarudev/CobbleToolkit/discussions" target="_blank" rel="noopener noreferrer" className="text-text-secondary underline underline-offset-2 hover:text-text-primary">
            Open Discussions on GitHub
          </a>
        </p>

        <GiscusComments />
      </section>
    </div>
  );
}
