import React from "react";

export const metadata = {
  title: "Cobbreeding Guide | CobbleToolkit",
  description: "Player-written Guide for Cobbreeding",
};

export default function BreedingGuidePage() {
  return (
    <div className="space-y-6">
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
      </p>

      {/* Pasture Blocks */}
      <section className="space-y-3">
        <h2 className="font-semibold">Pasture Blocks</h2>
        <p className="text-gray-300">
          Cobbleverse uses the <strong>Cobbreeding</strong> mod. Pokémon
          compatible for breeding must be placed inside{" "}
          <strong>Pasture Blocks</strong>. By default, they have a{" "}
          <strong>50% chance every 10 minutes</strong> to produce an egg, but in{" "}
          <strong>Cobbleverse</strong> this interval is{" "}
          <strong>7 minutes</strong>.
        </p>
        <p className="text-gray-300">
          Eggs appear behind the pasture block. Right-click the bottom of the
          block to collect them. Pasture blocks can also connect to{" "}
          <strong>storage blocks via hoppers</strong>, making an automated egg
          farm possible.
        </p>
        <p className="text-gray-300">
          Each interval, the pasture block looks for{" "}
          <strong>two compatible parents</strong>. For best results, use one
          pasture per breeding pair — otherwise, parents are chosen randomly if
          more than two are inside.
        </p>
      </section>

      {/* IVs Section */}
      <section className="space-y-3">
        <h2 className="font-semibold">IV Inheritance</h2>
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
      <section className="space-y-3">
        <h2 className="font-semibold">Practical Breeding Example</h2>
        <p className="text-gray-300">
          Start with an Eevee with 3 perfect IVs. Give one parent a{" "}
          <strong>Destiny Knot</strong> and connect your{" "}
          <span className="font-medium">Pasture Block</span> to a hopper/chest.
          Eggs will collect in the chest:
        </p>
        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-300">
          <li>Discard eggs with 2 IVs or less.</li>
          <li>Hatch 3+ IV eggs and recycle them into the pool.</li>
          <li>Repeat until you reach 5 IVs, then 6 IVs.</li>
        </ul>
        <p className="text-gray-300">
          Power Bands are only useful early when parents have low/no IVs.
        </p>
      </section>

      {/* Shiny Rates */}
      <section className="space-y-3">
        <h2 className="font-semibold">Shiny Breeding</h2>
        <p className="text-gray-300">
          Default Cobblemon shiny rate: <strong>1/4096</strong>. In{" "}
          <strong>Cobbleverse</strong>: <strong>1/2048</strong>.
        </p>
        <p className="text-gray-300">
          Breeding multiplies these odds. In Cobbleverse, shiny chance is{" "}
          <strong>16×</strong> by default:
        </p>
        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-300">
          <li>
            <strong>Always:</strong> Every breed = 16/2048 chance.
          </li>
          <li>
            <strong>Masuda Method:</strong> Parents from different{" "}
            <strong>original trainers</strong>.
          </li>
        </ul>
        <p className="text-gray-300 italic">
          Masuda + shiny parents + Always = near-guaranteed shiny odds with the
          right setup.
        </p>
      </section>

      {/* Hidden Abilities */}
      <section className="space-y-3">
        <h2 className="font-semibold">Hidden Abilities</h2>
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
      </section>

      {/* Natures */}
      <section className="space-y-3">
        <h2 className="font-semibold">Natures</h2>
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
      </section>

      {/* Overall Setup */}
      <section className="space-y-3">
        <h2 className="font-semibold">Overall Setup</h2>
        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-300">
          <li>One parent holds Destiny Knot.</li>
          <li>
            The other holds Everstone (if you want its nature passed down).
          </li>
          <li>Hidden Abilities are RNG — use Ability Patch if unlucky.</li>
        </ul>
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
          💬 Community explanation by{" "}
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
