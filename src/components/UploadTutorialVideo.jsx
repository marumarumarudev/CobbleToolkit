"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

const VIDEO_ID = "GRqwv087tgo";

export default function UploadTutorialVideo() {
  const [loaded, setLoaded] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (loaded) iframeRef.current?.focus();
  }, [loaded]);

  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-bg-surface-2">
        {loaded ? (
          <iframe
            ref={iframeRef}
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1`}
            title="How to upload a datapack in CobbleToolkit"
            allow="autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="flex h-full w-full flex-col items-center justify-center gap-3 px-4 text-text-primary transition-colors hover:bg-bg-surface focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent"
            aria-label="Load YouTube player: datapack upload walkthrough"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Play size={22} aria-hidden="true" />
            </span>
            <span className="text-sm font-medium">Watch upload walkthrough</span>
          </button>
        )}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-text-muted">
        {loaded ? "Video hosted by YouTube." : "The YouTube player loads only when you choose to watch."}{" "}
        <a
          href={`https://www.youtube.com/watch?v=${VIDEO_ID}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-secondary underline underline-offset-2 hover:text-text-primary"
        >
          Open on YouTube
        </a>
      </p>
    </div>
  );
}
