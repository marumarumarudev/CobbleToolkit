"use client";

import Image from "next/image";
import React from "react";

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

      {/* IVs Section */}
      <section className="space-y-3">
        <h2 className="font-semibold">IV Inheritance</h2>
        <p className="text-gray-300">
          Each offspring inherits <strong>3 random IVs</strong> from the parents
          (out of 12 possible IVs combined from both). The rest are randomized.
        </p>
        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-300">
          <li>
            <strong>Power Bands:</strong> Lock a specific IV from the parent
            holding it. (Ex: Def Power Band guarantees DEF IV from that parent.)
          </li>
          <li>
            <strong>Destiny Knot:</strong> Ensures{" "}
            <strong>5 out of 12 IVs</strong> are inherited between both parents.
          </li>
          <li>
            Only <strong>one IV</strong> will always remain random.
          </li>
        </ul>
        <p className="text-gray-300 italic">
          ⚠️ Don’t give both parents Power Bands — only one will be chosen
          (50/50).
        </p>
      </section>

      {/* Breeding Method */}
      <section className="space-y-3">
        <h2 className="font-semibold">Practical Breeding Example</h2>
        <p className="text-gray-300">
          Start with an Eevee with 3 perfect IVs. Give one parent a{" "}
          <strong>Destiny Knot</strong> and connect your{" "}
          <span className="font-medium">Pasture Block</span> to a hopper/chest
          system. Eggs will collect in the chest:
        </p>
        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-300">
          <li>Discard eggs with 2 IVs or less.</li>
          <li>Hatch 3+ IV eggs and add them back into the breeding pool.</li>
          <li>Repeat until reaching 5 IVs → then 6 IVs.</li>
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
          Breeding can increase this rate using shiny multipliers (default 16x
          in Cobbleverse):
        </p>
        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-300">
          <li>
            <strong>Always:</strong> Enabled by default in Cobbleverse. Every
            breed = 16/2048.
          </li>
          <li>
            <strong>Masuda Method:</strong> Parents from different trainers.
          </li>
          <li>
            <strong>Crystal Method:</strong> Shiny parent(s) increase the odds
            further.
          </li>
        </ul>
        <p className="text-gray-300 italic">
          With config tweaks, Masuda + 2 shiny parents + Always = absurd shiny
          odds (essentially guaranteed).
        </p>
      </section>

      {/* Hidden Abilities */}
      <section className="space-y-3">
        <h2 className="font-semibold">Hidden Abilities</h2>
        <p className="text-gray-300">
          Only <strong>female</strong> Pokémon pass down Hidden Abilities (HAs),
          and only by chance:
        </p>
        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-300">
          <li>3 regular abilities → 10% chance.</li>
          <li>2 regular abilities → 20% chance.</li>
          <li>
            Female HA → <strong>60% chance</strong>.
          </li>
        </ul>
        <p className="text-gray-300">
          Items like <strong>Ability Patch</strong> or{" "}
          <strong>Ability Capsule</strong> can set abilities directly, so
          farming HAs isn’t mandatory.
        </p>
      </section>

      {/* Natures */}
      <section className="space-y-3">
        <h2 className="font-semibold">Natures</h2>
        <p className="text-gray-300">
          Natures affect stat growth. For example:
        </p>
        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-300">
          <li>
            <strong>Jolly:</strong> +Speed, –SpA (good for physical attackers).
          </li>
          <li>
            <strong>Timid:</strong> +Speed, –Atk (good for special attackers).
          </li>
        </ul>
        <p className="text-gray-300">
          To lock nature: give the desired-nature parent an{" "}
          <strong>Everstone</strong>.
        </p>
      </section>

      {/* Overall Setup */}
      <section className="space-y-3">
        <h2 className="font-semibold">Overall Setup</h2>
        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-300">
          <li>One parent holds Destiny Knot.</li>
          <li>
            The other parent holds Everstone (only if nature is the one you
            want).
          </li>
          <li>Hidden Abilities are RNG — use Ability Patch later if needed.</li>
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
          for more tips, or visit the{" "}
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
