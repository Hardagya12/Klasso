"use client";
import React from "react";

interface StickyNoteCardProps {
  children: React.ReactNode;
  className?: string;
  color?: "pink" | "mint" | "lavender" | "butter" | "sky" | "peach" | "white";
  tilt?: number;
  tape?: boolean;
  tapeColor?: string;
  onClick?: () => void;
  id?: string;
}

export function StickyNoteCard({
  children,
  className = "",
  color = "butter",
  tilt = 0,
  tape = false,
  tapeColor,
  onClick,
  id,
}: StickyNoteCardProps) {
  const colors: Record<string, string> = {
    pink:     "bg-primary-light border-primary",
    mint:     "bg-secondary-light border-secondary",
    lavender: "bg-accent-light border-accent",
    butter:   "bg-butter-light border-butter",
    sky:      "bg-sky-light border-sky",
    peach:    "bg-peach-light border-peach",
    white:    "bg-surface border-border",
  };

  const tapeColors: Record<string, string> = {
    pink: "#FFB5C8",
    mint: "#A8E6CF",
    lavender: "#C8B6FF",
    butter: "#FFEAA7",
    sky: "#B8E8FC",
    peach: "#FFCBA4",
    white: "#E0E0E0",
  };

  const actualTapeColor = tapeColor || tapeColors[color];
  const interactive = onClick
    ? "cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-kawaii-lg active:scale-[0.98]"
    : "";

  return (
    <div
      id={id}
      onClick={onClick}
      className={`
        relative rounded-[4px] rounded-br-[20px] p-5 border
        shadow-kawaii
        ${colors[color]}
        ${interactive}
        ${className}
      `}
      style={{ transform: tilt ? `rotate(${tilt}deg)` : undefined }}
    >
      {/* Washi tape on top */}
      {tape && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 rounded-sm opacity-70 washi-tape" style={{ backgroundColor: actualTapeColor }} />
      )}
      {/* Curl shadow at bottom-right */}
      <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M32 0C32 16 16 32 0 32L32 32V0Z" fill="rgba(0,0,0,0.03)"/>
        </svg>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
