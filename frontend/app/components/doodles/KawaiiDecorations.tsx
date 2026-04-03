"use client";
import React from "react";

// ─── Tiny Sparkle ───
interface SparkleProps {
  size?: number;
  color?: string;
  className?: string;
}

export function Sparkle({ size = 16, color = "#FFEAA7", className = "" }: SparkleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M8 1C8.3 5 10 7 14 7.5C10 8.2 8.3 10 8 15C7.7 10 5.5 8.2 2 7.5C5.5 7 7.7 5 8 1Z" fill={color}/>
    </svg>
  );
}

// ─── Heart ───
interface HeartProps {
  size?: number;
  color?: string;
  className?: string;
}

export function KawaiiHeart({ size = 20, color = "#FFB5C8", className = "" }: HeartProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M10 17C10 17 2 12 2 7C2 4 4 2 7 2C8.5 2 9.5 3 10 4C10.5 3 11.5 2 13 2C16 2 18 4 18 7C18 12 10 17 10 17Z" fill={color} stroke="#4A4458" strokeWidth="1"/>
    </svg>
  );
}

// ─── Bow ───
interface BowProps {
  size?: number;
  color?: string;
  className?: string;
}

export function KawaiiBow({ size = 24, color = "#FFB5C8", className = "" }: BowProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 18" fill="none" className={className}>
      <path d="M12 9C8 4 2 3 2 7C2 11 8 12 12 9Z" fill={color} stroke="#4A4458" strokeWidth="1"/>
      <path d="M12 9C16 4 22 3 22 7C22 11 16 12 12 9Z" fill={color} stroke="#4A4458" strokeWidth="1"/>
      <circle cx="12" cy="9" r="2.5" fill={color} stroke="#4A4458" strokeWidth="1"/>
      <path d="M10 12L11 16" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M14 12L13 16" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Rainbow ───
interface RainbowProps {
  size?: number;
  className?: string;
}

export function KawaiiRainbow({ size = 48, className = "" }: RainbowProps) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 60 36" fill="none" className={className}>
      <path d="M6 34C6 18 16 6 30 6C44 6 54 18 54 34" stroke="#FFB5C8" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M12 34C12 22 20 12 30 12C40 12 48 22 48 34" stroke="#FFEAA7" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M18 34C18 26 23 18 30 18C37 18 42 26 42 34" stroke="#A8E6CF" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M24 34C24 29 26 24 30 24C34 24 36 29 36 34" stroke="#B8E8FC" strokeWidth="4" strokeLinecap="round" fill="none"/>
      {/* Clouds at ends */}
      <circle cx="7" cy="34" r="5" fill="white" stroke="#4A4458" strokeWidth="1"/>
      <circle cx="12" cy="33" r="4" fill="white" stroke="#4A4458" strokeWidth="1"/>
      <circle cx="53" cy="34" r="5" fill="white" stroke="#4A4458" strokeWidth="1"/>
      <circle cx="48" cy="33" r="4" fill="white" stroke="#4A4458" strokeWidth="1"/>
    </svg>
  );
}

// ─── Washi Tape Strip ───
interface WashiTapeProps {
  width?: number;
  color?: string;
  className?: string;
  pattern?: "stripes" | "dots" | "plain";
}

export function WashiTape({ width = 120, color = "#FFB5C8", className = "", pattern = "stripes" }: WashiTapeProps) {
  return (
    <svg width={width} height="24" viewBox={`0 0 ${width} 24`} fill="none" className={className} style={{ display: "block" }}>
      <rect x="0" y="2" width={width} height="20" rx="1" fill={color} opacity="0.7"/>
      {/* Torn edges */}
      <path d={`M0 2C2 4 4 1 6 3C8 5 10 1 12 3C14 5 16 1 18 3C20 5 22 1 24 3C26 5 28 1 30 3C32 5 34 1 36 3C38 5 40 1 42 3C44 5 46 1 48 3C50 5 52 1 54 3C56 5 58 1 60 3C62 5 64 1 66 3C68 5 70 1 72 3C74 5 76 1 78 3C80 5 82 1 84 3C86 5 88 1 90 3C92 5 94 1 96 3C98 5 100 1 102 3C104 5 106 1 108 3C110 5 112 1 114 3C116 5 118 1 ${width} 2`} fill={color} opacity="0.85"/>
      {/* Pattern */}
      {pattern === "stripes" && (
        <>
          {Array.from({ length: Math.floor(width / 8) }, (_, i) => (
            <line key={i} x1={i * 8 + 2} y1="2" x2={i * 8 + 6} y2="22" stroke="white" strokeWidth="1.5" opacity="0.3"/>
          ))}
        </>
      )}
      {pattern === "dots" && (
        <>
          {Array.from({ length: Math.floor(width / 16) }, (_, i) => (
            <React.Fragment key={i}>
              <circle cx={i * 16 + 8} cy="8" r="2" fill="white" opacity="0.35"/>
              <circle cx={i * 16 + 8} cy="16" r="2" fill="white" opacity="0.35"/>
            </React.Fragment>
          ))}
        </>
      )}
    </svg>
  );
}

// ─── Paw Print ───
interface PawPrintProps {
  size?: number;
  color?: string;
  className?: string;
}

export function PawPrint({ size = 20, color = "#FFB5C8", className = "" }: PawPrintProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <ellipse cx="10" cy="13" rx="4" ry="3.5" fill={color}/>
      <circle cx="6" cy="8" r="2" fill={color}/>
      <circle cx="10" cy="6" r="2" fill={color}/>
      <circle cx="14" cy="8" r="2" fill={color}/>
      <circle cx="5" cy="12" r="1.5" fill={color}/>
      <circle cx="15" cy="12" r="1.5" fill={color}/>
    </svg>
  );
}

// ─── Cherry Blossom Petal ───
interface PetalProps {
  size?: number;
  color?: string;
  className?: string;
}

export function SakuraPetal({ size = 16, color = "#FFB5C8", className = "" }: PetalProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M8 2C6 4 4 8 6 12C7 14 9 14 10 12C12 8 10 4 8 2Z" fill={color} opacity="0.6"/>
    </svg>
  );
}
