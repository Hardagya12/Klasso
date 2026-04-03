"use client";
import React from "react";

interface KawaiiStarProps {
  size?: number;
  className?: string;
  color?: string;
  mood?: "happy" | "wink" | "sparkle";
}

export function KawaiiStar({
  size = 40,
  className = "",
  color = "#FFEAA7",
  mood = "happy",
}: KawaiiStarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      {/* Star body */}
      <path d="M20 3L24.5 14.5L37 15.5L27.5 23.5L30 36L20 30L10 36L12.5 23.5L3 15.5L15.5 14.5L20 3Z" fill={color} stroke="#4A4458" strokeWidth="1.5" strokeLinejoin="round"/>
      
      {/* Face */}
      {mood === "wink" ? (
        <>
          <ellipse cx="16" cy="19" rx="1.3" ry="1.6" fill="#4A4458"/>
          <circle cx="15.4" cy="18.3" r="0.5" fill="white"/>
          <path d="M23 18.5C23.5 18 25 18 25.5 19" stroke="#4A4458" strokeWidth="1.2" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <ellipse cx="16" cy="19" rx="1.3" ry="1.6" fill="#4A4458"/>
          <ellipse cx="24" cy="19" rx="1.3" ry="1.6" fill="#4A4458"/>
          <circle cx="15.4" cy="18.3" r="0.5" fill="white"/>
          <circle cx="23.4" cy="18.3" r="0.5" fill="white"/>
        </>
      )}
      
      {/* Blush */}
      <ellipse cx="13" cy="22" rx="2" ry="1" fill="#FFB5C8" opacity="0.4"/>
      <ellipse cx="27" cy="22" rx="2" ry="1" fill="#FFB5C8" opacity="0.4"/>
      
      {/* Mouth */}
      <path d="M18 23C19 24.5 21 24.5 22 23" stroke="#4A4458" strokeWidth="1" strokeLinecap="round" fill="none"/>
      
      {/* Sparkle extras */}
      {mood === "sparkle" && (
        <>
          <circle cx="35" cy="6" r="1.5" fill={color}/>
          <circle cx="5" cy="8" r="1" fill={color}/>
          <path d="M36 12L37 10L38 12L37 14Z" fill={color}/>
        </>
      )}
    </svg>
  );
}
