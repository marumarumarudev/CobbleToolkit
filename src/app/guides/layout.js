import { BookOpen, Users, Star } from "lucide-react";

export default function GuidesLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#1e1e1e] to-[#1a1a1a] text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-transparent to-yellow-400/5"></div>
        <div className="relative px-4 py-16 sm:px-6 sm:py-20">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-3xl mb-6">
              <BookOpen className="w-10 h-10 text-yellow-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-yellow-100 to-yellow-400 bg-clip-text text-transparent">
              Guides
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              Player-written tips and knowledge for popular Cobblemon modpacks.
              Not official; focused on practical info missing from wikis.
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 bg-[#2a2a2a] border border-gray-700/50 rounded-full px-4 py-2">
                <Users className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Community Driven</span>
              </div>
              <div className="flex items-center gap-2 bg-[#2a2a2a] border border-gray-700/50 rounded-full px-4 py-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Expert Tips</span>
              </div>
              <div className="flex items-center gap-2 bg-[#2a2a2a] border border-gray-700/50 rounded-full px-4 py-2">
                <BookOpen className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Always Updated</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative px-4 pb-16 sm:px-6">
        <div className="max-w-6xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
