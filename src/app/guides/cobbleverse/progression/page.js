import Image from "next/image";

export const metadata = {
  title: "Progression | CobbleToolkit",
  description: "How region progression works in COBBLEVERSE.",
};

export default function NextRegionGuidePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">How Do I Go to the Next Region?</h1>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">
          How Regions Work in Cobbleverse
        </h2>
        <p className="text-gray-300">
          In Cobbleverse, a region is not a separate map or a different world.
          It is more like a stage of progression that adds new content to the
          same world you have been playing on. Each region represents a new set
          of datapacks that unlocks different structures, trainers, and
          legendary encounters related to that region&apos;s theme.
        </p>
        <p className="text-gray-300">
          When you finish a region like Kanto and move on to the next one such
          as Johto, your world does not reset. You keep everything you have
          built and collected, including your base, your Pokémon, and your
          items. What changes is what starts generating when you explore new
          chunks.
        </p>
        <p className="text-gray-300">
          As you enter a new region, you will begin to see:
        </p>
        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-300">
          <li>New structures appearing in unexplored areas</li>
          <li>New gyms, gym leaders, and trainers to battle</li>
          <li>
            Legendary structures and other special features from that region
          </li>
        </ul>
        <p className="text-gray-300">
          You do not receive a new starter or begin in a fresh world. Instead,
          your current world expands with more things to explore and new
          challenges to face.
        </p>
        <p className="text-gray-300">
          Think of each region as the next chapter in your Cobbleverse journey.
          Your adventure keeps growing with every region you complete, all
          within the same world you started in.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">
          How to Progress to the Next Region
        </h2>
        <p className="text-gray-300">
          To progress in COBBLEVERSE, you must defeat each region&apos;s
          Champion and follow the steps below.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Step 1: Defeat the Champion</h2>
        <p className="text-gray-300">
          You need to defeat the Champion of the current region you are in.
          Check your <strong>Trainer Card</strong> to confirm your current
          region.
        </p>
        <p className="text-gray-300">
          After defeating the Champion, they will give you a{" "}
          <strong>special book</strong>. Inside, you’ll find a{" "}
          <span className="italic">[Click here]</span> link.
        </p>
        <p className="text-gray-300">
          Clicking the link will trigger a <code>/function</code> command that
          unlocks the datapack for the next region. This only needs to be done
          once.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Step 2: Singleplayer vs Servers</h2>
        <p className="text-gray-300">
          <strong>Singleplayer:</strong> You must have <em>cheats enabled</em>{" "}
          in order for the book to work.
        </p>
        <p className="text-gray-300">
          <strong>Servers:</strong> Operators can handle progression in two
          ways:
        </p>
        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-300">
          <li>
            <strong>Option A:</strong> The host uses the book first (requires
            them to beat the Champion).
          </li>
          <li>
            <strong>Option B:</strong> Enable datapacks manually:
            <br />
            <code>/datapack enable COBBLEVERSE-[region]-DP</code>
            <br />
            If activating Hoenn, also enable Terralith:
            <br />
            <code>/datapack enable Terralith-DP</code>
            <br />
            <span className="text-sm text-blue-400">
              💡{" "}
              <a href="/guides/cobbleverse/setup" className="underline">
                See our setup guide
              </a>{" "}
              for recommended server configuration to avoid restarts.
            </span>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Step 3: Trainer Association NPC</h2>
        <p className="text-gray-300">
          Once the datapack is enabled, regular players can proceed to the next
          region by trading their
          <strong> Trainer Card</strong> to the{" "}
          <strong>Trainer Association NPC</strong>.
        </p>
        <p className="text-gray-300">
          This NPC spawns either in villages or near the player after
          progression unlocks.
        </p>
        <p className="text-gray-300">
          You can also swap your trainer cards to this NPC to go back to the
          previous regions. It will reset your level cap to 25 so keep that in
          mind.
        </p>
        <div className="mt-4">
          <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden rounded-2xl shadow-lg">
            <Image
              src="/guides/trainer-association.png"
              alt="Trainer Association Villager"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
              className="object-cover"
            />
          </div>
          <p className="text-xs text-center opacity-50 italic mt-2">
            Trainer Association NPC that helps you move to the next region.
            Image credit: Radical Cobblemon Trainers —
            <a
              href="https://modrinth.com/mod/rctmod"
              target="_blank"
              rel="noopener noreferrer"
              className="underline ml-1"
            >
              Modrinth
            </a>
            .
          </p>
          <p className="text-xs text-center opacity-50 italic">
            You can summon the NPC via command:{" "}
            <code>/summon rctmod:trainer_association</code>
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Step 4: Restarting</h2>
        <p className="text-gray-300">
          The book will tell you to &quot;restart.&quot; This simply means
          restarting the <strong>server</strong> (stop and start again), or in
          singleplayer, quitting and rejoining your world.
        </p>
        <p className="text-gray-300">
          <strong>Important:</strong> If the server owner enabled the
          datapack/region manually via commands (Option B from Step 2), they
          still need to restart the server for the changes to take effect. You
          only need to do this restarting process once per datapack/region.
          Going back to a previous series/region doesn&apos;t require a server
          restart.
        </p>
        <p className="text-gray-300">
          <strong>Note:</strong> You will not lose your world, builds or
          pokemon. Only your <strong>level cap resets</strong>, so you&apos;ll
          need to build a new team for the next region. The new structures will
          generate in new, unloaded chunks.
        </p>
      </section>

      <div className="p-4 text-gray-300 border-t border-gray-700 space-y-2">
        <p>
          💬 Need more help? Join the{" "}
          <a
            href="https://discord.lumy.fun/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            LUMYVERSE Discord server
          </a>{" "}
          for support.
        </p>
        <p>
          📖 Visit the{" "}
          <a
            href="https://www.lumyverse.com/cobbleverse"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            Cobbleverse Wiki
          </a>{" "}
          for the most up-to-date guides.
        </p>
      </div>
    </div>
  );
}
