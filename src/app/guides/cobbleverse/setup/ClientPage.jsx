"use client";

import React from "react";

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
