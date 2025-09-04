import Image from "next/image";

export default function NextRegionGuidePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">How Do I Go to the Next Region?</h1>
      <p className="text-gray-300">
        To progress in COBBLEVERSE, you must defeat each region’s Champion and
        follow the steps below.
      </p>

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
          The book will tell you to “restart.” This simply means restarting the{" "}
          <strong>server</strong> (stop and start again), or in singleplayer,
          quitting and rejoining your world.
        </p>
        <p className="text-gray-300">
          <strong>Important:</strong> You will not lose your world or builds.
          Only your <strong>level cap resets</strong>, so you’ll need to build a
          new team for the next region. The new structures will generate in new,
          unloaded chunks.
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
