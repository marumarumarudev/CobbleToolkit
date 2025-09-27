"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useState } from "react";
import React from "react";
import { createPortal } from "react-dom";

export default function ImageWithFullscreen({ src, alt, credit }) {
  return (
    <div className="mt-3 space-y-2">
      <img
        src={src}
        alt={alt}
        className="rounded-2xl shadow-lg max-w-full h-auto"
      />
      {credit ? (
        <div className="text-sm text-gray-100/90">
          <span className="font-medium">Credit:</span> {credit}
        </div>
      ) : null}
    </div>
  );
}

/* === IMAGE CAROUSEL WITH FULLSCREEN === */
function ImageCarousel({ images }) {
  const [emblaRef] = useEmblaCarousel({ loop: true });
  const [fullscreen, setFullscreen] = useState(null);

  // Scoped Escape handler: active only when fullscreen is open
  React.useEffect(() => {
    if (!fullscreen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setFullscreen(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fullscreen]);

  // Prevent background scroll while fullscreen
  React.useEffect(() => {
    if (!fullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreen]);

  // Fullscreen modal component
  const FullscreenModal = () => {
    if (!fullscreen) return null;

    return (
      <div
        className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999] p-4"
        onClick={() => setFullscreen(null)}
        role="dialog"
        aria-modal="true"
        aria-label="Image preview"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
        }}
      >
        <div
          className="relative w-full h-full max-w-7xl max-h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setFullscreen(null)}
            aria-label="Close fullscreen"
            className="absolute top-4 right-4 z-10 inline-flex items-center justify-center rounded-md bg-black/70 hover:bg-black/80 text-white p-3 shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={fullscreen.src}
              alt={fullscreen.alt}
              fill
              sizes="100vw"
              className="object-contain"
              style={{ maxHeight: "100vh", maxWidth: "100vw" }}
              quality={100}
              priority={true}
            />
          </div>
          <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur px-4 py-2 rounded-lg text-gray-100 text-sm shadow-lg">
            <span className="font-medium">Credit:</span> {fullscreen.credit}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div
        className="relative overflow-hidden rounded-2xl shadow-lg cursor-grab active:cursor-grabbing select-none"
        ref={emblaRef}
        aria-label="Image carousel. Swipe or scroll to navigate."
      >
        <div className="flex">
          {images.map((img, idx) => (
            <div className="flex-[0_0_100%] h-52 sm:h-64 md:h-80" key={idx}>
              <button
                className="relative w-full h-full overflow-hidden rounded-2xl"
                onClick={() => setFullscreen(img)}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  quality={100}
                  priority={idx === 0}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/40 backdrop-blur px-3 py-2 text-sm text-gray-100">
                  <span className="font-medium">Credit:</span> {img.credit}
                </div>
              </button>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          <span className="opacity-80">Swipe</span>
          <span aria-hidden>↔</span>
        </div>
      </div>

      {/* Render fullscreen modal using portal */}
      {typeof window !== "undefined" &&
        fullscreen &&
        createPortal(<FullscreenModal />, document.body)}
    </div>
  );
}

/* === UPDATE CAROUSELS === */
export function UpdateCarousels({ type }) {
  if (type === "modrinth-update") {
    const images = [
      {
        src: "/guides/modrinth-update-1.png",
        alt: "Modrinth update step 1",
        credit: "doctor",
      },
      {
        src: "/guides/modrinth-update-2.png",
        alt: "Modrinth update step 2",
        credit: "doctor",
      },
      {
        src: "/guides/modrinth-update-3.png",
        alt: "Modrinth update step 3",
        credit: "doctor",
      },
    ];
    return <ImageCarousel images={images} />;
  }

  if (type === "purge-cache") {
    const images = [
      {
        src: "/guides/purge-cache-1.png",
        alt: "Purge cache step 1",
        credit: "doctor",
      },
      {
        src: "/guides/purge-cache-2.png",
        alt: "Purge cache step 2",
        credit: "doctor",
      },
      {
        src: "/guides/purge-cache-3.png",
        alt: "Purge cache step 3",
        credit: "doctor",
      },
    ];
    return <ImageCarousel images={images} />;
  }

  if (type === "curseforge-update") {
    const images = [
      {
        src: "/guides/curseforge-update-1.png",
        alt: "CurseForge update step 1",
        credit: "Austin Powers",
      },
      {
        src: "/guides/curseforge-update-2.png",
        alt: "CurseForge update step 2",
        credit: "Austin Powers",
      },
      {
        src: "/guides/curseforge-update-3.png",
        alt: "CurseForge update step 3",
        credit: "Austin Powers",
      },
      {
        src: "/guides/curseforge-update-4.png",
        alt: "CurseForge update step 4",
        credit: "Austin Powers",
      },
    ];
    return <ImageCarousel images={images} />;
  }

  return null;
}
