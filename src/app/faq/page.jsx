"use client";

import { HelpCircle } from "lucide-react";
import { Card, CardBody } from "@/components/ui";

const FAQS = [
  {
    q: "Are you affiliated with Cobblemon or Cobbled Studios?",
    a: "No. This toolkit is a fan-made project and is not officially affiliated with Cobbled Studios.",
  },
  {
    q: "What file types can I upload?",
    a: "You can upload .zip or .jar files containing Cobblemon data.",
  },
  {
    q: "Why is nothing showing up after uploading?",
    a: "Ensure the datapack contains valid species, spawn, loot, or trainer data that one of the tools reads. Try re-uploading if needed.",
  },
  {
    q: "What does EV Yield or BST mean?",
    a: "EV Yield is the Effort Values gained when defeating a Pokémon. BST stands for Base Stat Total — the sum of all base stats.",
  },
  {
    q: "Can I sort or search the data?",
    a: "Yes. Most tools support searching and sorting — by name, type, biome, and more.",
  },
  {
    q: "Where is my data stored?",
    a: "Everything stays in your browser using IndexedDB. No data is uploaded to any server.",
  },
  {
    q: "Do these tools work offline?",
    a: "You need to be online to load the website, but after that, most tools work entirely in-browser.",
  },
  {
    q: "Can I suggest a feature or report a bug?",
    a: "Yes — message on Discord: zmoonmaru. Thanks for using the toolkit.",
  },
];

export default function FaqPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 text-accent">
          <HelpCircle size={18} />
          <span className="text-xs font-mono uppercase tracking-wider">FAQ</span>
        </div>
        <h1 className="text-2xl font-semibold text-text-primary">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-text-secondary max-w-2xl">
          Common questions about this toolkit and how it works.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {FAQS.map((item) => (
          <Card key={item.q}>
            <CardBody className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-text-primary">{item.q}</h2>
              <p className="text-sm text-text-secondary leading-relaxed">{item.a}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
