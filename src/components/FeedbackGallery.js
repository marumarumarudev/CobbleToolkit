"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function FeedbackGallery() {
  const screenshots = [
    { src: "/feedback/feedback1.png", alt: "azera" },
    { src: "/feedback/feedback2.png", alt: "Cz1owi3kR4k" },
    { src: "/feedback/feedback3.png", alt: "Clammy" },
    { src: "/feedback/feedback4.png", alt: "skeleton" },
    { src: "/feedback/feedback5.png", alt: "Linguini" },
  ];

  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    document.title = "Feedback Gallery | CobbleToolkit";
  }, []);

  return (
    <section className="py-12 bg-[#1e1e1e] text-white">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">💬 Feedback From Others</h2>
        <p className="text-gray-400 mt-2">
          Here&apos;s what people have said about my projects and contributions.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto px-4">
        {screenshots.map((img, idx) => (
          <div key={idx} className="space-y-3 group">
            <div
              className="relative w-full rounded-lg border border-gray-600 overflow-hidden bg-gray-800 hover:border-gray-500 transition-colors duration-200 cursor-pointer"
              onClick={() => setSelected(img)}
            >
              <div className="aspect-[4/3] relative">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </div>
            <p className="text-sm text-gray-400 text-center group-hover:text-gray-300 transition-colors duration-200">
              {img.alt}
            </p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div className="max-w-4xl max-h-[90vh] overflow-auto rounded-lg border border-gray-700">
            <Image
              src={selected.src}
              alt={selected.alt}
              width={1200}
              height={800}
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      )}

      <p className="text-center text-gray-500 mt-8 text-sm">
        🙏 Huge thanks to everyone who&apos;s shared their thoughts — your
        support means a lot!
      </p>
    </section>
  );
}
