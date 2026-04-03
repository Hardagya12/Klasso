"use client";
import React from "react";

interface KawaiiMushroomProps {
  size?: number;
  className?: string;
  color?: "red" | "pink" | "purple" | "mint";
}

export function KawaiiMushroom({
  size = 40,
  className = "",
  color = "red",
}: KawaiiMushroomProps) {
  const colors = {
    red:    { cap: "#FFB5C8", spots: "#FFFFFF" },
    pink:   { cap: "#E88FA7", spots: "#FFE0EA" },
    purple: { cap: "#C8B6FF", spots: "#E8DEFF" },
    mint:   { cap: "#A8E6CF", spots: "#D4F5E6" },
  };
  const c = colors[color];

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      {/* Stem */}
      <path d="M16 24L15 34C15 36 17 37 20 37C23 37 25 36 25 34L24 24" fill="#FFF5D0" stroke="#4A4458" strokeWidth="1.2" strokeLinejoin="round"/>
      
      {/* Cap */}
      <path d="M6 24C6 14 12 6 20 6C28 6 34 14 34 24H6Z" fill={c.cap} stroke="#4A4458" strokeWidth="1.5" strokeLinejoin="round"/>
      
      {/* Spots */}
      <circle cx="14" cy="14" r="3" fill={c.spots}/>
      <circle cx="26" cy="12" r="2.5" fill={c.spots}/>
      <circle cx="20" cy="8" r="2" fill={c.spots}/>
      <circle cx="10" cy="20" r="2" fill={c.spots}/>
      <circle cx="30" cy="19" r="2.5" fill={c.spots}/>
      
      {/* Kawaii face */}
      <ellipse cx="17" cy="20" rx="1.2" ry="1.5" fill="#4A4458"/>
      <ellipse cx="23" cy="20" rx="1.2" ry="1.5" fill="#4A4458"/>
      <circle cx="16.5" cy="19.3" r="0.5" fill="white"/>
      <circle cx="22.5" cy="19.3" r="0.5" fill="white"/>
      {/* Blush */}
      <ellipse cx="14" cy="22" rx="2" ry="1" fill="#E88FA7" opacity="0.3"/>
      <ellipse cx="26" cy="22" rx="2" ry="1" fill="#E88FA7" opacity="0.3"/>
      {/* Smile */}
      <path d="M18.5 23C19 24 21 24 21.5 23" stroke="#4A4458" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
    </svg>
  );
}
