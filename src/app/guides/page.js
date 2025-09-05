import Link from "next/link";

export const metadata = {
  title: "Guides | CobbleToolkit",
  description: "COBBLEVERSE Guides",
};

export default function GuidesIndexPage() {
  const packs = [
    {
      name: "COBBLEVERSE",
      description: "Community knowledge for the Cobbleverse modpack.",
      href: "/guides/cobbleverse",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
      {packs.map((pack) => (
        <Link
          key={pack.href}
          href={pack.href}
          className="block bg-[#2a2a2a] hover:bg-[#3a3a3a] transition p-4 rounded-lg shadow-sm"
        >
          <h2 className="text-xl font-semibold">{pack.name}</h2>
          <p className="text-gray-400 text-sm mt-1">{pack.description}</p>
        </Link>
      ))}
    </div>
  );
}
