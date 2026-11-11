"use client";

import React, { useState } from "react";

export default function Spoiler({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-bg-surface">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left bg-bg-surface hover:bg-bg-surface-hover transition-colors duration-200 flex items-center justify-between group"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-text-primary">{title}</span>
        <svg
          className={`w-5 h-5 text-text-secondary transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="px-4 py-3 bg-bg-base border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
}
