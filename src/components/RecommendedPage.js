"use client";

import { useState } from "react";
import { recommendedResources } from "@/data/recommendedData";
import ResourceSection from "@/components/ResourceSection";

export default function RecommendedPage() {
  const categoryOrder = [
    "mods",
    "resourcepacks",
    "datapacks",
    "modpacks",
    "servers",
  ];
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const categoryLabels = {
    all: "All",
    mods: "Mods",
    resourcepacks: "Resource Packs",
    datapacks: "Data Packs",
    modpacks: "Modpacks",
    servers: "Multiplayer Servers",
  };

  const matchesSearch = (item) =>
    [item.name, item.note, item.author]
      .filter(Boolean)
      .some((val) => val.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white px-4 py-8 flex flex-col items-center">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Recommended Mods & Resources
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          My handpicked mods, packs, and enhancements for Cobblemon and
          Minecraft.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {["all", ...categoryOrder].map((key) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`px-4 py-2 rounded-full text-sm transition ${
              activeCategory === key
                ? "bg-blue-600 text-white"
                : "bg-[#333] text-gray-300 hover:bg-[#444]"
            }`}
          >
            {categoryLabels[key]}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="mb-10 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search mods, datapacks, etc..."
          className="w-full px-4 py-2 rounded bg-[#2c2c2c] text-white placeholder-gray-400 focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Sections */}
      <div className="max-w-7xl mx-auto space-y-12">
        {categoryOrder
          .filter((key) => activeCategory === "all" || activeCategory === key)
          .map((categoryKey) => {
            const category = recommendedResources[categoryKey];
            if (!category) return null;

            let filteredCategories = null;
            let filteredItems = null;

            if (category.categories) {
              filteredCategories = category.categories
                .map((cat) => ({
                  ...cat,
                  items: cat.items.filter(matchesSearch),
                }))
                .filter((cat) => cat.items.length > 0);
            } else if (category.items) {
              filteredItems = category.items.filter(matchesSearch);
            }

            if (
              (filteredCategories && filteredCategories.length === 0) ||
              (filteredItems && filteredItems.length === 0)
            ) {
              return null;
            }

            return (
              <ResourceSection
                key={categoryKey}
                title={category.title}
                categoryKey={categoryKey}
                categories={filteredCategories}
                items={filteredItems}
                search={search}
              />
            );
          })}
      </div>

      {/* No Matches Message */}
      {categoryOrder.every((key) => {
        const category = recommendedResources[key];
        const hasMatch =
          category?.categories?.some((cat) => cat.items.some(matchesSearch)) ||
          category?.items?.some(matchesSearch);
        return !hasMatch;
      }) && (
        <p className="text-center text-gray-500 mt-8">
          No matching resources found.
        </p>
      )}

      <footer className="mt-16 text-center text-gray-500 text-sm">
        Huge thanks to every creator featured here — your creativity makes the
        game so much better! ✨
      </footer>
    </div>
  );
}
