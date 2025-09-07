import Link from "next/link";
import {
  MapPin,
  Users,
  Package,
  Search,
  Sprout,
  Heart,
  BarChart3,
  ArrowRight,
  BookOpen,
  HelpCircle,
} from "lucide-react";

export const metadata = {
  title: "Guides | CobbleToolkit",
  description: "COBBLEVERSE Guides",
};

export default function CobbleverseOverviewPage() {
  const guides = [
    {
      title: "Frequently Asked Questions",
      description:
        "Quick answers to the most commonly asked questions about Cobbleverse",
      href: "/guides/cobbleverse/faq",
      icon: HelpCircle,
      featured: true,
    },
    {
      title: "How to proceed to next region?",
      description:
        "Complete guide on advancing through different regions in COBBLEVERSE",
      href: "/guides/cobbleverse/progression",
      icon: MapPin,
    },
    {
      title: "Locating Gym Leaders",
      description: "Find and challenge gym leaders across all regions",
      href: "/guides/cobbleverse/gym-leaders",
      icon: Users,
    },
    {
      title: "Items Guide",
      description:
        "Comprehensive guide to items, their uses, and where to find them",
      href: "/guides/cobbleverse/items",
      icon: Package,
    },
    {
      title: "How to Get Specific Pokémon",
      description: "Detailed methods for obtaining rare and specific Pokémon",
      href: "/guides/cobbleverse/how-to-get",
      icon: Search,
    },
    {
      title: "Farming Guide",
      description: "Efficient farming strategies and resource management",
      href: "/guides/cobbleverse/farming",
      icon: Sprout,
    },
    {
      title: "Cobbreeding Guide",
      description: "Master the art of Pokémon breeding in COBBLEVERSE",
      href: "/guides/cobbleverse/cobbreeding",
      icon: Heart,
    },
    {
      title: "Spawn Rates",
      description: "Understanding Pokémon spawn mechanics and rates",
      href: "/guides/cobbleverse/spawnrates",
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-2xl mb-4">
          <BookOpen className="w-8 h-8 text-yellow-400" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-yellow-100 to-yellow-400 bg-clip-text text-transparent">
          COBBLEVERSE Guides
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
          Practical tips and info gathered from playing the COBBLEVERSE modpack.
          Aimed at filling in gaps not covered by the official wiki.
        </p>
      </div>

      {/* Featured Guide */}
      {guides.find((g) => g.featured) && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] border border-yellow-400/20 rounded-2xl p-6 hover:border-yellow-400/40 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white mb-2">
                  {guides.find((g) => g.featured).title}
                </h2>
                <p className="text-gray-300 mb-4">
                  {guides.find((g) => g.featured).description}
                </p>
                <Link
                  href={guides.find((g) => g.featured).href}
                  className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-medium transition-colors group"
                >
                  Read Guide
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guides
          .filter((g) => !g.featured)
          .map((guide) => {
            const IconComponent = guide.icon;
            return (
              <Link
                key={guide.href}
                href={guide.href}
                className="group bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] border border-gray-700/50 rounded-xl p-5 hover:border-yellow-400/30 hover:shadow-lg hover:shadow-yellow-400/5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center group-hover:from-yellow-400/20 group-hover:to-yellow-600/20 transition-all duration-300">
                    <IconComponent className="w-5 h-5 text-gray-300 group-hover:text-yellow-400 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white group-hover:text-yellow-100 transition-colors mb-1">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                      {guide.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                </div>
              </Link>
            );
          })}
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-[#2a2a2a] to-[#1f1f1f] border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Guide Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {guides.length}
            </div>
            <div className="text-sm text-gray-400">Total Guides</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">8</div>
            <div className="text-sm text-gray-400">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">100%</div>
            <div className="text-sm text-gray-400">Community Driven</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400"></div>
            <div className="text-sm text-gray-400">Always Updated</div>
          </div>
        </div>
      </div>
    </div>
  );
}
