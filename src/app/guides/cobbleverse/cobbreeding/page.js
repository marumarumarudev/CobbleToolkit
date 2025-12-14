import React from "react";
import Image from "next/image";

export const metadata = {
  title: "Cobbreeding Guide | CobbleToolkit",
  description: "Player-written Guide for Cobbreeding",
};

export default function BreedingGuidePage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4">
      <h1 className="text-3xl font-bold">Cobblemon Breeding Guide</h1>
      <p className="text-gray-300">
        This page explains how breeding works in Cobbleverse. Official guide by{" "}
        <a
          href="https://docs.google.com/document/d/1Hk5Iqnzm2NqkXGwzUIvPVFKhAwVHSEM3hyP3Qdhl5g4/edit?tab=t.0"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline"
        >
          Ludichat
        </a>
        . Community notes provided by{" "}
        <span className="font-medium">requiem</span>.
        <br />
        <span className="text-xs opacity-50 italic">
          requiem misses azera, doctor, and maru 💖
        </span>
      </p>

      {/* Pasture Blocks */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Pasture Blocks</h2>
        <p className="text-gray-300">
          Cobbleverse uses the <strong>Cobbreeding</strong> mod. Pokémon
          compatible for breeding must be placed inside{" "}
          <strong>Pasture Blocks</strong>. By default, an egg spawns between{" "}
          <strong>8000 and 14000 ticks</strong>, but in{" "}
          <strong>Cobbleverse</strong> this interval is{" "}
          <strong>7200 and 21600 ticks (6-18 minutes)</strong>.
        </p>

        {/* Pasture Block Setup Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div className="space-y-2">
            <div className="relative w-full rounded-lg border border-gray-600 overflow-hidden">
              <Image
                src="/guides/pasture-block.png"
                alt="Pasture block setup"
                width={400}
                height={300}
                className="w-full h-auto rounded-lg"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            <p className="text-sm text-gray-400 text-center">
              Pasture block setup
            </p>
          </div>
          <div className="space-y-2">
            <div className="relative w-full rounded-lg border border-gray-600 overflow-hidden">
              <Image
                src="/guides/pasture-block-egg.png"
                alt="Pasture block with eggs behind it"
                width={400}
                height={300}
                className="w-full h-auto rounded-lg"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <p className="text-sm text-gray-400 text-center">
              Behind angle showing eggs
            </p>
          </div>
        </div>

        <p className="text-gray-300">
          After placing the pasture block, an option for breeding is present in
          the upper-right corner. By default, this is turned off (with an{" "}
          <strong>X</strong> displayed). Click it to remove the X and start the
          breeding process.
        </p>

        <p className="text-gray-300">
          Egg farms require the chunks to load, but Cobbreeding also allows eggs
          to be produced without the chunks loading through the pasture
          block&apos;s inventory
        </p>

        <div className="my-4">
          <div className="relative w-full max-w-md mx-auto rounded-lg border border-gray-600 overflow-hidden">
            <Image
              src="/guides/pasture-inventory.png"
              alt="Pasture block inventory showing eggs"
              width={400}
              height={300}
              className="w-full h-auto rounded-lg"
              sizes="(max-width: 768px) 100vw, 384px"
            />
          </div>
          <p className="text-sm text-gray-400 text-center mt-2">
            Pasture block inventory
          </p>
        </div>

        <p className="text-gray-300">
          Each interval, the pasture block looks for{" "}
          <strong>two compatible parents</strong>. For best results, use one
          pasture per breeding pair — otherwise, parents are chosen randomly if
          more than two are inside.
        </p>

        <div className="my-4">
          <div className="relative w-full max-w-md mx-auto rounded-lg border border-gray-600 overflow-hidden">
            <Image
              src="/guides/compatible-parents.png"
              alt="Pasture block UI with male and female Lucarios"
              width={400}
              height={300}
              className="w-full h-auto rounded-lg"
              sizes="(max-width: 768px) 100vw, 384px"
            />
          </div>
          <p className="text-sm text-gray-400 text-center mt-2">
            Pasture UI with breeding pair
          </p>
        </div>
      </section>

      {/* IVs Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">IV Inheritance</h2>
        <p className="text-gray-300">
          Without any held items, offspring inherit{" "}
          <strong>3 random IVs</strong> from the 12 total IVs of both parents.
          The rest are randomized.
        </p>
        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-300">
          <li>
            <strong>Power Bands:</strong> Lock a specific IV from the parent
            holding it. (Ex: Def Power Band guarantees DEF IV.)
          </li>
          <li>
            <strong>Destiny Knot:</strong> Ensures{" "}
            <strong>5 out of 12 IVs</strong> are inherited.
          </li>
          <li>Only one IV will always remain random.</li>
        </ul>

        {/* Power Band and Destiny Knot Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div className="space-y-2">
            <div className="relative w-full rounded-lg border border-gray-600 overflow-hidden">
              <Image
                src="/guides/power-band-lucario.png"
                alt="Lucario holding Power Band"
                width={400}
                height={300}
                className="w-full h-auto rounded-lg"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <p className="text-sm text-gray-400 text-center">
              Lucario holding Power Band
            </p>
          </div>
          <div className="space-y-2">
            <div className="relative w-full rounded-lg border border-gray-600 overflow-hidden">
              <Image
                src="/guides/destiny-knot-lucario.png"
                alt="Lucario holding Destiny Knot"
                width={400}
                height={300}
                className="w-full h-auto rounded-lg"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <p className="text-sm text-gray-400 text-center">
              Lucario holding Destiny Knot
            </p>
          </div>
        </div>

        <p className="text-gray-300 italic">
          ⚠️ Don’t give both parents Power Bands — only one is chosen (50/50).
        </p>
        <p className="text-gray-300">
          Strategy: use Power Bands if your Pokémon has only 1 IV. Switch to
          Destiny Knot once it reaches 2 IVs or more. You can also combine a
          Destiny Knot + one Power Band to guarantee one stat while passing
          others.
        </p>
      </section>

      {/* Practical Breeding */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">
          Practical Breeding Example
        </h2>
        <p className="text-gray-300">
          Start with an Eevee with 3 perfect IVs. Give one parent a{" "}
          <strong>Destiny Knot</strong>. Eggs will be produced in the pasture
          block:
        </p>
        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-300">
          <li>Discard eggs with 2 IVs or less.</li>
          <li>Hatch 3+ IV eggs and recycle them into the pool.</li>
          <li>Repeat until you reach 5 IVs, then 6 IVs.</li>
        </ul>

        {/* Egg Detail Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div className="space-y-2">
            <div className="relative w-full rounded-lg border border-gray-600 overflow-hidden">
              <Image
                src="/guides/riolu-egg-1.png"
                alt="Riolu egg with near-perfect IVs"
                width={400}
                height={300}
                className="w-full h-auto rounded-lg"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <p className="text-sm text-gray-400 text-center">
              Riolu egg with near-perfect IVs
            </p>
          </div>
          <div className="space-y-2">
            <div className="relative w-full rounded-lg border border-gray-600 overflow-hidden">
              <Image
                src="/guides/riolu-egg-2.png"
                alt="Riolu egg with perfect IVs, shiny star and perfect IV triangle icons"
                width={400}
                height={300}
                className="w-full h-auto rounded-lg"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <p className="text-sm text-gray-400 text-center">
              Perfect IV Riolu egg (shiny ⭐, perfect IVs △)
            </p>
          </div>
        </div>

        <p className="text-gray-300 text-sm italic">
          💡 <strong>Note:</strong> The ability to see egg stats in tooltips and
          the visual indicators (⭐ for shiny, △ for perfect IVs) are provided
          by the{" "}
          <a
            href="https://modrinth.com/mod/more-cobblemon-tweaks"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            MoreCobblemonTweaks
          </a>{" "}
          mod. This is a client-side mod that enhances the egg tooltip display.
        </p>

        <p className="text-gray-300">
          Power Bands are only useful early when parents have low/no IVs.
        </p>
      </section>

      {/* Shiny Rates */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Shiny Breeding</h2>
        <p className="text-gray-300">
          Default Cobblemon shiny rate: <strong>1/8196</strong>. In{" "}
          <strong>Cobbleverse</strong>: <strong>1/2048</strong>.
        </p>
        <p className="text-gray-300">
          Breeding multiplies these odds. In Cobbleverse, by default:
        </p>
        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-300">
          <li>
            <strong>Always:</strong> Every breed. Set to <strong>8.0×</strong>.
          </li>
          <li>
            <strong>Masuda Method:</strong> Parents from different{" "}
            <strong>original trainers</strong>. Set to <strong>2.0×</strong>.
          </li>
          <li>
            <strong>Crystal Method:</strong> Shiny parent(s) increase the odds
            further. Set to <strong>2.0×</strong> (2 shiny parents increases it
            to <strong>4.0×</strong>).
          </li>
        </ul>
        <p className="text-gray-300">
          In Cobbleverse, all eggs have a <strong>64/2048</strong> max chance of
          being shiny.
        </p>
      </section>

      {/* Hidden Abilities */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Hidden Abilities</h2>
        <p className="text-gray-300">
          Only <strong>female Pokémon</strong> pass down Hidden Abilities (HAs),
          and only by chance:
        </p>
        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-300">
          <li>3 regular abilities → 10% chance</li>
          <li>2 regular abilities → 20% chance</li>
          <li>
            Female with HA → <strong>60% chance</strong>
          </li>
        </ul>
        <p className="text-gray-300">
          Items like <strong>Ability Patch</strong> or{" "}
          <strong>Ability Capsule</strong> can set abilities directly.
        </p>

        {/* Ability Items Images */}
        <div className="my-4">
          <div className="relative w-full max-w-sm mx-auto rounded-lg border border-gray-600 overflow-hidden">
            <Image
              src="/guides/ability-items.png"
              alt="Ability Capsule and Ability Patch items"
              width={400}
              height={300}
              className="w-full h-auto rounded-lg"
              sizes="(max-width: 768px) 100vw, 384px"
            />
          </div>
          <p className="text-sm text-gray-400 text-center mt-2">
            Ability Capsule and Ability Patch
          </p>
        </div>
      </section>

      {/* Natures */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Natures</h2>
        <p className="text-gray-300">Natures affect stat growth. Example:</p>
        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-300">
          <li>
            <strong>Jolly:</strong> +Speed, –SpA
          </li>
          <li>
            <strong>Timid:</strong> +Speed, –Atk
          </li>
        </ul>
        <p className="text-gray-300">
          To lock a nature: give the parent an <strong>Everstone</strong>.
        </p>

        {/* Everstone Image */}
        <div className="my-4">
          <div className="relative w-full max-w-sm mx-auto rounded-lg border border-gray-600 overflow-hidden">
            <Image
              src="/guides/everstone-lucario.png"
              alt="Lucario holding Everstone"
              width={400}
              height={300}
              className="w-full h-auto rounded-lg"
              sizes="(max-width: 768px) 100vw, 384px"
            />
          </div>
          <p className="text-sm text-gray-400 text-center mt-2">
            Lucario holding Everstone
          </p>
        </div>
      </section>

      {/* Overall Setup */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Overall Setup</h2>
        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-300">
          <li>One parent holds Destiny Knot.</li>
          <li>
            The other holds Everstone (if you want its nature passed down).
          </li>
          <li>Hidden Abilities are RNG — use Ability Patch if unlucky.</li>
        </ul>

        {/* Final Setup UI Image */}
        <div className="my-4">
          <div className="relative w-full max-w-md mx-auto rounded-lg border border-gray-600 overflow-hidden">
            <Image
              src="/guides/everstone-lucario-2.png"
              alt="Pasture UI with Lucario holding Destiny Knot and other Lucario holding Everstone"
              width={400}
              height={300}
              className="w-full h-auto rounded-lg"
              sizes="(max-width: 768px) 100vw, 384px"
            />
          </div>
          <p className="text-sm text-gray-400 text-center mt-2">
            Optimal breeding setup: Destiny Knot + Everstone
          </p>
        </div>
      </section>

      {/* Config & Pro Tips */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">
          🥚 Egg Hatching Pro Tip
        </h2>
        <p className="text-gray-300">
          You will receive the <span className="font-medium">Pokémon Egg</span>{" "}
          as an item. It will hatch over time if kept in your inventory. You can
          speed up this process by having a Pokémon with the ability
          <b> Flame Body</b>, <b>Magma Armor</b>, or <b>Steam Engine</b> in your
          party. This halves the hatching time by taking{" "}
          <b>2 seconds off instead of 1</b>.
          <span className="italic text-sm text-gray-400">
            {" "}
            (The effect does not stack.)
          </span>
        </p>

        <h2 className="text-2xl font-semibold text-white">
          ⚙️ Config & Pro Tips
        </h2>
        <p className="text-gray-300">
          The config file is located at:{" "}
          <code>
            installation folder &gt; config &gt; cobbreeding &gt; main.json
          </code>
        </p>
        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-300">
          <li>
            <code>&quot;minBreedingTimeInTicks&quot;</code>: Lower this to
            reduce minimum time in egg production.
          </li>
          <li>
            <code>&quot;maxBreedingTimeInTicks&quot;</code>: Lower this to
            reduce maximum time in egg production.
          </li>
          <li>
            <code>&quot;eggHatchMultiplier&quot;</code>: Set to <code>0.0</code>{" "}
            for instant hatching, or lower than <code>1.0</code> to reduce hatch
            time.{" "}
            <span className="italic text-sm text-gray-400">
              (Does not affect eggs already generated before the change.)
            </span>
          </li>
        </ul>

        {/* Pro Config Image */}
        <div className="my-4">
          <div className="relative w-full max-w-lg mx-auto rounded-lg border border-gray-600 overflow-hidden">
            <Image
              src="/guides/pro-config.png"
              alt="Config file showing optimized breeding settings: eggCheckTicks 200 (10s), eggCheckChance 1.0 (100%), eggHatchMultiplier 0.0 (instant)"
              width={600}
              height={400}
              className="w-full h-auto rounded-lg"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </div>
          <p className="text-sm text-gray-400 text-center mt-2">
            Optimized config: 10s egg checks, 100% egg chance, instant hatching
          </p>
        </div>
        <p className="text-gray-400 text-sm">
          …or just download{" "}
          <a
            href="https://modrinth.com/mod/cobblemon-utility+"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            Cobblemon Utility+
          </a>{" "}
          because <span className="italic">screw breeding</span>.
        </p>
      </section>

      {/* Footer */}
      <div className="p-4 text-gray-300 border-t border-gray-700 space-y-2">
        <p>
          📖 Official guide:{" "}
          <a
            href="https://docs.google.com/document/d/1Hk5Iqnzm2NqkXGwzUIvPVFKhAwVHSEM3hyP3Qdhl5g4/edit?tab=t.0"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            Cobblemon Breeding (Ludichat)
          </a>
        </p>
        <p>
          🔗 Breeding compatibility checker:{" "}
          <a
            href="https://d-mcneil.github.io/pokemon-breeding-compatibility-checker/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            Pokémon Breeding Compatibility Checker
          </a>
        </p>
        <p>
          💬 Community explanation and images by{" "}
          <span className="font-medium">requiem</span>.
        </p>
        <p>
          Join the{" "}
          <a
            href="https://discord.lumy.fun/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            LUMYVERSE Discord
          </a>{" "}
          or visit the{" "}
          <a
            href="https://www.lumyverse.com/cobbleverse"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            Cobbleverse Wiki
          </a>
          .
        </p>
      </div>
    </div>
  );
}
