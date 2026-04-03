"use client";
import React from "react";

interface KawaiiShibaProps {
  size?: number;
  className?: string;
  mood?: "happy" | "sleepy" | "excited";
}

export function KawaiiShiba({
  size = 48,
  className = "",
  mood = "happy",
}: KawaiiShibaProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Body */}
      <ellipse cx="24" cy="36" rx="12" ry="8" fill="#FFEAA7" stroke="#4A4458" strokeWidth="1.5"/>
      {/* Head */}
      <circle cx="24" cy="22" r="12" fill="#FFEAA7" stroke="#4A4458" strokeWidth="1.5"/>
      {/* White face patch */}
      <path d="M16 24C16 24 18 30 24 30C30 30 32 24 32 24C32 24 30 20 24 19C18 20 16 24 16 24Z" fill="#FFF5D0"/>
      {/* Ears */}
      <path d="M13 14L10 4L18 12Z" fill="#FFEAA7" stroke="#4A4458" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M35 14L38 4L30 12Z" fill="#FFEAA7" stroke="#4A4458" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Inner ears */}
      <path d="M13.5 12L12 6L17 11Z" fill="#FFB5C8" opacity="0.5"/>
      <path d="M34.5 12L36 6L31 11Z" fill="#FFB5C8" opacity="0.5"/>
      {/* Eyes */}
      {mood === "sleepy" ? (
        <>
          <path d="M19 22C19.5 21 21.5 21 22 22" stroke="#4A4458" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M26 22C26.5 21 28.5 21 29 22" stroke="#4A4458" strokeWidth="1.5" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <ellipse cx="20" cy="21" rx="2" ry="2.5" fill="#4A4458"/>
          <ellipse cx="28" cy="21" rx="2" ry="2.5" fill="#4A4458"/>
          <circle cx="19.2" cy="20" r="0.8" fill="white"/>
          <circle cx="27.2" cy="20" r="0.8" fill="white"/>
        </>
      )}
      {/* Nose */}
      <ellipse cx="24" cy="25" rx="2" ry="1.5" fill="#4A4458"/>
      {/* Mouth */}
      {mood === "excited" ? (
        <path d="M21 27C22 30 26 30 27 27" stroke="#4A4458" strokeWidth="1.2" strokeLinecap="round" fill="#FFB5C8"/>
      ) : (
        <>
          <path d="M22 27L24 28L26 27" stroke="#4A4458" strokeWidth="1" strokeLinecap="round" fill="none"/>
        </>
      )}
      {/* Blush */}
      <ellipse cx="16" cy="25" rx="2.5" ry="1.5" fill="#FFB5C8" opacity="0.4"/>
      <ellipse cx="32" cy="25" rx="2.5" ry="1.5" fill="#FFB5C8" opacity="0.4"/>
      {/* Tail */}
      <path d="M33 36C37 34 38 30 36 28" stroke="#FFEAA7" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M33 36C37 34 38 30 36 28" stroke="#4A4458" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Paws */}
      <ellipse cx="18" cy="42" rx="3" ry="2" fill="#FFEAA7" stroke="#4A4458" strokeWidth="1"/>
      <ellipse cx="30" cy="42" rx="3" ry="2" fill="#FFEAA7" stroke="#4A4458" strokeWidth="1"/>
    </svg>
  );
}
