"use client";
import React from "react";

interface KawaiiPencilProps {
  size?: number;
  className?: string;
  color?: string;
}

export function KawaiiPencil({
  size = 40,
  className = "",
  color = "#FFEAA7",
}: KawaiiPencilProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 48" fill="none" className={className}>
      {/* Pencil body */}
      <rect x="14" y="8" width="12" height="28" rx="1" fill={color} stroke="#4A4458" strokeWidth="1.5"/>
      
      {/* Eraser */}
      <rect x="14" y="4" width="12" height="5" rx="2" fill="#FFB5C8" stroke="#4A4458" strokeWidth="1.2"/>
      
      {/* Metal band */}
      <rect x="14" y="8" width="12" height="3" fill="#D4C8D3" stroke="#4A4458" strokeWidth="1"/>
      
      {/* Tip */}
      <path d="M14 36L20 46L26 36" fill="#FFF5D0" stroke="#4A4458" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M18 40L20 46L22 40" fill="#4A4458" opacity="0.6"/>
      
      {/* Kawaii face */}
      <ellipse cx="18" cy="22" rx="1" ry="1.3" fill="#4A4458"/>
      <ellipse cx="22" cy="22" rx="1" ry="1.3" fill="#4A4458"/>
      <circle cx="17.5" cy="21.3" r="0.4" fill="white"/>
      <circle cx="21.5" cy="21.3" r="0.4" fill="white"/>
      
      {/* Blush */}
      <ellipse cx="16" cy="25" rx="1.5" ry="1" fill="#FFB5C8" opacity="0.4"/>
      <ellipse cx="24" cy="25" rx="1.5" ry="1" fill="#FFB5C8" opacity="0.4"/>
      
      {/* Smile */}
      <path d="M18.5 26C19 27 21 27 21.5 26" stroke="#4A4458" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
    </svg>
  );
}
