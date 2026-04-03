"use client";
import React from "react";

interface KawaiiFrogProps {
  size?: number;
  className?: string;
}

export function KawaiiFrog({
  size = 48,
  className = "",
}: KawaiiFrogProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Lily pad */}
      <ellipse cx="24" cy="42" rx="18" ry="5" fill="#A8E6CF" stroke="#4A4458" strokeWidth="1.2"/>
      <path d="M24 37L24 42" stroke="#7BCBA5" strokeWidth="1" opacity="0.5"/>
      <path d="M18 40C20 39 22 39 24 42" stroke="#7BCBA5" strokeWidth="0.8" opacity="0.4" fill="none"/>
      
      {/* Body */}
      <ellipse cx="24" cy="32" rx="10" ry="8" fill="#A8E6CF" stroke="#4A4458" strokeWidth="1.5"/>
      
      {/* Head */}
      <circle cx="24" cy="20" r="11" fill="#A8E6CF" stroke="#4A4458" strokeWidth="1.5"/>
      
      {/* Lighter belly */}
      <ellipse cx="24" cy="33" rx="7" ry="5" fill="#D4F5E6"/>
      
      {/* Eye bumps */}
      <circle cx="17" cy="13" r="5" fill="#A8E6CF" stroke="#4A4458" strokeWidth="1.5"/>
      <circle cx="31" cy="13" r="5" fill="#A8E6CF" stroke="#4A4458" strokeWidth="1.5"/>
      
      {/* Eye whites */}
      <circle cx="17" cy="13" r="3.5" fill="white"/>
      <circle cx="31" cy="13" r="3.5" fill="white"/>
      
      {/* Pupils */}
      <circle cx="17.5" cy="13" r="2" fill="#4A4458"/>
      <circle cx="31.5" cy="13" r="2" fill="#4A4458"/>
      <circle cx="16.8" cy="12" r="0.8" fill="white"/>
      <circle cx="30.8" cy="12" r="0.8" fill="white"/>
      
      {/* Blush */}
      <ellipse cx="14" cy="20" rx="2.5" ry="1.5" fill="#FFB5C8" opacity="0.35"/>
      <ellipse cx="34" cy="20" rx="2.5" ry="1.5" fill="#FFB5C8" opacity="0.35"/>
      
      {/* Smile */}
      <path d="M20 23C21.5 25.5 26.5 25.5 28 23" stroke="#4A4458" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      
      {/* Front legs */}
      <ellipse cx="15" cy="38" rx="4" ry="2" fill="#A8E6CF" stroke="#4A4458" strokeWidth="1"/>
      <ellipse cx="33" cy="38" rx="4" ry="2" fill="#A8E6CF" stroke="#4A4458" strokeWidth="1"/>
    </svg>
  );
}
