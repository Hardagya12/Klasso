"use client";
import React from "react";

// ─── 1. Pencil SVG (for Logo & Icons) ───
export const PencilSVG = ({ size = 20, color = "#F5A623" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 22L4 22L12 6L20 22L22 22L12 2Z" fill={color} stroke="#2C2A24" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M10 18H14" stroke="#2C2A24" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// ─── 2. Squiggly Underline SVG ───
export const SquigglySVG = ({ width = 100, color = "#F5A623" }) => (
  <svg width={width} height="10" viewBox={`0 0 ${width} 10`} fill="none">
    <path d={`M2 5C${width * 0.25} 1 ${width * 0.45} 9 ${width * 0.65} 5C${width * 0.85} 1 ${width} 5 ${width} 5`}
      stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
  </svg>
);

// ─── 3. Starburst SVG (Mid-Century) ───
export const StarburstSVG = ({ size = 48, color = "#F5A623" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M24 2L27 15L40 10L33 22L46 24L33 26L40 38L27 33L24 46L21 33L8 38L15 26L2 24L15 22L8 10L21 15L24 2Z"
      fill={color} stroke="#2C2A24" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

// ─── 4. Hand-drawn Circle Ring SVG ───
export const CircleRingSVG = ({ size = 48, color = "#4A90D9" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="absolute inset-0 z-0">
    <ellipse cx="24" cy="24" rx="22" ry="21" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 2" transform="rotate(-5 24 24)" />
    <ellipse cx="24.5" cy="23.5" rx="21" ry="22" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" transform="rotate(2 24 24)" />
  </svg>
);

// ─── 5. Stat Card Component ───
export const DashboardStatCard = ({ label, value, icon: Icon, color, progress = 70 }: any) => (
  <div className="bg-surface rounded-[16px] border-2 border-border p-5 relative shadow-retro flex flex-col justify-between h-40">
    {Icon && (
      <div className="absolute top-4 right-4">
        <Icon size={32} color={color} />
      </div>
    )}
    <p className="text-text-muted font-heading font-semibold text-sm uppercase tracking-wider">{label}</p>
    <h3 className="text-3xl font-heading font-extrabold text-text">{value}</h3>
    <PencilProgressBar progress={progress} color={color} />
  </div>
);

// ─── 6. High-Quality Hand-Drawn Icons ───

export const HouseDoodle = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10L12 3L21 10V20C21 21 20 22 19 22H5C4 22 3 21 3 20V10Z" />
    <path d="M9 22V12H15V22" />
    <path d="M17 5V2h2v4" strokeWidth="2" /> {/* Specific Chimney with smoke path */}
  </svg>
);

export const AttendanceDoodle = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <path d="M9 12L11 14L15 10" strokeWidth="3" />
  </svg>
);

export const ChartDoodle = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="20" x2="18" y2="10" strokeWidth="3" />
    <line x1="12" y1="20" x2="12" y2="4" strokeWidth="4" />
    <line x1="6" y1="20" x2="6" y2="14" strokeWidth="5" />
  </svg>
);

export const ReportDoodle = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2V8H20" strokeWidth="1.5" />
  </svg>
);

export const StackDoodle = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fillOpacity="0.2" />
    <path d="M2 12L12 17L22 12" />
    <path d="M2 17L12 22L22 17" />
  </svg>
);

export const GridDoodle = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9H21" />
    <path d="M3 15H21" />
    <path d="M9 3V21" />
    <path d="M15 3V21" />
  </svg>
);

export const MessageDoodle = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M8 9H16" opacity="0.4" />
    <path d="M8 13H12" opacity="0.4" />
  </svg>
);

export const PeopleDoodle = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <circle cx="9" cy="7" r="4" />
    <path d="M17 11V7a3 3 0 0 0-3-3" />
    <path d="M2 21a8 8 0 0 1 13.29-6" />
    <path d="M18 21a8 8 0 0 0-3-6.32" />
  </svg>
);

export const LightbulbDoodle = ({ size = 24, color = "#F5A623" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#2C2A24" strokeWidth="2" strokeLinecap="round">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2C7.5 2 4 5.5 4 10c0 2.5 1.5 5 3.5 6.5C8.5 17.5 9 18.5 9 20h6c0-1.5.5-2.5 1.5-3.5 2-1.5 3.5-4 3.5-6.5 0-4.5-3.5-8-8-8z" fill={color} fillOpacity="0.2" />
  </svg>
);

// ─── 7. Background & Sticker Doodles ───

export const NotebookTexture = () => (
  <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[-1]" 
    style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 27px, #2C2A24 27px, #2C2A24 28px), repeating-linear-gradient(90deg, transparent, transparent 27px, #2C2A24 27px, #2C2A24 28px)` }}>
  </div>
);

export const ScatteredDoodles = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
    <KawaiiStar size={24} className="absolute top-[10%] left-[5%] rotate-12" />
    <KawaiiStar size={16} className="absolute top-[40%] right-[8%] -rotate-12" />
    <KawaiiHeart size={20} className="absolute bottom-[15%] left-[10%] rotate-45" />
    <KawaiiHeart size={14} className="absolute top-[25%] right-[20%] -rotate-12" />
    <KawaiiSparkle size={18} className="absolute top-[60%] left-[25%] animate-pulse" />
    <KawaiiSparkle size={12} className="absolute bottom-[30%] right-[5%]" />
    <KawaiiPencilMini size={24} className="absolute top-[5%] right-[30%] rotate-45" />
    <RulerPencilDoodle size={32} className="absolute bottom-[5%] right-[40%] -rotate-12" />
  </div>
);

export const StickerStar = ({ size = 32, color = "#F5A623" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className="drop-shadow-sm">
    <path d="M16 2L19.5 12H30L21.5 18L24.5 28L16 22L7.5 28L10.5 18L2 12H12.5L16 2Z" fill={color} stroke="#2C2A24" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="12" cy="14" r="1" fill="#2C2A24" />
    <circle cx="20" cy="14" r="1" fill="#2C2A24" />
    <path d="M14 17C15 18 17 18 18 17" stroke="#2C2A24" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

export const StickerApple = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M16 8C12 8 8 11 8 17C8 23 12 27 16 27C21 27 24 23 24 17C24 11 20 8 16 8Z" fill="#E8534A" stroke="#2C2A24" strokeWidth="1.5" />
    <path d="M16 8V4" stroke="#5BAD6F" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 5C18 3 22 3 22 5" stroke="#5BAD6F" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const KawaiiStar = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#F5A623" stroke="#2C2A24" strokeWidth="1.5" className={className}>
    <path d="M12 2l3 7h7l-5.5 4.5 2 7.5-6.5-5-6.5 5 2-7.5L2 9h7l3-7z" />
  </svg>
);

const KawaiiHeart = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#E8534A" stroke="#2C2A24" strokeWidth="1.5" className={className}>
    <path d="M12 21s-8.5-6.5-8.5-12a5 5 0 0 1 10 0 5 5 0 0 1 10 0c0 5.5-8.5 12-8.5 12z" />
  </svg>
);

const KawaiiSparkle = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#F5A623" className={className}>
    <path d="M12 1L13 11L23 12L13 13L12 23L11 13L1 12L11 11L12 1Z" />
  </svg>
);

const KawaiiPencilMini = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#2C2A24" strokeWidth="1.5" className={className}>
    <rect x="8" y="2" width="8" height="16" rx="1" fill="#F5A623" />
    <path d="M8 18L12 23L16 18" fill="#E8E4D9" />
  </svg>
);

export const RulerPencilDoodle = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="rotate-[-10deg]">
    {/* Ruler */}
    <rect x="4" y="20" width="40" height="8" rx="1" fill="#4A90D9" stroke="#2C2A24" strokeWidth="2" transform="rotate(20 24 24)" />
    <path d="M10 24l1 3M15 23l1 3M20 22l1 3M25 21l1 3M30 20l1 3" stroke="#2C2A24" strokeWidth="1" transform="rotate(20 24 24)" />
    {/* Pencil */}
    <path d="M10 38l28-28 4 4-28 28-6-2 2-2z" fill="#F5A623" stroke="#2C2A24" strokeWidth="2" />
    <path d="M10 38l-4 4 2-6 2 2z" fill="#2C2A24" />
    <path d="M34 14l4 4" stroke="#2C2A24" strokeWidth="2" />
  </svg>
);

export const PencilProgressBar = ({ progress, color }: { progress: number; color: string }) => (
  <div className="relative h-6 w-full mt-2 group">
    {/* Pencil body */}
    <div className="absolute inset-0 bg-border border-2 border-border-dark rounded-r-[12px] overflow-hidden">
      <div 
        className="h-full transition-all duration-1000 ease-out"
        style={{ width: `${progress}%`, backgroundColor: color }}
      >
        {/* Pencil lines/texture */}
        <div className="w-full h-full opacity-20" style={{ backgroundImage: 'linear-gradient(90deg, transparent 0%, transparent 80%, white 81%, white 100%)', backgroundSize: '20px 100%' }} />
      </div>
    </div>
    {/* Pencil lead/tip at the end of progress */}
    <div 
      className="absolute top-0 h-6 w-4 transition-all duration-1000 ease-out flex items-center justify-center translate-x-[-50%]"
      style={{ left: `${progress}%` }}
    >
      <svg width="16" height="24" viewBox="0 0 16 24">
        <path d="M0 0 L16 12 L0 24 Z" fill="#E8E4D9" stroke="#2C2A24" strokeWidth="2" />
        <path d="M10 8 L16 12 L10 16 Z" fill="#2C2A24" />
      </svg>
    </div>
  </div>
);


