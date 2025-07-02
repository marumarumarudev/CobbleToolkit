"use client";
import Image from "next/image";
import { useState } from "react";

export default function FeedbackGallery() {
  const screenshots = [
    { src: "/feedback/feedback1.png", alt: "Feedback 1" },
    { src: "/feedback/feedback2.png", alt: "Feedback 2" },
  ];

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
            <Image
              src={img.src}
              alt={img.alt}
              width={600}
              height={400}
              className="w-full h-auto object-contain transition-transform duration-200 hover:scale-105"
            />
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
    </section>
  );
}
