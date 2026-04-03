"use client";
import React from "react";

interface KawaiiCloudProps {
  size?: number;
  className?: string;
  mood?: "happy" | "sleepy" | "blushy";
  color?: string;
  children?: React.ReactNode;
}

export function KawaiiCloud({
  size = 64,
  className = "",
  mood = "happy",
  color = "#B8E8FC",
  children,
}: KawaiiCloudProps) {
  return (
    <span className={`inline-flex items-center justify-center relative ${className}`} style={{ width: size, height: size * 0.7 }}>
      <svg width={size} height={size * 0.7} viewBox="0 0 80 56" fill="none" className="absolute inset-0">
        {/* Cloud shape */}
        <path d="M16 40C8 40 4 36 4 30C4 24 8 20 14 20C14 12 20 6 28 6C34 6 38 10 40 14C42 10 48 6 54 6C62 6 68 12 68 20C74 20 78 24 78 30C78 36 74 40 66 40H16Z" fill={color} stroke="#4A4458" strokeWidth="1.5" strokeLinejoin="round"/>
        
        {/* Face */}
        {mood === "sleepy" ? (
          <>
            <path d="M30 26C30.5 25 33 25 33.5 26" stroke="#4A4458" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M46 26C46.5 25 49 25 49.5 26" stroke="#4A4458" strokeWidth="1.5" strokeLinecap="round"/>
          </>
        ) : (
          <>
            <ellipse cx="32" cy="25" rx="2" ry="2.5" fill="#4A4458"/>
            <ellipse cx="48" cy="25" rx="2" ry="2.5" fill="#4A4458"/>
            <circle cx="31" cy="24" r="0.8" fill="white"/>
            <circle cx="47" cy="24" r="0.8" fill="white"/>
          </>
        )}
        
        {/* Blush */}
        {(mood === "blushy" || mood === "happy") && (
          <>
            <ellipse cx="26" cy="30" rx="3.5" ry="2" fill="#FFB5C8" opacity="0.4"/>
            <ellipse cx="54" cy="30" rx="3.5" ry="2" fill="#FFB5C8" opacity="0.4"/>
          </>
        )}
        
        {/* Mouth */}
        {mood === "sleepy" ? (
          <ellipse cx="40" cy="32" rx="2" ry="1.5" fill="#4A4458" opacity="0.5"/>
        ) : (
          <path d="M37 32C38.5 34 41.5 34 43 32" stroke="#4A4458" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        )}
      </svg>
      {children && <span className="relative z-10 mt-[-8px]">{children}</span>}
    </span>
  );
}
