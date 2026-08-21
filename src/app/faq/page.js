import GiscusComments from "@/components/GiscusComments";

export const metadata = {
  title: "FAQ | CobbleToolkit",
  description: "Common questions and community feedback for CobbleToolkit.",
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
      "Four browser tools for Cobblemon / Cobbleverse datapacks: Spawn Scanner, Species & Loot, RCT Trainer Scanner, and Pokésnack Maker. Everything runs entirely in your tab.",
  },
  {
    question: "What files can I upload?",
    answer:
      "`.zip` or `.jar` datapacks. Upload from the navbar or any tool’s dropzone — they share the same file list.",
  },
  {
    question: "Why is nothing showing up after I upload?",
    answer:
      "The pack might not contain the folders that tool reads, or you’re on a tool that doesn’t use datapack files (Pokésnack Maker uses the online Pokédex). Try another tool or clear files in the nav and re-upload.",
  },
  {
    question: "Where is my data stored?",
    answer:
      "Nothing is uploaded to any server. Files and parsed results stay in your browser (IndexedDB). Use the navbar clear button if you want them gone.",
  },
  {
    question: "Can I suggest a feature or report a bug?",
    answer:
      "Yes — use the comments section below (powered by GitHub Discussions) or message me on Discord: zmoonmaru.",
  },
];

export default function FAQPage() {
  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold text-text-primary">
          FAQ & Feedback
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary max-w-2xl">
          Quick answers first. Questions, ideas, and bug reports belong in the
          comments below — they live in the GitHub Discussions for this project.
        </p>
      </header>

      {/* Compact FAQ grid */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Common questions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-lg border border-border bg-bg-surface p-4"
            >
              <h3 className="text-sm font-semibold text-accent mb-1.5">
                {faq.question}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Comments */}
      <section className="rounded-xl border border-border bg-bg-surface p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-text-primary">
            Comments & Discussion
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Ask questions, suggest features, or report bugs. Everything here is
            stored in the project’s GitHub Discussions.
          </p>
        </div>

        {/* Welcome text (Giscus does not show the original discussion post) */}
        <div className="mb-6 rounded-lg border border-border bg-bg-base p-4 text-sm text-text-secondary">
          <p className="mb-2 font-medium text-text-primary">Welcome</p>
          <p className="mb-2">
            This is the general discussion space for CobbleToolkit.
          </p>
          <p className="mb-1">Use it for:</p>
          <ul className="mb-2 list-disc pl-5 space-y-0.5">
            <li>Questions about any of the tools</li>
            <li>Feature ideas or suggestions</li>
            <li>Bug reports</li>
            <li>Feedback on the site</li>
          </ul>
          <p>
            Be respectful and keep it related to the toolkit.
          </p>
        </div>

        <GiscusComments />
      </section>
    </div>
  );
}
