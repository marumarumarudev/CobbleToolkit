import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Star,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Heart,
} from "lucide-react";

export const metadata = {
  title: "Guides | CobbleToolkit",
  description: "Player-written guides for popular Cobblemon modpacks",
};

export default function GuidesIndexPage() {
  const packs = [
    {
      name: "COBBLEVERSE",
      description:
        "Community knowledge for the Cobbleverse modpack. Comprehensive guides covering progression, gym leaders, items, and more.",
      href: "/guides/cobbleverse",
      icon: "/cobbleverse.png",
      stats: {
        guides: 9,
        categories: 9,
        lastUpdated: "10/24/25",
      },
      features: [
        "Progression Guide",
        "Gym Leaders",
        "Item Database",
        "Breeding Tips",
      ],
      featured: true,
    },
  ];

  const comingSoon = [
    {
      name: "Mayview",
      description: "Coming soon - Comprehensive guides for Mayview modpack",
      icon: Sparkles,
      status: "Coming Soon",
    },
    {
      name: "COBBLEMON 1.7 UPDATE",
      description: "Coming soon - Guides for vanilla Cobblemon 1.7 experiences",
      icon: TrendingUp,
      status: "Planned",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Available Modpacks */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Available Modpacks
          </h2>
          <p className="text-gray-400">
            Choose a modpack to explore community guides
          </p>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-1">
          {packs.map((pack) => {
            return (
              <Link
                key={pack.href}
                href={pack.href}
                className="group relative block"
              >
                {/* Featured badge */}
                {pack.featured && (
                  <div className="absolute -top-3 -right-3 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Featured
                    </div>
                  </div>
                )}

                <div className="relative overflow-hidden">
                  {/* Background glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>

                  {/* Main card */}
                  <div className="relative bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] border border-gray-700/50 rounded-2xl p-8 hover:border-yellow-400/30 hover:shadow-lg hover:shadow-yellow-400/5 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-start gap-6">
                      {/* Icon */}
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        {typeof pack.icon === "string" ? (
                          <Image
                            src={pack.icon}
                            alt={`${pack.name} icon`}
                            width={32}
                            height={32}
                            className="w-8 h-8"
                          />
                        ) : (
                          <pack.icon className="w-8 h-8 text-black" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-bold text-white group-hover:text-yellow-100 transition-colors mb-2">
                          {pack.name}
                        </h3>
                        <p className="text-gray-300 text-lg leading-relaxed mb-4">
                          {pack.description}
                        </p>

                        {/* Features */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {pack.features.map((feature, index) => (
                            <span
                              key={index}
                              className="bg-[#3a3a3a] text-gray-300 px-3 py-1 rounded-full text-sm"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{pack.stats.guides} Guides</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{pack.stats.categories} Categories</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>Community Driven</span>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="flex items-center gap-2 text-yellow-400 group-hover:text-yellow-300 font-medium transition-colors">
                          <span>Explore Guides</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
          <p className="text-gray-400">
            More modpack guides are in development
          </p>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {comingSoon.map((pack, index) => {
            const IconComponent = pack.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-[#2a2a2a]/50 to-[#1f1f1f]/50 border border-gray-700/30 rounded-xl p-6 opacity-75"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {pack.name}
                      </h3>
                      <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs">
                        {pack.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{pack.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Community CTA */}
      <div className="bg-gradient-to-r from-[#2a2a2a] to-[#1f1f1f] border border-gray-700/50 rounded-2xl p-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-white mb-3">
            Want to contribute?
          </h3>
          <p className="text-gray-300 mb-4">
            These guides are community-driven! If you have tips, strategies, or
            knowledge to share, we’d love to include your contributions.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-yellow-400">
              <Users className="w-4 h-4" />
              <span>Community Driven</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-400">
              <Star className="w-4 h-4" />
              <span>Expert Tips</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-400">
              <Users className="w-4 h-4" />
              <span>Always Updated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
