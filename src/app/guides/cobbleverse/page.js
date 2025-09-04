import Link from "next/link";

export default function CobbleverseOverviewPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">COBBLEVERSE Guides</h1>
      <p className="text-gray-300 mb-6">
        Practical tips and info gathered from playing the COBBLEVERSE modpack.
        Aimed at filling in gaps not covered by the official wiki.
      </p>
      <ul className="list-disc list-inside space-y-2 text-gray-300">
        <li>
          <Link
            className="text-yellow-400 hover:underline italic"
            href="/guides/cobbleverse/progress"
          >
            &quot;How to proceed to next region?&quot;
          </Link>
        </li>
        <li>
          <Link
            className="text-yellow-400 hover:underline"
            href="/guides/cobbleverse/items"
          >
            Items Guide
          </Link>
        </li>
        <li>
          <Link
            className="text-yellow-400 hover:underline"
            href="/guides/cobbleverse/gym-leaders"
          >
            Locating Gym Leaders
          </Link>
        </li>
        <li>
          <Link
            className="text-yellow-400 hover:underline"
            href="/guides/cobbleverse/how-to-get"
          >
            How to Get Specific Pokémon
          </Link>
        </li>
        <li>
          <Link
            className="text-yellow-400 hover:underline"
            href="/guides/cobbleverse/farming"
          >
            Farming Guide
          </Link>
        </li>
        <li>
          <Link
            className="text-yellow-400 hover:underline"
            href="/guides/cobbleverse/cobbreeding"
          >
            Cobbreeding Guide
          </Link>
        </li>
        <li>
          <Link
            className="text-yellow-400 hover:underline"
            href="/guides/cobbleverse/spawnrates"
          >
            Spawn Rates
          </Link>
        </li>
      </ul>
    </div>
  );
}
