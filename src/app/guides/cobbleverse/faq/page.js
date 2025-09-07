import Link from "next/link";
import { HelpCircle, ArrowRight, ExternalLink, Info } from "lucide-react";

export const metadata = {
  title: "FAQ | Cobbleverse Guides | CobbleToolkit",
  description: "Frequently Asked Questions about Cobbleverse modpack",
};

export default function CobbleverseFAQPage() {
  const faqCategories = [
    {
      title: "Pokémon & Evolution",
      questions: [
        {
          question: "How to get Mew, Mewtwo, etc.?",
          answer:
            "Check our comprehensive Pokémon guide for detailed methods to obtain specific Pokémon.",
          link: "/guides/cobbleverse/how-to-get",
          type: "guide",
        },
        {
          question: "How to evolve Duraludon?",
          answer:
            "Right-click a Metal Coat on it. Metal Alloy isn’t implemented yet.",
          type: "direct",
        },
        {
          question: "How to evolve Kubfu?",
          answer:
            "Right-click the Scroll of Darkness (Single Strike) or Scroll of Waters (Rapid Strike). The Scroll of Waters can be found in Warm Ocean Ruins suspicious sands, while the Scroll of Darkness is in Desert Pyramid suspicious sands.",
          type: "direct",
        },
        {
          question: "How to evolve Inkay?",
          answer: "Rename it to Dinnerbone. That’s it.",
          type: "direct",
        },
        {
          question:
            "How to turn Landorus/Thundurus/Tornadus/Enamorus to Therian form?",
          answer:
            "Find a Reveal Glass and right-click it on them. Reveal Glass can be found in Desert Pyramid suspicious sands.",
          type: "direct",
        },
      ],
    },
    {
      title: "Regional Progress",
      questions: [
        {
          question: "How do I get to Johto/Hoenn?",
          answer:
            "Check our progression guide for detailed steps on advancing to different regions.",
          link: "/guides/cobbleverse/progression",
          type: "guide",
        },
      ],
    },
    {
      title: "Legendary Pokémon & Items",
      questions: [
        {
          question: "How to get Rusted Sword/Shield?",
          answer:
            "Brush suspicious gravel in Luna Henge ruins for the Rusted Sword and Sol Henge ruins for the Rusted Shield. Both may also appear in Archaeological Sites in Deserts. See the Ruins guide: ",
          link: "https://wiki.cobblemon.com/index.php/Ruins",
          type: "guide",
        },
        {
          question: "How to get Hoopa Unbound?",
          answer:
            "Use a Prison Bottle on Hoopa. Prison Bottles can be found in Desert Wells suspicious sands.",
          type: "direct",
        },
        {
          question: "How to mega evolve Rayquaza?",
          answer:
            "Teach it Dragon Ascent and make sure you have a Mega Bracelet equipped.",
          type: "direct",
        },
        {
          question: "How can I respawn the shiny Rayquaza in the End?",
          answer:
            "Use the following commands: `/reload` and `/function cobbleverse:spawn_rayquaza`.",
          type: "direct",
        },
        {
          question: "How to get Ultra Necrozma?",
          answer:
            "Either fuse a Solgaleo/Lunala with a Necrozma using N-Solarizer or N-Lunarizer, or find an already fused one in End structures. You’ll need an Ultranecrozium Z to trigger Ultra Burst. This upgrades Photon Geyser into the special Z-Move *Light That Burns the Sky*. When holding Ultranecrozium Z, Necrozma cannot use other Z-Moves.",
          type: "direct",
        },
      ],
    },
    {
      title: "Gameplay Mechanics",
      questions: [
        {
          question: "How to ride Pokémon and dismount?",
          answer:
            "Shift + Right-click your Pokémon to mount (not all are rideable). You’ll see an icon bottom-left. Default dismount key is 'V'.",
          type: "direct",
        },
        {
          question: "How to get fossils?",
          answer: "See Cobblemon’s official wiki: ",
          link: "https://wiki.cobblemon.com/index.php/Fossil",
          type: "guide",
        },
        {
          question: "Is there breeding?",
          answer:
            "Yes! Check our comprehensive breeding guide for all the details on how breeding works in Cobbleverse.",
          link: "/guides/cobbleverse/cobbreeding",
          type: "guide",
        },
      ],
    },
    {
      title: "Technical Issues",
      questions: [
        {
          question: "I can not mega evolve",
          answer:
            "Make sure you equip a Mega Bracelet (or variant) and your Pokémon is holding the correct Mega Stone. Check your PC for other Mega Pokémon and unmega them. If it’s still not working, run `/msdresetmega`.",
          type: "direct",
        },
        {
          question: "I can not dynamax",
          answer:
            "Equip a Dynamax Band or Omni Ring, and place a craftable Power Spot nearby. Dynamax can only be used with these requirements.",
          type: "direct",
        },
        {
          question: "How do I download/update Cobbleverse in TLauncher?",
          answer:
            "No. The modpack is free, but Minecraft is not. Pirated clients are not supported (rule in the Cobbleverse Discord). Get a fucking job.",
          type: "direct",
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-2xl mb-4">
          <HelpCircle className="w-8 h-8 text-yellow-400" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-yellow-100 to-yellow-400 bg-clip-text text-transparent">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
          Quick answers to the most commonly asked questions about Cobbleverse.
          Can not find what you are looking for? Check our other guides!
        </p>
      </div>

      <div className="flex justify-center">
        <Link
          href="/guides/cobbleverse"
          className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-medium transition-colors group"
        >
          <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
          Back to Cobbleverse Guides
        </Link>
      </div>

      <div className="space-y-8">
        {faqCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="space-y-4">
            <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-2">
              {category.title}
            </h2>
            <div className="space-y-3">
              {category.questions.map((faq, faqIndex) => (
                <div
                  key={faqIndex}
                  className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] border border-gray-700/50 rounded-xl p-5 hover:border-yellow-400/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-lg flex items-center justify-center">
                      {faq.type === "guide" ? (
                        <ExternalLink className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <Info className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-gray-300 mb-3 leading-relaxed">
                        {faq.answer}
                      </p>
                      {faq.link && (
                        <Link
                          href={faq.link}
                          className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-medium transition-colors group"
                        >
                          View Guide
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-[#2a2a2a] to-[#1f1f1f] border border-gray-700/50 rounded-2xl p-8">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Still need help?</h3>
          <p className="text-gray-300 max-w-2xl mx-auto">
            If you could not find the answer to your question here, check out
            our other comprehensive guides or join the community for additional
            support.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <Link
              href="/guides/cobbleverse"
              className="inline-flex items-center gap-2 bg-yellow-400 text-black px-6 py-3 rounded-lg font-medium hover:bg-yellow-300 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              All Guides
            </Link>
            <Link
              href="/guides/cobbleverse/how-to-get"
              className="inline-flex items-center gap-2 bg-[#3a3a3a] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#4a4a4a] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Pokémon Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
