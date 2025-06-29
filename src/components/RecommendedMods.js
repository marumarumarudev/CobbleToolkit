"use client";

import { recommendedResources } from "@/data/recommendedData";

export default function RecommendedMods() {
  const categoryOrder = ["mods", "resourcepacks", "datapacks", "modpacks"];

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white px-4 py-10">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">
          🌟 Recommended Mods & Resources
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          These are my handpicked enhancements for Cobblemon and Minecraft. Each
          one is tested and regularly used — from visual upgrades to full-blown
          modpacks.
        </p>
      </div>

      {/* Responsive columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {categoryOrder.map((categoryKey) => {
          const category = recommendedResources[categoryKey];
          if (!category) return null;

          return (
            <div key={categoryKey}>
              <h2 className="text-xl font-semibold mb-4">{category.title}</h2>

              {/* Handle Mods separately due to subcategories */}
              {categoryKey === "mods" ? (
                category.categories.map((subcat, idx) => (
                  <div key={idx} className="mb-6">
                    <h3 className="text-blue-300 font-semibold text-sm mb-2">
                      {subcat.label}
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-200">
                      {subcat.items.map((item, i) =>
                        item.name ? (
                          <li key={i}>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline"
                            >
                              {item.name}
                            </a>{" "}
                            <span className="text-gray-400 text-xs">
                              — {item.note}
                            </span>
                          </li>
                        ) : null
                      )}
                    </ul>
                  </div>
                ))
              ) : (
                <ul className="list-disc list-inside space-y-2 text-gray-200">
                  {category.items.map((item, i) => (
                    <li key={i}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {item.name}
                      </a>{" "}
                      <span className="text-gray-400 text-xs">
                        — {item.note}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
      <footer className="mt-16 text-center text-gray-500 text-sm">
        Huge thanks to every creator featured here — your creativity makes the
        game so much better! ✨
      </footer>
    </div>
  );
}
