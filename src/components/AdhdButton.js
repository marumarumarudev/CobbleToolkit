"use client";

import { useEffect, useRef, useState } from "react";

export default function AdhdButton() {
  const [showVideo, setShowVideo] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const btnRef = useRef(null);
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const dragStartTime = useRef(0);

  const MIN_BTN_WIDTH = 120;
  const BTN_HEIGHT = 40;
  const VIDEO_WIDTH = 320;
  const VIDEO_HEIGHT = 180;
  const MARGIN = 12;

  // Helper to clamp position inside viewport
  const clampPositionToViewport = (pos) => {
    const btnWidth = btnRef.current?.offsetWidth || MIN_BTN_WIDTH;
    const x = Math.max(
      MARGIN,
      Math.min(window.innerWidth - btnWidth - MARGIN, pos.x)
    );
    const y = Math.max(
      MARGIN,
      Math.min(
        window.innerHeight - BTN_HEIGHT - VIDEO_HEIGHT - MARGIN * 3,
        pos.y
      )
    );
    return { x, y };
  };

  // Load saved position
  useEffect(() => {
    const saved = localStorage.getItem("adhd_position");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPosition(clampPositionToViewport(parsed));
      } catch {
        setPosition({ x: 24, y: 24 });
      }
    }
  }, []);

  // Apply style position
  useEffect(() => {
    const el = btnRef.current;
    if (el) {
      el.style.left = `${position.x}px`;
      el.style.top = `${position.y}px`;
    }
  }, [position]);

  // Re-clamp position on resize or zoom
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => clampPositionToViewport(prev));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Dragging behavior
  useEffect(() => {
    const onMouseDown = (e) => {
      if (!btnRef.current || !btnRef.current.contains(e.target)) return;
      isDragging.current = true;
      dragStartTime.current = Date.now();
      const rect = btnRef.current.getBoundingClientRect();
      offset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const onMouseMove = (e) => {
      if (!isDragging.current || !btnRef.current) return;

      const newX = e.clientX - offset.current.x;
      const newY = e.clientY - offset.current.y;
      setPosition(clampPositionToViewport({ x: newX, y: newY }));
    };

    const onMouseUp = () => {
      if (isDragging.current) {
        const dragDuration = Date.now() - dragStartTime.current;
        if (dragDuration < 150) setShowVideo((prev) => !prev);
        localStorage.setItem("adhd_position", JSON.stringify(position));
      }
      isDragging.current = false;
    };

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [position]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    }
  }, []);

  const safeX = Math.min(position.x, viewport.width - VIDEO_WIDTH - MARGIN);
  const safeY = Math.min(
    position.y + BTN_HEIGHT + MARGIN,
    viewport.height - VIDEO_HEIGHT - MARGIN
  );

  return (
    <>
      <button
        ref={btnRef}
        className="fixed z-50 text-white px-4 py-2 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-colors font-medium hidden sm:block"
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: "grab",
          whiteSpace: "nowrap",
        }}
      >
        🧠 ADHD Mode
      </button>

      {showVideo && (
        <div
          className="fixed z-50 border border-gray-700 shadow-lg rounded bg-black resize overflow-hidden"
          style={{
            left: `${safeX}px`,
            top: `${safeY}px`,
            width: `${VIDEO_WIDTH}px`,
            height: `${VIDEO_HEIGHT}px`,
            minWidth: "160px",
            minHeight: "90px",
          }}
        >
          <iframe
            src="https://www.youtube.com/embed/L_fcrOyoWZ8?autoplay=1&mute=1&controls=1&loop=1&playlist=L_fcrOyoWZ8"
            title="Subway Surfers"
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        </div>
      )}
    </>
  );
}
