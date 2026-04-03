"use client";
import React from "react";

interface KawaiiBobaCupProps {
  size?: number;
  className?: string;
  flavor?: "strawberry" | "taro" | "matcha" | "classic";
}

export function KawaiiBobaCup({
  size = 48,
  className = "",
  flavor = "strawberry",
}: KawaiiBobaCupProps) {
  const flavors = {
    strawberry: { body: "#FFB5C8", lid: "#E88FA7", straw: "#FF6B8A" },
    taro:       { body: "#C8B6FF", lid: "#A48FE0", straw: "#9B7FD4" },
    matcha:     { body: "#A8E6CF", lid: "#7BCBA5", straw: "#5BAD8A" },
    classic:    { body: "#FFEAA7", lid: "#E6CF7A", straw: "#D4B85A" },
  };
  const f = flavors[flavor];

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Cup body */}
      <path d="M14 18L16 40C16 42 18 44 24 44C30 44 32 42 32 40L34 18H14Z" fill={f.body} stroke="#4A4458" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Lid */}
      <rect x="12" y="14" width="24" height="5" rx="2.5" fill={f.lid} stroke="#4A4458" strokeWidth="1.5"/>
      {/* Dome top */}
      <path d="M16 14C16 11 19 8 24 8C29 8 32 11 32 14" fill={f.lid} stroke="#4A4458" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Straw */}
      <rect x="26" y="3" width="3" height="16" rx="1.5" fill={f.straw} stroke="#4A4458" strokeWidth="1" transform="rotate(8 27.5 11)"/>
      {/* Boba pearls */}
      <circle cx="19" cy="36" r="2.5" fill="#4A4458" opacity="0.6"/>
      <circle cx="24" cy="38" r="2.5" fill="#4A4458" opacity="0.6"/>
      <circle cx="29" cy="36" r="2.5" fill="#4A4458" opacity="0.6"/>
      <circle cx="21" cy="40" r="2" fill="#4A4458" opacity="0.5"/>
      <circle cx="27" cy="40" r="2" fill="#4A4458" opacity="0.5"/>
      {/* Kawaii face */}
      <ellipse cx="20" cy="27" rx="1.5" ry="2" fill="#4A4458"/>
      <ellipse cx="28" cy="27" rx="1.5" ry="2" fill="#4A4458"/>
      {/* Sparkle eyes */}
      <circle cx="19.3" cy="26.2" r="0.6" fill="white"/>
      <circle cx="27.3" cy="26.2" r="0.6" fill="white"/>
      {/* Blush */}
      <ellipse cx="17" cy="30" rx="2.5" ry="1.5" fill="#FFB5C8" opacity="0.5"/>
      <ellipse cx="31" cy="30" rx="2.5" ry="1.5" fill="#FFB5C8" opacity="0.5"/>
      {/* Tiny smile */}
      <path d="M22 31C23 32.5 25 32.5 26 31" stroke="#4A4458" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}
