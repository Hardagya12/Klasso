"use client";
import React from "react";

// ─── 1. Pencil SVG ───
export const PencilSVG = ({ size = 20, color = "#F5A623" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"
      fill={color} stroke="#2C2A24" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
      fill={color} stroke="#2C2A24" strokeWidth="1.5"/>
  </svg>
);

// ─── 2. Squiggly Underline SVG ───
export const SquigglySVG = ({ width = 100, color = "#F5A623" }: { width?: number; color?: string }) => (
  <svg width={width} height="10" viewBox={`0 0 ${width} 10`} fill="none">
    <path
      d={`M2 5C${width * 0.25} 1 ${width * 0.45} 9 ${width * 0.65} 5C${width * 0.85} 1 ${width} 5 ${width} 5`}
      stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
  </svg>
);

// ─── 3. Starburst SVG ───
export const StarburstSVG = ({ size = 48, color = "#F5A623" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M24 2L27 15L40 10L33 22L46 24L33 26L40 38L27 33L24 46L21 33L8 38L15 26L2 24L15 22L8 10L21 15L24 2Z"
      fill={color} stroke="#2C2A24" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

// ─── 4. Hand-drawn Circle Ring SVG ───
export const CircleRingSVG = ({ size = 48, color = "#4A90D9" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="absolute inset-0 z-0">
    <ellipse cx="24" cy="24" rx="22" ry="21" stroke={color} strokeWidth="2.5"
      strokeLinecap="round" strokeDasharray="5 2" transform="rotate(-5 24 24)"/>
    <ellipse cx="24.5" cy="23.5" rx="21" ry="22" stroke={color} strokeWidth="1"
      strokeLinecap="round" opacity="0.4" transform="rotate(2 24 24)"/>
  </svg>
);

// ─── 5. Pencil Progress Bar (defined BEFORE use) ───
export const PencilProgressBar = ({ progress, color }: { progress: number; color: string }) => (
  <div className="relative h-5 w-full mt-3">
    {/* Track */}
    <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-[#E8E4D9]">
      <div
        className="h-full transition-all duration-700 ease-out relative"
        style={{ width: `${progress}%`, backgroundColor: color }}
      >
        {/* Wood-grain texture */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 14px, white 14px, white 16px)",
          }}
        />
      </div>
    </div>
    {/* Pencil tip at progress end */}
    <div
      className="absolute top-0 h-5 w-3 -translate-x-full flex items-center pointer-events-none"
      style={{ left: `${progress}%` }}
    >
      <svg width="12" height="20" viewBox="0 0 12 20">
        <path d="M0 0 L12 10 L0 20 Z" fill="#E8E4D9" stroke="#2C2A24" strokeWidth="1.5"/>
        <path d="M8 6 L12 10 L8 14 Z" fill="#2C2A24"/>
      </svg>
    </div>
  </div>
);

// ─── 6. Stat Card ───
export const DashboardStatCard = ({
  label, value, icon: Icon, color, progress = 70,
}: {
  label: string; value: string; icon?: React.ComponentType<{size: number; color: string}>; color: string; progress?: number;
}) => (
  <div className="bg-white rounded-[16px] border-2 border-[#E8E4D9] p-5 relative flex flex-col justify-between h-40"
    style={{ boxShadow: "4px 4px 0px #2C2A24" }}>
    {Icon && (
      <div className="absolute top-4 right-4">
        <Icon size={28} color={color}/>
      </div>
    )}
    <p className="text-[#7A7670] font-semibold text-xs uppercase tracking-wider"
      style={{ fontFamily: '"Nunito", sans-serif' }}>{label}</p>
    <h3 className="text-3xl font-extrabold text-[#2C2A24]"
      style={{ fontFamily: '"Nunito", sans-serif' }}>{value}</h3>
    <PencilProgressBar progress={progress} color={color}/>
  </div>
);

// ─── 7. Navigation Doodle Icons ───
export const HouseDoodle = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10L12 3L21 10V20C21 21 20 22 19 22H5C4 22 3 21 3 20V10Z"/>
    <path d="M9 22V12H15V22"/>
    {/* Chimney */}
    <path d="M17 9V4h2v6" strokeWidth="2.5"/>
  </svg>
);

export const AttendanceDoodle = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M9 12L11 14L15 10" strokeWidth="2.5"/>
  </svg>
);

export const ChartDoodle = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="20" x2="5" y2="14"/>
    <line x1="10" y1="20" x2="10" y2="8"/>
    <line x1="15" y1="20" x2="15" y2="11"/>
    <line x1="20" y1="20" x2="20" y2="4"/>
    <line x1="3" y1="20" x2="22" y2="20"/>
  </svg>
);

export const ReportDoodle = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <path d="M14 2V8H20"/>
    <line x1="8" y1="13" x2="16" y2="13"/>
    <line x1="8" y1="17" x2="13" y2="17"/>
  </svg>
);

export const StackDoodle = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <path d="M12 2L2 7l10 5 10-5-10-5Z"/>
    <path d="M2 12l10 5 10-5"/>
    <path d="M2 17l10 5 10-5"/>
  </svg>
);

export const GridDoodle = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M3 9H21M3 15H21M9 3V21M15 3V21"/>
  </svg>
);

export const MessageDoodle = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    <path d="M8 9H16" opacity="0.5"/>
    <path d="M8 13H12" opacity="0.5"/>
  </svg>
);

export const PeopleDoodle = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <circle cx="9" cy="7" r="4"/>
    <path d="M17 11V7a3 3 0 0 0-3-3"/>
    <path d="M2 21a8 8 0 0 1 13.29-6"/>
    <path d="M18 21a8 8 0 0 0-3-6.32"/>
  </svg>
);

export const LightbulbDoodle = ({ size = 24, color = "#F5A623" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#2C2A24" strokeWidth="2" strokeLinecap="round">
    <path d="M9 18h6M10 22h4"/>
    <path d="M12 2C7.5 2 4 5.5 4 10c0 2.5 1.5 5 3.5 6.5C8.5 17.5 9 18.5 9 20h6c0-1.5.5-2.5 1.5-3.5C18.5 15 20 12.5 20 10c0-4.5-3.5-8-8-8z"
      fill={color} fillOpacity="0.25"/>
    <path d="M12 6v4M10 10h4" strokeOpacity="0.5"/>
  </svg>
);

// ─── 8. Background & Sticker Doodles ───
export const NotebookTexture = () => (
  <div className="fixed inset-0 pointer-events-none z-[-1]"
    style={{
      opacity: 0.03,
      backgroundImage:
        "repeating-linear-gradient(0deg, transparent, transparent 27px, #2C2A24 27px, #2C2A24 28px)",
    }}
  />
);

export const ScatteredDoodles = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ opacity: 0.18 }}>
    <BackgroundStar size={22} style={{ position: "absolute", top: "10%", left: "5%", transform: "rotate(12deg)" }}/>
    <BackgroundStar size={14} style={{ position: "absolute", top: "40%", right: "8%", transform: "rotate(-12deg)" }}/>
    <BackgroundHeart size={18} style={{ position: "absolute", bottom: "15%", left: "10%", transform: "rotate(45deg)" }}/>
    <BackgroundHeart size={13} style={{ position: "absolute", top: "25%", right: "20%", transform: "rotate(-12deg)" }}/>
    <BackgroundSparkle size={16} style={{ position: "absolute", top: "60%", left: "25%" }}/>
    <BackgroundSparkle size={11} style={{ position: "absolute", bottom: "30%", right: "5%" }}/>
    <BackgroundPencil size={22} style={{ position: "absolute", top: "5%", right: "30%", transform: "rotate(45deg)" }}/>
  </div>
);

const BackgroundStar = ({ size, style }: { size: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#F5A623" stroke="#2C2A24" strokeWidth="1.5" style={style}>
    <path d="M12 2l3 7h7l-5.5 4.5 2 7.5-6.5-5-6.5 5 2-7.5L2 9h7l3-7z"/>
  </svg>
);

const BackgroundHeart = ({ size, style }: { size: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#E8534A" stroke="#2C2A24" strokeWidth="1.5" style={style}>
    <path d="M12 21s-8.5-6.5-8.5-12a5 5 0 0 1 10 0 5 5 0 0 1 10 0c0 5.5-8.5 12-8.5 12z"/>
  </svg>
);

const BackgroundSparkle = ({ size, style }: { size: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#F5A623" style={style}>
    <path d="M12 1L13 11L23 12L13 13L12 23L11 13L1 12L11 11L12 1Z"/>
  </svg>
);

const BackgroundPencil = ({ size, style }: { size: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#2C2A24" strokeWidth="1.5" style={style}>
    <rect x="8" y="2" width="8" height="16" rx="1" fill="#F5A623"/>
    <path d="M8 18L12 23L16 18" fill="#E8E4D9"/>
  </svg>
);

export const StickerStar = ({ size = 32, color = "#F5A623" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M16 2L19.5 12H30L21.5 18L24.5 28L16 22L7.5 28L10.5 18L2 12H12.5L16 2Z"
      fill={color} stroke="#2C2A24" strokeWidth="1.5" strokeLinejoin="round"/>
    {/* Tiny face */}
    <circle cx="12" cy="14" r="1" fill="#2C2A24"/>
    <circle cx="20" cy="14" r="1" fill="#2C2A24"/>
    <path d="M14 17C15 18 17 18 18 17" stroke="#2C2A24" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

export const StickerApple = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M16 8C12 8 8 11 8 17C8 23 12 27 16 27C21 27 24 23 24 17C24 11 20 8 16 8Z"
      fill="#E8534A" stroke="#2C2A24" strokeWidth="1.5"/>
    <path d="M16 8V4" stroke="#5BAD6F" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 5C18 3 22 3 22 5" stroke="#5BAD6F" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Shine */}
    <path d="M11 13C12 11 14 10 15 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
  </svg>
);

export const RulerPencilDoodle = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    {/* Ruler */}
    <rect x="2" y="18" width="44" height="10" rx="2"
      fill="#4A90D9" fillOpacity="0.25" stroke="#2C2A24" strokeWidth="2"
      transform="rotate(20 24 24)"/>
    <g transform="rotate(20 24 24)" stroke="#2C2A24" strokeWidth="1.5" strokeLinecap="round">
      <line x1="10" y1="18" x2="10" y2="22"/>
      <line x1="16" y1="18" x2="16" y2="24"/>
      <line x1="22" y1="18" x2="22" y2="22"/>
      <line x1="28" y1="18" x2="28" y2="24"/>
      <line x1="34" y1="18" x2="34" y2="22"/>
    </g>
    {/* Pencil */}
    <rect x="8" y="6" width="8" height="30" rx="1"
      fill="#F5A623" stroke="#2C2A24" strokeWidth="2"
      transform="rotate(-25 24 24)"/>
    <path d="M5 36 L12 44 L19 36Z"
      fill="#E8E4D9" stroke="#2C2A24" strokeWidth="1.5"
      transform="rotate(-25 24 24)"/>
    <path d="M9 40 L12 44 L15 40Z"
      fill="#2C2A24"
      transform="rotate(-25 24 24)"/>
  </svg>
);
