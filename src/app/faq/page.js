export default function FAQPage() {
  const faqs = [
    {
      question: "Are you affiliated with Cobblemon or Cobbled Studios?",
      answer:
        "No. This toolkit is a fan-made project and is not officially affiliated with Cobbled Studios.",
    },
    {
      question: "What file types can I upload?",
      answer: "You can upload .zip or .jar files containing Cobblemon data.",
    },
    {
      question: "Why is nothing showing up after uploading?",
      answer:
        "Ensure the datapack contains valid species or loot data. Try re-uploading if needed.",
    },
    {
      question: "What does EV Yield or BST mean?",
      answer:
        "EV Yield is the Effort Values gained when defeating a Pokémon. BST stands for Base Stat Total — the sum of all base stats.",
    },
    {
      question: "Can I sort or search the data?",
      answer:
        "Yes. Most tools support searching and sorting — by name, type, biome, and more.",
    },
    {
      question: "Where is my data stored?",
      answer:
        "Everything stays on your browser using localStorage. No data is uploaded to any server.",
    },
    {
      question: "Do these tools work offline?",
      answer:
        "You need to be online to load the website, but after that, most tools work entirely in-browser.",
    },
    {
      question: "Can I suggest a feature or report a bug?",
      answer:
        "Yes! Feel free to message me on discord: zmoonmaru, Thanks for using the toolkit.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white px-4 py-8 flex flex-col items-center">
      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Common questions about this toolkit and how it works.
        </p>
      </header>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 w-full max-w-6xl">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-[#2c2c2c] border border-gray-700 p-4 rounded"
          >
            <h2 className="text-yellow-400 font-semibold text-base mb-1">
              {faq.question}
            </h2>
            <p className="text-gray-300 text-sm">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
