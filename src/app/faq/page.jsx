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
      "`.zip` or `.jar` datapacks. Upload from the navbar or any tool’s dropzone — they share the same file list. Cobblemon 1.8.x jars (including herd / alpha spawn data) are supported.",
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

const UPLOAD_TUTORIAL_YOUTUBE_ID = "GRqwv087tgo";

export default function FAQPage() {
  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="text-2xl font-semibold text-text-primary">
          FAQ & Feedback
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary max-w-2xl">
          Quick answers first. Questions, ideas, and bug reports belong in the
          comments below — they live in the GitHub Discussions for this project.
        </p>
      </header>

      {/* How to upload — video (centered, capped width so it doesn’t float left) */}
      <section className="mx-auto w-full max-w-3xl">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          How to upload files in CobbleToolkit
        </h2>
        <div className="rounded-lg border border-border bg-bg-surface p-4 sm:p-5">
          <p className="mb-4 text-sm text-text-secondary leading-relaxed">
            Use the <strong className="text-text-primary">Upload File</strong>{" "}
            control in the top bar (or the dropzone on any tool). Accepts{" "}
            <code className="font-mono text-[11px] text-accent">.zip</code> /{" "}
            <code className="font-mono text-[11px] text-accent">.jar</code>.
            Files stay in your browser and are shared across Spawn Scanner,
            Species &amp; Loot, and RCT Trainer Scanner.
          </p>

          {UPLOAD_TUTORIAL_YOUTUBE_ID ? (
            <div className="overflow-hidden rounded-lg border border-border bg-black shadow-sm">
              <div className="relative w-full aspect-video">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${UPLOAD_TUTORIAL_YOUTUBE_ID}`}
                  title="How to upload a datapack in CobbleToolkit"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-border bg-bg-base px-4 text-center">
              <p className="text-sm text-text-muted">
                Video tutorial coming soon — paste a YouTube link and we&apos;ll
                embed it here.
              </p>
            </div>
          )}
        </div>
      </section>

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
          <p>Be respectful and keep it related to the toolkit.</p>
        </div>

        <GiscusComments />
      </section>
    </div>
  );
}
