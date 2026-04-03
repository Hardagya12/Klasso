"use client";
import React from "react";

interface KawaiiStrawberryProps {
  size?: number;
  className?: string;
  happy?: boolean;
}

export function KawaiiStrawberry({
  size = 40,
  className = "",
  happy = true,
}: KawaiiStrawberryProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      {/* Leaf */}
      <path d="M14 10C14 10 17 4 20 4C23 4 26 10 26 10" fill="#A8E6CF" stroke="#4A4458" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M17 8L20 2L23 8" fill="#7BCBA5" stroke="#4A4458" strokeWidth="1" strokeLinejoin="round"/>
      {/* Berry body */}
      <path d="M10 14C10 14 8 24 12 30C15 34 25 34 28 30C32 24 30 14 30 14C30 14 26 10 20 10C14 10 10 14 10 14Z" fill="#FFB5C8" stroke="#4A4458" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Seeds */}
      <ellipse cx="16" cy="20" rx="0.8" ry="1" fill="#FFEAA7" transform="rotate(-10 16 20)"/>
      <ellipse cx="24" cy="20" rx="0.8" ry="1" fill="#FFEAA7" transform="rotate(10 24 20)"/>
      <ellipse cx="20" cy="28" rx="0.8" ry="1" fill="#FFEAA7"/>
      <ellipse cx="15" cy="26" rx="0.8" ry="1" fill="#FFEAA7" transform="rotate(-5 15 26)"/>
      <ellipse cx="25" cy="26" rx="0.8" ry="1" fill="#FFEAA7" transform="rotate(5 25 26)"/>
      {/* Kawaii face */}
      <ellipse cx="17" cy="21" rx="1.2" ry="1.5" fill="#4A4458"/>
      <ellipse cx="23" cy="21" rx="1.2" ry="1.5" fill="#4A4458"/>
      <circle cx="16.5" cy="20.3" r="0.5" fill="white"/>
      <circle cx="22.5" cy="20.3" r="0.5" fill="white"/>
      {/* Blush */}
      <ellipse cx="14" cy="24" rx="2" ry="1.2" fill="#E88FA7" opacity="0.35"/>
      <ellipse cx="26" cy="24" rx="2" ry="1.2" fill="#E88FA7" opacity="0.35"/>
      {/* Mouth */}
      {happy ? (
        <path d="M18 25C19 26.5 21 26.5 22 25" stroke="#4A4458" strokeWidth="1" strokeLinecap="round" fill="none"/>
      ) : (
        <circle cx="20" cy="25" r="1.2" fill="#4A4458" opacity="0.7"/>
      )}
    </svg>
  );
}
