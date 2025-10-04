"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function FeedbackGallery() {
  const screenshots = [
    { src: "./feedback/feedback1.png", alt: "Feedback 1" },
    { src: "./feedback/feedback2.png", alt: "Feedback 2" },
    { src: "./feedback/feedback3.png", alt: "Feedback 3" },
    { src: "./feedback/feedback4.png", alt: "Feedback 4" },
  ];

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

  const [selected, setSelected] = useState(null);

  return (
    <section className="py-12 bg-[#1e1e1e] text-white">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">💬 Feedback From Others</h2>
        <p className="text-gray-400 mt-2">
          Here’s what people have said about my projects and contributions.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto px-4">
        {screenshots.map((img, idx) => (
          <div
            key={idx}
            className="cursor-pointer overflow-hidden rounded-lg border border-[#333] bg-[#2c2c2c] hover:shadow-lg"
            onClick={() => setSelected(img)}
          >
            <div className="flex items-center justify-center h-[150px] bg-[#1a1a1a] p-2">
              <Image
                src={img.src}
                alt={img.alt}
                width={800}
                height={800}
                className="object-contain max-h-full"
              />
            </div>
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
        🙏 Huge thanks to everyone who’s shared their thoughts — your support
        means a lot!
      </p>
    </section>
  );
}
