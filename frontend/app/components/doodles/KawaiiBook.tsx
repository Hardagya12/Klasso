"use client";
import React from "react";

interface KawaiiBookProps {
  size?: number;
  className?: string;
  color?: string;
}

export function KawaiiBook({
  size = 40,
  className = "",
  color = "#C8B6FF",
}: KawaiiBookProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      {/* Back cover */}
      <rect x="6" y="6" width="26" height="32" rx="3" fill="#A48FE0" stroke="#4A4458" strokeWidth="1.2"/>
      {/* Pages */}
      <rect x="8" y="5" width="24" height="31" rx="2" fill="white" stroke="#4A4458" strokeWidth="0.8"/>
      {/* Front cover */}
      <rect x="6" y="4" width="26" height="32" rx="3" fill={color} stroke="#4A4458" strokeWidth="1.5"/>
      {/* Spine */}
      <line x1="10" y1="4" x2="10" y2="36" stroke="#4A4458" strokeWidth="1" opacity="0.3"/>
      
      {/* Cover decoration — heart */}
      <path d="M18 12C16 10 13 10 13 13C13 16 18 19 18 19C18 19 23 16 23 13C23 10 20 10 18 12Z" fill="#FFB5C8" stroke="#4A4458" strokeWidth="0.8"/>
      
      {/* Kawaii face */}
      <ellipse cx="16" cy="24" rx="1" ry="1.3" fill="#4A4458"/>
      <ellipse cx="22" cy="24" rx="1" ry="1.3" fill="#4A4458"/>
      <circle cx="15.5" cy="23.3" r="0.4" fill="white"/>
      <circle cx="21.5" cy="23.3" r="0.4" fill="white"/>
      
      {/* Blush */}
      <ellipse cx="13.5" cy="26.5" rx="1.5" ry="1" fill="#FFB5C8" opacity="0.35"/>
      <ellipse cx="24.5" cy="26.5" rx="1.5" ry="1" fill="#FFB5C8" opacity="0.35"/>
      
      {/* Smile */}
      <path d="M17 28C17.5 29 20.5 29 21 28" stroke="#4A4458" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
    </svg>
  );
}
