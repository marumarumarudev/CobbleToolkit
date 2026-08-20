export const metadata = {
  title: "FAQ | CobbleToolkit",
  description: "Common questions about CobbleToolkit and how it works.",
};

const faqs = [
  {
    question: "Are you affiliated with Cobblemon or Cobbled Studios?",
    answer:
      "No. CobbleToolkit is a fan-made project and is not officially affiliated with Cobbled Studios, Cobblemon, or Cobbleverse.",
  },
  {
    question: "What can this toolkit do?",
    answer:
      "Four browser tools for Cobblemon / Cobbleverse datapacks: Spawn Scanner, Species & Loot (species stats + drops in one place), RCT Trainer Scanner (teams + fully resolved loot tables), and Pokésnack Maker (seasoning suggestions by species, rarity, and goal). Everything runs in your tab.",
  },
  {
    question: "What files can I upload?",
    answer:
      "`.zip` or `.jar` datapacks. Cobblemon packs usually include species/, species_additions/, and/or spawn data. RCT packs use data/<namespace>/trainers/ and loot_table/. You can upload from the nav or a tool’s dropzone — both use the same shared file list.",
  },
  {
    question: "Why is nothing showing up after I upload?",
    answer:
      "The pack might not contain folders that tool reads, the JSON might not match what the parser expects, or you’re on a tool that doesn’t use that pack type (e.g. Pokésnack Maker uses the online Pokédex, not datapack files). Try another tool, or clear files in the nav and re-upload.",
  },
  {
    question: "How do I clear uploaded files and scanned data?",
    answer:
      "Use the upload control in the navbar. Removing a file or clearing all files also clears that pack’s parsed data across every scanner. There’s no separate per-tool “clear data” anymore — the nav is the single place to manage uploads and data.",
  },
  {
    question: "Where is my data stored? Is anything uploaded to a server?",
    answer:
      "No server upload. Datapack files and parsed results stay in your browser (IndexedDB). Closing the tab doesn’t always wipe storage; use the nav clear if you want everything gone on this device.",
  },
  {
    question: "Does it work offline?",
    answer:
      "You need a network connection to load the site (and Pokésnack Maker needs the network for Pokédex data). After a pack is loaded, Spawn / Species & Loot / RCT Trainer work fully in-browser on that data.",
  },
  {
    question: "What does the RCT Trainer Scanner do with nested loot?",
    answer:
      "It follows minecraft:loot_table references into generic pools (and deeper), with cycle protection, then lists every possible item. Nested pools are grouped in the Loot tab and collapsed by default — click a group to expand it. You can also search drops for that trainer.",
  },
  {
    question: "What is Species & Loot?",
    answer:
      "A merged view of species data and loot tables from the same datapack. Pick a species to see stats/moves and its drop table without running two separate scanners.",
  },
  {
    question: "How does Pokésnack Maker work?",
    answer:
      "Search a species, pick a rarity bucket and optional goal (balanced, efficient, shiny, hidden ability). It suggests up to three seasonings based on rarity/shiny rules plus type and EV-yield targeting. Egg-group baits are for fishing, not snacks, so they aren’t used here. Targeting cards can be swapped when multiple valid options exist.",
  },
  {
    question: "What do EV Yield and BST mean?",
    answer:
      "EV Yield is the Effort Values you get for defeating that species. BST is Base Stat Total — the sum of its base stats. Species & Loot shows these when the datapack provides them; Pokésnack Maker uses EV yield for berry targeting.",
  },
  {
    question: "Can I suggest a feature or report a bug?",
    answer:
      "Yeah — message me on Discord: zmoonmaru. Feedback helps a lot. Thanks for using the toolkit.",
  },
];

export default function FAQPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold text-text-primary">
          Frequently asked questions
        </h1>
        <p className="mt-1 text-sm text-text-secondary max-w-2xl">
          How uploads, storage, and each tool work — kept honest and client-side.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {faqs.map((faq) => (
          <div
            key={faq.question}
            className="rounded-lg border border-border bg-bg-surface p-4"
          >
            <h2 className="text-sm font-semibold text-accent mb-1.5">
              {faq.question}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
